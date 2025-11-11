# ORE API Reference

Complete API reference for the ORE protocol, including instructions, state accounts, constants, errors, and SDK functions.

## Table of Contents

- [Overview](#overview)
- [Program Information](#program-information)
- [Instructions](#instructions)
  - [Mining Instructions](#mining-instructions)
  - [Staking Instructions](#staking-instructions)
  - [Admin Instructions](#admin-instructions)
- [State Accounts](#state-accounts)
- [Constants](#constants)
- [Errors](#errors)
- [SDK Functions](#sdk-functions)
- [Events](#events)

## Overview

The ORE API is organized into several modules:

- **`instruction.rs`**: Instruction enum and data structures
- **`state/`**: Account state definitions
- **`consts.rs`**: Program constants and addresses
- **`error.rs`**: Custom error types
- **`event.rs`**: Event definitions
- **`sdk.rs`**: Helper functions for instruction building and PDA derivation

## Program Information

| Property | Value |
|----------|-------|
| **Program ID** | `oreV3EG1i9BEgiAJ8b177Z2S2rMarzak4NMv1kULvWv` |
| **Token Mint** | `oreoU2P8bN6jkk3jbaiVxYnG1dCXcYxwhwyK9jSybcp` |
| **Decimals** | 11 (100 billion indivisible units per ORE) |
| **Max Supply** | 5,000,000 ORE |
| **Admin Address** | `HBUh9g46wk2X89CvaNN15UmsznP59rh6od1h8JwYAopk` |

## Instructions

All instructions implement `Pod` and `Zeroable` for zero-copy deserialization.

### Mining Instructions

#### Deploy

Deploys SOL to claim space on the mining board.

**Instruction Data:**
```rust
pub struct Deploy {
    pub amount: [u8; 8],    // Amount of SOL to deploy (lamports)
    pub squares: [u8; 4],   // Target square coordinates
}
```

**Accounts:**
1. `[signer, writable]` User (fee payer and SOL source)
2. `[writable]` Miner PDA
3. `[writable]` Board PDA
4. `[writable]` Round PDA
5. `[writable]` Treasury PDA
6. `[]` System Program

**Logic:**
- Transfers SOL from user to treasury
- Updates miner's deployed amount
- Updates round statistics
- Validates round is active and block is valid

**Errors:**
- `AmountTooSmall`: Deployment amount below minimum

---

#### Checkpoint

Checkpoints rewards from a prior round to prevent expiration.

**Instruction Data:**
```rust
pub struct Checkpoint {}
```

**Accounts:**
1. `[signer]` User
2. `[writable]` Miner PDA
3. `[]` Board PDA
4. `[]` Round PDA (for the miner's round)

**Logic:**
- Validates checkpoint is needed (miner is from old round)
- Calculates final rewards if not already calculated
- Preserves rewards in miner account
- Updates miner to current round

**Timing:**
- Must be called within ONE_WEEK (604,800 seconds) of round end
- Prevents reward expiration

---

#### ClaimORE

Claims ORE mining rewards.

**Instruction Data:**
```rust
pub struct ClaimORE {}
```

**Accounts:**
1. `[signer]` User
2. `[writable]` Miner PDA
3. `[writable]` Treasury PDA
4. `[writable]` ORE Mint
5. `[writable]` User's ORE Token Account
6. `[]` Token Program

**Logic:**
- Calculates claimable ORE (with refining fee applied)
- 10% refining fee redistributed to other miners
- Mints ORE to user's token account
- Updates miner's unclaimed balance

**Fees:**
- 10% refining fee on claimed amount

---

#### ClaimSOL

Claims SOL mining rewards.

**Instruction Data:**
```rust
pub struct ClaimSOL {}
```

**Accounts:**
1. `[signer, writable]` User
2. `[writable]` Miner PDA
3. `[writable]` Treasury PDA

**Logic:**
- Transfers SOL rewards from treasury to user
- Updates miner's unclaimed SOL balance

---

#### Reset

Resets the board for a new mining round.

**Instruction Data:**
```rust
pub struct Reset {}
```

**Accounts:**
1. `[signer, writable]` User (pays for transaction)
2. `[writable]` Board PDA
3. `[writable]` Round PDA (current)
4. `[writable]` Round PDA (new)
5. `[]` Recent Slothashes sysvar

**Logic:**
- Validates round duration has elapsed
- Selects winning block using on-chain randomness
- Calculates rewards for winning miners
- Determines if motherlode was hit (1/625 chance)
- Creates new round account
- Updates board to new round number

**Randomness:**
- Uses Solana's Recent Slothashes sysvar for secure randomness
- Winning block = `hash % 25` (for 5x5 grid)

---

#### Automate

Configures automation settings for a miner.

**Instruction Data:**
```rust
pub struct Automate {
    pub amount: [u8; 8],    // Amount to deploy per round
    pub deposit: [u8; 8],   // SOL deposit for automation
    pub fee: [u8; 8],       // Fee per automated transaction
    pub mask: [u8; 8],      // Bitmask for block selection
    pub strategy: u8,       // Automation strategy
}
```

**Accounts:**
1. `[signer, writable]` User
2. `[writable]` Automation PDA
3. `[]` System Program

**Logic:**
- Creates or updates automation configuration
- Deposits SOL for automation fees
- Validates strategy and parameters

**Fee:**
- 0.000005 SOL per automated transaction

---

#### Log

Logs non-truncatable event data.

**Instruction Data:**
```rust
pub struct Log {}
```

**Accounts:**
1. `[]` Data account to log

**Logic:**
- Emits event with account data
- Used for off-chain indexing

---

#### Close

Closes a miner account and refunds rent.

**Instruction Data:**
```rust
pub struct Close {}
```

**Accounts:**
1. `[signer, writable]` User
2. `[writable]` Miner PDA

**Logic:**
- Validates miner has no unclaimed rewards
- Closes account and refunds rent to user

---

### Staking Instructions

#### Deposit

Deposits ORE into a stake account to earn yield.

**Instruction Data:**
```rust
pub struct Deposit {
    pub amount: [u8; 8],    // Amount of ORE to deposit (grams)
}
```

**Accounts:**
1. `[signer]` User
2. `[writable]` Stake PDA
3. `[writable]` User's ORE Token Account
4. `[writable]` Treasury ORE Token Account
5. `[]` Token Program
6. `[]` System Program (for PDA creation if needed)

**Logic:**
- Transfers ORE from user to treasury
- Creates stake account if it doesn't exist
- Increases staked balance
- Records deposit timestamp

---

#### Withdraw

Withdraws ORE from a stake account.

**Instruction Data:**
```rust
pub struct Withdraw {
    pub amount: [u8; 8],    // Amount of ORE to withdraw (grams)
}
```

**Accounts:**
1. `[signer]` User
2. `[writable]` Stake PDA
3. `[writable]` Treasury ORE Token Account
4. `[writable]` User's ORE Token Account
5. `[writable]` Treasury PDA
6. `[]` Token Program

**Logic:**
- Validates sufficient staked balance
- Transfers ORE from treasury to user
- Decreases staked balance

**Errors:**
- `AmountTooSmall`: Insufficient staked balance

---

#### ClaimYield

Claims staking yield rewards.

**Instruction Data:**
```rust
pub struct ClaimYield {
    pub amount: [u8; 8],    // Amount of yield to claim (grams)
}
```

**Accounts:**
1. `[signer]` User
2. `[writable]` Stake PDA
3. `[writable]` Treasury PDA
4. `[writable]` ORE Mint
5. `[writable]` User's ORE Token Account
6. `[]` Token Program

**Logic:**
- Calculates available yield based on:
  - Stake amount
  - Time staked
  - Total protocol yield pool
- Mints yield ORE to user
- Updates last claim timestamp

**Yield Calculation:**
- Proportional to stake size and duration
- 10% of buyback ORE distributed to stakers
- 90% of buyback ORE is burned

---

#### ClaimSeeker

Claims a Seeker genesis token.

**Instruction Data:**
```rust
pub struct ClaimSeeker {}
```

**Accounts:**
1. `[signer]` User
2. `[writable]` Seeker PDA
3. `[writable]` Seeker Token Account
4. Additional accounts for token minting

**Logic:**
- One-time claim per user
- Creates Seeker NFT
- Marks Seeker account as claimed

---

### Admin Instructions

#### Bury

Executes a buy-and-burn transaction using protocol revenue.

**Instruction Data:**
```rust
pub struct Bury {
    pub min_amount_out: [u8; 8],    // Minimum ORE to receive
}
```

**Accounts:**
1. `[signer]` Admin
2. `[writable]` Treasury PDA
3. `[writable]` ORE Mint
4. Additional accounts for DEX interaction

**Logic:**
- Uses SOL revenue to buy ORE from market
- Burns 90% of purchased ORE
- Adds 10% to staker yield pool
- Slippage protection via `min_amount_out`

**Authorization:**
- Requires admin signature

---

#### Wrap

Wraps SOL in the treasury for swap transactions.

**Instruction Data:**
```rust
pub struct Wrap {}
```

**Accounts:**
1. `[signer]` Admin
2. `[writable]` Treasury PDA
3. Additional accounts for SOL wrapping

**Logic:**
- Wraps native SOL to wSOL token
- Prepares treasury for DEX swaps

**Authorization:**
- Requires admin signature

---

#### SetAdmin

Updates the admin authority.

**Instruction Data:**
```rust
pub struct SetAdmin {
    pub admin: [u8; 32],    // New admin pubkey
}
```

**Accounts:**
1. `[signer]` Current Admin
2. `[writable]` Config PDA

**Logic:**
- Updates admin address in config
- Transfers admin authority

**Authorization:**
- Requires current admin signature

**Security:**
- Critical operation, use with caution

---

#### SetFeeCollector

Updates the fee collection address.

**Instruction Data:**
```rust
pub struct SetFeeCollector {
    pub fee_collector: [u8; 32],    // New fee collector pubkey
}
```

**Accounts:**
1. `[signer]` Admin
2. `[writable]` Config PDA

**Logic:**
- Updates fee collector address
- Redirects admin fees to new address

**Authorization:**
- Requires admin signature

---

#### Initialize

Initializes the ORE program (one-time setup).

**Instruction Data:**
```rust
pub struct Initialize {}
```

**Accounts:**
1. `[signer, writable]` Admin
2. `[writable]` Board PDA
3. `[writable]` Config PDA
4. `[writable]` Treasury PDA
5. `[]` ORE Mint
6. `[]` System Program

**Logic:**
- Creates initial program accounts
- Sets up board for round 0
- Configures treasury
- Can only be called once

**Authorization:**
- Requires admin signature

---

## State Accounts

### Board

Tracks the current round number and timestamps.

**Size:** 32 bytes
**PDA Seeds:** `["board"]`
**Address:** Deterministic PDA

```rust
pub struct Board {
    pub round: u64,              // Current round number
    pub last_reset_at: i64,      // Timestamp of last reset
    pub last_checkpoint_at: i64, // Timestamp of last checkpoint
    pub _padding: [u8; 8],       // Reserved
}
```

---

### Miner

Tracks individual miner's game state.

**Size:** ~128 bytes
**PDA Seeds:** `["miner", user_pubkey]`
**Address:** User-specific PDA

```rust
pub struct Miner {
    pub authority: Pubkey,       // Owner of this miner account
    pub round: u64,              // Round this state applies to
    pub block: u8,               // Chosen block (0-24)
    pub deployed: u64,           // SOL deployed this round (lamports)
    pub ore_rewards: u64,        // Unclaimed ORE rewards (grams)
    pub sol_rewards: u64,        // Unclaimed SOL rewards (lamports)
    pub _padding: [u8; 7],       // Alignment padding
}
```

**Lifecycle:**
- Created on first deploy
- Updated each round
- Checkpointed to preserve rewards

---

### Round

Tracks game state for a specific round.

**Size:** ~1024 bytes
**PDA Seeds:** `["round", round_number]`
**Address:** Round-specific PDA

```rust
pub struct Round {
    pub number: u64,             // Round number
    pub total_deployed: u64,     // Total SOL deployed (lamports)
    pub winning_block: u8,       // Winning block (255 = TBD)
    pub ore_supply: u64,         // ORE minted this round (grams)
    pub motherlode_pool: u64,    // Accumulated motherlode (grams)
    pub block_data: [BlockData; 25], // Per-block stats
    pub _padding: [u8; 7],
}

pub struct BlockData {
    pub total_deployed: u64,     // SOL deployed on this block
    pub miner_count: u32,        // Number of miners on block
    pub _padding: [u8; 4],
}
```

**State Transitions:**
- Created at round start
- Updated during deploy operations
- Finalized at reset with winning block selection

---

### Stake

Manages user staking positions.

**Size:** ~96 bytes
**PDA Seeds:** `["stake", user_pubkey]`
**Address:** User-specific PDA

```rust
pub struct Stake {
    pub authority: Pubkey,       // Owner of stake account
    pub balance: u64,            // Staked ORE balance (grams)
    pub last_claim_at: i64,      // Timestamp of last yield claim
    pub total_yield_claimed: u64,// Lifetime yield claimed (grams)
    pub _padding: [u8; 8],
}
```

**Yield Mechanics:**
- Yield accrues over time based on stake amount
- Proportional to total staked supply
- Funded by 10% of buyback ORE

---

### Treasury

Manages protocol token operations.

**Size:** ~256 bytes
**PDA Seeds:** `["treasury"]`
**Address:** Deterministic PDA

```rust
pub struct Treasury {
    pub admin: Pubkey,           // Admin authority
    pub mint: Pubkey,            // ORE mint address
    pub total_minted: u64,       // Lifetime ORE minted (grams)
    pub total_burned: u64,       // Lifetime ORE burned (grams)
    pub revenue_balance: u64,    // SOL revenue collected (lamports)
    pub yield_balance: u64,      // ORE available for yield (grams)
    pub _padding: [u8; 32],
}
```

**Responsibilities:**
- Mint authority for ORE token
- Holds protocol SOL revenue
- Manages buyback operations
- Distributes staking yield

---

### Automation

Tracks automation configuration for a miner.

**Size:** ~128 bytes
**PDA Seeds:** `["automation", user_pubkey]`
**Address:** User-specific PDA

```rust
pub struct Automation {
    pub authority: Pubkey,       // Owner
    pub amount: u64,             // Amount to deploy per round
    pub deposit: u64,            // SOL deposit for fees
    pub strategy: u8,            // Automation strategy
    pub mask: u64,               // Block selection bitmask
    pub _padding: [u8; 7],
}
```

---

### Config

Global program configuration.

**Size:** ~128 bytes
**PDA Seeds:** `["config"]`
**Address:** Deterministic PDA

```rust
pub struct Config {
    pub admin: Pubkey,           // Admin authority
    pub fee_collector: Pubkey,   // Fee collection address
    pub fee_rate: u64,           // Fee rate in basis points
    pub _padding: [u8; 32],
}
```

---

### Seeker

Tracks Seeker genesis token claims.

**Size:** ~64 bytes
**PDA Seeds:** `["seeker", user_pubkey]`
**Address:** User-specific PDA

```rust
pub struct Seeker {
    pub authority: Pubkey,       // Owner
    pub claimed: bool,           // Has claimed
    pub _padding: [u8; 7],
}
```

---

## Constants

### Token Constants

```rust
pub const TOKEN_DECIMALS: u8 = 11;
pub const ONE_ORE: u64 = 100_000_000_000; // 10^11 grams
pub const MAX_SUPPLY: u64 = 5_000_000 * ONE_ORE;
```

### Timing Constants

```rust
// Time in seconds
pub const ONE_MINUTE: i64 = 60;
pub const ONE_HOUR: i64 = 3_600;
pub const ONE_DAY: i64 = 86_400;
pub const ONE_WEEK: i64 = 604_800;

// Time in slots (~400ms per slot, 150 slots/minute)
pub const ONE_MINUTE_SLOTS: u64 = 150;
pub const ONE_HOUR_SLOTS: u64 = 9_000;
pub const ONE_DAY_SLOTS: u64 = 216_000;
pub const ONE_WEEK_SLOTS: u64 = 1_512_000;
pub const INTERMISSION_SLOTS: u64 = 35;
```

### Addresses

```rust
pub const ADMIN_ADDRESS: Pubkey =
    pubkey!("HBUh9g46wk2X89CvaNN15UmsznP59rh6od1h8JwYAopk");

pub const MINT_ADDRESS: Pubkey =
    pubkey!("oreoU2P8bN6jkk3jbaiVxYnG1dCXcYxwhwyK9jSybcp");

pub const SOL_MINT: Pubkey =
    pubkey!("So11111111111111111111111111111111111111112");

pub const SPLIT_ADDRESS: Pubkey =
    pubkey!("SpLiT11111111111111111111111111111111111112");
```

### PDA Seeds

```rust
pub const AUTOMATION: &[u8] = b"automation";
pub const BOARD: &[u8] = b"board";
pub const CONFIG: &[u8] = b"config";
pub const MINER: &[u8] = b"miner";
pub const SEEKER: &[u8] = b"seeker";
pub const STAKE: &[u8] = b"stake";
pub const ROUND: &[u8] = b"round";
pub const TREASURY: &[u8] = b"treasury";
```

### Fee Constants

```rust
pub const DENOMINATOR_BPS: u64 = 10_000; // Basis points denominator
```

---

## Errors

```rust
pub enum OreError {
    #[error("Amount too small")]
    AmountTooSmall = 0,

    #[error("Not authorized")]
    NotAuthorized = 1,
}
```

**Usage:**
```rust
require!(amount >= MIN_AMOUNT, OreError::AmountTooSmall);
require!(signer == &ADMIN_ADDRESS, OreError::NotAuthorized);
```

---

## SDK Functions

The SDK module (`api/src/sdk.rs`) provides helper functions for instruction building and PDA derivation.

### PDA Derivation

```rust
// Get miner PDA for a user
pub fn miner_pda(authority: Pubkey) -> (Pubkey, u8) {
    Pubkey::find_program_address(
        &[MINER, authority.as_ref()],
        &crate::ID,
    )
}

// Get stake PDA for a user
pub fn stake_pda(authority: Pubkey) -> (Pubkey, u8) {
    Pubkey::find_program_address(
        &[STAKE, authority.as_ref()],
        &crate::ID,
    )
}

// Get round PDA for a round number
pub fn round_pda(round: u64) -> (Pubkey, u8) {
    Pubkey::find_program_address(
        &[ROUND, &round.to_le_bytes()],
        &crate::ID,
    )
}

// Get automation PDA for a user
pub fn automation_pda(authority: Pubkey) -> (Pubkey, u8) {
    Pubkey::find_program_address(
        &[AUTOMATION, authority.as_ref()],
        &crate::ID,
    )
}
```

### Instruction Builders

```rust
// Build a Deploy instruction
pub fn deploy(
    user: Pubkey,
    amount: u64,
    squares: [u8; 4],
) -> Instruction {
    let (miner, _) = miner_pda(user);
    // ... construct instruction
}

// Build a Deposit instruction
pub fn deposit(
    user: Pubkey,
    amount: u64,
) -> Instruction {
    let (stake, _) = stake_pda(user);
    // ... construct instruction
}
```

---

## Events

Events are emitted for off-chain indexing and monitoring.

```rust
pub struct DeployEvent {
    pub user: Pubkey,
    pub amount: u64,
    pub block: u8,
    pub round: u64,
}

pub struct ResetEvent {
    pub round: u64,
    pub winning_block: u8,
    pub motherlode_hit: bool,
    pub total_deployed: u64,
}

pub struct ClaimEvent {
    pub user: Pubkey,
    pub ore_amount: u64,
    pub sol_amount: u64,
}
```

---

## Usage Examples

### Deploying SOL

```rust
use ore_api::prelude::*;

let user = /* user pubkey */;
let amount = 100_000_000; // 0.1 SOL in lamports
let squares = [5, 0, 0, 0]; // Block 5

let ix = sdk::deploy(user, amount, squares);
// Send transaction with ix
```

### Staking ORE

```rust
use ore_api::prelude::*;

let user = /* user pubkey */;
let amount = 10 * ONE_ORE; // 10 ORE

let ix = sdk::deposit(user, amount);
// Send transaction with ix
```

### Claiming Rewards

```rust
use ore_api::prelude::*;

let user = /* user pubkey */;

let claim_ore_ix = sdk::claim_ore(user);
let claim_sol_ix = sdk::claim_sol(user);
// Send transactions with instructions
```

---

## Additional Resources

- **Source Code**: [api/src/](../api/src/)
- **Program Implementation**: [program/src/](../program/src/)
- **Architecture Guide**: [ARCHITECTURE.md](ARCHITECTURE.md)
- **Development Guide**: [DEVELOPMENT.md](DEVELOPMENT.md)
