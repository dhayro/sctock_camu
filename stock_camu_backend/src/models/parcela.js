const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

module.exports = (sequelize, DataTypes) => {
  const Parcela = sequelize.define('Parcela', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    codigo: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    hectarias: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    volumen: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    periodo: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    estado: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    tipo_lote: {
      type: DataTypes.ENUM('organica', 'convencional'),
      allowNull: true
    },
    socio_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    fecha_inicio: {
      type: DataTypes.DATE,
      allowNull: false
    },
    fecha_fin: {
      type: DataTypes.DATE
    }
  }, {
    tableName: 'parcelas',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['codigo', 'periodo'],
        name: 'unique_codigo_periodo'
      }
    ]
  });

  Parcela.associate = (models) => {
    Parcela.belongsTo(models.Socio, {
      as: 'socio',
      foreignKey: 'socio_id'
    });
  };

  return Parcela;
};