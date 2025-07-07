import InsurancePool from "../contracts/InsurancePool.cdc"

// Simple test transaction to verify Admin functions are accessible
transaction {
    let adminRef: &InsurancePool.Admin

    prepare(acct: auth(Storage) &Account) {
        self.adminRef = acct.storage.borrow<&InsurancePool.Admin>(from: InsurancePool.AdminStoragePath)
            ?? panic("Could not borrow admin reference")
    }

    execute {
        // Test existing function first
        self.adminRef.setPoolStatus(active: true)
        
        // Test new RWA function
        self.adminRef.executeRWAInvestment(assetType: "Test", amount: 100.0)
        
        log("Admin functions test completed")
    }
}
