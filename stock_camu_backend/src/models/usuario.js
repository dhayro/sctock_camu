const { DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const Usuario = sequelize.define('Usuario', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    personal_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'personal', // Asegúrate de que el nombre del modelo sea correcto
        key: 'id'
      }
    },
    usuario: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    rol_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'roles',
        key: 'id'
      }
    },
    estado: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    fecha_creacion: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'usuarios',
    timestamps: false
  });

  // Asociaciones
  Usuario.associate = function(models) {
    Usuario.belongsTo(models.Role, {
      foreignKey: 'rol_id',
      as: 'rol'
    });
    
    Usuario.belongsTo(models.Personal, {
      foreignKey: 'personal_id',
      as: 'personal'
    });
  };

  return Usuario;
};