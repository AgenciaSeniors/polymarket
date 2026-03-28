import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/nav";
import TradeModal from "@/components/trade-modal";

export const metadata: Metadata = {
  title: "Polymarket Paper Trading Bot",
  description: "Simulate trades on Polymarket prediction markets",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <Nav />
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
        <TradeModal />
      </body>
    </html>
  );
}
