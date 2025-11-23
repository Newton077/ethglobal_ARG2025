'use client';

import React, { useState } from 'react';
import { Payment, PaymentStatusFormData, isValidPaymentId } from '../lib/types';
import { getPaymentStatus, formatAPIError } from '../lib/api';
import { cn, formatTimestamp, formatAddress } from '../lib/utils';

interface PaymentStatusProps {
  className?: string;
  initialPaymentId?: string; // Allow pre-filling payment ID from navigation
}

interface PaymentStatusState {
  payment: Payment | null;
  isLoading: boolean;
  error: string;
  notFound: boolean;
}

export default function PaymentStatus({ className, initialPaymentId = '' }: PaymentStatusProps) {
  const [formData, setFormData] = useState<PaymentStatusFormData>({
    paymentId: initialPaymentId,
  });

  const [statusState, setStatusState] = useState<PaymentStatusState>({
    payment: null,
    isLoading: false,
    error: '',
    notFound: false,
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Form validation
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Validate payment ID
    if (!formData.paymentId.trim()) {
      errors.paymentId = 'Payment ID is required';
    } else if (!isValidPaymentId(formData.paymentId.trim())) {
      errors.paymentId = 'Please enter a valid payment ID';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle input changes
  const handleInputChange = (value: string) => {
    setFormData({ paymentId: value });
    
    // Clear validation error
    if (validationErrors.paymentId) {
      setValidationErrors({});
    }
    
    // Clear previous results and errors
    if (statusState.error || statusState.notFound) {
      setStatusState(prev => ({
        ...prev,
        error: '',
        notFound: false,
        payment: null,
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setStatusState({
      payment: null,
      isLoading: true,
      error: '',
      notFound: false,
    });

    try {
      const response = await getPaymentStatus(formData.paymentId.trim());
      
      if (response.success && response.data) {
        setStatusState({
          payment: response.data,
          isLoading: false,
          error: '',
          notFound: false,
        });
      } else if (response.error) {
        // Check if it's a "not found" error
        const isNotFound = response.error.statusCode === 404 || 
                          response.error.message.toLowerCase().includes('not found');
        
        setStatusState({
          payment: null,
          isLoading: false,
          error: isNotFound ? '' : formatAPIError(response.error),
          notFound: isNotFound,
        });
      }
    } catch (err) {
      setStatusState({
        payment: null,
        isLoading: false,
        error: 'An unexpected error occurred while checking payment status',
        notFound: false,
      });
    }
  };

  // Reset form and results
  const handleReset = () => {
    setFormData({ paymentId: '' });
    setStatusState({
      payment: null,
      isLoading: false,
      error: '',
      notFound: false,
    });
    setValidationErrors({});
  };

  return (
    <div className={cn('space-y-6', className)}>
      <div>
        <h2 className="text-xl font-medium text-black mb-2">Check Payment Status</h2>
        <p className="text-gray-600 text-sm">
          Enter a payment ID to check the current status and details of your payment.
        </p>
      </div>

      {/* Payment ID Input Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="payment-id" className="block text-sm font-medium text-gray-900 mb-1">
            Payment ID *
          </label>
          <input
            id="payment-id"
            type="text"
            value={formData.paymentId}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="Enter payment ID..."
            className={cn(
              'w-full px-3 py-2 border rounded-md text-sm',
              'focus:outline-none focus:ring-2 focus:ring-black focus:border-black',
              'font-mono',
              validationErrors.paymentId
                ? 'border-red-500 bg-red-50'
                : 'border-gray-300 bg-white'
            )}
            disabled={statusState.isLoading}
          />
          {validationErrors.paymentId && (
            <p className="mt-1 text-xs text-red-600">{validationErrors.paymentId}</p>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={statusState.isLoading}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-md border',
              'focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2',
              'transition-colors',
              statusState.isLoading
                ? 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed'
                : 'bg-black text-white border-black hover:bg-gray-800'
            )}
          >
            {statusState.isLoading ? 'Checking...' : 'Check Status'}
          </button>
          
          <button
            type="button"
            onClick={handleReset}
            disabled={statusState.isLoading}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-md border',
              'bg-white text-gray-700 border-gray-300',
              'hover:bg-gray-50 hover:border-gray-400',
              'focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2',
              'transition-colors',
              statusState.isLoading && 'opacity-50 cursor-not-allowed'
            )}
          >
            Reset
          </button>
        </div>
      </form>

      {/* Error Display */}
      {statusState.error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Status Check Failed</h3>
              <p className="mt-1 text-sm text-red-700">{statusState.error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Payment Not Found */}
      {statusState.notFound && (
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.44-.816-6.12-2.18C5.07 12.2 4 11.159 4 10c0-.411.121-.802.327-1.146M12 9V7a3 3 0 00-3-3H7a3 3 0 00-3 3v2" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-gray-800">Payment Not Found</h3>
              <p className="mt-1 text-sm text-gray-600">
                No payment found with ID "{formData.paymentId}". Please check the payment ID and try again.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Payment Details Display */}
      {statusState.payment && (
        <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
          {/* Header */}
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-black">Payment Details</h3>
          </div>
          
          <div className="p-6">
            {/* Status Section - Prominent Display */}
            <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Current Status</h4>
                  <StatusBadge status={statusState.payment.status} showDescription={true} />
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500 mb-1">Last Updated</div>
                  <div className="text-sm text-gray-700">
                    {formatTimestamp(statusState.payment.timestamp)}
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Information Grid */}
            <div className="space-y-6">
              {/* Basic Payment Info */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3 pb-1 border-b border-gray-200">
                  Payment Information
                </h4>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <PaymentDetailRow 
                    label="Payment ID" 
                    value={statusState.payment.id} 
                    monospace={true}
                    copyable={true}
                  />
                  <PaymentDetailRow 
                    label="Amount" 
                    value={`${statusState.payment.amount} ${statusState.payment.token}`}
                  />
                  <PaymentDetailRow 
                    label="Token" 
                    value={statusState.payment.token}
                  />
                  <PaymentDetailRow 
                    label="Created At" 
                    value={formatTimestamp(statusState.payment.timestamp)}
                  />
                </div>
              </div>

              {/* Address Information */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3 pb-1 border-b border-gray-200">
                  Address Information
                </h4>
                <div className="space-y-4">
                  <PaymentDetailRow 
                    label="From Address" 
                    value={statusState.payment.from} 
                    monospace={true}
                    copyable={true}
                    truncate={true}
                  />
                  <PaymentDetailRow 
                    label="To Address" 
                    value={statusState.payment.to} 
                    monospace={true}
                    copyable={true}
                    truncate={true}
                  />
                </div>
              </div>

              {/* Transaction Information (if available) */}
              {statusState.payment.txHash && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3 pb-1 border-b border-gray-200">
                    Transaction Information
                  </h4>
                  <PaymentDetailRow 
                    label="Transaction Hash" 
                    value={statusState.payment.txHash} 
                    monospace={true}
                    copyable={true}
                    truncate={true}
                  />
                </div>
              )}

              {/* Metadata (if available) */}
              {(statusState.payment.metadata?.description || statusState.payment.metadata?.orderId) && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3 pb-1 border-b border-gray-200">
                    Additional Information
                  </h4>
                  <div className="space-y-4">
                    {statusState.payment.metadata?.description && (
                      <PaymentDetailRow 
                        label="Description" 
                        value={statusState.payment.metadata.description}
                      />
                    )}
                    {statusState.payment.metadata?.orderId && (
                      <PaymentDetailRow 
                        label="Order ID" 
                        value={statusState.payment.metadata.orderId} 
                        monospace={true}
                        copyable={true}
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Enhanced Status Indicator Component with grayscale styling
interface StatusIndicatorProps {
  status: 'pending' | 'completed' | 'failed';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

function StatusIndicator({ status, size = 'md', showLabel = true }: StatusIndicatorProps) {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3', 
    lg: 'w-4 h-4'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  // Status configurations using only grayscale colors
  const statusConfig = {
    pending: {
      indicator: 'bg-white border-2 border-gray-400',
      text: 'text-gray-600',
      badge: 'bg-gray-100 border-gray-300 text-gray-700',
      description: 'Payment is being processed'
    },
    completed: {
      indicator: 'bg-black border-2 border-black',
      text: 'text-black',
      badge: 'bg-black border-black text-white',
      description: 'Payment has been successfully completed'
    },
    failed: {
      indicator: 'bg-gray-600 border-2 border-gray-600',
      text: 'text-gray-800',
      badge: 'bg-gray-600 border-gray-600 text-white',
      description: 'Payment processing failed'
    }
  };

  const config = statusConfig[status];

  return (
    <div className="flex items-center space-x-2">
      {/* Geometric Status Indicator */}
      <div className="flex items-center space-x-2">
        {status === 'pending' && (
          <div className={cn('rounded-full', config.indicator, sizeClasses[size])} />
        )}
        {status === 'completed' && (
          <div className={cn('rounded-sm', config.indicator, sizeClasses[size])} />
        )}
        {status === 'failed' && (
          <div 
            className={cn('rotate-45', config.indicator, sizeClasses[size])}
            style={{ borderRadius: '2px' }}
          />
        )}
        
        {showLabel && (
          <span className={cn('font-medium capitalize', config.text, textSizeClasses[size])}>
            {status}
          </span>
        )}
      </div>
    </div>
  );
}

// Enhanced Status Badge Component for detailed display
interface StatusBadgeProps {
  status: 'pending' | 'completed' | 'failed';
  showDescription?: boolean;
}

function StatusBadge({ status, showDescription = false }: StatusBadgeProps) {
  const statusConfig = {
    pending: {
      badge: 'bg-gray-100 border-gray-300 text-gray-700',
      description: 'Payment is being processed and will be confirmed shortly'
    },
    completed: {
      badge: 'bg-black border-black text-white',
      description: 'Payment has been successfully completed and confirmed on the blockchain'
    },
    failed: {
      badge: 'bg-gray-600 border-gray-600 text-white',
      description: 'Payment processing failed and requires attention'
    }
  };

  const config = statusConfig[status];

  return (
    <div className="space-y-1">
      <div className={cn(
        'inline-flex items-center px-2 py-1 text-xs font-medium rounded border',
        config.badge
      )}>
        <StatusIndicator status={status} size="sm" showLabel={false} />
        <span className="ml-1 capitalize">{status}</span>
      </div>
      
      {showDescription && (
        <p className="text-xs text-gray-600 mt-1">
          {config.description}
        </p>
      )}
    </div>
  );
}

// Payment Detail Row Component for consistent styling
interface PaymentDetailRowProps {
  label: string;
  value: string;
  monospace?: boolean;
  copyable?: boolean;
  truncate?: boolean;
}

function PaymentDetailRow({ label, value, monospace = false, copyable = false, truncate = false }: PaymentDetailRowProps) {
  const [copySuccess, setCopySuccess] = useState(false);

  const handleCopy = async () => {
    if (!copyable) return;

    try {
      await navigator.clipboard.writeText(value);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = value;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } catch (fallbackErr) {
        console.error('Fallback copy failed:', fallbackErr);
      }
      document.body.removeChild(textArea);
    }
  };

  const displayValue = truncate && value.length > 20 
    ? `${value.slice(0, 10)}...${value.slice(-10)}`
    : value;

  return (
    <div className="space-y-1">
      <label className="block text-xs font-medium text-gray-700 uppercase tracking-wide">
        {label}
      </label>
      <div className="flex items-center space-x-2">
        <div className={cn(
          'flex-1 px-3 py-2 bg-white border border-gray-200 rounded text-sm',
          monospace && 'font-mono',
          truncate ? 'break-all' : 'break-words'
        )}>
          {displayValue}
        </div>
        
        {copyable && (
          <button
            onClick={handleCopy}
            className={cn(
              'px-2 py-2 text-xs border rounded transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2',
              copySuccess
                ? 'bg-green-50 border-green-200 text-green-700'
                : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
            )}
            title={`Copy ${label.toLowerCase()}`}
          >
            {copySuccess ? (
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            )}
          </button>
        )}
      </div>
      
      {/* Full value tooltip for truncated values */}
      {truncate && value.length > 20 && (
        <div className="text-xs text-gray-500 font-mono break-all bg-gray-50 p-1 rounded">
          {value}
        </div>
      )}
    </div>
  );
}

// Export the component and types for use in other components
export type { PaymentStatusProps };
export { StatusIndicator, StatusBadge };