import { TransactionError } from './types';

export class SolanaTransactionError extends Error implements TransactionError {
  code?: number;
  logs?: string[];

  constructor(message: string, code?: number, logs?: string[]) {
    super(message);
    this.name = 'SolanaTransactionError';
    this.code = code;
    this.logs = logs;
  }
}

export const handleTransactionError = (error: unknown): Error => {
  if (error instanceof Error) {
    // Handle specific Solana error cases
    const message = error.message.toLowerCase();
    
    if (message.includes('insufficient lamports') || message.includes('insufficient funds')) {
      return new SolanaTransactionError('Insufficient SOL in your wallet');
    }
    
    if (message.includes('user rejected')) {
      return new SolanaTransactionError('Transaction was cancelled by user');
    }
    
    if (message.includes('blockhash not found') || message.includes('block height exceeded')) {
      return new SolanaTransactionError('Network timeout. Please try again');
    }

    if (message.includes('transaction simulation failed')) {
      return new SolanaTransactionError('Transaction simulation failed. Please try again');
    }

    return error;
  }
  
  return new SolanaTransactionError('Transaction failed. Please try again');
};