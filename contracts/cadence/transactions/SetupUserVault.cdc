import XINSURE from "../contracts/Xinsure.cdc"

/// Transaction to set up a user's xINSURE vault
transaction {
    prepare(acct: auth(Storage, Capabilities) &Account) {
        // Check if vault already exists
        if acct.storage.borrow<&XINSURE.Vault>(from: XINSURE.VaultStoragePath) == nil {
            // Create a new empty vault
            let vault <- XINSURE.createEmptyVault(vaultType: Type<@XINSURE.Vault>())
            acct.storage.save(<-vault, to: XINSURE.VaultStoragePath)
            // Create public capability for receiving tokens
            let receiverCap = acct.capabilities.storage.issue<&{XINSURE.Receiver}>(XINSURE.VaultStoragePath)
            acct.capabilities.publish(receiverCap, at: XINSURE.ReceiverPublicPath)
        }
    }
}
