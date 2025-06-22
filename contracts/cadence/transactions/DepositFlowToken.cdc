// This transaction is disabled because FlowToken is not supported in this project.
// All code is commented out to prevent compilation errors.
// import FlowToken from "../imports/1654653399040a61/FlowToken.cdc"
// transaction(depositAmount: UFix64) {
//     let poolRef: &{InsurancePool.PoolPublic}
//     let paymentVault: @FlowToken.Vault
//     prepare(acct: auth(Storage) &Account) {
//         self.poolRef = getAccount(0xf8d6e0586b0a20c7).capabilities.borrow<&{InsurancePool.PoolPublic}>(InsurancePool.PoolPublicPath)
//             ?? panic("Could not borrow pool reference")
//         let vaultRef = acct.storage.borrow<&FlowToken.Vault>(from: /storage/flowTokenVault)
//             ?? panic("Could not borrow FlowToken vault")
//         self.paymentVault <- vaultRef.withdraw(amount: depositAmount)
//     }
//     execute {
//         let xInsureVault <- self.poolRef.depositCapital(
//             lpAddress: 0xf8d6e0586b0a20c7,
//             tokenVault: <-self.paymentVault
//         )
//         destroy xInsureVault
//     }
// }
