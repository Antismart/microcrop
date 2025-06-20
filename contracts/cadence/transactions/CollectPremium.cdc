import InsurancePool from "../contracts/InsurancePool.cdc"
import XINSURE from "../contracts/Xinsure.cdc"

transaction(policyId: UInt64, premiumAmount: UFix64) {
    let poolRef: &InsurancePool.Pool
    let minter: &XINSURE.Minter
    let premiumVault: @XINSURE.Vault

    prepare(acct: auth(Storage) &Account) {
        self.poolRef = acct.storage.borrow<&InsurancePool.Pool>(from: InsurancePool.PoolStoragePath)
            ?? panic("Could not borrow pool reference")
        self.minter = acct.storage.borrow<&XINSURE.Minter>(from: XINSURE.MinterStoragePath)
            ?? panic("Could not borrow minter")
        self.premiumVault <- self.minter.mintTokens(amount: premiumAmount)
    }

    execute {
        self.poolRef.collectPremium(
            farmerAddress: self.poolRef.owner?.address ?? panic("Could not get farmer address"),
            policyId: policyId,
            tokenVault: <-self.premiumVault
        )
    }
}
