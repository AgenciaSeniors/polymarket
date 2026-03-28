import { NextResponse } from "next/server";
import { fetchMidpoint, fetchMarketById } from "@/lib/polymarket-api";
import {
  getOpenTrades,
  updateTradePrice,
  closeTrade,
  getConfig,
  updateBalance,
  upsertSnapshot,
} from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const trades = await getOpenTrades();

    if (trades.length === 0) {
      return NextResponse.json({ message: "No open trades", updated: 0 });
    }

    let updatedCount = 0;
    let resolvedCount = 0;
    const config = await getConfig();
    let balance = config.current_balance;

    // Group trades by token_id to avoid duplicate fetches
    const tokenIds = [...new Set(trades.map((t) => t.token_id))];

    // Fetch all midpoints
    const midpoints: Record<string, number> = {};
    for (const tokenId of tokenIds) {
      try {
        const mid = await fetchMidpoint(tokenId);
        midpoints[tokenId] = parseFloat(mid.mid);
      } catch {
        // Skip if midpoint fetch fails
      }
    }

    // Update current prices
    for (const trade of trades) {
      const mid = midpoints[trade.token_id];
      if (mid !== undefined) {
        await updateTradePrice(trade.id, mid);
        updatedCount++;
      }
    }

    // Check for resolved markets
    const conditionIds = [
      ...new Set(trades.filter((t) => t.condition_id).map((t) => t.condition_id!)),
    ];

    for (const conditionId of conditionIds) {
      try {
        const markets = await fetchMarketById(conditionId);
        const market = markets[0];
        if (!market || !market.closed) continue;

        // Market has resolved
        const affectedTrades = trades.filter(
          (t) => t.condition_id === conditionId
        );

        for (const trade of affectedTrades) {
          const tokenIndex = market.clobTokenIds.indexOf(trade.token_id);
          const outcomePrice = parseFloat(
            market.outcomePrices?.[tokenIndex] ?? "0"
          );

          // If outcome price is 1 (or very close), the outcome won
          const won = outcomePrice > 0.5;
          const exitPrice = outcomePrice;
          const pnl = trade.shares * exitPrice - trade.amount_usd;
          const status = won ? "won" : "lost";

          await closeTrade(trade.id, exitPrice, status as "won" | "lost", pnl);
          balance += trade.amount_usd + pnl;
          resolvedCount++;
        }
      } catch {
        // Skip if market check fails
      }
    }

    // Update balance if any trades resolved
    if (resolvedCount > 0) {
      await updateBalance(balance);
    }

    // Calculate unrealized P&L for snapshot
    const updatedTrades = await getOpenTrades();
    const unrealizedPnl = updatedTrades.reduce((sum, t) => {
      const current = t.current_price ?? t.entry_price;
      return sum + (t.shares * current - t.amount_usd);
    }, 0);

    const realizedPnl = balance - config.starting_balance;

    // Upsert daily snapshot
    await upsertSnapshot({
      total_balance: balance + unrealizedPnl,
      unrealized_pnl: unrealizedPnl,
      realized_pnl: realizedPnl,
      open_positions: updatedTrades.length,
      snapshot_date: new Date().toISOString().split("T")[0],
    });

    return NextResponse.json({
      message: "Prices updated",
      updated: updatedCount,
      resolved: resolvedCount,
      balance,
      unrealizedPnl,
    });
  } catch (error) {
    console.error("Cron update error:", error);
    return NextResponse.json(
      { error: "Failed to update prices" },
      { status: 500 }
    );
  }
}
