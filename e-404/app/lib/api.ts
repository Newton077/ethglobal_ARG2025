import {
  HealthResponse,
  StatsResponse,
  Payment,
  QRResponse,
  PaymentCreateResponse,
  PendingPaymentsResponse,
  PaymentFormData,
  QRFormData,
  APIResponse,
  APIError,
  API_ENDPOINTS,
} from './types';

// Configuration
const EVVM_API_BASE_URL = 'http://localhost:3001';
const DEFAULT_TIMEOUT = 10000; // 10 seconds
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

/**
 * Custom error class for API errors
 */
export class EVVMAPIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'EVVMAPIError';
  }
}

/**
 * Sleep utility for retry delays
 */
const sleep = (ms: number): Promise<void> => 
  new Promise(resolve => setTimeout(resolve, ms));

/**
 * Generic API request function with error handling, timeout, and retry logic
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  retries = MAX_RETRIES
): Promise<APIResponse<T>> {
  const url = `${EVVM_API_BASE_URL}${endpoint}`;
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT);

  const requestOptions: RequestInit = {
    ...options,
    signal: controller.signal,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, requestOptions);
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new EVVMAPIError(
        errorData.message || `HTTP ${response.status}: ${response.statusText}`,
        response.status
      );
    }

    const data = await response.json();
    return {
      success: true,
      data,
    };
  } catch (error) {
    clearTimeout(timeoutId);

    // Handle abort (timeout) errors
    if (error instanceof Error && error.name === 'AbortError') {
      const timeoutError = new EVVMAPIError('Request timeout', 408, error);
      
      if (retries > 0) {
        await sleep(RETRY_DELAY);
        return apiRequest<T>(endpoint, options, retries - 1);
      }
      
      return {
        success: false,
        error: {
          error: 'TIMEOUT',
          message: 'Request timed out after 10 seconds',
          statusCode: 408,
        },
      };
    }

    // Handle network errors with retry logic
    if (error instanceof TypeError && error.message.includes('fetch')) {
      if (retries > 0) {
        await sleep(RETRY_DELAY);
        return apiRequest<T>(endpoint, options, retries - 1);
      }
      
      return {
        success: false,
        error: {
          error: 'NETWORK_ERROR',
          message: 'Unable to connect to EVVM API. Please check your connection.',
        },
      };
    }

    // Handle API errors
    if (error instanceof EVVMAPIError) {
      return {
        success: false,
        error: {
          error: 'API_ERROR',
          message: error.message,
          statusCode: error.statusCode,
        },
      };
    }

    // Handle unexpected errors
    return {
      success: false,
      error: {
        error: 'UNKNOWN_ERROR',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
      },
    };
  }
}

/**
 * Health check - Get EVVM_API system status
 */
export async function getHealth(): Promise<APIResponse<HealthResponse>> {
  return apiRequest<HealthResponse>(API_ENDPOINTS.HEALTH);
}

/**
 * Get system statistics
 */
export async function getStats(): Promise<APIResponse<StatsResponse>> {
  return apiRequest<StatsResponse>(API_ENDPOINTS.STATS);
}

/**
 * Create a new payment
 */
export async function createPayment(
  paymentData: PaymentFormData
): Promise<APIResponse<PaymentCreateResponse>> {
  return apiRequest<PaymentCreateResponse>(API_ENDPOINTS.PAYMENTS, {
    method: 'POST',
    body: JSON.stringify(paymentData),
  });
}

/**
 * Get payment status by ID
 */
export async function getPaymentStatus(
  paymentId: string
): Promise<APIResponse<Payment>> {
  return apiRequest<Payment>(`${API_ENDPOINTS.PAYMENTS}/${paymentId}`);
}

/**
 * Get all pending payments
 */
export async function getPendingPayments(): Promise<APIResponse<PendingPaymentsResponse>> {
  return apiRequest<PendingPaymentsResponse>(API_ENDPOINTS.PENDING_PAYMENTS);
}

/**
 * Generate QR code for payment
 */
export async function generateQR(
  qrData: QRFormData
): Promise<APIResponse<QRResponse>> {
  return apiRequest<QRResponse>(API_ENDPOINTS.QR, {
    method: 'POST',
    body: JSON.stringify(qrData),
  });
}

/**
 * Test API connectivity
 */
export async function testConnection(): Promise<boolean> {
  try {
    const response = await getHealth();
    return response.success;
  } catch {
    return false;
  }
}

/**
 * Utility function to handle API responses in components
 */
export function handleAPIResponse<T>(
  response: APIResponse<T>,
  onSuccess: (data: T) => void,
  onError: (error: APIError) => void
): void {
  if (response.success && response.data) {
    onSuccess(response.data);
  } else if (response.error) {
    onError(response.error);
  }
}

/**
 * Custom hook-like utility for managing API loading states
 */
export class APIManager {
  private loadingStates: Map<string, boolean> = new Map();
  private errorStates: Map<string, string> = new Map();

  setLoading(key: string, loading: boolean): void {
    this.loadingStates.set(key, loading);
  }

  isLoading(key: string): boolean {
    return this.loadingStates.get(key) || false;
  }

  setError(key: string, error: string): void {
    this.errorStates.set(key, error);
  }

  getError(key: string): string | undefined {
    return this.errorStates.get(key);
  }

  clearError(key: string): void {
    this.errorStates.delete(key);
  }

  reset(key: string): void {
    this.loadingStates.delete(key);
    this.errorStates.delete(key);
  }
}

/**
 * Format API errors for user display
 */
export function formatAPIError(error: APIError): string {
  switch (error.error) {
    case 'TIMEOUT':
      return 'Request timed out. Please try again.';
    case 'NETWORK_ERROR':
      return 'Unable to connect to the server. Please check your connection.';
    case 'API_ERROR':
      return error.message || 'An error occurred while processing your request.';
    default:
      return 'An unexpected error occurred. Please try again.';
  }
}

/**
 * Validate API response data
 */
export function validateResponse<T>(
  response: APIResponse<T>,
  validator: (data: T) => boolean
): boolean {
  return response.success && response.data ? validator(response.data) : false;
}

// Export singleton API manager instance
export const apiManager = new APIManager();