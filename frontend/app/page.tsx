'use client';

import { Grid } from '@/components/Grid';
import { Motherlode } from '@/components/Motherlode';
import { Timer } from '@/components/Timer';
import { Stats } from '@/components/Stats';
import { useRoundData } from '@/hooks/useRoundData';

export default function Home() {
  const { board, round, currentSlot, loading, error, lastUpdate } = useRoundData();

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-900 text-white p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-xl">Loading ORE data from blockchain...</p>
          <p className="text-sm text-gray-400 mt-2">Connecting to Solana mainnet via WebSocket...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8 text-red-500">
            Error
          </h1>
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-6">
            <p className="text-red-300">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (!board || !round) {
    return (
      <main className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8">
            No data available
          </h1>
        </div>
      </main>
    );
  }

  // Format last update time
  const formatUpdateTime = (date: Date) => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diff < 5) return 'just now';
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return date.toLocaleTimeString();
  };

  return (
    <main className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            ORE Mining Dashboard
          </h1>
          <p className="text-gray-400">
            Round <span className="font-bold text-white">#{board.roundId.toString()}</span>
          </p>

          {/* Live indicator */}
          <div className="flex items-center justify-center gap-3 mt-3">
            <div className="inline-flex items-center gap-2 px-4 py-1 bg-green-900/30 border border-green-500 rounded-full text-sm text-green-400">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              Live via WebSocket
            </div>
            <div className="text-xs text-gray-500">
              Updated {formatUpdateTime(lastUpdate)}
            </div>
          </div>
        </div>

        {/* Top Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Motherlode amount={round.motherlode} />
          <Timer endSlot={board.endSlot} currentSlot={currentSlot} />
        </div>

        {/* Mining Grid */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 mb-8 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <span>⛏️</span>
              Mining Grid
            </h2>
            <div className="text-xs text-gray-500 font-mono">
              Real-time updates
            </div>
          </div>
          <Grid deployed={round.deployed} count={round.count} />
        </div>

        {/* Additional Stats */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <span>📈</span>
            Round Statistics
          </h2>
          <Stats round={round} />
        </div>

        {/* Footer Info */}
        <div className="text-center text-gray-500 text-sm space-y-1">
          <p>Slots: {board.startSlot.toString()} → {board.endSlot.toString()}</p>
          <p>Current Slot: {currentSlot.toString()}</p>
          <p className="mt-2">
            Built with ❤️ using Solana Web3.js WebSockets
          </p>
        </div>
      </div>
    </main>
  );
}
