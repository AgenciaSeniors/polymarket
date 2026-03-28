import { supabase } from "./supabase";
import { PaperConfig, PaperTrade, PortfolioSnapshot } from "./types";

export async function getConfig(): Promise<PaperConfig> {
  const { data, error } = await supabase
    .from("paper_config")
    .select("*")
    .limit(1)
    .single();
  if (error) throw error;
  return data;
}

export async function updateBalance(newBalance: number): Promise<void> {
  const config = await getConfig();
  const { error } = await supabase
    .from("paper_config")
    .update({ current_balance: newBalance })
    .eq("id", config.id);
  if (error) throw error;
}

export async function createTrade(
  trade: Omit<PaperTrade, "id" | "created_at" | "closed_at" | "pnl" | "current_price" | "exit_price" | "status">
): Promise<PaperTrade> {
  const { data, error } = await supabase
    .from("paper_trades")
    .insert({
      ...trade,
      current_price: trade.entry_price,
      status: "open",
      pnl: 0,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getOpenTrades(): Promise<PaperTrade[]> {
  const { data, error } = await supabase
    .from("paper_trades")
    .select("*")
    .eq("status", "open")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function getRecentTrades(limit = 20): Promise<PaperTrade[]> {
  const { data, error } = await supabase
    .from("paper_trades")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data || [];
}

export async function getAllTrades(
  page: number,
  pageSize: number,
  filters?: { status?: string; search?: string }
): Promise<{ trades: PaperTrade[]; count: number }> {
  let query = supabase
    .from("paper_trades")
    .select("*", { count: "exact" });

  if (filters?.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }
  if (filters?.search) {
    query = query.ilike("market_title", `%${filters.search}%`);
  }

  const { data, error, count } = await query
    .order("created_at", { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

  if (error) throw error;
  return { trades: data || [], count: count || 0 };
}

export async function updateTradePrice(
  id: string,
  currentPrice: number
): Promise<void> {
  const { error } = await supabase
    .from("paper_trades")
    .update({ current_price: currentPrice })
    .eq("id", id);
  if (error) throw error;
}

export async function closeTrade(
  id: string,
  exitPrice: number,
  status: "won" | "lost",
  pnl: number
): Promise<void> {
  const { error } = await supabase
    .from("paper_trades")
    .update({
      exit_price: exitPrice,
      status,
      pnl,
      closed_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) throw error;
}

export async function getSnapshots(days = 30): Promise<PortfolioSnapshot[]> {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const { data, error } = await supabase
    .from("portfolio_snapshots")
    .select("*")
    .gte("snapshot_date", since.toISOString().split("T")[0])
    .order("snapshot_date", { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function upsertSnapshot(snapshot: {
  total_balance: number;
  unrealized_pnl: number;
  realized_pnl: number;
  open_positions: number;
  snapshot_date: string;
}): Promise<void> {
  const { error } = await supabase
    .from("portfolio_snapshots")
    .upsert(snapshot, { onConflict: "snapshot_date" });
  if (error) throw error;
}
