#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype,
    Address, Bytes, Env, String,
};

// ── Data types ────────────────────────────────────────────────────────────────
#[contracttype]
#[derive(Clone)]
pub struct Provider {
    pub id: u64,
    pub name: String,
    pub wallet: Address,
    pub specialty: String,
}

#[contracttype]
#[derive(Clone)]
pub struct Payment {
    pub id: u64,
    pub patient: Address,
    pub provider_id: u64,
    pub amount: i128,
    pub token: Address,
    pub service_hash: Bytes,
    pub timestamp: u64,
}

#[contracttype]
#[derive(Clone)]
pub struct MedicalRecord {
    pub id: u64,
    pub patient: Address,
    pub record_hash: Bytes,
    pub ipfs_cid: String,
    pub provider_id: u64,
    pub timestamp: u64,
}

#[contracttype]
#[derive(Clone)]
pub struct InsuranceClaim {
    pub id: u64,
    pub payment_id: u64,
    pub insurer: Address,
    pub amount: i128,
    pub timestamp: u64,
}

#[contracttype]
pub enum DataKey {
    ProviderCount,
    PaymentCount,
    RecordCount,
    ClaimCount,
    Provider(u64),
    Payment(u64),
    Record(u64),
    Claim(u64),
    Access(u64, Address), // (record_id, accessor) → expiry
}

// ── Contract ──────────────────────────────────────────────────────────────────
#[contract]
pub struct CareLedger;

#[contractimpl]
impl CareLedger {
    /// Register a healthcare provider. Returns the new provider ID.
    pub fn register_provider(
        env: Env,
        name: String,
        wallet: Address,
        specialty: String,
    ) -> u64 {
        wallet.require_auth();
        let id: u64 = env.storage().instance().get(&DataKey::ProviderCount).unwrap_or(0u64) + 1;
        env.storage().instance().set(&DataKey::ProviderCount, &id);
        env.storage().persistent().set(
            &DataKey::Provider(id),
            &Provider { id, name, wallet, specialty },
        );
        id
    }

    /// Process a payment from patient to provider. Returns the new payment ID.
    pub fn pay_for_service(
        env: Env,
        patient: Address,
        provider_id: u64,
        amount: i128,
        token: Address,
        service_hash: Bytes,
    ) -> u64 {
        patient.require_auth();
        let provider: Provider = env
            .storage()
            .persistent()
            .get(&DataKey::Provider(provider_id))
            .expect("provider not found");

        let token_client = soroban_sdk::token::Client::new(&env, &token);
        token_client.transfer(&patient, &provider.wallet, &amount);

        let id: u64 = env.storage().instance().get(&DataKey::PaymentCount).unwrap_or(0u64) + 1;
        env.storage().instance().set(&DataKey::PaymentCount, &id);
        env.storage().persistent().set(
            &DataKey::Payment(id),
            &Payment {
                id,
                patient,
                provider_id,
                amount,
                token,
                service_hash,
                timestamp: env.ledger().timestamp(),
            },
        );
        id
    }

    /// Store an encrypted medical record hash + IPFS CID. Returns the new record ID.
    pub fn store_record(
        env: Env,
        patient: Address,
        record_hash: Bytes,
        ipfs_cid: String,
        provider_id: u64,
    ) -> u64 {
        patient.require_auth();
        let id: u64 = env.storage().instance().get(&DataKey::RecordCount).unwrap_or(0u64) + 1;
        env.storage().instance().set(&DataKey::RecordCount, &id);
        env.storage().persistent().set(
            &DataKey::Record(id),
            &MedicalRecord {
                id,
                patient,
                record_hash,
                ipfs_cid,
                provider_id,
                timestamp: env.ledger().timestamp(),
            },
        );
        id
    }

    /// Grant an accessor read access to a record until `expiry` ledger timestamp.
    pub fn grant_access(
        env: Env,
        record_id: u64,
        patient: Address,
        accessor: Address,
        expiry: u64,
    ) {
        patient.require_auth();
        let record: MedicalRecord = env
            .storage()
            .persistent()
            .get(&DataKey::Record(record_id))
            .expect("record not found");
        assert!(record.patient == patient, "not record owner");
        env.storage()
            .temporary()
            .set(&DataKey::Access(record_id, accessor), &expiry);
    }

    /// Revoke an accessor's access to a record.
    pub fn revoke_access(
        env: Env,
        record_id: u64,
        patient: Address,
        accessor: Address,
    ) {
        patient.require_auth();
        let record: MedicalRecord = env
            .storage()
            .persistent()
            .get(&DataKey::Record(record_id))
            .expect("record not found");
        assert!(record.patient == patient, "not record owner");
        env.storage()
            .temporary()
            .remove(&DataKey::Access(record_id, accessor));
    }

    /// Submit an insurance claim for a payment. Returns the new claim ID.
    pub fn submit_insurance_claim(
        env: Env,
        payment_id: u64,
        insurer: Address,
        amount: i128,
    ) -> u64 {
        let _: Payment = env
            .storage()
            .persistent()
            .get(&DataKey::Payment(payment_id))
            .expect("payment not found");

        let id: u64 = env.storage().instance().get(&DataKey::ClaimCount).unwrap_or(0u64) + 1;
        env.storage().instance().set(&DataKey::ClaimCount, &id);
        env.storage().persistent().set(
            &DataKey::Claim(id),
            &InsuranceClaim {
                id,
                payment_id,
                insurer,
                amount,
                timestamp: env.ledger().timestamp(),
            },
        );
        id
    }

    // ── Read helpers ──────────────────────────────────────────────────────────
    pub fn get_provider(env: Env, id: u64) -> Provider {
        env.storage().persistent().get(&DataKey::Provider(id)).expect("not found")
    }

    pub fn get_payment(env: Env, id: u64) -> Payment {
        env.storage().persistent().get(&DataKey::Payment(id)).expect("not found")
    }

    pub fn get_record(env: Env, id: u64) -> MedicalRecord {
        env.storage().persistent().get(&DataKey::Record(id)).expect("not found")
    }

    pub fn get_claim(env: Env, id: u64) -> InsuranceClaim {
        env.storage().persistent().get(&DataKey::Claim(id)).expect("not found")
    }

    /// Returns the expiry timestamp if access is granted, 0 otherwise.
    pub fn check_access(env: Env, record_id: u64, accessor: Address) -> u64 {
        env.storage()
            .temporary()
            .get(&DataKey::Access(record_id, accessor))
            .unwrap_or(0u64)
    }
}

mod test;
