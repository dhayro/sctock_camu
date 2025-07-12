const app = require('./app');
const { sequelize } = require('./models');
require('dotenv').config();
const initialize = require('./config/init');
const balanzaService = require('./services/balanzaService');

const PORT = process.env.PORT || 3000;

// Función para iniciar el servidor
async function startServer() {
  try {
    // Sincronizar modelos con la base de datos
    await sequelize.authenticate();
    console.log('Conexión a la base de datos establecida correctamente.');

    // Inicializar la base de datos y crear usuario admin por defecto
    await initialize();

    // Iniciar el servidor
    const server = app.listen(PORT, () => {
      console.log(`Servidor corriendo en el puerto ${PORT}`);
      console.log(`Documentación de la API disponible en http://localhost:${PORT}/api-docs`);
    });

    // Manejar cierre del servidor
    process.on('SIGINT', async () => {
      console.log('Cerrando servidor...');
      if (balanzaService) {
        try {
          await balanzaService.disconnect();
        } catch (error) {
          console.error('Error al desconectar la balanza:', error);
        }
      }
      process.exit(0);
    });
    
  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
}

// Iniciar el servidor
startServer();