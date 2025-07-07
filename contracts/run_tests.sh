#!/bin/bash
# Complete Test Suite for MicroCrop Insurance Contracts
# Run this script when Flow emulator is running

echo "🚀 Starting MicroCrop Insurance Contract Tests"
echo "=============================================="

# Step 1: Deploy contracts
echo "📦 Deploying contracts..."
flow project deploy --network emulator
if [ $? -ne 0 ]; then
    echo "❌ Contract deployment failed"
    exit 1
fi

# Step 2: Initialize Oracle with InsurancePool
echo "🔗 Initializing Oracle with InsurancePool..."
flow transactions send cadence/transactions/InitializeOracle.cdc --network emulator --signer emulator-account

# Step 3: Test initial state
echo "📊 Testing initial state..."
echo "Pool Stats:"
flow scripts execute cadence/scripts/GetPoolStats.cdc --network emulator
echo "xINSURE Value per Token:"
flow scripts execute cadence/scripts/GetXInsureValuePerToken.cdc --network emulator
echo "Oracle Stats:"
flow scripts execute cadence/scripts/GetOracleStats.cdc --network emulator

# Step 4: Create Oracle data provider
echo "🔮 Creating Oracle data provider..."
flow transactions send cadence/transactions/CreateOracleDataProvider.cdc --network emulator --signer emulator-account

# Step 5: Setup user vault
echo "🏦 Setting up user vault..."
flow transactions send cadence/transactions/SetupUserVault.cdc --network emulator --signer emulator-account

# Step 6: Test capital deposit (LP deposits 2000 tokens for sufficient liquidity)
echo "💰 Testing capital deposit..."
flow transactions send cadence/transactions/DepositCapital.cdc 2000.0 --network emulator --signer emulator-account

# Step 7: Check pool stats after deposit
echo "📊 Pool stats after deposit:"
flow scripts execute cadence/scripts/GetPoolStats.cdc --network emulator

# Step 8: Register a test policy (use unique ID)
echo "📋 Registering test policy..."
flow transactions send cadence/transactions/RegisterPolicy.cdc 2 0xf8d6e0586b0a20c7 "LOCATION_002" "MAIZE" 500.0 --network emulator --signer emulator-account

# Step 9: Test premium collection (Farmer pays 50 premium for policy 2)
echo "💵 Testing premium collection..."
flow transactions send cadence/transactions/CollectPremium.cdc 2 50.0 --network emulator --signer emulator-account

# Step 10: Update weather data (simulate drought conditions)
echo "🌡️ Updating weather data (drought simulation)..."
flow transactions send cadence/transactions/UpdateWeatherData.cdc "LOCATION_001" 15.0 28.5 65.0 12.0 "Manual Test" --network emulator --signer emulator-account

# Step 11: Test RWA investment (invest 800 tokens in Treasury Bonds)
echo "📈 Testing RWA investment..."
flow transactions send cadence/transactions/InvestInRWA.cdc "Treasury Bonds" 800.0 --network emulator --signer emulator-account

# Step 12: Check RWA holdings
echo "� RWA Holdings:"
flow scripts execute cadence/scripts/GetRWAHoldings.cdc --network emulator

# Step 13: Test RWA redemption (redeem 400 tokens from Treasury Bonds)
echo "💸 Testing RWA redemption..."
flow transactions send cadence/transactions/RedeemRWAInvestment.cdc "Treasury Bonds" 400.0 --network emulator --signer emulator-account

# Step 14: Test payout trigger (use policy ID 2)
echo "🎯 Testing payout trigger..."
flow transactions send cadence/transactions/TriggerPayout.cdc 0xf8d6e0586b0a20c7 2 100.0 "Drought conditions detected" --network emulator --signer emulator-account

# Step 15: Test capital redemption (redeem 100 xINSURE tokens instead of 500)
echo "🔄 Testing capital redemption..."
flow transactions send cadence/transactions/RedeemCapital.cdc 100.0 --network emulator --signer emulator-account

# Step 16: Final state check
echo "📊 Final pool statistics:"
flow scripts execute cadence/scripts/GetPoolStats.cdc --network emulator
flow scripts execute cadence/scripts/GetAvailableLiquidity.cdc --network emulator
flow scripts execute cadence/scripts/GetPoolUtilization.cdc --network emulator
flow scripts execute cadence/scripts/GetOracleStats.cdc --network emulator

echo "✅ Test suite completed successfully!"
echo "=============================================="
