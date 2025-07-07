import React, { useEffect, useState } from 'react';
import { useWeatherXM } from '../hooks/useWeatherXM';

const WeatherXMTestComponent: React.FC = () => {
  const { 
    weatherData, 
    stations, 
    alerts, 
    isLoading, 
    error, 
    fetchLatestObservations,
    getStationsInRegion,
    fetchMultipleStations,
    searchStationsByName,
    getKenyaStations
  } = useWeatherXM();

  const [testResults, setTestResults] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('Kenya');

  useEffect(() => {
    // Test comprehensive station search including by name
    const testWeatherXM = async () => {
      try {
        addTestResult('🌍 Starting comprehensive WeatherXM Pro API test...');
        
        // Test 1: Search stations by name
        addTestResult('🔍 Testing search by name for "Kenya"...');
        const kenyaNameStations = await searchStationsByName('Kenya');
        addTestResult(`✅ Found ${kenyaNameStations.length} stations with "Kenya" in name`);
        
        // Test 2: Search stations by name for "Nairobi"
        addTestResult('🔍 Testing search by name for "Nairobi"...');
        const nairobiStations = await searchStationsByName('Nairobi');
        addTestResult(`✅ Found ${nairobiStations.length} stations with "Nairobi" in name`);
        
        // Test 3: Search stations by agricultural terms
        addTestResult('🔍 Testing search by name for "farm"...');
        const farmStations = await searchStationsByName('farm');
        addTestResult(`✅ Found ${farmStations.length} stations with "farm" in name`);
        
        // Test 4: Comprehensive Kenya stations search
        addTestResult('🇰🇪 Testing comprehensive Kenya stations search...');
        const allKenyaStations = await getKenyaStations();
        addTestResult(`✅ Found ${allKenyaStations.length} total stations via comprehensive Kenya search`);
        
        // Test 5: Get stations in Kenya region by coordinates
        addTestResult('📍 Testing stations in Kenya region by coordinates...');
        const kenyaStations = await getStationsInRegion(-1.2921, 36.8219, 500); // Nairobi with 500km radius
        addTestResult(`✅ Found ${kenyaStations.length} stations in Kenya geographic region`);
        
        if (kenyaStations.length > 0) {
          // Test 6: Get weather data for first station
          addTestResult(`🌤️ Testing weather data for first station: ${kenyaStations[0].id}`);
          const weatherData = await fetchLatestObservations(kenyaStations[0].id);
          
          if (weatherData) {
            addTestResult(`✅ Weather data received:`);
            addTestResult(`   Station: ${kenyaStations[0].name}`);
            addTestResult(`   Temperature: ${weatherData.temperature}°C`);
            addTestResult(`   Humidity: ${weatherData.humidity}%`);
            addTestResult(`   Rainfall: ${weatherData.rainfall}mm`);
            addTestResult(`   Wind Speed: ${weatherData.windSpeed}km/h`);
            addTestResult(`   Condition: ${weatherData.condition}`);
            addTestResult(`   Alerts: ${weatherData.alerts.length} alerts`);
          }
          
          // Test 7: Get multiple stations data
          addTestResult(`🌐 Testing multiple stations data (max 3)...`);
          const firstThree = kenyaStations.slice(0, 3);
          const multipleData = await fetchMultipleStations(firstThree.map(s => s.id));
          addTestResult(`✅ Fetched data for ${multipleData.length}/${firstThree.length} stations`);
        }
        
        addTestResult('🎉 WeatherXM Pro API test completed successfully!');
        addTestResult('📝 Summary:');
        addTestResult(`   - Search by name is ${kenyaNameStations.length > 0 || nairobiStations.length > 0 ? 'working' : 'not available'}`);
        addTestResult(`   - Geographic search found ${kenyaStations.length} stations`);
        addTestResult(`   - Comprehensive search found ${allKenyaStations.length} unique stations`);
        
      } catch (error: any) {
        addTestResult(`❌ Test failed: ${error.message}`);
      }
    };

    testWeatherXM();
  }, []);

  const addTestResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const handleManualSearch = async () => {
    try {
      addTestResult(`🔍 Manual search for "${searchTerm}"...`);
      const results = await searchStationsByName(searchTerm);
      addTestResult(`✅ Found ${results.length} stations matching "${searchTerm}"`);
      
      if (results.length > 0) {
        addTestResult(`   Station IDs: ${results.slice(0, 5).join(', ')}${results.length > 5 ? '...' : ''}`);
      }
    } catch (error: any) {
      addTestResult(`❌ Search failed: ${error.message}`);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">WeatherXM Pro API Integration Test</h1>
      
      {/* Manual Search Interface */}
      <div className="mb-6 bg-blue-50 rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-3">Manual Station Search</h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Enter search term (e.g., Kenya, Nairobi, farm)"
            className="flex-1 px-3 py-2 border rounded-md"
          />
          <button
            onClick={handleManualSearch}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            Search
          </button>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Try searching for: Kenya, Nairobi, Mombasa, farm, coffee, tea, agriculture
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Test Results */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-3">Test Results</h2>
          <div className="space-y-1 text-sm max-h-96 overflow-y-auto">
            {testResults.map((result, index) => (
              <div key={index} className="font-mono text-xs">
                {result}
              </div>
            ))}
          </div>
        </div>

        {/* Current Status */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-3">Current Status</h2>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Loading:</span>
              <span className={`px-2 py-1 rounded text-xs ${isLoading ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                {isLoading ? 'Loading...' : 'Ready'}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Error:</span>
              <span className={`px-2 py-1 rounded text-xs ${error ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                {error || 'No errors'}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Stations:</span>
              <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
                {stations.length} stations
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Weather Data:</span>
              <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
                {weatherData.length} records
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Alerts:</span>
              <span className="px-2 py-1 rounded text-xs bg-orange-100 text-orange-800">
                {alerts.length} alerts
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stations List */}
      {stations.length > 0 && (
        <div className="mt-6 bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-3">Available Stations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {stations.map((station) => (
              <div key={station.id} className="border rounded p-3">
                <div className="font-medium text-sm truncate">{station.name}</div>
                <div className="text-xs text-gray-600 mt-1">
                  {station.location.lat.toFixed(4)}, {station.location.lng.toFixed(4)}
                </div>
                <div className="text-xs mt-1">
                  <span className={`px-2 py-1 rounded ${station.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {station.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Weather Data */}
      {weatherData.length > 0 && (
        <div className="mt-6 bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-3">Weather Data</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {weatherData.map((data) => (
              <div key={data.locationId} className="border rounded p-3">
                <div className="font-medium text-sm truncate">{data.locationId}</div>
                <div className="text-xs text-gray-600 mt-1">
                  {new Date(data.timestamp).toLocaleString()}
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                  <div>Temp: {data.temperature}°C</div>
                  <div>Humidity: {data.humidity}%</div>
                  <div>Rain: {data.rainfall}mm</div>
                  <div>Wind: {data.windSpeed}km/h</div>
                </div>
                <div className="text-xs mt-1">
                  <span className={`px-2 py-1 rounded ${
                    data.condition === 'sunny' ? 'bg-yellow-100 text-yellow-800' :
                    data.condition === 'rainy' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {data.condition}
                  </span>
                </div>
                {data.alerts.length > 0 && (
                  <div className="text-xs mt-1 text-orange-600">
                    {data.alerts.length} alerts
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default WeatherXMTestComponent;
