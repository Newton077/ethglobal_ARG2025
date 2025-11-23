import axios from 'axios';
import { ethers } from 'ethers';

const API_URL = 'http://localhost:3001';

async function testEVVMIntegration() {
  console.log('🧪 Testing EVVM Integration\n');

  try {
    // 1. Health Check
    console.log('1️⃣ Testing Health Check...');
    const healthResponse = await axios.get(`${API_URL}/api/health`);
    console.log('✅ Health:', healthResponse.data);
    console.log('   Relayer Address:', healthResponse.data.relayerAddress);
    console.log('');

    // 2. Get Stats
    console.log('2️⃣ Testing Stats Endpoint...');
    const statsResponse = await axios.get(`${API_URL}/api/stats`);
    console.log('✅ Stats:', JSON.stringify(statsResponse.data, null, 2));
    console.log('');

    // 3. Generate QR Payment
    console.log('3️⃣ Testing QR Generation...');
    const qrResponse = await axios.post(`${API_URL}/api/qr/generate`, {
      to: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      amount: '10',
      token: 'MATE',
      description: 'Test payment'
    });
    console.log('✅ QR Generated:', qrResponse.data.qrData);
    console.log('');

    // 4. Parse QR
    console.log('4️⃣ Testing QR Parsing...');
    const parseResponse = await axios.post(`${API_URL}/api/qr/parse`, {
      qrData: qrResponse.data.qrData
    });
    console.log('✅ QR Parsed:', parseResponse.data);
    console.log('');

    // 5. Create Payment
    console.log('5️⃣ Testing Payment Creation...');
    const wallet = ethers.Wallet.createRandom();
    const paymentResponse = await axios.post(`${API_URL}/api/payments`, {
      from: wallet.address,
      to: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      amount: '5',
      token: 'MATE',
      metadata: {
        description: 'Test payment from EVVM integration test'
      }
    });
    console.log('✅ Payment Created:', paymentResponse.data);
    const paymentId = paymentResponse.data.paymentId;
    console.log('');

    // 6. Get Payment Status
    console.log('6️⃣ Testing Payment Status...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    const statusResponse = await axios.get(`${API_URL}/api/payments/${paymentId}`);
    console.log('✅ Payment Status:', statusResponse.data);
    console.log('');

    // 7. Get All Pending Payments
    console.log('7️⃣ Testing Pending Payments List...');
    const pendingResponse = await axios.get(`${API_URL}/api/payments`);
    console.log('✅ Pending Payments:', pendingResponse.data.length, 'payments');
    console.log('');

    console.log('🎉 All tests passed successfully!');
    console.log('\n📊 Summary:');
    console.log('   - Health check: ✅');
    console.log('   - Stats endpoint: ✅');
    console.log('   - QR generation: ✅');
    console.log('   - QR parsing: ✅');
    console.log('   - Payment creation: ✅');
    console.log('   - Payment status: ✅');
    console.log('   - Pending payments: ✅');

  } catch (error: any) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
    process.exit(1);
  }
}

// Run tests
console.log('Starting EVVM Integration Tests...');
console.log('Make sure the server is running on port 3001\n');

testEVVMIntegration();
