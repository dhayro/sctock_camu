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
    detalle_orden_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'detalle_ordenes_compra',
        key: 'id'
      }
    },
    num_jabas: {
      type: DataTypes.INTEGER,
      allowNull: true
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
      type: DataTypes.TEXT,
      allowNull: true
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
      allowNull: true,
      references: {
        model: 'usuarios',
        key: 'id'
      }
    }
  }, {
    tableName: 'ingresos',
    timestamps: false,
    // Forzar la sincronización del modelo
    freezeTableName: true
  });

  Ingreso.associate = function(models) {
    // Relación con Socio
    Ingreso.belongsTo(models.Socio, {
      foreignKey: 'socio_id',
      as: 'socio'
    });

    // Relación con DetalleOrdenCompra
    Ingreso.belongsTo(models.DetalleOrdenCompra, {
      foreignKey: 'detalle_orden_id',
      as: 'detalle_orden'
    });

    // Relación con Usuario (creación)
    Ingreso.belongsTo(models.Usuario, {
      foreignKey: 'usuario_creacion_id',
      as: 'usuario_creacion'
    });

    // Relación con Usuario (modificación)
    Ingreso.belongsTo(models.Usuario, {
      foreignKey: 'usuario_modificacion_id',
      as: 'usuario_modificacion'
    });
  };

  return Ingreso;
};