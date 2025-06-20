import ViewResolver from "../../imports/1d7e57aa55817448/ViewResolver.cdc"
import Burner from "../../imports/f233dcee88fe0abe/Burner.cdc"

access(all) contract XINSURE {

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

    access(all) resource interface Receiver {
        access(all) fun deposit(from: @Vault)
    }

    access(all) resource Vault: Receiver {

        access(all) var balance: UFix64

        init(balance: UFix64) {
            self.balance = balance
        }

        access(all) fun withdraw(amount: UFix64): @Vault {
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

        access(all) fun deposit(from: @Vault) {
            let vault <- from
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

        access(all) fun createEmptyVault(): @Vault {
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

    access(all) fun createEmptyVault(vaultType: Type): @Vault {
        return <-create Vault(balance: 0.0)
    }

    access(all) view fun getContractViews(resourceType: Type?): [Type] {
        return []
    }

    access(all) fun resolveContractView(resourceType: Type?, viewType: Type): AnyStruct? {
        return nil
    }

    access(all) resource Minter {
        access(all) fun mintTokens(amount: UFix64): @Vault {
            if amount <= 0.0 {
                panic("Mint amount must be positive")
            }
            XINSURE.totalSupply = XINSURE.totalSupply + amount
            emit TokensMinted(amount: amount, to: self.owner?.address)
            return <-create Vault(balance: amount)
        }
        access(all) fun burnTokens(vault: @Vault) {
            let amount = vault.balance
            if amount <= 0.0 {
                panic("Burn amount must be positive")
            }
            XINSURE.totalSupply = XINSURE.totalSupply - amount
            emit TokensBurned(amount: amount, from: self.owner?.address)
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
