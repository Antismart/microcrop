import InsurancePool from "InsurancePool.cdc"

/// OracleContract - Trusted gateway for external WeatherXM data
/// and parametric trigger logic for automated crop insurance payouts
/// 
/// This contract serves as the bridge between external weather data sources
/// and the insurance pool, implementing parametric trigger conditions
/// for automated payouts based on weather events.
access(all) contract OracleContract {

    /// Weather data structure
    access(all) struct WeatherData {
        access(all) let locationId: String
        access(all) let rainfallMM: UFix64
        access(all) let temperatureCelsius: UFix64
        access(all) let humidity: UFix64
        access(all) let windSpeedKMH: UFix64
        access(all) let timestamp: UInt64
        access(all) let dataSource: String

        init(
            locationId: String,
            rainfallMM: UFix64,
            temperatureCelsius: UFix64,
            humidity: UFix64,
            windSpeedKMH: UFix64,
            timestamp: UInt64,
            dataSource: String
        ) {
            self.locationId = locationId
            self.rainfallMM = rainfallMM
            self.temperatureCelsius = temperatureCelsius
            self.humidity = humidity
            self.windSpeedKMH = windSpeedKMH
            self.timestamp = timestamp
            self.dataSource = dataSource
        }
    }


    /// Parametric trigger thresholds for different crop types
    access(all) struct TriggerThresholds {
        access(all) let cropType: String
        access(all) let minRainfallMM: UFix64        // Minimum rainfall for drought trigger
        access(all) let maxRainfallMM: UFix64        // Maximum rainfall for flood trigger
        access(all) let minTemperatureCelsius: UFix64 // Minimum temperature for cold trigger
        access(all) let maxTemperatureCelsius: UFix64 // Maximum temperature for heat trigger
        access(all) let observationPeriodDays: UInt64 // Period over which to evaluate conditions

        init(
            cropType: String,
            minRainfallMM: UFix64,
            maxRainfallMM: UFix64,
            minTemperatureCelsius: UFix64,
            maxTemperatureCelsius: UFix64,
            observationPeriodDays: UInt64
        ) {
            self.cropType = cropType
            self.minRainfallMM = minRainfallMM
            self.maxRainfallMM = maxRainfallMM
            self.minTemperatureCelsius = minTemperatureCelsius
            self.maxTemperatureCelsius = maxTemperatureCelsius
            self.observationPeriodDays = observationPeriodDays
        }
    }

    /// Policy information structure
    access(all) struct PolicyInfo {
        access(all) let policyId: UInt64
        access(all) let farmerAddress: Address
        access(all) let locationId: String
        access(all) let cropType: String
        access(all) let coverageAmount: UFix64
        access(all) let isActive: Bool

        init(
            policyId: UInt64,
            farmerAddress: Address,
            locationId: String,
            cropType: String,
            coverageAmount: UFix64,
            isActive: Bool
        ) {
            self.policyId = policyId
            self.farmerAddress = farmerAddress
            self.locationId = locationId
            self.cropType = cropType
            self.coverageAmount = coverageAmount
            self.isActive = isActive
        }
    }

    /// Storage for weather data by location
    access(self) var weatherDataByLocation: {String: [WeatherData]}
    
    /// Storage for trigger thresholds by crop type
    access(self) var triggerThresholdsByCrop: {String: TriggerThresholds}
    
    /// Storage for active policies
    access(self) var activePolicies: {UInt64: PolicyInfo}
    
    /// Processed triggers to prevent duplicate payouts
    access(self) var processedTriggers: {String: Bool} // locationId_policyId_timestamp

    /// Oracle configuration
    access(all) var maxDataAgeSeconds: UInt64
    access(all) var minObservationPoints: UInt64

    /// Storage paths
    access(all) let OracleStoragePath: StoragePath
    access(all) let AdminStoragePath: StoragePath
    access(all) let DataProviderStoragePath: StoragePath

    /// Events
    access(all) event OracleInitialized()
    access(all) event WeatherDataUpdated(locationId: String, timestamp: UInt64, dataSource: String)
    access(all) event TriggerFired(
        farmerAddress: Address,
        policyId: UInt64,
        locationId: String,
        triggerType: String,
        payoutAmount: UFix64
    )
    access(all) event PolicyRegistered(policyId: UInt64, farmerAddress: Address, locationId: String, cropType: String)
    access(all) event PolicyDeactivated(policyId: UInt64)
    access(all) event TriggerThresholdsUpdated(cropType: String)

    /// Oracle Resource - Main oracle functionality
    access(all) resource Oracle {
        
        /// Capability to trigger payouts on the insurance pool
        access(self) let poolOracleAccess: Capability<&InsurancePool.OracleAccess>

        init(poolOracleAccess: Capability<&InsurancePool.OracleAccess>) {
            self.poolOracleAccess = poolOracleAccess
        }

        /// Check all active policies for trigger conditions and execute payouts
        /// This function would typically be called periodically by an automated system
        access(all) fun checkAndProcessTriggers() {
            let currentTimestamp = UInt64(getCurrentBlock().timestamp)
            
            for policyId in OracleContract.activePolicies.keys {
                let policy = OracleContract.activePolicies[policyId]!
                
                if policy.isActive {
                    self.checkPolicyForTrigger(policy: policy, currentTimestamp: currentTimestamp)
                }
            }
        }

        /// Check specific policy for trigger conditions
        access(self) fun checkPolicyForTrigger(policy: PolicyInfo, currentTimestamp: UInt64) {
            let locationData = OracleContract.weatherDataByLocation[policy.locationId] ?? []
            let thresholds = OracleContract.triggerThresholdsByCrop[policy.cropType]
            
            if thresholds == nil || locationData.length == 0 {
                return
            }
            
            let observationPeriodSeconds = thresholds!.observationPeriodDays * 24 * 60 * 60
            let cutoffTimestamp = currentTimestamp - observationPeriodSeconds
            
            // Filter recent data within observation period
            var recentData: [WeatherData] = []
            for data in locationData {
                if data.timestamp >= cutoffTimestamp && 
                   (currentTimestamp - data.timestamp) <= OracleContract.maxDataAgeSeconds {
                    recentData.append(data)
                }
            }
            
            // Check if we have enough data points
            if UInt64(recentData.length) < OracleContract.minObservationPoints {
                return
            }
            
            // Analyze weather conditions and determine if trigger conditions are met
            let triggerResult = self.analyzeTriggerConditions(
                weatherData: recentData,
                thresholds: thresholds!,
                policy: policy
            )
            
            if triggerResult["triggered"] as! Bool {
                self.executeTriggerPayout(
                    policy: policy,
                    triggerType: triggerResult["triggerType"] as! String,
                    payoutAmount: triggerResult["payoutAmount"] as! UFix64,
                    currentTimestamp: currentTimestamp
                )
            }
        }

        /// Analyze weather data against trigger thresholds
        access(self) fun analyzeTriggerConditions(
            weatherData: [WeatherData],
            thresholds: TriggerThresholds,
            policy: PolicyInfo
        ): {String: AnyStruct} {
            
            var totalRainfall: UFix64 = 0.0
            var avgTemperature: UFix64 = 0.0
            var dataPoints: UFix64 = 0.0
            
            // Calculate aggregated weather metrics
            for data in weatherData {
                totalRainfall = totalRainfall + data.rainfallMM
                avgTemperature = avgTemperature + data.temperatureCelsius
                dataPoints = dataPoints + 1.0
            }
            
            if dataPoints > 0.0 {
                avgTemperature = avgTemperature / dataPoints
            }
            
            // Check drought conditions (insufficient rainfall)
            if totalRainfall < thresholds.minRainfallMM {
                return {
                    "triggered": true,
                    "triggerType": "DROUGHT",
                    "payoutAmount": self.calculatePayoutAmount(policy: policy, severity: (thresholds.minRainfallMM - totalRainfall) / thresholds.minRainfallMM)
                }
            }
            
            // Check flood conditions (excessive rainfall)
            if totalRainfall > thresholds.maxRainfallMM {
                return {
                    "triggered": true,
                    "triggerType": "FLOOD",
                    "payoutAmount": self.calculatePayoutAmount(policy: policy, severity: (totalRainfall - thresholds.maxRainfallMM) / thresholds.maxRainfallMM)
                }
            }
            
            // Check cold conditions
            if avgTemperature < thresholds.minTemperatureCelsius {
                return {
                    "triggered": true,
                    "triggerType": "COLD",
                    "payoutAmount": self.calculatePayoutAmount(policy: policy, severity: (thresholds.minTemperatureCelsius - avgTemperature) / thresholds.minTemperatureCelsius)
                }
            }
            
            // Check heat conditions
            if avgTemperature > thresholds.maxTemperatureCelsius {
                return {
                    "triggered": true,
                    "triggerType": "HEAT",
                    "payoutAmount": self.calculatePayoutAmount(policy: policy, severity: (avgTemperature - thresholds.maxTemperatureCelsius) / thresholds.maxTemperatureCelsius)
                }
            }
            
            return {"triggered": false, "triggerType": "", "payoutAmount": 0.0}
        }

        /// Calculate payout amount based on policy and trigger severity
        access(self) fun calculatePayoutAmount(policy: PolicyInfo, severity: UFix64): UFix64 {
            // Simple linear payout calculation - could be made more sophisticated
            let maxSeverity: UFix64 = 2.0 // 200% of threshold triggers maximum payout
            let normalizedSeverity = severity > maxSeverity ? maxSeverity : severity
            let payoutRatio = normalizedSeverity / maxSeverity
            
            return policy.coverageAmount * payoutRatio
        }

        /// Execute trigger payout
        access(self) fun executeTriggerPayout(
            policy: PolicyInfo,
            triggerType: String,
            payoutAmount: UFix64,
            currentTimestamp: UInt64
        ) {
            // Check for duplicate trigger processing
            let triggerKey = policy.locationId.concat("_").concat(policy.policyId.toString()).concat("_").concat(currentTimestamp.toString())
            
            if OracleContract.processedTriggers[triggerKey] == true {
                return // Already processed
            }
            
            // Mark as processed
            OracleContract.processedTriggers[triggerKey] = true
            
            // Execute payout through insurance pool
            let oracleAccess = self.poolOracleAccess.borrow()
                ?? panic("Could not borrow oracle access capability")
            
            let reason = triggerType.concat(" conditions triggered payout for policy ").concat(policy.policyId.toString())
            
            oracleAccess.executePayout(
                farmerAddress: policy.farmerAddress,
                policyId: policy.policyId,
                payoutAmount: payoutAmount,
                reason: reason
            )
            
            emit TriggerFired(
                farmerAddress: policy.farmerAddress,
                policyId: policy.policyId,
                locationId: policy.locationId,
                triggerType: triggerType,
                payoutAmount: payoutAmount
            )
        }
    }

    /// Data Provider Resource - Controls weather data input
    access(all) resource DataProvider {
        
        /// Update weather data for a specific location
        /// 
        /// @param locationId: Unique identifier for the location
        /// @param rainfallMM: Rainfall measurement in millimeters
        /// @param temperatureCelsius: Temperature in Celsius
        /// @param humidity: Humidity percentage
        /// @param windSpeedKMH: Wind speed in km/h
        /// @param timestamp: Unix timestamp of the measurement
        /// @param dataSource: Source of the data (e.g., "WeatherXM", "Station123")
        access(all) fun updateWeatherData(
            locationId: String,
            rainfallMM: UFix64,
            temperatureCelsius: UFix64,
            humidity: UFix64,
            windSpeedKMH: UFix64,
            timestamp: UInt64,
            dataSource: String
        ) {
            pre {
                locationId.length > 0: "Location ID cannot be empty"
                rainfallMM >= 0.0: "Rainfall cannot be negative"
                humidity >= 0.0 && humidity <= 100.0: "Humidity must be between 0 and 100"
                windSpeedKMH >= 0.0: "Wind speed cannot be negative"
                timestamp > 0: "Timestamp must be positive"
                dataSource.length > 0: "Data source cannot be empty"
            }
            
            let weatherData = WeatherData(
                locationId: locationId,
                rainfallMM: rainfallMM,
                temperatureCelsius: temperatureCelsius,
                humidity: humidity,
                windSpeedKMH: windSpeedKMH,
                timestamp: timestamp,
                dataSource: dataSource
            )
            
            // Initialize location data array if it doesn't exist
            if OracleContract.weatherDataByLocation[locationId] == nil {
                OracleContract.weatherDataByLocation[locationId] = []
            }
            
            // Add new weather data
            OracleContract.weatherDataByLocation[locationId]!.append(weatherData)
            
            // Keep only recent data (last 90 days) to manage storage
            let maxAge: UInt64 = 90 * 24 * 60 * 60 // 90 days in seconds
            let currentTime = UInt64(getCurrentBlock().timestamp)
            let cutoffTime = currentTime - maxAge
            
            var filteredData: [WeatherData] = []
            for data in OracleContract.weatherDataByLocation[locationId]! {
                if data.timestamp >= cutoffTime {
                    filteredData.append(data)
                }
            }
            OracleContract.weatherDataByLocation[locationId] = filteredData
            
            emit WeatherDataUpdated(
                locationId: locationId,
                timestamp: timestamp,
                dataSource: dataSource
            )
        }

        /// Batch update weather data for multiple locations
        access(all) fun batchUpdateWeatherData(weatherUpdates: [WeatherData]) {
            for weatherData in weatherUpdates {
                self.updateWeatherData(
                    locationId: weatherData.locationId,
                    rainfallMM: weatherData.rainfallMM,
                    temperatureCelsius: weatherData.temperatureCelsius,
                    humidity: weatherData.humidity,
                    windSpeedKMH: weatherData.windSpeedKMH,
                    timestamp: weatherData.timestamp,
                    dataSource: weatherData.dataSource
                )
            }
        }
    }

    /// Admin Resource - Manages oracle configuration
    access(all) resource Admin {
        
        /// Register a new policy
        access(all) fun registerPolicy(
            policyId: UInt64,
            farmerAddress: Address,
            locationId: String,
            cropType: String,
            coverageAmount: UFix64
        ) {
            pre {
                OracleContract.activePolicies[policyId] == nil: "Policy already exists"
                coverageAmount > 0.0: "Coverage amount must be positive"
            }
            
            let policy = PolicyInfo(
                policyId: policyId,
                farmerAddress: farmerAddress,
                locationId: locationId,
                cropType: cropType,
                coverageAmount: coverageAmount,
                isActive: true
            )
            
            OracleContract.activePolicies[policyId] = policy
            
            emit PolicyRegistered(
                policyId: policyId,
                farmerAddress: farmerAddress,
                locationId: locationId,
                cropType: cropType
            )
        }

        /// Deactivate a policy
        access(all) fun deactivatePolicy(policyId: UInt64) {
            pre {
                OracleContract.activePolicies[policyId] != nil: "Policy does not exist"
            }
            
            let policy = OracleContract.activePolicies[policyId]!
            let updatedPolicy = PolicyInfo(
                policyId: policy.policyId,
                farmerAddress: policy.farmerAddress,
                locationId: policy.locationId,
                cropType: policy.cropType,
                coverageAmount: policy.coverageAmount,
                isActive: false
            )
            
            OracleContract.activePolicies[policyId] = updatedPolicy
            
            emit PolicyDeactivated(policyId: policyId)
        }

        /// Set trigger thresholds for a crop type
        access(all) fun setTriggerThresholds(
            cropType: String,
            minRainfallMM: UFix64,
            maxRainfallMM: UFix64,
            minTemperatureCelsius: UFix64,
            maxTemperatureCelsius: UFix64,
            observationPeriodDays: UInt64
        ) {
            pre {
                cropType.length > 0: "Crop type cannot be empty"
                minRainfallMM >= 0.0: "Minimum rainfall cannot be negative"
                maxRainfallMM > minRainfallMM: "Maximum rainfall must be greater than minimum"
                maxTemperatureCelsius > minTemperatureCelsius: "Maximum temperature must be greater than minimum"
                observationPeriodDays > 0: "Observation period must be positive"
            }
            
            let thresholds = TriggerThresholds(
                cropType: cropType,
                minRainfallMM: minRainfallMM,
                maxRainfallMM: maxRainfallMM,
                minTemperatureCelsius: minTemperatureCelsius,
                maxTemperatureCelsius: maxTemperatureCelsius,
                observationPeriodDays: observationPeriodDays
            )
            
            OracleContract.triggerThresholdsByCrop[cropType] = thresholds
            
            emit TriggerThresholdsUpdated(cropType: cropType)
        }

        /// Update oracle configuration
        access(all) fun updateOracleConfig(maxDataAgeSeconds: UInt64, minObservationPoints: UInt64) {
            pre {
                maxDataAgeSeconds > 0: "Max data age must be positive"
                minObservationPoints > 0: "Min observation points must be positive"
            }
            
            OracleContract.maxDataAgeSeconds = maxDataAgeSeconds
            OracleContract.minObservationPoints = minObservationPoints
        }

        /// Create data provider resource
        access(all) fun createDataProvider(): @DataProvider {
            return <-create DataProvider()
        }
    }

    /// Get weather data for a location
    access(all) fun getWeatherData(locationId: String): [WeatherData]? {
        return self.weatherDataByLocation[locationId]
    }

    /// Get latest weather data for a location
    access(all) fun getLatestWeatherData(locationId: String): WeatherData? {
        let locationData = self.weatherDataByLocation[locationId]
        if locationData == nil || locationData!.length == 0 {
            return nil
        }
        
        var latest = locationData![0]
        for data in locationData! {
            if data.timestamp > latest.timestamp {
                latest = data
            }
        }
        return latest
    }

    /// Get trigger thresholds for a crop type
    access(all) fun getTriggerThresholds(cropType: String): TriggerThresholds? {
        return self.triggerThresholdsByCrop[cropType]
    }

    /// Get policy information
    access(all) fun getPolicyInfo(policyId: UInt64): PolicyInfo? {
        return self.activePolicies[policyId]
    }

    /// Get all active policies for a location
    access(all) fun getActivePoliciesForLocation(locationId: String): [PolicyInfo] {
        var policies: [PolicyInfo] = []
        for policy in self.activePolicies.values {
            if policy.locationId == locationId && policy.isActive {
                policies.append(policy)
            }
        }
        return policies
    }

    /// Get oracle statistics
    access(all) fun getOracleStats(): {String: UInt64} {
        var totalPolicies: UInt64 = 0
        var activePolicies: UInt64 = 0
        var totalLocations: UInt64 = UInt64(self.weatherDataByLocation.keys.length)
        
        for policy in self.activePolicies.values {
            totalPolicies = totalPolicies + 1
            if policy.isActive {
                activePolicies = activePolicies + 1
            }
        }
        
        return {
            "totalPolicies": totalPolicies,
            "activePolicies": activePolicies,
            "totalLocations": totalLocations,
            "processedTriggers": UInt64(self.processedTriggers.keys.length),
            "maxDataAgeSeconds": self.maxDataAgeSeconds,
            "minObservationPoints": self.minObservationPoints
        }
    }

    init(poolOracleAccess: Capability<&InsurancePool.OracleAccess>) {
        // Initialize storage
        self.weatherDataByLocation = {}
        self.triggerThresholdsByCrop = {}
        self.activePolicies = {}
        self.processedTriggers = {}
        
        // Set default configuration
        self.maxDataAgeSeconds = 7 * 24 * 60 * 60 // 7 days
        self.minObservationPoints = 5 // Minimum 5 data points for trigger evaluation
        
        // Set storage paths
        self.OracleStoragePath = /storage/Oracle
        self.AdminStoragePath = /storage/OracleAdmin
        self.DataProviderStoragePath = /storage/OracleDataProvider
        
        // Create and store oracle
        let oracle <- create Oracle(poolOracleAccess: poolOracleAccess)
        self.account.storage.save(<-oracle, to: self.OracleStoragePath)
        
        // Create and store admin
        let admin <- create Admin()
        self.account.storage.save(<-admin, to: self.AdminStoragePath)
        
        // Set default trigger thresholds for common crops
        self.setDefaultTriggerThresholds()
        
        emit OracleInitialized()
    }

    /// Set default trigger thresholds for common crop types
    access(self) fun setDefaultTriggerThresholds() {
        // Maize/Corn thresholds
        self.triggerThresholdsByCrop["MAIZE"] = TriggerThresholds(
            cropType: "MAIZE",
            minRainfallMM: 300.0,      // Drought if less than 300mm over period
            maxRainfallMM: 1000.0,     // Flood if more than 1000mm over period
            minTemperatureCelsius: 10.0, // Cold damage below 10°C average
            maxTemperatureCelsius: 35.0, // Heat stress above 35°C average
            observationPeriodDays: 30    // 30-day observation period
        )
        
        // Coffee thresholds
        self.triggerThresholdsByCrop["COFFEE"] = TriggerThresholds(
            cropType: "COFFEE",
            minRainfallMM: 200.0,
            maxRainfallMM: 800.0,
            minTemperatureCelsius: 15.0,
            maxTemperatureCelsius: 30.0,
            observationPeriodDays: 30
        )
        
        // Tea thresholds
        self.triggerThresholdsByCrop["TEA"] = TriggerThresholds(
            cropType: "TEA",
            minRainfallMM: 250.0,
            maxRainfallMM: 700.0,
            minTemperatureCelsius: 12.0,
            maxTemperatureCelsius: 32.0,
            observationPeriodDays: 30
        )
    }
}