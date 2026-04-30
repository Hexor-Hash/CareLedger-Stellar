'use client';
import { useWallet } from '../hooks/useWallet';

export default function WalletButton() {
  const { publicKey, connect, disconnect } = useWallet();
  return publicKey ? (
    <div className="flex items-center gap-2">
      <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
        {publicKey.slice(0, 6)}…{publicKey.slice(-4)}
      </span>
      <button
        onClick={disconnect}
        className="text-sm text-red-600 hover:underline"
      >
        Disconnect
      </button>
    </div>
  ) : (
    <button
      onClick={connect}
      className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
    >
      Connect Freighter
    </button>
  );
}
