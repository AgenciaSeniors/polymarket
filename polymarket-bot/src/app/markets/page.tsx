"use client";

import { useState, useEffect, useMemo } from "react";
import { Search, Calendar, BarChart3, Droplets } from "lucide-react";
import { GammaEvent, GammaMarket } from "@/lib/types";
import { fetchEvents } from "@/lib/polymarket-api";
import { formatPrice, formatDate, cn } from "@/lib/utils";
import { useTradeModal } from "@/lib/store";
import Card from "@/components/card";

export default function MarketsPage() {
  const [events, setEvents] = useState<GammaEvent[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const openTrade = useTradeModal((s) => s.open);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchEvents({ closed: false, limit: 50 });
        setEvents(data);
      } catch {
        setError("Failed to load markets");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const markets = useMemo(() => {
    const all: { event: GammaEvent; market: GammaMarket }[] = [];
    for (const event of events) {
      for (const market of event.markets) {
        if (!market.closed && market.active) {
          all.push({ event, market });
        }
      }
    }
    if (!search) return all;
    const q = search.toLowerCase();
    return all.filter(
      ({ event, market }) =>
        event.title.toLowerCase().includes(q) ||
        market.question.toLowerCase().includes(q)
    );
  }, [events, search]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Market Explorer</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search markets..."
            className="bg-card border border-border rounded-lg pl-10 pr-4 py-2 text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:border-accent w-64"
          />
        </div>
      </div>

      {loading && (
        <div className="text-center py-12 text-muted">Loading markets...</div>
      )}

      {error && (
        <div className="text-center py-12 text-loss">{error}</div>
      )}

      {!loading && !error && markets.length === 0 && (
        <div className="text-center py-12 text-muted">
          No markets found{search ? ` for "${search}"` : ""}.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {markets.map(({ event, market }) => {
          const yesPrice = market.outcomePrices?.[0];
          const noPrice = market.outcomePrices?.[1];

          return (
            <Card
              key={market.id}
              className="cursor-pointer hover:border-accent/50 transition-colors"
            >
              <div onClick={() => openTrade(market)}>
                <h3 className="font-semibold text-sm mb-3 line-clamp-2">
                  {market.question}
                </h3>

                <div className="flex gap-3 mb-3">
                  <div className="flex-1 bg-profit/10 rounded-lg p-2 text-center">
                    <p className="text-xs text-muted mb-0.5">YES</p>
                    <p className="text-lg font-bold text-profit">
                      {yesPrice ? formatPrice(yesPrice) : "—"}
                    </p>
                  </div>
                  <div className="flex-1 bg-loss/10 rounded-lg p-2 text-center">
                    <p className="text-xs text-muted mb-0.5">NO</p>
                    <p className="text-lg font-bold text-loss">
                      {noPrice ? formatPrice(noPrice) : "—"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-muted">
                  <span className="flex items-center gap-1">
                    <BarChart3 className="w-3 h-3" />$
                    {Number(
                      parseFloat(market.volume || "0") / 1000
                    ).toFixed(0)}
                    K vol
                  </span>
                  <span className="flex items-center gap-1">
                    <Droplets className="w-3 h-3" />$
                    {Number(
                      parseFloat(market.liquidity || "0") / 1000
                    ).toFixed(0)}
                    K liq
                  </span>
                  {market.endDate && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(market.endDate)}
                    </span>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
