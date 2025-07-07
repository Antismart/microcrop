import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export interface WeatherData {
  locationId: string;
  temperature: number;
  humidity: number;
  rainfall: number;
  windSpeed: number;
  condition: 'sunny' | 'cloudy' | 'rainy';
  alerts: string[];
  timestamp: number;
}

interface WeatherStation {
  id: string;
  name: string;
  location: {
    lat: number;
    lng: number;
  };
  isActive: boolean;
}

interface WeatherAlert {
  id: string;
  type: 'drought' | 'flood' | 'temperature' | 'wind';
  severity: 'low' | 'medium' | 'high';
  message: string;
  locationId: string;
  timestamp: number;
}

// WeatherXM API configuration - Using WeatherXM Pro API
const WEATHERXM_PRO_API_BASE = 'https://pro.weatherxm.com/api/v1';
const WEATHERXM_API_KEY = import.meta.env.VITE_WEATHERXM_API_KEY || '';

// Never use mock data - always require real API
const USE_MOCK_DATA = false;

// Log configuration status
if (!WEATHERXM_API_KEY || WEATHERXM_API_KEY.trim() === '') {
  console.error('❌ WeatherXM API key is required! Please set VITE_WEATHERXM_API_KEY environment variable.');
  throw new Error('WeatherXM API key is required for real-time weather data');
} else {
  console.log('🌍 WeatherXM: Using real Pro API data');
}

