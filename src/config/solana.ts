import { clusterApiUrl, PublicKey } from '@solana/web3.js';

export const SOLANA_NETWORK = 'mainnet-beta';
export const SOLANA_ENDPOINT = clusterApiUrl(SOLANA_NETWORK);
export const GRID_AUTHORITY = new PublicKey('BmNdmW8h3v9rQszzXoEU5SUqDo72pctrkHS32DembdZF');
export const PIXEL_PRICE = 0.01; // SOL