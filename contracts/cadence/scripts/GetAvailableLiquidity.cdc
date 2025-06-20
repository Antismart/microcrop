import InsurancePool from "../contracts/InsurancePool.cdc"

access(all) fun main(): UFix64 {
    return InsurancePool.getAvailableLiquidity()
}
