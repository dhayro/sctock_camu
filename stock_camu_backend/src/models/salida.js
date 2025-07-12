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
    pedido_lote_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'pedidos_lotes',
        key: 'id'
      }
    },
    cliente_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'clientes',
        key: 'id'
      }
    },
    producto_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'productos',
        key: 'id'
      }
    },
    cantidad: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    unidad_medida_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'unidades_medida',
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
    Salida.belongsTo(models.PedidoLote, {
      foreignKey: 'pedido_lote_id',
      as: 'pedido_lote'
    });
    
    Salida.belongsTo(models.Cliente, {
      foreignKey: 'cliente_id',
      as: 'cliente'
    });
    
    Salida.belongsTo(models.Producto, {
      foreignKey: 'producto_id',
      as: 'producto'
    });
    
    Salida.belongsTo(models.UnidadMedida, {
      foreignKey: 'unidad_medida_id',
      as: 'unidad_medida'
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