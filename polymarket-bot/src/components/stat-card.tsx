import { cn } from "@/lib/utils";
import Card from "./card";

interface StatCardProps {
  label: string;
  value: string;
  change?: string;
  positive?: boolean;
}

export default function StatCard({ label, value, change, positive }: StatCardProps) {
  return (
    <Card>
      <p className="text-sm text-muted mb-1">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
      {change && (
        <p
          className={cn(
            "text-sm mt-1 font-medium",
            positive === undefined ? "text-muted" : positive ? "text-profit" : "text-loss"
          )}
        >
          {change}
        </p>
      )}
    </Card>
  );
}
