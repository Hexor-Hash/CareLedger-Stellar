'use client';
import { useState, useEffect } from 'react';
import { useWallet } from '../../hooks/useWallet';
import WalletButton from '../../components/WalletButton';
import { providersApi, paymentsApi, recordsApi } from '../../lib/api';

export default function ProviderPortal() {
  const { publicKey } = useWallet();
  const [tab, setTab] = useState<'register' | 'payments' | 'upload'>('register');
  const [providers, setProviders] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [myProvider, setMyProvider] = useState<any>(null);

  // Register form
  const [regForm, setRegForm] = useState({ name: '', specialty: '' });
  // Upload form
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPatient, setUploadPatient] = useState('');

  useEffect(() => {
    providersApi.list().then((list) => {
      setProviders(list);
      if (publicKey) {
        const found = list.find((p: any) => p.wallet === publicKey);
        setMyProvider(found ?? null);
      }
    }).catch(() => {});
  }, [publicKey]);

  useEffect(() => {
    if (!myProvider) return;
    paymentsApi.byProvider(myProvider.id).then(setPayments).catch(() => {});
  }, [myProvider]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publicKey) return alert('Connect wallet first');
    const p = await providersApi.register({ name: regForm.name, wallet: publicKey, specialty: regForm.specialty });
    setMyProvider(p);
    alert(`Registered! Provider ID: ${p.contractId}`);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile || !publicKey || !myProvider) return alert('Missing data');
    const fd = new FormData();
    fd.append('file', uploadFile);
    fd.append('patient', uploadPatient);
    fd.append('providerId', String(myProvider.contractId));
    await recordsApi.upload(fd);
    alert('Record uploaded to IPFS and stored on-chain');
  };

  const tabs = [
    { key: 'register', label: 'Register' },
    { key: 'payments', label: 'Payments' },
    { key: 'upload', label: 'Upload Record' },
  ] as const;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-green-700">Provider Portal</h1>
        <WalletButton />
      </div>

      {myProvider && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm">
          Registered as <strong>{myProvider.name}</strong> ({myProvider.specialty}) — Contract ID: {myProvider.contractId}
        </div>
      )}

      <div className="flex gap-2 mb-6 flex-wrap">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              tab === t.key ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'register' && (
        <form onSubmit={handleRegister} className="bg-white p-6 rounded-xl shadow space-y-4">
          <h2 className="font-semibold text-lg">Register as Provider</h2>
          <input
            className="w-full border rounded-lg p-2"
            placeholder="Full name"
            value={regForm.name}
            onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
            required
          />
          <input
            className="w-full border rounded-lg p-2"
            placeholder="Specialty (e.g. Cardiology)"
            value={regForm.specialty}
            onChange={(e) => setRegForm({ ...regForm, specialty: e.target.value })}
            required
          />
          <button type="submit" className="w-full bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700">
            Register
          </button>
        </form>
      )}

      {tab === 'payments' && (
        <div className="space-y-3">
          <h2 className="font-semibold text-lg">Received Payments</h2>
          {payments.length === 0 && <p className="text-gray-500">No payments yet.</p>}
          {payments.map((p) => (
            <div key={p.id} className="bg-white p-4 rounded-xl shadow">
              <p className="text-sm">Payment #{p.contractId} — {p.amount.toString()} stroops</p>
              <p className="text-xs text-gray-500">Patient: {p.patientAddr.slice(0, 8)}…</p>
              <p className="text-xs text-gray-400">{new Date(p.createdAt).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}

      {tab === 'upload' && (
        <form onSubmit={handleUpload} className="bg-white p-6 rounded-xl shadow space-y-4">
          <h2 className="font-semibold text-lg">Upload Medical Record</h2>
          <input
            className="w-full border rounded-lg p-2"
            placeholder="Patient wallet address"
            value={uploadPatient}
            onChange={(e) => setUploadPatient(e.target.value)}
            required
          />
          <input
            type="file"
            className="w-full border rounded-lg p-2"
            onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)}
            required
          />
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700">
            Upload to IPFS & Store On-Chain
          </button>
        </form>
      )}
    </div>
  );
}
