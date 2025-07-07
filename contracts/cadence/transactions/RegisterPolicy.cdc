import OracleContract from "../contracts/OracleContract.cdc"
import InsurancePool from "../contracts/InsurancePool.cdc"

/// Transaction to register a new policy in the oracle
transaction(
    policyId: UInt64,
    farmerAddress: Address,
    locationId: String,
    cropType: String,
    coverageAmount: UFix64
) {
    let adminRef: &OracleContract.Admin

    prepare(acct: auth(Storage) &Account) {
        self.adminRef = acct.storage.borrow<&OracleContract.Admin>(from: OracleContract.AdminStoragePath)
            ?? panic("Could not borrow oracle admin reference")
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
