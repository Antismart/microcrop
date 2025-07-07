import OracleContract from "../contracts/OracleContract.cdc"

transaction {
    prepare(signer: auth(SaveValue, BorrowValue, IssueStorageCapabilityController, PublishCapability) &Account) {
        // Check if data provider already exists
        if signer.storage.check<@OracleContract.DataProvider>(from: OracleContract.DataProviderStoragePath) {
            log("Data provider already exists")
            return
        }
        
        // Create and store the data provider resource using the public function
        let dataProvider <- OracleContract.createDataProvider()
        signer.storage.save(<-dataProvider, to: OracleContract.DataProviderStoragePath)
        
        // Create public capability for the data provider
        let capability = signer.capabilities.storage.issue<&OracleContract.DataProvider>(
            OracleContract.DataProviderStoragePath
        )
        signer.capabilities.publish(capability, at: /public/OracleDataProvider)
    }
    
    execute {
        log("Oracle data provider created successfully")
    }
}
