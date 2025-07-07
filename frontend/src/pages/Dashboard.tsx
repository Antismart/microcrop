import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StatCard from '@/components/ui/StatCard';
import WeatherWidget from '@/components/ui/WeatherWidget';
import { 
  DollarSign, 
  Shield, 
  TrendingUp, 
  AlertTriangle,
  Plus,
  Eye
} from 'lucide-react';

const Dashboard: React.FC = () => {
  // Mock data
  const farmerStats = {
    totalCoverage: '$125,000',
    activePolicies: '3',
    claimsPending: '1',
    premiumsPaid: '$2,340'
  };

  const lpStats = {
    totalDeposited: '$50,000',
    currentYield: '12.5%',
    poolUtilization: '68%',
    earnings: '$6,250'
  };

  const weatherData = {
    location: 'Iowa, USA',
    temperature: 24,
    humidity: 65,
    rainfall: 12,
    windSpeed: 15,
    condition: 'cloudy' as const,
    alerts: ['Low rainfall warning']
  };

  return (
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
              value={farmerStats.totalCoverage}
              change="+5.2%"
              changeType="positive"
              icon={Shield}
              variant="accent"
            />
            <StatCard
              title="Active Policies"
              value={farmerStats.activePolicies}
              change="No change"
              changeType="neutral"
              icon={Eye}
            />
            <StatCard
              title="Claims Pending"
              value={farmerStats.claimsPending}
              change="Processing"
              changeType="neutral"
              icon={AlertTriangle}
              variant="secondary"
            />
            <StatCard
              title="Premiums Paid"
              value={farmerStats.premiumsPaid}
              change="+12.1%"
              changeType="positive"
              icon={DollarSign}
            />
          </div>

          {/* Weather and Policies */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <WeatherWidget data={weatherData} />
            </div>
            <div className="lg:col-span-2">
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>Active Policies</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { crop: 'Corn', coverage: '$50,000', premium: '$850', status: 'Active' },
                      { crop: 'Soybeans', coverage: '$40,000', premium: '$720', status: 'Active' },
                      { crop: 'Wheat', coverage: '$35,000', premium: '$630', status: 'Pending Claim' }
                    ].map((policy, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="h-10 w-10 gradient-primary rounded-lg flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">
                              {policy.crop[0]}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">{policy.crop}</p>
                            <p className="text-sm text-muted-foreground">Coverage: {policy.coverage}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{policy.premium}</p>
                          <p className="text-sm text-muted-foreground">{policy.status}</p>
                        </div>
                      </div>
                    ))}
                  </div>
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
              value={lpStats.totalDeposited}
              change="+15.3%"
              changeType="positive"
              icon={DollarSign}
              variant="accent"
            />
            <StatCard
              title="Current Yield"
              value={lpStats.currentYield}
              change="+2.1%"
              changeType="positive"
              icon={TrendingUp}
            />
            <StatCard
              title="Pool Utilization"
              value={lpStats.poolUtilization}
              change="+8.5%"
              changeType="positive"
              icon={Shield}
              variant="secondary"
            />
            <StatCard
              title="Total Earnings"
              value={lpStats.earnings}
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
                    <span className="font-semibold text-success">+$4,200</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Claims Payouts</span>
                    <span className="font-semibold text-destructive">-$1,800</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>RWA Returns</span>
                    <span className="font-semibold text-success">+$3,850</span>
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Net Return</span>
                      <span className="font-bold text-success">+$6,250</span>
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
                      <span>68%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full">
                      <div className="h-2 bg-primary rounded-full" style={{ width: '68%' }}></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>RWA Investments</span>
                      <span>25%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full">
                      <div className="h-2 bg-secondary rounded-full" style={{ width: '25%' }}></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Reserve Buffer</span>
                      <span>7%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full">
                      <div className="h-2 bg-accent rounded-full" style={{ width: '7%' }}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;