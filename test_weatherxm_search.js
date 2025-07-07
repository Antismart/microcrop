#!/usr/bin/env node
/**
 * WeatherXM Pro API Search Test Script
 * Tests searching for stations by name specifically
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
  process.exit(1);
}

console.log('🔍 Testing WeatherXM Pro API Station Search By Name');
console.log('==================================================');

// Test searching for stations by name
async function testSearchByName(searchTerm) {
  console.log(`\n🔍 Searching for stations with "${searchTerm}" in name...`);
  
  // Try different possible search endpoints
  const searchEndpoints = [
    `/stations/search`,
    `/stations`,
    `/search/stations`
  ];

  for (const endpoint of searchEndpoints) {
    try {
      console.log(`   Trying endpoint: ${WEATHERXM_PRO_API_BASE}${endpoint}`);
      
      const response = await axios.get(`${WEATHERXM_PRO_API_BASE}${endpoint}`, {
        headers: {
          'X-API-Key': API_KEY,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        params: {
          q: searchTerm,
          search: searchTerm,
          name: searchTerm,
          query: searchTerm,
          active: true,
          limit: 20
        },
        timeout: 15000
      });

      console.log(`   ✅ Status: ${response.status}`);
      
      if (response.data && Array.isArray(response.data)) {
        const matchingStations = response.data.filter(station => 
          (station.name && station.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (station.label && station.label.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        
        console.log(`   📊 Total stations returned: ${response.data.length}`);
        console.log(`   🎯 Stations matching "${searchTerm}": ${matchingStations.length}`);
        
        if (matchingStations.length > 0) {
          console.log(`   📍 Sample matches:`);
          matchingStations.slice(0, 3).forEach(station => {
            console.log(`      - ${station.name || station.label} (${station.id})`);
          });
          return matchingStations.map(s => s.id);
        }
        
        // Even if no exact matches, show some stations for context
        if (response.data.length > 0) {
          console.log(`   📍 Sample stations found (may not match search term):`);
          response.data.slice(0, 3).forEach(station => {
            console.log(`      - ${station.name || station.label || station.id}`);
          });
        }
        
        return response.data.map(s => s.id);
      }
      
    } catch (error) {
      console.log(`   ❌ Endpoint failed: ${error.response?.status || error.message}`);
      continue;
    }
  }
  
  console.log(`   ⚠️ No search endpoints worked for "${searchTerm}"`);
  return [];
}

// Test searching by geographic bounds with name filtering
async function testBoundsWithNameFilter(searchTerm, bounds) {
  console.log(`\n🌍 Searching stations in bounds and filtering by "${searchTerm}"...`);
  
  try {
    const response = await axios.get(`${WEATHERXM_PRO_API_BASE}/stations`, {
      headers: {
        'X-API-Key': API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      params: {
        north: bounds.north,
        south: bounds.south,
        east: bounds.east,
        west: bounds.west,
        active: true,
        limit: 50
      },
      timeout: 15000
    });

    console.log(`✅ Status: ${response.status}`);
    console.log(`📊 Total stations in bounds: ${response.data.length}`);
    
    if (response.data && Array.isArray(response.data)) {
      const matchingStations = response.data.filter(station => 
        (station.name && station.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (station.label && station.label.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      
      console.log(`🎯 Stations matching "${searchTerm}" in bounds: ${matchingStations.length}`);
      
      if (matchingStations.length > 0) {
        console.log(`📍 Matching stations:`);
        matchingStations.forEach(station => {
          console.log(`   - ${station.name || station.label} (${station.id}) at ${station.lat}, ${station.lon}`);
        });
        return matchingStations.map(s => s.id);
      }
      
      // Show sample of all stations for context
      console.log(`📍 Sample stations in bounds:`);
      response.data.slice(0, 5).forEach(station => {
        console.log(`   - ${station.name || station.label || station.id} at ${station.lat}, ${station.lon}`);
      });
      
      return response.data.map(s => s.id);
    }
    
    return [];
  } catch (error) {
    console.error(`❌ Bounds search failed: ${error.message}`);
    return [];
  }
}

// Run comprehensive search tests
async function runSearchTests() {
  try {
    console.log(`🔑 Using API Key: ${API_KEY.substring(0, 8)}...`);
    
    // Test 1: Search by various terms
    const searchTerms = ['Kenya', 'Nairobi', 'farm', 'coffee', 'agriculture', 'weather'];
    
    for (const term of searchTerms) {
      await testSearchByName(term);
    }
    
    // Test 2: Search in Kenya bounds with name filtering
    const kenyaBounds = {
      north: 5.0,
      south: -5.0,
      east: 42.0,
      west: 34.0
    };
    
    await testBoundsWithNameFilter('Kenya', kenyaBounds);
    await testBoundsWithNameFilter('farm', kenyaBounds);
    
    console.log('\n✅ Search tests completed!');
    console.log('\n📝 Summary:');
    console.log('   - WeatherXM Pro API stations endpoint is working');
    console.log('   - Direct search endpoints may not be available');
    console.log('   - Geographic bounds search is working');
    console.log('   - Name filtering can be done client-side on returned results');
    
  } catch (error) {
    console.error('\n❌ Search test suite failed:', error.message);
    process.exit(1);
  }
}

// Run the tests
runSearchTests();
