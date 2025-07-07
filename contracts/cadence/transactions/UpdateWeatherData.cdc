import OracleContract from "../contracts/OracleContract.cdc"

/// Transaction to update weather data
transaction(
    locationId: String,
    rainfallMM: UFix64,
    temperatureCelsius: UFix64,
    humidity: UFix64,
    windSpeedKMH: UFix64,
    dataSource: String
) {
    let dataProvider: &OracleContract.DataProvider

    prepare(acct: auth(Storage) &Account) {
        self.dataProvider = acct.storage.borrow<&OracleContract.DataProvider>(from: OracleContract.DataProviderStoragePath)
            ?? panic("Could not borrow data provider reference")
    }

    execute {
        let timestamp = UInt64(getCurrentBlock().timestamp)
        self.dataProvider.updateWeatherData(
            locationId: locationId,
            rainfallMM: rainfallMM,
            temperatureCelsius: temperatureCelsius,
            humidity: humidity,
            windSpeedKMH: windSpeedKMH,
            timestamp: timestamp,
            dataSource: dataSource
        )
    }
}
