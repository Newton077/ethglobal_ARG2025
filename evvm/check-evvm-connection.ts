import { ethers } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();

async function checkEVVMConnection() {
  console.log('🔍 Verificando conexión con la red blockchain...\n');

  const rpcUrl = process.env.BLOCKCHAIN_RPC_URL || 'https://ethereum-sepolia-rpc.publicnode.com';
  const chainId = parseInt(process.env.BLOCKCHAIN_CHAIN_ID || '11155111');
  const privateKey = process.env.RELAYER_PRIVATE_KEY;
  const mateAddress = process.env.MATE_ADDRESS;

  console.log('📋 Configuración:');
  console.log(`   RPC URL: ${rpcUrl}`);
  console.log(`   Chain ID: ${chainId}`);
  console.log(`   Private Key: ${privateKey ? '✅ Configurada' : '❌ No configurada'}`);
  console.log(`   MATE Address: ${mateAddress || '❌ No configurada'}`);
  console.log('');

  try {
    // Conectar al provider
    console.log('1️⃣ Conectando al RPC...');
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    
    // Verificar conexión
    const network = await provider.getNetwork();
    console.log(`✅ Conectado a la red: ${network.name} (Chain ID: ${network.chainId})`);
    console.log('');

    // Verificar bloque actual
    console.log('2️⃣ Obteniendo bloque actual...');
    const blockNumber = await provider.getBlockNumber();
    console.log(`✅ Bloque actual: ${blockNumber}`);
    console.log('');

    // Verificar wallet del relayer
    if (privateKey && privateKey !== '0x0000000000000000000000000000000000000000000000000000000000000001') {
      console.log('3️⃣ Verificando wallet del relayer...');
      const wallet = new ethers.Wallet(privateKey, provider);
      console.log(`✅ Dirección del relayer: ${wallet.address}`);
      
      const balance = await provider.getBalance(wallet.address);
      console.log(`   Balance: ${ethers.formatEther(balance)} ETH`);
      
      if (balance === 0n) {
        console.log('⚠️  ADVERTENCIA: El relayer no tiene fondos para gas');
      }
      console.log('');
    } else {
      console.log('3️⃣ ⚠️  Private key no configurada o es de ejemplo');
      console.log('');
    }

    // Verificar contrato MATE
    if (mateAddress && mateAddress !== '0x0000000000000000000000000000000000000001') {
      console.log('4️⃣ Verificando contrato MATE...');
      const code = await provider.getCode(mateAddress);
      if (code === '0x') {
        console.log(`❌ No hay contrato en la dirección ${mateAddress}`);
      } else {
        console.log(`✅ Contrato MATE encontrado en ${mateAddress}`);
        console.log(`   Bytecode size: ${code.length} bytes`);
      }
      console.log('');
    } else {
      console.log('4️⃣ ⚠️  MATE_ADDRESS no configurada o es de ejemplo');
      console.log('');
    }

    console.log('✅ Verificación completada exitosamente!');
    console.log('\n📝 Próximos pasos:');
    
    if (!privateKey || privateKey === '0x0000000000000000000000000000000000000000000000000000000000000001') {
      console.log('   1. Configura RELAYER_PRIVATE_KEY en el archivo .env');
      console.log('      - Genera una wallet: npx ethers-cli wallet create');
      console.log('      - Obtén SepoliaETH: https://sepoliafaucet.com/');
    }
    if (!mateAddress || mateAddress === '0x0000000000000000000000000000000000000001') {
      console.log('   2. Configura MATE_ADDRESS en el archivo .env');
      console.log('      - Despliega el contrato MATE en Sepolia');
    }
    console.log('   3. Ejecuta: npm run dev');
    console.log('   4. En otra terminal, ejecuta: npm run test:evvm');
    console.log('\n🔗 Recursos útiles:');
    console.log('   - Sepolia Faucet: https://sepoliafaucet.com/');
    console.log('   - Etherscan Sepolia: https://sepolia.etherscan.io/');

  } catch (error: any) {
    console.error('❌ Error al conectar con la red:', error.message);
    console.error('\n🔧 Posibles soluciones:');
    console.error('   - Verifica que el RPC URL sea correcto');
    console.error('   - Comprueba tu conexión a internet');
    console.error('   - Asegúrate de que Sepolia esté operativo');
    process.exit(1);
  }
}

checkEVVMConnection();
