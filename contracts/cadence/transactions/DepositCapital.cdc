import InsurancePool from "../contracts/InsurancePool.cdc"
import XINSURE from "../contracts/Xinsure.cdc"

transaction(depositAmount: UFix64) {
    let poolRef: &{InsurancePool.PoolPublic}
    let depositVault: @XINSURE.Vault

    prepare(acct: auth(Storage) &Account) {
        // Get the pool reference from the contract's public capability
        self.poolRef = getAccount(0xf8d6e0586b0a20c7).capabilities.borrow<&{InsurancePool.PoolPublic}>(InsurancePool.PoolPublicPath)
            ?? panic("Could not borrow pool reference")
        
        // For demo purposes, create tokens from the minter
        let minter = acct.storage.borrow<&XINSURE.Minter>(from: XINSURE.MinterStoragePath)
            ?? panic("Could not borrow minter")
        self.depositVault <- minter.mintTokens(amount: depositAmount)
    }

    execute {
        let xInsureVault <- self.poolRef.depositCapital(
            lpAddress: 0xf8d6e0586b0a20c7,
            tokenVault: <-self.depositVault
        )
        destroy xInsureVault
    }
}
