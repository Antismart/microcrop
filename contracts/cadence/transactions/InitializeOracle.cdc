import OracleContract from "../contracts/OracleContract.cdc"
import InsurancePool from "../contracts/InsurancePool.cdc"

/// Transaction to initialize Oracle with InsurancePool access
/// Must be run after both contracts are deployed
transaction {
    prepare(acct: auth(Storage, Capabilities) &Account) {
        // Get admin references
        let poolAdmin = acct.storage.borrow<&InsurancePool.Admin>(from: InsurancePool.AdminStoragePath)
            ?? panic("Could not borrow InsurancePool admin")
        
        let oracle = acct.storage.borrow<&OracleContract.Oracle>(from: OracleContract.OracleStoragePath)
            ?? panic("Could not borrow Oracle")
        
        // Create Oracle Access resource and capability
        let oracleAccess <- poolAdmin.createOracleAccess()
        
        // Store the oracle access resource
        let oracleAccessStoragePath = /storage/OracleAccessForOracle
        acct.storage.save(<-oracleAccess, to: oracleAccessStoragePath)
        
        // Create and provide capability to Oracle
        let oracleAccessCap = acct.capabilities.storage.issue<&{InsurancePool.OracleAccess}>(oracleAccessStoragePath)
        oracle.setOracleAccess(capability: oracleAccessCap)
    }
    
    execute {
        log("Oracle successfully initialized with InsurancePool access")
    }
}
