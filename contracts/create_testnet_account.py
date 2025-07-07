#!/usr/bin/env python3
"""
Script to create a Flow testnet account using the testnet faucet
"""

import requests
import json
import sys

def create_testnet_account(public_key):
    """Create a testnet account using the Flow faucet"""
    
    # Flow testnet faucet endpoint
    faucet_url = "https://testnet-faucet.onflow.org/fund-account"
    
    # Request payload
    payload = {
        "publicKey": public_key,
        "signatureAlgorithm": "ECDSA_P256",
        "hashAlgorithm": "SHA3_256"
    }
    
    headers = {
        "Content-Type": "application/json"
    }
    
    try:
        print(f"Creating testnet account with public key: {public_key[:20]}...")
        
        response = requests.post(faucet_url, json=payload, headers=headers)
        
        if response.status_code == 200:
            result = response.json()
            address = result.get("address")
            print(f"✅ Successfully created testnet account!")
            print(f"Address: {address}")
            return address
        else:
            print(f"❌ Failed to create account: {response.status_code}")
            print(f"Response: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Error creating account: {e}")
        return None

if __name__ == "__main__":
    # Public key from the generated key pair
    public_key = "342c3b5aeae03bbd788a7fd6c2091220273759fdaf2ceaca4c896701beb058f246e03bcc4bd10205400acda2462ceda93a14bd13eeb08c7b590d032e5520c54f"
    
    address = create_testnet_account(public_key)
    
    if address:
        print(f"\n📝 Next steps:")
        print(f"1. Update flow.json with the new testnet address: {address}")
        print(f"2. Deploy contracts to testnet")
        print(f"3. Update frontend configuration")
    else:
        print("\n❌ Failed to create testnet account. Please try again or use a different method.")
