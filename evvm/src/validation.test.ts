import {
  validateAddress,
  validateAmount,
  validateToken,
  validatePaymentRequest,
  validateGasSponsorship,
} from './validation';

/**
 * Test suite for validation functions
 */

console.log('=== Testing Address Validation ===');

// Test valid lowercase address
try {
  validateAddress('0x742d35cc6634c0532925a3b844bc9e7595f42be', 'test address');
  console.log('✓ Valid lowercase address accepted');
} catch (e) {
  console.log('✗ Valid lowercase address rejected:', (e as Error).message);
}

// Test valid uppercase address
try {
  validateAddress('0x742D35CC6634C0532925A3B844BC9E7595F42BE', 'test address');
  console.log('✓ Valid uppercase address accepted');
} catch (e) {
  console.log('✗ Valid uppercase address rejected:', (e as Error).message);
}

// Test invalid format (too short)
try {
  validateAddress('0x742d35cc6634c0532925a3b844bc9e7595f42', 'test address');
  console.log('✗ Invalid format (too short) was accepted (should have failed)');
} catch (e) {
  console.log('✓ Invalid format (too short) rejected:', (e as Error).message);
}

// Test invalid format
try {
  validateAddress('not-an-address', 'test address');
  console.log('✗ Invalid format was accepted (should have failed)');
} catch (e) {
  console.log('✓ Invalid format rejected:', (e as Error).message);
}

// Test missing address
try {
  validateAddress('', 'test address');
  console.log('✗ Empty address was accepted (should have failed)');
} catch (e) {
  console.log('✓ Empty address rejected:', (e as Error).message);
}

console.log('\n=== Testing Amount Validation ===');

// Test valid amount
try {
  validateAmount('1000000', 'amount');
  console.log('✓ Valid amount accepted');
} catch (e) {
  console.log('✗ Valid amount rejected:', (e as Error).message);
}

// Test valid large amount
try {
  validateAmount('999999999999999999999', 'amount');
  console.log('✓ Valid large amount accepted');
} catch (e) {
  console.log('✗ Valid large amount rejected:', (e as Error).message);
}

// Test zero amount
try {
  validateAmount('0', 'amount');
  console.log('✗ Zero amount was accepted (should have failed)');
} catch (e) {
  console.log('✓ Zero amount rejected:', (e as Error).message);
}

// Test negative amount
try {
  validateAmount('-100', 'amount');
  console.log('✗ Negative amount was accepted (should have failed)');
} catch (e) {
  console.log('✓ Negative amount rejected:', (e as Error).message);
}

// Test decimal amount
try {
  validateAmount('100.50', 'amount');
  console.log('✗ Decimal amount was accepted (should have failed)');
} catch (e) {
  console.log('✓ Decimal amount rejected:', (e as Error).message);
}

// Test non-numeric amount
try {
  validateAmount('abc', 'amount');
  console.log('✗ Non-numeric amount was accepted (should have failed)');
} catch (e) {
  console.log('✓ Non-numeric amount rejected:', (e as Error).message);
}

// Test missing amount
try {
  validateAmount('', 'amount');
  console.log('✗ Empty amount was accepted (should have failed)');
} catch (e) {
  console.log('✓ Empty amount rejected:', (e as Error).message);
}

console.log('\n=== Testing Token Validation ===');

// Test valid tokens
['USDC', 'USDT', 'DAI'].forEach(token => {
  try {
    validateToken(token, 'token');
    console.log(`✓ Token ${token} accepted`);
  } catch (e) {
    console.log(`✗ Token ${token} rejected:`, (e as Error).message);
  }
});

// Test lowercase tokens (should be accepted)
['usdc', 'usdt', 'dai'].forEach(token => {
  try {
    validateToken(token, 'token');
    console.log(`✓ Lowercase token ${token} accepted`);
  } catch (e) {
    console.log(`✗ Lowercase token ${token} rejected:`, (e as Error).message);
  }
});

// Test invalid token
try {
  validateToken('INVALID', 'token');
  console.log('✗ Invalid token was accepted (should have failed)');
} catch (e) {
  console.log('✓ Invalid token rejected:', (e as Error).message);
}

// Test missing token
try {
  validateToken('', 'token');
  console.log('✗ Empty token was accepted (should have failed)');
} catch (e) {
  console.log('✓ Empty token rejected:', (e as Error).message);
}

console.log('\n=== Testing Payment Request Validation ===');

const validAddress1 = '0x742d35cc6634c0532925a3b844bc9e7595f42be';
const validAddress2 = '0x8ba1f109551bd432803012645ac136ddd64dba72';

// Test valid payment request
try {
  validatePaymentRequest(validAddress1, validAddress2, '1000000', 'USDC');
  console.log('✓ Valid payment request accepted');
} catch (e) {
  console.log('✗ Valid payment request rejected:', (e as Error).message);
}

// Test same sender and recipient
try {
  validatePaymentRequest(validAddress1, validAddress1, '1000000', 'USDC');
  console.log('✗ Same sender/recipient was accepted (should have failed)');
} catch (e) {
  console.log('✓ Same sender/recipient rejected:', (e as Error).message);
}

// Test invalid sender address
try {
  validatePaymentRequest('invalid', validAddress2, '1000000', 'USDC');
  console.log('✗ Invalid sender was accepted (should have failed)');
} catch (e) {
  console.log('✓ Invalid sender rejected:', (e as Error).message);
}

// Test invalid recipient address
try {
  validatePaymentRequest(validAddress1, 'invalid', '1000000', 'USDC');
  console.log('✗ Invalid recipient was accepted (should have failed)');
} catch (e) {
  console.log('✓ Invalid recipient rejected:', (e as Error).message);
}

// Test invalid amount
try {
  validatePaymentRequest(validAddress1, validAddress2, '0', 'USDC');
  console.log('✗ Zero amount was accepted (should have failed)');
} catch (e) {
  console.log('✓ Zero amount rejected:', (e as Error).message);
}

// Test invalid token
try {
  validatePaymentRequest(validAddress1, validAddress2, '1000000', 'INVALID');
  console.log('✗ Invalid token was accepted (should have failed)');
} catch (e) {
  console.log('✓ Invalid token rejected:', (e as Error).message);
}

console.log('\n=== Testing Gas Sponsorship Validation ===');

// Test sufficient gas
try {
  validateGasSponsorship('1000000000000000000', '100000000000000');
  console.log('✓ Sufficient gas accepted');
} catch (e) {
  console.log('✗ Sufficient gas rejected:', (e as Error).message);
}

// Test insufficient gas
try {
  validateGasSponsorship('100000000000000', '1000000000000000000');
  console.log('✗ Insufficient gas was accepted (should have failed)');
} catch (e) {
  console.log('✓ Insufficient gas rejected:', (e as Error).message);
}

// Test exact gas amount (should fail - needs to be strictly greater)
try {
  validateGasSponsorship('1000000000000000000', '1000000000000000000');
  console.log('✗ Exact gas amount was accepted (should have failed - needs to be greater)');
} catch (e) {
  console.log('✓ Exact gas amount rejected:', (e as Error).message);
}

console.log('\n=== All validation tests completed ===');
