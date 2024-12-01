import { useConnection } from '@solana/wallet-adapter-react';
import { Connection } from '@solana/web3.js';
import { useMemo } from 'react';
import { SOLANA_ENDPOINT } from '../config/solana';

export const useSolanaConnection = () => {
  const { connection } = useConnection();
  
  return useMemo(() => ({
    connection: connection || new Connection(SOLANA_ENDPOINT, 'confirmed')
  }), [connection]);
};