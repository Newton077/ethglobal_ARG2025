import dotenv from 'dotenv';

dotenv.config();

export const config = {
  evvm: {
    rpcUrl: process.env.EVVM_RPC_URL || 'https://sepolia.infura.io/v3/YOUR_KEY',
    chainId: parseInt(process.env.EVVM_CHAIN_ID || '11155111'),
  },
  mate: {
    rpcUrl: process.env.MATE_RPC_URL || 'https://rpc.mate.evvm.dev',
    chainId: parseInt(process.env.MATE_CHAIN_ID || '1337'),
  },
  relayer: {
    privateKey: process.env.RELAYER_PRIVATE_KEY || '',
    address: '', // Will be derived from private key
  },
  stablecoins: {
    USDC: process.env.USDC_ADDRESS || '',
    USDT: process.env.USDT_ADDRESS || '',
    DAI: process.env.DAI_ADDRESS || '',
  },
  service: {
    port: parseInt(process.env.PORT || '3000'),
    logLevel: process.env.LOG_LEVEL || 'info',
  },
};

export default config;
