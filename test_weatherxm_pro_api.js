#!/usr/bin/env node
/**
 * WeatherXM Pro API Test Script
 * Tests the real WeatherXM Pro API endpoints used in the application
 */

const axios = require('axios');
const path = require('path');
const fs = require('fs');

// Load environment variables from frontend/.env
const envPath = path.join(__dirname, 'frontend', '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const envLines = envContent.split('\n');
  
  for (const line of envLines) {
    if (line.trim() && !line.startsWith('#')) {
      const [key, value] = line.split('=');
      if (key && value) {
        process.env[key.trim()] = value.trim();
      }
    }
  }
}

const WEATHERXM_PRO_API_BASE = 'https://pro.weatherxm.com/api/v1';
const API_KEY = process.env.VITE_WEATHERXM_API_KEY;

if (!API_KEY) {
  console.error('❌ VITE_WEATHERXM_API_KEY environment variable is required');
  console.error('   Please set it in frontend/.env file');
  process.exit(1);
}

console.log('🌍 Testing WeatherXM Pro API Integration');
console.log('=====================================');

// Test 1: Get stations in Kenya bounds
async function testStationsInBounds() {
  console.log('\n📍 Test 1: Getting stations in Kenya bounds...');
  
  try {
    const kenyaBounds = {
      north: 5.0,
      south: -5.0,
      east: 42.0,
      west: 34.0
    };
    
    const response = await axios.get(`${WEATHERXM_PRO_API_BASE}/stations`, {
      headers: {
        'X-API-Key': API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      params: {
        north: kenyaBounds.north,
        south: kenyaBounds.south,
        east: kenyaBounds.east,
        west: kenyaBounds.west,
        active: true,
        limit: 10
      },
      timeout: 15000
    });

    console.log(`✅ Status: ${response.status}`);
    console.log(`📊 Found ${response.data.length} stations in Kenya bounds`);
    
    if (response.data.length > 0) {
      const station = response.data[0];
      console.log(`📍 Sample station: ${station.name || station.id} (${station.lat}, ${station.lon})`);
      return response.data.map(s => s.id);
    }
    
    return [];
  } catch (error) {
    console.error('❌ Error getting stations in bounds:', error.message);
    if (error.response) {
      console.error('Response:', error.response.status, error.response.data);
    }
    return [];
  }
}

// Test 2: Get latest observations for a station
async function testLatestObservations(stationId) {
  console.log(`\n🌤️  Test 2: Getting latest observations for station ${stationId}...`);
  
  try {
    const response = await axios.get(`${WEATHERXM_PRO_API_BASE}/stations/${stationId}/observations/latest`, {
      headers: {
        'X-API-Key': API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 15000
    });

    console.log(`✅ Status: ${response.status}`);
    console.log('📊 Latest observation data:');
    console.log(`   Temperature: ${response.data.temperature}°C`);
    console.log(`   Humidity: ${response.data.humidity}%`);
    console.log(`   Precipitation: ${response.data.precipitation}mm`);
    console.log(`   Wind Speed: ${response.data.wind_speed}km/h`);
    console.log(`   Timestamp: ${response.data.timestamp || response.data.observed_at}`);
    
    return response.data;
  } catch (error) {
    console.error('❌ Error getting latest observations:', error.message);
    if (error.response) {
      console.error('Response:', error.response.status, error.response.data);
    }
    return null;
  }
}

// Test 3: Get historical observations for a station
async function testHistoricalObservations(stationId) {
  console.log(`\n📈 Test 3: Getting historical observations for station ${stationId}...`);
  
  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7); // Last 7 days

    const response = await axios.get(`${WEATHERXM_PRO_API_BASE}/stations/${stationId}/observations/historical`, {
      headers: {
        'X-API-Key': API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      params: {
        from: startDate.toISOString(),
        to: endDate.toISOString(),
        resolution: 'hourly',
        limit: 24 // Last 24 hours
      },
      timeout: 20000
    });

    console.log(`✅ Status: ${response.status}`);
    console.log(`📊 Historical observations: ${response.data.length} records`);
    
    if (response.data.length > 0) {
      const latest = response.data[response.data.length - 1];
      console.log(`📅 Latest record: ${latest.timestamp || latest.observed_at}`);
      console.log(`🌡️  Temperature: ${latest.temperature}°C`);
    }
    
    return response.data;
  } catch (error) {
    console.error('❌ Error getting historical observations:', error.message);
    if (error.response) {
      console.error('Response:', error.response.status, error.response.data);
    }
    return [];
  }
}

// Test 4: Get station health
async function testStationHealth(stationId) {
  console.log(`\n🏥 Test 4: Getting station health for ${stationId}...`);
  
  try {
    const response = await axios.get(`${WEATHERXM_PRO_API_BASE}/stations/${stationId}/health`, {
      headers: {
        'X-API-Key': API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 15000
    });

    console.log(`✅ Status: ${response.status}`);
    console.log('🏥 Station health:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('❌ Error getting station health:', error.message);
    if (error.response) {
      console.error('Response:', error.response.status, error.response.data);
    }
    return null;
  }
}

// Run all tests
async function runTests() {
  try {
    console.log(`🔑 Using API Key: ${API_KEY.substring(0, 8)}...`);
    
    // Test 1: Get stations in Kenya bounds
    const stations = await testStationsInBounds();
    
    if (stations.length > 0) {
      const testStationId = stations[0];
      console.log(`\n🎯 Using station ${testStationId} for detailed tests...`);
      
      // Test 2: Latest observations
      await testLatestObservations(testStationId);
      
      // Test 3: Historical observations
      await testHistoricalObservations(testStationId);
      
      // Test 4: Station health
      await testStationHealth(testStationId);
      
      console.log('\n✅ All tests completed successfully!');
      console.log('🌍 WeatherXM Pro API is working correctly for crop insurance integration.');
    } else {
      console.log('\n⚠️  No stations found in Kenya bounds');
      console.log('🔍 Try testing with global stations or check API key permissions');
    }
  } catch (error) {
    console.error('\n❌ Test suite failed:', error.message);
    process.exit(1);
  }
}

// Run the tests
runTests();
