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
const socioRoutes = require('./routes/socioRoutes');
// Importar rutas de la balanza
const balanzaRoutes = require('./routes/balanzaRoutes');
// Importar rutas adicionales
const clienteRoutes = require('./routes/clienteRoutes');
const ingresoRoutes = require('./routes/ingresoRoutes');
// const pedidoLoteRoutes = require('./routes/pedidoLoteRoutes');
const tipoFrutaRoutes = require('./routes/tipoFrutaRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');
const areasRoutes = require('./routes/areasRoutes');
const cargosRoutes = require('./routes/cargosRoutes');
const personalRoutes = require('./routes/personalRoutes');

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

// Importar y usar rutas de manera más segura
const loadRoutes = (routePath, apiPath) => {
  try {
    const route = require(routePath);
    app.use(apiPath, route);
    console.log(`Rutas de ${apiPath} cargadas correctamente`);
    return true;
  } catch (error) {
    console.error(`Error al cargar las rutas de ${apiPath}:`, error);
    return false;
  }
};

// Cargar rutas
loadRoutes('./routes/rolesRoutes', '/api/roles');
loadRoutes('./routes/cargosRoutes', '/api/cargos');
loadRoutes('./routes/areasRoutes', '/api/areas');
loadRoutes('./routes/personalRoutes', '/api/personal');
loadRoutes('./routes/usuarioRoutes', '/api/usuarios');
loadRoutes('./routes/socioRoutes', '/api/socios');
loadRoutes('./routes/clienteRoutes', '/api/clientes');
loadRoutes('./routes/ingresoRoutes', '/api/ingresos');
// loadRoutes('./routes/pedidoLoteRoutes', '/api/pedidos-lotes');
loadRoutes('./routes/tipoFrutaRoutes', '/api/tipos-fruta');
loadRoutes('./routes/unidadMedidaRoutes', '/api/unidades-medida');
loadRoutes('./routes/productoRoutes', '/api/productos');

// Usar rutas de la balanza
app.use('/api/balanza', balanzaRoutes);

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