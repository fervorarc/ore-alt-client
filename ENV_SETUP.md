# Environment Setup Guide

This guide will help you configure your environment for the ORE protocol.

## Quick Start

### 1. Copy the Example File

```bash
# For backend/CLI
cp .env.example .env

# For frontend
cp frontend/.env.example frontend/.env.local
```

### 2. Configure for Your Environment

Choose one of the preset configurations:

#### Option A: Local Development (Recommended for Testing)

```bash
# Use the development preset
cp .env.development .env

# Start local validator
./localnet.sh

# In another terminal, the CLI will automatically use local config
```

#### Option B: Devnet (Recommended for Testing with Real Network)

Edit `.env`:
```bash
SOLANA_NETWORK=devnet
SOLANA_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
```

#### Option C: Mainnet (Production)

Edit `.env`:
```bash
SOLANA_NETWORK=mainnet-beta
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
```

### 3. Set Up Your Wallet

```bash
# Generate a new keypair (if you don't have one)
solana-keygen new -o ~/.config/solana/id.json

# For devnet, airdrop some SOL for testing
solana airdrop 10 --url devnet

# Check your balance
solana balance
```

## RPC Provider Options

### Free Public RPCs

**Mainnet:**
- `https://api.mainnet-beta.solana.com` (Official, rate limited)
- `https://rpc.ankr.com/solana` (Ankr, better limits)

**Devnet:**
- `https://api.devnet.solana.com` (Official)

**Localnet:**
- `http://localhost:8899` (Local validator)

### Premium RPC Providers (Recommended for Production)

Better performance, higher rate limits, and additional features:

#### Helius
```bash
SOLANA_RPC_URL=https://rpc.helius.xyz/?api-key=YOUR_API_KEY
```
- Free tier: 100 requests/second
- Sign up: https://helius.xyz

#### Alchemy
```bash
SOLANA_RPC_URL=https://solana-mainnet.g.alchemy.com/v2/YOUR_API_KEY
```
- Free tier: 300M compute units/month
- Sign up: https://alchemy.com

#### QuickNode
```bash
SOLANA_RPC_URL=https://your-endpoint.solana-mainnet.quiknode.pro/YOUR_TOKEN/
```
- Free tier: 100k requests/month
- Sign up: https://quicknode.com

#### GenesysGo
```bash
SOLANA_RPC_URL=https://ssc-dao.genesysgo.net/YOUR_API_KEY
```
- Premium performance
- Sign up: https://genesysgo.com

## Environment Variables Explained

### Essential Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `SOLANA_RPC_URL` | RPC endpoint for blockchain connection | `https://api.mainnet-beta.solana.com` |
| `SOLANA_KEYPAIR_PATH` | Path to your wallet keypair | `~/.config/solana/id.json` |
| `ORE_PROGRAM_ID` | ORE program address | `oreV3EG1i9BEgiAJ8b177Z2S2rMarzak4NMv1kULvWv` |
| `ORE_MINT_ADDRESS` | ORE token mint address | `oreoU2P8bN6jkk3jbaiVxYnG1dCXcYxwhwyK9jSybcp` |

### Frontend Variables

