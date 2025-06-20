import InsurancePool from "../contracts/InsurancePool.cdc"

access(all) fun main(): {String: UFix64} {
    return InsurancePool.getPoolStats()
}
