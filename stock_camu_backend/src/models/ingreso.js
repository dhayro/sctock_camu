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
    // Campos de peso y medidas
    peso_bruto: {
      type: DataTypes.DECIMAL(10, 3),
      allowNull: true,
      defaultValue: 0.000,
      comment: 'Peso total incluyendo jabas'
    },
    peso_total_jabas: {
      type: DataTypes.DECIMAL(10, 3),
      allowNull: true,
      defaultValue: 0.000,
      comment: 'Peso total de las jabas vacías'
    },
    num_jabas: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: 'Número total de jabas'
    },
    peso_neto: {
      type: DataTypes.DECIMAL(10, 3),
      allowNull: true,
      defaultValue: 0.000,
      comment: 'Peso neto del producto (bruto - jabas - merma)'
    },
    // Campos de descuentos
    dscto_merma: {
      type: DataTypes.DECIMAL(10, 3),
      allowNull: true,
      defaultValue: 0.000,
      comment: 'Descuento por merma en kg'
    },
    aplicarPrecioJaba: { 
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
      comment: 'Indica si se aplica el precio de jaba'
    },
    // Campos financieros
    precio_venta_kg: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0.00,
      comment: 'Precio por kilogramo'
    },
    precio_jaba: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0.00,
      comment: 'Precio por jaba'
    },
    impuesto: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      defaultValue: 0.00,
      comment: 'Porcentaje de impuesto'
    },
    pago_transporte: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      defaultValue: 0.00,
      comment: 'Porcentaje para pago de transporte'
    },
    monto_transporte: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0.00,
      comment: 'Monto calculado para transporte'
    },
    ingreso_cooperativa: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0.00,
      comment: 'Monto que ingresa a la cooperativa'
    },
    pago_socio: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0.00,
      comment: 'Monto a pagar al socio'
    },
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0.00,
      comment: 'Subtotal calculado'
    },
    // Campos adicionales
    num_pesajes: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: 'Número de pesajes registrados'
    },
    // Campos de control
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
    fecha_creacion: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    usuario_modificacion_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'usuarios',
        key: 'id'
      }
    },
    fecha_modificacion: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'ingresos',
    timestamps: false,
    freezeTableName: true,
    indexes: [
      {
        unique: true,
        fields: ['numero_ingreso']
      },
      {
        fields: ['fecha']
      },
      {
        fields: ['socio_id']
      },
      {
        fields: ['detalle_orden_id']
      },
      {
        fields: ['estado']
      }
    ]
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

    // Relación con DetallePesajes (uno a muchos)
    Ingreso.hasMany(models.DetallePesaje, {
      foreignKey: 'ingreso_id',
      as: 'pesajes'
    });
  };

  return Ingreso;
};