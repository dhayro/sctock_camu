module.exports = (sequelize, DataTypes) => {
  const Ingreso = sequelize.define('Ingreso', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    numero_ingreso: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true
    },
    fecha: {
      type: DataTypes.DATE,
      allowNull: false
    },
    socio_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'socios',
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
    pedido_lote_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'pedidos_lotes',
        key: 'id'
      }
    },
    unidad_medida_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'unidades_medida',
        key: 'id'
      }
    },
    tipo_fruta_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'tipos_fruta',
        key: 'id'
      }
    },
    num_jabas: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    dscto_merma: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    dscto_jaba: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    peso_neto: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    precio_venta_kg: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    pago_transporte: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    ingreso_cooperativa: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    pago_socio: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    pago_con_descuento: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    observacion: {
      type: DataTypes.TEXT
    },
    estado: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
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
      references: {
        model: 'usuarios',
        key: 'id'
      }
    }
  }, {
    tableName: 'ingresos',
    timestamps: false
  });

  Ingreso.associate = function(models) {
    Ingreso.belongsTo(models.Socio, {
      foreignKey: 'socio_id',
      as: 'socio'
    });
    
    Ingreso.belongsTo(models.Producto, {
      foreignKey: 'producto_id',
      as: 'producto'
    });
    
    Ingreso.belongsTo(models.PedidoLote, {
      foreignKey: 'pedido_lote_id',
      as: 'pedido_lote'
    });
    
    Ingreso.belongsTo(models.UnidadMedida, {
      foreignKey: 'unidad_medida_id',
      as: 'unidad_medida'
    });
    
    Ingreso.belongsTo(models.TipoFruta, {
      foreignKey: 'tipo_fruta_id',
      as: 'tipo_fruta'
    });
    
    Ingreso.belongsTo(models.Usuario, {
      foreignKey: 'usuario_creacion_id',
      as: 'usuario_creacion'
    });
    
    Ingreso.belongsTo(models.Usuario, {
      foreignKey: 'usuario_modificacion_id',
      as: 'usuario_modificacion'
    });
    
    Ingreso.hasMany(models.DetallePesaje, {
      foreignKey: 'ingreso_id',
      as: 'detalles_pesaje'
    });
  };

  return Ingreso;
};