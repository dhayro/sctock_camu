const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
const swaggerConfig = require('./config/swagger');
const BalanzaService = require('./services/balanzaService');
require('dotenv').config();
const path = require('path');
const { initBalanzaService } = require('./config/balanzaInit');

// Importar rutas
const rolesRoutes = require('./routes/rolesRoutes');
const cargosRoutes = require('./routes/cargosRoutes');
const areasRoutes = require('./routes/areasRoutes');
const personalRoutes = require('./routes/personalRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');
const socioRoutes = require('./routes/socioRoutes');
const parcelaRoutes = require('./routes/parcelaRoutes');
const clienteRoutes = require('./routes/clienteRoutes');
const tipoFrutaRoutes = require('./routes/tipoFrutaRoutes');
const unidadMedidaRoutes = require('./routes/unidadMedidaRoutes');
const productoRoutes = require('./routes/productoRoutes');
const ordenCompraRoutes = require('./routes/ordenCompraRoutes');
const detalleOrdenCompraRoutes = require('./routes/detalleOrdenCompraRoutes');
const detallePesajeRoutes = require('./routes/detallePesajeRoutes');
const balanzaRoutes = require('./routes/balanzaRoutes');
const ingresoRoutes = require('./routes/ingresoRoutes');

const app = express();

// Initialize the balanzaService and register it with the app
initBalanzaService(app);

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuración de Swagger
app.use('/api-docs', swaggerConfig.serve, swaggerConfig.setup);
console.log('Documentación Swagger configurada correctamente');

// Configurar carpeta pública para archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Usar rutas
app.use('/api/roles', rolesRoutes);
app.use('/api/cargos', cargosRoutes);
app.use('/api/areas', areasRoutes);
app.use('/api/personal', personalRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/socios', socioRoutes);
app.use('/api/parcelas', parcelaRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/tipos-fruta', tipoFrutaRoutes);
app.use('/api/unidades-medida', unidadMedidaRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/ordenes-compra', ordenCompraRoutes);
app.use('/api/detalles-orden-compra', detalleOrdenCompraRoutes);
app.use('/api/detalles-pesaje', detallePesajeRoutes);
app.use('/api/balanza', balanzaRoutes);
app.use('/api/ingresos', ingresoRoutes);

// Ruta específica para el monitor de balanza
app.get('/monitor-balanza', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'balanza-monitor.html'));
});

app.get('/serial-monitor', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'serial-monitor.html'));
});

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('API de Stock Camu Camu funcionando correctamente');
});

// Probar conexión a la base de datos
(async () => {
  try {
    await sequelize.authenticate();
    console.log('Conexión a la base de datos establecida correctamente.');
  } catch (error) {
    console.error('Error al conectar con la base de datos:', error);
  }
})();

module.exports = app;