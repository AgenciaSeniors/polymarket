"use client";

import { useState, useEffect, useCallback } from "react";
import { RefreshCw } from "lucide-react";
import { PaperTrade, PaperConfig, PortfolioSnapshot } from "@/lib/types";
import { getConfig, getOpenTrades, getRecentTrades, getSnapshots } from "@/lib/db";
import { formatCurrency, formatPercent, cn } from "@/lib/utils";
import StatCard from "@/components/stat-card";
import Card from "@/components/card";
import PositionsTable from "@/components/positions-table";
import TradesTable from "@/components/trades-table";
import PnlChart from "@/components/pnl-chart";

export default function DashboardPage() {
  const [config, setConfig] = useState<PaperConfig | null>(null);
  const [openPositions, setOpenPositions] = useState<PaperTrade[]>([]);
  const [recentTrades, setRecentTrades] = useState<PaperTrade[]>([]);
  const [snapshots, setSnapshots] = useState<PortfolioSnapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [cfg, open, recent, snaps] = await Promise.all([
        getConfig(),
        getOpenTrades(),
        getRecentTrades(20),
        getSnapshots(90),
      ]);
      setConfig(cfg);
      setOpenPositions(open);
      setRecentTrades(recent);
      setSnapshots(snaps);
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleUpdatePrices() {
    setUpdating(true);
    try {
      await fetch("/api/cron/update-prices");
      await loadData();
    } catch (err) {
      console.error("Failed to update prices:", err);
    } finally {
      setUpdating(false);
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12 text-muted">Loading dashboard...</div>
    );
  }

  const balance = config?.current_balance ?? 1000;
  const startingBalance = config?.starting_balance ?? 1000;

  const unrealizedPnl = openPositions.reduce((sum, t) => {
    const current = t.current_price ?? t.entry_price;
    return sum + (t.shares * current - t.amount_usd);
  }, 0);

  const totalPnl = balance + unrealizedPnl - startingBalance;
  const totalPnlPct = startingBalance > 0 ? totalPnl / startingBalance : 0;

  const closedTrades = recentTrades.filter((t) => t.status !== "open");
  const wonTrades = closedTrades.filter((t) => t.status === "won");
  const winRate =
    closedTrades.length > 0 ? wonTrades.length / closedTrades.length : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <button
          onClick={handleUpdatePrices}
          disabled={updating}
          className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
        >
          <RefreshCw className={cn("w-4 h-4", updating && "animate-spin")} />
          {updating ? "Updating..." : "Update Prices"}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Balance" value={formatCurrency(balance)} />
        <StatCard
          label="Total P&L"
          value={formatCurrency(totalPnl)}
          change={formatPercent(totalPnlPct)}
          positive={totalPnl >= 0}
        />
        <StatCard
          label="Unrealized P&L"
          value={formatCurrency(unrealizedPnl)}
          positive={unrealizedPnl >= 0}
        />
        <StatCard
          label="Win Rate"
          value={closedTrades.length > 0 ? formatPercent(winRate) : "N/A"}
          change={`${closedTrades.length} closed trades`}
        />
      </div>

      <Card>
        <h2 className="text-lg font-semibold mb-4">Portfolio Value</h2>
        <PnlChart snapshots={snapshots} />
      </Card>

      <Card>
        <h2 className="text-lg font-semibold mb-4">
          Open Positions ({openPositions.length})
        </h2>
        <PositionsTable trades={openPositions} />
      </Card>

      <Card>
        <h2 className="text-lg font-semibold mb-4">Recent Trades</h2>
        <TradesTable trades={recentTrades} />
      </Card>
    </div>
  );
}
