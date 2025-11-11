# ORE - Digital Gold, Unchained

![License](https://img.shields.io/badge/license-Apache--2.0-blue)
![Solana](https://img.shields.io/badge/blockchain-Solana-blueviolet)
![Version](https://img.shields.io/badge/version-3.7.0--alpha-orange)

ORE is a Solana-native digital store of value with a capped maximum supply of 5 million tokens. It combines innovative mining mechanics with staking rewards and automated buyback mechanisms to create a trustless, decentralized cryptocurrency optimized for long-term holders.

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [Mining System](#mining-system)
- [Staking System](#staking-system)
- [Tokenomics](#tokenomics)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [License](#license)

## Overview

ORE is designed from the ground up to serve as a Solana-native store of value with maximal freedom and minimal trust assumptions. Unlike other digital stores of value that rely on third-party intermediaries when used on Solana, ORE is built natively on the Solana blockchain.

**Program ID**: `oreV3EG1i9BEgiAJ8b177Z2S2rMarzak4NMv1kULvWv`
**Token Mint**: `oreoU2P8bN6jkk3jbaiVxYnG1dCXcYxwhwyK9jSybcp`
**Decimals**: 11 (100 billion indivisible units per ORE, called "grams")
**Max Supply**: 5,000,000 ORE

## Key Features

### 🎮 Innovative Mining System
- Grid-based prospecting with 5x5 board per round
- Weighted random selection for fair reward distribution
- Motherlode bonus pools with 1/625 chance per round
- Refining mechanism that rewards long-term holders

### 💰 Protocol Revenue Sharing
- 10% of SOL mining rewards fund automatic buybacks
- 90% of buyback ORE is burned, 10% distributed to stakers
- Deflationary pressure combined with staking yield

### 🔒 Trustless & Decentralized
- No team or insider allocations
- All minting controlled by smart contracts
- Transparent, auditable on-chain operations

### ⚡ Built for Solana
- Leverages Solana's speed and low transaction costs
- Native integration with Solana ecosystem
- Optimized for high-frequency operations

## Project Structure

This repository is organized as a Rust workspace with four main components:

```
ore-alt-client/
├── api/                    # Core API library
│   └── src/
│       ├── consts.rs       # Program constants and addresses
│       ├── error.rs        # Custom error types
│       ├── event.rs        # Event definitions
│       ├── instruction.rs  # Instruction definitions
│       ├── sdk.rs          # SDK helper functions
│       └── state/          # Account state structures
├── program/                # On-chain Solana program
│   └── src/
│       ├── lib.rs          # Program entry point
│       └── *.rs            # Instruction handlers
├── cli/                    # Command-line interface
│   └── src/
│       └── main.rs         # CLI implementation
├── frontend/               # Next.js web dashboard
│   ├── app/                # Next.js app router pages
│   ├── components/         # React components
│   ├── hooks/              # Custom React hooks
│   └── lib/                # Utility libraries
├── docs/                   # Comprehensive documentation
└── localnet.sh             # Local development script
```

## Quick Start

### Prerequisites

- Rust 1.82.0 (automatically managed via `rust-toolchain.toml`)
- Solana CLI tools 2.1+
- Node.js 18+ (for frontend)

### Build

```bash
# Build entire workspace
cargo build

# Build Solana program for deployment
cargo build-sbf
```

### Test

```bash
# Run all tests
cargo test-sbf

# Generate coverage report
cargo llvm-cov
```

### Local Development

```bash
# Start local validator with deployed program
./localnet.sh
```

This starts a Solana test validator with:
- ORE program deployed at the correct address
- Mainnet accounts cloned (mint, treasury, boost reserve, etc.)
- Ready for local testing and development

### Frontend Development

```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:3000` to view the mining dashboard.

## Mining System

### How Mining Works

1. **Prospecting Phase**: Each round lasts one minute. Miners deploy SOL to claim space on a 5x5 grid of blocks
2. **Random Selection**: At round end, one winning block is chosen via secure on-chain randomness
3. **SOL Rewards**: All SOL from losing blocks is distributed to miners on the winning block proportionally
4. **ORE Rewards**: +1 ORE is minted and distributed to winning miners (split evenly or awarded to one miner by weighted chance)

### Motherlode

- Each round, +0.2 ORE is added to the motherlode pool
- 1/625 chance the winning block hits the motherlode
- When hit, pool is distributed to winning miners proportionally
- If not hit, pool accumulates for future rounds

### Refining Fee

A 10% "refining fee" applies when claiming ORE rewards. This fee is redistributed to other miners with unclaimed rewards, incentivizing long-term holding and rewarding patience.

## Staking System

ORE holders can stake their tokens to earn yield from protocol revenue:

1. **Revenue Collection**: 10% of all SOL mining rewards are collected as protocol revenue
2. **Buyback Program**: Revenue is used to buy ORE from open markets
3. **Distribution**: 90% of purchased ORE is burned, 10% distributed to stakers
4. **Double Benefit**: Stakers gain from both value appreciation (buyback) and direct yield

## Tokenomics

### Supply

- **Fair Launch**: No team or insider allocations
- **Maximum Supply**: 5,000,000 ORE (capped)
- **Emission Rate**: ~1 ORE per minute from mining
- **Reminting**: Burned tokens can be reminted while under max supply

### Fees

| Fee Type | Amount | Purpose |
|----------|--------|---------|
| Mining Revenue | 10% of SOL rewards | Protocol buyback program |
| Staker Yield | 10% of buyback ORE | Distributed to stakers |
| Refining Fee | 10% of ORE claims | Redistributed to unclaimed miners |
| Admin Fee | 1% of deployed SOL | Development & operations |
| Miner Deposit | 0.00001 SOL | Account checkpoint reserve |
| Automation Fee | 0.000005 SOL/tx | Transaction cost offset |

## Documentation

Comprehensive documentation is available in the `docs/` directory:

- **[Architecture Guide](docs/ARCHITECTURE.md)** - System design and component interactions
- **[API Reference](docs/API.md)** - Detailed API documentation
- **[CLI Guide](docs/CLI_GUIDE.md)** - Command-line usage instructions
- **[Development Guide](docs/DEVELOPMENT.md)** - Setup and development workflow
- **[Frontend Guide](docs/FRONTEND.md)** - Web dashboard documentation
- **[Contributing Guide](docs/CONTRIBUTING.md)** - How to contribute to ORE

Additional resources:
- **[Game Rules](game-rules.md)** - Detailed mining mechanics
- **[Frontend Implementation Plan](FRONTEND_IMPLEMENTATION_PLAN.md)** - Frontend roadmap

## API Overview

### Core Modules

- **[Consts](api/src/consts.rs)** – Program constants and addresses
- **[Error](api/src/error.rs)** – Custom program errors
- **[Event](api/src/event.rs)** – Program events
- **[Instruction](api/src/instruction.rs)** – Instruction definitions
- **[SDK](api/src/sdk.rs)** – Helper functions and PDA derivation
- **[State](api/src/state/)** – Account state structures

### Instructions

#### Mining Operations
- **[Deploy](program/src/deploy.rs)** – Deploy SOL to claim board space
- **[Checkpoint](program/src/checkpoint.rs)** - Checkpoint rewards from prior round
- **[ClaimORE](program/src/claim_ore.rs)** - Claim ORE mining rewards
- **[ClaimSOL](program/src/claim_sol.rs)** - Claim SOL mining rewards
- **[Reset](program/src/reset.rs)** - Reset board for new round
- **[Automate](program/src/automate.rs)** - Configure automation
- **[Log](program/src/log.rs)** – Log event data

#### Staking Operations
- **[Deposit](program/src/deposit.rs)** - Deposit ORE into stake account
- **[Withdraw](program/src/withdraw.rs)** - Withdraw ORE from stake account
- **[ClaimSeeker](program/src/claim_seeker.rs)** - Claim Seeker genesis token
- **[ClaimYield](program/src/claim_yield.rs)** - Claim staking yield

#### Admin Operations
- **[Bury](program/src/bury.rs)** - Execute buy-and-burn transaction
- **[Wrap](program/src/wrap.rs)** - Wrap SOL in treasury
- **[SetAdmin](program/src/set_admin.rs)** - Update admin authority
- **[SetFeeCollector](program/src/set_fee_collector.rs)** - Update fee collection address
- **[Initialize](program/src/initialize.rs)** - Initialize program variables

### State Accounts

- **[Board](api/src/state/board.rs)** - Current round number and timestamps
- **[Miner](api/src/state/miner.rs)** - Individual miner's game state
- **[Round](api/src/state/round.rs)** - Game state for a specific round
- **[Stake](api/src/state/stake.rs)** - User staking balances and yield
- **[Treasury](api/src/state/treasury.rs)** - Token minting, burning, and escrow
- **[Automation](api/src/state/automation.rs)** - Automation configurations
- **[Config](api/src/state/config.rs)** - Global program configuration
- **[Seeker](api/src/state/seeker.rs)** - Seeker token claim tracking

## Contributing

We welcome contributions! Please see our [Contributing Guide](docs/CONTRIBUTING.md) for details on:

- Code of conduct
- Development process
- Submitting pull requests
- Coding standards
- Testing requirements

## Security

ORE is built with security as a priority:

- Overflow checks enabled in all build profiles
- Extensive testing with `cargo test-sbf`
- Uses the Steel framework for safe account handling
- Open-source and auditable

If you discover a security vulnerability, please report it to the team through the appropriate channels.

## Resources

- **Website**: https://ore.supply
- **Documentation**: https://docs.rs/ore-api/latest/ore_api/
- **Repository**: https://github.com/regolith-labs/ore

## License

Apache-2.0 License. See [LICENSE](LICENSE) for details.

---

**Built with ⚡ on Solana**
