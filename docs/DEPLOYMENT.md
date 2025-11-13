# Deployment Guide

This guide covers deploying the ORE mining protocol to Solana networks (devnet, testnet, and mainnet).

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Pre-Deployment Checklist](#pre-deployment-checklist)
3. [Building the Program](#building-the-program)
4. [Local Testing](#local-testing)
5. [Deploying to Devnet](#deploying-to-devnet)
6. [Deploying to Mainnet](#deploying-to-mainnet)
7. [Post-Deployment Setup](#post-deployment-setup)
8. [Security Considerations](#security-considerations)
9. [Monitoring and Maintenance](#monitoring-and-maintenance)
10. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

- **Rust 1.82.0** (specified in `rust-toolchain.toml`)
- **Solana CLI 2.1+**
- **Anchor CLI** (optional, but recommended)
- **Git**
- **Node.js 18+** (for frontend deployment)

### Installation

```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Install Solana CLI
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"

# Verify installations
rustc --version
solana --version
```

### Wallet Setup

```bash
# Generate a new keypair for deployment (or use existing)
solana-keygen new -o ~/deploy-keypair.json

# Check wallet address
solana address -k ~/deploy-keypair.json

# Configure Solana CLI to use your keypair
solana config set --keypair ~/deploy-keypair.json
```

### Fund Your Wallet

**For Devnet:**
```bash
solana config set --url https://api.devnet.solana.com
solana airdrop 2
```

**For Mainnet:**
```bash
# You'll need to acquire SOL through an exchange
# Deploying a program typically requires ~5-10 SOL
```

---

## Pre-Deployment Checklist

Before deploying, ensure you've completed these steps:

- [ ] **Code Review**: All code has been reviewed and audited
- [ ] **Tests Pass**: Run `cargo test-sbf` successfully
- [ ] **Coverage**: Run `cargo llvm-cov` and verify adequate coverage
- [ ] **Security Audit**: External security audit completed (for mainnet)
- [ ] **Constants Verified**: Check all values in `api/src/consts.rs`
  - [ ] `ADMIN_ADDRESS` is correct
  - [ ] `MAX_SUPPLY` is set to desired value (currently 10M ORE)
  - [ ] `TOKEN_DECIMALS` is 11
- [ ] **Program ID**: Decide if using vanity address or generated ID
- [ ] **RPC Provider**: Selected and configured (see [ENV_SETUP.md](../ENV_SETUP.md))
- [ ] **Backup Plan**: Recovery procedures documented
- [ ] **Monitoring**: Setup monitoring and alerting infrastructure

---

## Building the Program

### 1. Clone and Setup

```bash
# Clone the repository
git clone https://github.com/your-org/ore-alt-client.git
cd ore-alt-client

# Verify Rust toolchain
rustup show

# Install dependencies
cargo build
```

### 2. Build for Deployment

```bash
# Build the Solana BPF program
cargo build-sbf

# Output will be in: target/deploy/ore.so
# Program keypair: target/deploy/ore-keypair.json
```

### 3. Verify Build

```bash
# Check program size (should be under 1MB ideally)
ls -lh target/deploy/ore.so

# Verify program keypair
solana address -k target/deploy/ore-keypair.json
```

### 4. Generate Vanity Address (Optional)

If you want a specific program ID:

```bash
# Install solana-keygen-vanity
cargo install solana-keygen

# Generate vanity address (this can take a while)
solana-keygen grind --starts-with ore:1

# Replace the generated keypair
cp <generated-keypair>.json target/deploy/ore-keypair.json

# Update program ID in code
# Edit api/src/lib.rs with new program ID
```

⚠️ **Important**: If you change the program ID, you must rebuild:
```bash
cargo clean
cargo build-sbf
```

---

## Local Testing

### 1. Start Local Validator

```bash
# Use the provided script (clones mainnet accounts)
./localnet.sh

# Or start manually
solana-test-validator -r \
  --bpf-program oreV3EG1i9BEgiAJ8b177Z2S2rMarzak4NMv1kULvWv target/deploy/ore.so \
  --clone oreoU2P8bN6jkk3jbaiVxYnG1dCXcYxwhwyK9jSybcp
```

### 2. Configure CLI for Localhost

```bash
solana config set --url http://localhost:8899
```

### 3. Deploy Locally

```bash
# Deploy the program
solana program deploy target/deploy/ore.so

# Verify deployment
solana program show <PROGRAM_ID>
```

### 4. Initialize Protocol

```bash
# Using the CLI (build first)
cd cli
cargo run -- initialize

# Or use custom scripts
```

### 5. Test Functionality

```bash
# Run integration tests
cargo test-sbf

# Manual testing via CLI
cd cli
cargo run -- deploy 0.01  # Deploy SOL to a square
cargo run -- status       # Check miner status
```

---

## Deploying to Devnet

### 1. Configure for Devnet

```bash
# Set network to devnet
solana config set --url https://api.devnet.solana.com

# Verify configuration
solana config get

# Check balance (need at least 5 SOL)
solana balance
```

### 2. Deploy Program

```bash
# Deploy the program
solana program deploy target/deploy/ore.so \
  --keypair ~/deploy-keypair.json \
  --program-id target/deploy/ore-keypair.json

# Output will show:
# Program Id: <YOUR_PROGRAM_ID>
```

### 3. Verify Deployment

```bash
# Check program info
solana program show <PROGRAM_ID>

# Expected output:
# Program Id: <PROGRAM_ID>
# Owner: BPFLoaderUpgradeab1e11111111111111111111111
# ProgramData Address: <DATA_ADDRESS>
# Authority: <YOUR_WALLET>
# Last Deployed In Slot: <SLOT>
# Data Length: <SIZE> bytes
```

### 4. Initialize Protocol Accounts

```bash
# Create token mint (if not using existing)
spl-token create-token --decimals 11

# Create necessary PDAs and initialize state
# This depends on your initialization logic
```

### 5. Test on Devnet

```bash
# Update .env to point to devnet
# Run frontend and test all features
npm run dev

# Test mining operations
cd cli
cargo run -- deploy 0.01
```

---

## Deploying to Mainnet

⚠️ **WARNING**: Mainnet deployment is permanent and involves real funds. Proceed with extreme caution.

### 1. Final Pre-Deployment Checks

- [ ] **Security Audit**: External audit completed and issues resolved
- [ ] **Insurance**: Consider getting smart contract insurance
- [ ] **Bug Bounty**: Setup bug bounty program
- [ ] **Multisig**: Use multisig wallet for program authority
- [ ] **Testing**: Extensive testing on devnet completed
- [ ] **Documentation**: All documentation is complete and accurate
- [ ] **Legal**: Legal review completed (if applicable)

### 2. Configure for Mainnet

```bash
# Set network to mainnet
solana config set --url https://api.mainnet-beta.solana.com

# Use premium RPC for better reliability
solana config set --url https://your-premium-rpc.com

# Verify configuration
solana config get

# Check balance (need 5-10 SOL for deployment)
solana balance
```

### 3. Deploy Program

```bash
# FINAL CHECK: Review all code one more time
git diff HEAD~1

# Deploy the program
solana program deploy target/deploy/ore.so \
  --keypair ~/deploy-keypair.json \
  --program-id target/deploy/ore-keypair.json \
  --max-sign-attempts 100

# Save deployment details
echo "Program ID: $(solana address -k target/deploy/ore-keypair.json)" > deployment.txt
echo "Deploy Time: $(date)" >> deployment.txt
echo "Git Commit: $(git rev-parse HEAD)" >> deployment.txt
```

### 4. Set Program Authority

**Option A: Transfer to Multisig (Recommended)**

```bash
# Create Squads multisig (recommended)
# Visit: https://squads.so/

# Transfer upgrade authority
solana program set-upgrade-authority <PROGRAM_ID> \
  --new-upgrade-authority <MULTISIG_ADDRESS>
```

**Option B: Make Immutable**

```bash
# Make program immutable (cannot be upgraded)
solana program set-upgrade-authority <PROGRAM_ID> --final

# ⚠️ WARNING: This is irreversible!
```

### 5. Verify Mainnet Deployment

```bash
# Check program
solana program show <PROGRAM_ID>

# Verify authority
solana program show <PROGRAM_ID> | grep "Authority"

# Check on explorer
# https://explorer.solana.com/address/<PROGRAM_ID>
```

---

## Post-Deployment Setup

### 1. Initialize Protocol State

```bash
# Initialize board, treasury, config accounts
# This depends on your initialization instruction

# Example using CLI:
./cli initialize --admin <ADMIN_PUBKEY>
```

### 2. Create Token Mint (if needed)

If deploying fresh (not forking existing ORE):

```bash
# Create mint with 11 decimals
spl-token create-token --decimals 11

# Create mint authority as PDA
# Set mint authority to treasury PDA
spl-token authorize <MINT_ADDRESS> mint <TREASURY_PDA>
```

### 3. Initialize Treasury

```bash
# Fund treasury with initial SOL if needed
solana transfer <TREASURY_ADDRESS> 1.0

# Create associated token account for treasury
spl-token create-account <MINT_ADDRESS> --owner <TREASURY_ADDRESS>
```

### 4. Create Initial Round

```bash
# Create round 0 account
# This may be automatic on first interaction
```

### 5. Configure Fee Collector

```bash
# Set fee collector address in config
# This should be done via admin instruction
```

### 6. Verify All PDAs

```bash
# Check board PDA
solana account <BOARD_ADDRESS>

# Check treasury PDA
solana account <TREASURY_ADDRESS>

# Check config PDA
solana account <CONFIG_ADDRESS>
```

---

## Security Considerations

### Smart Contract Security

1. **Immutability vs Upgradeability**
   - Immutable: Cannot fix bugs, but trustless
   - Upgradeable: Can fix bugs, but requires trust in authority
   - Recommendation: Use multisig for upgrade authority

2. **Admin Key Management**
   - Use hardware wallet (Ledger) for admin keys
   - Never store private keys in plain text
   - Use multisig wallets (Squads Protocol)
   - Implement timelocks for critical operations

3. **Access Controls**
   - Verify `ADMIN_ADDRESS` is correct
   - Restrict admin functions to authorized accounts
   - Use role-based access control

4. **Economic Security**
   - Monitor treasury balance
   - Set rate limits on minting
   - Implement emergency pause if needed

### Operational Security

1. **RPC Security**
   - Use dedicated RPC nodes
   - Implement rate limiting
   - Monitor for unusual activity
   - Have backup RPC providers

2. **Monitoring**
   - Set up alerts for:
     - Program upgrades
     - Large transactions
     - Treasury balance changes
     - Unusual activity patterns
   - Use services like:
     - OtterSec Monitor
     - Forta Network
     - Custom scripts

3. **Incident Response**
   - Document emergency procedures
   - Have pause functionality ready
   - Maintain communication channels
   - Keep legal counsel on standby

### Known Vulnerabilities

**See the RNG exploit analysis** provided separately. Key issues:

1. **Pre-calculation Attack**: Slot hash is knowable before reset
   - Mitigation: Use future slot hash or VRF
2. **MEV/Front-running**: Transaction ordering manipulation
   - Mitigation: Implement time-locks or randomness delays
3. **Selective Checkpointing**: Users only checkpoint when profitable
   - Mitigation: Automatic checkpointing or incentives

---

## Monitoring and Maintenance

### Essential Monitoring

```bash
# Monitor program account
solana account <PROGRAM_ID> --output json

# Monitor treasury balance
solana balance <TREASURY_ADDRESS>

# Check recent transactions
solana transaction-history <PROGRAM_ID>
```

### Automated Monitoring Script

```bash
#!/bin/bash
# monitor.sh

PROGRAM_ID="your_program_id"
TREASURY="your_treasury_address"
WEBHOOK_URL="your_discord_or_slack_webhook"

while true; do
  # Check treasury balance
  BALANCE=$(solana balance $TREASURY --output json | jq -r '.value')

  if [ $BALANCE -lt 1000000000 ]; then  # < 1 SOL
    curl -X POST $WEBHOOK_URL \
      -H 'Content-Type: application/json' \
      -d "{\"content\": \"⚠️ Treasury balance low: $BALANCE\"}"
  fi

  sleep 300  # Check every 5 minutes
done
```

### Metrics to Track

- **Treasury Balance**: SOL and ORE amounts
- **Total Supply**: Current circulating supply
- **Active Miners**: Number of active participants
- **Round Statistics**: Deployments, winners, motherlode hits
- **Transaction Volume**: Transactions per round
- **Gas Costs**: Average transaction costs
- **Error Rates**: Failed transactions

### Logs

```bash
# View program logs
solana logs <PROGRAM_ID>

# Save logs to file
solana logs <PROGRAM_ID> > program.log 2>&1
```

### Regular Maintenance

**Weekly:**
- Review transaction patterns
- Check for unusual activity
- Verify treasury balances
- Review error logs

**Monthly:**
- Security review
- Performance analysis
- Cost analysis (RPC, compute units)
- Update documentation

**Quarterly:**
- External security audit
- Disaster recovery drill
- Infrastructure review
- Community feedback review

---

## Troubleshooting

### Common Deployment Issues

**Issue: "Insufficient funds for deployment"**
```bash
# Solution: Fund wallet
solana airdrop 2  # Devnet only
# Or transfer SOL from exchange for mainnet
```

**Issue: "Program account already in use"**
```bash
# Solution: Use a new keypair or close existing
solana program close <PROGRAM_ID> --bypass-warning
```

**Issue: "Program too large"**
```bash
# Solution: Optimize build
cargo build-sbf --release
# Or split into multiple programs
```

**Issue: "Transaction simulation failed"**
```bash
# Solution: Increase compute units
# Add compute budget instruction to transaction

# Or check account sizes
solana program show <PROGRAM_ID>
```

### Common Runtime Issues

**Issue: "Slot hash unavailable"**
- Reset must be called within 2.5 minutes of round end
- Solution: Automate reset calls with bots

**Issue: "Round account not found"**
- Round accounts may be closed after expiry
- Solution: Check round exists before checkpoint

**Issue: "Insufficient rewards for rent"**
- Account balance below rent-exempt minimum
- Solution: Fund account before operations

### Debugging Tools

```bash
# Simulate transaction locally
solana program simulate <PROGRAM_ID> <TX_DATA>

# Get detailed logs
solana logs <PROGRAM_ID> -v

# Inspect account data
solana account <ACCOUNT_ADDRESS> --output json-compact

# Check program buffer
solana program dump <PROGRAM_ID> dump.so
```

### Recovery Procedures

**If deployment fails:**
1. Check wallet balance
2. Verify network connectivity
3. Retry with `--max-sign-attempts 100`
4. Use alternative RPC endpoint

**If program is corrupted:**
1. DO NOT PANIC
2. If upgradeable: Deploy fixed version
3. If immutable: Deploy new program, migrate users
4. Communicate clearly with community

**If treasury is drained:**
1. Activate emergency pause (if implemented)
2. Investigate attack vector
3. Contact security team
4. Notify community
5. Plan recovery or migration

---

## Deployment Checklist

Use this checklist for each deployment:

### Pre-Deployment
- [ ] Code reviewed and tested
- [ ] Security audit completed
- [ ] All tests pass (`cargo test-sbf`)
- [ ] Constants verified
- [ ] Wallet funded (5-10 SOL)
- [ ] RPC provider configured
- [ ] Backup procedures documented

### Deployment
- [ ] Build program (`cargo build-sbf`)
- [ ] Verify build size and output
- [ ] Deploy to network
- [ ] Verify deployment on explorer
- [ ] Set program authority
- [ ] Save deployment details

### Post-Deployment
- [ ] Initialize protocol accounts
- [ ] Create/configure token mint
- [ ] Set up treasury
- [ ] Configure admin settings
- [ ] Verify all PDAs
- [ ] Test basic functionality
- [ ] Setup monitoring
- [ ] Announce deployment

### Ongoing
- [ ] Monitor daily
- [ ] Review weekly
- [ ] Audit monthly
- [ ] Plan upgrades quarterly

---

## Additional Resources

- [Solana Program Deployment](https://docs.solana.com/cli/deploy-a-program)
- [Solana Program Security](https://docs.solana.com/developing/programming-model/overview)
- [Anchor Deployment Guide](https://www.anchor-lang.com/docs/deployment)
- [Squads Protocol (Multisig)](https://squads.so/)
- [OtterSec (Security)](https://osec.io/)

---

## Support

For deployment support:
- GitHub Issues: https://github.com/your-org/ore-alt-client/issues
- Discord: [Your Discord Server]
- Email: security@yourdomain.com

**Security Issues**: Report privately to security@yourdomain.com

---

## Version History

- **v1.0.0**: Initial deployment guide
- Protocol Version: 3.7.0-alpha
- Last Updated: 2025-11-13

---

*This deployment guide should be reviewed and updated regularly as the protocol evolves.*
