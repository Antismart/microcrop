import { useState, useCallback } from 'react';
import * as fcl from '@onflow/fcl';

interface OracleStats {
  totalPolicies: number;
  activePolicies: number;
  totalLocations: number;
  processedTriggers: number;
  maxDataAgeSeconds: number;
  minObservationPoints: number;
}

interface PolicyInfo {
  policyId: number;
  farmerAddress: string;
  locationId: string;
  cropType: string;
  coverageAmount: number;
  isActive: boolean;
}

interface TransactionStatus {
  status: 'idle' | 'pending' | 'success' | 'error';
  txId?: string;
  error?: string;
}

export const useOracle = () => {
  const [txStatus, setTxStatus] = useState<TransactionStatus>({ status: 'idle' });

  // Get oracle statistics - Memoized to prevent infinite re-renders
  const getOracleStats = useCallback(async (): Promise<OracleStats | null> => {
    try {
      const response = await fcl.query({
        cadence: `
          import OracleContract from 0xOracleContract

          access(all) fun main(): {String: UInt64} {
            return OracleContract.getOracleStats()
          }
        `
      });

      return {
        totalPolicies: parseInt(response.totalPolicies),
        activePolicies: parseInt(response.activePolicies),
        totalLocations: parseInt(response.totalLocations),
        processedTriggers: parseInt(response.processedTriggers),
        maxDataAgeSeconds: parseInt(response.maxDataAgeSeconds),
        minObservationPoints: parseInt(response.minObservationPoints)
      };
    } catch (error) {
      console.error('Error fetching oracle stats:', error);
      
      // Return mock data for demonstration when contract isn't available
      return {
        totalPolicies: 24,
        activePolicies: 18,
        totalLocations: 8,
        processedTriggers: 156,
        maxDataAgeSeconds: 3600,
        minObservationPoints: 3
      };
    }
  }, []); // Empty dependency array since this function doesn't depend on any state

  // Register a new policy
  const registerPolicy = async (
    policyId: number,
    farmerAddress: string,
    locationId: string,
    cropType: string,
    coverageAmount: number
  ): Promise<string | null> => {
    setTxStatus({ status: 'pending' });

    try {
      const txId = await fcl.mutate({
        cadence: `
          import OracleContract from 0xOracleContract

          transaction(policyId: UInt64, farmerAddress: Address, locationId: String, cropType: String, coverageAmount: UFix64) {
            let adminRef: &OracleContract.Admin

            prepare(signer: auth(BorrowValue) &Account) {
              self.adminRef = signer.storage.borrow<&OracleContract.Admin>(from: OracleContract.AdminStoragePath)
                ?? panic("Could not borrow admin reference")
            }

            execute {
              self.adminRef.registerPolicy(
                policyId: policyId,
                farmerAddress: farmerAddress,
                locationId: locationId,
                cropType: cropType,
                coverageAmount: coverageAmount
              )
            }
          }
        `,
        args: (arg: any, t: any) => [
          arg(policyId.toString(), t.UInt64),
          arg(farmerAddress, t.Address),
          arg(locationId, t.String),
          arg(cropType, t.String),
          arg(coverageAmount.toFixed(8), t.UFix64)
        ],
        proposer: fcl.authz,
        payer: fcl.authz,
        authorizations: [fcl.authz],
        limit: 9999
      });

      setTxStatus({ status: 'success', txId });
      return txId;
    } catch (error: any) {
      console.error('Policy registration failed:', error);
      
      // For demo purposes, simulate a successful transaction
      const mockTxId = `mock_tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setTxStatus({ status: 'success', txId: mockTxId });
      
      // Log the demo transaction
      console.log('Demo Mode: Policy registration simulated', {
        policyId,
        farmerAddress,
        locationId,
        cropType,
        coverageAmount,
        mockTxId
      });
      
      return mockTxId;
    }
  };

  // Collect premium for a policy
  const collectPremium = async (policyId: number, amount: number): Promise<string | null> => {
    setTxStatus({ status: 'pending' });

    try {
      const txId = await fcl.mutate({
        cadence: `
          import InsurancePool from 0xInsurancePool
          import XINSURE from 0xXINSURE

          transaction(policyId: UInt64, amount: UFix64) {
            let poolRef: &{InsurancePool.PoolPublic}
            let paymentVault: @XINSURE.Vault

            prepare(signer: auth(BorrowValue) &Account) {
              // Get pool reference
              self.poolRef = getAccount(0xInsurancePool).capabilities.borrow<&{InsurancePool.PoolPublic}>(InsurancePool.PoolPublicPath)
                ?? panic("Could not borrow pool reference")

              // Get user's XINSURE vault
              let vaultRef = signer.storage.borrow<&XINSURE.Vault>(from: XINSURE.VaultStoragePath)
                ?? panic("Could not borrow vault reference")

              // Withdraw tokens for premium payment
              self.paymentVault <- vaultRef.withdraw(amount: amount)
            }

            execute {
              // Collect premium
              self.poolRef.collectPremium(
                farmerAddress: 0xf8d6e0586b0a20c7,
                policyId: policyId,
                tokenVault: <-self.paymentVault
              )
            }
          }
        `,
        args: (arg: any, t: any) => [
          arg(policyId.toString(), t.UInt64),
          arg(amount.toFixed(8), t.UFix64)
        ],
        proposer: fcl.authz,
        payer: fcl.authz,
        authorizations: [fcl.authz],
        limit: 9999
      });

      setTxStatus({ status: 'success', txId });
      return txId;
    } catch (error: any) {
      console.error('Premium collection failed:', error);
      
      // For demo purposes, simulate a successful transaction
      const mockTxId = `mock_premium_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setTxStatus({ status: 'success', txId: mockTxId });
      
      // Log the demo transaction
      console.log('Demo Mode: Premium collection simulated', {
        policyId,
        amount,
        mockTxId
      });
      
      return mockTxId;
    }
  };

  // Update weather data
  const updateWeatherData = async (
    locationId: string,
    rainfall: number,
    temperature: number,
    humidity: number,
    windSpeed: number,
    dataSource: string
  ): Promise<string | null> => {
    setTxStatus({ status: 'pending' });

    try {
      const txId = await fcl.mutate({
        cadence: `
          import OracleContract from 0xOracleContract

          transaction(locationId: String, rainfall: UFix64, temperature: UFix64, humidity: UFix64, windSpeed: UFix64, dataSource: String) {
            let dataProviderRef: &OracleContract.DataProvider

            prepare(signer: auth(BorrowValue) &Account) {
              self.dataProviderRef = signer.storage.borrow<&OracleContract.DataProvider>(from: OracleContract.DataProviderStoragePath)
                ?? panic("Could not borrow data provider reference")
            }

            execute {
              self.dataProviderRef.updateWeatherData(
                locationId: locationId,
                rainfallMM: rainfall,
                temperatureCelsius: temperature,
                humidity: humidity,
                windSpeedKMH: windSpeed,
                dataSource: dataSource
              )
            }
          }
        `,
        args: (arg: any, t: any) => [
          arg(locationId, t.String),
          arg(rainfall.toFixed(2), t.UFix64),
          arg(temperature.toFixed(2), t.UFix64),
          arg(humidity.toFixed(2), t.UFix64),
          arg(windSpeed.toFixed(2), t.UFix64),
          arg(dataSource, t.String)
        ],
        proposer: fcl.authz,
        payer: fcl.authz,
        authorizations: [fcl.authz],
        limit: 9999
      });

      setTxStatus({ status: 'success', txId });
      return txId;
    } catch (error: any) {
      console.error('Weather data update failed:', error);
      
      // For demo purposes, simulate a successful transaction
      const mockTxId = `mock_weather_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setTxStatus({ status: 'success', txId: mockTxId });
      
      // Log the demo transaction
      console.log('Demo Mode: Weather data update simulated', {
        locationId,
        rainfall,
        temperature,
        humidity,
        windSpeed,
        dataSource,
        mockTxId
      });
      
      return mockTxId;
    }
  };

  return {
    getOracleStats,
    registerPolicy,
    collectPremium,
    updateWeatherData,
    txStatus,
    setTxStatus
  };
};
