import XINSURE from "../contracts/Xinsure.cdc"

/// Transaction to mint XINSURE tokens for testing
transaction(amount: UFix64) {
    let minter: &XINSURE.Minter
    let recipient: &{XINSURE.Receiver}

    prepare(acct: auth(Storage, Capabilities) &Account) {
        // Borrow the minter from the contract account
        self.minter = acct.storage.borrow<&XINSURE.Minter>(from: XINSURE.MinterStoragePath)
            ?? panic("Could not borrow minter reference")
        
        // Set up recipient vault if it doesn't exist
        if acct.storage.borrow<&XINSURE.Vault>(from: XINSURE.VaultStoragePath) == nil {
            let vault <- XINSURE.createEmptyVault(vaultType: Type<@XINSURE.Vault>())
            acct.storage.save(<-vault, to: XINSURE.VaultStoragePath)
            
            let receiverCap = acct.capabilities.storage.issue<&{XINSURE.Receiver}>(XINSURE.VaultStoragePath)
            acct.capabilities.publish(receiverCap, at: XINSURE.ReceiverPublicPath)
        }
        
        self.recipient = acct.capabilities.borrow<&{XINSURE.Receiver}>(XINSURE.ReceiverPublicPath)
            ?? panic("Could not borrow recipient reference")
    }

    execute {
        let tokens <- self.minter.mintTokens(amount: amount)
        self.recipient.deposit(from: <-tokens)
    }
}
