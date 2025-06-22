import XINSURE from "./Xinsure.cdc"

/// InsurancePool Contract - Central contract managing pooled capital,
/// premiums, payouts, and xINSURE token minting/burning
access(all) contract InsurancePool {

    /// Pool state variables
    access(all) var totalPoolValue: UFix64
    access(all) var totalPremiumsCollected: UFix64
    access(all) var totalPayoutsExecuted: UFix64
    access(all) var poolActive: Bool
    access(all) var emergencyPaused: Bool

    /// RWA Investment implementation
    access(all) var rwaInvestmentTargetPercentage: UFix64
    access(all) var rwaHoldings: {String: UFix64}
    access(all) var currentRWAInvestment: UFix64
    access(all) var maxRWAInvestmentPercentage: UFix64

    /// Pool parameters
    access(all) var minDepositAmount: UFix64
    access(all) var maxPoolSize: UFix64
    access(all) var poolFeePercentage: UFix64

    /// Storage paths
    access(all) let PoolStoragePath: StoragePath
    access(all) let PoolPublicPath: PublicPath
    access(all) let AdminStoragePath: StoragePath

    /// Events
    access(all) event PoolInitialized()
    access(all) event CapitalDeposited(lpAddress: Address, usdcAmount: UFix64, xInsureMinted: UFix64)
    access(all) event CapitalRedeemed(lpAddress: Address, xInsureBurned: UFix64, usdcReturned: UFix64)
    access(all) event PremiumCollected(farmerAddress: Address, policyId: UInt64, amount: UFix64)
    access(all) event PayoutExecuted(farmerAddress: Address, policyId: UInt64, amount: UFix64, reason: String)

    /// Public interface for pool operations
    access(all) resource interface PoolPublic {
        access(all) fun depositCapital(lpAddress: Address, tokenVault: @XINSURE.Vault): @XINSURE.Vault
        access(all) fun redeemCapital(lpAddress: Address, xInsureVault: @XINSURE.Vault): @XINSURE.Vault
        access(all) fun collectPremium(farmerAddress: Address, policyId: UInt64, tokenVault: @XINSURE.Vault)
        access(all) fun getPoolBalance(): UFix64
        access(all) fun getAvailableLiquidity(): UFix64
    }

    /// Pool Resource - Manages the core pool functionality
    access(all) resource Pool: PoolPublic {
        
        /// Internal vault holding XINSURE tokens
        access(self) let tokenVault: @XINSURE.Vault
        access(self) let xInsureMinterCap: Capability<&XINSURE.Minter>

        init(xInsureMinterCap: Capability<&XINSURE.Minter>) {
            self.tokenVault <- XINSURE.createEmptyVault(vaultType: Type<@XINSURE.Vault>())
            self.xInsureMinterCap = xInsureMinterCap
        }

        /// Deposit capital from Liquidity Providers
        access(all) fun depositCapital(lpAddress: Address, tokenVault: @XINSURE.Vault): @XINSURE.Vault {
            // Pre-conditions
            if !InsurancePool.poolActive {
                panic("Pool is not active")
            }
            if tokenVault.balance <= 0.0 {
                panic("Deposit amount must be positive")
            }
            if tokenVault.balance < InsurancePool.minDepositAmount {
                panic("Deposit amount below minimum required")
            }

            let depositAmount = tokenVault.balance
            
            // Check if deposit would exceed max pool size
            if InsurancePool.totalPoolValue + depositAmount > InsurancePool.maxPoolSize {
                panic("Deposit would exceed maximum pool size")
            }
            
            // Calculate xINSURE tokens to mint
            let xInsureToMint = self.calculateXInsureToMint(usdcAmount: depositAmount)
            
            // Deposit tokens into pool
            self.tokenVault.deposit(from: <-tokenVault)
            InsurancePool.totalPoolValue = InsurancePool.totalPoolValue + depositAmount
            
            // Mint xINSURE tokens
            let minter = self.xInsureMinterCap.borrow()
                ?? panic("Could not borrow xINSURE minter capability")
            let xInsureVault <- minter.mintTokens(amount: xInsureToMint)
            
            emit CapitalDeposited(
                lpAddress: lpAddress,
                usdcAmount: depositAmount,
                xInsureMinted: xInsureToMint
            )
            
            return <-xInsureVault
        }

        /// Redeem capital by burning xINSURE tokens
        access(all) fun redeemCapital(lpAddress: Address, xInsureVault: @XINSURE.Vault): @XINSURE.Vault {
            if !InsurancePool.poolActive {
                panic("Pool is not active")
            }
            if xInsureVault.balance <= 0.0 {
                panic("Redemption amount must be positive")
            }
            
            let xInsureAmount = xInsureVault.balance
            let tokensToReturn = self.calculateUsdcToReturn(xInsureAmount: xInsureAmount)
            
            if self.tokenVault.balance < tokensToReturn {
                panic("Insufficient pool liquidity")
            }
            
            // Burn xINSURE tokens
            let minter = self.xInsureMinterCap.borrow()
                ?? panic("Could not borrow xINSURE minter capability")
            minter.burnTokens(vault: <-xInsureVault)
            
            // Withdraw tokens from pool
            let returnVault <- self.tokenVault.withdraw(amount: tokensToReturn)
            InsurancePool.totalPoolValue = InsurancePool.totalPoolValue - tokensToReturn
            
            emit CapitalRedeemed(
                lpAddress: lpAddress,
                xInsureBurned: xInsureAmount,
                usdcReturned: tokensToReturn
            )
            
            return <-returnVault
        }

        /// Collect premium from farmers
        access(all) fun collectPremium(farmerAddress: Address, policyId: UInt64, tokenVault: @XINSURE.Vault) {
            if !InsurancePool.poolActive {
                panic("Pool is not active")
            }
            if tokenVault.balance <= 0.0 {
                panic("Premium amount must be positive")
            }
            
            let premiumAmount = tokenVault.balance
            
            // Add premium to pool
            self.tokenVault.deposit(from: <-tokenVault)
            InsurancePool.totalPoolValue = InsurancePool.totalPoolValue + premiumAmount
            InsurancePool.totalPremiumsCollected = InsurancePool.totalPremiumsCollected + premiumAmount
            
            emit PremiumCollected(
                farmerAddress: farmerAddress,
                policyId: policyId,
                amount: premiumAmount
            )
        }

        /// Calculate xINSURE tokens to mint for a given deposit
        access(self) fun calculateXInsureToMint(usdcAmount: UFix64): UFix64 {
            let xInsureTotalSupply = XINSURE.totalSupply
            
            if xInsureTotalSupply == 0.0 {
                return usdcAmount // 1:1 ratio for first deposit
            }
            
            let currentValuePerXInsure = InsurancePool.totalPoolValue / xInsureTotalSupply
            return usdcAmount / currentValuePerXInsure
        }

        /// Calculate tokens to return for a given xINSURE burn amount
        access(self) fun calculateUsdcToReturn(xInsureAmount: UFix64): UFix64 {
            let xInsureTotalSupply = XINSURE.totalSupply
            
            if xInsureTotalSupply == 0.0 {
                return 0.0
            }
            
            let shareOfPool = xInsureAmount / xInsureTotalSupply
            return InsurancePool.totalPoolValue * shareOfPool
        }

        /// Get current pool balance
        access(all) fun getPoolBalance(): UFix64 {
            return self.tokenVault.balance
        }

        /// Get available liquidity
        access(all) fun getAvailableLiquidity(): UFix64 {
            return self.tokenVault.balance
        }
    }

    /// Admin Resource
    access(all) resource Admin {
        access(all) fun setPoolStatus(active: Bool) {
            InsurancePool.poolActive = active
        }

        access(all) fun toggleEmergencyPause() {
            InsurancePool.emergencyPaused = !InsurancePool.emergencyPaused
        }
    }

    /// Get current pool value
    access(all) fun getPoolValue(): UFix64 {
        return self.totalPoolValue
    }

    /// Get xINSURE value per token
    access(all) fun getXInsureValuePerToken(): UFix64 {
        let xInsureTotalSupply = XINSURE.totalSupply
        if xInsureTotalSupply == 0.0 {
            return 1.0
        }
        return self.totalPoolValue / xInsureTotalSupply
    }

    /// Get RWA holdings
    access(all) fun getRWAHoldings(): {String: UFix64} {
        return self.rwaHoldings
    }

    /// Get pool statistics
    access(all) fun getPoolStats(): {String: UFix64} {
        return {
            "totalPoolValue": self.totalPoolValue,
            "totalPremiumsCollected": self.totalPremiumsCollected,
            "totalPayoutsExecuted": self.totalPayoutsExecuted,
            "xInsureTotalSupply": XINSURE.totalSupply,
            "valuePerXInsure": self.getXInsureValuePerToken(),
            "rwaTargetPercentage": self.rwaInvestmentTargetPercentage,
            "currentRWAInvestment": self.currentRWAInvestment,
            "availableLiquidity": self.getAvailableLiquidity(),
            "poolUtilization": self.getPoolUtilization(),
            "minDepositAmount": self.minDepositAmount,
            "maxPoolSize": self.maxPoolSize,
            "poolFeePercentage": self.poolFeePercentage
        }
    }

    /// Get pool utilization percentage
    access(all) fun getPoolUtilization(): UFix64 {
        if self.maxPoolSize == 0.0 {
            return 0.0
        }
        return (self.totalPoolValue / self.maxPoolSize) * 100.0
    }

    /// Get available liquidity from the pool
    access(all) fun getAvailableLiquidity(): UFix64 {
        let poolRef = self.account.storage.borrow<&Pool>(from: self.PoolStoragePath)
            ?? panic("Could not borrow pool reference")
        return poolRef.getAvailableLiquidity()
    }

    init() {
        // Initialize state
        self.totalPoolValue = 0.0
        self.totalPremiumsCollected = 0.0
        self.totalPayoutsExecuted = 0.0
        self.poolActive = true
        self.emergencyPaused = false
        self.rwaInvestmentTargetPercentage = 0.0
        self.rwaHoldings = {}
        self.currentRWAInvestment = 0.0
        self.maxRWAInvestmentPercentage = 80.0
        self.minDepositAmount = 100.0
        self.maxPoolSize = 10000000.0
        self.poolFeePercentage = 0.5

        // Set paths
        self.PoolStoragePath = /storage/InsurancePool
        self.PoolPublicPath = /public/InsurancePool
        self.AdminStoragePath = /storage/InsurancePoolAdmin

        // Get xINSURE minter capability
        let minterCapability = self.account.capabilities.storage.issue<&XINSURE.Minter>(XINSURE.MinterStoragePath)

        // Create and store the pool
        let pool <- create Pool(xInsureMinterCap: minterCapability)
        self.account.storage.save(<-pool, to: self.PoolStoragePath)

        // Create public capability for pool operations
        let poolCapability = self.account.capabilities.storage.issue<&{PoolPublic}>(self.PoolStoragePath)
        self.account.capabilities.publish(poolCapability, at: self.PoolPublicPath)

        // Create and store admin
        let admin <- create Admin()
        self.account.storage.save(<-admin, to: self.AdminStoragePath)

        emit PoolInitialized()
    }
}
