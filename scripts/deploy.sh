#!/usr/bin/env bash
set -euo pipefail

NETWORK="testnet"
RPC_URL="https://soroban-testnet.stellar.org"
NETWORK_PASSPHRASE="Test SDF Network ; September 2015"
CONTRACT_DIR="contracts/careledger"
WASM_PATH="target/wasm32-unknown-unknown/release/careledger.optimized.wasm"

echo "==> Building contract..."
cargo build --manifest-path "$CONTRACT_DIR/Cargo.toml" \
  --target wasm32-unknown-unknown --release

echo "==> Optimizing wasm..."
stellar contract optimize \
  --wasm "target/wasm32-unknown-unknown/release/careledger.wasm" \
  --wasm-out "$WASM_PATH"

echo "==> Generating keypair (if not set)..."
if [ -z "${DEPLOYER_SECRET:-}" ]; then
  echo "DEPLOYER_SECRET not set. Generating a new identity..."
  stellar keys generate deployer --network "$NETWORK"
  stellar keys fund deployer --network "$NETWORK"
  DEPLOYER_SECRET=$(stellar keys show deployer --secret-key)
fi

echo "==> Deploying contract to $NETWORK..."
CONTRACT_ID=$(stellar contract deploy \
  --wasm "$WASM_PATH" \
  --source-account "$DEPLOYER_SECRET" \
  --rpc-url "$RPC_URL" \
  --network-passphrase "$NETWORK_PASSPHRASE")

echo ""
echo "✅ Contract deployed!"
echo "   CONTRACT_ID=$CONTRACT_ID"
echo ""
echo "Add to your .env:"
echo "   NEXT_PUBLIC_CONTRACT_ID=$CONTRACT_ID"
echo "   CONTRACT_ID=$CONTRACT_ID"
