#!/bin/bash

# Test WeatherXM API Connection for Kenya
echo "Testing WeatherXM API connection for Kenya stations..."

API_KEY="154184a5-6634-405b-b237-b7d1e83557d3"
BASE_URL="https://api.weatherxm.com/api/v1"

echo "1. Testing API authentication..."
curl -H "Authorization: Bearer $API_KEY" \
     -H "Content-Type: application/json" \
     "$BASE_URL/devices" \
     -w "\nHTTP Status: %{http_code}\n" \
     -o api_test_response.json

echo ""
echo "2. Response content:"
cat api_test_response.json | head -20

echo ""
echo "3. Testing Kenya region search..."
curl -H "Authorization: Bearer $API_KEY" \
     -H "Content-Type: application/json" \
     "$BASE_URL/devices?lat=-1.2921&lon=36.8219&radius=500" \
     -w "\nHTTP Status: %{http_code}\n" \
     -o kenya_devices.json

echo ""
echo "4. Kenya devices found:"
cat kenya_devices.json | head -20

echo ""
echo "5. Cleaning up test files..."
rm -f api_test_response.json kenya_devices.json

echo "Test completed!"
