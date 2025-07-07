import React from 'react';
import { render, screen } from '@testing-library/react';
import { WeatherDashboard } from '../components/WeatherDashboard';

// Mock the hooks to avoid API calls during testing
jest.mock('../hooks/useWeatherXMFlow', () => ({
  useWeatherXMFlow: () => ({
    weatherData: [
      {
        locationId: 'test-station-001',
        temperature: 25.5,
        humidity: 60,
        rainfall: 10.2,
        windSpeed: 15.0,
        condition: 'sunny',
        alerts: [],
        timestamp: Date.now()
      }
    ],
    stations: [
      {
        id: 'test-station-001',
        name: 'Test Weather Station',
        location: { lat: 40.7128, lng: -74.0060 },
        isActive: true
      }
    ],
    alerts: [],
    policies: [],
    poolStats: {
      totalLiquidity: 50000,
      totalPolicies: 5,
      totalPayouts: 2500,
      utilizationRate: 75
    },
    isLoading: false,
    error: null,
    fetchWeatherData: jest.fn(),
    getStationsInRegion: jest.fn(),
    updateWeatherOnChain: jest.fn(),
    bulkUpdateWeatherOnChain: jest.fn(),
    registerPolicy: jest.fn(),
    checkTriggerConditions: jest.fn(),
    refreshPolicies: jest.fn(),
    refreshPoolStats: jest.fn(),
    getRiskAssessment: jest.fn(() => ({
      score: 25,
      level: 'low',
      factors: []
    })),
    getPolicyRecommendations: jest.fn(() => ({
      recommended: true,
      reason: 'Low risk detected',
      suggestedCoverage: 1000,
      premiumMultiplier: 1.0
    })),
    lastUpdateTime: Date.now()
  })
}));

describe('WeatherDashboard', () => {
  it('renders without crashing', () => {
    render(<WeatherDashboard />);
    expect(screen.getByText('Weather Dashboard')).toBeInTheDocument();
  });

  it('displays weather station data', () => {
    render(<WeatherDashboard />);
    expect(screen.getByText('Test Weather Station')).toBeInTheDocument();
    expect(screen.getByText('25.5°C')).toBeInTheDocument();
  });

  it('displays pool statistics', () => {
    render(<WeatherDashboard />);
    expect(screen.getByText('Total Liquidity')).toBeInTheDocument();
    expect(screen.getByText('$50,000')).toBeInTheDocument();
  });

  it('does not cause infinite re-renders', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    render(<WeatherDashboard />);
    
    // Wait for any potential re-renders
    setTimeout(() => {
      expect(consoleError).not.toHaveBeenCalledWith(
        expect.stringContaining('Maximum update depth exceeded')
      );
    }, 1000);
    
    consoleError.mockRestore();
  });
});
