import { useState, useEffect, useCallback } from 'react';
import { useWeatherXM, WeatherData } from './useWeatherXM';
import { WeatherXMFlowService } from '../services/WeatherXMFlowService';

interface PolicyInfo {
  policyId: string;
  farmerAddress: string;
  locationId: string;
  cropType: string;
  coverageAmount: number;
  isActive: boolean;
}

interface PoolStats {
  totalLiquidity: number;
  totalPolicies: number;
  totalPayouts: number;
  utilizationRate: number;
}

export const useWeatherXMFlow = () => {
  const [policies, setPolicies] = useState<PolicyInfo[]>([]);
  const [poolStats, setPoolStats] = useState<PoolStats | null>(null);
  const [isUpdatingChain, setIsUpdatingChain] = useState(false);
  const [chainError, setChainError] = useState<string | null>(null);
  const [lastUpdateTime, setLastUpdateTime] = useState<number>(0);
  
  const {
    weatherData,
    stations,
    alerts,
    isLoading: isLoadingWeather,
    error: weatherError,
    fetchWeatherData,
    fetchMultipleStations,
    getStationsInRegion,
    calculateRiskScore
  } = useWeatherXM();

  /**
   * Update weather data on the Flow blockchain
   */
  const updateWeatherOnChain = useCallback(async (weatherData: WeatherData): Promise<boolean> => {
    try {
      setIsUpdatingChain(true);
      setChainError(null);

      // Validate weather data before sending
      if (!WeatherXMFlowService.validateWeatherData(weatherData)) {
        throw new Error('Invalid weather data');
      }

      const txId = await WeatherXMFlowService.updateWeatherDataOnChain(weatherData);
      console.log('Weather data updated on chain:', txId);
      setLastUpdateTime(Date.now());
      return true;
    } catch (error: any) {
      console.error('Error updating weather data on chain:', error);
      setChainError(error.message || 'Failed to update weather data on blockchain');
      return false;
    } finally {
      setIsUpdatingChain(false);
    }
  }, []);

  /**
   * Bulk update multiple weather data points on chain
   */
  const bulkUpdateWeatherOnChain = useCallback(async (weatherDataArray: WeatherData[]): Promise<string[]> => {
    try {
      setIsUpdatingChain(true);
      setChainError(null);

      // Filter valid weather data
      const validWeatherData = weatherDataArray.filter(data => 
        WeatherXMFlowService.validateWeatherData(data)
      );

      if (validWeatherData.length === 0) {
        throw new Error('No valid weather data to update');
      }

      const txIds = await WeatherXMFlowService.bulkUpdateWeatherData(validWeatherData);
      console.log('Bulk weather data updated on chain:', txIds);
      setLastUpdateTime(Date.now());
      return txIds;
    } catch (error: any) {
      console.error('Error bulk updating weather data:', error);
      setChainError(error.message || 'Failed to bulk update weather data');
      return [];
    } finally {
      setIsUpdatingChain(false);
    }
  }, []);

  /**
   * Register a new insurance policy
   */
  const registerPolicy = useCallback(async (
    locationId: string,
    cropType: string,
    coverageAmount: number,
    premiumAmount: number
  ): Promise<boolean> => {
    try {
      setIsUpdatingChain(true);
      setChainError(null);

      const txId = await WeatherXMFlowService.registerPolicy(
        locationId,
        cropType,
        coverageAmount,
        premiumAmount
      );
      
      console.log('Policy registered:', txId);
      
      // Refresh policies after registration
      await refreshPolicies();
      return true;
    } catch (error: any) {
      console.error('Error registering policy:', error);
      setChainError(error.message || 'Failed to register policy');
      return false;
    } finally {
      setIsUpdatingChain(false);
    }
  }, []);

  /**
   * Check trigger conditions for all policies
   */
  const checkTriggerConditions = useCallback(async (): Promise<boolean> => {
    try {
      setIsUpdatingChain(true);
      setChainError(null);

      const txId = await WeatherXMFlowService.checkTriggerConditions();
      console.log('Trigger conditions checked:', txId);
      return true;
    } catch (error: any) {
      console.error('Error checking trigger conditions:', error);
      setChainError(error.message || 'Failed to check trigger conditions');
      return false;
    } finally {
      setIsUpdatingChain(false);
    }
  }, []);

  /**
   * Refresh user policies from blockchain
   */
  const refreshPolicies = useCallback(async (): Promise<void> => {
    try {
      const userPolicies = await WeatherXMFlowService.getUserPolicies();
      setPolicies(userPolicies);
    } catch (error: any) {
      console.error('Error refreshing policies:', error);
      setChainError(error.message || 'Failed to refresh policies');
    }
  }, []);

  /**
   * Refresh pool statistics
   */
  const refreshPoolStats = useCallback(async (): Promise<void> => {
    try {
      const stats = await WeatherXMFlowService.getPoolStats();
      setPoolStats(stats);
    } catch (error: any) {
      console.error('Error refreshing pool stats:', error);
      setChainError(error.message || 'Failed to refresh pool statistics');
    }
  }, []);

  /**
   * Auto-sync weather data with blockchain - Optimized to prevent re-renders
   */
  const autoSyncWeatherData = useCallback(async (): Promise<void> => {
    if (weatherData.length === 0) return;

    try {
      // Get weather data that needs to be synced (recent data)
      const recentWeatherData = weatherData.filter(data => 
        data.timestamp > lastUpdateTime - (5 * 60 * 1000) // Last 5 minutes
      );

      if (recentWeatherData.length > 0) {
        await bulkUpdateWeatherOnChain(recentWeatherData);
      }
    } catch (error) {
      console.error('Error auto-syncing weather data:', error);
    }
  }, [weatherData.length, lastUpdateTime]); // Simplified dependencies

  /**
   * Get comprehensive risk assessment for a location - Memoized
   */
  const getRiskAssessment = useCallback((locationId: string) => {
    const locationWeatherData = weatherData.find(data => data.locationId === locationId);
    
    if (!locationWeatherData) {
      return {
        score: 0,
        level: 'unknown' as const,
        factors: []
      };
    }

    const riskAssessment = calculateRiskScore(locationWeatherData);
    const factors = [];

    // Add specific risk factors based on weather conditions
    if (locationWeatherData.temperature > 35) {
      factors.push('High temperature - heat stress risk');
    }
    if (locationWeatherData.temperature < 5) {
      factors.push('Low temperature - frost risk');
    }
    if (locationWeatherData.rainfall < 5) {
      factors.push('Low rainfall - drought risk');
    }
    if (locationWeatherData.rainfall > 100) {
      factors.push('High rainfall - flood risk');
    }
    if (locationWeatherData.windSpeed > 50) {
      factors.push('High wind speed - crop damage risk');
    }

    return {
      ...riskAssessment,
      factors
    };
  }, [weatherData]); // Keep weatherData dependency but it's optimized

  /**
   * Get policy recommendations based on weather data - Memoized
   */
  const getPolicyRecommendations = useCallback((locationId: string, cropType: string) => {
    const riskAssessment = getRiskAssessment(locationId);
    const locationWeatherData = weatherData.find(data => data.locationId === locationId);
    
    if (!locationWeatherData) {
      return {
        recommended: false,
        reason: 'No weather data available',
        suggestedCoverage: 0,
        premiumMultiplier: 1.0
      };
    }

    let premiumMultiplier = 1.0;
    let suggestedCoverage = 1000; // Base coverage amount

    // Adjust based on risk level
    switch (riskAssessment.level) {
      case 'high':
        premiumMultiplier = 1.5;
        suggestedCoverage = 5000;
        break;
      case 'medium':
        premiumMultiplier = 1.2;
        suggestedCoverage = 3000;
        break;
      case 'low':
        premiumMultiplier = 1.0;
        suggestedCoverage = 1000;
        break;
    }

    // Crop-specific adjustments
    const cropMultipliers: { [key: string]: number } = {
      'corn': 1.1,
      'wheat': 1.0,
      'soybeans': 1.2,
      'rice': 1.3,
      'cotton': 1.4
    };

    premiumMultiplier *= cropMultipliers[cropType.toLowerCase()] || 1.0;

    return {
      recommended: true,
      reason: `${riskAssessment.level} risk level detected`,
      suggestedCoverage,
      premiumMultiplier,
      riskFactors: riskAssessment.factors
    };
  }, [getRiskAssessment, weatherData.length]); // Optimized dependencies

  // Auto-sync weather data periodically - Fixed to prevent infinite re-renders
  useEffect(() => {
    if (weatherData.length === 0) return;
    
    const interval = setInterval(() => {
      autoSyncWeatherData();
    }, 10 * 60 * 1000); // Every 10 minutes

    return () => clearInterval(interval);
  }, [weatherData.length]); // Use length instead of full array

  // Load initial data - Fixed to prevent re-renders
  useEffect(() => {
    refreshPolicies();
    refreshPoolStats();
  }, []); // Empty dependency array

  return {
    // Weather data from WeatherXM
    weatherData,
    stations,
    alerts,
    isLoadingWeather,
    weatherError,
    fetchWeatherData,
    fetchMultipleStations,
    getStationsInRegion,
    calculateRiskScore,
    
    // Blockchain integration
    policies,
    poolStats,
    isUpdatingChain,
    chainError,
    lastUpdateTime,
    updateWeatherOnChain,
    bulkUpdateWeatherOnChain,
    registerPolicy,
    checkTriggerConditions,
    refreshPolicies,
    refreshPoolStats,
    autoSyncWeatherData,
    
    // Risk assessment and recommendations
    getRiskAssessment,
    getPolicyRecommendations,
    
    // Combined loading state
    isLoading: isLoadingWeather || isUpdatingChain,
    
    // Combined error state
    error: weatherError || chainError
  };
};
