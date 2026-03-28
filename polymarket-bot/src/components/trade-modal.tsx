"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useTradeModal } from "@/lib/store";
import { fetchMidpoint } from "@/lib/polymarket-api";
import { getConfig, createTrade, updateBalance } from "@/lib/db";
import { formatCurrency, formatPrice, cn } from "@/lib/utils";

export default function TradeModal() {
  const { isOpen, market, close } = useTradeModal();
  const [side, setSide] = useState<"YES" | "NO">("YES");
  const [amount, setAmount] = useState("");
  const [balance, setBalance] = useState(0);
  const [yesPrice, setYesPrice] = useState<number | null>(null);
  const [noPrice, setNoPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen || !market) return;

    setSide("YES");
    setAmount("");
    setError("");

    async function loadData() {
      setLoading(true);
      try {
        const config = await getConfig();
        setBalance(config.current_balance);

        const tokenIds = market!.clobTokenIds;
        if (tokenIds && tokenIds.length >= 2) {
          const [yesMid, noMid] = await Promise.all([
            fetchMidpoint(tokenIds[0]),
            fetchMidpoint(tokenIds[1]),
          ]);
          setYesPrice(parseFloat(yesMid.mid));
          setNoPrice(parseFloat(noMid.mid));
        } else {
          const prices = market!.outcomePrices;
          setYesPrice(parseFloat(prices[0]));
          setNoPrice(parseFloat(prices[1]));
        }
      } catch {
        setError("Failed to load price data");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [isOpen, market]);

  if (!isOpen || !market) return null;

  const price = side === "YES" ? yesPrice : noPrice;
  const tokenId =
    side === "YES" ? market.clobTokenIds?.[0] : market.clobTokenIds?.[1];
  const amountNum = parseFloat(amount) || 0;
  const shares = price && price > 0 ? amountNum / price : 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!price || !tokenId) return;

    if (amountNum <= 0) {
      setError("Enter a valid amount");
      return;
    }
    if (amountNum > balance) {
      setError("Insufficient balance");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await createTrade({
        market_id: market!.id,
        market_title: market!.question,
        condition_id: market!.conditionId || null,
        token_id: tokenId,
        side,
        entry_price: price,
        amount_usd: amountNum,
        shares,
      });

      await updateBalance(balance - amountNum);
      close();
    } catch {
      setError("Failed to place trade");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={close} />
      <div className="relative bg-card border border-border rounded-2xl w-full max-w-md p-6 mx-4">
        <button
          onClick={close}
          className="absolute top-4 right-4 text-muted hover:text-foreground"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-lg font-bold mb-1">Paper Trade</h2>
        <p className="text-sm text-muted mb-4 line-clamp-2">
          {market.question}
        </p>

        {loading ? (
          <div className="py-8 text-center text-muted">Loading prices...</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-2">
              {(["YES", "NO"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSide(s)}
                  className={cn(
                    "flex-1 py-3 rounded-lg font-bold text-sm transition-colors",
                    side === s
                      ? s === "YES"
                        ? "bg-profit/20 text-profit border border-profit/40"
                        : "bg-loss/20 text-loss border border-loss/40"
                      : "bg-card-hover text-muted border border-border"
                  )}
                >
                  {s} — {s === "YES" && yesPrice ? formatPrice(yesPrice) : ""}
                  {s === "NO" && noPrice ? formatPrice(noPrice) : ""}
                </button>
              ))}
            </div>

            <div>
              <label className="block text-sm text-muted mb-1">
                Amount (USD)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-background border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted/50 focus:outline-none focus:border-accent"
              />
              <p className="text-xs text-muted mt-1">
                Balance: {formatCurrency(balance)}
              </p>
            </div>

            {amountNum > 0 && price && (
              <div className="bg-background rounded-lg p-3 text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted">Price</span>
                  <span>{formatPrice(price)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Shares</span>
                  <span>{shares.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Total Cost</span>
                  <span>{formatCurrency(amountNum)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Potential Payout</span>
                  <span className="text-profit">
                    {formatCurrency(shares)}
                  </span>
                </div>
              </div>
            )}

            {error && (
              <p className="text-sm text-loss">{error}</p>
            )}

            <button
              type="submit"
              disabled={submitting || amountNum <= 0}
              className={cn(
                "w-full py-3 rounded-lg font-bold text-sm transition-colors",
                side === "YES"
                  ? "bg-profit hover:bg-profit/80 text-white"
                  : "bg-loss hover:bg-loss/80 text-white",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {submitting
                ? "Placing Trade..."
                : `Buy ${side} — ${formatCurrency(amountNum)}`}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
