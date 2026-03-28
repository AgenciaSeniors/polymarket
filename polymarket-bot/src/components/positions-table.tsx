"use client";

import { PaperTrade } from "@/lib/types";
import { formatCurrency, formatPrice } from "@/lib/utils";

interface PositionsTableProps {
  trades: PaperTrade[];
}

export default function PositionsTable({ trades }: PositionsTableProps) {
  if (trades.length === 0) {
    return (
      <div className="text-center py-8 text-muted">
        No open positions. Go to Markets to place your first trade.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-muted">
            <th className="text-left py-3 px-2 font-medium">Market</th>
            <th className="text-left py-3 px-2 font-medium">Side</th>
            <th className="text-right py-3 px-2 font-medium">Entry</th>
            <th className="text-right py-3 px-2 font-medium">Current</th>
            <th className="text-right py-3 px-2 font-medium">Shares</th>
            <th className="text-right py-3 px-2 font-medium">Cost</th>
            <th className="text-right py-3 px-2 font-medium">Unrealized P&L</th>
          </tr>
        </thead>
        <tbody>
          {trades.map((trade) => {
            const currentPrice = trade.current_price ?? trade.entry_price;
            const unrealizedPnl =
              trade.shares * currentPrice - trade.amount_usd;
            const pnlPositive = unrealizedPnl >= 0;

            return (
              <tr
                key={trade.id}
                className="border-b border-border/50 hover:bg-card-hover transition-colors"
              >
                <td className="py-3 px-2 max-w-[200px] truncate">
                  {trade.market_title}
                </td>
                <td className="py-3 px-2">
                  <span
                    className={
                      trade.side === "YES"
                        ? "text-profit font-medium"
                        : "text-loss font-medium"
                    }
                  >
                    {trade.side}
                  </span>
                </td>
                <td className="py-3 px-2 text-right">
                  {formatPrice(trade.entry_price)}
                </td>
                <td className="py-3 px-2 text-right">
                  {formatPrice(currentPrice)}
                </td>
                <td className="py-3 px-2 text-right">
                  {trade.shares.toFixed(2)}
                </td>
                <td className="py-3 px-2 text-right">
                  {formatCurrency(trade.amount_usd)}
                </td>
                <td
                  className={`py-3 px-2 text-right font-medium ${
                    pnlPositive ? "text-profit" : "text-loss"
                  }`}
                >
                  {formatCurrency(unrealizedPnl)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
