"use client";

import ConfirmationModal from "@/components/confirmation-modal";
import Header from "@/components/header";
import TermsModal from "@/components/terms-modal";
import Toast, { ToastType } from "@/components/toast";
import TransactionStatusModal from "@/components/transaction-status-modal";
import UnfinishedOrderModal from "@/components/unfinished-order-modal";
import { Button } from "@/components/ui/button";
import InfoListCard from "@/components/ui/info-list-card";
import {
  useConvertToFormal,
  useCreatePreOrder,
  useDeletePreOrder,
  usePurchaseDetails,
  usePurchaseSession,
} from "@/lib/purchase/hooks";
import {
  createSolanaConnection,
  getEstimatedFee,
  transferUSDT,
} from "@/lib/solana/transfer";
import { useReferralStore } from "@/lib/store/useReferralStore";
import { useUIStore } from "@/lib/store/useUIStore";
import { useWallet } from "@solana/wallet-adapter-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";

export default function PurchasePage() {
  const t = useTranslations("purchase");
  const tError = useTranslations("errors");
  const tUnfinished = useTranslations("unfinishedOrder");
  const router = useRouter();
  const { connected, publicKey, signTransaction } = useWallet();
  const {
    data: purchaseDetails,
    isLoading: detailsLoading,
    refetch: refetchDetails,
  } = usePurchaseDetails();
  const {
    data: purchaseSession,
    isLoading: sessionLoading,
    refetch: refetchSession,
  } = usePurchaseSession(
    publicKey?.toBase58(),
    purchaseDetails?.activityId
  );
  const { selectedTier, setSelectedTier } = useUIStore();
  const { referralAddress } = useReferralStore();
  const createPreOrderMutation = useCreatePreOrder();
  const convertToFormalMutation = useConvertToFormal();
  const deletePreOrderMutation = useDeletePreOrder();

  // Referral input state
  const [showReferralInput, setShowReferralInput] = useState(false);
  const [referralInput, setReferralInput] = useState("");
  const [referralError, setReferralError] = useState("");
  const [isReferralAutofilled, setIsReferralAutofilled] = useState(false);

  // Reset selected tier on mount (clean slate every time user enters purchase page)
  useEffect(() => {
    setSelectedTier(null);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-fill referral input from store (only if it's not the connected wallet)
  useEffect(() => {
    if (referralAddress && publicKey) {
      // Don't auto-fill if referral address is the same as connected wallet
      if (referralAddress !== publicKey.toBase58()) {
        setReferralInput(referralAddress);
        setShowReferralInput(true);
        setIsReferralAutofilled(true); // Mark as autofilled
      }
    }
  }, [referralAddress, publicKey]);

  // Validate referral address on blur
  const handleReferralBlur = () => {
    const trimmedReferral = referralInput.trim();
    if (trimmedReferral) {
      if (trimmedReferral === publicKey?.toBase58()) {
        setReferralError(t("cannotReferSelf"));
      } else {
        setReferralError("");
      }
    } else {
      setReferralError("");
    }
  };

  // Clear error when input changes
  const handleReferralChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setReferralInput(e.target.value);
    if (referralError) {
      setReferralError("");
    }
  };

  // Modal states
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState<
    "sending" | "success"
  >("sending");
  const [transactionId, setTransactionId] = useState<string>("");
  const [estimatedFee, setEstimatedFee] = useState(0.00001);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<ToastType>("info");
  const [showToast, setShowToast] = useState(false);

  const showToastNotification = (message: string, type: ToastType) => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  // Terms modal state
  const [showTermsModal, setShowTermsModal] = useState(false);

  // Unfinished order modal state
  const [showUnfinishedOrderModal, setShowUnfinishedOrderModal] =
    useState(false);

  // Flag to track if we're currently processing a purchase (to prevent modal from showing during transaction)
  const [isProcessingPurchase, setIsProcessingPurchase] = useState(false);

  // Redirect if not connected (Rule #1)
  useEffect(() => {
    if (!connected) {
      router.push("/");
    }
  }, [connected, router]);

  // Redirect based on purchase status and activity (Rules #4, #5, #6)
  useEffect(() => {
    if (!sessionLoading && !detailsLoading && connected) {
      const hasSuccessfulPurchase = purchaseSession?.orderVoList?.some(
        (order) => order.purchaseStatus === 1
      );

      // Rule #4: Has successful order but no ongoing activity → redirect to portfolio
      if (hasSuccessfulPurchase && !purchaseDetails) {
        router.push("/portfolio");
        return;
      }

      // Rule #5: Has successful order AND ongoing activity AND already purchased current activity → redirect to portfolio
      if (hasSuccessfulPurchase && purchaseDetails?.activityId) {
        const hasPurchasedCurrentActivity = purchaseSession?.orderVoList?.some(
          (order) =>
            order.purchaseStatus === 1 &&
            order.activityId === purchaseDetails.activityId
        );
        if (hasPurchasedCurrentActivity) {
          router.push("/portfolio");
        }
      }

      // Rule #6: Has successful order AND ongoing activity AND NOT purchased current activity → allow (no redirect)
    }
  }, [
    connected,
    purchaseSession,
    sessionLoading,
    detailsLoading,
    purchaseDetails,
    router,
  ]);

  // Get estimated fee
  useEffect(() => {
    if (connected && publicKey && purchaseDetails?.hoopxWalletAddress) {
      const connection = createSolanaConnection();
      getEstimatedFee(
        connection,
        purchaseDetails.hoopxWalletAddress,
        publicKey
      ).then(setEstimatedFee);
    }
  }, [connected, publicKey, purchaseDetails?.hoopxWalletAddress]);

  // Calculate HOOPX amount based on selected tier and rate
  const hoopxAmount = useMemo(() => {
    if (!selectedTier || !purchaseDetails?.rate) return 0;
    const rate =
      typeof purchaseDetails.rate === "string"
        ? parseFloat(purchaseDetails.rate)
        : purchaseDetails.rate;
    return selectedTier / rate;
  }, [selectedTier, purchaseDetails?.rate]);

  // Get available tiers from API
  const tiers = useMemo(() => {
    if (!purchaseDetails) return [1000, 2000, 3000, 4000, 5000];
    const tierData = purchaseDetails.tiers || purchaseDetails.tierList || [];
    return tierData.map((t) => (typeof t === "string" ? parseInt(t) : t));
  }, [purchaseDetails]);

  // Format numbers with commas
  const formatNumber = (num: number) => {
    return num.toLocaleString("en-US");
  };

  // Format token amounts with round down
  const formatTokenAmount = (num: number) => {
    // If amount >= 100, round down to 2 decimals, otherwise round down to 6 decimals
    const decimals = num >= 100 ? 2 : 6;
    const multiplier = Math.pow(10, decimals);
    const roundedDown = Math.floor(num * multiplier) / multiplier;
    return roundedDown.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: decimals,
    });
  };

  // Check if wallet already purchased current activity
  const alreadyPurchased = useMemo(() => {
    if (!purchaseDetails?.activityId) return false;
    return (
      purchaseSession?.orderVoList?.some(
        (order) =>
          order.purchaseStatus === 1 &&
          order.activityId === purchaseDetails.activityId
      ) || false
    );
  }, [purchaseSession, purchaseDetails?.activityId]);

  // Handle terms acceptance
  const handleAcceptTerms = () => {
    // Mark terms as accepted in sessionStorage
    sessionStorage.setItem("hoopx-terms-accepted-session", "true");
    setShowTermsModal(false);
  };

  // Check for unfinished order and show modal (only if not currently processing a purchase)
  useEffect(() => {
    if (connected && !sessionLoading && purchaseSession?.preOrderVO && !isProcessingPurchase) {
      // Has unfinished order - show modal
      setShowUnfinishedOrderModal(true);
    }
  }, [connected, sessionLoading, purchaseSession, isProcessingPurchase]);

  // Show terms modal only when navigating from a different page (not on refresh or language change)
  useEffect(() => {
    const previousPage = sessionStorage.getItem("hoopx-current-page");

    // If previous page wasn't purchase page, clear the acceptance flag
    // This ensures modal shows when coming from another page
    if (previousPage !== "purchase") {
      sessionStorage.removeItem("hoopx-terms-accepted-session");
    }

    // Update current page to purchase
    sessionStorage.setItem("hoopx-current-page", "purchase");

    // Check if terms have been accepted after potential clearing
    const hasAcceptedInSession = sessionStorage.getItem(
      "hoopx-terms-accepted-session"
    );

    // Show modal if not accepted in this session (and no unfinished order)
    if (
      connected &&
      !sessionLoading &&
      !alreadyPurchased &&
      !hasAcceptedInSession &&
      !purchaseSession?.preOrderVO
    ) {
      setShowTermsModal(true);
    }
  }, [connected, sessionLoading, alreadyPurchased, purchaseSession]);

  const displayRate = useMemo(() => {
    if (!purchaseDetails?.rate) return "0.003";
    const rate =
      typeof purchaseDetails.rate === "string"
        ? parseFloat(purchaseDetails.rate)
        : purchaseDetails.rate;
    // Remove trailing zeros without rounding
    return rate.toString();
  }, [purchaseDetails?.rate]);

  const rateNumber = useMemo(() => {
    if (!purchaseDetails?.rate) return 0.003;
    return typeof purchaseDetails.rate === "string"
      ? parseFloat(purchaseDetails.rate)
      : purchaseDetails.rate;
  }, [purchaseDetails?.rate]);

  const maxTier = Math.max(...tiers);

  // Handle buy button click
  const handleBuyClick = () => {
    if (!selectedTier || alreadyPurchased) return;

    // Check for existing pre-order first
    if (purchaseSession?.preOrderVO) {
      // Has unfinished order - show modal instead of creating new purchase
      setShowUnfinishedOrderModal(true);
      return;
    }

    setShowConfirmModal(true);
  };

  // Handle completing unfinished order
  const handleCompleteUnfinishedOrder = async (trxId: string) => {
    if (!publicKey || !purchaseSession?.preOrderVO) return;

    try {
      const preOrder = purchaseSession.preOrderVO;

      // Validate preOrderId exists
      if (!preOrder.preOrderId) {
        showToastNotification(tUnfinished("errorMessage"), "error");
        return;
      }

      // Convert to formal order
      const result = await convertToFormalMutation.mutateAsync({
        preOrderId: preOrder.preOrderId,
        trxId: trxId,
        publicKey: publicKey.toBase58(),
      });

      // Close modal
      setShowUnfinishedOrderModal(false);

      // Show success toast
      showToastNotification(tUnfinished("successMessage"), "success");

      // Check if registration was successful
      const hasSuccessfulOrder = result.orderVoList?.some(
        (order) => order.purchaseStatus === 1
      );
      if (hasSuccessfulOrder) {
        // Redirect to portfolio after successful completion
        setTimeout(() => {
          router.push("/portfolio");
        }, 1500);
      }
    } catch (error: unknown) {
      // Check if error is from API response
      let errorMessage = tUnfinished("errorMessage");

      if (error instanceof Error) {
        const msg = error.message;

        // Check for transaction hash mismatch error
        if (msg.includes("交易哈希与订单数据匹配不通过")) {
          errorMessage = tUnfinished("errorMismatch");
        } else {
          errorMessage = msg;
        }
      }

      showToastNotification(errorMessage, "error");
    }
  };

  // Handle canceling pre-order
  const handleCancelPreOrder = async () => {
    if (!publicKey || !purchaseSession?.preOrderVO || !purchaseDetails?.activityId) return;

    try {
      const preOrder = purchaseSession.preOrderVO;

      // Validate preOrderId exists
      if (!preOrder.preOrderId) {
        showToastNotification(tUnfinished("cancelError"), "error");
        return;
      }

      // Delete pre-order
      await deletePreOrderMutation.mutateAsync({
        activityId: purchaseDetails.activityId,
        publicKey: publicKey.toBase58(),
        preOrderId: preOrder.preOrderId,
      });

      // Close modal
      setShowUnfinishedOrderModal(false);

      // Show success toast
      showToastNotification(tUnfinished("cancelSuccess"), "success");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : tUnfinished("cancelError");
      showToastNotification(errorMessage, "error");
    }
  };

  // Handle transaction confirmation
  const handleConfirmTransfer = async () => {
    if (
      !selectedTier ||
      !publicKey ||
      !signTransaction ||
      !purchaseDetails?.hoopxWalletAddress
    ) {
      showToastNotification(tError("missingData"), "error");
      return;
    }

    try {
      // Set loading state on confirm button
      setConfirmLoading(true);
      // Set processing flag to prevent unfinished order modal from showing during purchase
      setIsProcessingPurchase(true);

      // Refetch purchase details to verify presale round is still active
      const { data: latestDetails } = await refetchDetails();
      if (!latestDetails) {
        // Presale round has ended
        setConfirmLoading(false);
        setShowConfirmModal(false);
        setIsProcessingPurchase(false);
        showToastNotification(tError("presaleRoundEnded"), "error");
        return;
      }

      // Use latest details for transaction
      const hoopxWalletAddress = latestDetails.hoopxWalletAddress;
      const currentActivityId = latestDetails.activityId;

      if (!hoopxWalletAddress || !currentActivityId) {
        setConfirmLoading(false);
        setIsProcessingPurchase(false);
        showToastNotification(tError("missingData"), "error");
        return;
      }

      // Refetch session to ensure wallet hasn't purchased current activity yet
      const { data: latestSession } = await refetchSession();

      // Check if wallet already purchased current activity (double-purchase prevention)
      const hasExistingPurchase = latestSession?.orderVoList?.some(
        (order) =>
          order.purchaseStatus === 1 &&
          order.activityId === currentActivityId
      );
      if (hasExistingPurchase) {
        setConfirmLoading(false);
        setIsProcessingPurchase(false);
        showToastNotification(tError("alreadyPurchasedError"), "error");
        setTimeout(() => {
          router.push("/portfolio");
        }, 1500);
        return;
      }

      // Create fresh connection (important if tab was backgrounded)
      const connection = createSolanaConnection();

      // Check network connectivity before proceeding
      try {
        await connection.getLatestBlockhash();
      } catch {
        setConfirmLoading(false);
        setShowConfirmModal(false);
        showToastNotification(tError("networkError"), "error");
        return;
      }

      // Step 1: Create pre-order before wallet transaction
      const trimmedReferral = referralInput.trim();

      // Validate referral address is not the same as user's wallet
      if (trimmedReferral && trimmedReferral === publicKey.toBase58()) {
        setConfirmLoading(false);
        setShowConfirmModal(false);
        showToastNotification(t("cannotReferSelf"), "error");
        return;
      }

      const preOrderPayload = {
        publicKey: publicKey.toBase58(),
        amount: selectedTier,
        activityId: currentActivityId,
        ...(trimmedReferral && { referralWalletAddress: trimmedReferral }),
      };

      let preOrderResult;
      try {
        preOrderResult = await createPreOrderMutation.mutateAsync(
          preOrderPayload
        );
      } catch (error: unknown) {
        setConfirmLoading(false);
        setShowConfirmModal(false);
        setIsProcessingPurchase(false);
        const errorMessage =
          error instanceof Error ? error.message : "Failed to create order";
        showToastNotification(errorMessage, "error");
        return;
      }

      // Debug: Log what we got from create-pre
      console.log("[Purchase Flow] Pre-order result:", preOrderResult);

      // Store pre-order ID for later use
      const currentPreOrderId = preOrderResult.preOrderId;

      // Validate preOrderId exists
      if (!currentPreOrderId) {
        console.error("[Purchase Flow] Missing preOrderId from create-pre response");
        setConfirmLoading(false);
        setShowConfirmModal(false);
        setIsProcessingPurchase(false);
        showToastNotification(tError("missingData"), "error");
        return;
      }

      console.log("[Purchase Flow] Using preOrderId:", currentPreOrderId);

      // Step 2: Execute transfer - this will open wallet
      // Only show sending modal AFTER user confirms in wallet
      const result = await transferUSDT(
        connection,
        publicKey,
        hoopxWalletAddress,
        selectedTier,
        signTransaction
      );

      // If user cancelled in wallet, result will have success: false
      if (!result.success) {
        throw new Error(result.error || "Transfer failed");
      }

      // Transaction signed! Close confirmation modal and show sending status
      setShowConfirmModal(false);
      setConfirmLoading(false);
      setTransactionStatus("sending");
      setShowStatusModal(true);

      // Store transaction ID
      setTransactionId(result.signature);

      // Step 3: Convert pre-order to formal order with retry logic
      let conversionResult;
      let retryCount = 0;
      const maxRetries = 3;

      while (retryCount < maxRetries) {
        try {
          const convertPayload = {
            preOrderId: currentPreOrderId,
            trxId: result.signature,
            publicKey: publicKey.toBase58(),
          };
          console.log("[Purchase Flow] Converting to formal with payload:", convertPayload);

          conversionResult = await convertToFormalMutation.mutateAsync(convertPayload);
          break; // Success, exit retry loop
        } catch {
          retryCount++;

          if (retryCount >= maxRetries) {
            // After max retries, show error but don't fail completely
            // Transaction already succeeded on blockchain
            showToastNotification(
              `${tError("registrationFailed")} ${tError("transactionSuccessHint")}`,
              "warning"
            );

            // Wait a bit then redirect to portfolio
            // User can contact support with transaction ID
            setTimeout(() => {
              router.push("/portfolio");
            }, 3000);

            return;
          }

          // Wait before retry (exponential backoff)
          await new Promise((resolve) =>
            setTimeout(resolve, 1000 * retryCount)
          );
        }
      }

      // Check if conversion was successful
      if (!conversionResult) {
        showToastNotification(tError("registrationFailed"), "error");
        return;
      }

      // Show success status
      setTransactionStatus("success");

      // Redirect to portfolio after successful purchase
      // Conversion result should contain the updated session with orderVoList
      const hasSuccessfulOrder = conversionResult.orderVoList?.some(
        (order) => order.purchaseStatus === 1
      );
      if (hasSuccessfulOrder) {
        // Clear processing flag
        setIsProcessingPurchase(false);
        // Small delay to show success modal briefly
        setTimeout(() => {
          router.push("/portfolio");
        }, 1500);
      }
    } catch (error: unknown) {
      // Reset loading and close modals on error
      setConfirmLoading(false);
      setShowConfirmModal(false);
      setShowStatusModal(false);
      // Clear processing flag so unfinished order modal can appear if needed
      setIsProcessingPurchase(false);

      // Refetch session to ensure we have the latest data (including any pre-order)
      refetchSession();

      // Handle different error types with user-friendly messages
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      if (
        errorMessage.includes("User rejected") ||
        errorMessage.includes("cancelled")
      ) {
        // User cancelled transaction - show info toast
        showToastNotification(tError("transactionCancelled"), "info");
      } else if (
        errorMessage.includes("Cannot use your own wallet address as referral")
      ) {
        // User tried to use their own address as referral
        showToastNotification(t("cannotReferSelf"), "error");
      } else if (errorMessage.includes("do not have a USDT account")) {
        // User doesn't have USDT token account
        showToastNotification(tError("noUsdtAccount"), "error");
      } else if (errorMessage.includes("Insufficient SOL for network fees")) {
        // User doesn't have enough SOL for fees - extract values
        // Message format: "Insufficient SOL for network fees. You have X SOL but need Y SOL."
        const match = errorMessage.match(
          /have ([\d.]+) SOL but need ([\d.]+) SOL/
        );
        if (match) {
          const [, current, required] = match;
          showToastNotification(
            tError("insufficientSolBalance", { current, required }),
            "error"
          );
        } else {
          showToastNotification(tError("insufficientSol"), "error");
        }
      } else if (errorMessage.includes("Insufficient USDT balance")) {
        // User doesn't have enough USDT - extract values and use translation
        // Message format: "Insufficient USDT balance. You have X USDT but need Y USDT."
        const match = errorMessage.match(
          /have ([\d.]+) USDT but need ([\d.]+) USDT/
        );
        if (match) {
          const [, current, required] = match;
          showToastNotification(
            tError("insufficientUsdtBalance", { current, required }),
            "error"
          );
        } else {
          showToastNotification(tError("insufficientBalanceGeneric"), "error");
        }
      } else if (errorMessage.includes("Insufficient")) {
        // Generic insufficient balance
        showToastNotification(tError("insufficientBalanceGeneric"), "error");
      } else if (errorMessage.includes("Network")) {
        showToastNotification(tError("networkError"), "error");
      } else {
        // Generic error
        showToastNotification(tError("transactionFailed"), "error");
      }
    }
  };

  if (!connected || alreadyPurchased) {
    return null; // Will redirect
  }

  return (
    <div className='min-h-screen'>
      <div className='container mx-auto px-4 py-6'>
        <Header />

        <main className='max-w-md mx-auto'>
          {/* Title */}
          <h1 className='text-white text-2xl font-bold mb-6 text-center'>
            {t("title")}
          </h1>

          {/* Tier Selection Grid */}
          <div className='grid grid-cols-3 gap-3 mb-6'>
            {tiers.map((tier) => (
              <Button
                key={tier}
                variant={
                  selectedTier === tier ? "secondary-selected" : "secondary"
                }
                size='default'
                onClick={() => setSelectedTier(tier)}
                disabled={alreadyPurchased || detailsLoading}
                showCheckmark={selectedTier === tier}
              >
                {formatNumber(tier)}
              </Button>
            ))}
          </div>

          {/* Summary Cards */}
          <InfoListCard
            items={[
              {
                label: t("currentPrice"),
                value: detailsLoading ? "..." : `${displayRate} USDT/HOOPX`,
                valueColor: "text-success",
              },
              {
                label: t("purchaseLimit"),
                value: detailsLoading ? "..." : `${formatNumber(maxTier)} USDT`,
              },
              {
                label: t("currentAssets"),
                value: (() => {
                  // Calculate total HOOPX from all successful orders
                  const totalHoopx =
                    purchaseSession?.orderVoList
                      ?.filter((order) => order.purchaseStatus === 1)
                      .reduce(
                        (sum, order) => sum + order.amount / order.rate,
                        0
                      ) || 0;
                  return totalHoopx > 0
                    ? `${formatTokenAmount(totalHoopx)} HOOPX`
                    : "0 HOOPX";
                })(),
              },
            ]}
            className='mb-6'
          />

          {/* Purchase Details */}
          <InfoListCard
            sectionLabel={t("purchaseDetails")}
            items={[
              {
                label: t("hoopxReceive"),
                value: selectedTier ? formatTokenAmount(hoopxAmount) : "0",
              },
              {
                label: t("vestingPeriod"),
                value: detailsLoading
                  ? "..."
                  : `${purchaseDetails?.vesting || "12"} ${t("months")}`,
              },
              {
                label: t("cliffPeriod"),
                value: detailsLoading
                  ? "..."
                  : `${purchaseDetails?.cliff || "3"} ${t("months")}`,
              },
              {
                label: t("releaseFrequency"),
                value: detailsLoading
                  ? "..."
                  : (() => {
                      const freq =
                        Number(purchaseDetails?.vestingFrequency) ?? 1;
                      if (freq === 1) return t("perMonth");
                      if (freq === 2) return t("perYear");
                      // Fallback for unexpected values
                      return t("perMonth");
                    })(),
              },
            ]}
            className='mb-6'
          />

          {/* Referral Section */}
          <div className='mb-6'>
            {/* Collapsible Header */}
            <button
              type='button'
              onClick={() => setShowReferralInput(!showReferralInput)}
              className='w-full flex items-center justify-between text-white/70 text-sm py-3 cursor-pointer hover:text-white transition-colors'
            >
              <span>{t("haveReferral")}</span>
              {showReferralInput ? (
                <FiChevronUp className='w-4 h-4' />
              ) : (
                <FiChevronDown className='w-4 h-4' />
              )}
            </button>

            {/* Collapsible Input */}
            {showReferralInput && (
              <div className='mt-2'>
                <div className='relative'>
                  <input
                    type='text'
                    value={referralInput}
                    onChange={handleReferralChange}
                    onBlur={handleReferralBlur}
                    placeholder={t("referralPlaceholder")}
                    readOnly={isReferralAutofilled}
                    className={`w-full border rounded-xl px-4 py-3 text-white placeholder-white/50 transition-colors ${
                      isReferralAutofilled
                        ? "bg-white/5 border-white/10 cursor-not-allowed"
                        : referralError
                        ? "bg-white/10 border-danger focus:border-danger focus:outline-none"
                        : "bg-white/10 border-white/20 focus:border-secondary focus:outline-none"
                    }`}
                  />
                  {isReferralAutofilled && (
                    <div className='absolute right-3 top-1/2 -translate-y-1/2'>
                      <svg className='w-5 h-5 text-white/40' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' />
                      </svg>
                    </div>
                  )}
                </div>
                {referralError && (
                  <p className='text-danger text-xs mt-2'>{referralError}</p>
                )}
              </div>
            )}
          </div>

          {/* Buy Button */}
          <Button
            variant={
              !selectedTier ||
              alreadyPurchased ||
              detailsLoading ||
              !!referralError
                ? "primary-disabled"
                : "primary"
            }
            size='large'
            onClick={handleBuyClick}
            disabled={
              !selectedTier ||
              alreadyPurchased ||
              detailsLoading ||
              !!referralError
            }
            className='w-full'
          >
            {selectedTier ? `${t("buyButton")}` : t("selectAmount")}
          </Button>

          {/* Note */}
          <p className='text-white/50 text-xs text-center mt-4'>{t("note")}</p>
        </main>
      </div>

      {/* Modals */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        amount={selectedTier || 0}
        rate={rateNumber}
        estimatedFee={estimatedFee}
        loading={confirmLoading}
        onConfirm={handleConfirmTransfer}
        onClose={() => {
          if (!confirmLoading) {
            setShowConfirmModal(false);
          }
        }}
      />

      <TransactionStatusModal
        isOpen={showStatusModal}
        status={transactionStatus}
        amount={selectedTier || 0}
        transactionId={transactionId}
        onClose={() => setShowStatusModal(false)}
      />

      {/* Terms Modal */}
      <TermsModal isOpen={showTermsModal} onAccept={handleAcceptTerms} />

      {/* Unfinished Order Modal */}
      <UnfinishedOrderModal
        isOpen={showUnfinishedOrderModal}
        preOrder={purchaseSession?.preOrderVO || null}
        onSubmit={handleCompleteUnfinishedOrder}
        onCancel={handleCancelPreOrder}
        onClose={() => setShowUnfinishedOrderModal(false)}
        loading={convertToFormalMutation.isPending}
        cancelLoading={deletePreOrderMutation.isPending}
      />

      {/* Toast Notification */}
      <Toast
        message={toastMessage}
        type={toastType}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />
    </div>
  );
}
