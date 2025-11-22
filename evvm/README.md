# EVVM Fisher/Relayer - Stablecoin Payments

Sistema de procesamiento de pagos con stablecoins usando EVVM Fisher/Relayer en Sepolia con **subsidio de gas**.

## Características

- 🎣 **Fisher**: Recibe y gestiona solicitudes de pago
- 🚀 **Relayer**: Ejecuta transacciones automáticamente
- ⛽ **Gas Sponsorship**: El relayer paga el gas (sin costo para usuarios)
- 📱 **QR Payments**: Genera y parsea QR para pagos
- 💰 **Stablecoins**: Soporta USDC, USDT, DAI

## Setup

```bash
npm install
cp .env.example .env
```

Configura en `.env`:
- `RELAYER_PRIVATE_KEY`: Clave privada del relayer (debe tener ETH para gas)
- `USDC_ADDRESS`, `USDT_ADDRESS`: Direcciones de tokens en Sepolia
- `MATE_RPC_URL`: RPC de MATE o Sepolia

## Uso

```bash
npm run dev      # Desarrollo
npm run build    # Build
npm start        # Producción
```

## API Endpoints

### Pagos

**Crear Pago** (sin gas para usuario)
```bash
POST /api/payments
{
  "from": "0x...",
  "to": "0x...",
  "amount": "100",
  "token": "USDC",
  "metadata": { "orderId": "123" }
}
```

**Consultar Pago**
```bash
GET /api/payments/:id
```

**Pagos Pendientes**
```bash
GET /api/payments
```

### QR Payments

**Generar QR**
```bash
POST /api/qr/generate
{
  "to": "0x...",
  "amount": "100",
  "token": "USDC",
  "description": "Pago por servicio"
}
```

**Parsear QR**
```bash
POST /api/qr/parse
{
  "qrData": "evvm://pay?to=0x...&amount=100&token=USDC"
}
```

### Estadísticas

**Stats (incluye gas disponible)**
```bash
GET /api/stats
```

Respuesta:
```json
{
  "fisher": {
    "totalPayments": 10,
    "pending": 2,
    "processing": 1,
    "completed": 7,
    "failed": 0
  },
  "relayer": {
    "isProcessing": false,
    "queueLength": 0,
    "relayerAddress": "0x..."
  },
  "gasSponsorship": {
    "relayerAddress": "0x...",
    "balance": "0.5",
    "estimatedGasPerTx": "0.001",
    "maxTransactionsSupported": 500
  }
}
```

**Health Check**
```bash
GET /api/health
```

## Flujo de Pago

1. Usuario escanea QR o envía solicitud a `/api/payments`
2. Fisher recibe y registra como "pending"
3. Relayer verifica gas disponible
4. Ejecuta transferencia de stablecoin (relayer paga gas)
5. Marca como "completed" con txHash

## Gas Sponsorship

- El relayer mantiene un balance de ETH
- Verifica gas disponible antes de procesar
- Estima ~65,000 gas por transferencia ERC20
- Soporta múltiples transacciones simultáneas

## Tracks

- 🎣 **Fisher/Relayer**: Captura y ejecuta transacciones en EVVM
- ⚙️ **Custom Service**: Servicio de pagos con stablecoins sin gas
