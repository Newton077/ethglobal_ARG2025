import { ethers } from 'ethers';

export interface GasSponsorship {
  relayerAddress: string;
  balance: string;
  estimatedGasPerTx: string;
  maxTransactionsSupported: number;
}

export class GasSponsor {
  private provider: ethers.Provider;
  private wallet: ethers.Wallet;
  private gasBuffer = ethers.parseEther('0.1'); // Buffer mínimo de gas

  constructor(rpcUrl: string, privateKey: string, chainId: number) {
    this.provider = new ethers.JsonRpcProvider(rpcUrl, chainId);
    this.wallet = new ethers.Wallet(privateKey, this.provider);
  }

  /**
   * Obtiene el balance de ETH del relayer
   */
  async getBalance(): Promise<string> {
    const balance = await this.provider.getBalance(this.wallet.address);
    return ethers.formatEther(balance);
  }

  /**
   * Estima el gas necesario para una transferencia ERC20
   */
  async estimateGasForTransfer(
    tokenAddress: string,
    to: string,
    amount: string
  ): Promise<string> {
    try {
      const erc20Abi = [
        'function transfer(address to, uint256 amount) public returns (bool)',
      ];

      const contract = new ethers.Contract(tokenAddress, erc20Abi, this.wallet);
      const amountBN = ethers.parseUnits(amount, 6);

      const gasEstimate = await contract.transfer.estimateGas(to, amountBN);
      return gasEstimate.toString();
    } catch (error) {
      console.error('Error estimating gas:', error);
      // Retornar estimación por defecto (típicamente 65000 para ERC20 transfer)
      return '65000';
    }
  }

  /**
   * Calcula el costo total del gas en ETH
   */
  async calculateGasCost(gasUnits: string, gasPrice?: string): Promise<string> {
    try {
      let currentGasPrice = gasPrice;
      if (!currentGasPrice) {
        const feeData = await this.provider.getFeeData();
        currentGasPrice = feeData.gasPrice?.toString() || '0';
      }
      const gasCost = BigInt(gasUnits) * BigInt(currentGasPrice);
      return ethers.formatEther(gasCost);
    } catch (error) {
      console.error('Error calculating gas cost:', error);
      return '0';
    }
  }

  /**
   * Verifica si hay suficiente gas para patrocinar una transacción
   */
  async canSponsor(gasUnits: string): Promise<boolean> {
    try {
      const balance = await this.provider.getBalance(this.wallet.address);
      const feeData = await this.provider.getFeeData();
      const gasPrice = feeData.gasPrice || BigInt(0);
      const gasCost = BigInt(gasUnits) * gasPrice;

      // Necesitamos gas cost + buffer mínimo
      return balance > gasCost + this.gasBuffer;
    } catch (error) {
      console.error('Error checking sponsorship:', error);
      return false;
    }
  }

  /**
   * Obtiene información del patrocinio de gas
   */
  async getSponsorship(): Promise<GasSponsorship> {
    const balance = await this.getBalance();
    const feeData = await this.provider.getFeeData();
    const gasPrice = feeData.gasPrice || BigInt(0);
    const estimatedGas = '65000'; // Estimación típica para ERC20 transfer

    const gasCostPerTx = BigInt(estimatedGas) * gasPrice;
    const balanceBN = ethers.parseEther(balance);
    const maxTxs = gasCostPerTx > 0n ? balanceBN / gasCostPerTx : 0n;

    return {
      relayerAddress: this.wallet.address,
      balance,
      estimatedGasPerTx: ethers.formatEther(gasCostPerTx),
      maxTransactionsSupported: Number(maxTxs),
    };
  }

  /**
   * Recarga el balance del relayer (para testing)
   */
  async topUpGas(amountEth: string): Promise<string> {
    console.log(`[GasSponsor] Topping up ${amountEth} ETH to ${this.wallet.address}`);
    console.log('Note: This requires a faucet or manual transfer');
    return this.wallet.address;
  }

  /**
   * Obtiene la dirección del relayer
   */
  getRelayerAddress(): string {
    return this.wallet.address;
  }
}

export default GasSponsor;
