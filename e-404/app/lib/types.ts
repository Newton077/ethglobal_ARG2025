// EVVM_API Response Types

/**
 * Health endpoint response from EVVM_API
 */
export interface HealthResponse {
  status: string;
  relayerAddress: string;
  timestamp: number;
}

/**
 * System statistics response from EVVM_API
 */
export interface StatsResponse {
  fisher: {
    totalPayments: number;
    pendingPayments: number;
    completedPayments: number;
    failedPayments: number;
  };
  relayer: {
    isRunning: boolean;
    lastProcessedAt: number;
  };
  gasSponsorship: {
    balance: string;
    isActive: boolean;
  };
}

/**
 * Payment status types
 */
export type PaymentStatus = 'pending' | 'completed' | 'failed';

/**
 * Payment object from EVVM_API
 */
export interface Payment {
  id: string;
  from: string;
  to: string;
  amount: string;
  token: string;
  status: PaymentStatus;
  timestamp: number;
  txHash?: string; // Available when payment is completed
  metadata?: {
    description?: string;
    orderId?: string;
  };
}

/**
 * QR generation response from EVVM_API
 */
export interface QRResponse {
  qrData: string;
  deepLink: string;
  description: string;
}

/**
 * Payment creation response
 */
export interface PaymentCreateResponse {
  paymentId: string;
  status: string;
}

/**
 * Pending payments list response
 */
export interface PendingPaymentsResponse {
  payments: Payment[];
}

// Form Data Types

/**
 * Payment creation form data
 */
export interface PaymentFormData {
  from: string;
  to: string; // Must be valid Ethereum address format
  amount: string; // Must be positive number
  token: string; // MATE_Token or other supported tokens
  description?: string; // Optional description field
}

/**
 * QR code generation form data
 */
export interface QRFormData {
  to: string; // Recipient address for QR code
  amount: string; // Payment amount
  token: string; // Token type
  description?: string; // Optional payment description
}

/**
 * Payment status check form data
 */
export interface PaymentStatusFormData {
  paymentId: string; // Payment ID to check status
}

// Validation Types

/**
 * Ethereum address validation type
 */
export type EthereumAddress = string & { __brand: 'EthereumAddress' };

/**
 * Positive number validation type
 */
export type PositiveNumber = string & { __brand: 'PositiveNumber' };

/**
 * API Error response type
 */
export interface APIError {
  error: string;
  message: string;
  statusCode?: number;
}

/**
 * Generic API response wrapper
 */
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: APIError;
}

// Validation Functions

/**
 * Validates if a string is a valid Ethereum address format
 */
export function isValidEthereumAddress(address: string): address is EthereumAddress {
  const ethereumAddressRegex = /^0x[a-fA-F0-9]{40}$/;
  return ethereumAddressRegex.test(address);
}

/**
 * Validates if a string represents a positive number
 */
export function isPositiveNumber(value: string): value is PositiveNumber {
  const num = parseFloat(value);
  return !isNaN(num) && num > 0 && isFinite(num);
}

/**
 * Validates payment ID format (assuming it's a UUID or similar)
 */
export function isValidPaymentId(paymentId: string): boolean {
  // Basic validation - non-empty string with reasonable length
  return typeof paymentId === 'string' && paymentId.trim().length > 0 && paymentId.length <= 100;
}

// Component State Types

/**
 * Loading state for async operations
 */
export interface LoadingState {
  isLoading: boolean;
  error?: string;
}

/**
 * Form validation state
 */
export interface ValidationState {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * System health status for UI display
 */
export interface SystemHealthStatus {
  isConnected: boolean;
  relayerAddress?: string;
  lastUpdated?: number;
  error?: string;
}

/**
 * Auto-refresh configuration
 */
export interface AutoRefreshConfig {
  enabled: boolean;
  intervalMs: number;
}

// Constants

/**
 * Default auto-refresh intervals
 */
export const REFRESH_INTERVALS = {
  HEALTH_CHECK: 30000, // 30 seconds
  PENDING_PAYMENTS: 10000, // 10 seconds
} as const;

/**
 * Supported token types
 */
export const SUPPORTED_TOKENS = ['MATE', 'USDC', 'USDT'] as const;
export type SupportedToken = typeof SUPPORTED_TOKENS[number];

/**
 * API endpoint paths
 */
export const API_ENDPOINTS = {
  HEALTH: '/health',
  PAYMENTS: '/api/payments',
  QR: '/api/qr',
  STATS: '/api/stats',
  PENDING_PAYMENTS: '/api/payments/pending',
} as const;