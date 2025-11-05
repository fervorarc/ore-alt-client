'use client';

import { useEffect, useState, useCallback } from 'react';
import { connection, getCurrentSlot } from '@/lib/solana';
import { fetchBoard, fetchRound, getBoardPDA, getRoundPDA } from '@/lib/accounts';
import type { Board, Round } from '@/lib/types';

export function useRoundData() {
  const [board, setBoard] = useState<Board | null>(null);
  const [round, setRound] = useState<Round | null>(null);
  const [currentSlot, setCurrentSlot] = useState<bigint>(0n);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Fetch Board data (called initially and when Board account changes)
  const fetchBoardData = useCallback(async () => {
    try {
      const boardData = await fetchBoard(connection);
      setBoard(boardData);
      return boardData;
    } catch (err) {
      console.error('Error fetching board:', err);
      throw err;
    }
  }, []);

  // Fetch Round data (called initially and when Round account changes)
  const fetchRoundData = useCallback(async (roundId: bigint) => {
    try {
      const roundData = await fetchRound(connection, roundId);
      setRound(roundData);
      setLastUpdate(new Date());
      return roundData;
    } catch (err) {
      console.error('Error fetching round:', err);
      throw err;
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch initial data
        const boardData = await fetchBoardData();
        await fetchRoundData(boardData.roundId);

        // Get current slot
        const slot = await getCurrentSlot();
        setCurrentSlot(BigInt(slot));

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [fetchBoardData, fetchRoundData]);

  // WebSocket subscription to Board account
  useEffect(() => {
    if (!board) return;

    const boardPDA = getBoardPDA();
    console.log('📡 Subscribing to Board account:', boardPDA.toString());

    const subscriptionId = connection.onAccountChange(
      boardPDA,
      async (accountInfo) => {
        console.log('🔔 Board account changed!');

        try {
          // Parse the new board data
          const data = accountInfo.data;
          let offset = 8; // Skip discriminator

          const roundId = data.readBigUInt64LE(offset);
          offset += 8;
          const startSlot = data.readBigUInt64LE(offset);
          offset += 8;
          const endSlot = data.readBigUInt64LE(offset);

          const newBoard: Board = { roundId, startSlot, endSlot };
          setBoard(newBoard);

          // If round changed, fetch new round data
          if (newBoard.roundId !== board.roundId) {
            console.log('🔄 Round changed! Fetching new round data...');
            await fetchRoundData(newBoard.roundId);
          }
        } catch (err) {
          console.error('Error parsing Board update:', err);
        }
      },
      'confirmed'
    );

    return () => {
      console.log('🔌 Unsubscribing from Board account');
      connection.removeAccountChangeListener(subscriptionId);
    };
  }, [board, fetchRoundData]);

  // WebSocket subscription to Round account
  useEffect(() => {
    if (!board) return;

    const roundPDA = getRoundPDA(board.roundId);
    console.log('📡 Subscribing to Round account:', roundPDA.toString());

    const subscriptionId = connection.onAccountChange(
      roundPDA,
      async (accountInfo) => {
        console.log('🔔 Round account changed!');

        try {
          // Parse the new round data
          const data = accountInfo.data;
          let offset = 8; // Skip discriminator

          // Parse all fields (same as in accounts.ts)
          const id = data.readBigUInt64LE(offset);
          offset += 8;

          const deployed: bigint[] = [];
          for (let i = 0; i < 25; i++) {
            deployed.push(data.readBigUInt64LE(offset));
            offset += 8;
          }

          const slotHash = data.subarray(offset, offset + 32);
          offset += 32;

          const count: bigint[] = [];
          for (let i = 0; i < 25; i++) {
            count.push(data.readBigUInt64LE(offset));
            offset += 8;
          }

          const expiresAt = data.readBigUInt64LE(offset);
          offset += 8;
          const motherlode = data.readBigUInt64LE(offset);
          offset += 8;

          const rentPayerBytes = data.subarray(offset, offset + 32);
          const rentPayer = Buffer.from(rentPayerBytes).toString('hex');
          offset += 32;

          const topMinerBytes = data.subarray(offset, offset + 32);
          const topMiner = Buffer.from(topMinerBytes).toString('hex');
          offset += 32;

          const topMinerReward = data.readBigUInt64LE(offset);
          offset += 8;
          const totalDeployed = data.readBigUInt64LE(offset);
          offset += 8;
          const totalVaulted = data.readBigUInt64LE(offset);
          offset += 8;
          const totalWinnings = data.readBigUInt64LE(offset);

          const newRound: Round = {
            id,
            deployed,
            slotHash,
            count,
            expiresAt,
            motherlode,
            rentPayer,
            topMiner,
            topMinerReward,
            totalDeployed,
            totalVaulted,
            totalWinnings,
          };

          setRound(newRound);
          setLastUpdate(new Date());
        } catch (err) {
          console.error('Error parsing Round update:', err);
        }
      },
      'confirmed'
    );

    return () => {
      console.log('🔌 Unsubscribing from Round account');
      connection.removeAccountChangeListener(subscriptionId);
    };
  }, [board]);

  // Update current slot every second
  useEffect(() => {
    const updateSlot = async () => {
      try {
        const slot = await getCurrentSlot();
        setCurrentSlot(BigInt(slot));
      } catch (err) {
        console.error('Error fetching slot:', err);
      }
    };

    // Update immediately
    updateSlot();

    // Then update every second
    const interval = setInterval(updateSlot, 1000);

    return () => clearInterval(interval);
  }, []);

  return {
    board,
    round,
    currentSlot,
    loading,
    error,
    lastUpdate,
  };
}
