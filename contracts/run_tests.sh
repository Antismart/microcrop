#!/bin/bash
# Complete Test Suite for MicroCrop Insurance Contracts
# Run this script when Flow emulator is working properly

echo "🚀 Starting MicroCrop Insurance Contract Tests"
echo "=============================================="

# Step 1: Deploy contracts
echo "📦 Deploying contracts..."
flow project deploy --network emulator

# Step 2: Test initial state
echo "📊 Testing initial state..."
echo "Pool Stats:"
flow scripts execute cadence/scripts/GetPoolStats.cdc --network emulator
echo "xINSURE Value per Token:"
flow scripts execute cadence/scripts/GetXInsureValuePerToken.cdc --network emulator

# Step 3: Test capital deposit (LP deposits 1000 tokens)
echo "💰 Testing capital deposit..."
flow transactions send cadence/transactions/DepositCapital.cdc 1000.0 --network emulator --signer micro-account

# Step 4: Check pool stats after deposit
echo "📊 Pool stats after deposit:"
flow scripts execute cadence/scripts/GetPoolStats.cdc --network emulator

# Step 5: Test premium collection (Farmer pays 50 premium for policy 1)
echo "💵 Testing premium collection..."
flow transactions send cadence/transactions/CollectPremium.cdc 1 50.0 --network emulator --signer micro-account

# Step 6: Test RWA investment (200 tokens in Treasury Bonds)
echo "🏦 Testing RWA investment..."
flow transactions send cadence/transactions/InvestInRWA.cdc "Treasury Bonds" 200.0 --network emulator --signer micro-account

# Step 7: Check RWA holdings
echo "📈 RWA Holdings:"
flow scripts execute cadence/scripts/GetRWAHoldings.cdc --network emulator

# Step 8: Test payout (100 tokens payout for drought)
echo "💸 Testing payout..."
flow transactions send cadence/transactions/TriggerPayout.cdc 0x179b6b1cb6755e31 1 100.0 "Drought conditions detected" --network emulator --signer micro-account

# Step 9: Test capital redemption (500 xINSURE tokens)
echo "🔄 Testing capital redemption..."
flow transactions send cadence/transactions/RedeemCapital.cdc 500.0 --network emulator --signer micro-account

# Step 10: Final pool stats
echo "📊 Final pool statistics:"
flow scripts execute cadence/scripts/GetPoolStats.cdc --network emulator
flow scripts execute cadence/scripts/GetAvailableLiquidity.cdc --network emulator
flow scripts execute cadence/scripts/GetPoolUtilization.cdc --network emulator

echo "✅ Test suite completed!"
