const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json')[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

// Leer todos los archivos en el directorio actual
fs.readdirSync(__dirname)
  .filter(file => {
    // Filtrar archivos que no son el index.js y que son archivos JavaScript
    return (file.indexOf('.') !== 0) && 
           (file !== basename) && 
           (file.slice(-3) === '.js');
  })
  .forEach(file => {
    try {
      // Importar el modelo
      const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
      db[model.name] = model;
      console.log(`Modelo cargado: ${model.name}`);
    } catch (error) {
      console.error(`Error al cargar el modelo ${file}:`, error);
    }
  });

// Establecer asociaciones después de que todos los modelos estén cargados
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    try {
      db[modelName].associate(db);
      console.log(`Asociaciones establecidas para: ${modelName}`);
    } catch (error) {
      console.error(`Error al establecer asociaciones para ${modelName}:`, error);
    }
  }
});

// Agregar la instancia de sequelize y Sequelize al objeto db
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;