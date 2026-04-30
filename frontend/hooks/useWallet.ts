'use client';
import { useState, useCallback } from 'react';
import {
  isConnected,
  getPublicKey,
  signTransaction,
} from '@stellar/freighter-api';

export function useWallet() {
  const [publicKey, setPublicKey] = useState<string | null>(null);

  const connect = useCallback(async () => {
    const connected = await isConnected();
    if (!connected) {
      alert('Please install the Freighter wallet extension.');
      return;
    }
    const key = await getPublicKey();
    setPublicKey(key);
  }, []);

  const disconnect = useCallback(() => setPublicKey(null), []);

  return { publicKey, connect, disconnect, signTransaction };
}
