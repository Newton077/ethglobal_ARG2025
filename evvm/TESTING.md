# Guía de Pruebas con EVVM

## Configuración Previa

### 1. Configurar Variables de Entorno

Asegúrate de que tu archivo `.env` tenga la configuración correcta para EVVM:

```bash
BLOCKCHAIN_RPC_URL=https://rpc.mate.evvm.dev
BLOCKCHAIN_CHAIN_ID=1337
RELAYER_PRIVATE_KEY=<tu_clave_privada>
MATE_ADDRESS=<dirección_del_token_MATE>
```

**IMPORTANTE:** 
- Necesitas una clave privada válida con fondos en EVVM para pagar el gas
- Necesitas la dirección del contrato del token MATE en EVVM

### 2. Instalar Dependencias

```bash
npm install
# o
bun install
```

## Ejecutar el Programa

### Opción 1: Modo Desarrollo (Recomendado para pruebas)

```bash
npm run dev
```

Esto iniciará el servidor en el puerto 3001 con hot-reload.

### Opción 2: Modo Producción

```bash
npm run build
npm start
```

## Probar la Funcionalidad

### Prueba Automática

Una vez que el servidor esté corriendo, abre otra terminal y ejecuta:

```bash
npx ts-node test-evvm.ts
```

Este script probará automáticamente:
- ✅ Health check del servidor
- ✅ Estadísticas del relayer
- ✅ Generación de códigos QR
- ✅ Parseo de códigos QR
- ✅ Creación de pagos
- ✅ Consulta de estado de pagos
- ✅ Lista de pagos pendientes

### Pruebas Manuales con cURL

#### 1. Health Check
```bash
curl http://localhost:3001/api/health
```

#### 2. Crear un Pago
```bash
curl -X POST http://localhost:3001/api/payments \
  -H "Content-Type: application/json" \
  -d '{
    "from": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "to": "0x1234567890123456789012345678901234567890",
    "amount": "10",
    "token": "MATE",
    "metadata": {
      "description": "Test payment"
    }
  }'
```

#### 3. Consultar Estado de Pago
```bash
curl http://localhost:3001/api/payments/<PAYMENT_ID>
```

#### 4. Generar QR de Pago
```bash
curl -X POST http://localhost:3001/api/qr/generate \
  -H "Content-Type: application/json" \
  -d '{
    "to": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "amount": "10",
    "token": "MATE",
    "description": "Test QR payment"
  }'
```

#### 5. Ver Estadísticas
```bash
curl http://localhost:3001/api/stats
```

## Verificar en EVVM

Para verificar que las transacciones se están procesando correctamente:

1. Revisa los logs del servidor para ver los eventos del Fisher y Relayer
2. Verifica las transacciones en el explorador de bloques de EVVM
3. Comprueba el balance del relayer para asegurarte de que tiene suficiente gas

## Solución de Problemas

### Error: "RELAYER_PRIVATE_KEY must be set"
- Asegúrate de que tu `.env` tiene una clave privada válida

### Error: "Connection refused"
- Verifica que el RPC de EVVM esté accesible: `https://rpc.mate.evvm.dev`
- Comprueba tu conexión a internet

### Error: "Insufficient funds"
- El relayer necesita ETH/MATE para pagar el gas
- Solicita fondos de testnet si es necesario

### Pagos quedan en "pending"
- Verifica que el token MATE_ADDRESS esté correctamente configurado
- Comprueba que el relayer tenga permisos para transferir tokens
- Revisa los logs del servidor para ver errores específicos

## Logs Importantes

El servidor mostrará logs como:
```
[Server] Running on port 3001
[Relayer] Address: 0x...
[Relayer] Started processing payments
[Event] payment_received: <payment-id>
[Event] payment_processing: <payment-id>
[Event] payment_completed: <payment-id>
```

Estos logs te ayudarán a entender el flujo de los pagos.
