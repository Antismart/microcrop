// Simple deployment test transaction
transaction {
    prepare(acct: auth(Storage) &Account) {
        // Just a simple transaction to test connectivity
        log("Connection test successful")
    }
}
