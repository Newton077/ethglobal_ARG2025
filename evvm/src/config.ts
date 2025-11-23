import dotenv from 'dotenv';
import { ethers } from 'ethers';

dotenv.config();

// Validar que las variables críticas estén configuradas
const validateConfig = () => {
  const errors: string[] = [];

  if (!process.env.RELAYER_PRIVATE_KEY || process.env.RELAYER_PRIVATE_KEY === '0x0000000000000000000000000000000000000000000000000000000000000001') {
    errors.push('RELAYER_PRIVATE_KEY must be set to a valid private key');
  }

  if (!process.env.MATE_ADDRESS) {
    errors.push('MATE_ADDRESS must be configured');
  }

  if (errors.length > 0) {
    console.warn('[Config] Warnings:', errors.join(', '));
  }
};

// Derivar dirección del relayer desde la clave privada
const deriveRelayerAddress = (): string => {
  try {
    const privateKey = process.env.RELAYER_PRIVATE_KEY || '';
    if (!privateKey) return '';
    const wallet = new ethers.Wallet(privateKey);
    return wallet.address;
  } catch (error) {
    console.error('[Config] Error deriving relayer address:', error);
    return '';
  }
};

export const config = {
  // Red blockchain (EVVM/Sepolia)
  blockchain: {
    rpcUrl: process.env.BLOCKCHAIN_RPC_URL || process.env.EVVM_RPC_URL || 'https://ethereum-sepolia-rpc.publicnode.com',
    chainId: parseInt(process.env.BLOCKCHAIN_CHAIN_ID || process.env.EVVM_CHAIN_ID || '11155111'),
  },
  
  // Configuración del Relayer
  relayer: {
    privateKey: process.env.RELAYER_PRIVATE_KEY || '',
    address: deriveRelayerAddress(),
  },
  
  // Direcciones de tokens
  stablecoins: {
    MATE: process.env.MATE_ADDRESS || '',
  },
  
  // Configuración del servicio
  service: {
    port: parseInt(process.env.PORT || '3001'),
    logLevel: process.env.LOG_LEVEL || 'info',
    relayerBatchSize: parseInt(process.env.RELAYER_BATCH_SIZE || '10'),
    relayerIntervalMs: parseInt(process.env.RELAYER_INTERVAL_MS || '5000'),
    relayerMaxRetries: parseInt(process.env.RELAYER_MAX_RETRIES || '5'),
  },
};

// Validar configuración al cargar
validateConfig();

export default config;
