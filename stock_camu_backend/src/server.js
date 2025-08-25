const app = require('./app');
const { initializeDatabase, testConnection, createDefaultAdmin } = require('./config/database');
require('dotenv').config();
const balanzaService = require('./services/balanzaService');

const PORT = process.env.PORT || 3000;

// Función para iniciar el servidor
async function startServer() {
  try {
    // Initialize the database
    const dbInitialized = await initializeDatabase();
    if (!dbInitialized) {
      console.error('Failed to initialize the database.');
      process.exit(1);
    }

    // Test the database connection
    const dbConnected = await testConnection();
    if (!dbConnected) {
      console.error('Failed to connect to the database.');
      process.exit(1);
    }

    // Create default admin user
    const adminCreated = await createDefaultAdmin();
    if (!adminCreated) {
      console.error('Failed to create default admin user.');
      process.exit(1);
    }

    // Iniciar el servidor
    const server = app.listen(PORT, () => {
      console.log(`Servidor corriendo en el puerto ${PORT}`);
      console.log(`Documentación de la API disponible en http://172.10.9.11:${PORT}/api-docs`);
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