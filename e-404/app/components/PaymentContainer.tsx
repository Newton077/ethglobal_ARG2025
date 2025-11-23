'use client';

import { useState, memo, useCallback } from 'react';
import PaymentForm from './PaymentForm';
import { PaymentFormData, PaymentCreateResponse } from '../lib/types';
import { createPayment, handleAPIResponse, formatAPIError } from '../lib/api';
import { cn } from '../lib/utils';

interface PaymentContainerProps {
  className?: string;
}

interface PaymentState {
  isLoading: boolean;
  error: string | null;
  success: PaymentCreateResponse | null;
}

const PaymentContainer = memo(function PaymentContainer({ className }: PaymentContainerProps) {
  const [paymentState, setPaymentState] = useState<PaymentState>({
    isLoading: false,
    error: null,
    success: null,
  });

  // Reset form state
  const resetState = useCallback(() => {
    setPaymentState({
      isLoading: false,
      error: null,
      success: null,
    });
  }, []);

  // Handle payment submission
  const handlePaymentSubmit = useCallback(async (formData: PaymentFormData) => {
    // Clear previous state
    setPaymentState({
      isLoading: true,
      error: null,
      success: null,
    });

    try {
      // Call ScanGo API to create payment
      const response = await createPayment(formData);

      // Handle API response
      handleAPIResponse(
        response,
        // Success handler
        (data: PaymentCreateResponse) => {
          setPaymentState({
            isLoading: false,
            error: null,
            success: data,
          });
        },
        // Error handler
        (error) => {
          setPaymentState({
            isLoading: false,
            error: formatAPIError(error),
            success: null,
          });
        }
      );
    } catch (error) {
      // Handle unexpected errors
      setPaymentState({
        isLoading: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
        success: null,
      });
    }
  }, []);

  // Handle creating another payment
  const handleCreateAnother = useCallback(() => {
    resetState();
  }, [resetState]);

  return (
    <div className={cn('w-full', className)}>
      {/* Success State */}
      {paymentState.success && (
        <div className="mb-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="text-center">
              {/* Success Icon */}
              <div className="mx-auto w-12 h-12 border-2 border-black rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-black"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>

              {/* Success Message */}
              <h3 className="text-lg font-bold text-black mb-2">
                Payment Created Successfully
              </h3>
              
              <p className="text-sm text-gray-600 mb-4">
                Your payment request has been submitted to ScanGo.
              </p>

              {/* Payment ID Display */}
              <div className="bg-gray-50 border border-gray-200 rounded p-4 mb-4">
                <div className="text-xs text-gray-500 mb-1">Payment ID</div>
                <div className="font-mono text-sm text-black break-all">
                  {paymentState.success.paymentId}
                </div>
              </div>

              {/* Status Display */}
              <div className="bg-gray-50 border border-gray-200 rounded p-4 mb-6">
                <div className="text-xs text-gray-500 mb-1">Status</div>
                <div className="text-sm text-black">
                  {paymentState.success.status}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={handleCreateAnother}
                  className={cn(
                    'px-4 py-2 border border-black rounded text-sm font-medium',
                    'bg-black text-white hover:bg-gray-800',
                    'transition-colors focus:outline-none focus:ring-1 focus:ring-black'
                  )}
                >
                  Create Another Payment
                </button>
                
                <button
                  onClick={useCallback(() => {
                    // Copy payment ID to clipboard
                    if (paymentState.success?.paymentId) {
                      navigator.clipboard.writeText(paymentState.success.paymentId);
                    }
                  }, [paymentState.success?.paymentId])}
                  className={cn(
                    'px-4 py-2 border border-gray-300 rounded text-sm font-medium',
                    'bg-white text-black hover:bg-gray-50 hover:border-gray-400',
                    'transition-colors focus:outline-none focus:ring-1 focus:ring-black'
                  )}
                >
                  Copy Payment ID
                </button>
              </div>

              {/* Additional Information */}
              <div className="mt-6 text-xs text-gray-500">
                <p>
                  You can check the payment status using the Payment ID above.
                </p>
                <p className="mt-1">
                  The payment will be processed by ScanGo.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Form */}
      {!paymentState.success && (
        <PaymentForm
          onSubmit={handlePaymentSubmit}
          isLoading={paymentState.isLoading}
          error={paymentState.error || undefined}
        />
      )}

      {/* Loading State Overlay */}
      {paymentState.isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-10 flex items-center justify-center z-50">
          <div className="bg-white border border-gray-200 rounded-lg p-6 max-w-sm mx-4">
            <div className="text-center">
              {/* Loading Spinner */}
              <div className="mx-auto w-8 h-8 border-2 border-gray-300 border-t-black rounded-full animate-spin mb-4"></div>
              
              <h3 className="text-sm font-medium text-black mb-2">
                Creating Payment
              </h3>
              
              <p className="text-xs text-gray-600">
                Submitting your payment request to ScanGo...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error State (when not in form) */}
      {paymentState.error && !paymentState.isLoading && !paymentState.success && (
        <div className="mt-4">
          <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
            <div className="flex items-start">
              {/* Error Icon */}
              <div className="flex-shrink-0 w-5 h-5 border border-gray-400 rounded-full flex items-center justify-center mr-3 mt-0.5">
                <svg
                  className="w-3 h-3 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>

              <div className="flex-1">
                <h4 className="text-sm font-medium text-black mb-1">
                  Payment Creation Failed
                </h4>
                <p className="text-sm text-gray-600">
                  {paymentState.error}
                </p>
              </div>
            </div>

            {/* Retry Button */}
            <div className="mt-4">
              <button
                onClick={resetState}
                className={cn(
                  'px-3 py-1 border border-gray-300 rounded text-xs font-medium',
                  'bg-white text-black hover:bg-gray-50 hover:border-gray-400',
                  'transition-colors focus:outline-none focus:ring-1 focus:ring-black'
                )}
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default PaymentContainer;