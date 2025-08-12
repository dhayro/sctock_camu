const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

module.exports = (sequelize, DataTypes) => {
  const Socio = sequelize.define('Socio', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    codigo: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true
    },
    dni: {
      type: DataTypes.STRING(8),
      unique: true
    },
    apellidos: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    nombres: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    caserio: {
      type: DataTypes.STRING(100)
    },
    certificado: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    direccion: {
      type: DataTypes.STRING(200)
    },
    telefono: {
      type: DataTypes.STRING(20)
    },
    email: {
      type: DataTypes.STRING(100)
    },
    estado: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'socios',
    timestamps: false
  });

  Socio.associate = (models) => {
    Socio.hasMany(models.Ingreso, {
      as: 'ingresos',
      foreignKey: 'socio_id'
    });
    // ... otras asociaciones
  };

  return Socio;
};