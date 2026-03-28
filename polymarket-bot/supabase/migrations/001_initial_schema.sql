-- Paper trading portfolio config
CREATE TABLE paper_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  starting_balance NUMERIC DEFAULT 1000,
  current_balance NUMERIC DEFAULT 1000,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Individual trades
CREATE TABLE paper_trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  market_id TEXT NOT NULL,
  market_title TEXT NOT NULL,
  condition_id TEXT,
  token_id TEXT NOT NULL,
  side TEXT NOT NULL CHECK (side IN ('YES', 'NO')),
  entry_price NUMERIC NOT NULL,
  current_price NUMERIC,
  exit_price NUMERIC,
  amount_usd NUMERIC NOT NULL,
  shares NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'won', 'lost', 'sold')),
  pnl NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  closed_at TIMESTAMPTZ
);

-- Daily portfolio snapshots for P&L chart
CREATE TABLE portfolio_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  total_balance NUMERIC NOT NULL,
  unrealized_pnl NUMERIC DEFAULT 0,
  realized_pnl NUMERIC DEFAULT 0,
  open_positions INTEGER DEFAULT 0,
  snapshot_date DATE NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Seed default config
INSERT INTO paper_config (starting_balance, current_balance) VALUES (1000, 1000);
