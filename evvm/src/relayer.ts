import { ethers } from 'ethers';
import { StablecoinPayment, RelayerTask } from './types';
import Fisher from './fisher';
import GasSponsor from './gasSponsorship';

export class Relayer {
  private fisher: Fisher;
  private provider: ethers.Provider;
  private wallet: ethers.Wallet;
  private gasSponsor: GasSponsor;
  private taskQueue: RelayerTask[] = [];
  private isProcessing = false;
  private maxRetries = 3;

  constructor(fisher: Fisher, rpcUrl: string, privateKey: string, chainId: number) {
    this.fisher = fisher;
    this.provider = new ethers.JsonRpcProvider(rpcUrl, chainId);
    this.wallet = new ethers.Wallet(privateKey, this.provider);
    this.gasSponsor = new GasSponsor(rpcUrl, privateKey, chainId);
  }

  /**
   * Inicia el procesamiento de pagos
   */
  async start(intervalMs: number = 5000): Promise<void> {
    console.log('[Relayer] Starting...');
    
    setInterval(async () => {
      if (!this.isProcessing) {
        await this.processPendingPayments();
      }
    }, intervalMs);
  }

  /**
   * Procesa todos los pagos pendientes
   */
  private async processPendingPayments(): Promise<void> {
    this.isProcessing = true;

    try {
      const pendingPayments = this.fisher.getPendingPayments();

      for (const payment of pendingPayments) {
        await this.processPayment(payment);
      }
    } catch (error) {
      console.error('[Relayer] Error processing payments:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Procesa un pago individual
   */
  private async processPayment(payment: StablecoinPayment): Promise<void> {
    try {
      await this.fisher.markAsProcessing(payment.id);

      // Verificar si hay gas disponible para patrocinar
      const canSponsor = await this.gasSponsor.canSponsor('100000');
      if (!canSponsor) {
        throw new Error('Insufficient gas to sponsor transaction');
      }

      // Ejecutar la transacción de stablecoin
      const txHash = await this.executeStablecoinTransfer(payment);

      await this.fisher.markAsCompleted(payment.id, txHash);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error(`[Relayer] Error processing payment ${payment.id}:`, errorMsg);
      await this.fisher.markAsFailed(payment.id, errorMsg);
    }
  }

  /**
   * Ejecuta una transferencia de stablecoin
   */
  private async executeStablecoinTransfer(payment: StablecoinPayment): Promise<string> {
    const erc20Abi = [
      'function transfer(address to, uint256 amount) public returns (bool)',
      'function approve(address spender, uint256 amount) public returns (bool)',
    ];

    // Obtener dirección del token
    const tokenAddress = this.getTokenAddress(payment.token);
    if (!tokenAddress) {
      throw new Error(`Token ${payment.token} not configured`);
    }

    const contract = new ethers.Contract(tokenAddress, erc20Abi, this.wallet);

    // Convertir amount a unidades del token (asumiendo 6 decimales para USDC/USDT)
    const amount = ethers.parseUnits(payment.amount, 6);

    console.log(`[Relayer] Executing transfer: ${payment.amount} ${payment.token} to ${payment.to}`);

    // Ejecutar transferencia
    const tx = await contract.transfer(payment.to, amount);
    const receipt = await tx.wait();

    if (!receipt) {
      throw new Error('Transaction failed - no receipt');
    }

    return receipt.hash;
  }

  /**
   * Obtiene la dirección del token
   */
  private getTokenAddress(token: string): string | null {
    const addresses: Record<string, string> = {
      USDC: process.env.USDC_ADDRESS || '',
      USDT: process.env.USDT_ADDRESS || '',
      DAI: process.env.DAI_ADDRESS || '',
    };
    return addresses[token] || null;
  }

  /**
   * Obtiene el estado del relayer
   */
  getStatus() {
    return {
      isProcessing: this.isProcessing,
      queueLength: this.taskQueue.length,
      relayerAddress: this.wallet.address,
    };
  }

  /**
   * Obtiene información del patrocinio de gas
   */
  async getGasSponsorship() {
    return await this.gasSponsor.getSponsorship();
  }
}

export default Relayer;
