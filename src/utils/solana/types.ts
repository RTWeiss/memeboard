import { TransactionSignature } from '@solana/web3.js';

export interface TransactionResult {
  signature: TransactionSignature;
  success: boolean;
}

export interface TransactionError extends Error {
  code?: number;
  logs?: string[];
}