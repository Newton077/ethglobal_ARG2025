# 🚀 Inicio Rápido - Despliegue en Sepolia

## Paso 1: Verificar Conexión

Primero, verifica que puedes conectarte a Sepolia:

```bash
npm run check
```

Este comando verificará:
- ✅ Conexión al RPC de Sepolia
- ✅ Configuración del relayer
- ✅ Balance del relayer (necesitas SepoliaETH)
- ✅ Contrato MATE

## Paso 2: Configurar Variables (si es necesario)

Si el paso anterior muestra advertencias, edita el archivo `.env`:

```bash
# Necesitas configurar:
RELAYER_PRIVATE_KEY=<tu_clave_privada_con_fondos_en_sepolia>
MATE_ADDRESS=<dirección_del_contrato_MATE_en_sepolia>
```

**Obtener SepoliaETH:**
- https://sepoliafaucet.com/
- https://www.alchemy.com/faucets/ethereum-sepolia

## Paso 3: Iniciar el Servidor

```bash
npm run dev
```

Deberías ver:
```
[Server] Running on port 3001
[Relayer] Address: 0x...
[Relayer] Started processing payments
```

## Paso 4: Probar la API (en otra terminal)

```bash
npm run test:evvm
```

Este comando ejecutará pruebas automáticas de todos los endpoints.

## 🎯 Resultado Esperado

Si todo funciona correctamente, verás:

```
🧪 Testing EVVM Integration

1️⃣ Testing Health Check...
✅ Health: { status: 'ok', relayerAddress: '0x...', timestamp: ... }

2️⃣ Testing Stats Endpoint...
✅ Stats: { ... }

3️⃣ Testing QR Generation...
✅ QR Generated: evvm://pay?to=...

4️⃣ Testing QR Parsing...
✅ QR Parsed: { to: '...', amount: '10', token: 'MATE' }

5️⃣ Testing Payment Creation...
✅ Payment Created: { success: true, paymentId: '...', status: 'pending' }

6️⃣ Testing Payment Status...
✅ Payment Status: { id: '...', status: 'pending', ... }

7️⃣ Testing Pending Payments List...
✅ Pending Payments: 1 payments

🎉 All tests passed successfully!
```

## 📊 Endpoints Disponibles

Una vez que el servidor esté corriendo, puedes usar:

- `GET /api/health` - Estado del servidor
- `GET /api/stats` - Estadísticas del relayer
- `POST /api/payments` - Crear un pago
- `GET /api/payments/:id` - Consultar un pago
- `GET /api/payments` - Listar pagos pendientes
- `POST /api/qr/generate` - Generar QR de pago
- `POST /api/qr/parse` - Parsear QR de pago

## ⚠️ Notas Importantes

1. El relayer necesita SepoliaETH para pagar el gas
2. El contrato MATE debe estar desplegado en Sepolia
3. El servidor procesa pagos cada 5 segundos por defecto
4. Los pagos se mantienen en memoria (se pierden al reiniciar)
5. Puedes ver las transacciones en: https://sepolia.etherscan.io/

## 🐛 Problemas Comunes

**Error: "Connection refused"**
- Verifica que Sepolia esté accesible: https://ethereum-sepolia-rpc.publicnode.com

**Error: "Insufficient funds"**
- El relayer necesita SepoliaETH para gas
- Obtén fondos de: https://sepoliafaucet.com/

**Pagos quedan en "pending"**
- Verifica la configuración de MATE_ADDRESS
- Revisa los logs del servidor para más detalles
- Comprueba en Etherscan si las transacciones se están enviando
