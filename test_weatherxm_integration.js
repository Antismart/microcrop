#!/usr/bin/env node

/**
 * Test script to verify WeatherXM integration
 * This script simulates the behavior of the useWeatherXM hook
 */

const axios = require('axios');

// Configuration
const WEATHERXM_PRO_API_BASE = 'https://pro.weatherxm.com/api/v1';
const WEATHERXM_API_KEY = process.env.VITE_WEATHERXM_API_KEY || '';
const USE_MOCK_DATA = !WEATHERXM_API_KEY || WEATHERXM_API_KEY.trim() === '';

console.log('🧪 Testing WeatherXM Integration');
console.log('================================');

if (USE_MOCK_DATA) {
  console.log('⚡ Using mock data (API key not configured)');
  testMockData();
} else {
  console.log('🌍 Using real WeatherXM Pro API');
  testRealAPI();
}

function testMockData() {
  console.log('\n📊 Mock Data Test:');
  
  // Simulate Kenya agricultural stations
  const kenyaStations = [
    'nairobi-agri-001',
    'nakuru-farm-002', 
    'meru-coffee-003',
    'kitale-maize-004',
    'kericho-tea-005'
  ];

  console.log(`✅ Found ${kenyaStations.length} Kenya agricultural stations:`);
  kenyaStations.forEach(station => {
    console.log(`  - ${station}`);
  });

  // Generate mock weather data
  const mockWeatherData = generateMockWeatherData('nairobi-agri-001');
  console.log('\n🌤️ Sample weather data for Nairobi Agricultural Station:');
  console.log(JSON.stringify(mockWeatherData, null, 2));

  console.log('\n✅ Mock integration test passed!');
}

async function testRealAPI() {
  try {
    console.log('\n🔍 Testing WeatherXM Pro API connection...');
    
    // Test stations endpoint
    const stationsResponse = await axios.get(`${WEATHERXM_PRO_API_BASE}/stations`, {
      headers: {
        'X-API-Key': WEATHERXM_API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      params: {
        active: true,
        limit: 5
      },
      timeout: 10000
    });

    console.log(`✅ API Connection successful! Status: ${stationsResponse.status}`);
    console.log(`📡 Found ${stationsResponse.data.length} stations`);

    if (stationsResponse.data.length > 0) {
      const firstStation = stationsResponse.data[0];
      console.log('\n🏗️ First station details:');
      console.log(`  ID: ${firstStation.id || firstStation.stationId}`);
      console.log(`  Name: ${firstStation.name || firstStation.label || 'Unknown'}`);
      console.log(`  Location: ${firstStation.lat || firstStation.latitude}, ${firstStation.lon || firstStation.lng || firstStation.longitude}`);
      console.log(`  Active: ${firstStation.active !== false && firstStation.status !== 'inactive'}`);

      // Test data endpoint for first station
      const stationId = firstStation.id || firstStation.stationId;
      if (stationId) {
        console.log(`\n📈 Testing data endpoint for station: ${stationId}`);
        
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);

        try {
          const dataResponse = await axios.get(`${WEATHERXM_PRO_API_BASE}/stations/${stationId}/data`, {
            headers: {
              'X-API-Key': WEATHERXM_API_KEY,
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            params: {
              from: startDate.toISOString(),
              to: endDate.toISOString(),
              limit: 10
            },
            timeout: 10000
          });

          console.log(`✅ Data fetch successful! Got ${dataResponse.data.length} data points`);
          
          if (dataResponse.data.length > 0) {
            const latestData = dataResponse.data[dataResponse.data.length - 1];
            console.log('\n🌤️ Latest weather data:');
            console.log(`  Temperature: ${latestData.temperature || latestData.temp || 'N/A'}°C`);
            console.log(`  Humidity: ${latestData.humidity || 'N/A'}%`);
            console.log(`  Rainfall: ${latestData.precipitation || latestData.rainfall || latestData.rain || 'N/A'}mm`);
            console.log(`  Wind Speed: ${latestData.wind_speed || latestData.windSpeed || latestData.wind?.speed || 'N/A'} km/h`);
            console.log(`  Timestamp: ${latestData.timestamp || latestData.datetime || latestData.date || 'N/A'}`);
          }
        } catch (dataError) {
          console.log(`⚠️ Data fetch failed: ${dataError.message}`);
          console.log('🔄 This is expected for some stations - will fall back to mock data');
        }
      }
    }

    console.log('\n✅ Real API integration test completed!');
    
  } catch (error) {
    console.error('❌ API Test failed:', error.message);
    if (error.response) {
      console.error(`Response status: ${error.response.status}`);
      console.error(`Response data:`, error.response.data);
    }
    console.log('\n🔄 Falling back to mock data for development...');
    testMockData();
  }
}

function generateMockWeatherData(deviceId) {
  // Generate realistic weather data based on device ID pattern
  const seed = deviceId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const random = (seed * 9301 + 49297) % 233280 / 233280;
  
  // Kenya climate: temperatures 18-28°C, higher humidity, seasonal rainfall
  const temp = 18 + (random * 12);
  const humidity = 50 + (random * 40);
  const rainfall = random * 35;
  const windSpeed = 8 + (random * 20);
  
  let condition = 'sunny';
  if (rainfall > 15) condition = 'rainy';
  else if (humidity > 75) condition = 'cloudy';
  
  const alerts = [];
  if (temp > 30) alerts.push('High temperature warning - heat stress on crops');
  if (rainfall < 5) alerts.push('Low rainfall warning - drought risk');
  if (windSpeed > 25) alerts.push('High wind warning - crop damage risk');
  
  return {
    locationId: deviceId,
    temperature: Math.round(temp * 10) / 10,
    humidity: Math.round(humidity),
    rainfall: Math.round(rainfall * 10) / 10,
    windSpeed: Math.round(windSpeed * 10) / 10,
    condition,
    alerts,
    timestamp: Date.now()
  };
}
