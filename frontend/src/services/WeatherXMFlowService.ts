import * as fcl from '@onflow/fcl';
import { WeatherData } from '../hooks/useWeatherXM';
import { CONTRACT_ADDRESSES, CADENCE_SCRIPTS, CADENCE_TRANSACTIONS } from '../config/flow';

/**
 * Service to integrate WeatherXM data with Flow blockchain contracts
 */
export class WeatherXMFlowService {
  /**
   * Updates weather data on the Flow blockchain through the Oracle contract
   */
  static async updateWeatherDataOnChain(weatherData: WeatherData): Promise<string> {
    try {
      const txId = await fcl.mutate({
        cadence: CADENCE_TRANSACTIONS.UPDATE_WEATHER_DATA,
        args: (arg: any, t: any) => [
          arg(weatherData.locationId, t.String),
          arg(weatherData.rainfall.toFixed(2), t.UFix64),
          arg(weatherData.temperature.toFixed(2), t.UFix64),
          arg(weatherData.humidity.toFixed(2), t.UFix64),
          arg(weatherData.windSpeed.toFixed(2), t.UFix64),
          arg('WeatherXM', t.String)
        ],
        proposer: fcl.currentUser.authorization,
        payer: fcl.currentUser.authorization,
        authorizations: [fcl.currentUser.authorization],
        limit: 1000
      });

      return txId;
    } catch (error) {
      console.error('Error updating weather data on chain:', error);
      throw error;
    }
  }

  /**
   * Bulk update multiple weather data points
   */
  static async bulkUpdateWeatherData(weatherDataArray: WeatherData[]): Promise<string[]> {
    const txIds: string[] = [];

    for (const weatherData of weatherDataArray) {
      try {
        const txId = await this.updateWeatherDataOnChain(weatherData);
        txIds.push(txId);
        
        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Failed to update weather data for location ${weatherData.locationId}:`, error);
        continue;
      }
    }

    return txIds;
  }

  /**
   * Get current weather data from the Oracle contract
   */
  static async getWeatherDataFromChain(locationId: string): Promise<any> {
    try {
      const result = await fcl.query({
        cadence: CADENCE_SCRIPTS.GET_WEATHER_DATA,
        args: (arg: any, t: any) => [arg(locationId, t.String)]
      });

      return result;
    } catch (error) {
      console.error('Error getting weather data from chain:', error);
      throw error;
    }
  }

  /**
   * Check if trigger conditions are met for insurance policies
   */
  static async checkTriggerConditions(): Promise<string> {
    try {
      const txId = await fcl.mutate({
        cadence: CADENCE_TRANSACTIONS.CHECK_TRIGGERS,
        proposer: fcl.currentUser.authorization,
        payer: fcl.currentUser.authorization,
        authorizations: [fcl.currentUser.authorization],
        limit: 1000
      });

      return txId;
    } catch (error) {
      console.error('Error checking trigger conditions:', error);
      throw error;
    }
  }

  /**
   * Get insurance pool statistics
   */
  static async getPoolStats(): Promise<any> {
    try {
      const result = await fcl.query({
        cadence: CADENCE_SCRIPTS.GET_POOL_STATS
      });

      return result;
    } catch (error) {
      console.error('Error getting pool stats:', error);
      throw error;
    }
  }

  /**
   * Register a new insurance policy
   */
  static async registerPolicy(
    locationId: string,
    cropType: string,
    coverageAmount: number,
    premiumAmount: number
  ): Promise<string> {
    try {
      const txId = await fcl.mutate({
        cadence: CADENCE_TRANSACTIONS.REGISTER_POLICY,
        args: (arg: any, t: any) => [
          arg(locationId, t.String),
          arg(cropType, t.String),
          arg(coverageAmount.toFixed(2), t.UFix64),
          arg(premiumAmount.toFixed(2), t.UFix64)
        ],
        proposer: fcl.currentUser.authorization,
        payer: fcl.currentUser.authorization,
        authorizations: [fcl.currentUser.authorization],
        limit: 1000
      });

      return txId;
    } catch (error) {
      console.error('Error registering policy:', error);
      throw error;
    }
  }

  /**
   * Get all active policies for the current user
   */
  static async getUserPolicies(userAddress?: string): Promise<any[]> {
    try {
      let address = userAddress;
      if (!address) {
        const user = await fcl.currentUser.snapshot();
        address = user.addr;
      }
      
      if (!address) {
        throw new Error('User not authenticated');
      }

      const result = await fcl.query({
        cadence: CADENCE_SCRIPTS.GET_USER_POLICIES,
        args: (arg: any, t: any) => [arg(address, t.Address)]
      });

      return result || [];
    } catch (error) {
      console.error('Error getting user policies:', error);
      return [];
    }
  }

  /**
   * Convert WeatherXM data to Flow blockchain format
   */
  static formatWeatherDataForChain(weatherData: WeatherData): any {
    return {
      locationId: weatherData.locationId,
      rainfallMM: parseFloat(weatherData.rainfall.toFixed(2)),
      temperatureCelsius: parseFloat(weatherData.temperature.toFixed(2)),
      humidity: parseFloat(weatherData.humidity.toFixed(2)),
      windSpeedKMH: parseFloat(weatherData.windSpeed.toFixed(2)),
      timestamp: Math.floor(weatherData.timestamp / 1000), // Convert to seconds
      dataSource: 'WeatherXM'
    };
  }

  /**
   * Validate weather data before sending to blockchain
   */
  static validateWeatherData(weatherData: WeatherData): boolean {
    return (
      weatherData.locationId &&
      weatherData.locationId.length > 0 &&
      weatherData.temperature >= -50 &&
      weatherData.temperature <= 60 &&
      weatherData.humidity >= 0 &&
      weatherData.humidity <= 100 &&
      weatherData.rainfall >= 0 &&
      weatherData.rainfall <= 1000 &&
      weatherData.windSpeed >= 0 &&
      weatherData.windSpeed <= 200
    );
  }
}
