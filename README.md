# CareLedger-Stellar

Decentralized healthcare payments and medical records protocol built on Stellar/Soroban.

Patients pay for services with XLM/USDC, store encrypted medical records on IPFS with on-chain hash verification, and control who can access their data — all without a central authority.

---

## Architecture

```
Next.js 14 Frontend
      │
      ▼
NestJS Backend API  ──►  IPFS (Helia)
      │
      ▼
PostgreSQL (Prisma)
      │
      ▼
Soroban Smart Contract
      │
      ▼
Stellar Testnet / Mainnet
```

---

## Smart Contract Functions

| Function | Description |
|---|---|
| `register_provider(name, wallet, specialty)` | Register a healthcare provider, returns `ProviderId` |
| `pay_for_service(patient, provider_id, amount, token, service_hash)` | Transfer token from patient to provider, returns `PaymentId` |
| `store_record(patient, record_hash, ipfs_cid, provider_id)` | Store encrypted record hash + IPFS CID, returns `RecordId` |
| `grant_access(record_id, patient, accessor, expiry)` | Grant time-limited read access to a record |
| `revoke_access(record_id, patient, accessor)` | Revoke access immediately |
| `submit_insurance_claim(payment_id, insurer, amount)` | Submit a claim against a payment, returns `ClaimId` |

---

## Project Structure

```
CareLedger-Stellar/
├── contracts/careledger/
│   ├── Cargo.toml
│   └── src/
│       ├── lib.rs          # Soroban contract
│       └── test.rs         # Contract tests
├── backend/
│   ├── src/
│   │   ├── app.module.ts
│   │   ├── main.ts
│   │   ├── prisma/         # DB service
│   │   ├── stellar/        # Contract invocation
│   │   ├── ipfs/           # Helia IPFS service
│   │   ├── providers/      # Provider CRUD
│   │   ├── payments/       # Payment processing
│   │   ├── records/        # Record upload + access
│   │   └── claims/         # Insurance claims
│   └── prisma/schema.prisma
├── frontend/
│   ├── app/
│   │   ├── page.tsx        # Home / navigation
│   │   ├── patient/        # Patient portal
│   │   └── provider/       # Provider portal
│   ├── components/
│   │   └── WalletButton.tsx
│   ├── hooks/useWallet.ts
│   └── lib/api.ts
├── scripts/deploy.sh
├── docker-compose.yml
└── Cargo.toml              # Workspace
```

---

## Prerequisites

- [Rust + wasm32 target](https://www.rust-lang.org/tools/install): `rustup target add wasm32-unknown-unknown`
- [Stellar CLI](https://developers.stellar.org/docs/tools/developer-tools/cli/install-stellar-cli): `cargo install stellar-cli --features opt`
- Node.js 20+
- Docker (for PostgreSQL)
- [Freighter wallet](https://www.freighter.app/) browser extension

---

## Setup

### 1. Start PostgreSQL

```bash
docker-compose up -d
```

### 2. Build & Deploy Contract

```bash
chmod +x scripts/deploy.sh
./scripts/deploy.sh
# Copy the CONTRACT_ID from output
```

### 3. Backend

```bash
cd backend
cp .env.example .env
# Fill in CONTRACT_ID and DEPLOYER_SECRET in .env
npm install
npm run prisma:generate
npm run prisma:migrate
npm run start:dev
```

### 4. Frontend

```bash
cd frontend
cp .env.example .env
# Fill in NEXT_PUBLIC_CONTRACT_ID
npm install
npm run dev
```

Open http://localhost:3000

---

## Running Contract Tests

```bash
cargo test --manifest-path contracts/careledger/Cargo.toml
```

---

## API Endpoints

| Method | Path | Description |
|---|---|---|
| POST | `/providers` | Register provider |
| GET | `/providers` | List all providers |
| POST | `/payments` | Pay for service |
| GET | `/payments?patient=` | Patient payment history |
| GET | `/payments?providerId=` | Provider earnings |
| POST | `/records/upload` | Upload record to IPFS + chain |
| GET | `/records?patient=` | Patient records |
| POST | `/records/:id/grant` | Grant record access |
| POST | `/records/:id/revoke` | Revoke record access |
| POST | `/claims` | Submit insurance claim |
| GET | `/claims` | List all claims |

---

## Environment Variables

### Backend (`backend/.env`)

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/careledger
CONTRACT_ID=<deployed contract ID>
DEPLOYER_SECRET=<Stellar secret key>
STELLAR_RPC_URL=https://soroban-testnet.stellar.org
NETWORK_PASSPHRASE=Test SDF Network ; September 2015
PORT=3001
```

### Frontend (`frontend/.env`)

```
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_CONTRACT_ID=<deployed contract ID>
NEXT_PUBLIC_NETWORK=TESTNET
```

---

## License

MIT
