'use client';

import { useEffect, useState } from 'react';
import { connection, getCurrentSlot } from '@/lib/solana';
import { fetchBoard, fetchRound } from '@/lib/accounts';
import type { Board, Round } from '@/lib/types';
import { Grid } from '@/components/Grid';
import { Motherlode } from '@/components/Motherlode';
import { Timer } from '@/components/Timer';
import { Stats } from '@/components/Stats';

export default function Home() {
  const [board, setBoard] = useState<Board | null>(null);
  const [round, setRound] = useState<Round | null>(null);
  const [currentSlot, setCurrentSlot] = useState<bigint>(0n);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch Board account
        const boardData = await fetchBoard(connection);
        setBoard(boardData);

        // Fetch current Round account
        const roundData = await fetchRound(connection, boardData.roundId);
        setRound(roundData);

        // Get current slot
        const slot = await getCurrentSlot();
        setCurrentSlot(BigInt(slot));
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-900 text-white p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-xl">Loading ORE data from blockchain...</p>
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
          <div className="inline-block mt-2 px-4 py-1 bg-green-900/30 border border-green-500 rounded-full text-sm text-green-400">
            ✅ Live from Solana Mainnet
          </div>
        </div>

        {/* Top Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Motherlode amount={round.motherlode} />
          <Timer endSlot={board.endSlot} currentSlot={currentSlot} />
        </div>

        {/* Mining Grid */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 mb-8 border border-gray-700">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <span>⛏️</span>
            Mining Grid
          </h2>
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
        <div className="text-center text-gray-500 text-sm">
          <p>Slots: {board.startSlot.toString()} → {board.endSlot.toString()}</p>
          <p className="mt-1">
            Built with ❤️ using Solana Web3.js
          </p>
        </div>
      </div>
    </main>
  );
}
