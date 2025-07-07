import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import StatCard from '@/components/ui/StatCard';
import { 
  DollarSign, 
  TrendingUp, 
  Shield, 
  PieChart,
  Plus,
  Minus,
  Target,
  Clock,
  Users,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

const Pools: React.FC = () => {
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');

  const poolStats = {
    totalTvl: '$2,400,000',
    totalPools: '8',
    averageApy: '14.2%',
    totalEarned: '$340,000'
  };

  const pools = [
    {
      id: 1,
      name: 'Corn Insurance Pool',
      crop: 'Corn',
      tvl: 850000,
      apy: 16.5,
      utilization: 68,
      riskLevel: 'Medium',
      minDeposit: 1000,
      lockPeriod: '3 months',
      participants: 142,
      premiumIncome: 45200,
      claimsPaid: 18300,
      netReturn: 26900
    },
    {
      id: 2,
      name: 'Soybean Protection Pool',
      crop: 'Soybeans',
      tvl: 620000,
      apy: 12.8,
      utilization: 75,
      riskLevel: 'Low',
      minDeposit: 500,
      lockPeriod: '6 months',
      participants: 98,
      premiumIncome: 32100,
      claimsPaid: 12400,
      netReturn: 19700
    },
    {
      id: 3,
      name: 'Wheat Security Pool',
      crop: 'Wheat',
      tvl: 480000,
      apy: 18.2,
      utilization: 82,
      riskLevel: 'High',
      minDeposit: 2000,
      lockPeriod: '4 months',
      participants: 67,
      premiumIncome: 38500,
      claimsPaid: 22100,
      netReturn: 16400
    },
    {
      id: 4,
      name: 'Rice Coverage Pool',
      crop: 'Rice',
      tvl: 450000,
      apy: 13.7,
      utilization: 58,
      riskLevel: 'Medium',
      minDeposit: 750,
      lockPeriod: '5 months',
      participants: 89,
      premiumIncome: 28900,
      claimsPaid: 15200,
      netReturn: 13700
    }
  ];

  const myPositions = [
    {
      poolName: 'Corn Insurance Pool',
      deposited: 25000,
      earned: 3200,
      apy: 16.5,
      duration: '2 months'
    },
    {
      poolName: 'Soybean Protection Pool',
      deposited: 15000,
      earned: 1850,
      apy: 12.8,
      duration: '4 months'
    }
  ];

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low': return 'success';
      case 'Medium': return 'warning';
      case 'High': return 'destructive';
      default: return 'default';
    }
  };

  const getUtilizationColor = (utilization: number) => {
    if (utilization > 80) return 'text-destructive';
    if (utilization > 60) return 'text-warning';
    return 'text-success';
  };

  return (
    <div className="container py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Liquidity Pools</h1>
          <p className="text-muted-foreground">
            Provide liquidity to earn yield from insurance premiums and RWA investments
          </p>
        </div>
        <Button variant="hero" size="lg">
          <Plus className="h-4 w-4 mr-2" />
          New Position
        </Button>
      </div>

      {/* Pool Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total TVL"
          value={poolStats.totalTvl}
          change="+15.3%"
          changeType="positive"
          icon={DollarSign}
          variant="accent"
        />
        <StatCard
          title="Active Pools"
          value={poolStats.totalPools}
          change="+2 new"
          changeType="positive"
          icon={Shield}
        />
        <StatCard
          title="Average APY"
          value={poolStats.averageApy}
          change="+2.1%"
          changeType="positive"
          icon={TrendingUp}
          variant="secondary"
        />
        <StatCard
          title="Total Earned"
          value={poolStats.totalEarned}
          change="+18.2%"
          changeType="positive"
          icon={Target}
        />
      </div>

      <Tabs defaultValue="pools" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="pools">All Pools</TabsTrigger>
          <TabsTrigger value="positions">My Positions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="pools" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {pools.map((pool) => (
              <Card key={pool.id} className="hover-lift shadow-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="h-12 w-12 gradient-primary rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-lg">
                          {pool.crop[0]}
                        </span>
                      </div>
                      <div>
                        <CardTitle className="text-lg">{pool.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{pool.crop} Insurance</p>
                      </div>
                    </div>
                    <Badge variant={getRiskColor(pool.riskLevel) as any}>
                      {pool.riskLevel} Risk
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-muted/30 rounded-lg">
                      <p className="text-sm text-muted-foreground">TVL</p>
                      <p className="font-bold">${(pool.tvl / 1000).toFixed(0)}K</p>
                    </div>
                    <div className="text-center p-3 bg-muted/30 rounded-lg">
                      <p className="text-sm text-muted-foreground">APY</p>
                      <p className="font-bold text-success">{pool.apy}%</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Utilization</span>
                      <span className={`text-sm font-medium ${getUtilizationColor(pool.utilization)}`}>
                        {pool.utilization}%
                      </span>
                    </div>
                    <Progress value={pool.utilization} className="h-2" />
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Min Deposit:</span>
                        <span className="font-medium">${pool.minDeposit.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Lock Period:</span>
                        <span className="font-medium">{pool.lockPeriod}</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Participants:</span>
                        <span className="font-medium">{pool.participants}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Net Return:</span>
                        <span className="font-medium text-success">${pool.netReturn.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button className="flex-1" variant="hero">
                      <Plus className="h-4 w-4 mr-2" />
                      Deposit
                    </Button>
                    <Button variant="outline" className="flex-1">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="positions" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quick Actions */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="h-5 w-5 mr-2" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Deposit Amount</label>
                  <Input
                    type="number"
                    placeholder="Enter amount..."
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                  />
                  <Button className="w-full" variant="success">
                    <Plus className="h-4 w-4 mr-2" />
                    Deposit to Pool
                  </Button>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Withdraw Amount</label>
                  <Input
                    type="number"
                    placeholder="Enter amount..."
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                  />
                  <Button className="w-full" variant="outline">
                    <Minus className="h-4 w-4 mr-2" />
                    Withdraw from Pool
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Position Summary */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Position Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Total Deposited</span>
                    <span className="font-bold text-lg">$40,000</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Total Earned</span>
                    <span className="font-bold text-lg text-success">$5,050</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Current Value</span>
                    <span className="font-bold text-lg">$45,050</span>
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Portfolio Return</span>
                      <span className="font-bold text-success">+12.63%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* My Positions */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Active Positions</h3>
            {myPositions.map((position, index) => (
              <Card key={index} className="shadow-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="h-10 w-10 gradient-secondary rounded-lg flex items-center justify-center">
                        <Shield className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium">{position.poolName}</p>
                        <p className="text-sm text-muted-foreground">Active for {position.duration}</p>
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="flex items-center space-x-4">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Deposited</p>
                          <p className="font-semibold">${position.deposited.toLocaleString()}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Earned</p>
                          <p className="font-semibold text-success">${position.earned.toLocaleString()}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">APY</p>
                          <p className="font-semibold">{position.apy}%</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pool Performance */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Pool Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {pools.slice(0, 3).map((pool, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{pool.name}</span>
                      <span className="text-sm font-semibold text-success">{pool.apy}% APY</span>
                    </div>
                    <div className="flex space-x-2 text-xs">
                      <div className="flex items-center">
                        <ArrowUpRight className="h-3 w-3 text-success mr-1" />
                        <span className="text-success">+${pool.premiumIncome.toLocaleString()} premiums</span>
                      </div>
                      <div className="flex items-center">
                        <ArrowDownRight className="h-3 w-3 text-destructive mr-1" />
                        <span className="text-destructive">-${pool.claimsPaid.toLocaleString()} claims</span>
                      </div>
                    </div>
                    <Progress value={pool.apy} className="h-1" />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Risk Distribution */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChart className="h-5 w-5 mr-2" />
                  Risk Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <div className="h-3 w-3 bg-success rounded-full"></div>
                      <span className="text-sm">Low Risk Pools</span>
                    </div>
                    <span className="text-sm font-medium">25%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <div className="h-3 w-3 bg-warning rounded-full"></div>
                      <span className="text-sm">Medium Risk Pools</span>
                    </div>
                    <span className="text-sm font-medium">50%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <div className="h-3 w-3 bg-destructive rounded-full"></div>
                      <span className="text-sm">High Risk Pools</span>
                    </div>
                    <span className="text-sm font-medium">25%</span>
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Diversified risk exposure across multiple pool categories
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Analytics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-base">Monthly Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-success">$28,500</div>
                <p className="text-xs text-muted-foreground">+12.5% from last month</p>
              </CardContent>
            </Card>
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-base">Active Policies</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">156</div>
                <p className="text-xs text-muted-foreground">Across all pools</p>
              </CardContent>
            </Card>
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-base">Claims Ratio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">24%</div>
                <p className="text-xs text-muted-foreground">Below industry average</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Pools;