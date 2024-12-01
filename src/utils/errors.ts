export class WalletError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WalletError';
  }
}

export const handleSolanaError = (error: unknown): Error => {
  if (error instanceof Error) {
    // Handle specific Solana error cases
    if (error.message.includes('insufficient lamports')) {
      return new Error('Insufficient SOL in your wallet');
    }
    if (error.message.includes('User rejected')) {
      return new Error('Transaction was cancelled');
    }
    if (error.message.includes('blockhash')) {
      return new Error('Network error. Please try again');
    }
    return error;
  }
  return new Error('Transaction failed. Please try again');
};