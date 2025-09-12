const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const { Sequelize } = require('sequelize');
const bcrypt = require('bcrypt');
require('dotenv').config();

// Función para inicializar la base de datos
async function initializeDatabase() {
  try {
    // Primero conectamos sin especificar una base de datos
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || '192.168.10.106',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      multipleStatements: true // Importante para ejecutar múltiples consultas
    });

    console.log('Conectado a MySQL. Verificando si la base de datos existe...');
    
    // Verificar si la base de datos ya existe
    const [rows] = await connection.query(`SHOW DATABASES LIKE '${process.env.DB_NAME || 'stock_camu'}'`);
    
    if (rows.length === 0) {
      console.log(`Base de datos ${process.env.DB_NAME || 'stock_camu'} no encontrada. Inicializando...`);
      
      // Leer el archivo SQL
      const sqlPath = path.join(__dirname, '..', '..', 'init.sql');
      const initSql = fs.readFileSync(sqlPath, 'utf8');
      
      // Ejecutar el script SQL
      await connection.query(initSql);
      
      console.log('Base de datos inicializada correctamente');
    } else {
      console.log(`Base de datos ${process.env.DB_NAME || 'stock_camu'} ya existe.`);
    }
    
    await connection.end();
    return true;
    
  } catch (error) {
    console.error('Error al inicializar la base de datos:', error);
    return false;
  }
}

// Configuración de Sequelize
const sequelize = new Sequelize(
  process.env.DB_NAME || 'stock_camu',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || '192.168.10.106',
    dialect: 'mysql',
    port: process.env.DB_PORT || 3306,
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// Función para probar la conexión de Sequelize
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('Conexión a la base de datos establecida correctamente con Sequelize.');
    return true;
  } catch (error) {
    console.error('No se pudo conectar a la base de datos con Sequelize:', error);
    return false;
  }
}

// Función para crear un usuario administrador por defecto
async function createDefaultAdmin() {
  try {
    // Importamos los modelos después de que se haya inicializado Sequelize
    const { Usuario, Role } = require('../models');
    
    // Verificar si ya existe un usuario administrador
    const adminExists = await Usuario.findOne({
      include: [
        {
          model: Role,
          as: 'rol',
          where: { nombre: 'admin' }
        }
      ]
    });

    // Crear roles si no existen
    console.log('Verificando roles del sistema...');
    
    // Verificar y crear rol de administrador
    let adminRole = await Role.findOne({ where: { nombre: 'admin' } });
    if (!adminRole) {
      console.log('El rol de administrador no existe. Creando rol...');
      adminRole = await Role.create({
        nombre: 'admin',
        descripcion: 'Administrador del sistema',
        estado: true
      });
      console.log('Rol de administrador creado exitosamente.');
    }
    
    // Verificar y crear rol de empleado
    let empleadoRole = await Role.findOne({ where: { nombre: 'empleado' } });
    if (!empleadoRole) {
      console.log('El rol de empleado no existe. Creando rol...');
      empleadoRole = await Role.create({
        nombre: 'empleado',
        descripcion: 'Empleado del sistema con acceso limitado',
        estado: true
      });
      console.log('Rol de empleado creado exitosamente.');
    }
    
    // Verificar y crear rol de cliente
    let clienteRole = await Role.findOne({ where: { nombre: 'cliente' } });
    if (!clienteRole) {
      console.log('El rol de cliente no existe. Creando rol...');
      clienteRole = await Role.create({
        nombre: 'cliente',
        descripcion: 'Cliente con acceso a funciones básicas',
        estado: true
      });
      console.log('Rol de cliente creado exitosamente.');
    }

    if (!adminExists) {
      console.log('Creando usuario administrador por defecto...');
      
      // Encriptar la contraseña del administrador
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      // Crear el usuario administrador
      await Usuario.create({
        nombre: 'Administrador',
        apellido: 'Sistema',
        usuario: 'admin', // Añadido el campo usuario
        email: 'dhayro.kong@hotmail.com',
        password: hashedPassword,
        rol_id: adminRole.id,
        estado: true
      });
      
      console.log('Usuario administrador creado exitosamente.');
    } else {
      console.log('El usuario administrador ya existe.');
    }
    
    return true;
  } catch (error) {
    console.error('Error al crear roles y usuario administrador por defecto:', error);
    return false;
  }
}

// Exportar la instancia de Sequelize directamente
module.exports = sequelize;

// También exportar las funciones como propiedades adicionales
module.exports.initializeDatabase = initializeDatabase;
module.exports.testConnection = testConnection;
module.exports.createDefaultAdmin = createDefaultAdmin;