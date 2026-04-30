'use client';
import { useState, useEffect } from 'react';
import { useWallet } from '../../hooks/useWallet';
import WalletButton from '../../components/WalletButton';
import { paymentsApi, recordsApi, claimsApi, providersApi } from '../../lib/api';

export default function PatientPortal() {
  const { publicKey } = useWallet();
  const [tab, setTab] = useState<'pay' | 'records' | 'access' | 'claims'>('pay');
  const [providers, setProviders] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [records, setRecords] = useState<any[]>([]);
  const [claims, setClaims] = useState<any[]>([]);

  // Pay form
  const [payForm, setPayForm] = useState({ providerId: '', amount: '', tokenAddr: '', serviceHash: '' });
  // Access form
  const [accessForm, setAccessForm] = useState({ recordId: '', accessor: '', expiry: '' });
  // Claim form
  const [claimForm, setClaimForm] = useState({ paymentId: '', insurer: '', amount: '' });

  useEffect(() => {
    providersApi.list().then(setProviders).catch(() => {});
  }, []);

  useEffect(() => {
    if (!publicKey) return;
    paymentsApi.byPatient(publicKey).then(setPayments).catch(() => {});
    recordsApi.byPatient(publicKey).then(setRecords).catch(() => {});
    claimsApi.list().then(setClaims).catch(() => {});
  }, [publicKey]);

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publicKey) return alert('Connect wallet first');
    await paymentsApi.pay({
      patient: publicKey,
      providerId: +payForm.providerId,
      amount: payForm.amount,
      tokenAddr: payForm.tokenAddr,
      serviceHash: payForm.serviceHash,
    });
    paymentsApi.byPatient(publicKey).then(setPayments);
  };

  const handleGrant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publicKey) return alert('Connect wallet first');
    await recordsApi.grantAccess(+accessForm.recordId, {
      patient: publicKey,
      accessor: accessForm.accessor,
      expiry: +accessForm.expiry,
    });
    alert('Access granted');
  };

  const handleRevoke = async (recordId: number, accessor: string) => {
    if (!publicKey) return;
    await recordsApi.revokeAccess(recordId, { patient: publicKey, accessor });
    alert('Access revoked');
  };

  const handleClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    await claimsApi.submit({
      paymentId: +claimForm.paymentId,
      insurer: claimForm.insurer,
      amount: claimForm.amount,
    });
    claimsApi.list().then(setClaims);
  };

  const tabs = [
    { key: 'pay', label: 'Pay for Service' },
    { key: 'records', label: 'My Records' },
    { key: 'access', label: 'Access Control' },
    { key: 'claims', label: 'Insurance Claims' },
  ] as const;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-blue-700">Patient Portal</h1>
        <WalletButton />
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              tab === t.key ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'pay' && (
        <form onSubmit={handlePay} className="space-y-4 bg-white p-6 rounded-xl shadow">
          <h2 className="font-semibold text-lg">Pay for Service</h2>
          <select
            className="w-full border rounded-lg p-2"
            value={payForm.providerId}
            onChange={(e) => setPayForm({ ...payForm, providerId: e.target.value })}
            required
          >
            <option value="">Select Provider</option>
            {providers.map((p) => (
              <option key={p.id} value={p.contractId}>{p.name} — {p.specialty}</option>
            ))}
          </select>
          <input
            className="w-full border rounded-lg p-2"
            placeholder="Amount (stroops)"
            value={payForm.amount}
            onChange={(e) => setPayForm({ ...payForm, amount: e.target.value })}
            required
          />
          <input
            className="w-full border rounded-lg p-2"
            placeholder="Token contract address"
            value={payForm.tokenAddr}
            onChange={(e) => setPayForm({ ...payForm, tokenAddr: e.target.value })}
            required
          />
          <input
            className="w-full border rounded-lg p-2"
            placeholder="Service hash (hex)"
            value={payForm.serviceHash}
            onChange={(e) => setPayForm({ ...payForm, serviceHash: e.target.value })}
            required
          />
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700">
            Pay
          </button>
        </form>
      )}

      {tab === 'records' && (
        <div className="space-y-3">
          <h2 className="font-semibold text-lg">My Medical Records</h2>
          {records.length === 0 && <p className="text-gray-500">No records found.</p>}
          {records.map((r) => (
            <div key={r.id} className="bg-white p-4 rounded-xl shadow">
              <p className="text-sm font-mono text-gray-500">CID: {r.ipfsCid}</p>
              <p className="text-sm text-gray-600">Hash: {r.recordHash.slice(0, 16)}…</p>
              <p className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}

      {tab === 'access' && (
        <div className="space-y-6">
          <form onSubmit={handleGrant} className="bg-white p-6 rounded-xl shadow space-y-4">
            <h2 className="font-semibold text-lg">Grant Access</h2>
            <input
              className="w-full border rounded-lg p-2"
              placeholder="Record ID"
              value={accessForm.recordId}
              onChange={(e) => setAccessForm({ ...accessForm, recordId: e.target.value })}
              required
            />
            <input
              className="w-full border rounded-lg p-2"
              placeholder="Accessor address"
              value={accessForm.accessor}
              onChange={(e) => setAccessForm({ ...accessForm, accessor: e.target.value })}
              required
            />
            <input
              className="w-full border rounded-lg p-2"
              placeholder="Expiry (unix timestamp)"
              value={accessForm.expiry}
              onChange={(e) => setAccessForm({ ...accessForm, expiry: e.target.value })}
              required
            />
            <button type="submit" className="w-full bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700">
              Grant Access
            </button>
          </form>

          <div className="bg-white p-6 rounded-xl shadow space-y-3">
            <h2 className="font-semibold text-lg">Revoke Access</h2>
            {records.map((r) => (
              <div key={r.id} className="flex justify-between items-center border-b pb-2">
                <span className="text-sm">Record #{r.contractId}</span>
                <button
                  onClick={() => {
                    const accessor = prompt('Enter accessor address to revoke:');
                    if (accessor) handleRevoke(r.contractId, accessor);
                  }}
                  className="text-sm text-red-600 hover:underline"
                >
                  Revoke
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'claims' && (
        <div className="space-y-6">
          <form onSubmit={handleClaim} className="bg-white p-6 rounded-xl shadow space-y-4">
            <h2 className="font-semibold text-lg">Submit Insurance Claim</h2>
            <select
              className="w-full border rounded-lg p-2"
              value={claimForm.paymentId}
              onChange={(e) => setClaimForm({ ...claimForm, paymentId: e.target.value })}
              required
            >
              <option value="">Select Payment</option>
              {payments.map((p) => (
                <option key={p.id} value={p.contractId}>Payment #{p.contractId} — {p.amount} stroops</option>
              ))}
            </select>
            <input
              className="w-full border rounded-lg p-2"
              placeholder="Insurer address"
              value={claimForm.insurer}
              onChange={(e) => setClaimForm({ ...claimForm, insurer: e.target.value })}
              required
            />
            <input
              className="w-full border rounded-lg p-2"
              placeholder="Claim amount (stroops)"
              value={claimForm.amount}
              onChange={(e) => setClaimForm({ ...claimForm, amount: e.target.value })}
              required
            />
            <button type="submit" className="w-full bg-purple-600 text-white py-2 rounded-lg font-medium hover:bg-purple-700">
              Submit Claim
            </button>
          </form>

          <div className="space-y-3">
            <h2 className="font-semibold text-lg">My Claims</h2>
            {claims.length === 0 && <p className="text-gray-500">No claims found.</p>}
            {claims.map((c) => (
              <div key={c.id} className="bg-white p-4 rounded-xl shadow">
                <p className="text-sm">Claim #{c.contractId} — {c.amount.toString()} stroops</p>
                <p className="text-xs text-gray-400">Insurer: {c.insurerAddr}</p>
                <p className="text-xs text-gray-400">{new Date(c.createdAt).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
