import { decryptAes } from "@/lib/crypto/decrypt";
import { http } from "@/lib/http";
import { useHoopxWalletStore } from "@/lib/store/useHoopxWalletStore";
import type {
  FetchSessionVO,
  PurchaseDetailsVO,
  RegisterPurchaseDTO,
} from "./types";

/**
 * GET /api/purchase/details
 * Retrieves the current presale activity configuration and available purchase tiers
 */
export const getPurchaseDetails = async (): Promise<PurchaseDetailsVO> => {
  const { data } = await http.get("/api/purchase/details");

  // Handle potential wrapper structure like { code: 200, data: {...} } or { success: true, data: {...} }
  let result: PurchaseDetailsVO;
  if (data && typeof data === "object") {
    // If response has a 'data' property, use that
    if ("data" in data) {
      result = data.data;
    } else {
      // Otherwise return the data directly
      result = data;
    }
  } else {
    result = data;
  }

  // Decrypt the hoopxWalletAddress if it exists and is encrypted
  if (result.hoopxWalletAddress) {
    try {
      const encryptedAddress = result.hoopxWalletAddress;
      const decryptedAddress = decryptAes(encryptedAddress);
      result.hoopxWalletAddress = decryptedAddress;

      // Store the truncated address in Zustand store
      useHoopxWalletStore.getState().setHoopxAddress(decryptedAddress);
    } catch (error) {
      console.error("Failed to decrypt hoopxWalletAddress:", error);
      // Keep the original encrypted value if decryption fails
    }
  }

  return result;
};

/**
 * GET /api/purchase/session?public_key={walletAddress}
 * Retrieves the purchase session information for a connected wallet
 */
export const getPurchaseSession = async (
  publicKey: string
): Promise<FetchSessionVO> => {
  const { data } = await http.get("/api/purchase/session", {
    params: { public_key: publicKey },
  });

  // Handle potential wrapper structure like { code: 200, data: {...} }
  if (data && typeof data === "object" && "data" in data) {
    return data.data;
  }
  return data;
};

/**
 * POST /api/purchase/register
 * Registers a new token purchase after user completes the blockchain transaction
 */
export const registerPurchase = async (
  dto: RegisterPurchaseDTO
): Promise<FetchSessionVO> => {
  const { data } = await http.post("/api/purchase/register", dto);

  // Handle potential wrapper structure like { code: 200, data: {...} }
  if (data && typeof data === "object" && "data" in data) {
    return data.data;
  }
  return data;
};

/**
 * GET /api/purchase/terms?lang={language}
 * Retrieves the terms and conditions in markdown format
 * @param lang - Language code ('en' for English, 'zh' for Chinese)
 */
export const getTerms = async (lang: string = 'en'): Promise<string> => {
  const { data } = await http.get("/api/purchase/terms", {
    params: { lang },
    headers: {
      Accept: "text/markdown",
    },
  });
  return data;
};