All frontend variables must be prefixed with `NEXT_PUBLIC_` to be accessible in the browser:

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_SOLANA_RPC_URL` | RPC endpoint for frontend | Same as backend |
| `NEXT_PUBLIC_ORE_PROGRAM_ID` | ORE program ID | (see above) |
| `NEXT_PUBLIC_ORE_MINT` | ORE mint address | (see above) |
| `NEXT_PUBLIC_ENABLE_WS` | Enable WebSocket subscriptions | `true` |
| `NEXT_PUBLIC_DEBUG_MODE` | Show debug information | `false` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `COMMITMENT_LEVEL` | Transaction confirmation level | `confirmed` |
| `RPC_TIMEOUT` | Request timeout (ms) | `30000` |
| `PRIORITY_FEE` | Extra fee for faster processing | `0` |
| `DEBUG` | Enable debug logging | `false` |
| `LOG_LEVEL` | Logging verbosity | `info` |

## Configuration Examples

### Example 1: Basic Local Development

`.env`:
```bash
SOLANA_NETWORK=localnet
SOLANA_RPC_URL=http://localhost:8899
SOLANA_KEYPAIR_PATH=~/.config/solana/id.json
ORE_PROGRAM_ID=oreV3EG1i9BEgiAJ8b177Z2S2rMarzak4NMv1kULvWv
ORE_MINT_ADDRESS=oreoU2P8bN6jkk3jbaiVxYnG1dCXcYxwhwyK9jSybcp
```

`frontend/.env.local`:
```bash
NEXT_PUBLIC_SOLANA_RPC_URL=http://localhost:8899
NEXT_PUBLIC_ORE_PROGRAM_ID=oreV3EG1i9BEgiAJ8b177Z2S2rMarzak4NMv1kULvWv
NEXT_PUBLIC_ORE_MINT=oreoU2P8bN6jkk3jbaiVxYnG1dCXcYxwhwyK9jSybcp
NEXT_PUBLIC_ENABLE_WS=true
NEXT_PUBLIC_DEBUG_MODE=true
```

### Example 2: Devnet Testing

`.env`:
```bash
SOLANA_NETWORK=devnet
SOLANA_RPC_URL=https://api.devnet.solana.com
SOLANA_KEYPAIR_PATH=~/.config/solana/devnet-wallet.json
TEST_MODE=true
COMMITMENT_LEVEL=confirmed
```

### Example 3: Production with Premium RPC

`.env`:
```bash
SOLANA_NETWORK=mainnet-beta
SOLANA_RPC_URL=https://rpc.helius.xyz/?api-key=YOUR_API_KEY
SOLANA_KEYPAIR_PATH=/secure/path/to/production-keypair.json
ORE_PROGRAM_ID=oreV3EG1i9BEgiAJ8b177Z2S2rMarzak4NMv1kULvWv
ORE_MINT_ADDRESS=oreoU2P8bN6jkk3jbaiVxYnG1dCXcYxwhwyK9jSybcp
COMMITMENT_LEVEL=finalized
RPC_MAX_RETRIES=5
PRIORITY_FEE=5000
ENABLE_CACHE=true
```

## Testing Your Configuration

### Test Backend/CLI

```bash
# Check Solana config
solana config get

# Check balance
solana balance

# Test CLI (if compiled)
cargo run --bin ore-cli -- balance
```

### Test Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000
```

## Troubleshooting

### Issue: "Connection refused"

**Solution**: Check your RPC URL is correct and accessible
```bash
curl -X POST -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","id":1,"method":"getHealth"}' $SOLANA_RPC_URL
```

### Issue: "Keypair not found"

**Solution**: Verify keypair path exists
```bash
ls -la ~/.config/solana/id.json
```

### Issue: "Rate limit exceeded"

**Solution**: Use a premium RPC provider or reduce request frequency

### Issue: "Transaction timeout"

**Solution**: Increase timeout or check network status
```bash
# In .env
RPC_TIMEOUT=60000
```

### Issue: Frontend can't connect

**Solution**: Ensure NEXT_PUBLIC_ prefix on all browser-accessible variables

## Security Best Practices

### ⚠️ NEVER commit .env files to git!

Your `.gitignore` should include:
```gitignore
.env
.env.local
.env.*.local
.env.development
.env.production
*.env
```

### 🔒 Protect Your Keypairs

```bash
# Set proper permissions on keypair files
chmod 600 ~/.config/solana/id.json

# For production, use hardware wallets or secure key management
# Examples: AWS KMS, HashiCorp Vault, Azure Key Vault
```

### 🛡️ Production Secrets

For production deployments:

1. **Use environment variables** in your hosting platform:
   - Vercel: Project Settings → Environment Variables
   - Netlify: Site Settings → Build & Deploy → Environment
   - Docker: Pass via `-e` flag or docker-compose

2. **Use secret management services**:
   - AWS Secrets Manager
   - Google Cloud Secret Manager
   - HashiCorp Vault

3. **Never hardcode secrets** in source code

## Additional Resources

- [Solana CLI Documentation](https://docs.solana.com/cli)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [ORE Development Guide](docs/DEVELOPMENT.md)
- [ORE Frontend Guide](docs/FRONTEND.md)

## Support

If you encounter issues:
1. Check this guide first
2. Review logs: `LOG_LEVEL=debug` in .env
3. Consult [DEVELOPMENT.md](docs/DEVELOPMENT.md)
4. Open an issue on GitHub

---

**Setup complete! You're ready to start mining ORE! ⛏️**
