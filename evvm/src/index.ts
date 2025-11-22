import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import Fisher from './fisher';
import Relayer from './relayer';
import QRPaymentGenerator from './qrPayment';
import config from './config';
import { StablecoinPayment } from './types';

const app = express();
app.use(express.json());

// Inicializar Fisher y Relayer
const fisher = new Fisher({
  rpcUrl: config.mate.rpcUrl,
  chainId: config.mate.chainId,
  relayerAddress: config.relayer.address,
  relayerPrivateKey: config.relayer.privateKey,
  stablecoins: config.stablecoins,
});

const relayer = new Relayer(
  fisher,
  config.mate.rpcUrl,
  config.relayer.privateKey,
  config.mate.chainId
);

const qrGenerator = new QRPaymentGenerator('evvm://pay');

// Listeners del Fisher
fisher.on((event) => {
  console.log(`[Event] ${event.type}:`, event.payment.id);
});

// Rutas API

/**
 * POST /api/payments - Crear un nuevo pago
 */
app.post('/api/payments', async (req, res) => {
  try {
    const { from, to, amount, token, metadata } = req.body;

    if (!from || !to || !amount || !token) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const payment: StablecoinPayment = {
      id: uuidv4(),
      from,
      to,
      amount,
      token: token.toUpperCase(),
      status: 'pending',
      timestamp: Date.now(),
      metadata,
    };

    await fisher.receivePayment(payment);

    res.json({
      success: true,
      paymentId: payment.id,
      status: payment.status,
    });
  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(500).json({ error: 'Failed to create payment' });
  }
});

/**
 * GET /api/payments/:id - Obtener estado de un pago
 */
app.get('/api/payments/:id', (req, res) => {
  try {
    const payment = fisher.getPayment(req.params.id);

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    res.json(payment);
  } catch (error) {
    console.error('Error fetching payment:', error);
    res.status(500).json({ error: 'Failed to fetch payment' });
  }
});

/**
 * GET /api/payments - Obtener todos los pagos pendientes
 */
app.get('/api/payments', (req, res) => {
  try {
    const payments = fisher.getPendingPayments();
    res.json(payments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

/**
 * GET /api/stats - Obtener estadísticas
 */
app.get('/api/stats', async (req, res) => {
  try {
    const fisherStats = fisher.getStats();
    const relayerStatus = relayer.getStatus();
    const gasSponsorship = await relayer.getGasSponsorship();

    res.json({
      fisher: fisherStats,
      relayer: relayerStatus,
      gasSponsorship,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

/**
 * POST /api/qr/generate - Generar QR de pago
 */
app.post('/api/qr/generate', (req, res) => {
  try {
    const { to, amount, token, description } = req.body;

    if (!to || !amount || !token) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const qrData = qrGenerator.generatePaymentRequestQR(to, amount, token, description);

    res.json({
      qrData,
      deepLink: qrData,
      description: `Pay ${amount} ${token} to ${to}`,
    });
  } catch (error) {
    console.error('Error generating QR:', error);
    res.status(500).json({ error: 'Failed to generate QR' });
  }
});

/**
 * POST /api/qr/parse - Parsear QR de pago
 */
app.post('/api/qr/parse', (req, res) => {
  try {
    const { qrData } = req.body;

    if (!qrData) {
      return res.status(400).json({ error: 'Missing qrData' });
    }

    const parsed = qrGenerator.parsePaymentQR(qrData);

    if (!parsed) {
      return res.status(400).json({ error: 'Invalid QR data' });
    }

    res.json(parsed);
  } catch (error) {
    console.error('Error parsing QR:', error);
    res.status(500).json({ error: 'Failed to parse QR' });
  }
});

/**
 * GET /api/health - Health check
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    relayerAddress: fisher.getRelayerAddress(),
    timestamp: Date.now(),
  });
});

// Iniciar servidor
const PORT = config.service.port;

app.listen(PORT, async () => {
  console.log(`[Server] Running on port ${PORT}`);
  console.log(`[Relayer] Address: ${fisher.getRelayerAddress()}`);

  // Iniciar procesamiento de pagos
  await relayer.start(5000);
  console.log('[Relayer] Started processing payments');
});

export { app, fisher, relayer };
