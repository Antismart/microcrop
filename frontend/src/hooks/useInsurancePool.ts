import { useState, useCallback } from 'react';
import * as fcl from '@onflow/fcl';
import * as t from '@onflow/types';

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
}

interface TransactionStatus {
  status: 'idle' | 'pending' | 'success' | 'error';
  txId?: string;
  error?: string;
}

export const useInsurancePool = () => {
  const [txStatus, setTxStatus] = useState<TransactionStatus>({ status: 'idle' });

  // Get pool statistics - Memoized to prevent infinite re-renders
  const getPoolStats = useCallback(async (): Promise<PoolStats | null> => {
    try {
      // Use mock data for now since contracts aren't deployed to testnet
      return {
        totalPoolValue: 2450000,
        totalPremiumsCollected: 125000,
        totalPayoutsExecuted: 45000,
        xInsureTotalSupply: 150,
        valuePerXInsure: 16333.33,
        rwaTargetPercentage: 30,
        currentRWAInvestment: 735000,
        availableLiquidity: 1950000,
        poolUtilization: 20.4,
        minDepositAmount: 100,
        maxPoolSize: 10000000,
        poolFeePercentage: 2.5
      };
    } catch (error) {
      console.error('Error fetching pool stats:', error);
      return null;
    }
  }, []); // Empty dependency array since this function doesn't depend on any state

  // Get RWA holdings
  const getRWAHoldings = async (): Promise<Record<string, number> | null> => {
    try {
      // Return mock RWA holdings data
      return {
        'US Treasury Bonds': 500000,
        'Real Estate Fund': 150000,
        'Agricultural Land': 85000,
        'Corporate Bonds': 200000
      };
    } catch (error) {
      console.error('Error fetching RWA holdings:', error);
      return {};
    }
  };

  // Deposit capital to pool
  const depositCapital = async (amount: number): Promise<string | null> => {
    setTxStatus({ status: 'pending' });

    try {
      // Simulate transaction processing time
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock successful transaction
      const txId = `mock-tx-${Date.now()}`;
      setTxStatus({ status: 'success', txId });
      return txId;
    } catch (error: any) {
      console.error('Deposit failed:', error);
      setTxStatus({ status: 'error', error: error.message });
      return null;
    }
  };

  // Redeem capital from pool
  const redeemCapital = async (xInsureAmount: number): Promise<string | null> => {
    setTxStatus({ status: 'pending' });

    try {
      // Simulate transaction processing time
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock successful transaction
      const txId = `mock-redeem-tx-${Date.now()}`;
      setTxStatus({ status: 'success', txId });
      return txId;
    } catch (error: any) {
      console.error('Redemption failed:', error);
      setTxStatus({ status: 'error', error: error.message });
      return null;
    }
  };

  // Setup user vault
  const setupUserVault = async (): Promise<string | null> => {
    setTxStatus({ status: 'pending' });

    try {
      // Simulate setup time
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock successful setup
      const txId = `mock-setup-tx-${Date.now()}`;
      setTxStatus({ status: 'success', txId });
      return txId;
    } catch (error: any) {
      console.error('Vault setup failed:', error);
      setTxStatus({ status: 'error', error: error.message });
      return null;
    }
  };

  return {
    getPoolStats,
    getRWAHoldings,
    depositCapital,
    redeemCapital,
    setupUserVault,
    txStatus,
    setTxStatus
  };
};
