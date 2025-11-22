export interface StablecoinPayment {
  id: string;
  from: string;
  to: string;
  amount: string;
  token: 'USDC' | 'USDT' | 'DAI';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  txHash?: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

export interface FisherConfig {
  rpcUrl: string;
  chainId: number;
  relayerAddress: string;
  relayerPrivateKey: string;
  stablecoins: {
    [key: string]: string; // token symbol -> contract address
  };
}

export interface RelayerTask {
  paymentId: string;
  payment: StablecoinPayment;
  retries: number;
  maxRetries: number;
  lastError?: string;
}

export interface FisherEvent {
  type: 'payment_received' | 'payment_executed' | 'payment_failed';
  payment: StablecoinPayment;
  timestamp: number;
}
