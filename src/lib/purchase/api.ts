import { decryptAes } from "@/lib/crypto/decrypt";
import { http } from "@/lib/http";
import { useHoopxWalletStore } from "@/lib/store/useHoopxWalletStore";
import type {
  CreatePreOrderDTO,
  DeletePreOrderDTO,
  FetchSessionVO,
  PreOrderToFormalDTO,
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
 * POST /api/purchase/session
 * Retrieves the purchase session information for a connected wallet
 */
export const getPurchaseSession = async (
  publicKey: string,
  activityId: string
): Promise<FetchSessionVO> => {
  const { data } = await http.post("/api/purchase/session", {
    publicKey,
    activityId,
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

/**
 * POST /api/purchase/create-pre
 * Creates a pre-order before wallet transaction
 * Returns the pre-order ID needed for convert-to-formal
 */
export const createPreOrder = async (
  dto: CreatePreOrderDTO
): Promise<{ preOrderId: string }> => {
  const { data } = await http.post("/api/purchase/create-pre", dto);

  // Handle potential wrapper structure
  if (data && typeof data === "object" && "data" in data) {
    // API returns { data: "ORD-xxx" }, we need to wrap it as { preOrderId: "ORD-xxx" }
    return { preOrderId: data.data };
  }
  return data;
};

/**
 * POST /api/purchase/convert-to-formal
 * Converts a pre-order to formal order after successful transaction
 */
export const convertToFormal = async (
  dto: PreOrderToFormalDTO
): Promise<FetchSessionVO> => {
  const { data } = await http.post("/api/purchase/convert-to-formal", dto);

  // Handle potential wrapper structure
  if (data && typeof data === "object" && "data" in data) {
    // Check if the response indicates an error (code 500, data is null)
    if (data.code === 500 || data.data === null) {
      // Throw error with the message from the API
      const errorMsg = data.msg || "Failed to convert order";
      throw new Error(errorMsg);
    }
    return data.data;
  }
  return data;
};

/**
 * POST /api/purchase/del-pre
 * Deletes a pre-order
 */
export const deletePreOrder = async (
  dto: DeletePreOrderDTO
): Promise<void> => {
  const { data } = await http.post("/api/purchase/del-pre", dto);

  // Check if there's an error in the response
  if (data && typeof data === "object" && "code" in data) {
    if (data.code !== 200) {
      const errorMsg = data.msg || "Failed to delete pre-order";
      throw new Error(errorMsg);
    }
  }
};
