#!/bin/bash

# Test script for WeatherXM integration with Flow blockchain
# This script tests the full integration pipeline

echo "🌡️  Testing WeatherXM Integration with Flow Blockchain"
echo "=================================================="

# Check if we're in the correct directory
if [ ! -d "frontend" ] || [ ! -d "contracts" ]; then
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

# Check environment variables
echo "🔍 Checking environment configuration..."
if [ -f "frontend/.env" ]; then
    echo "✅ Environment file found"
    source frontend/.env
    
    if [ -z "$VITE_WEATHERXM_API_KEY" ]; then
        echo "⚠️  WeatherXM API key not set"
    else
        echo "✅ WeatherXM API key configured"
    fi
    
    if [ -z "$VITE_FLOW_ACCESS_NODE" ]; then
        echo "❌ Flow access node not configured"
    else
        echo "✅ Flow access node: $VITE_FLOW_ACCESS_NODE"
    fi
    
    if [ -z "$VITE_ORACLE_CONTRACT_ADDRESS" ]; then
        echo "❌ Oracle contract address not configured"
    else
        echo "✅ Oracle contract: $VITE_ORACLE_CONTRACT_ADDRESS"
    fi
else
    echo "❌ Environment file not found"
    exit 1
fi

# Test Flow CLI connection
echo ""
echo "🔗 Testing Flow CLI connection..."
cd contracts
if command -v flow &> /dev/null; then
    echo "✅ Flow CLI installed"
    
    # Test connection to testnet
    flow accounts get $VITE_ORACLE_CONTRACT_ADDRESS --network testnet > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo "✅ Flow testnet connection successful"
    else
        echo "❌ Cannot connect to Flow testnet"
    fi
else
    echo "❌ Flow CLI not installed"
fi

# Test WeatherXM API connection
echo ""
echo "🌐 Testing WeatherXM API connection..."
cd ../frontend
if command -v curl &> /dev/null; then
    response=$(curl -s -w "%{http_code}" -H "Authorization: Bearer $VITE_WEATHERXM_API_KEY" \
        "https://pro-api.weatherxm.com/v1/devices" -o /dev/null)
    
    if [ "$response" = "200" ]; then
        echo "✅ WeatherXM API connection successful"
    elif [ "$response" = "401" ]; then
        echo "❌ WeatherXM API authentication failed (invalid API key)"
    else
        echo "⚠️  WeatherXM API returned status code: $response"
    fi
else
    echo "❌ curl not available for API testing"
fi

# Test frontend dependencies
echo ""
echo "📦 Checking frontend dependencies..."
if [ -f "package.json" ]; then
    echo "✅ package.json found"
    
    if [ -d "node_modules" ]; then
        echo "✅ Dependencies installed"
    else
        echo "⚠️  Dependencies not installed, running npm install..."
        npm install
    fi
    
    # Check for key dependencies
    if grep -q "@onflow/fcl" package.json; then
        echo "✅ Flow FCL dependency present"
    else
        echo "❌ Flow FCL dependency missing"
    fi
    
    if grep -q "axios" package.json; then
        echo "✅ Axios dependency present"
    else
        echo "❌ Axios dependency missing"
    fi
else
    echo "❌ package.json not found"
fi

# Test TypeScript compilation
echo ""
echo "🔨 Testing TypeScript compilation..."
if command -v npx &> /dev/null; then
    npx tsc --noEmit --skipLibCheck > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo "✅ TypeScript compilation successful"
    else
        echo "⚠️  TypeScript compilation has errors"
    fi
else
    echo "❌ npx not available"
fi

# Test build process
echo ""
echo "🏗️  Testing build process..."
npm run build > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Build successful"
else
    echo "❌ Build failed"
fi

# Generate test report
echo ""
echo "📊 Integration Test Summary"
echo "=========================="
echo "✅ = Working correctly"
echo "⚠️  = Needs attention"
echo "❌ = Critical issue"
echo ""
echo "Next steps:"
echo "1. Fix any critical issues (❌)"
echo "2. Address warnings (⚠️)"
echo "3. Run 'npm run dev' to start development server"
echo "4. Test WeatherXM integration in browser"
echo ""

echo "🚀 Integration test completed!"
