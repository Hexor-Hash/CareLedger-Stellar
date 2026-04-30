# CareLedger-Stellar
  
Decentralized healthcare payment and medical records platform built on Stellar and Soroban.

StellarMed enables patients to pay for healthcare services using XLM and USDC while maintaining full ownership and control of their encrypted medical records stored on-chain via cryptographic hashes and decentralized storage systems.

The platform improves healthcare transparency, interoperability, and patient data sovereignty by removing centralized control over medical records and payment systems.

---

## Features

### Healthcare Payments
- Pay for medical services using XLM and USDC
- Instant on-chain payment settlement
- Transparent transaction history
- Support for multiple healthcare providers

### Provider Network
- Healthcare provider registration system
- Verified provider profiles
- Service listing and management
- Revenue tracking dashboard

### Medical Records System
- Encrypted medical record storage
- On-chain hash verification
- Decentralized storage via IPFS
- Patient-controlled access permissions
- Secure record sharing with providers

### Insurance Integration
- Insurance claim processing support
- Claim verification workflows
- Automated reimbursement tracking
- Provider-insurer interaction layer

### Dashboards
- Patient dashboard for records and payments
- Provider dashboard for services and earnings
- Analytics and history tracking

---

## Stack

- Smart Contracts: Soroban (Rust)
- Blockchain: Stellar Network
- Frontend: Next.js 14
- Backend: NestJS
- Database: PostgreSQL
- Storage: IPFS
- Wallet Integration: Freighter SDK

---

## Architecture

```text
Frontend (Next.js)
        |
        v
Backend API (NestJS)
        |
        v
PostgreSQL Database
        |
        v
IPFS (Medical Records Storage)
        |
        v
Soroban Smart Contracts
        |
        v
Stellar Blockchain
```

---

## Getting Started

### Clone Repository

```bash id="k4x9pm"
git clone https://github.com/dev-fatima-24/StellarMed.git
cd StellarMed
```

### Install Dependencies

```bash id="w2l9de"
npm install
```

### Run Development Server

```bash id="p9c3xr"
npm run dev
```

---

## Smart Contract Modules

### Payment Contract
- Healthcare payment processing
- USDC/XLM settlement logic
- Provider payout distribution

### Records Contract
- Medical record hash storage
- Access control logic
- Ownership verification

### Insurance Contract
- Claim validation logic
- Reimbursement tracking
- Provider-insurer settlement flow

---

## Project Structure

```text id="z8m1qa"
StellarMed/
├── contracts/
│   ├── payments/
│   ├── records/
│   └── insurance/
│
├── frontend/
│   ├── app/
│   ├── components/
│   ├── hooks/
│   └── lib/
│
├── backend/
│   ├── src/
│   ├── modules/
│   ├── prisma/
│   └── queues/
│
├── storage/
│   └── ipfs/
│
└── README.md
```

---

## Future Improvements

- AI-assisted medical diagnostics integration
- Telemedicine video consultation module
- Decentralized identity (DID) for patients
- Cross-border healthcare payments
- Automated insurance underwriting
- Emergency access recovery system

---

## Contributing

1. Fork the repository  
2. Create a feature branch  
3. Commit changes  
4. Push and open a pull request  

---

## License

MIT License

---

## Vision

StellarMed aims to build a decentralized healthcare infrastructure where patients own their medical data, providers receive instant payments, and healthcare systems become interoperable, transparent, and globally accessible.
