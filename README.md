# MicroCrop Insurance Protocol

MicroCrop is a decentralized insurance protocol for agricultural risk, built on the Flow blockchain using Cadence smart contracts. It enables capital providers (LPs) to pool funds, farmers to purchase parametric crop insurance, and the protocol to invest in Real World Assets (RWA) for yield. The protocol is designed for transparency, automation, and extensibility.

---

## Table of Contents
- [Features](#features)
- [Architecture](#architecture)
- [Contracts Overview](#contracts-overview)
- [Key Concepts](#key-concepts)
- [Getting Started](#getting-started)
- [Testing](#testing)
- [Project Structure](#project-structure)
- [Troubleshooting](#troubleshooting)
- [License](#license)

---

## Features
- **Insurance Pool**: Central contract for managing pooled capital, premiums, payouts, and xINSURE token minting/burning.
- **xINSURE Token**: Custom fungible token representing LP shares in the pool.
- **RWA Investment**: Protocol can invest a portion of the pool in real-world assets (e.g., Treasury Bonds).
- **Oracle Integration**: Trusted oracle contract for weather data and parametric payout triggers.
- **Automated Payouts**: Parametric triggers for fast, transparent insurance payouts.
- **Comprehensive Test Suite**: Scripts and transactions for end-to-end protocol validation.

---

## Architecture
- **InsurancePool**: Manages capital, premiums, payouts, and RWA investments.
- **XINSURE**: ERC-20-like fungible token for LPs.
- **OracleContract**: Handles weather data and payout triggers.
- **Counter**: Example contract for testing.

### Key Flows
- LPs deposit capital → receive xINSURE tokens.
- Farmers pay premiums → pool collects and tracks.
- Oracle triggers payout → pool executes automated payout.
- Admin can invest/redeem RWA assets.

---

## Contracts Overview
- `InsurancePool.cdc`: Core pool logic, capital management, premium collection, payouts, RWA investment.
- `Xinsure.cdc`: xINSURE token contract (mint, burn, transfer, vault setup).
- `OracleContract.cdc`: Oracle for weather data and parametric triggers.
- `Counter.cdc`: Simple counter contract for demo/testing.

---

## Key Concepts
- **LP (Liquidity Provider)**: Supplies capital to the pool, receives xINSURE tokens.
- **Farmer**: Buys insurance, pays premiums, receives payouts on trigger.
- **Admin**: Manages pool, executes RWA investments, triggers payouts.
- **xINSURE**: Fungible token representing LP share in the pool.
- **RWA (Real World Asset)**: Off-chain investment (e.g., bonds) for yield.

---

## Getting Started

### Prerequisites
- [Flow CLI](https://docs.onflow.org/flow-cli/install/)
- Flow emulator (for local testing)
- Node.js (for scripting, optional)

### Setup
1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd microcrop/contracts
   ```
2. **Start the Flow emulator**
   ```bash
   flow emulator
   ```
3. **Deploy contracts**
   ```bash
   flow project deploy --network emulator
   ```
4. **Run the test suite**
   ```bash
   ./run_tests.sh
   ```

---

## Testing
- All major flows are covered by Cadence scripts and transactions in `cadence/scripts/` and `cadence/transactions/`.
- Use `run_tests.sh` for a full protocol test (deposit, premium, RWA, payout, etc).
- Example manual test:
  ```bash
  flow scripts execute cadence/scripts/GetPoolStats.cdc --network emulator
  flow transactions send cadence/transactions/DepositCapital.cdc 1000.0 --network emulator --signer micro-account
  ```

---

## Project Structure
```
contracts/
  cadence/
    contracts/         # Core Cadence contracts
    scripts/           # Read-only scripts
    transactions/      # State-changing transactions
    imports/           # External Cadence dependencies
  flow.json            # Flow project config
  run_tests.sh         # Automated test runner
  test_simple.cdc      # Simple contract test
```

---

## Troubleshooting
- **FlowToken/FungibleToken import errors**: Some FlowToken-related files are commented out due to missing or incompatible dependencies. Use only xINSURE for pool operations.
- **Cadence 1.0+ compatibility**: All contracts use Cadence 1.0+ syntax and capability APIs.
- **Deployment issues**: Ensure emulator is running and `flow.json` addresses match deployed contracts.

---

## License
MIT License. See [LICENSE](../LICENSE) for details.

---

## Credits
- Built by the MicroCrop team.
- Inspired by DeFi insurance and RWA protocols.
- Uses Flow open-source standards and libraries.

# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/47c17d9a-27f5-4057-b496-03d1a45b2ccf

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/47c17d9a-27f5-4057-b496-03d1a45b2ccf) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/47c17d9a-27f5-4057-b496-03d1a45b2ccf) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
