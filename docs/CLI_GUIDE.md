# ORE CLI Usage Guide

Complete guide for using the ORE command-line interface to interact with the ORE mining protocol.

## Table of Contents

- [Installation](#installation)
- [Configuration](#configuration)
- [Commands](#commands)
  - [Mining Commands](#mining-commands)
  - [Staking Commands](#staking-commands)
  - [Info Commands](#info-commands)
- [Automation](#automation)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## Installation

### Prerequisites

- Rust 1.82.0 or later
- Solana CLI tools
- A Solana wallet with SOL for transactions

### Build from Source

```bash
# Clone the repository
git clone https://github.com/regolith-labs/ore
cd ore-alt-client

# Build the CLI
cargo build --release --bin ore-cli

# The binary will be at: target/release/ore-cli
```

### Add to PATH (Optional)

```bash
# Linux/macOS
export PATH="$PATH:$(pwd)/target/release"

# Or copy to a directory in your PATH
sudo cp target/release/ore-cli /usr/local/bin/
```

## Configuration

### Setting Up Your Wallet

The CLI uses your default Solana CLI wallet configuration:

```bash
# Check your current wallet
solana address

# Generate a new wallet if needed
solana-keygen new -o ~/.config/solana/id.json

# Set the wallet as default
solana config set --keypair ~/.config/solana/id.json
```

### Setting RPC Endpoint

```bash
# Use mainnet-beta
solana config set --url https://api.mainnet-beta.solana.com

# Or use a custom RPC endpoint
solana config set --url https://your-rpc-endpoint.com
```

### Verify Configuration

```bash
# Check Solana configuration
solana config get

# Check SOL balance
solana balance
```

## Commands

### Mining Commands

#### Deploy SOL

Deploy SOL to claim space on the mining board.

```bash
ore-cli deploy [OPTIONS]

Options:
  -a, --amount <AMOUNT>      Amount of SOL to deploy (in SOL, e.g., 0.1)
  -b, --block <BLOCK>        Target block number (0-24)
  -k, --keypair <PATH>       Path to wallet keypair [default: ~/.config/solana/id.json]
  -u, --url <URL>            RPC endpoint URL
  -h, --help                 Print help
```

**Example:**
```bash
# Deploy 0.1 SOL to block 5
ore-cli deploy --amount 0.1 --block 5

# Deploy with custom keypair
ore-cli deploy -a 0.5 -b 12 -k ~/my-wallet.json
```

**Notes:**
- Block numbers range from 0-24 (5x5 grid)
- Minimum deployment amount applies
- 1% admin fee is collected

---

#### Checkpoint Rewards

Checkpoint rewards from a previous round to prevent expiration.

```bash
ore-cli checkpoint [OPTIONS]

Options:
  -k, --keypair <PATH>       Path to wallet keypair
  -u, --url <URL>            RPC endpoint URL
  -h, --help                 Print help
```

**Example:**
```bash
# Checkpoint your rewards
ore-cli checkpoint

# With custom RPC
ore-cli checkpoint -u https://your-rpc.com
```

**When to Use:**
- When a new round starts and you have unclaimed rewards
- Before ONE_WEEK (604,800 seconds) after round end
- Prevents reward expiration

---

#### Claim ORE Rewards

Claim your ORE mining rewards.

```bash
ore-cli claim-ore [OPTIONS]

Options:
  -k, --keypair <PATH>       Path to wallet keypair
  -u, --url <URL>            RPC endpoint URL
  -h, --help                 Print help
```

**Example:**
```bash
# Claim ORE rewards
ore-cli claim-ore

# Claim with specific wallet
ore-cli claim-ore -k ~/mining-wallet.json
```

**Notes:**
- 10% refining fee is applied
- Fee is redistributed to other miners with unclaimed rewards
- Longer holding = more refined ORE

---

#### Claim SOL Rewards

Claim your SOL mining rewards.

```bash
ore-cli claim-sol [OPTIONS]

Options:
  -k, --keypair <PATH>       Path to wallet keypair
  -u, --url <URL>            RPC endpoint URL
  -h, --help                 Print help
```

**Example:**
```bash
# Claim SOL rewards
ore-cli claim-sol
```

**Notes:**
- No fees on SOL claims
- SOL rewards come from losing blocks

---

#### Reset Board

Reset the board to start a new mining round.

```bash
ore-cli reset [OPTIONS]

Options:
  -k, --keypair <PATH>       Path to wallet keypair
  -u, --url <URL>            RPC endpoint URL
  -h, --help                 Print help
```

**Example:**
```bash
# Reset the board for a new round
ore-cli reset
```

**Notes:**
- Can only be called after round duration elapses
- Selects winning block via on-chain randomness
- Anyone can call this (gas paid by caller)
- May hit motherlode (escalating chance: round 0 = 1/625, round 100 = 101/625, capped at 50% after round 311)

---

### Staking Commands

#### Deposit ORE

Stake ORE tokens to earn yield.

```bash
ore-cli deposit [OPTIONS]

Options:
  -a, --amount <AMOUNT>      Amount of ORE to stake (in ORE, e.g., 10)
  -k, --keypair <PATH>       Path to wallet keypair
  -u, --url <URL>            RPC endpoint URL
  -h, --help                 Print help
```

**Example:**
```bash
# Stake 10 ORE
ore-cli deposit --amount 10

# Stake 0.5 ORE
ore-cli deposit -a 0.5
```

**Notes:**
- ORE must be in your wallet's token account
- Staking begins earning yield immediately
- No lockup period

---

#### Withdraw ORE

Unstake ORE tokens from your stake account.

```bash
ore-cli withdraw [OPTIONS]

Options:
  -a, --amount <AMOUNT>      Amount of ORE to withdraw (in ORE)
  -k, --keypair <PATH>       Path to wallet keypair
  -u, --url <URL>            RPC endpoint URL
  -h, --help                 Print help
```

**Example:**
```bash
# Withdraw 5 ORE
ore-cli withdraw --amount 5

# Withdraw all staked ORE (use your staked balance)
ore-cli withdraw -a 10
```

**Notes:**
- Can only withdraw up to staked balance
- No penalties for withdrawal
- Claim yield before withdrawing to maximize returns

---

#### Claim Staking Yield

Claim your staking yield rewards.

```bash
ore-cli claim-yield [OPTIONS]

Options:
  -a, --amount <AMOUNT>      Amount of yield to claim (optional, defaults to all)
  -k, --keypair <PATH>       Path to wallet keypair
  -u, --url <URL>            RPC endpoint URL
  -h, --help                 Print help
```

**Example:**
```bash
# Claim all available yield
ore-cli claim-yield

# Claim specific amount
ore-cli claim-yield --amount 1.5
```

**Yield Calculation:**
- Based on your stake size and duration
- Funded by 10% of protocol buyback ORE
- Proportional to total staked supply

---

### Info Commands

#### View Balance

Check your ORE token balance.

```bash
ore-cli balance [OPTIONS]

Options:
  -k, --keypair <PATH>       Path to wallet keypair
  -u, --url <URL>            RPC endpoint URL
  -h, --help                 Print help
```

**Example:**
```bash
# Check ORE balance
ore-cli balance
```

---

#### View Miner Info

Display your miner account information.

```bash
ore-cli miner [OPTIONS]

Options:
  -k, --keypair <PATH>       Path to wallet keypair
  -u, --url <URL>            RPC endpoint URL
  -h, --help                 Print help
```

**Example:**
```bash
# View miner stats
ore-cli miner
```

**Output:**
- Current round
- Deployed SOL amount
- Chosen block
- Unclaimed ORE rewards
- Unclaimed SOL rewards

---

#### View Stake Info

Display your stake account information.

```bash
ore-cli stake [OPTIONS]

Options:
  -k, --keypair <PATH>       Path to wallet keypair
  -u, --url <URL>            RPC endpoint URL
  -h, --help                 Print help
```

**Example:**
```bash
# View stake stats
ore-cli stake
```

**Output:**
- Staked balance
- Available yield
- Last claim timestamp
- Total yield claimed

---

#### View Board Info

Display current board and round information.

```bash
ore-cli board [OPTIONS]

Options:
  -u, --url <URL>            RPC endpoint URL
  -h, --help                 Print help
```

**Example:**
```bash
# View board state
ore-cli board
```

**Output:**
- Current round number
- Round start time
- Time until round end
- Total SOL deployed
- Winning block (if determined)

---

#### View Round Info

Display information for a specific round.

```bash
ore-cli round [OPTIONS] <ROUND_NUMBER>

Arguments:
  <ROUND_NUMBER>             Round number to query

Options:
  -u, --url <URL>            RPC endpoint URL
  -h, --help                 Print help
```

**Example:**
```bash
# View round 42 info
ore-cli round 42
```

**Output:**
- Round number
- Total deployed SOL
- Winning block
- ORE minted
- Motherlode pool
- Per-block statistics

---

## Automation

Configure automated mining to deploy SOL every round.

### Setup Automation

```bash
ore-cli automate [OPTIONS]

Options:
  -a, --amount <AMOUNT>      Amount to deploy per round (in SOL)
  -d, --deposit <DEPOSIT>    SOL deposit for automation fees
  -s, --strategy <STRATEGY>  Strategy: random, priority, or custom
  -m, --mask <MASK>          Block selection bitmask (for custom strategy)
  -k, --keypair <PATH>       Path to wallet keypair
  -u, --url <URL>            RPC endpoint URL
  -h, --help                 Print help
```

**Example:**
```bash
# Auto-deploy 0.1 SOL per round with random strategy
ore-cli automate --amount 0.1 --deposit 0.01 --strategy random

# Custom strategy with block mask
ore-cli automate -a 0.2 -d 0.02 -s custom -m 0x1F
```

**Strategies:**
- `random`: Randomly select block each round
- `priority`: Prioritize less-crowded blocks
- `custom`: Use bitmask to select from specific blocks

**Automation Fees:**
- 0.000005 SOL per automated transaction
- Deposit covers multiple rounds
- Refillable deposit account

---

### View Automation Status

```bash
ore-cli automation [OPTIONS]

Options:
  -k, --keypair <PATH>       Path to wallet keypair
  -u, --url <URL>            RPC endpoint URL
  -h, --help                 Print help
```

**Example:**
```bash
# Check automation config
ore-cli automation
```

---

### Disable Automation

```bash
ore-cli disable-automation [OPTIONS]

Options:
  -k, --keypair <PATH>       Path to wallet keypair
  -u, --url <URL>            RPC endpoint URL
  -h, --help                 Print help
```

**Example:**
```bash
# Disable automation
ore-cli disable-automation
```

---

## Best Practices

### Mining Tips

1. **Check Round Timing**: Use `ore-cli board` to check time remaining in round
2. **Monitor Gas**: Solana transactions cost ~0.000005 SOL in fees
3. **Checkpoint Regularly**: Don't let rewards expire after round end
4. **Diversify Blocks**: Don't put all SOL on one block
5. **Claim Strategically**: Hold ORE rewards longer for more refining bonus

### Staking Tips

1. **Claim Yield Regularly**: Compound your returns by claiming and restaking
2. **Monitor APY**: Yield varies based on protocol revenue and total staked
3. **Long-term Hold**: Staking rewards long-term holders most
4. **Check Balance**: Use `ore-cli stake` to track your position

### Security

1. **Protect Your Keypair**: Never share your private key
2. **Use Hardware Wallets**: For large amounts, use Ledger/Trezor
3. **Verify Addresses**: Double-check program and token addresses
4. **Test with Small Amounts**: Start small to learn the system
5. **Backup Your Wallet**: Keep encrypted backups of keypairs

### Gas Optimization

1. **Batch Claims**: Claim ORE and SOL together when possible
2. **Use Automation**: Reduces manual transaction overhead
3. **Off-Peak Times**: Lower congestion = lower priority fees (if using)

---

## Troubleshooting

### Common Errors

#### "Insufficient funds"

**Cause**: Not enough SOL in wallet for transaction
**Solution**: Add SOL to your wallet:
```bash
solana balance  # Check current balance
# Add SOL from exchange or faucet (devnet)
```

---

#### "Amount too small"

**Cause**: Deployment amount below minimum
**Solution**: Increase deployment amount:
```bash
ore-cli deploy --amount 0.1 --block 5  # Use at least 0.1 SOL
```

---

#### "Stale miner account"

**Cause**: Miner account is from old round and needs checkpointing
**Solution**: Checkpoint your rewards:
```bash
ore-cli checkpoint
```

---

#### "Round already ended"

**Cause**: Trying to deploy after round end
**Solution**: Wait for new round or reset the board:
```bash
ore-cli reset  # Start new round
ore-cli board  # Check round status
```

---

#### "No token account found"

**Cause**: You don't have an ORE token account
**Solution**: Create one (usually automatic) or claim ORE:
```bash
ore-cli claim-ore  # Creates token account if needed
```

---

### RPC Issues

If you're experiencing RPC errors:

```bash
# Use a different RPC endpoint
ore-cli deploy -a 0.1 -b 5 -u https://api.mainnet-beta.solana.com

# Or configure globally
solana config set --url https://your-preferred-rpc.com
```

**Recommended RPC Providers:**
- Solana public RPC (rate limited)
- Helius
- QuickNode
- Triton
- GenesysGo

---

### Getting Help

```bash
# View help for any command
ore-cli --help
ore-cli deploy --help
ore-cli stake --help

# Check version
ore-cli --version
```

---

## Advanced Usage

### Using Custom Keypairs

```bash
# Generate a dedicated mining wallet
solana-keygen new -o ~/ore-mining-wallet.json

# Use it with CLI
ore-cli deploy -a 0.1 -b 5 -k ~/ore-mining-wallet.json
```

### Scripting

Create a bash script for automated operations:

```bash
#!/bin/bash
# mine.sh - Automated mining script

KEYPAIR=~/ore-mining-wallet.json
RPC=https://your-rpc.com

# Check if round ended
ore-cli board -u $RPC | grep "Round ended" && {
    echo "Resetting board..."
    ore-cli reset -k $KEYPAIR -u $RPC
}

# Deploy to random block
BLOCK=$((RANDOM % 25))
echo "Deploying to block $BLOCK"
ore-cli deploy -a 0.1 -b $BLOCK -k $KEYPAIR -u $RPC

# Checkpoint rewards
ore-cli checkpoint -k $KEYPAIR -u $RPC

# Claim if rewards available
ore-cli claim-ore -k $KEYPAIR -u $RPC
ore-cli claim-sol -k $KEYPAIR -u $RPC
```

**Run with cron:**
```bash
# Run every hour
0 * * * * /path/to/mine.sh >> /var/log/ore-mining.log 2>&1
```

---

## CLI Configuration File

Create a config file for default settings:

```bash
# ~/.ore/config.toml
[default]
keypair = "/home/user/.config/solana/id.json"
rpc_url = "https://api.mainnet-beta.solana.com"
auto_confirm = false

[mining]
default_amount = "0.1"
default_strategy = "random"

[staking]
auto_claim_yield = true
min_yield_claim = "0.1"
```

---

## Examples

### Complete Mining Workflow

```bash
# 1. Check board status
ore-cli board

# 2. Deploy SOL to block 10
ore-cli deploy --amount 0.5 --block 10

# 3. Wait for round to end...

# 4. Reset board (if round ended)
ore-cli reset

# 5. Checkpoint rewards
ore-cli checkpoint

# 6. Check miner status
ore-cli miner

# 7. Claim rewards
ore-cli claim-ore
ore-cli claim-sol

# 8. Check new balance
ore-cli balance
```

### Complete Staking Workflow

```bash
# 1. Check current balance
ore-cli balance

# 2. Stake 10 ORE
ore-cli deposit --amount 10

# 3. Check stake status
ore-cli stake

# 4. Wait for yield to accrue...

# 5. Claim yield
ore-cli claim-yield

# 6. Optionally restake
ore-cli deposit --amount 0.5

# 7. Withdraw if needed
ore-cli withdraw --amount 5
```

---

## Additional Resources

- **Architecture Guide**: [ARCHITECTURE.md](ARCHITECTURE.md)
- **API Reference**: [API.md](API.md)
- **Development Guide**: [DEVELOPMENT.md](DEVELOPMENT.md)
- **Game Rules**: [../game-rules.md](../game-rules.md)

---

**Happy Mining! ⛏️**
