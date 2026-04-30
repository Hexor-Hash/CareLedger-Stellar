#![cfg(test)]
use soroban_sdk::{
    testutils::{Address as _, Ledger},
    token, Address, Bytes, Env, String,
};

use crate::CareLedger;
use crate::CareLedgerClient;

fn setup() -> (Env, CareLedgerClient<'static>) {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register_contract(None, CareLedger);
    let client = CareLedgerClient::new(&env, &contract_id);
    (env, client)
}

fn create_token(env: &Env, admin: &Address) -> (Address, token::StellarAssetClient<'_>) {
    let token_id = env.register_stellar_asset_contract(admin.clone());
    let sac = token::StellarAssetClient::new(env, &token_id);
    (token_id, sac)
}

#[test]
fn test_register_provider() {
    let (env, client) = setup();
    let wallet = Address::generate(&env);
    let id = client.register_provider(
        &String::from_str(&env, "Dr. Alice"),
        &wallet,
        &String::from_str(&env, "Cardiology"),
    );
    assert_eq!(id, 1);
    let p = client.get_provider(&id);
    assert_eq!(p.id, 1);
    assert_eq!(p.wallet, wallet);
}

#[test]
fn test_pay_for_service() {
    let (env, client) = setup();
    let patient = Address::generate(&env);
    let provider_wallet = Address::generate(&env);
    let admin = Address::generate(&env);

    let (token_id, sac) = create_token(&env, &admin);
    sac.mint(&patient, &1_000_0000000i128);

    let provider_id = client.register_provider(
        &String::from_str(&env, "Dr. Bob"),
        &provider_wallet,
        &String::from_str(&env, "General"),
    );

    let service_hash = Bytes::from_slice(&env, &[1u8; 32]);
    let pay_id = client.pay_for_service(
        &patient,
        &provider_id,
        &100_0000000i128,
        &token_id,
        &service_hash,
    );
    assert_eq!(pay_id, 1);

    let payment = client.get_payment(&pay_id);
    assert_eq!(payment.amount, 100_0000000i128);
    assert_eq!(payment.patient, patient);
}

#[test]
fn test_store_record_and_access() {
    let (env, client) = setup();
    let patient = Address::generate(&env);
    let provider_wallet = Address::generate(&env);
    let accessor = Address::generate(&env);

    let provider_id = client.register_provider(
        &String::from_str(&env, "Dr. Carol"),
        &provider_wallet,
        &String::from_str(&env, "Radiology"),
    );

    let record_hash = Bytes::from_slice(&env, &[2u8; 32]);
    let ipfs_cid = String::from_str(&env, "QmTestCID123");
    let record_id = client.store_record(&patient, &record_hash, &ipfs_cid, &provider_id);
    assert_eq!(record_id, 1);

    // Grant access
    env.ledger().set_timestamp(1000);
    client.grant_access(&record_id, &patient, &accessor, &2000u64);
    assert_eq!(client.check_access(&record_id, &accessor), 2000u64);

    // Revoke access
    client.revoke_access(&record_id, &patient, &accessor);
    assert_eq!(client.check_access(&record_id, &accessor), 0u64);
}

#[test]
fn test_submit_insurance_claim() {
    let (env, client) = setup();
    let patient = Address::generate(&env);
    let provider_wallet = Address::generate(&env);
    let insurer = Address::generate(&env);
    let admin = Address::generate(&env);

    let (token_id, sac) = create_token(&env, &admin);
    sac.mint(&patient, &500_0000000i128);

    let provider_id = client.register_provider(
        &String::from_str(&env, "Dr. Dave"),
        &provider_wallet,
        &String::from_str(&env, "Oncology"),
    );

    let service_hash = Bytes::from_slice(&env, &[3u8; 32]);
    let pay_id = client.pay_for_service(
        &patient,
        &provider_id,
        &200_0000000i128,
        &token_id,
        &service_hash,
    );

    let claim_id = client.submit_insurance_claim(&pay_id, &insurer, &150_0000000i128);
    assert_eq!(claim_id, 1);

    let claim = client.get_claim(&claim_id);
    assert_eq!(claim.payment_id, pay_id);
    assert_eq!(claim.amount, 150_0000000i128);
}
