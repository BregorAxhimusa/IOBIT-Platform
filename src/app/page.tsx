import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
          IOBIT
        </h1>
        <p className="text-xl text-gray-400 mb-8">
          Advanced Crypto Trading Platform
        </p>
        <p className="text-sm text-gray-500 mb-12">
          Powered by Hyperliquid
        </p>

        <Link
          href="/trade/BTC"
          className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          Start Trading →
        </Link>
      </div>
    </div>
  );
}
