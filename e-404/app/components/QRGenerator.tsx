'use client';

import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { QRFormData, QRResponse, isValidEthereumAddress, isPositiveNumber, SUPPORTED_TOKENS } from '../lib/types';
import { generateQR, formatAPIError } from '../lib/api';
import { cn } from '../lib/utils';

interface QRGeneratorProps {
  className?: string;
}

export default function QRGenerator({ className }: QRGeneratorProps) {
  const [formData, setFormData] = useState<QRFormData>({
    to: '',
    amount: '',
    token: 'MATE',
    description: '',
  });

  const [qrResponse, setQrResponse] = useState<QRResponse | null>(null);
  const [qrImageUrl, setQrImageUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [copySuccess, setCopySuccess] = useState(false);

  // Form validation
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Validate recipient address
    if (!formData.to.trim()) {
      errors.to = 'Recipient address is required';
    } else if (!isValidEthereumAddress(formData.to)) {
      errors.to = 'Please enter a valid Ethereum address (0x...)';
    }

    // Validate amount
    if (!formData.amount.trim()) {
      errors.amount = 'Amount is required';
    } else if (!isPositiveNumber(formData.amount)) {
      errors.amount = 'Please enter a valid positive number';
    }

    // Validate token
    if (!formData.token) {
      errors.token = 'Token selection is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle input changes
  const handleInputChange = (field: keyof QRFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
    
    // Clear general error
    if (error) {
      setError('');
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError('');
    setQrResponse(null);

    try {
      const response = await generateQR(formData);
      
      if (response.success && response.data) {
        setQrResponse(response.data);
        // Generate QR code image from the response data
        await generateQRImage(response.data.qrData);
      } else if (response.error) {
        setError(formatAPIError(response.error));
      }
    } catch (err) {
      setError('An unexpected error occurred while generating QR code');
    } finally {
      setIsLoading(false);
    }
  };

  // Generate QR code image
  const generateQRImage = async (qrData: string) => {
    try {
      const qrImageDataUrl = await QRCode.toDataURL(qrData, {
        color: {
          dark: '#000000',  // Black
          light: '#FFFFFF'  // White
        },
        margin: 2,
        width: 256,
        errorCorrectionLevel: 'M'
      });
      setQrImageUrl(qrImageDataUrl);
    } catch (err) {
      console.error('Failed to generate QR image:', err);
      setError('Failed to generate QR code image');
    }
  };

  // Copy QR data to clipboard
  const handleCopyQRData = async () => {
    if (!qrResponse?.qrData) return;

    try {
      await navigator.clipboard.writeText(qrResponse.qrData);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = qrResponse.qrData;
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

  // Reset form and results
  const handleReset = () => {
    setFormData({
      to: '',
      amount: '',
      token: 'MATE',
      description: '',
    });
    setQrResponse(null);
    setQrImageUrl('');
    setError('');
    setValidationErrors({});
    setCopySuccess(false);
  };

  return (
    <div className={cn('space-y-6', className)}>
      <div>
        <h2 className="text-xl font-medium text-black mb-2">Generate QR Code</h2>
        <p className="text-gray-600 text-sm">
          Create a QR code for payment requests that others can scan to process payments.
        </p>
      </div>

      {/* QR Generation Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Recipient Address Field */}
        <div>
          <label htmlFor="qr-to" className="block text-sm font-medium text-gray-900 mb-1">
            Recipient Address *
          </label>
          <input
            id="qr-to"
            type="text"
            value={formData.to}
            onChange={(e) => handleInputChange('to', e.target.value)}
            placeholder="0x..."
            className={cn(
              'w-full px-3 py-2 border rounded-md text-sm',
              'focus:outline-none focus:ring-2 focus:ring-black focus:border-black',
              'font-mono',
              validationErrors.to
                ? 'border-red-500 bg-red-50'
                : 'border-gray-300 bg-white'
            )}
            disabled={isLoading}
          />
          {validationErrors.to && (
            <p className="mt-1 text-xs text-red-600">{validationErrors.to}</p>
          )}
        </div>

        {/* Amount Field */}
        <div>
          <label htmlFor="qr-amount" className="block text-sm font-medium text-gray-900 mb-1">
            Amount *
          </label>
          <input
            id="qr-amount"
            type="text"
            value={formData.amount}
            onChange={(e) => handleInputChange('amount', e.target.value)}
            placeholder="0.00"
            className={cn(
              'w-full px-3 py-2 border rounded-md text-sm',
              'focus:outline-none focus:ring-2 focus:ring-black focus:border-black',
              validationErrors.amount
                ? 'border-red-500 bg-red-50'
                : 'border-gray-300 bg-white'
            )}
            disabled={isLoading}
          />
          {validationErrors.amount && (
            <p className="mt-1 text-xs text-red-600">{validationErrors.amount}</p>
          )}
        </div>

        {/* Token Selection */}
        <div>
          <label htmlFor="qr-token" className="block text-sm font-medium text-gray-900 mb-1">
            Token *
          </label>
          <select
            id="qr-token"
            value={formData.token}
            onChange={(e) => handleInputChange('token', e.target.value)}
            className={cn(
              'w-full px-3 py-2 border rounded-md text-sm',
              'focus:outline-none focus:ring-2 focus:ring-black focus:border-black',
              'bg-white',
              validationErrors.token
                ? 'border-red-500'
                : 'border-gray-300'
            )}
            disabled={isLoading}
          >
            {SUPPORTED_TOKENS.map((token) => (
              <option key={token} value={token}>
                {token}
              </option>
            ))}
          </select>
          {validationErrors.token && (
            <p className="mt-1 text-xs text-red-600">{validationErrors.token}</p>
          )}
        </div>

        {/* Description Field */}
        <div>
          <label htmlFor="qr-description" className="block text-sm font-medium text-gray-900 mb-1">
            Description (Optional)
          </label>
          <textarea
            id="qr-description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Payment description..."
            rows={3}
            className={cn(
              'w-full px-3 py-2 border border-gray-300 rounded-md text-sm',
              'focus:outline-none focus:ring-2 focus:ring-black focus:border-black',
              'bg-white resize-vertical'
            )}
            disabled={isLoading}
          />
        </div>

        {/* Form Actions */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-md border',
              'focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2',
              'transition-colors',
              isLoading
                ? 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed'
                : 'bg-black text-white border-black hover:bg-gray-800'
            )}
          >
            {isLoading ? 'Generating...' : 'Generate QR Code'}
          </button>
          
          <button
            type="button"
            onClick={handleReset}
            disabled={isLoading}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-md border',
              'bg-white text-gray-700 border-gray-300',
              'hover:bg-gray-50 hover:border-gray-400',
              'focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2',
              'transition-colors',
              isLoading && 'opacity-50 cursor-not-allowed'
            )}
          >
            Reset
          </button>
        </div>
      </form>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">QR Generation Failed</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Display */}
      {qrResponse && (
        <div className="space-y-4">
          <div className="border border-gray-200 rounded-lg p-6 bg-white">
            <h3 className="text-lg font-medium text-black mb-4">Generated QR Code</h3>
            
            {/* QR Code Image */}
            <div className="flex justify-center mb-6">
              {qrImageUrl ? (
                <div className="p-4 bg-white border-2 border-gray-300 rounded-lg">
                  <img
                    src={qrImageUrl}
                    alt="Payment QR Code"
                    className="block"
                    style={{ imageRendering: 'pixelated' }}
                  />
                </div>
              ) : (
                <div className="w-64 h-64 bg-gray-100 border-2 border-gray-300 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-2"></div>
                    <p className="text-sm text-gray-500">Generating QR...</p>
                  </div>
                </div>
              )}
            </div>

            {/* Payment Details */}
            <div className="bg-gray-50 border border-gray-200 rounded-md p-4 mb-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Payment Details</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Recipient:</span>
                  <span className="font-mono text-black">{formData.to}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="text-black">{formData.amount} {formData.token}</span>
                </div>
                {formData.description && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Description:</span>
                    <span className="text-black">{formData.description}</span>
                  </div>
                )}
              </div>
            </div>

            {/* QR Data String */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-900">QR Data String</label>
                <button
                  onClick={handleCopyQRData}
                  className={cn(
                    'px-3 py-1 text-xs font-medium rounded border transition-colors',
                    'focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2',
                    copySuccess
                      ? 'bg-green-50 border-green-200 text-green-700'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  )}
                >
                  {copySuccess ? (
                    <>
                      <svg className="w-3 h-3 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Copied!
                    </>
                  ) : (
                    <>
                      <svg className="w-3 h-3 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copy
                    </>
                  )}
                </button>
              </div>
              <div className="bg-gray-100 border border-gray-300 rounded-md p-3">
                <code className="text-xs font-mono text-black break-all">
                  {qrResponse.qrData}
                </code>
              </div>
            </div>

            {/* Deep Link (if available) */}
            {qrResponse.deepLink && (
              <div className="space-y-2 mt-4">
                <label className="text-sm font-medium text-gray-900">Deep Link</label>
                <div className="bg-gray-100 border border-gray-300 rounded-md p-3">
                  <code className="text-xs font-mono text-black break-all">
                    {qrResponse.deepLink}
                  </code>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}