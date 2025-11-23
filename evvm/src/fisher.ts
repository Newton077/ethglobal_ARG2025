import { ethers } from 'ethers';
import { StablecoinPayment, FisherEvent, FisherConfig } from './types';
import { validatePaymentRequest, ValidationError } from './validation';
import config from './config';

export class Fisher {
  private provider: ethers.Provider;
  private wallet: ethers.Wallet;
  private listeners: ((event: FisherEvent) => void)[] = [];
  private payments: Map<string, StablecoinPayment> = new Map();
  private supportedTokens: Set<string>;

  constructor(cfg: FisherConfig) {
    this.provider = new ethers.JsonRpcProvider(cfg.rpcUrl, cfg.chainId);
    this.wallet = new ethers.Wallet(cfg.relayerPrivateKey, this.provider);
    this.supportedTokens = new Set(Object.keys(cfg.stablecoins));
  }

  /**
   * Registra un listener para eventos del Fisher
   */
  on(callback: (event: FisherEvent) => void): void {
    this.listeners.push(callback);
  }

  /**
   * Emite un evento a todos los listeners
   */
  private emit(event: FisherEvent): void {
    this.listeners.forEach(listener => listener(event));
  }

  /**
   * Recibe una solicitud de pago y la registra
   * Valida todos los parámetros antes de registrar
   */
  async receivePayment(payment: StablecoinPayment): Promise<void> {
    // Validate payment request
    validatePaymentRequest(payment.from, payment.to, payment.amount, payment.token);

    // Validate token is in supported list
    if (!this.supportedTokens.has(payment.token)) {
      throw new ValidationError(
        `Token ${payment.token} not supported. Supported tokens: ${Array.from(this.supportedTokens).join(', ')}`
      );
    }

    payment.status = 'pending';
    payment.timestamp = Date.now();
    
    this.payments.set(payment.id, payment);

    this.emit({
      type: 'payment_received',
      payment,
      timestamp: Date.now(),
    });

    console.log(`[Fisher] Payment received: ${payment.id}`);
  }

  /**
   * Obtiene un pago por ID
   */
  getPayment(id: string): StablecoinPayment | undefined {
    return this.payments.get(id);
  }

  /**
   * Obtiene todos los pagos pendientes
   */
  getPendingPayments(): StablecoinPayment[] {
    return Array.from(this.payments.values()).filter(p => p.status === 'pending');
  }

  /**
   * Marca un pago como procesado
   */
  async markAsProcessing(paymentId: string): Promise<void> {
    const payment = this.payments.get(paymentId);
    if (payment) {
      payment.status = 'processing';
      this.payments.set(paymentId, payment);
    }
  }

  /**
   * Marca un pago como completado
   */
  async markAsCompleted(paymentId: string, txHash: string): Promise<void> {
    const payment = this.payments.get(paymentId);
    if (payment) {
      payment.status = 'completed';
      payment.txHash = txHash;
      this.payments.set(paymentId, payment);

      this.emit({
        type: 'payment_executed',
        payment,
        timestamp: Date.now(),
      });

      console.log(`[Fisher] Payment completed: ${paymentId} - TX: ${txHash}`);
    }
  }

  /**
   * Marca un pago como fallido
   */
  async markAsFailed(paymentId: string, error: string): Promise<void> {
    const payment = this.payments.get(paymentId);
    if (payment) {
      payment.status = 'failed';
      this.payments.set(paymentId, payment);

      this.emit({
        type: 'payment_failed',
        payment,
        timestamp: Date.now(),
      });

      console.log(`[Fisher] Payment failed: ${paymentId} - Error: ${error}`);
    }
  }

  /**
   * Obtiene la dirección del relayer
   */
  getRelayerAddress(): string {
    return this.wallet.address;
  }

  /**
   * Obtiene el balance de stablecoin del relayer
   */
  async getBalance(tokenAddress: string): Promise<string> {
    const erc20Abi = [
      'function balanceOf(address account) public view returns (uint256)',
    ];
    const contract = new ethers.Contract(tokenAddress, erc20Abi, this.provider);
    const balance = await contract.balanceOf(this.wallet.address);
    return balance.toString();
  }

  /**
   * Obtiene estadísticas del Fisher
   */
  getStats() {
    const payments = Array.from(this.payments.values());
    return {
      totalPayments: payments.length,
      pending: payments.filter(p => p.status === 'pending').length,
      processing: payments.filter(p => p.status === 'processing').length,
      completed: payments.filter(p => p.status === 'completed').length,
      failed: payments.filter(p => p.status === 'failed').length,
    };
  }
}

export default Fisher;
