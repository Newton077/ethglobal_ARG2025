import { StablecoinPayment } from './types';

/**
 * Genera un payload para QR de pago
 * Formato: evvm://pay?id=UUID&to=ADDRESS&amount=AMOUNT&token=USDC
 */
export class QRPaymentGenerator {
  private baseUrl: string;

  constructor(baseUrl: string = 'evvm://pay') {
    this.baseUrl = baseUrl;
  }

  /**
   * Genera URL para QR de pago
   */
  generatePaymentQR(payment: StablecoinPayment): string {
    const params = new URLSearchParams({
      id: payment.id,
      to: payment.to,
      amount: payment.amount,
      token: payment.token,
      from: payment.from,
    });

    return `${this.baseUrl}?${params.toString()}`;
  }

  /**
   * Genera URL para QR de solicitud de pago
   */
  generatePaymentRequestQR(
    to: string,
    amount: string,
    token: string,
    description?: string
  ): string {
    const params = new URLSearchParams({
      to,
      amount,
      token,
    });

    if (description) {
      params.append('description', description);
    }

    return `${this.baseUrl}?${params.toString()}`;
  }

  /**
   * Parsea un QR de pago
   */
  parsePaymentQR(qrData: string): Partial<StablecoinPayment> | null {
    try {
      const url = new URL(qrData);
      const params = url.searchParams;

      return {
        id: params.get('id') || undefined,
        to: params.get('to') || '',
        amount: params.get('amount') || '',
        token: (params.get('token') || 'USDC') as 'USDC' | 'USDT' | 'DAI',
        from: params.get('from') || '',
      };
    } catch (error) {
      console.error('Error parsing QR:', error);
      return null;
    }
  }

  /**
   * Genera un código QR en formato de imagen (requiere librería externa)
   * Para usar: npm install qrcode
   */
  async generateQRImage(paymentData: string): Promise<string> {
    // Esta función requiere la librería 'qrcode'
    // Retorna un data URL de imagen PNG
    console.log('[QR] To generate QR images, install: npm install qrcode');
    return paymentData;
  }
}

export default QRPaymentGenerator;
