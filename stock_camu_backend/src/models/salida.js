module.exports = (sequelize, DataTypes) => {
  const Salida = sequelize.define('Salida', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    fecha: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    detalle_orden_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'detalle_ordenes_compra',
        key: 'id'
      }
    },
    guia_remision: {
      type: DataTypes.STRING(30),
      allowNull: true
    },
    destino: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    observacion: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    usuario_creacion_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'usuarios',
        key: 'id'
      }
    },
    usuario_modificacion_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'usuarios',
        key: 'id'
      }
    }
  }, {
    tableName: 'salidas',
    timestamps: false
  });

  Salida.associate = function(models) {
    Salida.belongsTo(models.DetalleOrdenCompra, {
      foreignKey: 'detalle_orden_id',
      as: 'detalle_orden'
    });
    
    Salida.belongsTo(models.Usuario, {
      foreignKey: 'usuario_creacion_id',
      as: 'usuario_creacion'
    });
    
    Salida.belongsTo(models.Usuario, {
      foreignKey: 'usuario_modificacion_id',
      as: 'usuario_modificacion'
    });
  };

  return Salida;
};