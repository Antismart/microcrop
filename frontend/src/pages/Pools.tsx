import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Progress } from '../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import Header from '../components/layout/Header';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Droplets, 
  Shield, 
  Users, 
  Activity,
  AlertTriangle
} from 'lucide-react';
import { useFlowAuth } from '../hooks/useFlowAuth';
import { useInsurancePool } from '../hooks/useInsurancePool';

interface PoolStats {
  totalPoolValue: number;
  totalPremiumsCollected: number;
  totalPayoutsExecuted: number;
  xInsureTotalSupply: number;
  valuePerXInsure: number;
  rwaTargetPercentage: number;
  currentRWAInvestment: number;
  availableLiquidity: number;
  poolUtilization: number;
  minDepositAmount: number;
  maxPoolSize: number;
  poolFeePercentage: number;
  rwaHoldings?: Record<string, number>;
}

export default function Pools() {
  const { user, logIn, logOut, isLoading: authLoading, isConnected } = useFlowAuth();
  const { getPoolStats, getRWAHoldings, depositCapital, redeemCapital, setupUserVault, txStatus } = useInsurancePool();
  
  const [poolStats, setPoolStats] = useState<PoolStats | null>(null);
  const [userBalance, setUserBalance] = useState<number>(0);
  const [depositAmount, setDepositAmount] = useState<string>('');
  const [redeemAmount, setRedeemAmount] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (user) {
      loadPoolData();
    }
  }, [user]);

  const loadPoolData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const stats = await getPoolStats();
      const rwaHoldings = await getRWAHoldings();
      
      if (stats) {
        setPoolStats({
          ...stats,
          rwaHoldings: rwaHoldings || {}
        });
      } else {
        // Set default values if stats is null
        setPoolStats({
          totalPoolValue: 0,
          totalPremiumsCollected: 0,
          totalPayoutsExecuted: 0,
          xInsureTotalSupply: 0,
          valuePerXInsure: 0,
          rwaTargetPercentage: 0,
          currentRWAInvestment: 0,
          availableLiquidity: 0,
          poolUtilization: 0,
          minDepositAmount: 100,
          maxPoolSize: 10000000,
          poolFeePercentage: 0,
          rwaHoldings: rwaHoldings || {}
        });
      }
      
      // Mock user balance for now
      setUserBalance(1000);
    } catch (err) {
      setError('Failed to load pool data. Please try again.');
      console.error('Error loading pool data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = async () => {
    if (!depositAmount || isNaN(Number(depositAmount))) {
      setError('Please enter a valid deposit amount');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Setup user vault if needed
      await setupUserVault();
      
      // Deposit capital
      await depositCapital(Number(depositAmount));
      
      // Reload pool data
      await loadPoolData();
      
      setDepositAmount('');
    } catch (err) {
      setError('Failed to deposit capital. Please try again.');
      console.error('Error depositing capital:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async () => {
    if (!redeemAmount || isNaN(Number(redeemAmount))) {
      setError('Please enter a valid redeem amount');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      await redeemCapital(Number(redeemAmount));
      
      // Reload pool data
      await loadPoolData();
      
      setRedeemAmount('');
    } catch (err) {
      setError('Failed to redeem capital. Please try again.');
      console.error('Error redeeming capital:', err);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
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
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Insurance Pools</h1>
            <p className="text-gray-600 mt-2">Manage liquidity and earn returns</p>
          </div>
          <Button onClick={loadPoolData} disabled={loading}>
            <Activity className="h-4 w-4 mr-2" />
            {loading ? 'Loading...' : 'Refresh'}
          </Button>
        </div>

      {error && (
        <Alert className="mb-6 border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {txStatus.status !== 'idle' && (
        <Alert className={`mb-6 ${
          txStatus.status === 'success' ? 'border-green-200 bg-green-50' :
          txStatus.status === 'error' ? 'border-red-200 bg-red-50' :
          'border-blue-200 bg-blue-50'
        }`}>
          <AlertDescription>
            {txStatus.status === 'pending' && 'Transaction in progress...'}
            {txStatus.status === 'success' && 'Transaction completed successfully!'}
            {txStatus.status === 'error' && `Transaction failed: ${txStatus.error}`}
          </AlertDescription>
        </Alert>
      )}

      {/* Pool Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Liquidity</CardTitle>
            <Droplets className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${poolStats?.totalPoolValue.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-gray-600">
              Available: ${poolStats?.availableLiquidity.toLocaleString() || '0'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pool Utilization</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{poolStats?.poolUtilization || 0}%</div>
            <Progress value={poolStats?.poolUtilization || 0} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Coverage</CardTitle>
            <Shield className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${poolStats?.totalPremiumsCollected.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-gray-600">Active policies</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Participants</CardTitle>
            <Users className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(poolStats?.xInsureTotalSupply || 0)}</div>
            <p className="text-xs text-gray-600">Active LPs</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Pool Overview</TabsTrigger>
          <TabsTrigger value="deposit">Deposit</TabsTrigger>
          <TabsTrigger value="redeem">Redeem</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Pool Performance</CardTitle>
                <CardDescription>Key metrics and performance indicators</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Total Pool Value</span>
                  <span className="text-lg font-bold">${poolStats?.totalPoolValue.toLocaleString() || '0'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Utilization Rate</span>
                  <Badge variant={
                    (poolStats?.poolUtilization || 0) > 80 ? 'destructive' :
                    (poolStats?.poolUtilization || 0) > 60 ? 'secondary' : 'default'
                  }>
                    {poolStats?.poolUtilization || 0}%
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Your Balance</span>
                  <span className="text-lg font-bold">${userBalance.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>RWA Holdings</CardTitle>
                <CardDescription>Real World Asset diversification</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {poolStats?.rwaHoldings && Object.entries(poolStats.rwaHoldings).map(([asset, amount]) => (
                    <div key={asset} className="flex justify-between items-center">
                      <span className="text-sm font-medium">{asset}</span>
                      <span className="text-sm">${amount.toLocaleString()}</span>
                    </div>
                  ))}
                  {(!poolStats?.rwaHoldings || Object.keys(poolStats.rwaHoldings).length === 0) && (
                    <p className="text-sm text-gray-500">No RWA holdings found</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="deposit" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Deposit Capital</CardTitle>
              <CardDescription>Add liquidity to the insurance pool and earn returns</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="deposit-amount">Deposit Amount (USD)</Label>
                <Input
                  id="deposit-amount"
                  type="number"
                  placeholder="Enter amount to deposit"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                />
              </div>
              <div className="text-sm text-gray-600">
                <p>• You'll receive xINSURE tokens representing your share</p>
                <p>• Earn returns from premium collection and RWA investments</p>
                <p>• Minimum deposit: $100</p>
              </div>
              <Button 
                onClick={handleDeposit} 
                disabled={!depositAmount || loading}
                className="w-full"
              >
                <DollarSign className="h-4 w-4 mr-2" />
                {loading ? 'Processing...' : 'Deposit Capital'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="redeem" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Redeem Capital</CardTitle>
              <CardDescription>Withdraw your liquidity from the insurance pool</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="redeem-amount">Redeem Amount (xINSURE)</Label>
                <Input
                  id="redeem-amount"
                  type="number"
                  placeholder="Enter xINSURE amount to redeem"
                  value={redeemAmount}
                  onChange={(e) => setRedeemAmount(e.target.value)}
                />
              </div>
              <div className="text-sm text-gray-600">
                <p>• Your xINSURE tokens will be burned</p>
                <p>• You'll receive your share of the pool's value</p>
                <p>• Redemption may be limited based on available liquidity</p>
              </div>
              <Button 
                onClick={handleRedeem} 
                disabled={!redeemAmount || loading}
                className="w-full"
                variant="outline"
              >
                <TrendingDown className="h-4 w-4 mr-2" />
                {loading ? 'Processing...' : 'Redeem Capital'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
}
