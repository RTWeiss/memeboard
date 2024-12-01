import { 
  Connection, 
  PublicKey, 
  Transaction, 
  SystemProgram, 
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import { WalletContextState } from '@solana/wallet-adapter-react';
import { GRID_AUTHORITY } from '../config/solana';
import { GridSelection } from '../types/grid';
import { handleSolanaError } from './errors';

interface PurchaseResult {
  signature: string;
  success: boolean;
}

export const purchasePixels = async (
  connection: Connection,
  wallet: WalletContextState,
  selection: GridSelection,
  totalPrice: number
): Promise<PurchaseResult> => {
  if (!wallet.publicKey || !wallet.signTransaction) {
    throw new Error('Wallet not connected');
  }

  try {
    // Check wallet balance
    const balance = await connection.getBalance(wallet.publicKey);
    if (balance < totalPrice * LAMPORTS_PER_SOL) {
      throw new Error('Insufficient SOL in wallet');
    }

    const lamports = Math.floor(totalPrice * LAMPORTS_PER_SOL);

    // Create transfer instruction
    const transferInstruction = SystemProgram.transfer({
      fromPubkey: wallet.publicKey,
      toPubkey: GRID_AUTHORITY,
      lamports,
    });

    // Create transaction
    const transaction = new Transaction().add(transferInstruction);

    // Get latest blockhash
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = wallet.publicKey;

    // Sign and send transaction
    const signed = await wallet.signTransaction(transaction);
    const signature = await connection.sendRawTransaction(signed.serialize());
    
    // Wait for confirmation with timeout and retry
    const confirmation = await connection.confirmTransaction({
      signature,
      blockhash,
      lastValidBlockHeight,
    });
    
    if (confirmation.value.err) {
      throw new Error('Transaction failed to confirm');
    }

    return { signature, success: true };
  } catch (error) {
    console.error('Purchase error details:', error);
    throw handleSolanaError(error);
  }
};