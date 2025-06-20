import InsurancePool from "../contracts/InsurancePool.cdc"
import XINSURE from "../contracts/Xinsure.cdc"

transaction(depositAmount: UFix64) {
    let poolRef: &InsurancePool.Pool
    let minter: &XINSURE.Minter
    let depositVault: @XINSURE.Vault

    prepare(acct: auth(Storage) &Account) {
        self.poolRef = acct.storage.borrow<&InsurancePool.Pool>(from: InsurancePool.PoolStoragePath)
            ?? panic("Could not borrow pool reference")
        self.minter = acct.storage.borrow<&XINSURE.Minter>(from: XINSURE.MinterStoragePath)
            ?? panic("Could not borrow minter")
        self.depositVault <- self.minter.mintTokens(amount: depositAmount)
    }

    execute {
        let xInsureVault <- self.poolRef.depositCapital(
            lpAddress: self.poolRef.owner?.address ?? panic("Could not get LP address"),
            tokenVault: <-self.depositVault
        )
        destroy xInsureVault
    }
}
