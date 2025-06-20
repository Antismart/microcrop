// NOTE: Replace 0xFUNGIBLETOKENADDRESS and 0xXINSUREADDRESS with actual deployed addresses in your flow.json or emulator
import XINSURE from "./Xinsure.cdc"

/// InsurancePool Contract - Central contract managing pooled capital,
/// premiums, payouts, and xINSURE token minting/burning
/// 
/// This contract serves as the core of the MicroCrop parametric crop insurance system,
/// handling liquidity provision, premium collection, and automated payouts.
access(all) contract InsurancePool {

    /// Pool state variables
    access(all) var totalPoolValue: UFix64
    access(all) var totalPremiumsCollected: UFix64
    access(all) var totalPayoutsExecuted: UFix64
    access(all) var poolActive: Bool
    access(all) var emergencyPaused: Bool

    /// RWA Investment implementation
    access(all) var rwaInvestmentTargetPercentage: UFix64
    access(all) var rwaHoldings: {String: UFix64} // Token symbol -> Amount
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
    access(all) let OracleCapabilityPath: PrivatePath

    /// Events
    access(all) event PoolInitialized()
    access(all) event CapitalDeposited(lpAddress: Address, usdcAmount: UFix64, xInsureMinted: UFix64)
    access(all) event CapitalRedeemed(lpAddress: Address, xInsureBurned: UFix64, usdcReturned: UFix64)
    access(all) event PremiumCollected(farmerAddress: Address, policyId: UInt64, amount: UFix64)
    access(all) event PayoutExecuted(farmerAddress: Address, policyId: UInt64, amount: UFix64, reason: String)
    access(all) event PoolStatusChanged(active: Bool)
    access(all) event EmergencyPauseToggled(paused: Bool)
    access(all) event RWAInvestmentTargetSet(percentage: UFix64)
    access(all) event RWAInvestmentExecuted(assetType: String, amount: UFix64)
    access(all) event RWAInvestmentRedeemed(assetType: String, amount: UFix64)
    access(all) event PoolParametersUpdated(minDeposit: UFix64, maxPoolSize: UFix64, feePercentage: UFix64)

    /// Pool Resource - Manages the core pool functionality
    access(all) resource Pool {
        
        /// Internal vault holding FungibleToken tokens (placeholder for USDFC)
        access(self) let tokenVault: @XINSURE.Vault
        
        /// Capability to mint and burn xINSURE tokens
        access(self) let xInsureMinterCap: Capability<&XINSURE.Minter>

        init(xInsureMinterCap: Capability<&XINSURE.Minter>) {
            // Initialize with empty XINSURE vault as placeholder
            // TODO: Replace with USDFC.createEmptyVault() when USDFC contract is available
            // For now, we use XINSURE vault but this should be USDFC vault for production
            self.tokenVault <- XINSURE.createEmptyVault(vaultType: Type<@XINSURE.Vault>())
            self.xInsureMinterCap = xInsureMinterCap
        }

        /// Deposit capital from Liquidity Providers
        /// 
        /// @param lpAddress: Address of the liquidity provider
        /// @param tokenVault: FungibleToken vault containing the deposit
        /// @return xINSURE vault with minted tokens
        access(all) fun depositCapital(lpAddress: Address, tokenVault: @XINSURE.Vault): @XINSURE.Vault {
            // Pre-conditions
            if !InsurancePool.poolActive {
                panic("Pool is not active")
            }
            if InsurancePool.emergencyPaused {
                panic("Pool is emergency paused")
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
            
            // Calculate xINSURE tokens to mint based on current pool value
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
        /// 
        /// @param lpAddress: Address of the liquidity provider
        /// @param xInsureVault: xINSURE vault containing tokens to burn
        /// @return FungibleToken vault with redeemed capital
        access(all) fun redeemCapital(lpAddress: Address, xInsureVault: @XINSURE.Vault): @XINSURE.Vault {
            if !InsurancePool.poolActive {
                panic("Pool is not active")
            }
            if InsurancePool.emergencyPaused {
                panic("Pool is emergency paused")
            }
            if xInsureVault.balance <= 0.0 {
                panic("Redemption amount must be positive")
            }
            
            let xInsureAmount = xInsureVault.balance
            
            // Calculate tokens to return based on current pool value
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
        /// 
        /// @param farmerAddress: Address of the farmer paying premium
        /// @param policyId: Unique policy identifier
        /// @param tokenVault: FungibleToken vault containing premium payment
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

        /// Execute payout (only callable by trusted oracle)
        /// 
        /// @param farmerAddress: Address to receive payout
        /// @param policyId: Policy identifier
        /// @param payoutAmount: Amount to payout
        /// @param reason: Reason for payout (e.g., "Drought conditions met")
        /// @return FungibleToken vault with payout amount
        access(all) fun triggerPayout(
            farmerAddress: Address,
            policyId: UInt64,
            payoutAmount: UFix64,
            reason: String
        ): @XINSURE.Vault {
            if !InsurancePool.poolActive {
                panic("Pool is not active")
            }
            if payoutAmount <= 0.0 {
                panic("Payout amount must be positive")
            }
            if self.tokenVault.balance < payoutAmount {
                panic("Insufficient pool funds for payout")
            }
            
            // Execute payout
            let payoutVault <- self.tokenVault.withdraw(amount: payoutAmount)
            InsurancePool.totalPoolValue = InsurancePool.totalPoolValue - payoutAmount
            InsurancePool.totalPayoutsExecuted = InsurancePool.totalPayoutsExecuted + payoutAmount
            
            emit PayoutExecuted(
                farmerAddress: farmerAddress,
                policyId: policyId,
                amount: payoutAmount,
                reason: reason
            )
            
            return <-payoutVault
        }

        /// Calculate xINSURE tokens to mint for a given token deposit
        access(self) fun calculateXInsureToMint(usdcAmount: UFix64): UFix64 {
            let xInsureTotalSupply = XINSURE.totalSupply
            
            if xInsureTotalSupply == 0.0 {
                // First deposit: 1:1 ratio
                return usdcAmount
            }
            
            // Calculate based on current pool value per xINSURE
            let currentValuePerXInsure = InsurancePool.totalPoolValue / xInsureTotalSupply
            return usdcAmount / currentValuePerXInsure
        }

        /// Calculate tokens to return for a given xINSURE burn amount
        access(self) fun calculateUsdcToReturn(xInsureAmount: UFix64): UFix64 {
            let xInsureTotalSupply = XINSURE.totalSupply
            
            if xInsureTotalSupply == 0.0 {
                return 0.0
            }
            
            // Calculate proportional share of pool
            let shareOfPool = xInsureAmount / xInsureTotalSupply
            return InsurancePool.totalPoolValue * shareOfPool
        }

        /// Get current pool balance
        access(all) fun getPoolBalance(): UFix64 {
            return self.tokenVault.balance
        }

        /// Return tokens to pool (used for failed payout scenarios)
        access(all) fun returnTokensToPool(vault: @XINSURE.Vault) {
            let amount = vault.balance
            self.tokenVault.deposit(from: <-vault)
            InsurancePool.totalPoolValue = InsurancePool.totalPoolValue + amount
        }

        /// Invest in RWA (Real World Assets) - placeholder implementation
        access(all) fun investInRWA(assetType: String, amount: UFix64) {
            if amount <= 0.0 {
                panic("Investment amount must be positive")
            }
            if self.tokenVault.balance < amount {
                panic("Insufficient pool funds for RWA investment")
            }
            
            // Check if investment would exceed RWA allocation limits
            let newRWATotal = InsurancePool.currentRWAInvestment + amount
            let maxRWAAllowed = InsurancePool.totalPoolValue * (InsurancePool.maxRWAInvestmentPercentage / 100.0)
            
            if newRWATotal > maxRWAAllowed {
                panic("RWA investment would exceed maximum allocation percentage")
            }
            
            // Withdraw funds from pool for RWA investment
            let investmentVault <- self.tokenVault.withdraw(amount: amount)
            
            // Update RWA holdings (in production, this would interact with RWA protocols)
            if InsurancePool.rwaHoldings.containsKey(assetType) {
                InsurancePool.rwaHoldings[assetType] = InsurancePool.rwaHoldings[assetType]! + amount
            } else {
                InsurancePool.rwaHoldings[assetType] = amount
            }
            
            InsurancePool.currentRWAInvestment = InsurancePool.currentRWAInvestment + amount
            
            // For now, we destroy the vault as placeholder
            // In production, this would be sent to RWA investment protocols
            destroy investmentVault
            
            emit RWAInvestmentExecuted(assetType: assetType, amount: amount)
        }

        /// Redeem RWA investment - placeholder implementation
        access(all) fun redeemRWAInvestment(assetType: String, amount: UFix64) {
            if amount <= 0.0 {
                panic("Redemption amount must be positive")
            }
            if !InsurancePool.rwaHoldings.containsKey(assetType) {
                panic("No holdings found for specified asset type")
            }
            if InsurancePool.rwaHoldings[assetType]! < amount {
                panic("Insufficient RWA holdings for redemption")
            }
            
            // Update RWA holdings
            InsurancePool.rwaHoldings[assetType] = InsurancePool.rwaHoldings[assetType]! - amount
            InsurancePool.currentRWAInvestment = InsurancePool.currentRWAInvestment - amount
            
            // In production, this would receive tokens from RWA protocols
            // For now, we create tokens as placeholder (this would be from actual RWA redemption)
            let redeemedVault <- XINSURE.createEmptyVault(vaultType: Type<@XINSURE.Vault>())
            // Note: In production, this would be actual USDFC tokens received from RWA protocols
            
            // Add redeemed funds back to pool
            self.tokenVault.deposit(from: <-redeemedVault)
            
            emit RWAInvestmentRedeemed(assetType: assetType, amount: amount)
        }

        /// Get available liquidity (excluding RWA investments)
        access(all) fun getAvailableLiquidity(): UFix64 {
            return self.tokenVault.balance
        }
    }

    /// Oracle Access Resource - Controls oracle access to trigger payouts
    access(all) resource OracleAccess {
        
        /// Trigger payout (only accessible by oracle)
        access(all) fun executePayout(
            farmerAddress: Address,
            policyId: UInt64,
            payoutAmount: UFix64,
            reason: String
        ) {
            let poolRef = InsurancePool.account.storage.borrow<&Pool>(from: InsurancePool.PoolStoragePath)
                ?? panic("Could not borrow pool reference")
            
            let payoutVault <- poolRef.triggerPayout(
                farmerAddress: farmerAddress,
                policyId: policyId,
                payoutAmount: payoutAmount,
                reason: reason
            )
            
            // Send payout to farmer using proper capability API
            let farmerAccount = getAccount(farmerAddress)
            let receiverCapability = farmerAccount.capabilities.get<&{XINSURE.Receiver}>(
                /public/flowTokenReceiver // Using FlowToken receiver as placeholder until USDFC is available
            )
            
            if let receiver = receiverCapability.borrow() {
                receiver.deposit(from: <-payoutVault)
            } else {
                // If farmer doesn't have a receiver set up, return vault to pool
                // This is a safety measure to prevent token loss
                poolRef.returnTokensToPool(vault: <-payoutVault)
                
                // Log the failed payout
                panic("Farmer does not have a valid token receiver capability set up")
            }
        }
    }

    /// Admin Resource - Manages pool configuration
    access(all) resource Admin {
        
        /// Set pool active status
        access(all) fun setPoolStatus(active: Bool) {
            InsurancePool.poolActive = active
            emit PoolStatusChanged(active: active)
        }

        /// Toggle emergency pause
        access(all) fun toggleEmergencyPause() {
            InsurancePool.emergencyPaused = !InsurancePool.emergencyPaused
            emit EmergencyPauseToggled(paused: InsurancePool.emergencyPaused)
        }

        /// Set RWA investment target percentage
        access(all) fun setRWAInvestmentTarget(percentage: UFix64) {
            if percentage < 0.0 || percentage > InsurancePool.maxRWAInvestmentPercentage {
                panic("Percentage must be between 0 and maximum RWA percentage")
            }
            InsurancePool.rwaInvestmentTargetPercentage = percentage
            emit RWAInvestmentTargetSet(percentage: percentage)
        }

        /// Update pool parameters
        access(all) fun updatePoolParameters(minDeposit: UFix64, maxPoolSize: UFix64, feePercentage: UFix64) {
            if minDeposit < 0.0 {
                panic("Minimum deposit must be non-negative")
            }
            if maxPoolSize <= 0.0 {
                panic("Maximum pool size must be positive")
            }
            if feePercentage < 0.0 || feePercentage > 10.0 {
                panic("Fee percentage must be between 0 and 10")
            }
            
            InsurancePool.minDepositAmount = minDeposit
            InsurancePool.maxPoolSize = maxPoolSize
            InsurancePool.poolFeePercentage = feePercentage
            
            emit PoolParametersUpdated(
                minDeposit: minDeposit,
                maxPoolSize: maxPoolSize,
                feePercentage: feePercentage
            )
        }

        /// Execute RWA investment (admin only)
        access(all) fun executeRWAInvestment(assetType: String, amount: UFix64) {
            let poolRef = InsurancePool.account.storage.borrow<&Pool>(from: InsurancePool.PoolStoragePath)
                ?? panic("Could not borrow pool reference")
            poolRef.investInRWA(assetType: assetType, amount: amount)
        }

        /// Redeem RWA investment (admin only)
        access(all) fun redeemRWAInvestment(assetType: String, amount: UFix64) {
            let poolRef = InsurancePool.account.storage.borrow<&Pool>(from: InsurancePool.PoolStoragePath)
                ?? panic("Could not borrow pool reference")
            poolRef.redeemRWAInvestment(assetType: assetType, amount: amount)
        }

        /// Create oracle access capability
        access(all) fun createOracleAccess(): @OracleAccess {
            return <-create OracleAccess()
        }
    }

    /// Public interface for pool operations
    access(all) resource interface PoolPublic {
            access(all) fun depositCapital(lpAddress: Address, tokenVault: @XINSURE.Vault): @XINSURE.Vault
            access(all) fun redeemCapital(lpAddress: Address, xInsureVault: @XINSURE.Vault): @XINSURE.Vault
            access(all) fun collectPremium(farmerAddress: Address, policyId: UInt64, tokenVault: @XINSURE.Vault)
            access(all) fun getPoolBalance(): UFix64
            access(all) fun getAvailableLiquidity(): UFix64
        }

    /// Get current pool value
    access(all) fun getPoolValue(): UFix64 {
        return self.totalPoolValue
    }

    /// Get xINSURE value per token
    access(all) fun getXInsureValuePerToken(): UFix64 {
        let xInsureTotalSupply = XINSURE.totalSupply
        if xInsureTotalSupply == 0.0 {
            return 1.0 // Initial 1:1 ratio
        }
        return self.totalPoolValue / xInsureTotalSupply
    }

    /// Get RWA holdings (placeholder)
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

    /// Check if pool is healthy (has sufficient liquidity for operations)
    access(all) fun isPoolHealthy(): Bool {
        let availableLiquidity = self.getAvailableLiquidity()
        let minLiquidityRequired = self.totalPoolValue * 0.1 // 10% minimum liquidity
        return availableLiquidity >= minLiquidityRequired && self.poolActive && !self.emergencyPaused
    }

    /// Get RWA allocation percentage
    access(all) fun getRWAAllocationPercentage(): UFix64 {
        if self.totalPoolValue == 0.0 {
            return 0.0
        }
        return (self.currentRWAInvestment / self.totalPoolValue) * 100.0
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
        self.maxRWAInvestmentPercentage = 80.0 // Max 80% can be invested in RWA
        self.minDepositAmount = 100.0 // Minimum 100 USDFC deposit
        self.maxPoolSize = 10000000.0 // Max 10M USDFC pool size
        self.poolFeePercentage = 0.5 // 0.5% management fee

        // Set paths
        self.PoolStoragePath = /storage/InsurancePool
        self.PoolPublicPath = /public/InsurancePool
        self.AdminStoragePath = /storage/InsurancePoolAdmin
        self.OracleCapabilityPath = /private/InsurancePoolOracle

        // Get xINSURE minter capability using new Capability API
        let minterCapability = self.account.capabilities.storage.issue<&XINSURE.Minter>(XINSURE.MinterStoragePath)

        // Create and store the pool
        let pool <- create Pool(xInsureMinterCap: minterCapability)
        self.account.storage.save(<-pool, to: self.PoolStoragePath)

        // Create public capability for pool operations using new API
        let poolCapability = self.account.capabilities.storage.issue<&{PoolPublic}>(self.PoolStoragePath)
        self.account.capabilities.publish(poolCapability, at: self.PoolPublicPath)

        // Create and store admin
        let admin <- create Admin()
        self.account.storage.save(<-admin, to: self.AdminStoragePath)

        emit PoolInitialized()
    }
}
