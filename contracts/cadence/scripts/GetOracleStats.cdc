import OracleContract from "../contracts/OracleContract.cdc"

access(all) fun main(): {String: UInt64} {
    return OracleContract.getOracleStats()
}
