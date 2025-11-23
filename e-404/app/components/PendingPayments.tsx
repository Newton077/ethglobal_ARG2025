'use client';

import { useState, useEffect, useCallback, memo, useRef } from 'react';
import { Payment, REFRESH_INTERVALS } from '../lib/types';
import { getPendingPayments, formatAPIError } from '../lib/api';
import { cn, formatTimestamp, formatAddress } from '../lib/utils';

interface PendingPaymentsProps {
  className?: string;
  onPaymentClick?: (paymentId: string) => void; // For navigation to PaymentStatus
}

interface PendingPaymentsState {
  payments: Payment[];
  isLoading: boolean;
  error: string;
  lastUpdated?: number;
}

const PendingPayments = memo(function PendingPayments({ className, onPaymentClick }: PendingPaymentsProps) {
  const [paymentsState, setPaymentsState] = useState<PendingPaymentsState>({
    payments: [],
    isLoading: true,
    error: '',
  });

  // Use ref to track if component is mounted to prevent state updates after unmount
  const isMountedRef = useRef(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchPendingPayments = useCallback(async () => {
    // Don't proceed if component is unmounted
    if (!isMountedRef.current) return;

    try {
      setPaymentsState(prev => ({ ...prev, isLoading: true, error: '' }));
      
      const response = await getPendingPayments();
      
      // Check if component is still mounted before updating state
      if (!isMountedRef.current) return;
      
      if (response.success && response.data) {
        setPaymentsState({
          payments: response.data.payments || [],
          isLoading: false,
          error: '',
          lastUpdated: Date.now(),
        });
      } else {
        setPaymentsState({
          payments: [],
          isLoading: false,
          error: response.error ? formatAPIError(response.error) : 'Failed to fetch pending payments',
          lastUpdated: Date.now(),
        });
      }
    } catch (error) {
      // Check if component is still mounted before updating state
      if (!isMountedRef.current) return;
      
      setPaymentsState({
        payments: [],
        isLoading: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
        lastUpdated: Date.now(),
      });
    }
  }, []);

  // Initial fetch and auto-refresh setup with proper cleanup
  useEffect(() => {
    fetchPendingPayments();
    
    intervalRef.current = setInterval(fetchPendingPayments, REFRESH_INTERVALS.PENDING_PAYMENTS);
    
    return () => {
      // Mark component as unmounted
      isMountedRef.current = false;
      
      // Clear interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [fetchPendingPayments]);

  // Handle payment ID click for navigation
  const handlePaymentClick = (paymentId: string) => {
    if (onPaymentClick) {
      onPaymentClick(paymentId);
    }
  };

  // Manual refresh handler
  const handleRefresh = () => {
    fetchPendingPayments();
  };

  return (
    <div className={cn('space-y-6', className)}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-medium text-black mb-2">Pending Payments</h2>
          <p className="text-gray-600 text-sm">
            Real-time list of all payments currently being processed. Updates every {REFRESH_INTERVALS.PENDING_PAYMENTS / 1000} seconds.
          </p>
        </div>
        
        {/* Manual Refresh Button */}
        <button
          onClick={handleRefresh}
          disabled={paymentsState.isLoading}
          className={cn(
            'px-3 py-2 text-sm font-medium border rounded-md',
            'focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2',
            'transition-colors',
            paymentsState.isLoading
              ? 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed'
              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
          )}
        >
          {paymentsState.isLoading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Auto-refresh Status */}
      <div className="flex items-center justify-between text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded border">
        <div className="flex items-center space-x-2">
          <div className={cn(
            'w-2 h-2 rounded-full',
            paymentsState.isLoading ? 'bg-gray-400 animate-pulse' : 'bg-black'
          )} />
          <span>
            Auto-refresh: {paymentsState.isLoading ? 'Updating...' : 'Active'}
          </span>
        </div>
        
        {paymentsState.lastUpdated && (
          <span>
            Last updated: {formatTimestamp(Math.floor(paymentsState.lastUpdated / 1000))}
          </span>
        )}
      </div>

      {/* Error Display */}
      {paymentsState.error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Failed to Load Pending Payments</h3>
              <p className="mt-1 text-sm text-red-700">{paymentsState.error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!paymentsState.isLoading && !paymentsState.error && paymentsState.payments.length === 0 && (
        <div className="text-center py-12 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex flex-col items-center">
            <svg className="h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.44-.816-6.12-2.18C5.07 12.2 4 11.159 4 10c0-.411.121-.802.327-1.146M12 9V7a3 3 0 00-3-3H7a3 3 0 00-3 3v2" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Payments</h3>
            <p className="text-gray-600 text-sm max-w-sm">
              There are currently no payments being processed. All payments have been completed or no new payments have been created.
            </p>
          </div>
        </div>
      )}

      {/* Payments Table */}
      {!paymentsState.error && paymentsState.payments.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          {/* Table Header */}
          <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-900">
                {paymentsState.payments.length} Pending Payment{paymentsState.payments.length !== 1 ? 's' : ''}
              </h3>
              <div className="text-xs text-gray-500">
                Click payment ID to view details
              </div>
            </div>
          </div>

          {/* Table Content */}
          <div className="divide-y divide-gray-200">
            {paymentsState.payments.map((payment, index) => (
              <PendingPaymentRow
                key={payment.id}
                payment={payment}
                onClick={() => handlePaymentClick(payment.id)}
                isEven={index % 2 === 0}
              />
            ))}
          </div>
        </div>
      )}

      {/* Loading State */}
      {paymentsState.isLoading && paymentsState.payments.length === 0 && (
        <div className="text-center py-12 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mb-4"></div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Loading Pending Payments</h3>
            <p className="text-gray-600 text-sm">
              Fetching the latest pending payments from the system...
            </p>
          </div>
        </div>
      )}
    </div>
  );
});

// Individual Payment Row Component
interface PendingPaymentRowProps {
  payment: Payment;
  onClick: () => void;
  isEven: boolean;
}

const PendingPaymentRow = memo(function PendingPaymentRow({ payment, onClick, isEven }: PendingPaymentRowProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={cn(
        'px-6 py-4 cursor-pointer transition-colors',
        'hover:bg-gray-50 focus:bg-gray-50 focus:outline-none',
        isEven ? 'bg-white' : 'bg-gray-25'
      )}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      tabIndex={0}
      role="button"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Payment ID */}
        <div className="space-y-1">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Payment ID
          </div>
          <div className={cn(
            'font-mono text-sm transition-colors',
            isHovered ? 'text-black underline' : 'text-gray-900'
          )}>
            {formatAddress(payment.id)}
          </div>
          {/* Full ID on hover/focus */}
          <div className="text-xs text-gray-500 font-mono break-all">
            {payment.id}
          </div>
        </div>

        {/* Amount & Token */}
        <div className="space-y-1">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Amount
          </div>
          <div className="text-sm text-gray-900">
            <span className="font-medium">{payment.amount}</span>
            <span className="ml-1 text-gray-600">{payment.token}</span>
          </div>
        </div>

        {/* Addresses */}
        <div className="space-y-1">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            From → To
          </div>
          <div className="text-sm text-gray-900 font-mono space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-gray-600">From:</span>
              <span>{formatAddress(payment.from)}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-gray-600">To:</span>
              <span>{formatAddress(payment.to)}</span>
            </div>
          </div>
        </div>

        {/* Timestamp & Status */}
        <div className="space-y-1">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Created At
          </div>
          <div className="text-sm text-gray-900">
            {formatTimestamp(payment.timestamp)}
          </div>
          
          {/* Status Badge */}
          <div className="mt-2">
            <StatusBadge status={payment.status} />
          </div>
        </div>
      </div>

      {/* Description (if available) */}
      {payment.metadata?.description && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
            Description
          </div>
          <div className="text-sm text-gray-700">
            {payment.metadata.description}
          </div>
        </div>
      )}

      {/* Click indicator */}
      <div className="flex items-center justify-end mt-2">
        <div className={cn(
          'text-xs text-gray-400 transition-opacity',
          isHovered ? 'opacity-100' : 'opacity-0'
        )}>
          Click to view details →
        </div>
      </div>
    </div>
  );
});

// Status Badge Component (simplified version for table display)
interface StatusBadgeProps {
  status: 'pending' | 'completed' | 'failed';
}

const StatusBadge = memo(function StatusBadge({ status }: StatusBadgeProps) {
  const statusConfig = {
    pending: {
      badge: 'bg-gray-100 border-gray-300 text-gray-700',
      indicator: 'bg-white border-2 border-gray-400'
    },
    completed: {
      badge: 'bg-black border-black text-white',
      indicator: 'bg-black border-2 border-black'
    },
    failed: {
      badge: 'bg-gray-600 border-gray-600 text-white',
      indicator: 'bg-gray-600 border-2 border-gray-600'
    }
  };

  const config = statusConfig[status];

  return (
    <div className={cn(
      'inline-flex items-center px-2 py-1 text-xs font-medium rounded border',
      config.badge
    )}>
      <div className={cn('w-2 h-2 rounded-full mr-1', config.indicator)} />
      <span className="capitalize">{status}</span>
    </div>
  );
});

export default PendingPayments;

// Export component and types
export type { PendingPaymentsProps };