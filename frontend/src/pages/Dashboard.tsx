import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import StatCard from '@/components/ui/StatCard';
import WeatherWidget from '@/components/ui/WeatherWidget';
import Header from '@/components/layout/Header';
import { useFlowAuth } from '@/hooks/useFlowAuth';
import { useInsurancePool } from '@/hooks/useInsurancePool';
import { useOracle } from '@/hooks/useOracle';
import { useWeatherXM } from '@/hooks/useWeatherXM';
import { 
  DollarSign, 
  Shield, 
  TrendingUp, 
  AlertTriangle,
  Plus,
  Eye,
  Loader2
} from 'lucide-react';

// Error boundary for Dashboard component
class DashboardErrorBoundary extends React.Component<
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
    console.error('Dashboard Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="container py-8">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Dashboard encountered an error: {this.state.error?.message || 'Unknown error'}
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

const Dashboard: React.FC = () => {
  return (
    <DashboardErrorBoundary>
      <DashboardContent />
    </DashboardErrorBoundary>
  );
};

const DashboardContent: React.FC = () => {
  const { user, logIn, logOut, isLoading: authLoading, isConnected } = useFlowAuth();
  const { getPoolStats } = useInsurancePool();
  const { getOracleStats } = useOracle();
  const { weatherData, alerts, isLoading: weatherLoading, fetchWeatherData } = useWeatherXM();
  
  const [poolStats, setPoolStats] = useState<any>(null);
  const [oracleStats, setOracleStats] = useState<any>(null);
  const [userPolicies, setUserPolicies] = useState<any[]>([]);
  const [dashboardWeather, setDashboardWeather] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Default location for weather data - Kenya
  const defaultLocation = { latitude: -1.2921, longitude: 36.8219 }; // Nairobi, Kenya

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user) return;
      
      setLoading(true);
      setError(null);

      try {
        // Load pool statistics
        const poolData = await getPoolStats();
        if (poolData) {
          setPoolStats(poolData);
        }

        // Load oracle statistics
        const oracleData = await getOracleStats();
        if (oracleData) {
          setOracleStats(oracleData);
        }

        // Load user policies - mock data for now
        const policies = [
          { id: 1, status: 'active', coverageAmount: 10000, premiumAmount: 500 },
          { id: 2, status: 'pending', coverageAmount: 15000, premiumAmount: 750 }
        ];
        setUserPolicies(policies);

        // Load weather data - use existing weather data
        if (weatherData.length > 0) {
          setDashboardWeather(weatherData[0]);
        } else {
          // Mock weather data for Kenya
          setDashboardWeather({
            location: 'Nairobi, Kenya',
            temperature: 24,
            humidity: 72,
            rainfall: 18,
            condition: 'cloudy',
            windSpeed: 15,
            alerts: alerts || []
          });
        }
      } catch (err) {
        console.error('Error loading dashboard data:', err);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user, getPoolStats, getOracleStats, weatherData.length, alerts.length]); // Use length instead of full arrays

  // Calculate farmer stats from real data with safe defaults
  const farmerStats = {
    totalCoverage: userPolicies.reduce((sum, policy) => sum + (policy?.coverageAmount || 0), 0),
    activePolicies: userPolicies.filter(p => p?.status === 'active').length,
    claimsPending: userPolicies.filter(p => p?.status === 'pending_claim').length,
    premiumsPaid: userPolicies.reduce((sum, policy) => sum + (policy?.premiumAmount || 0), 0)
  };

  // Calculate LP stats from pool data with safe defaults
  const lpStats = {
    totalDeposited: poolStats?.totalPoolValue || 0,
    currentYield: poolStats && poolStats.totalPoolValue > 0 ? 
      ((poolStats.totalPremiumsCollected - poolStats.totalPayoutsExecuted) / poolStats.totalPoolValue * 100) : 0,
    poolUtilization: poolStats?.poolUtilization || 0,
    earnings: poolStats ? 
      (poolStats.totalPremiumsCollected - poolStats.totalPayoutsExecuted) : 0
  };

  // Format currency values with null checking
  const formatCurrency = (value: number | null | undefined) => {
    const safeValue = value || 0;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(safeValue);
  };

  const formatPercentage = (value: number | null | undefined) => {
    const safeValue = value || 0;
    return `${safeValue.toFixed(1)}%`;
  };

  if (authLoading) {
    return (
      <div className="container py-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container py-8">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Please connect your Flow wallet to access the dashboard.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container py-8 space-y-8">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading dashboard data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-8">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header 
        onConnect={logIn}
        isConnected={isConnected} 
        address={user?.addr}
      />
      <div className="container py-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">
              Monitor your policies, pools, and weather conditions
            </p>
          </div>
          <Button variant="hero" size="lg">
            <Plus className="h-4 w-4 mr-2" />
            New Policy
          </Button>
        </div>

      <Tabs defaultValue="farmer" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="farmer">Farmer View</TabsTrigger>
          <TabsTrigger value="lp">LP View</TabsTrigger>
        </TabsList>

        <TabsContent value="farmer" className="space-y-6">
          {/* Farmer Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Coverage"
              value={formatCurrency(farmerStats.totalCoverage)}
              change={farmerStats.totalCoverage > 0 ? "+5.2%" : "No coverage"}
              changeType={farmerStats.totalCoverage > 0 ? "positive" : "neutral"}
              icon={Shield}
              variant="accent"
            />
            <StatCard
              title="Active Policies"
              value={farmerStats.activePolicies.toString()}
              change="No change"
              changeType="neutral"
              icon={Eye}
            />
            <StatCard
              title="Claims Pending"
              value={farmerStats.claimsPending.toString()}
              change={farmerStats.claimsPending > 0 ? "Processing" : "None"}
              changeType="neutral"
              icon={AlertTriangle}
              variant="secondary"
            />
            <StatCard
              title="Premiums Paid"
              value={formatCurrency(farmerStats.premiumsPaid)}
              change={farmerStats.premiumsPaid > 0 ? "+12.1%" : "No premiums"}
              changeType={farmerStats.premiumsPaid > 0 ? "positive" : "neutral"}
              icon={DollarSign}
            />
          </div>

          {/* Weather and Policies */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              {dashboardWeather ? (
                <WeatherWidget data={dashboardWeather} />
              ) : (
                <Card className="shadow-card">
                  <CardHeader>
                    <CardTitle>Weather</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-center p-8">
                      <Loader2 className="h-8 w-8 animate-spin" />
                      <span className="ml-2">Loading weather data...</span>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
            <div className="lg:col-span-2">
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>Active Policies</CardTitle>
                </CardHeader>
                <CardContent>
                  {userPolicies.length > 0 ? (
                    <div className="space-y-4">
                      {userPolicies.map((policy, index) => (
                        <div key={policy?.id || index} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-4">
                            <div className="h-10 w-10 gradient-primary rounded-lg flex items-center justify-center">
                              <span className="text-white font-semibold text-sm">
                                {policy?.cropType?.[0] || 'C'}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium">{policy?.cropType || 'Unknown Crop'}</p>
                              <p className="text-sm text-muted-foreground">
                                Coverage: {formatCurrency(policy?.coverageAmount)}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{formatCurrency(policy?.premiumAmount)}</p>
                            <p className="text-sm text-muted-foreground">
                              {policy?.status === 'active' ? 'Active' : 
                               policy?.status === 'pending_claim' ? 'Pending Claim' : 
                               'Inactive'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No active policies found.</p>
                      <Button className="mt-4" variant="outline">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Your First Policy
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="lp" className="space-y-6">
          {/* LP Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Deposited"
              value={formatCurrency(lpStats.totalDeposited)}
              change="+15.3%"
              changeType="positive"
              icon={DollarSign}
              variant="accent"
            />
            <StatCard
              title="Current Yield"
              value={formatPercentage(lpStats.currentYield)}
              change="+2.1%"
              changeType="positive"
              icon={TrendingUp}
            />
            <StatCard
              title="Pool Utilization"
              value={formatPercentage(lpStats.poolUtilization)}
              change="+8.5%"
              changeType="positive"
              icon={Shield}
              variant="secondary"
            />
            <StatCard
              title="Total Earnings"
              value={formatCurrency(lpStats.earnings)}
              change="+18.2%"
              changeType="positive"
              icon={TrendingUp}
            />
          </div>

          {/* Pool Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Pool Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Premium Income</span>
                    <span className="font-semibold text-success">
                      +{formatCurrency(poolStats?.totalPremiumsCollected || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Claims Payouts</span>
                    <span className="font-semibold text-destructive">
                      -{formatCurrency(poolStats?.totalPayoutsExecuted || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>RWA Returns</span>
                    <span className="font-semibold text-success">
                      +{formatCurrency(poolStats?.currentRWAInvestment || 0)}
                    </span>
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Net Return</span>
                      <span className="font-bold text-success">
                        +{formatCurrency(lpStats.earnings)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Pool Allocation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Active Policies</span>
                      <span>{formatPercentage(lpStats.poolUtilization)}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full">
                      <div 
                        className="h-2 bg-primary rounded-full" 
                        style={{ width: `${lpStats.poolUtilization}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>RWA Investments</span>
                      <span>{formatPercentage(poolStats?.rwaTargetPercentage || 0)}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full">
                      <div 
                        className="h-2 bg-secondary rounded-full" 
                        style={{ width: `${poolStats?.rwaTargetPercentage || 0}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Reserve Buffer</span>
                      <span>{formatPercentage(Math.max(0, 100 - lpStats.poolUtilization - (poolStats?.rwaTargetPercentage || 0)))}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full">
                      <div 
                        className="h-2 bg-accent rounded-full" 
                        style={{ width: `${Math.max(0, 100 - lpStats.poolUtilization - (poolStats?.rwaTargetPercentage || 0))}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;