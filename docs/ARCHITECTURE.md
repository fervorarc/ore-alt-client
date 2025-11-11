# ORE Architecture Guide

This document provides a comprehensive overview of the ORE protocol architecture, design patterns, and component interactions.

## Table of Contents

- [System Overview](#system-overview)
- [Three-Tier Architecture](#three-tier-architecture)
- [Data Flow](#data-flow)
- [Account Architecture](#account-architecture)
- [Instruction Processing](#instruction-processing)
- [PDA Derivation](#pda-derivation)
- [State Management](#state-management)
- [Security Model](#security-model)
- [Economic Model](#economic-model)

## System Overview

ORE is built as a Solana program with a modular three-tier architecture:

```
┌─────────────────────────────────────────────────────────┐
│                    CLI / Frontend                        │
│              (Off-chain User Interface)                  │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ RPC Calls
                     ▼
┌─────────────────────────────────────────────────────────┐
│                   Solana Blockchain                      │
│  ┌───────────────────────────────────────────────────┐  │
│  │            ORE Program (BPF)                      │  │
│  │  Program ID: oreV3EG1i9BEgiAJ8b177Z2S2rMarzak4... │  │
│  └───────────────────────────────────────────────────┘  │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ Account State
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Program Derived Accounts                    │
│  (Board, Miner, Round, Stake, Treasury, etc.)           │
└─────────────────────────────────────────────────────────┘
```

## Three-Tier Architecture

### 1. API Layer (`api/`)

The API layer is a pure Rust library that defines the protocol interface. It contains no on-chain logic and serves as the source of truth for data structures and instruction definitions.

**Key Responsibilities:**
- Define instruction types and serialization
- Define account state structures
- Provide SDK helper functions
- Declare constants and error types

**Core Modules:**

```rust
api/src/
├── lib.rs           // Program ID declaration and prelude
├── consts.rs        // Constants (addresses, seeds, timing)
├── error.rs         // Custom error types
├── event.rs         // Event definitions for logging
├── instruction.rs   // Instruction enum and structs
├── sdk.rs           // Helper functions (instruction builders, PDA derivation)
└── state/           // Account state structures
    ├── automation.rs
    ├── board.rs
    ├── config.rs
    ├── miner.rs
    ├── round.rs
    ├── seeker.rs
    ├── stake.rs
    └── treasury.rs
```

**Design Patterns:**
- All instruction structs implement `Pod` and `Zeroable` for zero-copy deserialization
- State structs use `bytemuck` for safe transmutation between bytes and types
- Const functions for compile-time PDA derivation using `const-crypto`

### 2. Program Layer (`program/`)

The program layer is the on-chain Solana BPF program that processes instructions and manages state.

**Key Responsibilities:**
- Route instructions to appropriate handlers
- Validate account inputs
- Execute business logic
- Emit events
- Manage state transitions

**Structure:**

```rust
program/src/
├── lib.rs              // Entry point and instruction router
├── automate.rs         // Automation configuration
├── bury.rs             // Buy-and-burn operations
├── checkpoint.rs       // Reward checkpointing
├── claim_ore.rs        // ORE reward claims
├── claim_seeker.rs     // Seeker token claims
├── claim_sol.rs        // SOL reward claims
├── claim_yield.rs      // Staking yield claims
├── close.rs            // Account closing
├── deploy.rs           // SOL deployment to board
├── deposit.rs          // Staking deposits
├── initialize.rs       // Program initialization
├── log.rs              // Event logging
├── migrate_staker.rs   // Staker migration
├── reset.rs            // Board reset for new round
├── set_admin.rs        // Admin authority updates
├── set_fee_collector.rs// Fee collector updates
├── whitelist.rs        // Whitelist management
├── withdraw.rs         // Staking withdrawals
└── wrap.rs             // SOL wrapping in treasury
```

**Instruction Handler Pattern:**

Each instruction handler follows this pattern:

```rust
use steel::*;

pub fn process_<instruction_name>(accounts: &[AccountInfo<'_>], data: &[u8]) -> ProgramResult {
    // 1. Parse instruction data
    let args = <InstructionStruct>::try_from_bytes(data)?;

    // 2. Load and validate accounts
    let [account1, account2, ...] = accounts else {
        return Err(ProgramError::NotEnoughAccountKeys);
    };
    account1.is_signer()?;
    account2.is_writable()?;
    // ... more validation

    // 3. Execute business logic
    // ... process the instruction

    // 4. Update state
    // ... mutate account data

    // 5. Emit events (optional)
    // ... log events

    Ok(())
}
```

### 3. CLI Layer (`cli/`)

The CLI is an off-chain client for user interaction with the protocol.

**Structure:**
- Single file: `cli/src/main.rs` (~31KB)
- Uses `clap` for argument parsing
- Interacts with Solana via RPC
- Constructs and sends transactions

### 4. Frontend Layer (`frontend/`)

A Next.js web application providing a visual interface for the mining dashboard.

**Technology Stack:**
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Blockchain**: Solana Web3.js 1.98
- **Wallet**: Solana Wallet Adapter

**Structure:**

```
frontend/
├── app/              // Next.js pages (App Router)
│   ├── page.tsx      // Main dashboard
│   └── layout.tsx    // Root layout
├── components/       // Reusable React components
│   ├── BoardGrid.tsx
│   ├── MinerStats.tsx
│   ├── StakingPanel.tsx
│   └── WalletButton.tsx
├── hooks/            // Custom React hooks
│   ├── useBoard.ts
│   ├── useMiner.ts
│   └── useStake.ts
└── lib/              // Utility libraries
    ├── ore.ts        // ORE program interaction
    └── solana.ts     // Solana connection setup
```

## Data Flow

### Mining Flow

```
1. User calls CLI or Frontend
         │
         ▼
2. Construct "Deploy" instruction
   - Amount of SOL to deploy
   - Target block coordinates
         │
         ▼
3. Submit transaction to Solana
         │
         ▼
4. Program validates:
   - Round is active
   - Block is valid
   - User has enough SOL
         │
         ▼
5. Update state:
   - Transfer SOL from user
   - Update Miner account
   - Update Round account
         │
         ▼
6. At round end (automated or manual):
         │
         ▼
7. "Reset" instruction:
   - Select winning block (RNG)
   - Calculate rewards
   - Update Board for new round
         │
         ▼
8. Users claim rewards:
   - Call "ClaimORE" or "ClaimSOL"
   - Receive rewards
   - Refining fee applied to ORE claims
```

### Staking Flow

```
1. User calls "Deposit" instruction
         │
         ▼
2. Transfer ORE from user to Stake account
         │
         ▼
3. Update Stake state:
   - Increase staked balance
   - Track staking timestamp
         │
         ▼
4. Protocol revenue flows in:
   - 10% of SOL mining rewards → Treasury
   - Treasury buys ORE from market
   - 90% burned, 10% added to yield pool
         │
         ▼
5. User calls "ClaimYield"
         │
         ▼
6. Calculate yield based on:
   - Stake amount
   - Time staked
   - Total staked supply
         │
         ▼
7. Transfer yield to user
```

## Account Architecture

### Program Derived Accounts (PDAs)

All program-owned accounts are PDAs derived deterministically from seeds:

| Account | Seeds | Purpose |
|---------|-------|---------|
| Board | `["board"]` | Global round tracking |
| Miner | `["miner", user_pubkey]` | Per-user mining state |
| Round | `["round", round_number]` | Per-round game state |
| Stake | `["stake", user_pubkey]` | Per-user staking state |
| Treasury | `["treasury"]` | Token mint/burn authority |
| Automation | `["automation", user_pubkey]` | Per-user automation config |
| Config | `["config"]` | Global configuration |
| Seeker | `["seeker", user_pubkey]` | Seeker token claim tracking |

**Derivation Example:**

```rust
// In api/src/sdk.rs
pub fn miner_pda(user: Pubkey) -> (Pubkey, u8) {
    Pubkey::find_program_address(
        &[MINER_SEED, user.as_ref()],
        &crate::ID
    )
}

// Const variant for compile-time derivation
pub const fn board_pda() -> Pubkey {
    const_crypto::derive_pda(&[BOARD_SEED], &crate::ID)
}
```

### Account Data Structures

#### Board Account

Tracks the current round number and critical timestamps.

```rust
pub struct Board {
    pub round: u64,              // Current round number
    pub last_reset_at: i64,      // Timestamp of last reset
    pub last_checkpoint_at: i64, // Timestamp of last checkpoint
}
```

#### Miner Account

Tracks individual miner's state within the current round.

```rust
pub struct Miner {
    pub authority: Pubkey,      // Owner of this miner account
    pub round: u64,             // Round this state applies to
    pub block: u8,              // Chosen block (0-24 for 5x5 grid)
    pub deployed: u64,          // Amount of SOL deployed
    pub ore_rewards: u64,       // Unclaimed ORE rewards (in grams)
    pub sol_rewards: u64,       // Unclaimed SOL rewards (in lamports)
}
```

#### Round Account

Captures the game state for a specific round.

```rust
pub struct Round {
    pub number: u64,            // Round number
    pub total_deployed: u64,    // Total SOL deployed this round
    pub winning_block: u8,      // Winning block (255 = not yet determined)
    pub ore_supply: u64,        // ORE minted this round
    pub motherlode_pool: u64,   // Accumulated motherlode
    pub block_data: [BlockData; 25], // Per-block statistics
}
```

#### Stake Account

Manages user staking positions and yield tracking.

```rust
pub struct Stake {
    pub authority: Pubkey,      // Owner of this stake account
    pub balance: u64,           // Staked ORE balance (in grams)
    pub last_claim_at: i64,     // Timestamp of last yield claim
    pub total_yield_claimed: u64, // Lifetime yield claimed
}
```

#### Treasury Account

Manages the protocol's token operations.

```rust
pub struct Treasury {
    pub admin: Pubkey,          // Admin authority
    pub mint: Pubkey,           // ORE mint address
    pub total_minted: u64,      // Lifetime ORE minted
    pub total_burned: u64,      // Lifetime ORE burned
    pub revenue_balance: u64,   // SOL revenue collected
}
```

## Instruction Processing

### Entry Point

All instructions enter through `program/src/lib.rs`:

```rust
entrypoint!(process_instruction);

pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    data: &[u8],
) -> ProgramResult {
    // Parse instruction
    let (ix, data) = parse_instruction::<Instruction>(&ore_api::ID, program_id, data)?;

    // Route to appropriate handler
    match ix {
        Instruction::Deploy => process_deploy(accounts, data)?,
        Instruction::Checkpoint => process_checkpoint(accounts, data)?,
        Instruction::ClaimORE => process_claim_ore(accounts, data)?,
        Instruction::ClaimSOL => process_claim_sol(accounts, data)?,
        Instruction::Reset => process_reset(accounts, data)?,
        Instruction::Deposit => process_deposit(accounts, data)?,
        Instruction::Withdraw => process_withdraw(accounts, data)?,
        // ... more instructions
    }

    Ok(())
}
```

### Instruction Lifecycle

1. **Parsing**: Deserialize instruction data using `try_from_bytes()`
2. **Account Loading**: Load accounts from `&[AccountInfo]`
3. **Validation**: Check signers, writability, ownership
4. **Execution**: Perform business logic
5. **State Update**: Mutate account data
6. **Event Emission**: Log events for off-chain indexing

## PDA Derivation

### Compile-Time Derivation

ORE uses `const-crypto` for compile-time PDA derivation, allowing PDAs to be constants:

```rust
// In api/src/consts.rs
use const_crypto::derive_pda;

pub const BOARD_PDA: Pubkey = derive_pda(&[b"board"], &crate::ID);
pub const TREASURY_PDA: Pubkey = derive_pda(&[b"treasury"], &crate::ID);
```

### Runtime Derivation

For PDAs with dynamic seeds (e.g., user-specific accounts):

```rust
// In api/src/sdk.rs
pub fn miner_pda(authority: Pubkey) -> (Pubkey, u8) {
    Pubkey::find_program_address(
        &[MINER_SEED, authority.as_ref()],
        &crate::ID,
    )
}
```

### Seed Constants

All seeds are defined in `api/src/consts.rs`:

```rust
pub const BOARD_SEED: &[u8] = b"board";
pub const MINER_SEED: &[u8] = b"miner";
pub const ROUND_SEED: &[u8] = b"round";
pub const STAKE_SEED: &[u8] = b"stake";
pub const TREASURY_SEED: &[u8] = b"treasury";
pub const AUTOMATION_SEED: &[u8] = b"automation";
```

## State Management

### Deserialization

ORE uses zero-copy deserialization for performance:

```rust
use bytemuck::{Pod, Zeroable};

#[repr(C)]
#[derive(Clone, Copy, Pod, Zeroable)]
pub struct Miner {
    pub authority: Pubkey,
    pub round: u64,
    pub block: u8,
    // ...
}

// In handler:
let miner = account.as_account::<Miner>()?;
let miner_data = miner.data.as_ref().borrow_mut();
let miner_state = bytemuck::from_bytes_mut::<Miner>(&mut miner_data);
```

### State Transitions

State transitions follow these rules:

1. **Atomicity**: All state changes within a transaction are atomic
2. **Validation**: Pre-conditions checked before any mutation
3. **Consistency**: Invariants maintained across all state changes
4. **Durability**: Changes persisted to blockchain

**Example: Deploy Instruction**

```rust
// Validate
require!(round.winning_block == 255, "Round already ended");
require!(block_id < 25, "Invalid block");

// Execute
let lamports = args.amount;
miner.deployed += lamports;
round.block_data[block_id].total_deployed += lamports;
round.total_deployed += lamports;

// Transfer SOL
transfer_lamports(user_account, treasury_account, lamports)?;
```

## Security Model

### Account Validation

All handlers validate accounts using the Steel framework:

```rust
// Check account is signer
account.is_signer()?;

// Check account is writable
account.is_writable()?;

// Check account ownership
account.is_owned_by(&crate::ID)?;

// Check PDA derivation
account.is_pda(&[SEED, user.key.as_ref()], &crate::ID)?;
```

### Overflow Protection

All arithmetic uses checked operations:

```rust
// In Cargo.toml
[profile.release]
overflow-checks = true

[profile.dev]
overflow-checks = true
```

This causes panics on overflow rather than silent wrapping.

### Authority Checks

Critical operations require admin authority:

```rust
require!(admin.key == &ADMIN_PUBKEY, "Unauthorized");
```

Admin address is hardcoded in `api/src/consts.rs`.

### Replay Protection

Miners are tied to specific rounds:

```rust
require!(miner.round == board.round, "Stale miner account");
```

This prevents replaying old transactions.

## Economic Model

### Token Supply

- **Decimals**: 11 (1 ORE = 10^11 grams)
- **Max Supply**: 100,000,000 ORE
- **Emission**: ~1 ORE per minute from mining
- **Current Supply**: `treasury.total_minted - treasury.total_burned`

### Revenue Flows

```
Mining SOL Rewards (100%)
    │
    ├─ 10% → Protocol Revenue (Treasury)
    │         │
    │         └─ Buyback ORE from market
    │                   │
    │                   ├─ 90% → Burn
    │                   └─ 10% → Staker Yield
    │
    └─ 90% → Winning Miners

Mining ORE Rewards (100%)
    │
    ├─ 10% → Refining Fee (redistrib to unclaimed)
    └─ 90% → Claiming Miner
```

### Time Constants

Defined in `api/src/consts.rs`:

```rust
// Solana timing
pub const SLOTS_PER_MINUTE: u64 = 150;

// Round duration
pub const ONE_WEEK_SLOTS: u64 = 7 * 24 * 60 * 150; // ~1 week

// Intermission between rounds
pub const INTERMISSION_SLOTS: u64 = 35;

// Checkpoint expiry
pub const ONE_WEEK: i64 = 604_800; // seconds
```

## Steel Framework Integration

ORE extensively uses the Steel framework (v4.0.2):

**Account Loading:**
```rust
let account = Account::<Miner>::try_from(&account_info)?;
```

**PDA Validation:**
```rust
account_info.is_pda(&[SEED], &program_id)?;
```

**CPI Helpers:**
```rust
transfer_lamports(from, to, amount)?;
mint_to(mint, recipient, amount, authority)?;
burn(mint, source, amount, authority)?;
```

**Instruction Parsing:**
```rust
let (ix, data) = parse_instruction::<Instruction>(&ore_api::ID, program_id, instruction_data)?;
```

## Best Practices

### For Contributors

1. **Follow the Three-Tier Pattern**: API defines data, Program implements logic, CLI/Frontend consume
2. **Use Zero-Copy Deserialization**: Implement `Pod` and `Zeroable` for all state structs
3. **Validate Everything**: Check all account constraints before mutation
4. **Enable Overflow Checks**: Never disable overflow checking
5. **Test with `cargo test-sbf`**: Always run on-chain tests
6. **Document PDAs**: Clearly document all PDA derivation logic
7. **Use Steel Helpers**: Leverage Steel framework for common operations
8. **Emit Events**: Log important state changes for off-chain indexing

### Common Patterns

**Creating Instructions:**
```rust
// In api/src/sdk.rs
pub fn deploy(user: Pubkey, amount: u64, block: u8) -> Instruction {
    let miner = miner_pda(user).0;
    let board = BOARD_PDA;
    // ... build instruction
}
```

**Handling Errors:**
```rust
use ore_api::error::OreError;

require!(condition, OreError::InvalidCondition);
```

**Account Creation:**
```rust
create_account(
    payer,
    new_account,
    &[seeds, &[bump]],
    size,
    &crate::ID,
)?;
```

---

This architecture enables ORE to be secure, efficient, and maintainable while providing a clear separation of concerns across all layers of the system.
