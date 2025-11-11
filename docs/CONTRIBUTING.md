# Contributing to ORE

Thank you for your interest in contributing to ORE! This document provides guidelines and best practices for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How to Contribute](#how-to-contribute)
- [Development Process](#development-process)
- [Coding Standards](#coding-standards)
- [Testing Requirements](#testing-requirements)
- [Documentation](#documentation)
- [Pull Request Process](#pull-request-process)
- [Community](#community)

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors, regardless of:
- Experience level
- Background
- Identity
- Expression

### Expected Behavior

- Be respectful and considerate
- Welcome newcomers and help them get started
- Accept constructive criticism gracefully
- Focus on what's best for the community
- Show empathy towards other community members

### Unacceptable Behavior

- Harassment, discrimination, or exclusionary behavior
- Trolling, insulting/derogatory comments, and personal attacks
- Public or private harassment
- Publishing others' private information without permission
- Other conduct which could reasonably be considered inappropriate

### Enforcement

Violations may result in:
1. Warning
2. Temporary ban
3. Permanent ban

Report issues to the project maintainers.

## Getting Started

### Prerequisites

Before contributing, ensure you have:

1. **Development Environment**: Set up per [DEVELOPMENT.md](DEVELOPMENT.md)
2. **GitHub Account**: For submitting pull requests
3. **Basic Knowledge**:
   - Rust programming
   - Solana blockchain fundamentals
   - Git version control

### First-Time Contributors

Great first issues are labeled with `good first issue` or `help wanted`.

**Steps:**
1. Fork the repository
2. Clone your fork
3. Set up development environment
4. Find an issue to work on
5. Make your changes
6. Submit a pull request

## How to Contribute

### Types of Contributions

#### Bug Reports

Found a bug? Please report it!

**Before submitting:**
- Check if the bug is already reported
- Test on the latest version
- Collect debugging information

**Include in report:**
- Description of the bug
- Steps to reproduce
- Expected vs. actual behavior
- System information (OS, Rust version, etc.)
- Relevant logs or error messages

**Template:**
```markdown
## Bug Description
[Clear description of the bug]

## Steps to Reproduce
1. Step 1
2. Step 2
3. ...

## Expected Behavior
[What should happen]

## Actual Behavior
[What actually happens]

## Environment
- OS: [e.g., Ubuntu 22.04]
- Rust: [e.g., 1.82.0]
- Solana CLI: [e.g., 2.1.0]

## Additional Context
[Any other relevant information]
```

---

#### Feature Requests

Have an idea for a new feature?

**Before submitting:**
- Check if it's already requested
- Consider if it aligns with project goals
- Think through implementation implications

**Include in request:**
- Description of the feature
- Use cases and benefits
- Possible implementation approach
- Any alternatives considered

**Template:**
```markdown
## Feature Description
[Clear description of the feature]

## Motivation
[Why is this feature needed?]

## Use Cases
- Use case 1
- Use case 2

## Proposed Implementation
[High-level approach]

## Alternatives Considered
[Other approaches you've thought about]
```

---

#### Code Contributions

Ready to write code?

**Types of code contributions:**
- Bug fixes
- New features
- Performance improvements
- Code refactoring
- Test coverage improvements
- Documentation improvements

---

#### Documentation

Documentation is crucial!

**Areas needing documentation:**
- Code comments and doc strings
- User guides and tutorials
- Architecture documentation
- API references
- Examples and demos

---

## Development Process

### 1. Fork and Clone

```bash
# Fork on GitHub, then clone your fork
git clone https://github.com/YOUR_USERNAME/ore-alt-client.git
cd ore-alt-client

# Add upstream remote
git remote add upstream https://github.com/regolith-labs/ore.git
```

### 2. Create a Branch

```bash
# Update main
git checkout main
git pull upstream main

# Create feature branch
git checkout -b feature/your-feature-name

# Or bugfix branch
git checkout -b fix/bug-description
```

**Branch naming conventions:**
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `test/` - Test additions/changes
- `chore/` - Maintenance tasks

### 3. Make Changes

Follow the [Coding Standards](#coding-standards) below.

### 4. Test Your Changes

```bash
# Run tests
cargo test
cargo test-sbf

# Check formatting
cargo fmt --check

# Run linter
cargo clippy -- -D warnings

# Test build
cargo build-sbf
```

### 5. Commit Changes

```bash
# Stage changes
git add .

# Commit with descriptive message
git commit -m "feat: add new mining instruction"
```

**Commit message format:**
```
<type>: <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Test additions/changes
- `chore`: Maintenance tasks
- `perf`: Performance improvements

**Example:**
```
feat: add motherlode bonus calculation

Implement motherlode bonus pool accumulation and distribution
logic. Each round adds escalating ORE (0.2, 0.4, 0.6, etc.) to
the pool, with escalating hit chance (capped at 50%).

Closes #123
```

### 6. Push to Your Fork

```bash
git push origin feature/your-feature-name
```

### 7. Create Pull Request

- Go to GitHub
- Click "New Pull Request"
- Select your branch
- Fill out PR template
- Submit for review

## Coding Standards

### Rust Code Style

Follow the official [Rust Style Guide](https://doc.rust-lang.org/1.0.0/style/).

**Key points:**
- Use `cargo fmt` for formatting
- Use `cargo clippy` for linting
- Maximum line length: 100 characters
- Use 4 spaces for indentation
- Follow Rust naming conventions

**Example:**
```rust
// Good
pub struct Miner {
    pub authority: Pubkey,
    pub round: u64,
    pub deployed: u64,
}

impl Miner {
    pub fn new(authority: Pubkey, round: u64) -> Self {
        Self {
            authority,
            round,
            deployed: 0,
        }
    }
}

// Bad
pub struct Miner{pub authority:Pubkey,pub round:u64}
```

### Naming Conventions

| Item | Convention | Example |
|------|------------|---------|
| Modules | `snake_case` | `claim_ore` |
| Types | `PascalCase` | `MinerAccount` |
| Traits | `PascalCase` | `Deployable` |
| Functions | `snake_case` | `deploy_sol` |
| Constants | `SCREAMING_SNAKE_CASE` | `MAX_SUPPLY` |
| Variables | `snake_case` | `user_balance` |

### Comments and Documentation

**Doc comments:**
```rust
/// Deploys SOL to claim space on the mining board.
///
/// # Arguments
///
/// * `amount` - Amount of SOL to deploy in lamports
/// * `block` - Target block number (0-24)
///
/// # Returns
///
/// Returns `Ok(())` on success or an error.
///
/// # Errors
///
/// Returns `OreError::AmountTooSmall` if amount is below minimum.
pub fn deploy(amount: u64, block: u8) -> Result<()> {
    // Implementation
}
```

**Inline comments:**
```rust
// Calculate rewards with 10% refining fee
let refined_amount = total_rewards * 90 / 100;

// Transfer to user (not: Transfer money)
transfer(user, refined_amount)?;
```

### Error Handling

```rust
// Good: Use Result types
pub fn process_deploy(amount: u64) -> Result<()> {
    require!(amount >= MIN_AMOUNT, OreError::AmountTooSmall);
    // ...
    Ok(())
}

// Good: Use ? operator
let account = get_account()?;

// Bad: Unwrap in production code
let account = get_account().unwrap();  // Don't do this!

// Exception: Tests can use unwrap
#[test]
fn test_deploy() {
    let account = get_account().unwrap();  // OK in tests
    assert_eq!(account.balance, 100);
}
```

### Safety and Security

```rust
// Always use checked arithmetic
let result = amount.checked_add(fee)
    .ok_or(ProgramError::ArithmeticOverflow)?;

// Validate all inputs
require!(block < 25, OreError::InvalidBlock);
require!(amount > 0, OreError::AmountTooSmall);

// Check account ownership
require!(
    account.owner == &crate::ID,
    ProgramError::IncorrectProgramId
);

// Validate signers
require!(user.is_signer, ProgramError::MissingRequiredSignature);
```

### TypeScript/Frontend

```typescript
// Use TypeScript for type safety
interface MinerData {
  authority: PublicKey;
  round: number;
  deployed: number;
}

// Use async/await
async function deploySOL(amount: number, block: number): Promise<string> {
  const transaction = buildDeployTransaction(amount, block);
  const signature = await sendTransaction(transaction);
  return signature;
}

// Handle errors
try {
  await deploySOL(amount, block);
} catch (error) {
  console.error('Deploy failed:', error);
  throw error;
}
```

## Testing Requirements

### Test Coverage

- **Minimum coverage**: 80% for new code
- **Required tests**:
  - Unit tests for all public functions
  - Integration tests for all instructions
  - Edge case tests
  - Error path tests

### Writing Tests

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_deploy_success() {
        // Arrange
        let mut context = setup_test();
        let amount = 1_000_000;

        // Act
        let result = deploy(&mut context, amount, 5);

        // Assert
        assert!(result.is_ok());
        assert_eq!(context.deployed, amount);
    }

    #[test]
    fn test_deploy_amount_too_small() {
        let mut context = setup_test();

        let result = deploy(&mut context, 0, 5);

        assert!(result.is_err());
        assert_eq!(result.unwrap_err(), OreError::AmountTooSmall);
    }
}
```

### Running Tests

```bash
# Run all tests
cargo test

# Run specific test
cargo test test_deploy_success

# Run with output
cargo test -- --nocapture

# Run on-chain tests
cargo test-sbf

# Check coverage
cargo llvm-cov
```

## Documentation

### Code Documentation

All public items must have doc comments:

```rust
/// Represents a miner's state in the ORE protocol.
///
/// Miners track deployed SOL, chosen block, and unclaimed rewards
/// for a specific round.
pub struct Miner {
    /// The authority (owner) of this miner account
    pub authority: Pubkey,

    /// The round number this miner is participating in
    pub round: u64,

    /// Amount of SOL deployed (in lamports)
    pub deployed: u64,
}
```

### README Updates

Update README.md when:
- Adding new features
- Changing installation steps
- Modifying usage instructions
- Adding dependencies

### Changelog

Update CHANGELOG.md with:
- Version number
- Release date
- Added features
- Fixed bugs
- Breaking changes

## Pull Request Process

### Before Submitting

**Checklist:**
- [ ] Code follows style guidelines
- [ ] Tests pass (`cargo test` and `cargo test-sbf`)
- [ ] Linter passes (`cargo clippy`)
- [ ] Formatting is correct (`cargo fmt`)
- [ ] Documentation is updated
- [ ] Commit messages follow conventions
- [ ] Branch is up to date with main

### PR Description Template

```markdown
## Description
[Brief description of changes]

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Related Issues
Closes #[issue number]

## Testing
[Describe testing performed]

## Checklist
- [ ] Tests pass
- [ ] Linter passes
- [ ] Documentation updated
- [ ] CHANGELOG updated (if needed)

## Screenshots (if applicable)
[Add screenshots]

## Additional Notes
[Any additional information]
```

### Review Process

1. **Automated Checks**: CI/CD runs tests and checks
2. **Code Review**: Maintainer reviews code
3. **Feedback**: Address review comments
4. **Approval**: Maintainer approves PR
5. **Merge**: PR is merged to main

### Addressing Feedback

```bash
# Make requested changes
git add .
git commit -m "fix: address review feedback"
git push origin feature/your-feature-name
```

### After Merge

- Delete your branch
- Pull latest main
- Close related issues

## Community

### Communication Channels

- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: General discussions and Q&A
- **Discord**: Real-time chat (if available)
- **Twitter**: Updates and announcements

### Getting Help

- Read the [documentation](README.md)
- Search existing issues
- Ask in GitHub Discussions
- Join Discord community

### Recognition

Contributors are recognized:
- In CHANGELOG.md
- In README.md contributors section
- On project website (if applicable)

## License

By contributing, you agree that your contributions will be licensed under the Apache-2.0 License.

---

## Quick Reference

### Common Commands

```bash
# Setup
git clone <your-fork>
cd ore-alt-client

# Development
git checkout -b feature/my-feature
cargo fmt
cargo clippy
cargo test
cargo test-sbf

# Submit
git add .
git commit -m "feat: my feature"
git push origin feature/my-feature
# Create PR on GitHub
```

### Resources

- **Development Guide**: [DEVELOPMENT.md](DEVELOPMENT.md)
- **Architecture**: [ARCHITECTURE.md](docs/ARCHITECTURE.md)
- **API Reference**: [API.md](docs/API.md)
- **Rust Book**: https://doc.rust-lang.org/book/
- **Solana Docs**: https://docs.solana.com

---

**Thank you for contributing to ORE! 🎉**
