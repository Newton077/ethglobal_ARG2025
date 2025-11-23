# ✅ Checklist de Despliegue en Sepolia

## Pre-requisitos

### 1. Wallet del Relayer
- [ ] Generar una wallet nueva (o usar una existente)
  ```bash
  npx ethers-cli wallet create
  ```
- [ ] Guardar la clave privada de forma segura
- [ ] Copiar la dirección de la wallet
- [ ] Obtener SepoliaETH del faucet
  - https://sepoliafaucet.com/
  - https://www.alchemy.com/faucets/ethereum-sepolia
- [ ] Verificar balance en https://sepolia.etherscan.io/

### 2. Contrato MATE
- [ ] Desplegar el contrato del token MATE en Sepolia
- [ ] Copiar la dirección del contrato
- [ ] Verificar el contrato en Etherscan (opcional)
- [ ] Asegurarse de que el relayer tenga permisos si es necesario

## Configuración

### 3. Variables de Entorno
- [ ] Editar el archivo `.env`
- [ ] Configurar `RELAYER_PRIVATE_KEY` con tu clave privada
- [ ] Configurar `MATE_ADDRESS` con la dirección del contrato
- [ ] Verificar que `BLOCKCHAIN_RPC_URL` sea: `https://ethereum-sepolia-rpc.publicnode.com`
- [ ] Verificar que `BLOCKCHAIN_CHAIN_ID` sea: `11155111`

### 4. Dependencias
- [ ] Instalar dependencias
  ```bash
  npm install
  ```
- [ ] Verificar que no haya errores de instalación

## Verificación

### 5. Pruebas de Conexión
- [ ] Ejecutar verificación de conexión
  ```bash
  npm run check
  ```
- [ ] Confirmar que se conecta a Sepolia
- [ ] Confirmar que el relayer tiene balance
- [ ] Confirmar que el contrato MATE existe

### 6. Compilación
- [ ] Compilar el proyecto
  ```bash
  npm run build
  ```
- [ ] Verificar que no haya errores de TypeScript

## Despliegue

### 7. Iniciar el Servidor
- [ ] Iniciar en modo desarrollo
  ```bash
  npm run dev
  ```
- [ ] Verificar que el servidor inicie sin errores
- [ ] Confirmar que muestra:
  ```
  [Server] Running on port 3001
  [Relayer] Address: 0x...
  [Relayer] Started processing payments
  ```

### 8. Pruebas Funcionales
- [ ] Ejecutar pruebas automáticas (en otra terminal)
  ```bash
  npm run test:evvm
  ```
- [ ] Verificar que todos los tests pasen:
  - ✅ Health check
  - ✅ Stats endpoint
  - ✅ QR generation
  - ✅ QR parsing
  - ✅ Payment creation
  - ✅ Payment status
  - ✅ Pending payments

### 9. Pruebas Manuales
- [ ] Probar health check
  ```bash
  curl http://localhost:3001/api/health
  ```
- [ ] Crear un pago de prueba
- [ ] Verificar que el pago se procese
- [ ] Buscar la transacción en Sepolia Etherscan
- [ ] Confirmar que el pago cambie de estado a "completed"

## Producción

### 10. Configuración de Producción
- [ ] Configurar variables de entorno en el servidor
- [ ] Configurar puerto si es necesario (default: 3001)
- [ ] Configurar logs (LOG_LEVEL=info o warn)
- [ ] Configurar intervalos del relayer si es necesario

### 11. Despliegue en Servidor
- [ ] Subir código al servidor
- [ ] Instalar dependencias en producción
  ```bash
  npm install --production
  ```
- [ ] Compilar el proyecto
  ```bash
  npm run build
  ```
- [ ] Iniciar con PM2 o similar
  ```bash
  pm2 start npm --name "evvm-relayer" -- start
  ```

### 12. Monitoreo
- [ ] Configurar logs persistentes
- [ ] Configurar alertas de errores
- [ ] Monitorear balance del relayer
- [ ] Configurar reinicio automático si falla
- [ ] Verificar que los pagos se procesen correctamente

## Post-Despliegue

### 13. Documentación
- [ ] Documentar la dirección del relayer
- [ ] Documentar la dirección del contrato MATE
- [ ] Documentar el endpoint de la API
- [ ] Compartir ejemplos de uso con el equipo

### 14. Seguridad
- [ ] Verificar que `.env` no esté en el repositorio
- [ ] Configurar firewall si es necesario
- [ ] Limitar acceso a la API si es necesario
- [ ] Configurar rate limiting (opcional)
- [ ] Configurar HTTPS (recomendado para producción)

### 15. Backup
- [ ] Guardar copia de seguridad de la clave privada
- [ ] Documentar configuración del servidor
- [ ] Configurar backup de logs

## Troubleshooting

### Problemas Comunes

**El servidor no inicia:**
- Verificar que el puerto 3001 esté disponible
- Revisar logs de error
- Verificar variables de entorno

**Pagos quedan en pending:**
- Verificar balance del relayer
- Verificar que MATE_ADDRESS sea correcto
- Revisar logs del relayer
- Verificar en Etherscan si hay transacciones fallidas

**Error de conexión:**
- Verificar que Sepolia RPC esté accesible
- Probar con otro RPC endpoint
- Verificar conexión a internet

**Insufficient funds:**
- Obtener más SepoliaETH del faucet
- Verificar que la dirección del relayer sea correcta

## Recursos

- **Sepolia Faucet**: https://sepoliafaucet.com/
- **Sepolia Explorer**: https://sepolia.etherscan.io/
- **Documentación**: Ver README.md, QUICKSTART.md, TESTING.md
- **Ejemplos de API**: Ver API-EXAMPLES.md

---

**Fecha de despliegue**: _________________

**Desplegado por**: _________________

**Notas adicionales**: _________________
