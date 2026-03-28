"use client";

import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { PortfolioSnapshot } from "@/lib/types";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface PnlChartProps {
  snapshots: PortfolioSnapshot[];
}

const ranges = [
  { label: "7D", days: 7 },
  { label: "30D", days: 30 },
  { label: "90D", days: 90 },
];

export default function PnlChart({ snapshots }: PnlChartProps) {
  const [selectedRange, setSelectedRange] = useState(30);

  const now = new Date();
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() - selectedRange);

  const filtered = snapshots.filter(
    (s) => new Date(s.snapshot_date) >= cutoff
  );

  const data = filtered.map((s) => ({
    date: format(new Date(s.snapshot_date), "MMM d"),
    balance: s.total_balance,
    pnl: s.unrealized_pnl + s.realized_pnl,
  }));

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        {ranges.map((r) => (
          <button
            key={r.days}
            onClick={() => setSelectedRange(r.days)}
            className={cn(
              "px-3 py-1 rounded-md text-sm font-medium transition-colors",
              selectedRange === r.days
                ? "bg-accent text-white"
                : "text-muted hover:text-foreground hover:bg-card-hover"
            )}
          >
            {r.label}
          </button>
        ))}
      </div>
      {data.length === 0 ? (
        <div className="flex items-center justify-center h-[300px] text-muted">
          No snapshot data yet. Run price update to generate snapshots.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis
              dataKey="date"
              stroke="#94a3b8"
              fontSize={12}
              tickLine={false}
            />
            <YAxis
              stroke="#94a3b8"
              fontSize={12}
              tickLine={false}
              tickFormatter={(v) => `$${v}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#111827",
                border: "1px solid #1e293b",
                borderRadius: "8px",
                color: "#e2e8f0",
              }}
              formatter={(value) => [`$${Number(value).toFixed(2)}`, "Balance"]}
            />
            <Line
              type="monotone"
              dataKey="balance"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: "#3b82f6" }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
