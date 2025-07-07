import * as fcl from '@onflow/fcl';

// Flow configuration for testnet
const FLOW_CONFIG = {
  'accessNode.api': 'https://rest-testnet.onflow.org',
  'discovery.wallet': 'https://fcl-discovery.onflow.org/testnet/authn',
  'app.detail.title': 'MicroCrop Insurance',
  'app.detail.icon': 'https://microcrop.io/favicon.ico',
  'flow.network': 'testnet'
};

// Contract addresses from deployment
export const CONTRACT_ADDRESSES = {
  OracleContract: '0xa9642fdcc3bd17f8',
  InsurancePool: '0xa9642fdcc3bd17f8',
  XINSURE: '0xa9642fdcc3bd17f8',
  // Flow token address for testnet
  FlowToken: '0x7e60df042a9c0868',
  // Standard contracts
  FungibleToken: '0x9a0766d93b6608b7',
  NonFungibleToken: '0x631e88ae7f1d7c20',
  MetadataViews: '0x631e88ae7f1d7c20'
};

// Initialize Flow configuration
export const initializeFlow = () => {
  fcl.config(FLOW_CONFIG);
  
  // Set up contract addresses
  fcl.config({
    '0xOracleContract': CONTRACT_ADDRESSES.OracleContract,
    '0xInsurancePool': CONTRACT_ADDRESSES.InsurancePool,
    '0xXINSURE': CONTRACT_ADDRESSES.XINSURE,
    '0xFlowToken': CONTRACT_ADDRESSES.FlowToken,
    '0xFungibleToken': CONTRACT_ADDRESSES.FungibleToken,
    '0xNonFungibleToken': CONTRACT_ADDRESSES.NonFungibleToken,
    '0xMetadataViews': CONTRACT_ADDRESSES.MetadataViews
  });
};

// Cadence scripts and transactions
export const CADENCE_SCRIPTS = {
  GET_WEATHER_DATA: `
    import OracleContract from 0xOracleContract

    access(all) fun main(locationId: String): [OracleContract.WeatherData]? {
      return OracleContract.getWeatherData(locationId: locationId)
    }
  `,
  
  GET_POOL_STATS: `
    import InsurancePool from 0xInsurancePool

    access(all) fun main(): {String: AnyStruct} {
      return InsurancePool.getPoolStats()
    }
  `,
  
  GET_USER_POLICIES: `
    import InsurancePool from 0xInsurancePool

    access(all) fun main(userAddress: Address): [InsurancePool.PolicyInfo] {
      return InsurancePool.getUserPolicies(userAddress: userAddress)
    }
  `
};

export const CADENCE_TRANSACTIONS = {
  UPDATE_WEATHER_DATA: `
    import OracleContract from 0xOracleContract

    transaction(
      locationId: String,
      rainfallMM: UFix64,
      temperatureCelsius: UFix64,
      humidity: UFix64,
      windSpeedKMH: UFix64,
      dataSource: String
    ) {
      let dataProvider: &OracleContract.DataProvider

      prepare(acct: auth(Storage) &Account) {
        self.dataProvider = acct.storage.borrow<&OracleContract.DataProvider>(from: OracleContract.DataProviderStoragePath)
          ?? panic("Could not borrow data provider reference")
      }

      execute {
        let timestamp = UInt64(getCurrentBlock().timestamp)
        self.dataProvider.updateWeatherData(
          locationId: locationId,
          rainfallMM: rainfallMM,
          temperatureCelsius: temperatureCelsius,
          humidity: humidity,
          windSpeedKMH: windSpeedKMH,
          timestamp: timestamp,
          dataSource: dataSource
        )
      }
    }
  `,
  
  REGISTER_POLICY: `
    import InsurancePool from 0xInsurancePool
    import FlowToken from 0xFlowToken

    transaction(
      locationId: String,
      cropType: String,
      coverageAmount: UFix64,
      premiumAmount: UFix64
    ) {
      let flowTokenVault: &FlowToken.Vault
      let poolRef: &InsurancePool.InsurancePool

      prepare(acct: auth(Storage) &Account) {
        self.flowTokenVault = acct.storage.borrow<&FlowToken.Vault>(from: /storage/flowTokenVault)
          ?? panic("Could not borrow FlowToken vault")
        
        self.poolRef = acct.storage.borrow<&InsurancePool.InsurancePool>(from: InsurancePool.InsurancePoolStoragePath)
          ?? panic("Could not borrow insurance pool reference")
      }

      execute {
        let premiumPayment <- self.flowTokenVault.withdraw(amount: premiumAmount)
        self.poolRef.registerPolicy(
          locationId: locationId,
          cropType: cropType,
          coverageAmount: coverageAmount,
          premiumPayment: <- premiumPayment
        )
      }
    }
  `,
  
  CHECK_TRIGGERS: `
    import OracleContract from 0xOracleContract

    transaction {
      let oracleRef: &OracleContract.Oracle

      prepare(acct: auth(Storage) &Account) {
        self.oracleRef = acct.storage.borrow<&OracleContract.Oracle>(from: OracleContract.OracleStoragePath)
          ?? panic("Could not borrow oracle reference")
      }

      execute {
        self.oracleRef.checkAndProcessTriggers()
      }
    }
  `,
  
  SETUP_ACCOUNT: `
    import FlowToken from 0xFlowToken
    import FungibleToken from 0xFungibleToken
    import OracleContract from 0xOracleContract
    import InsurancePool from 0xInsurancePool

    transaction {
      prepare(acct: auth(Storage, Capabilities) &Account) {
        // Setup FlowToken vault if not exists
        if acct.storage.borrow<&FlowToken.Vault>(from: /storage/flowTokenVault) == nil {
          acct.storage.save(<-FlowToken.createEmptyVault(), to: /storage/flowTokenVault)
          
          let capability = acct.capabilities.storage.issue<&FlowToken.Vault>(/storage/flowTokenVault)
          acct.capabilities.publish(capability, at: /public/flowTokenBalance)
        }
        
        // Setup Oracle data provider if not exists
        if acct.storage.borrow<&OracleContract.DataProvider>(from: OracleContract.DataProviderStoragePath) == nil {
          acct.storage.save(<-OracleContract.createDataProvider(), to: OracleContract.DataProviderStoragePath)
        }
        
        // Setup Insurance pool interaction capability
        if acct.storage.borrow<&InsurancePool.InsurancePool>(from: InsurancePool.InsurancePoolStoragePath) == nil {
          // This would typically be done by the pool admin
          // For now, we just setup the capability to interact with the pool
        }
      }
    }
  `
};

// Helper functions
export const formatFlowValue = (value: number): string => {
  return value.toFixed(8);
};

export const parseFlowValue = (value: string): number => {
  return parseFloat(value);
};

export const isValidFlowAddress = (address: string): boolean => {
  return /^0x[a-fA-F0-9]{16}$/.test(address);
};

export default {
  initializeFlow,
  CONTRACT_ADDRESSES,
  CADENCE_SCRIPTS,
  CADENCE_TRANSACTIONS,
  formatFlowValue,
  parseFlowValue,
  isValidFlowAddress
};
