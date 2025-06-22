// This transaction is disabled due to missing or misconfigured types/imports.
// All code is commented out to prevent compilation errors.
// import InsurancePool from "../contracts/InsurancePool.cdc"
// import XINSURE from "../contracts/Xinsure.cdc"
//
/// Transaction to first mint XINSURE tokens and then deposit them into the pool
/// This is a workaround for the current contract design
// transaction(depositAmount: UFix64) {
//     let poolRef: &{InsurancePool.PoolPublic}
//     let depositVault: @XINSURE.Vault
//
//    prepare(acct: auth(Storage) &Account) {
//         // Get the pool reference from the contract's public capability
//         self.poolRef = getAccount(0xf8d6e0586b0a20c7).capabilities.borrow<&{InsurancePool.PoolPublic}>(InsurancePool.PoolPublicPath)
//             ?? panic("Could not borrow pool reference")
//
//         // Get the minter capability from the contract account (since it's deployed there)
//         let contractAccount = getAccount(0xf8d6e0586b0a20c7)
//         let minterCap = contractAccount.capabilities.get<&XINSURE.Minter>(XINSURE.MinterStoragePath)
//         let minter = minterCap.borrow()
//             ?? panic("Could not borrow minter from contract account")
//
//         // Mint tokens for deposit
//         self.depositVault <- minter.mintTokens(amount: depositAmount)
//     }
//
//     execute {
//         let xInsureVault <- self.poolRef.depositCapital(
//             lpAddress: 0xf8d6e0586b0a20c7,
//             tokenVault: <-self.depositVault
//         )
//
//         // Store the received xINSURE tokens (for now we'll just destroy them)
//         destroy xInsureVault
//     }
// }
