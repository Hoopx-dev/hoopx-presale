import { http } from '@/lib/http';
import type { PurchaseDetailsVO, FetchSessionVO, RegisterPurchaseDTO } from './types';

/**
 * GET /api/purchase/details
 * Retrieves the current presale activity configuration and available purchase tiers
 */
export const getPurchaseDetails = async (): Promise<PurchaseDetailsVO> => {
  const { data } = await http.get('/api/purchase/details');
  return data;
};

/**
 * GET /api/purchase/session?public_key={walletAddress}
 * Retrieves the purchase session information for a connected wallet
 */
export const getPurchaseSession = async (publicKey: string): Promise<FetchSessionVO> => {
  const { data } = await http.get('/api/purchase/session', {
    params: { public_key: publicKey },
  });
  return data;
};

/**
 * POST /api/purchase/register
 * Registers a new token purchase after user completes the blockchain transaction
 */
export const registerPurchase = async (dto: RegisterPurchaseDTO): Promise<FetchSessionVO> => {
  const { data } = await http.post('/api/purchase/register', dto);
  return data;
};
