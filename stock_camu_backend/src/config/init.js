const sequelize = require('./database');

async function initialize() {
  try {
    // Inicializar la base de datos si no existe
    await sequelize.initializeDatabase();
    
    // Use force: false to avoid recreating tables and indexes
    // Remove alter: true as it's causing the index issue
    await sequelize.sync({ force: false });
    console.log('Modelos sincronizados con la base de datos');
    
    // Crear usuario administrador por defecto
    await sequelize.createDefaultAdmin();
    
    return true;
  } catch (error) {
    console.error('Error durante la inicialización:', error);
    return false;
  }
}

module.exports = initialize;