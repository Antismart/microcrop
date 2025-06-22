// Simple test to verify our XINSURE contract can be deployed
access(all) contract TestXINSURE {
    access(all) var totalSupply: UFix64
    access(all) let name: String
    access(all) let symbol: String

    init() {
        self.totalSupply = 0.0
        self.name = "Test MicroCrop Capital Token"
        self.symbol = "testXINSURE"
    }

    access(all) fun getTotalSupply(): UFix64 {
        return self.totalSupply
    }

    access(all) fun getName(): String {
        return self.name
    }
}
