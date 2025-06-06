import "FungibleToken"
import "ViewResolver"
import "Burner"

access(all) contract XINSURE: FungibleToken {

    access(all) var totalSupply: UFix64

    access(all) let name: String
    access(all) let symbol: String
    access(all) let decimals: UInt8

    access(all) let VaultStoragePath: StoragePath
    access(all) let VaultPublicPath: PublicPath
    access(all) let ReceiverPublicPath: PublicPath
    access(all) let MinterStoragePath: StoragePath

    access(all) event TokensInitialized(initialSupply: UFix64)
    access(all) event TokensWithdrawn(amount: UFix64, from: Address?)
    access(all) event TokensDeposited(amount: UFix64, to: Address?)
    access(all) event TokensMinted(amount: UFix64, to: Address?)
    access(all) event TokensBurned(amount: UFix64, from: Address?)

    access(all) resource Vault: FungibleToken.Vault {

        access(all) var balance: UFix64

        init(balance: UFix64) {
            self.balance = balance
        }

        access(FungibleToken.Withdraw) fun withdraw(amount: UFix64): @{FungibleToken.Vault} {
            if amount <= 0.0 {
                panic("Withdrawal amount must be positive")
            }
            if self.balance < amount {
                panic("Insufficient balance")
            }
            self.balance = self.balance - amount
            emit TokensWithdrawn(amount: amount, from: self.owner?.address)
            return <-create Vault(balance: amount)
        }

        access(all) view fun isAvailableToWithdraw(amount: UFix64): Bool {
            return self.balance >= amount
        }

        access(all) fun deposit(from: @{FungibleToken.Vault}) {
            let vault <- from as! @XINSURE.Vault
            if vault.balance <= 0.0 {
                panic("Deposit amount must be positive")
            }
            let amount = vault.balance
            self.balance = self.balance + amount
            emit TokensDeposited(amount: amount, to: self.owner?.address)
            destroy vault
        }

        access(all) view fun getSupportedVaultTypes(): {Type: Bool} {
            return {Type<@XINSURE.Vault>(): true}
        }

        access(all) view fun isSupportedVaultType(type: Type): Bool {
            return type == Type<@XINSURE.Vault>()
        }

        access(all) fun createEmptyVault(): @{FungibleToken.Vault} {
            return <-create Vault(balance: 0.0)
        }

        access(contract) fun burnCallback() {
            self.balance = 0.0
        }

        access(all) view fun getViews(): [Type] {
            return []
        }

        access(all) fun resolveView(_ view: Type): AnyStruct? {
            return nil
        }
    }

    access(all) fun createEmptyVault(vaultType: Type): @{FungibleToken.Vault} {
        return <-create Vault(balance: 0.0)
    }

    access(all) view fun getContractViews(resourceType: Type?): [Type] {
        return []
    }

    access(all) fun resolveContractView(resourceType: Type?, viewType: Type): AnyStruct? {
        return nil
    }

    access(all) resource Minter {

        access(all) fun mintTokens(amount: UFix64): @XINSURE.Vault {
            if amount <= 0.0 {
                panic("Mint amount must be positive")
            }
            let oldSupply = XINSURE.totalSupply
            XINSURE.totalSupply = XINSURE.totalSupply + amount
            if XINSURE.totalSupply != oldSupply + amount {
                panic("Total supply mismatch after mint")
            }
            emit TokensMinted(amount: amount, to: nil)
            return <-create Vault(balance: amount)
        }

        access(all) fun burnTokens(vault: @XINSURE.Vault) {
            if vault.balance <= 0.0 {
                panic("Cannot burn zero tokens")
            }
            let amount = vault.balance
            XINSURE.totalSupply = XINSURE.totalSupply - amount
            emit TokensBurned(amount: amount, from: nil)
            destroy vault
        }
    }

    init() {
        self.name = "MicroCrop Capital Token"
        self.symbol = "xINSURE"
        self.decimals = 8
        self.totalSupply = 0.0

        self.VaultStoragePath = /storage/xINSUREVault
        self.VaultPublicPath = /public/xINSUREVault
        self.ReceiverPublicPath = /public/xINSUREReceiver
        self.MinterStoragePath = /storage/xINSUREMinter

        let vault <- create Vault(balance: self.totalSupply)
        self.account.storage.save(<-vault, to: self.VaultStoragePath)

        // TODO: Capability publishing API is not being accepted. Please consult the Cadence documentation for your version.
        // self.account.capabilities.publish(...)
        // self.account.capabilities.publish(...)

        let minter <- create Minter()
        self.account.storage.save(<-minter, to: self.MinterStoragePath)

        emit TokensInitialized(initialSupply: self.totalSupply)
    }
}
