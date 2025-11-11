# ORE Development Guide

Complete guide for setting up a development environment and contributing to the ORE protocol.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Building the Project](#building-the-project)
- [Running Tests](#running-tests)
- [Local Development](#local-development)
- [Development Workflow](#development-workflow)
- [Code Organization](#code-organization)
- [Testing Guidelines](#testing-guidelines)
- [Debugging](#debugging)
- [Performance](#performance)
- [Common Tasks](#common-tasks)

## Prerequisites

### Required Software

| Tool | Version | Purpose |
|------|---------|---------|
| **Rust** | 1.82.0 | Workspace compilation |
| **Solana CLI** | 2.1+ | On-chain development |
| **Node.js** | 18+ | Frontend development |
| **Git** | Any recent | Version control |

### Optional Tools

- **Anchor** (if using Anchor framework features)
- **Solana Test Validator** (included with Solana CLI)
- **Docker** (for containerized development)

## Environment Setup

### 1. Install Rust

The project uses Rust 1.82.0, automatically managed via `rust-toolchain.toml`:

```bash
# Install rustup if not already installed
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Reload environment
source $HOME/.cargo/env

# Verify installation
rustc --version
cargo --version
```

The correct Rust version will be automatically selected when you enter the project directory.

### 2. Install Solana CLI Tools

```bash
# Install Solana CLI
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"

# Add to PATH (add to ~/.bashrc or ~/.zshrc)
export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"

# Verify installation
solana --version  # Should be 2.1+
```

### 3. Install Node.js (for Frontend)

```bash
# Using nvm (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18

# Verify
node --version
npm --version
```

### 4. Clone the Repository

```bash
git clone https://github.com/regolith-labs/ore
cd ore-alt-client
```

### 5. Configure Solana

```bash
# Generate a keypair for development
solana-keygen new -o ~/.config/solana/id.json

# Configure for devnet (for testing)
solana config set --url devnet

# Or localhost for local development
solana config set --url localhost

# Verify configuration
solana config get
```

## Building the Project

### Build Everything

```bash
# Build entire workspace
cargo build

# Build in release mode
cargo build --release
```

### Build Individual Components

```bash
# Build API library only
cargo build -p ore-api

# Build program (Solana BPF)
cargo build-sbf

# Build CLI
cargo build -p ore-cli --release
```

### Build Artifacts

- **API**: `target/debug/libore_api.rlib`
- **Program**: `target/deploy/ore_program.so`
- **CLI**: `target/release/ore-cli`

## Running Tests

### Unit Tests

```bash
# Run all unit tests
cargo test

# Run tests for specific package
cargo test -p ore-api
cargo test -p ore-cli

# Run specific test
cargo test test_name

# Show output for passing tests
cargo test -- --nocapture
```

### On-Chain Tests (BPF)

```bash
# Run all on-chain tests
cargo test-sbf

# Run with verbose output
cargo test-sbf -- --nocapture

# Run specific test file
cargo test-sbf --test integration_test
```

### Coverage

```bash
# Generate coverage report
cargo llvm-cov

# Generate HTML coverage report
cargo llvm-cov --html

# Open coverage report
open target/llvm-cov/html/index.html
```

### Frontend Tests

```bash
cd frontend

# Run tests
npm test

# Run tests in watch mode
npm test -- --watch

# Check TypeScript types
npm run type-check
```

## Local Development

### Start Local Validator

The `localnet.sh` script starts a configured test validator:

```bash
# Make script executable
chmod +x localnet.sh

# Start local validator
./localnet.sh
```

**What it does:**
- Starts Solana test validator
- Deploys ORE program at correct address
- Clones mainnet accounts (mint, treasury, etc.)
- Enables logging

**Script contents:**
```bash
#!/bin/bash
solana-test-validator \
  --bpf-program oreV3EG1i9BEgiAJ8b177Z2S2rMarzak4NMv1kULvWv target/deploy/ore_program.so \
  --clone oreoU2P8bN6jkk3jbaiVxYnG1dCXcYxwhwyK9jSybcp \
  --clone HBUh9g46wk2X89CvaNN15UmsznP59rh6od1h8JwYAopk \
  --log
```

### Manual Local Validator

```bash
# Start basic validator
solana-test-validator

# In another terminal, deploy program
solana program deploy target/deploy/ore_program.so
```

### Airdrop SOL (Devnet/Localnet)

```bash
# Airdrop 10 SOL to your wallet
solana airdrop 10

# Airdrop to specific address
solana airdrop 5 <ADDRESS>

# Check balance
solana balance
```

### Run Frontend Locally

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000
```

## Development Workflow

### 1. Create a Branch

```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Or bugfix branch
git checkout -b fix/bug-description
```

### 2. Make Changes

Follow the code organization patterns (see below).

### 3. Test Changes

```bash
# Run all tests
cargo test
cargo test-sbf

# Check formatting
cargo fmt --check

# Run linter
cargo clippy -- -D warnings
```

### 4. Commit Changes

```bash
# Stage changes
git add .

# Commit with descriptive message
git commit -m "feat: add new mining instruction"
```

**Commit message format:**
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `test:` Test additions/changes
- `refactor:` Code refactoring
- `chore:` Maintenance tasks

### 5. Push and Create PR

```bash
# Push to remote
git push origin feature/your-feature-name

# Create pull request on GitHub
```

## Code Organization

### Adding a New Instruction

1. **Define instruction struct in `api/src/instruction.rs`:**

```rust
#[repr(C)]
#[derive(Clone, Copy, Debug, Pod, Zeroable)]
pub struct MyNewInstruction {
    pub param1: [u8; 8],
    pub param2: u8,
    // ...
}

// Add to enum
#[repr(u8)]
pub enum OreInstruction {
    // ... existing
    MyNewInstruction = 99,
}

// Register instruction
instruction!(OreInstruction, MyNewInstruction);
```

2. **Add SDK helper in `api/src/sdk.rs`:**

```rust
pub fn my_new_instruction(
    user: Pubkey,
    param1: u64,
    param2: u8,
) -> Instruction {
    // Build instruction
}
```

3. **Implement handler in `program/src/my_new_instruction.rs`:**

```rust
use steel::*;

pub fn process_my_new_instruction(
    accounts: &[AccountInfo<'_>],
    data: &[u8],
) -> ProgramResult {
    // Parse args
    let args = MyNewInstruction::try_from_bytes(data)?;

    // Load accounts
    let [user, account1, account2] = accounts else {
        return Err(ProgramError::NotEnoughAccountKeys);
    };

    // Validate
    user.is_signer()?;
    account1.is_writable()?;

    // Execute logic
    // ...

    Ok(())
}
```

4. **Register in `program/src/lib.rs`:**

```rust
mod my_new_instruction;
use my_new_instruction::*;

// In process_instruction:
match ix {
    // ... existing
    OreInstruction::MyNewInstruction => process_my_new_instruction(accounts, data)?,
}
```

5. **Add tests:**

```rust
// In program/tests/test_my_new_instruction.rs
#[test]
fn test_my_new_instruction() {
    // Setup
    // Execute
    // Assert
}
```

### Adding a New State Account

1. **Define in `api/src/state/my_state.rs`:**

```rust
use bytemuck::{Pod, Zeroable};

#[repr(C)]
#[derive(Clone, Copy, Debug, Pod, Zeroable)]
pub struct MyState {
    pub field1: Pubkey,
    pub field2: u64,
    pub field3: [u8; 32],
}

impl MyState {
    pub const SIZE: usize = 32 + 8 + 32;
}
```

2. **Add to `api/src/state/mod.rs`:**

```rust
mod my_state;
pub use my_state::*;
```

3. **Add PDA seed in `api/src/consts.rs`:**

```rust
pub const MY_STATE: &[u8] = b"my_state";
```

4. **Add PDA helper in `api/src/sdk.rs`:**

```rust
pub fn my_state_pda(param: Pubkey) -> (Pubkey, u8) {
    Pubkey::find_program_address(
        &[MY_STATE, param.as_ref()],
        &crate::ID,
    )
}
```

## Testing Guidelines

### Writing Good Tests

```rust
#[test]
fn test_deploy_success() {
    // Arrange: Set up test environment
    let mut context = setup_test_context();
    let user = create_test_user(&mut context);
    let amount = 1_000_000; // 0.001 SOL

    // Act: Execute the action
    let result = deploy(&mut context, user, amount, 5);

    // Assert: Verify outcome
    assert!(result.is_ok());

    let miner = get_miner_account(&context, user);
    assert_eq!(miner.deployed, amount);
    assert_eq!(miner.block, 5);
}

#[test]
fn test_deploy_insufficient_funds() {
    // Test error cases
    let mut context = setup_test_context();
    let user = create_test_user(&mut context);

    let result = deploy(&mut context, user, 0, 5);

    assert!(result.is_err());
    assert_eq!(result.unwrap_err(), OreError::AmountTooSmall);
}
```

### Test Coverage Goals

- **Unit Tests**: Cover all public functions
- **Integration Tests**: Cover all instructions end-to-end
- **Edge Cases**: Test boundary conditions
- **Error Paths**: Test all error conditions
- **Minimum Coverage**: Aim for 80%+

## Debugging

### Enable Logging

```rust
// In program code
use solana_program::log::sol_log;

sol_log("Debug message");
sol_log(&format!("Value: {}", value));
```

### View Logs

```bash
# Tail validator logs
solana logs

# Filter for program logs
solana logs | grep "Program oreV3"
```

### Debug Locally

```bash
# Build with debug symbols
cargo build-sbf --debug

# Use solana-test-validator with logging
./localnet.sh

# View transaction details
solana confirm -v <SIGNATURE>
```

### Common Debug Patterns

```rust
// Log account data
sol_log(&format!("Account: {:?}", account.key));
sol_log(&format!("Balance: {}", account.lamports()));

// Log instruction data
sol_log(&format!("Instruction: {:?}", instruction_data));

// Check point debugging
sol_log("Checkpoint 1");
// ... code
sol_log("Checkpoint 2");
```

### Using Rust Debugger

```bash
# Install rust-gdb
rustup component add rust-src

# Debug tests
rust-gdb --args target/debug/ore_cli <args>
```

## Performance

### Optimization Tips

1. **Minimize Account Reads**: Cache account data
2. **Use Zero-Copy**: Implement `Pod` and `Zeroable`
3. **Batch Operations**: Combine multiple operations
4. **Compute Budget**: Be aware of compute limits

### Benchmarking

```rust
#[cfg(test)]
mod benches {
    use super::*;
    use test::Bencher;

    #[bench]
    fn bench_deploy(b: &mut Bencher) {
        b.iter(|| {
            // Code to benchmark
        });
    }
}
```

Run benchmarks:
```bash
cargo bench
```

### Compute Unit Usage

```bash
# Check compute unit usage
solana confirm -v <SIGNATURE>

# Look for "consumed X of Y compute units"
```

## Common Tasks

### Update Program

```bash
# Build updated program
cargo build-sbf

# Deploy to devnet
solana program deploy \
  target/deploy/ore_program.so \
  --keypair ~/.config/solana/id.json

# Deploy to localnet
# (restart localnet.sh with new build)
```

### Add Dependency

```bash
# Add to workspace
cargo add <package> --workspace

# Add to specific package
cargo add <package> -p ore-api
```

**Update `Cargo.toml`:**
```toml
[workspace.dependencies]
new-package = "1.0"
```

### Format Code

```bash
# Format all code
cargo fmt

# Check formatting
cargo fmt --check
```

### Lint Code

```bash
# Run clippy
cargo clippy

# Fix auto-fixable issues
cargo clippy --fix

# Strict mode (treat warnings as errors)
cargo clippy -- -D warnings
```

### Generate Documentation

```bash
# Generate docs for workspace
cargo doc --workspace --no-deps

# Open in browser
cargo doc --open

# Generate with private items
cargo doc --document-private-items
```

### Clean Build Artifacts

```bash
# Clean all build artifacts
cargo clean

# Clean and rebuild
cargo clean && cargo build-sbf
```

### Update Dependencies

```bash
# Update all dependencies
cargo update

# Update specific dependency
cargo update -p ore-api

# Check for outdated dependencies
cargo outdated
```

## Environment Variables

Useful environment variables for development:

```bash
# Rust backtrace (for debugging)
export RUST_BACKTRACE=1          # Short backtrace
export RUST_BACKTRACE=full       # Full backtrace

# Rust log level
export RUST_LOG=debug
export RUST_LOG=solana_runtime=debug

# Solana config
export SOLANA_URL=http://localhost:8899
export SOLANA_KEYPAIR=~/.config/solana/id.json
```

Add to `~/.bashrc` or `~/.zshrc` for persistence.

## IDE Setup

### Visual Studio Code

Recommended extensions:
- **rust-analyzer**: Rust language server
- **Solana**: Solana development tools
- **Better TOML**: TOML syntax highlighting
- **Error Lens**: Inline error display

**Settings (`.vscode/settings.json`):**
```json
{
  "rust-analyzer.cargo.features": "all",
  "rust-analyzer.checkOnSave.command": "clippy",
  "[rust]": {
    "editor.defaultFormatter": "rust-lang.rust-analyzer",
    "editor.formatOnSave": true
  }
}
```

### IntelliJ IDEA / CLion

Install plugins:
- **Rust**
- **TOML**

Enable format on save in settings.

## Continuous Integration

The project uses GitHub Actions for CI/CD.

**Workflows:**
- Build and test on every push
- Run clippy and format checks
- Generate coverage reports
- Deploy to devnet on main branch

**Local CI simulation:**
```bash
# Run all CI checks locally
cargo fmt --check
cargo clippy -- -D warnings
cargo test
cargo test-sbf
cargo build-sbf
```

## Troubleshooting

### "Program failed to complete"

- Check compute unit usage
- Increase compute budget if needed
- Review logs for specific error

### "Transaction simulation failed"

- Verify account addresses
- Check account ownership
- Ensure sufficient SOL for fees

### "Account not found"

- Ensure accounts are created
- Check PDA derivation
- Verify program is deployed

### Build Issues

```bash
# Clear cache and rebuild
cargo clean
rm -rf target/
cargo build-sbf
```

## Additional Resources

- **Solana Documentation**: https://docs.solana.com
- **Anchor Book**: https://book.anchor-lang.com
- **Steel Framework**: https://github.com/regolith-labs/steel
- **Rust Book**: https://doc.rust-lang.org/book/

---

**Happy developing! 🚀**
