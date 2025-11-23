# EVVM Fisher/Relayer - Sistema de Pagos con Stablecoins

Sistema de procesamiento de pagos con stablecoins usando el patrón Fisher/Relayer para Ethereum Sepolia.

## 🎯 Características

- ✅ API REST para gestión de pagos
- ✅ Procesamiento automático de transacciones (Relayer)
- ✅ Gestión de cola de pagos (Fisher)
- ✅ Generación y parseo de códigos QR para pagos
- ✅ Soporte para token MATE
- ✅ Estadísticas en tiempo real
- ✅ Validación completa de datos

## 🚀 Inicio Rápido

### 1. Instalar Dependencias

```bash
npm install
```

### 2. Configurar Variables de Entorno

Copia el archivo `.env.example` a `.env` y configura:

```bash
# Red Blockchain
BLOCKCHAIN_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
BLOCKCHAIN_CHAIN_ID=11155111

# Relayer (necesita SepoliaETH para gas)
RELAYER_PRIVATE_KEY=tu_clave_privada

# Token MATE en Sepolia
MATE_ADDRESS=dirección_del_contrato_MATE
```

### 3. Verificar Conexión

```bash
npm run check
```

### 4. Iniciar el Servidor

```bash
npm run dev
```

### 5. Probar la API

En otra terminal:

```bash
npm run test:evvm
```

## 📚 Documentación

- [QUICKSTART.md](QUICKSTART.md) - Guía de inicio rápido
- [TESTING.md](TESTING.md) - Guía completa de pruebas
- [API-EXAMPLES.md](API-EXAMPLES.md) - Ejemplos de uso de la API

## 🔌 Endpoints de la API

### Gestión de Pagos

- `POST /api/payments` - Crear un nuevo pago
- `GET /api/payments/:id` - Consultar estado de un pago
- `GET /api/payments` - Listar pagos pendientes

### Códigos QR

- `POST /api/qr/generate` - Generar QR de pago
- `POST /api/qr/parse` - Parsear QR de pago

### Información

- `GET /api/health` - Estado del servidor
- `GET /api/stats` - Estadísticas del relayer

## 🏗️ Arquitectura

```
┌─────────────┐
│   Cliente   │
└──────┬──────┘
       │ HTTP Request
       ▼
┌─────────────┐
│  API REST   │
└──────┬──────┘
       │
       ▼
┌─────────────┐      ┌──────────────┐
│   Fisher    │◄────►│   Relayer    │
└─────────────┘      └──────┬───────┘
                            │
                            ▼
                     ┌──────────────┐
                     │   Sepolia    │
                     │  Blockchain  │
                     └──────────────┘
```

### Componentes

- **Fisher**: Gestiona la cola de pagos y eventos
- **Relayer**: Procesa pagos y envía transacciones a la blockchain
- **API REST**: Interfaz HTTP para interactuar con el sistema
- **QR Generator**: Genera y parsea códigos QR para pagos

## 🛠️ Scripts Disponibles

```bash
npm run dev          # Iniciar en modo desarrollo
npm run build        # Compilar TypeScript
npm start            # Iniciar en producción
npm run check        # Verificar conexión con Sepolia
npm run test:evvm    # Ejecutar pruebas automáticas
```

## 🔐 Seguridad

- ⚠️ **NUNCA** commitees tu `RELAYER_PRIVATE_KEY` al repositorio
- Usa variables de entorno para datos sensibles
- El relayer necesita fondos para pagar el gas
- Valida todas las entradas de usuario

## 📊 Monitoreo

El servidor muestra logs en tiempo real:

```
[Server] Running on port 3001
[Relayer] Address: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
[Relayer] Started processing payments
[Event] payment_received: 550e8400-e29b-41d4-a716-446655440000
[Event] payment_processing: 550e8400-e29b-41d4-a716-446655440000
[Event] payment_completed: 550e8400-e29b-41d4-a716-446655440000
```

Puedes ver las transacciones en [Sepolia Etherscan](https://sepolia.etherscan.io/).

## 🌐 Recursos

- **Sepolia Faucet**: https://sepoliafaucet.com/
- **Sepolia Explorer**: https://sepolia.etherscan.io/
- **Alchemy Faucet**: https://www.alchemy.com/faucets/ethereum-sepolia

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la licencia MIT.

## 🐛 Problemas Conocidos

- Los pagos se almacenan en memoria (se pierden al reiniciar)
- El relayer procesa pagos cada 5 segundos por defecto
- Se requiere SepoliaETH para el gas

## 🔮 Roadmap

- [ ] Persistencia de pagos en base de datos
- [ ] Soporte para múltiples stablecoins
- [ ] Dashboard web para monitoreo
- [ ] Webhooks para notificaciones
- [ ] Optimización de gas
- [ ] Soporte para mainnet
