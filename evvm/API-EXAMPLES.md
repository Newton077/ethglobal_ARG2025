# 📡 Ejemplos de API

## Health Check

```bash
curl http://localhost:3001/api/health
```

Respuesta:
```json
{
  "status": "ok",
  "relayerAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "timestamp": 1700000000000
}
```

## Estadísticas

```bash
curl http://localhost:3001/api/stats
```

Respuesta:
```json
{
  "fisher": {
    "totalPayments": 5,
    "pendingPayments": 2,
    "completedPayments": 3,
    "failedPayments": 0
  },
  "relayer": {
    "isRunning": true,
    "lastProcessedAt": 1700000000000
  },
  "gasSponsorship": {
    "balance": "1.5",
    "isActive": true
  }
}
```

## Crear Pago

```bash
curl -X POST http://localhost:3001/api/payments \
  -H "Content-Type: application/json" \
  -d '{
    "from": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "to": "0x1234567890123456789012345678901234567890",
    "amount": "10",
    "token": "MATE",
    "metadata": {
      "description": "Pago de prueba",
      "orderId": "ORDER-123"
    }
  }'
```

Respuesta:
```json
{
  "success": true,
  "paymentId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "pending"
}
```

## Consultar Estado de Pago

```bash
curl http://localhost:3001/api/payments/550e8400-e29b-41d4-a716-446655440000
```

Respuesta:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "from": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "to": "0x1234567890123456789012345678901234567890",
  "amount": "10",
  "token": "MATE",
  "status": "completed",
  "timestamp": 1700000000000,
  "txHash": "0xabc123...",
  "metadata": {
    "description": "Pago de prueba",
    "orderId": "ORDER-123"
  }
}
```

## Listar Pagos Pendientes

```bash
curl http://localhost:3001/api/payments
```

Respuesta:
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "from": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "to": "0x1234567890123456789012345678901234567890",
    "amount": "10",
    "token": "MATE",
    "status": "pending",
    "timestamp": 1700000000000
  }
]
```

## Generar QR de Pago

```bash
curl -X POST http://localhost:3001/api/qr/generate \
  -H "Content-Type: application/json" \
  -d '{
    "to": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "amount": "25.50",
    "token": "MATE",
    "description": "Pago por servicio"
  }'
```

Respuesta:
```json
{
  "qrData": "evvm://pay?to=0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb&amount=25.50&token=MATE&description=Pago%20por%20servicio",
  "deepLink": "evvm://pay?to=0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb&amount=25.50&token=MATE&description=Pago%20por%20servicio",
  "description": "Pay 25.50 MATE to 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
}
```

## Parsear QR de Pago

```bash
curl -X POST http://localhost:3001/api/qr/parse \
  -H "Content-Type: application/json" \
  -d '{
    "qrData": "evvm://pay?to=0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb&amount=25.50&token=MATE&description=Pago%20por%20servicio"
  }'
```

Respuesta:
```json
{
  "to": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "amount": "25.50",
  "token": "MATE",
  "description": "Pago por servicio"
}
```

## Errores Comunes

### 400 - Validación Fallida

```json
{
  "error": "Validation failed",
  "details": "Invalid address format for 'to'"
}
```

### 404 - Pago No Encontrado

```json
{
  "error": "Payment not found"
}
```

### 500 - Error del Servidor

```json
{
  "error": "Failed to create payment"
}
```

## Usando PowerShell (Windows)

Si estás en Windows, usa este formato:

```powershell
Invoke-RestMethod -Uri "http://localhost:3001/api/health" -Method Get

Invoke-RestMethod -Uri "http://localhost:3001/api/payments" -Method Post -ContentType "application/json" -Body '{"from":"0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb","to":"0x1234567890123456789012345678901234567890","amount":"10","token":"MATE"}'
```
