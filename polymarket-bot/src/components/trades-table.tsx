"use client";

import { PaperTrade } from "@/lib/types";
import { formatCurrency, formatPrice, formatDateTime } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface TradesTableProps {
  trades: PaperTrade[];
}

const statusColors: Record<string, string> = {
  open: "text-accent",
  won: "text-profit",
  lost: "text-loss",
  sold: "text-muted",
};

export default function TradesTable({ trades }: TradesTableProps) {
  if (trades.length === 0) {
    return (
      <div className="text-center py-8 text-muted">No trades yet.</div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-muted">
            <th className="text-left py-3 px-2 font-medium">Date</th>
            <th className="text-left py-3 px-2 font-medium">Market</th>
            <th className="text-left py-3 px-2 font-medium">Side</th>
            <th className="text-right py-3 px-2 font-medium">Entry</th>
            <th className="text-right py-3 px-2 font-medium">Exit</th>
            <th className="text-right py-3 px-2 font-medium">P&L</th>
            <th className="text-left py-3 px-2 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {trades.map((trade) => (
            <tr
              key={trade.id}
              className="border-b border-border/50 hover:bg-card-hover transition-colors"
            >
              <td className="py-3 px-2 whitespace-nowrap">
                {formatDateTime(trade.created_at)}
              </td>
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
                {trade.exit_price ? formatPrice(trade.exit_price) : "—"}
              </td>
              <td
                className={cn(
                  "py-3 px-2 text-right font-medium",
                  trade.pnl >= 0 ? "text-profit" : "text-loss"
                )}
              >
                {trade.status === "open" ? "—" : formatCurrency(trade.pnl)}
              </td>
              <td className={cn("py-3 px-2 capitalize", statusColors[trade.status])}>
                {trade.status}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
