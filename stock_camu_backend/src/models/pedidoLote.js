module.exports = (sequelize, DataTypes) => {
  const PedidoLote = sequelize.define('PedidoLote', {
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
    cliente_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    producto_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    cantidad: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    unidad_medida_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    fecha_pedido: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    tipo_fruta_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    fecha_limite: {
      type: DataTypes.DATEONLY
    },
    estado: {
      type: DataTypes.ENUM('pendiente', 'completado', 'cancelado'),
      defaultValue: 'pendiente'
    },
    observacion: {
      type: DataTypes.TEXT
    },
    usuario_creacion_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    usuario_modificacion_id: {
      type: DataTypes.INTEGER
    }
  }, {
    tableName: 'pedidos_lotes',
    timestamps: false
  });

  PedidoLote.associate = function(models) {
    PedidoLote.belongsTo(models.Cliente, {
      foreignKey: 'cliente_id',
      as: 'cliente'
    });
    
    PedidoLote.belongsTo(models.Producto, {
      foreignKey: 'producto_id',
      as: 'producto'
    });
    
    PedidoLote.belongsTo(models.UnidadMedida, {
      foreignKey: 'unidad_medida_id',
      as: 'unidad_medida'
    });
    
    PedidoLote.belongsTo(models.TipoFruta, {
      foreignKey: 'tipo_fruta_id',
      as: 'tipo_fruta'
    });
    
    PedidoLote.belongsTo(models.Usuario, {
      foreignKey: 'usuario_creacion_id',
      as: 'usuario_creacion'
    });
    
    PedidoLote.belongsTo(models.Usuario, {
      foreignKey: 'usuario_modificacion_id',
      as: 'usuario_modificacion'
    });
    
    // PedidoLote.hasMany(models.Ingreso, {
    //   foreignKey: 'pedido_lote_id',
    //   as: 'ingresos'
    // });
    
    PedidoLote.hasMany(models.Salida, {
      foreignKey: 'pedido_lote_id',
      as: 'salidas'
    });
  };

  return PedidoLote;
};