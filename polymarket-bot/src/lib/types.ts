export interface GammaMarket {
  id: string;
  question: string;
  conditionId: string;
  questionID: string;
  slug: string;
  outcomes: string[];
  outcomePrices: string[];
  clobTokenIds: string[];
  volume: string;
  liquidity: string;
  endDate: string;
  closed: boolean;
  active: boolean;
  lastTradePrice: string;
  bestBid: string;
  bestAsk: string;
  image?: string;
  icon?: string;
  description?: string;
  groupItemTitle?: string;
}

export interface GammaEvent {
  id: string;
  title: string;
  slug: string;
  description: string;
  endDate: string;
  volume: number;
  liquidity: number;
  closed: boolean;
  active: boolean;
  markets: GammaMarket[];
  image?: string;
  icon?: string;
}

export interface PaperConfig {
  id: string;
  starting_balance: number;
  current_balance: number;
  created_at: string;
}

export interface PaperTrade {
  id: string;
  market_id: string;
  market_title: string;
  condition_id: string | null;
  token_id: string;
  side: "YES" | "NO";
  entry_price: number;
  current_price: number | null;
  exit_price: number | null;
  amount_usd: number;
  shares: number;
  status: "open" | "won" | "lost" | "sold";
  pnl: number;
  created_at: string;
  closed_at: string | null;
}

export interface PortfolioSnapshot {
  id: string;
  total_balance: number;
  unrealized_pnl: number;
  realized_pnl: number;
  open_positions: number;
  snapshot_date: string;
  created_at: string;
}

export interface ClobMidpoint {
  mid: string;
}

export interface ClobPrice {
  price: string;
}
