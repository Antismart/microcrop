import InsurancePool from "../contracts/InsurancePool.cdc"

transaction(farmer: Address, policyId: UInt64, payoutAmount: UFix64, reason: String) {
    let adminRef: &InsurancePool.Admin

    prepare(acct: auth(Storage) &Account) {
        self.adminRef = acct.storage.borrow<&InsurancePool.Admin>(from: InsurancePool.AdminStoragePath)
            ?? panic("Could not borrow admin reference")
    }

    execute {
        let oracle <- self.adminRef.createOracleAccess()
        oracle.executePayout(
            farmerAddress: farmer,
            policyId: policyId,
            payoutAmount: payoutAmount,
            reason: reason
        )
        destroy oracle
    }
}
