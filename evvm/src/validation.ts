import { ethers } from 'ethers';

/**
 * Validation error class for payment validation failures
 */
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Validates an Ethereum address
 * Accepts ERC-55 checksummed or lowercase addresses
 */
export function validateAddress(address: string, fieldName: string = 'address'): void {
  if (!address || typeof address !== 'string') {
    throw new ValidationError(`${fieldName} is required and must be a string`);
  }

  const trimmedAddress = address.trim();

  // Check if it's a valid Ethereum address format (0x + 40 hex chars)
  if (!/^0x[0-9a-fA-F]{40}$/.test(trimmedAddress)) {
    throw new ValidationError(
      `Invalid ${fieldName} format. Must be a valid Ethereum address (0x followed by 40 hex characters)`
    );
  }

  // Validate ERC-55 checksum if it contains mixed case
  if (trimmedAddress !== trimmedAddress.toLowerCase() && trimmedAddress !== trimmedAddress.toUpperCase()) {
    try {
      const checksummed = ethers.getAddress(trimmedAddress);
      if (checksummed !== trimmedAddress) {
        throw new ValidationError(
          `Invalid ${fieldName} checksum. Address has mixed case but invalid ERC-55 checksum`
        );
      }
    } catch (error) {
      throw new ValidationError(
        `Invalid ${fieldName} checksum. Address has mixed case but invalid ERC-55 checksum`
      );
    }
  }
}

/**
 * Validates a payment amount
 * Must be a positive integer (no decimals, no zero, no negative)
 */
export function validateAmount(amount: string | number, fieldName: string = 'amount'): void {
  if (amount === null || amount === undefined || amount === '') {
    throw new ValidationError(`${fieldName} is required`);
  }

  const amountStr = String(amount).trim();

  // Check if it's a valid number format
  if (!/^\d+$/.test(amountStr)) {
    throw new ValidationError(
      `${fieldName} must be a positive integer without decimals. Received: ${amountStr}`
    );
  }

  // Convert to BigInt to handle large numbers
  try {
    const bigIntAmount = BigInt(amountStr);

    // Check if amount is greater than zero
    if (bigIntAmount <= 0n) {
      throw new ValidationError(`${fieldName} must be greater than zero`);
    }
  } catch (error) {
    throw new ValidationError(
      `${fieldName} is not a valid number. Received: ${amountStr}`
    );
  }
}

/**
 * Validates a token symbol against whitelist
 */
export function validateToken(token: string, fieldName: string = 'token'): void {
  if (!token || typeof token !== 'string') {
    throw new ValidationError(`${fieldName} is required and must be a string`);
  }

  const supportedTokens = ['MATE'];
  const normalizedToken = token.toUpperCase();

  if (!supportedTokens.includes(normalizedToken)) {
    throw new ValidationError(
      `${fieldName} not supported. Supported tokens: ${supportedTokens.join(', ')}. Received: ${token}`
    );
  }
}

/**
 * Validates a complete payment request
 */
export function validatePaymentRequest(
  from: string,
  to: string,
  amount: string | number,
  token: string
): void {
  validateAddress(from, 'from (sender address)');
  validateAddress(to, 'to (recipient address)');
  validateAmount(amount, 'amount');
  validateToken(token, 'token');

  // Ensure sender and recipient are different
  if (from.toLowerCase() === to.toLowerCase()) {
    throw new ValidationError('Sender and recipient addresses must be different');
  }
}

/**
 * Validates gas sponsorship availability
 */
export function validateGasSponsorship(
  relayerBalance: string,
  estimatedGasPerTx: string
): void {
  try {
    const balance = BigInt(relayerBalance);
    const gasNeeded = BigInt(estimatedGasPerTx);

    if (balance <= gasNeeded) {
      throw new ValidationError(
        `Insufficient gas balance for transaction. Required: ${estimatedGasPerTx} wei, Available: ${relayerBalance} wei`
      );
    }
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }
    throw new ValidationError('Invalid gas balance or gas estimate values');
  }
}

/**
 * Formats a validation error for API response
 */
export function formatValidationError(error: unknown): { error: string; details?: string } {
  if (error instanceof ValidationError) {
    return {
      error: 'Validation failed',
      details: error.message,
    };
  }

  if (error instanceof Error) {
    return {
      error: 'Validation error',
      details: error.message,
    };
  }

  return {
    error: 'Unknown validation error',
  };
}
