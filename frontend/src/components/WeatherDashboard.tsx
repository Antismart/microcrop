import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { LoadingSpinner, WeatherCardSkeleton } from './ui/loading';
import { 
  Cloud, 
  Sun, 
  CloudRain, 
  Thermometer, 
  Droplets, 
  Wind, 
  AlertTriangle,
  TrendingUp,
  Shield,
  Zap,
  RefreshCw,
  MapPin
} from 'lucide-react';
import { useWeatherXMFlow } from '../hooks/useWeatherXMFlow';

// Error boundary for WeatherDashboard
class WeatherDashboardErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('WeatherDashboard Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="container py-8">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Weather dashboard encountered an error: {this.state.error?.message || 'Unknown error'}
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => this.setState({ hasError: false, error: null })}
              >
                Try Again
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      );
    }

    return this.props.children;
  }
}

interface WeatherDashboardProps {
  className?: string;
}

const WeatherDashboardContent: React.FC<WeatherDashboardProps> = ({ className }) => {
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [autoSync, setAutoSync] = useState(true);
  
  const {
    weatherData,
    stations,
    alerts,
    policies,
    poolStats,
    isLoading,
    error,
    fetchWeatherData,
    getStationsInRegion,
    updateWeatherOnChain,
    bulkUpdateWeatherOnChain,
    registerPolicy,
    checkTriggerConditions,
    refreshPolicies,
    refreshPoolStats,
    getRiskAssessment,
    getPolicyRecommendations,
    lastUpdateTime
  } = useWeatherXMFlow();

  // Load initial stations - Use useCallback to prevent re-renders
  const loadInitialStations = useCallback(() => {
    getStationsInRegion(-1.2921, 36.8219, 200); // Nairobi, Kenya as default
  }, [getStationsInRegion]);

  useEffect(() => {
    loadInitialStations();
  }, [loadInitialStations]);

  // Auto-fetch weather data for all stations - Fixed to prevent infinite re-renders
  const fetchAllStationData = useCallback(() => {
    if (stations.length > 0 && autoSync) {
      stations.forEach(station => {
        fetchWeatherData(station.id);
      });
    }
  }, [stations.length, autoSync, fetchWeatherData]);

  useEffect(() => {
    // Initial fetch
    fetchAllStationData();

    // Set up interval for periodic updates
    const interval = setInterval(() => {
      fetchAllStationData();
    }, 5 * 60 * 1000); // Every 5 minutes

    return () => clearInterval(interval);
  }, [fetchAllStationData]); // Use memoized function

  const getWeatherIcon = (condition: string, size = 24) => {
    switch (condition) {
      case 'sunny':
        return <Sun size={size} className="text-yellow-500" />;
      case 'cloudy':
        return <Cloud size={size} className="text-gray-500" />;
      case 'rainy':
        return <CloudRain size={size} className="text-blue-500" />;
      default:
        return <Sun size={size} className="text-yellow-500" />;
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleSyncWeatherData = async () => {
    if (weatherData.length > 0) {
      const success = await bulkUpdateWeatherOnChain(weatherData);
      if (success.length > 0) {
        alert(`Successfully synced ${success.length} weather data points to blockchain`);
      }
    }
  };

  const handleRegisterPolicy = async (locationId: string, cropType: string) => {
    const recommendation = getPolicyRecommendations(locationId, cropType);
    
    if (recommendation.recommended) {
      const success = await registerPolicy(
        locationId,
        cropType,
        recommendation.suggestedCoverage,
        recommendation.suggestedCoverage * 0.1 * recommendation.premiumMultiplier
      );
      
      if (success) {
        alert('Policy registered successfully!');
        await refreshPolicies();
      }
    }
  };

  if (isLoading && weatherData.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Weather Dashboard</h1>
            <p className="text-gray-600">Real-time WeatherXM integration with blockchain insurance</p>
          </div>
        </div>
        <LoadingSpinner 
          size="lg" 
          message="Loading weather data and blockchain information..." 
          className="h-64"
        />
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Weather Dashboard</h1>
          <p className="text-gray-600">Real-time WeatherXM integration with blockchain insurance</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleSyncWeatherData}
            disabled={isLoading || weatherData.length === 0}
            variant="outline"
          >
            <Zap className="h-4 w-4 mr-2" />
            Sync to Blockchain
          </Button>
          <Button
            onClick={() => checkTriggerConditions()}
            disabled={isLoading}
            variant="outline"
          >
            <Shield className="h-4 w-4 mr-2" />
            Check Triggers
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-red-800">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Pool Statistics */}
      {poolStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Liquidity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                ${(poolStats.totalLiquidity || 0).toLocaleString()}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Active Policies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {poolStats.totalPolicies || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Payouts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                ${(poolStats.totalPayouts || 0).toLocaleString()}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Utilization Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {poolStats.utilizationRate || 0}%
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs defaultValue="stations" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="stations">Weather Stations</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="policies">Policies</TabsTrigger>
          <TabsTrigger value="risk">Risk Assessment</TabsTrigger>
        </TabsList>

        {/* Weather Stations */}
        <TabsContent value="stations" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoading && stations.length === 0 ? (
              // Show skeleton loading while stations are loading
              Array.from({ length: 6 }).map((_, index) => (
                <WeatherCardSkeleton key={index} />
              ))
            ) : stations.length === 0 ? (
              <div className="col-span-full text-center py-8">
                <p className="text-gray-500">No weather stations found.</p>
                <Button 
                  onClick={loadInitialStations} 
                  className="mt-2"
                  variant="outline"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry Loading Stations
                </Button>
              </div>
            ) : (
              stations.map((station) => {
                const stationWeatherData = weatherData.find(data => data.locationId === station.id);
                const riskAssessment = getRiskAssessment(station.id);
                
                return (
                  <Card key={station.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{station.name}</CardTitle>
                          <p className="text-sm text-gray-600 flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {station.location.lat.toFixed(2)}, {station.location.lng.toFixed(2)}
                          </p>
                        </div>
                        <Badge variant={station.isActive ? "default" : "secondary"}>
                          {station.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {stationWeatherData ? (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {getWeatherIcon(stationWeatherData.condition)}
                              <span className="text-2xl font-bold">
                                {stationWeatherData.temperature.toFixed(1)}°C
                              </span>
                            </div>
                            <Badge className={getRiskLevelColor(riskAssessment.level)}>
                              {riskAssessment.level} risk
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="flex items-center gap-1">
                              <Droplets className="h-3 w-3 text-blue-500" />
                              <span>{stationWeatherData.humidity}%</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Wind className="h-3 w-3 text-gray-500" />
                              <span>{stationWeatherData.windSpeed} km/h</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <CloudRain className="h-3 w-3 text-blue-600" />
                              <span>{stationWeatherData.rainfall} mm</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <TrendingUp className="h-3 w-3 text-green-500" />
                              <span>Score: {riskAssessment.score}</span>
                            </div>
                          </div>

                          {stationWeatherData.alerts.length > 0 && (
                            <div className="space-y-1">
                              <p className="text-xs font-medium text-gray-700">Active Alerts:</p>
                              {stationWeatherData.alerts.slice(0, 2).map((alert, index) => (
                                <Badge key={index} variant="destructive" className="text-xs">
                                  {alert.split(' - ')[0]}
                                </Badge>
                              ))}
                            </div>
                          )}

                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => updateWeatherOnChain(stationWeatherData)}
                              disabled={isLoading}
                            >
                              <Zap className="h-3 w-3 mr-1" />
                              Update Chain
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRegisterPolicy(station.id, 'corn')}
                              disabled={isLoading}
                            >
                              <Shield className="h-3 w-3 mr-1" />
                              Insure
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <p className="text-gray-500">No weather data available</p>
                          <Button
                            size="sm"
                            onClick={() => fetchWeatherData(station.id)}
                            disabled={isLoading}
                            className="mt-2"
                          >
                            <RefreshCw className="h-3 w-3 mr-1" />
                            Fetch Data
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>

        {/* Alerts */}
        <TabsContent value="alerts" className="space-y-4">
          <div className="grid gap-4">
            {alerts.map((alert) => (
              <Card key={alert.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">{alert.message}</h4>
                        <Badge variant={alert.severity === 'high' ? 'destructive' : 'default'}>
                          {alert.severity}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        Location: {alert.locationId} | {new Date(alert.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Policies */}
        <TabsContent value="policies" className="space-y-4">
          <div className="grid gap-4">
            {policies.map((policy) => (
              <Card key={policy.policyId}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">Policy #{policy.policyId}</CardTitle>
                      <p className="text-sm text-gray-600">
                        {policy.cropType} | {policy.locationId}
                      </p>
                    </div>
                    <Badge variant={policy.isActive ? "default" : "secondary"}>
                      {policy.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium">Coverage Amount</p>
                      <p className="text-lg font-bold text-green-600">
                        ${(policy.coverageAmount || 0).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Farmer Address</p>
                      <p className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                        {policy.farmerAddress}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Risk Assessment */}
        <TabsContent value="risk" className="space-y-4">
          <div className="grid gap-4">
            {weatherData.map((data) => {
              const riskAssessment = getRiskAssessment(data.locationId);
              const recommendation = getPolicyRecommendations(data.locationId, 'corn');
              
              return (
                <Card key={data.locationId}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{data.locationId}</CardTitle>
                      <Badge className={getRiskLevelColor(riskAssessment.level)}>
                        {riskAssessment.level} risk ({riskAssessment.score})
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm font-medium">Temperature</p>
                          <p className="text-lg font-bold">{data.temperature.toFixed(1)}°C</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Humidity</p>
                          <p className="text-lg font-bold">{data.humidity}%</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Rainfall</p>
                          <p className="text-lg font-bold">{data.rainfall} mm</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Wind Speed</p>
                          <p className="text-lg font-bold">{data.windSpeed} km/h</p>
                        </div>
                      </div>
                      
                      {riskAssessment.factors.length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-2">Risk Factors:</p>
                          <div className="flex flex-wrap gap-2">
                            {riskAssessment.factors.map((factor, index) => (
                              <Badge key={index} variant="secondary">
                                {factor}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {recommendation.recommended && (
                        <div className="border rounded-lg p-4 bg-blue-50">
                          <h4 className="font-medium mb-2">Insurance Recommendation</h4>
                          <p className="text-sm text-gray-600 mb-2">{recommendation.reason}</p>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="font-medium">Suggested Coverage:</p>
                              <p>${(recommendation.suggestedCoverage || 0).toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="font-medium">Premium Multiplier:</p>
                              <p>{recommendation.premiumMultiplier.toFixed(2)}x</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Footer */}
      <div className="text-center text-sm text-gray-500">
        <p>
          Last updated: {lastUpdateTime ? new Date(lastUpdateTime).toLocaleString() : 'Never'} |
          WeatherXM integration with Flow blockchain
        </p>
      </div>
    </div>
  );
};

export const WeatherDashboard: React.FC<WeatherDashboardProps> = ({ className }) => {
  return (
    <WeatherDashboardErrorBoundary>
      <WeatherDashboardContent className={className} />
    </WeatherDashboardErrorBoundary>
  );
};
