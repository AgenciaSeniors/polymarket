import { create } from "zustand";
import { GammaMarket } from "./types";

interface TradeModalStore {
  isOpen: boolean;
  market: GammaMarket | null;
  open: (market: GammaMarket) => void;
  close: () => void;
}

export const useTradeModal = create<TradeModalStore>((set) => ({
  isOpen: false,
  market: null,
  open: (market) => set({ isOpen: true, market }),
  close: () => set({ isOpen: false, market: null }),
}));
