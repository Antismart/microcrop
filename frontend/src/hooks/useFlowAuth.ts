import { useState, useEffect } from 'react';
import * as fcl from '@onflow/fcl';

// Configure FCL for Flow testnet with deployed contracts
fcl.config({
  'app.detail.title': 'MicroCrop Insurance',
  'app.detail.icon': 'https://microcrop.app/icon.png',
  'accessNode.api': 'https://rest-testnet.onflow.org',
  'discovery.wallet': 'https://fcl-discovery.onflow.org/testnet/authn',
  'flow.network': 'testnet',
  '0xFungibleToken': '0x9a0766d93b6608b7',
  '0xFlowToken': '0x7e60df042a9c0868',
  '0xInsurancePool': '0xa9642fdcc3bd17f8',
  '0xXINSURE': '0xa9642fdcc3bd17f8',
  '0xOracleContract': '0xa9642fdcc3bd17f8'
});

interface FlowUser {
  addr?: string;
  loggedIn?: boolean;
}

export const useFlowAuth = () => {
  const [user, setUser] = useState<FlowUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Subscribe to FCL user state changes
    const unsubscribe = fcl.currentUser.subscribe(setUser);
    return () => unsubscribe();
  }, []);

  const logIn = async () => {
    setIsLoading(true);
    try {
      await fcl.authenticate();
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const logOut = async () => {
    setIsLoading(true);
    try {
      await fcl.unauthenticate();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    user,
    logIn,
    logOut,
    isLoading,
    isConnected: !!user?.loggedIn,
  };
};