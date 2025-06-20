import InsurancePool from "../contracts/InsurancePool.cdc"
import XINSURE from "../contracts/Xinsure.cdc"

transaction(redeemAmount: UFix64) {
    let poolRef: &InsurancePool.Pool
    let xInsureVault: @XINSURE.Vault

    prepare(acct: auth(Storage) &Account) {
        self.poolRef = acct.storage.borrow<&InsurancePool.Pool>(from: InsurancePool.PoolStoragePath)
            ?? panic("Could not borrow pool reference")
        let vaultRef = acct.storage.borrow<&XINSURE.Vault>(from: XINSURE.VaultStoragePath)
            ?? panic("Could not borrow xINSURE vault")
        self.xInsureVault <- vaultRef.withdraw(amount: redeemAmount)
    }

    execute {
        let usdcVault <- self.poolRef.redeemCapital(
            lpAddress: self.poolRef.owner?.address ?? panic("Could not get LP address"),
            xInsureVault: <-self.xInsureVault
        )
        destroy usdcVault
    }
}
