"use client";

import { useState, useEffect, useCallback } from "react";
import { Download, ChevronLeft, ChevronRight } from "lucide-react";
import { PaperTrade } from "@/lib/types";
import { getAllTrades } from "@/lib/db";
import { formatCurrency, formatPrice, formatDateTime, cn } from "@/lib/utils";
import Card from "@/components/card";

const PAGE_SIZE = 20;

const statusColors: Record<string, string> = {
  open: "text-accent",
  won: "text-profit",
  lost: "text-loss",
  sold: "text-muted",
};

export default function HistoryPage() {
  const [trades, setTrades] = useState<PaperTrade[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const loadTrades = useCallback(async () => {
    setLoading(true);
    try {
      const { trades: data, count } = await getAllTrades(page, PAGE_SIZE, {
        status,
        search: search || undefined,
      });
      setTrades(data);
      setTotalCount(count);
    } catch (err) {
      console.error("Failed to load trades:", err);
    } finally {
      setLoading(false);
    }
  }, [page, status, search]);

  useEffect(() => {
    loadTrades();
  }, [loadTrades]);

  useEffect(() => {
    setPage(1);
  }, [status, search]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  function exportCsv() {
    const headers = [
      "Date",
      "Market",
      "Side",
      "Entry Price",
      "Exit Price",
      "Amount (USD)",
      "Shares",
      "P&L",
      "Status",
    ];
    const rows = trades.map((t) => [
      t.created_at,
      `"${t.market_title.replace(/"/g, '""')}"`,
      t.side,
      t.entry_price,
      t.exit_price ?? "",
      t.amount_usd,
      t.shares,
      t.pnl,
      t.status,
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `paper-trades-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Trade History</h1>
        <button
          onClick={exportCsv}
          className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg text-sm font-medium hover:bg-card-hover transition-colors"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      <div className="flex gap-3 mb-4">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-accent"
        >
          <option value="all">All Statuses</option>
          <option value="open">Open</option>
          <option value="won">Won</option>
          <option value="lost">Lost</option>
          <option value="sold">Sold</option>
        </select>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by market name..."
          className="bg-card border border-border rounded-lg px-4 py-2 text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:border-accent flex-1 max-w-xs"
        />
      </div>

      <Card className="p-0">
        {loading ? (
          <div className="text-center py-12 text-muted">Loading trades...</div>
        ) : trades.length === 0 ? (
          <div className="text-center py-12 text-muted">No trades found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted">
                  <th className="text-left py-3 px-4 font-medium">Date</th>
                  <th className="text-left py-3 px-4 font-medium">Market</th>
                  <th className="text-left py-3 px-4 font-medium">Side</th>
                  <th className="text-right py-3 px-4 font-medium">Entry</th>
                  <th className="text-right py-3 px-4 font-medium">Exit</th>
                  <th className="text-right py-3 px-4 font-medium">Amount</th>
                  <th className="text-right py-3 px-4 font-medium">P&L</th>
                  <th className="text-left py-3 px-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {trades.map((trade) => (
                  <tr
                    key={trade.id}
                    className="border-b border-border/50 hover:bg-card-hover transition-colors"
                  >
                    <td className="py-3 px-4 whitespace-nowrap">
                      {formatDateTime(trade.created_at)}
                    </td>
                    <td className="py-3 px-4 max-w-[250px] truncate">
                      {trade.market_title}
                    </td>
                    <td className="py-3 px-4">
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
                    <td className="py-3 px-4 text-right">
                      {formatPrice(trade.entry_price)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {trade.exit_price
                        ? formatPrice(trade.exit_price)
                        : "—"}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {formatCurrency(trade.amount_usd)}
                    </td>
                    <td
                      className={cn(
                        "py-3 px-4 text-right font-medium",
                        trade.pnl >= 0 ? "text-profit" : "text-loss"
                      )}
                    >
                      {trade.status === "open"
                        ? "—"
                        : formatCurrency(trade.pnl)}
                    </td>
                    <td
                      className={cn(
                        "py-3 px-4 capitalize",
                        statusColors[trade.status]
                      )}
                    >
                      {trade.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <p className="text-sm text-muted">
              Page {page} of {totalPages} ({totalCount} trades)
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg hover:bg-card-hover disabled:opacity-30 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-lg hover:bg-card-hover disabled:opacity-30 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
