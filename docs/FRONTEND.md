# ORE Frontend Documentation

Complete guide for the ORE mining dashboard web application built with Next.js.

## Table of Contents

- [Overview](#overview)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Setup and Installation](#setup-and-installation)
- [Development](#development)
- [Architecture](#architecture)
- [Components](#components)
- [Hooks](#hooks)
- [Solana Integration](#solana-integration)
- [Styling](#styling)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

## Overview

The ORE frontend is a Next.js web application that provides a visual interface for interacting with the ORE mining protocol. It features:

- Real-time mining board visualization
- Miner statistics dashboard
- Staking interface
- Wallet integration
- WebSocket subscriptions for live updates

**Live URL**: TBD
**Framework**: Next.js 16 (App Router)
**Language**: TypeScript

## Technology Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 16.0.1 | React framework |
| **React** | 19.2.0 | UI library |
| **TypeScript** | 5.9.3 | Type safety |
| **Tailwind CSS** | 4.1.16 | Styling |
| **Solana Web3.js** | 1.98.4 | Blockchain interaction |
| **Wallet Adapter** | Latest | Wallet integration |
| **Borsh** | 0.32.1 | Data serialization |

## Project Structure

```
frontend/
├── app/                      # Next.js App Router pages
│   ├── page.tsx              # Main dashboard page
│   ├── layout.tsx            # Root layout with providers
│   ├── globals.css           # Global styles
│   └── providers.tsx         # Context providers
├── components/               # React components
│   ├── BoardGrid.tsx         # 5x5 mining board grid
│   ├── MinerStats.tsx        # Miner statistics panel
│   ├── StakingPanel.tsx      # Staking interface
│   ├── WalletButton.tsx      # Wallet connect button
│   ├── RoundInfo.tsx         # Current round information
│   └── ClaimRewards.tsx      # Reward claiming interface
├── hooks/                    # Custom React hooks
│   ├── useBoard.ts           # Board state hook
│   ├── useMiner.ts           # Miner state hook
│   ├── useStake.ts           # Stake state hook
│   ├── useRound.ts           # Round state hook
│   └── useTransaction.ts     # Transaction helper hook
├── lib/                      # Utility libraries
│   ├── ore.ts                # ORE program interaction
│   ├── solana.ts             # Solana connection
│   ├── constants.ts          # Constants and addresses
│   └── utils.ts              # Helper functions
├── public/                   # Static assets
│   └── images/
├── .eslintrc.json           # ESLint configuration
├── next.config.js           # Next.js configuration
├── package.json             # Dependencies
├── postcss.config.js        # PostCSS configuration
├── tailwind.config.ts       # Tailwind configuration
└── tsconfig.json            # TypeScript configuration
```

## Setup and Installation

### Prerequisites

- Node.js 18+ and npm
- Git

### Installation

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:3000`.

### Environment Variables

Create a `.env.local` file:

```env
# Solana RPC endpoint
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com

# Alternative: use devnet for testing
# NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com

# ORE program ID
NEXT_PUBLIC_ORE_PROGRAM_ID=oreV3EG1i9BEgiAJ8b177Z2S2rMarzak4NMv1kULvWv

# ORE token mint
NEXT_PUBLIC_ORE_MINT=oreoU2P8bN6jkk3jbaiVxYnG1dCXcYxwhwyK9jSybcp

# Enable WebSocket subscriptions (optional)
NEXT_PUBLIC_ENABLE_WS=true
```

## Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Type check
npm run type-check  # (if configured)
```

### Hot Reload

Next.js supports hot module replacement (HMR). Changes to components, pages, and styles will automatically reload.

### Adding New Pages

With Next.js App Router, create files in `app/`:

```typescript
// app/staking/page.tsx
export default function StakingPage() {
  return (
    <div>
      <h1>Staking</h1>
      {/* ... */}
    </div>
  );
}
```

## Architecture

### App Router Structure

```
app/
├── layout.tsx              # Root layout (wraps all pages)
│   └── Providers          # Wallet, connection providers
│       └── page.tsx       # Dashboard (/)
└── staking/
    └── page.tsx           # Staking page (/staking)
```

### Provider Hierarchy

```tsx
<html>
  <body>
    <Providers>              {/* Wallet & connection providers */}
      <Header />             {/* Navigation & wallet button */}
      <main>
        {children}           {/* Page content */}
      </main>
      <Footer />
    </Providers>
  </body>
</html>
```

### Data Flow

```
User Action
    ↓
Component (onClick, etc.)
    ↓
Custom Hook (useMiner, useStake)
    ↓
Solana Web3.js (build transaction)
    ↓
Wallet Adapter (sign & send)
    ↓
On-chain Program (ORE)
    ↓
WebSocket Update (subscription)
    ↓
State Update (React state)
    ↓
Component Re-render
```

## Components

### BoardGrid Component

Displays the 5x5 mining board with deployment visualization.

**Location**: `components/BoardGrid.tsx`

```typescript
interface BoardGridProps {
  round: Round;
  onBlockSelect: (blockId: number) => void;
  selectedBlock?: number;
}

export function BoardGrid({ round, onBlockSelect, selectedBlock }: BoardGridProps) {
  return (
    <div className="grid grid-cols-5 gap-2">
      {Array.from({ length: 25 }).map((_, idx) => (
        <BlockCell
          key={idx}
          blockId={idx}
          deployed={round.blockData[idx].totalDeployed}
          isWinning={round.winningBlock === idx}
          isSelected={selectedBlock === idx}
          onClick={() => onBlockSelect(idx)}
        />
      ))}
    </div>
  );
}
```

**Features**:
- Visual grid representation
- Shows SOL deployed per block
- Highlights winning block
- Click to select for deployment

---

### MinerStats Component

Shows current user's miner statistics.

**Location**: `components/MinerStats.tsx`

```typescript
interface MinerStatsProps {
  miner: Miner | null;
}

export function MinerStats({ miner }: MinerStatsProps) {
  if (!miner) return <div>No miner account</div>;

  return (
    <div className="stats-panel">
      <Stat label="Round" value={miner.round} />
      <Stat label="Block" value={miner.block} />
      <Stat label="Deployed" value={`${lamportsToSOL(miner.deployed)} SOL`} />
      <Stat label="ORE Rewards" value={`${gramsToORE(miner.oreRewards)} ORE`} />
      <Stat label="SOL Rewards" value={`${lamportsToSOL(miner.solRewards)} SOL`} />
    </div>
  );
}
```

---

### StakingPanel Component

Interface for staking operations.

**Location**: `components/StakingPanel.tsx`

```typescript
export function StakingPanel() {
  const { stake, deposit, withdraw, claimYield } = useStake();
  const [amount, setAmount] = useState('');

  const handleDeposit = async () => {
    const amountGrams = parseFloat(amount) * ONE_ORE;
    await deposit(amountGrams);
  };

  return (
    <div className="staking-panel">
      <h2>Staking</h2>

      <div className="stats">
        <p>Staked: {gramsToORE(stake?.balance || 0)} ORE</p>
        <p>Available Yield: {gramsToORE(stake?.availableYield || 0)} ORE</p>
      </div>

      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Amount"
      />

      <button onClick={handleDeposit}>Deposit</button>
      <button onClick={handleWithdraw}>Withdraw</button>
      <button onClick={claimYield}>Claim Yield</button>
    </div>
  );
}
```

---

### WalletButton Component

Wallet connection button with adapter integration.

**Location**: `components/WalletButton.tsx`

```typescript
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export function WalletButton() {
  const { connected, publicKey } = useWallet();

  return (
    <div>
      <WalletMultiButton />
      {connected && (
        <div className="wallet-info">
          Connected: {publicKey?.toBase58().slice(0, 8)}...
        </div>
      )}
    </div>
  );
}
```

---

## Hooks

### useBoard Hook

Fetches and subscribes to board state.

**Location**: `hooks/useBoard.ts`

```typescript
import { useConnection } from '@solana/wallet-adapter-react';
import { useEffect, useState } from 'react';
import { getBoard, BOARD_PDA } from '../lib/ore';

export function useBoard() {
  const { connection } = useConnection();
  const [board, setBoard] = useState<Board | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial fetch
    getBoard(connection).then(setBoard).finally(() => setLoading(false));

    // Subscribe to updates
    const subscriptionId = connection.onAccountChange(
      BOARD_PDA,
      (accountInfo) => {
        const board = parseBoard(accountInfo.data);
        setBoard(board);
      }
    );

    return () => {
      connection.removeAccountChangeListener(subscriptionId);
    };
  }, [connection]);

  return { board, loading };
}
```

---

### useMiner Hook

Manages miner account state.

**Location**: `hooks/useMiner.ts`

```typescript
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { getMiner, minerPDA } from '../lib/ore';

export function useMiner() {
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const [miner, setMiner] = useState<Miner | null>(null);

  useEffect(() => {
    if (!publicKey) return;

    const fetchMiner = async () => {
      const miner = await getMiner(connection, publicKey);
      setMiner(miner);
    };

    fetchMiner();

    // Subscribe to updates
    const minerPda = minerPDA(publicKey);
    const subscriptionId = connection.onAccountChange(minerPda, (accountInfo) => {
      const miner = parseMiner(accountInfo.data);
      setMiner(miner);
    });

    return () => {
      connection.removeAccountChangeListener(subscriptionId);
    };
  }, [publicKey, connection]);

  return { miner };
}
```

---

### useTransaction Hook

Helper for sending transactions.

**Location**: `hooks/useTransaction.ts`

```typescript
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { Transaction } from '@solana/web3.js';

export function useTransaction() {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const send = async (transaction: Transaction) => {
    if (!publicKey) throw new Error('Wallet not connected');

    setLoading(true);
    setError(null);

    try {
      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, 'confirmed');
      return signature;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { send, loading, error };
}
```

---

## Solana Integration

### Connection Setup

**Location**: `lib/solana.ts`

```typescript
import { Connection, clusterApiUrl } from '@solana/web3.js';

const RPC_URL = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || clusterApiUrl('mainnet-beta');

export const connection = new Connection(RPC_URL, {
  commitment: 'confirmed',
  wsEndpoint: RPC_URL.replace('https', 'wss'),
});
```

### ORE Program Integration

**Location**: `lib/ore.ts`

```typescript
import { PublicKey, Transaction, SystemProgram } from '@solana/web3.js';
import { PROGRAM_ID, BOARD_SEED, MINER_SEED } from './constants';

// PDAs
export const BOARD_PDA = PublicKey.findProgramAddressSync(
  [Buffer.from(BOARD_SEED)],
  PROGRAM_ID
)[0];

export function minerPDA(authority: PublicKey): PublicKey {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(MINER_SEED), authority.toBuffer()],
    PROGRAM_ID
  )[0];
}

// Fetch board
export async function getBoard(connection: Connection): Promise<Board> {
  const accountInfo = await connection.getAccountInfo(BOARD_PDA);
  if (!accountInfo) throw new Error('Board account not found');
  return parseBoard(accountInfo.data);
}

// Build deploy instruction
export function buildDeployInstruction(
  user: PublicKey,
  amount: number,
  block: number
): TransactionInstruction {
  const miner = minerPDA(user);

  return new TransactionInstruction({
    programId: PROGRAM_ID,
    keys: [
      { pubkey: user, isSigner: true, isWritable: true },
      { pubkey: miner, isSigner: false, isWritable: true },
      // ... other accounts
    ],
    data: encodeDeployData(amount, block),
  });
}
```

### Data Parsing

```typescript
import { deserialize } from '@coral-xyz/borsh';

const BoardSchema = {
  struct: {
    round: 'u64',
    lastResetAt: 'i64',
    lastCheckpointAt: 'i64',
  },
};

export function parseBoard(data: Buffer): Board {
  return deserialize(BoardSchema, data);
}
```

## Styling

### Tailwind CSS Configuration

**Location**: `tailwind.config.ts`

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'ore-orange': '#FF6B35',
        'ore-blue': '#004E89',
        'ore-dark': '#1A1A1A',
      },
    },
  },
  plugins: [],
};

export default config;
```

### Global Styles

**Location**: `app/globals.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --ore-orange: #FF6B35;
  --ore-blue: #004E89;
}

body {
  @apply bg-gray-900 text-white;
}

.btn-primary {
  @apply bg-ore-orange hover:bg-orange-600 px-4 py-2 rounded-lg transition;
}

.stats-panel {
  @apply bg-gray-800 rounded-lg p-6 shadow-lg;
}
```

## Deployment

### Build for Production

```bash
# Build optimized production bundle
npm run build

# Test production build locally
npm start
```

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Deploy to production
vercel --prod
```

### Deploy to Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy

# Deploy to production
netlify deploy --prod
```

### Environment Variables (Production)

Configure in your hosting platform:

- `NEXT_PUBLIC_SOLANA_RPC_URL`
- `NEXT_PUBLIC_ORE_PROGRAM_ID`
- `NEXT_PUBLIC_ORE_MINT`

## Troubleshooting

### Wallet Not Connecting

- Ensure wallet extension is installed
- Check wallet is on correct network (mainnet/devnet)
- Clear browser cache and reload

### RPC Errors

- Check RPC endpoint is correct and accessible
- Consider using a dedicated RPC provider (Helius, QuickNode)
- Implement retry logic for failed requests

### Transaction Failures

- Ensure sufficient SOL for transaction fees
- Check account derivation is correct
- Verify instruction data encoding

### WebSocket Issues

- Ensure WebSocket endpoint is configured
- Check firewall/network settings
- Implement reconnection logic

---

## Additional Resources

- **Next.js Documentation**: https://nextjs.org/docs
- **Solana Web3.js**: https://solana-labs.github.io/solana-web3.js/
- **Wallet Adapter**: https://github.com/solana-labs/wallet-adapter
- **Tailwind CSS**: https://tailwindcss.com/docs

---

**Happy building! 🎨**
