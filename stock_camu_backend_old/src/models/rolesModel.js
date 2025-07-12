const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Adjust the path as necessary

const Role = sequelize.define('Role', {
  nombre: {
    type: DataTypes.STRING(30),
    unique: true,
    allowNull: false,
  },
  descripcion: {
    type: DataTypes.TEXT,
  },
}, {
  tableName: 'roles',
  timestamps: false,
});

module.exports = Role;