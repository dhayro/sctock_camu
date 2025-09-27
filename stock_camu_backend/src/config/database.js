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
      host: process.env.DB_HOST || '172.27.200.175',
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
    host: process.env.DB_HOST || '172.27.200.175',
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
async function createDefaultData() {
  try {
    // Importamos los modelos después de que se haya inicializado Sequelize
    const { TipoFruta, UnidadMedida, Producto } = require('../models');
    
    console.log('Verificando tipos de fruta del sistema...');
    
    // Verificar y crear tipo de fruta "Madura"
    let tipoMadura = await TipoFruta.findOne({ where: { nombre: 'Madura' } });
    if (!tipoMadura) {
      console.log('El tipo de fruta "Madura" no existe. Creando...');
      tipoMadura = await TipoFruta.create({
        nombre: 'Madura',
        descripcion: 'Fruta en estado de madurez completa',
        estado: true
      });
      console.log('Tipo de fruta "Madura" creado exitosamente.');
    }
    
    // Verificar y crear tipo de fruta "Verde"
    let tipoVerde = await TipoFruta.findOne({ where: { nombre: 'Verde' } });
    if (!tipoVerde) {
      console.log('El tipo de fruta "Verde" no existe. Creando...');
      tipoVerde = await TipoFruta.create({
        nombre: 'Verde',
        descripcion: 'Fruta en estado verde, sin madurar',
        estado: true
      });
      console.log('Tipo de fruta "Verde" creado exitosamente.');
    }
    
    console.log('Verificando unidades de medida del sistema...');
    
    // Verificar y crear unidad de medida "Kilogramos"
    let unidadKg = await UnidadMedida.findOne({ where: { nombre: 'Kilogramos' } });
    if (!unidadKg) {
      console.log('La unidad de medida "Kilogramos" no existe. Creando...');
      unidadKg = await UnidadMedida.create({
        nombre: 'Kilogramos',
        abreviatura: 'kg',
        descripcion: 'Unidad de medida de peso en kilogramos',
        estado: true
      });
      console.log('Unidad de medida "Kilogramos" creada exitosamente.');
    }
    
    // Verificar y crear unidad de medida "Gramos" (adicional)
    let unidadGr = await UnidadMedida.findOne({ where: { nombre: 'Gramos' } });
    if (!unidadGr) {
      console.log('La unidad de medida "Gramos" no existe. Creando...');
      unidadGr = await UnidadMedida.create({
        nombre: 'Gramos',
        abreviatura: 'g',
        descripcion: 'Unidad de medida de peso en gramos',
        estado: true
      });
      console.log('Unidad de medida "Gramos" creada exitosamente.');
    }
    
    // Verificar y crear unidad de medida "Toneladas" (adicional)
    let unidadTon = await UnidadMedida.findOne({ where: { nombre: 'Toneladas' } });
    if (!unidadTon) {
      console.log('La unidad de medida "Toneladas" no existe. Creando...');
      unidadTon = await UnidadMedida.create({
        nombre: 'Toneladas',
        abreviatura: 't',
        descripcion: 'Unidad de medida de peso en toneladas',
        estado: true
      });
      console.log('Unidad de medida "Toneladas" creada exitosamente.');
    }
    
    console.log('Verificando productos del sistema...');
    
    // Verificar y crear producto "Camu Camu"
    let productoCamuCamu = await Producto.findOne({ where: { nombre: 'Camu Camu' } });
    if (!productoCamuCamu) {
      console.log('El producto "Camu Camu" no existe. Creando...');
      productoCamuCamu = await Producto.create({
        nombre: 'Camu Camu',
        descripcion: 'Fruta amazónica rica en vitamina C, conocida científicamente como Myrciaria dubia',
        unidad_medida_id: unidadKg.id,
        estado: true
      });
      console.log('Producto "Camu Camu" creado exitosamente.');
    }
    
    // // Verificar y crear producto "Pulpa de Camu Camu" (adicional)
    // let productoPulpa = await Producto.findOne({ where: { nombre: 'Pulpa de Camu Camu' } });
    // if (!productoPulpa) {
    //   console.log('El producto "Pulpa de Camu Camu" no existe. Creando...');
    //   productoPulpa = await Producto.create({
    //     nombre: 'Pulpa de Camu Camu',
    //     descripcion: 'Pulpa procesada de Camu Camu, lista para consumo o procesamiento industrial',
    //     unidad_medida_id: unidadKg.id,
    //     estado: true
    //   });
    //   console.log('Producto "Pulpa de Camu Camu" creado exitosamente.');
    // }
    
    console.log('Datos por defecto del sistema verificados y creados exitosamente.');
    return true;
    
  } catch (error) {
    console.error('Error al crear datos por defecto del sistema:', error);
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

    await createDefaultData();
    
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