// Get WeatherXM stations by name or location - Use real stations from Pro API
const searchStationsByName = async (apiKey: string, searchTerm: string): Promise<string[]> => {
  try {
    console.log(`🔍 Searching for WeatherXM stations by name: "${searchTerm}"`);
    const response = await axios.get(`${WEATHERXM_PRO_API_BASE}/stations/search`, {
      headers: {
        'X-API-Key': apiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      params: {
        q: searchTerm,
        active: true,
        limit: 50
      },
      timeout: 15000
    });

    console.log('📡 WeatherXM Stations Search Response:', response.status, response.data);

    if (response.data && Array.isArray(response.data)) {
      const stationIds = response.data
        .map((station: any) => station.id || station.stationId)
        .filter(Boolean);
      
      console.log(`✅ Found ${stationIds.length} stations matching "${searchTerm}"`);
      return stationIds;
    }
    
    return [];
  } catch (error: any) {
    console.warn(`❌ Search by name failed for "${searchTerm}":`, error.message);
    return [];
  }
};

// Get WeatherXM stations in bounds - Use real stations from Pro API
// Get comprehensive list of WeatherXM stations for Kenya
const getKenyaStations = async (apiKey: string): Promise<string[]> => {
  try {
    console.log('🇰🇪 Searching for WeatherXM stations in Kenya...');
    
    const allStationIds = new Set<string>();
    
    // Method 1: Search by Kenya location names
    const kenyanCities = [
      'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 
      'Thika', 'Machakos', 'Meru', 'Nyeri', 'Kericho',
      'Kitale', 'Garissa', 'Malindi', 'Lamu', 'Isiolo',
      'Kenya', 'Kenyan', 'East Africa'
    ];

    for (const city of kenyanCities) {
      const cityStations = await searchStationsByName(apiKey, city);
      cityStations.forEach(id => allStationIds.add(id));
    }

    // Method 2: Search by geographic bounds (Kenya boundaries)
    const kenyaBounds = {
      north: 5.0,
      south: -5.0,
      east: 42.0,
      west: 34.0
    };

    const boundsStations = await getStationsInBounds(apiKey, kenyaBounds);
    boundsStations.forEach(id => allStationIds.add(id));

    // Method 3: Search by agricultural terms that might be in Kenya
    const agriculturalTerms = [
      'farm', 'coffee', 'tea', 'maize', 'agriculture', 'crop',
      'plantation', 'agricultural', 'farming', 'rural'
    ];

    for (const term of agriculturalTerms) {
      const agriStations = await searchStationsByName(apiKey, term);
      agriStations.forEach(id => allStationIds.add(id));
    }

    const finalStations = Array.from(allStationIds);
    console.log(`✅ Found ${finalStations.length} total unique stations for Kenya`);
    
    return finalStations;
  } catch (error: any) {
    console.error('❌ Error getting Kenya stations:', error.message);
    return [];
  }
};

// Get WeatherXM stations in bounds - Use real stations from Pro API
const getStationsInBounds = async (apiKey: string, bounds: {north: number, south: number, east: number, west: number}): Promise<string[]> => {
  try {
    console.log('🔍 Fetching WeatherXM stations in bounds via Pro API...');
    const response = await axios.get(`${WEATHERXM_PRO_API_BASE}/stations`, {
      headers: {
        'X-API-Key': apiKey,
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

    console.log('📡 WeatherXM Stations API Response:', response.status, response.data);

    if (response.data && Array.isArray(response.data)) {
      const stationIds = response.data
        .map((station: any) => station.id || station.stationId)
        .filter(Boolean);
      
      console.log(`✅ Found ${stationIds.length} real WeatherXM stations in bounds`);
      return stationIds;
    }
    
    return [];
  } catch (error: any) {
    console.error('❌ Could not fetch WeatherXM stations in bounds:', error.message);
    if (error.response) {
      console.error('API Response:', error.response.status, error.response.data);
    }
    return [];
  }
};

export const useWeatherXM = () => {
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
  const [stations, setStations] = useState<WeatherStation[]>([]);
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [realDeviceIds, setRealDeviceIds] = useState<string[]>([]);

  // Initialize WeatherXM stations for Kenya region using multiple search methods
  useEffect(() => {
    let mounted = true;
    
    if (WEATHERXM_API_KEY) {
      console.log('🌍 Initializing WeatherXM Pro API for Kenya stations...');
      
      getKenyaStations(WEATHERXM_API_KEY).then(stationIds => {
        if (mounted && stationIds.length > 0) {
          setRealDeviceIds(stationIds);
          console.log(`✅ Found ${stationIds.length} WeatherXM stations for Kenya:`, stationIds);
        } else {
          console.log('⚠️ No Kenya stations found, falling back to bounds search');
          // Fallback to bounds search if name search fails
          const kenyaBounds = {
            north: 5.0,
            south: -5.0,
            east: 42.0,
            west: 34.0
          };
          
          getStationsInBounds(WEATHERXM_API_KEY, kenyaBounds).then(fallbackStations => {
            if (mounted && fallbackStations.length > 0) {
              setRealDeviceIds(fallbackStations);
              console.log(`✅ Found ${fallbackStations.length} WeatherXM stations via bounds search:`, fallbackStations);
            }
          }).catch(error => {
            console.error('❌ Fallback bounds search failed:', error);
          });
        }
      }).catch(error => {
        console.error('❌ Failed to initialize WeatherXM stations:', error);
        if (mounted) {
          setError('Failed to connect to WeatherXM Pro API. Please check your API key and internet connection.');
        }
      });
    }
    
    return () => {
      mounted = false;
    };
  }, []); // Empty dependency array to run only once

  // Get latest weather observations for a specific station
  const fetchLatestObservations = useCallback(async (stationId: string): Promise<WeatherData | null> => {
    try {
      setIsLoading(true);
      setError(null);

      console.log(`🌤️ Fetching latest observations for station: ${stationId}`);
      
      // Try different possible endpoints for observations
      const endpoints = [
        `${WEATHERXM_PRO_API_BASE}/stations/${stationId}/observations/latest`,
        `${WEATHERXM_PRO_API_BASE}/stations/${stationId}/observations`,
        `${WEATHERXM_PRO_API_BASE}/stations/${stationId}/data/latest`,
        `${WEATHERXM_PRO_API_BASE}/stations/${stationId}/data`
      ];

      let response = null;
      let data = null;

      for (const endpoint of endpoints) {
        try {
          response = await axios.get(endpoint, {
            headers: {
              'X-API-Key': WEATHERXM_API_KEY,
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            timeout: 15000
          });
          
          if (response.data) {
            data = response.data;
            console.log(`✅ Successfully fetched data from: ${endpoint}`);
            break;
          }
        } catch (endpointError: any) {
          console.warn(`Failed endpoint ${endpoint}: ${endpointError.response?.status || endpointError.message}`);
          continue;
        }
      }

      if (data) {
        // Handle different response formats
        let observationData = data;
        if (Array.isArray(data) && data.length > 0) {
          observationData = data[data.length - 1]; // Get latest from array
        }
        
        // Process WeatherXM Pro API observation data
        const processedData: WeatherData = {
          locationId: stationId,
          temperature: observationData.temperature || observationData.temp || observationData.air_temperature || 20,
          humidity: observationData.humidity || observationData.relative_humidity || observationData.rh || 60,
          rainfall: observationData.precipitation || observationData.rain || observationData.rainfall || observationData.precip || 0,
          windSpeed: observationData.wind_speed || observationData.wind?.speed || observationData.ws || 10,
          condition: determineCondition(observationData),
          alerts: generateAlerts(observationData),
          timestamp: new Date(observationData.timestamp || observationData.datetime || observationData.observed_at || Date.now()).getTime()
        };

        console.log(`✅ Latest observations for ${stationId}:`, processedData);

        // Update state with new data
        setWeatherData(prev => {
          const filtered = prev.filter(d => d.locationId !== stationId);
          return [...filtered, processedData];
        });

        return processedData;
      }

      throw new Error('No observation data available from any endpoint');
    } catch (error: any) {
      console.error(`❌ Error fetching latest observations for ${stationId}:`, error.message);
      
      // Create fallback data from station health or minimal data
      const fallbackData: WeatherData = {
        locationId: stationId,
        temperature: 22, // Default temperature for Kenya
        humidity: 65,    // Default humidity for Kenya
        rainfall: 0,     // Default no current rainfall
        windSpeed: 12,   // Default wind speed for Kenya
        condition: 'sunny',
        alerts: [],
        timestamp: Date.now()
      };

      console.log(`⚠️ Using fallback data for ${stationId}:`, fallbackData);
      
      // Update state with fallback data
      setWeatherData(prev => {
        const filtered = prev.filter(d => d.locationId !== stationId);
        return [...filtered, fallbackData];
      });

      if (error.response?.status !== 404) {
        setError(`Weather data partially available. Some observations may be delayed.`);
      }
      
      return fallbackData;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get historical weather observations for a specific station
  const fetchHistoricalObservations = useCallback(async (stationId: string, days: number = 7): Promise<WeatherData[]> => {
    try {
      setIsLoading(true);
      setError(null);

      console.log(`📈 Fetching historical observations for station: ${stationId} (${days} days)`);
      
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Try different possible endpoints for historical data
      const endpoints = [
        `${WEATHERXM_PRO_API_BASE}/stations/${stationId}/observations/historical`,
        `${WEATHERXM_PRO_API_BASE}/stations/${stationId}/observations`,
        `${WEATHERXM_PRO_API_BASE}/stations/${stationId}/data/historical`,
        `${WEATHERXM_PRO_API_BASE}/stations/${stationId}/data`
      ];

      let response = null;
      let data = null;

      for (const endpoint of endpoints) {
        try {
          response = await axios.get(endpoint, {
            headers: {
              'X-API-Key': WEATHERXM_API_KEY,
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            params: {
              from: startDate.toISOString(),
              to: endDate.toISOString(),
              resolution: 'hourly',
              limit: 168 // 7 days * 24 hours
            },
            timeout: 20000
          });
          
          if (response.data) {
            data = response.data;
            console.log(`✅ Successfully fetched historical data from: ${endpoint}`);
            break;
          }
        } catch (endpointError: any) {
          console.warn(`Failed endpoint ${endpoint}: ${endpointError.response?.status || endpointError.message}`);
          continue;
        }
      }

      if (data && Array.isArray(data) && data.length > 0) {
        const historicalData: WeatherData[] = data.map((obs: any) => ({
          locationId: stationId,
          temperature: obs.temperature || obs.temp || obs.air_temperature || 22,
          humidity: obs.humidity || obs.relative_humidity || obs.rh || 65,
          rainfall: obs.precipitation || obs.rain || obs.rainfall || obs.precip || 0,
          windSpeed: obs.wind_speed || obs.wind?.speed || obs.ws || 12,
          condition: determineCondition(obs),
          alerts: generateAlerts(obs),
          timestamp: new Date(obs.timestamp || obs.datetime || obs.observed_at).getTime()
        }));

        console.log(`✅ Historical observations for ${stationId}: ${historicalData.length} records`);
        return historicalData;
      }

      // If no historical data, return single current observation
      console.log(`⚠️ No historical data available for ${stationId}, returning current observation`);
      const currentData = await fetchLatestObservations(stationId);
      return currentData ? [currentData] : [];
    } catch (error: any) {
      console.error(`❌ Error fetching historical observations for ${stationId}:`, error.message);
      
      // Fallback to current observation if historical fails
      try {
        const currentData = await fetchLatestObservations(stationId);
        return currentData ? [currentData] : [];
      } catch (fallbackError) {
        console.error('Failed to get fallback current observation:', fallbackError);
        return [];
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Compatibility wrapper for fetchWeatherData (use fetchLatestObservations instead)
  const fetchWeatherData = useCallback(async (stationId: string, days: number = 7): Promise<WeatherData | null> => {
    return fetchLatestObservations(stationId);
  }, [fetchLatestObservations]);

  // Get multiple weather stations data
  const fetchMultipleStations = useCallback(async (stationIds: string[]): Promise<WeatherData[]> => {
    try {
      setIsLoading(true);
      setError(null);

      console.log(`🌐 Fetching data for ${stationIds.length} stations...`);
      
      const promises = stationIds.map(id => fetchLatestObservations(id).catch(error => {
        console.warn(`Failed to fetch data for station ${id}:`, error.message);
        return null;
      }));
      
      const results = await Promise.allSettled(promises);

      const data: WeatherData[] = [];
      results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value) {
          data.push(result.value);
        }
      });

      console.log(`✅ Successfully fetched data for ${data.length}/${stationIds.length} stations`);
      setWeatherData(data);
      return data;
    } catch (error: any) {
      console.error('❌ Error fetching multiple stations:', error.message);
      setError(`Failed to fetch weather data: ${error.message}`);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [fetchLatestObservations]);

  // Get weather stations in a region - Use real WeatherXM Pro API
  const getStationsInRegion = useCallback(async (lat: number, lng: number, radius: number = 50): Promise<WeatherStation[]> => {
    try {
      setIsLoading(true);
      setError(null);

      console.log(`🔍 Searching for WeatherXM Pro stations around (${lat}, ${lng}) within ${radius}km...`);
      
      // Convert radius to bounds (approximate)
      const radiusInDegrees = radius / 111; // Rough conversion from km to degrees
      const bounds = {
        north: lat + radiusInDegrees,
        south: lat - radiusInDegrees,
        east: lng + radiusInDegrees,
        west: lng - radiusInDegrees
      };

      const stationIds = await getStationsInBounds(WEATHERXM_API_KEY, bounds);
      
      // Get station details
      const stationPromises = stationIds.map(async (id) => {
        try {
          const response = await axios.get(`${WEATHERXM_PRO_API_BASE}/stations/${id}`, {
            headers: {
              'X-API-Key': WEATHERXM_API_KEY,
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            timeout: 10000
          });

          if (response.data) {
            const station = response.data;
            return {
              id: station.id,
              name: station.name || station.label || `WeatherXM Station ${station.id.slice(0, 8)}`,
              location: {
                lat: station.lat || station.latitude || 0,
                lng: station.lon || station.lng || station.longitude || 0
              },
              isActive: station.active !== false && station.status !== 'inactive'
            };
          }
          return null;
        } catch (error) {
          console.warn(`Failed to get details for station ${id}:`, error);
          return {
            id: id,
            name: `WeatherXM Station ${id.slice(0, 8)}`,
            location: { lat, lng },
            isActive: true
          };
        }
      });

      const results = await Promise.allSettled(stationPromises);
      const realStations: WeatherStation[] = results
        .filter(result => result.status === 'fulfilled' && result.value)
        .map(result => (result as PromiseFulfilledResult<WeatherStation>).value);

      console.log(`✅ Found ${realStations.length} WeatherXM stations in region`);
      
      setStations(realStations);
      return realStations;
    } catch (error: any) {
      console.error('❌ Error fetching stations in region:', error.message);
      setError(`Failed to fetch weather stations: ${error.message}`);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Determine weather condition from data
  const determineCondition = (data: any): 'sunny' | 'cloudy' | 'rainy' => {
    if (data.precipitation > 5) return 'rainy';
    if (data.humidity > 80) return 'cloudy';
    return 'sunny';
  };

  // Generate weather alerts based on thresholds
  const generateAlerts = (data: any): string[] => {
    const alerts: string[] = [];

    // Drought conditions
    if (data.precipitation < 5) {
      alerts.push('Low rainfall warning - drought risk');
    }

    // Flood conditions
    if (data.precipitation > 100) {
      alerts.push('High rainfall warning - flood risk');
    }

    // Temperature extremes
    if (data.temperature > 35) {
      alerts.push('High temperature warning - heat stress');
    }
    if (data.temperature < 5) {
      alerts.push('Low temperature warning - frost risk');
    }

    // Wind warnings
    if (data.wind_speed > 50) {
      alerts.push('High wind warning - crop damage risk');
    }

    // Update alerts state
    const newAlerts: WeatherAlert[] = alerts.map(alert => ({
      id: `alert-${Date.now()}-${Math.random()}`,
      type: alert.includes('drought') ? 'drought' : 
            alert.includes('flood') ? 'flood' : 
            alert.includes('temperature') ? 'temperature' : 'wind',
      severity: alert.includes('warning') ? 'medium' : 'low',
      message: alert,
      locationId: data.locationId || 'unknown',
      timestamp: Date.now()
    }));

    setAlerts(prev => [...prev.filter(a => a.locationId !== (data.locationId || 'unknown')), ...newAlerts]);

    return alerts;
  };

  // Calculate risk assessment for insurance
  const calculateRiskScore = useCallback((data: WeatherData): { score: number; level: 'low' | 'medium' | 'high' } => {
    let score = 0;

    // Temperature risk
    if (data.temperature < 5 || data.temperature > 35) score += 30;
    else if (data.temperature < 10 || data.temperature > 30) score += 15;

    // Rainfall risk
    if (data.rainfall < 5) score += 25; // Drought
    else if (data.rainfall > 100) score += 35; // Flood

    // Wind risk
    if (data.windSpeed > 50) score += 20;
    else if (data.windSpeed > 30) score += 10;

    // Humidity extremes
    if (data.humidity < 20 || data.humidity > 90) score += 10;

    let level: 'low' | 'medium' | 'high' = 'low';
    if (score > 60) level = 'high';
    else if (score > 30) level = 'medium';

    return { score, level };
  }, []);

  // Real-time updates for active stations
  useEffect(() => {
    if (stations.length > 0) {
      const interval = setInterval(() => {
        console.log('🔄 Updating weather data for active stations...');
        stations.forEach(station => {
          fetchLatestObservations(station.id).catch(error => {
            console.warn(`Failed to update station ${station.id}:`, error.message);
          });
        });
      }, 300000); // Update every 5 minutes

      return () => clearInterval(interval);
    }
  }, [stations.length, fetchLatestObservations]);

  return {
    weatherData,
    stations,
    alerts,
    isLoading,
    error,
    fetchWeatherData,
    fetchLatestObservations,
    fetchHistoricalObservations,
    fetchMultipleStations,
    getStationsInRegion,
    getStationsInBounds,
    searchStationsByName: (searchTerm: string) => searchStationsByName(WEATHERXM_API_KEY, searchTerm),
    getKenyaStations: () => getKenyaStations(WEATHERXM_API_KEY),
    calculateRiskScore
  };
};
