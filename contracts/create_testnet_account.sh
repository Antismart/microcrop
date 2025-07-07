#!/bin/bash

# Script to create a testnet account for MicroCrop contracts

echo "Creating testnet account..."

# Generate new key pair
echo "Generating new key pair..."
flow keys generate > keys.tmp

# Extract private key
PRIVATE_KEY=$(grep "Private Key" keys.tmp | awk '{print $3}')
PUBLIC_KEY=$(grep "Public Key" keys.tmp | awk '{print $3}')

echo "Private Key: $PRIVATE_KEY"
echo "Public Key: $PUBLIC_KEY"

# Clean up temporary file
rm keys.tmp

echo "Please visit https://testnet-faucet.onflow.org/ to create a testnet account"
echo "Use this public key: $PUBLIC_KEY"
echo "After creating the account, update flow.json with the new address and private key"
