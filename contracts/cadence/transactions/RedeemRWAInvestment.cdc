import InsurancePool from "../contracts/InsurancePool.cdc"

transaction(assetType: String, amount: UFix64) {
    let adminRef: &InsurancePool.Admin

    prepare(acct: auth(Storage) &Account) {
        self.adminRef = acct.storage.borrow<&InsurancePool.Admin>(from: InsurancePool.AdminStoragePath)
            ?? panic("Could not borrow admin reference")
    }

    execute {
        self.adminRef.redeemRWAInvestment(assetType: assetType, amount: amount)
    }
}
