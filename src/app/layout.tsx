import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { Toaster } from "@/components/ui/toaster";
import { headers } from 'next/headers';
import ContextProvider from '@/context';

export const metadata: Metadata = {
  title: "IOBIT - Advanced Crypto Trading Platform",
  description: "Trade cryptocurrencies with advanced tools and real-time data powered by Hyperliquid",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersObj = await headers();
  const cookies = headersObj.get('cookie');

  return (
    <html lang="en">
      <body className="antialiased">
        <ContextProvider cookies={cookies}>
          <Navbar />
          {children}
          <Toaster />
        </ContextProvider>
      </body>
    </html>
  );
}
