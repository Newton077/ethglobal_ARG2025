'use client';

import React, { useState, useCallback, memo } from 'react';
import { 
  PaymentFormData, 
  isValidEthereumAddress, 
  isPositiveNumber,
  SUPPORTED_TOKENS,
  SupportedToken 
} from '../lib/types';
import { cn, debounce, isEmpty } from '../lib/utils';

interface PaymentFormProps {
  onSubmit?: (data: PaymentFormData) => void;
  isLoading?: boolean;
  error?: string;
  className?: string;
}

interface FormErrors {
  from?: string;
  to?: string;
  amount?: string;
  token?: string;
  description?: string;
}

interface FormTouched {
  from?: boolean;
  to?: boolean;
  amount?: boolean;
  token?: boolean;
  description?: boolean;
}

const PaymentForm = memo(function PaymentForm({
  onSubmit,
  isLoading = false,
  error,
  className,
}: PaymentFormProps) {
  // Form state
  const [formData, setFormData] = useState<PaymentFormData>({
    from: '',
    to: '',
    amount: '',
    token: 'MATE',
    description: '',
  });

  // Validation state
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<FormTouched>({});

  // Real-time validation functions
  const validateFrom = useCallback((value: string): string | undefined => {
    if (isEmpty(value)) {
      return 'From address is required';
    }
    if (!isValidEthereumAddress(value)) {
      return 'Please enter a valid Ethereum address (0x followed by 40 hex characters)';
    }
    return undefined;
  }, []);

  const validateTo = useCallback((value: string): string | undefined => {
    if (isEmpty(value)) {
      return 'Recipient address is required';
    }
    if (!isValidEthereumAddress(value)) {
      return 'Please enter a valid Ethereum address (0x followed by 40 hex characters)';
    }
    return undefined;
  }, []);

  const validateAmount = useCallback((value: string): string | undefined => {
    if (isEmpty(value)) {
      return 'Amount is required';
    }
    if (!isPositiveNumber(value)) {
      return 'Please enter a valid positive number';
    }
    const num = parseFloat(value);
    if (num <= 0) {
      return 'Amount must be greater than 0';
    }
    if (num > 1000000) {
      return 'Amount is too large (maximum: 1,000,000)';
    }
    return undefined;
  }, []);

  const validateToken = useCallback((value: string): string | undefined => {
    if (isEmpty(value)) {
      return 'Token is required';
    }
    if (!SUPPORTED_TOKENS.includes(value as SupportedToken)) {
      return 'Please select a supported token';
    }
    return undefined;
  }, []);

  // Debounced validation to avoid excessive validation calls
  const debouncedValidation = useCallback(
    debounce((field: keyof PaymentFormData, value: string) => {
      let error: string | undefined;

      switch (field) {
        case 'from':
          error = validateFrom(value);
          break;
        case 'to':
          error = validateTo(value);
          break;
        case 'amount':
          error = validateAmount(value);
          break;
        case 'token':
          error = validateToken(value);
          break;
        case 'description':
          // Description is optional, no validation needed
          error = undefined;
          break;
      }

      setErrors(prev => {
        const newErrors = { ...prev };
        if (error) {
          newErrors[field] = error;
        } else {
          delete newErrors[field];
        }
        return newErrors;
      });
    }, 300),
    [validateFrom, validateTo, validateAmount, validateToken]
  );

  // Handle input changes
  const handleInputChange = (field: keyof PaymentFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Mark field as touched
    setTouched(prev => ({
      ...prev,
      [field]: true,
    }));

    // Trigger debounced validation
    debouncedValidation(field, value);
  };

  // Handle input blur (for immediate validation feedback)
  const handleInputBlur = (field: keyof PaymentFormData) => {
    setTouched(prev => ({
      ...prev,
      [field]: true,
    }));

    // Immediate validation on blur
    const value = formData[field] || '';
    let error: string | undefined;

    switch (field) {
      case 'from':
        error = validateFrom(value);
        break;
      case 'to':
        error = validateTo(value);
        break;
      case 'amount':
        error = validateAmount(value);
        break;
      case 'token':
        error = validateToken(value);
        break;
      case 'description':
        // Description is optional, no validation needed
        error = undefined;
        break;
    }

    setErrors(prev => {
      const newErrors = { ...prev };
      if (error) {
        newErrors[field] = error;
      } else {
        delete newErrors[field];
      }
      return newErrors;
    });
  };

  // Validate entire form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    const fromError = validateFrom(formData.from);
    const toError = validateTo(formData.to);
    const amountError = validateAmount(formData.amount);
    const tokenError = validateToken(formData.token);
    
    if (fromError) newErrors.from = fromError;
    if (toError) newErrors.to = toError;
    if (amountError) newErrors.amount = amountError;
    if (tokenError) newErrors.token = tokenError;

    setErrors(newErrors);
    setTouched({
      from: true,
      to: true,
      amount: true,
      token: true,
      description: true,
    });

    return !Object.values(newErrors).some(error => error !== undefined);
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    onSubmit?.(formData);
  };

  // Check if form is valid
  const isFormValid = !Object.values(errors).some(error => error !== undefined) &&
    !isEmpty(formData.from) &&
    !isEmpty(formData.to) &&
    !isEmpty(formData.amount) &&
    !isEmpty(formData.token);

  return (
    <div className={cn('w-full max-w-md mx-auto', className)}>
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-xl font-bold text-black mb-6">ScanGo Payment</h2>

        {/* Global error message */}
        {error && (
          <div className="mb-4 p-3 border border-gray-300 bg-gray-50 rounded">
            <p className="text-sm text-gray-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* From Address Field */}
          <div>
            <label htmlFor="from" className="block text-sm font-medium text-black mb-1">
              From Address *
            </label>
            <input
              id="from"
              type="text"
              value={formData.from}
              onChange={(e) => handleInputChange('from', e.target.value)}
              onBlur={() => handleInputBlur('from')}
              placeholder="0x..."
              className={cn(
                'w-full px-3 py-2 border rounded text-sm font-mono',
                'focus:outline-none focus:ring-1 focus:ring-black focus:border-black',
                'transition-colors',
                errors.from && touched.from
                  ? 'border-gray-400 bg-gray-50'
                  : 'border-gray-300 bg-white hover:border-gray-400'
              )}
              disabled={isLoading}
            />
            {errors.from && touched.from && (
              <p className="mt-1 text-xs text-gray-600">{errors.from}</p>
            )}
          </div>

          {/* To Address Field */}
          <div>
            <label htmlFor="to" className="block text-sm font-medium text-black mb-1">
              Recipient Address *
            </label>
            <input
              id="to"
              type="text"
              value={formData.to}
              onChange={(e) => handleInputChange('to', e.target.value)}
              onBlur={() => handleInputBlur('to')}
              placeholder="0x..."
              className={cn(
                'w-full px-3 py-2 border rounded text-sm font-mono',
                'focus:outline-none focus:ring-1 focus:ring-black focus:border-black',
                'transition-colors',
                errors.to && touched.to
                  ? 'border-gray-400 bg-gray-50'
                  : 'border-gray-300 bg-white hover:border-gray-400'
              )}
              disabled={isLoading}
            />
            {errors.to && touched.to && (
              <p className="mt-1 text-xs text-gray-600">{errors.to}</p>
            )}
          </div>

          {/* Amount Field */}
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-black mb-1">
              Amount *
            </label>
            <input
              id="amount"
              type="number"
              step="0.000001"
              min="0"
              value={formData.amount}
              onChange={(e) => handleInputChange('amount', e.target.value)}
              onBlur={() => handleInputBlur('amount')}
              placeholder="0.00"
              className={cn(
                'w-full px-3 py-2 border rounded text-sm',
                'focus:outline-none focus:ring-1 focus:ring-black focus:border-black',
                'transition-colors',
                errors.amount && touched.amount
                  ? 'border-gray-400 bg-gray-50'
                  : 'border-gray-300 bg-white hover:border-gray-400'
              )}
              disabled={isLoading}
            />
            {errors.amount && touched.amount && (
              <p className="mt-1 text-xs text-gray-600">{errors.amount}</p>
            )}
          </div>

          {/* Token Field */}
          <div>
            <label htmlFor="token" className="block text-sm font-medium text-black mb-1">
              Token *
            </label>
            <select
              id="token"
              value={formData.token}
              onChange={(e) => handleInputChange('token', e.target.value)}
              onBlur={() => handleInputBlur('token')}
              className={cn(
                'w-full px-3 py-2 border rounded text-sm',
                'focus:outline-none focus:ring-1 focus:ring-black focus:border-black',
                'transition-colors',
                errors.token && touched.token
                  ? 'border-gray-400 bg-gray-50'
                  : 'border-gray-300 bg-white hover:border-gray-400'
              )}
              disabled={isLoading}
            >
              {SUPPORTED_TOKENS.map((token) => (
                <option key={token} value={token}>
                  {token}
                </option>
              ))}
            </select>
            {errors.token && touched.token && (
              <p className="mt-1 text-xs text-gray-600">{errors.token}</p>
            )}
          </div>

          {/* Description Field (Optional) */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-black mb-1">
              Description (Optional)
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Payment description..."
              rows={3}
              className={cn(
                'w-full px-3 py-2 border rounded text-sm resize-none',
                'focus:outline-none focus:ring-1 focus:ring-black focus:border-black',
                'transition-colors',
                'border-gray-300 bg-white hover:border-gray-400'
              )}
              disabled={isLoading}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!isFormValid || isLoading}
            className={cn(
              'w-full py-2 px-4 border rounded text-sm font-medium',
              'transition-colors focus:outline-none focus:ring-1 focus:ring-black',
              isFormValid && !isLoading
                ? 'bg-black text-white border-black hover:bg-gray-800'
                : 'bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed'
            )}
          >
            {isLoading ? 'Creating Payment...' : 'Create Payment'}
          </button>
        </form>

        {/* Form Status */}
        <div className="mt-4 text-xs text-gray-500">
          <p>* Required fields</p>
          {!isFormValid && Object.keys(touched).length > 0 && (
            <p className="mt-1">Please fix the errors above to continue.</p>
          )}
        </div>
      </div>
    </div>
  );
});

export default PaymentForm;