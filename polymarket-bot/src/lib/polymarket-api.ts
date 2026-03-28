import { GammaEvent, GammaMarket, ClobMidpoint, ClobPrice } from "./types";

const GAMMA_BASE = "https://gamma-api.polymarket.com";
const CLOB_BASE = "https://clob.polymarket.com";

export async function fetchEvents(params?: {
  closed?: boolean;
  limit?: number;
  offset?: number;
}): Promise<GammaEvent[]> {
  const searchParams = new URLSearchParams();
  if (params?.closed !== undefined)
    searchParams.set("closed", String(params.closed));
  if (params?.limit) searchParams.set("limit", String(params.limit));
  if (params?.offset) searchParams.set("offset", String(params.offset));

  const res = await fetch(`${GAMMA_BASE}/events?${searchParams.toString()}`);
  if (!res.ok) throw new Error(`Gamma events error: ${res.status}`);
  return res.json();
}

export async function fetchMarkets(params?: {
  closed?: boolean;
  limit?: number;
  offset?: number;
}): Promise<GammaMarket[]> {
  const searchParams = new URLSearchParams();
  if (params?.closed !== undefined)
    searchParams.set("closed", String(params.closed));
  if (params?.limit) searchParams.set("limit", String(params.limit));
  if (params?.offset) searchParams.set("offset", String(params.offset));

  const res = await fetch(`${GAMMA_BASE}/markets?${searchParams.toString()}`);
  if (!res.ok) throw new Error(`Gamma markets error: ${res.status}`);
  return res.json();
}

export async function fetchMarketById(
  conditionId: string
): Promise<GammaMarket[]> {
  const res = await fetch(
    `${GAMMA_BASE}/markets?condition_id=${conditionId}`
  );
  if (!res.ok) throw new Error(`Gamma market error: ${res.status}`);
  return res.json();
}

export async function fetchMidpoint(tokenId: string): Promise<ClobMidpoint> {
  const res = await fetch(`${CLOB_BASE}/midpoint?token_id=${tokenId}`);
  if (!res.ok) throw new Error(`CLOB midpoint error: ${res.status}`);
  return res.json();
}

export async function fetchPrice(
  tokenId: string,
  side: "BUY" | "SELL" = "BUY"
): Promise<ClobPrice> {
  const res = await fetch(
    `${CLOB_BASE}/price?token_id=${tokenId}&side=${side}`
  );
  if (!res.ok) throw new Error(`CLOB price error: ${res.status}`);
  return res.json();
}
