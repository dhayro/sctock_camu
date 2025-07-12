const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const Role = sequelize.define('Role', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nombre: {
      type: DataTypes.STRING(30),
      allowNull: false,
      unique: true
    },
    descripcion: {
      type: DataTypes.TEXT
    }
  }, {
    tableName: 'roles',
    timestamps: false
  });

  Role.associate = function(models) {
    Role.hasMany(models.Usuario, {
      foreignKey: 'rol_id',
      as: 'usuarios'
    });
  };

  return Role;
};