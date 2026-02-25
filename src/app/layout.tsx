import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400"],
});
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
      <body className={`${spaceGrotesk.variable} font-sans overflow-auto bg-[#0f0f0f]`}>
        <a href="#main-content" className="sr-skip-link">Skip to content</a>
        <ContextProvider cookies={cookies}>
          <Navbar />
          <main id="main-content">{children}</main>
          <Toaster />
        </ContextProvider>
      </body>
    </html>
  );
}
