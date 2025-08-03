module.exports = (sequelize, DataTypes) => {
  const DetallePesaje = sequelize.define('DetallePesaje', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    ingreso_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'ingresos',
        key: 'id'
      }
    },
    numero_pesaje: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Número secuencial del pesaje dentro del ingreso'
    },
    peso: {
      type: DataTypes.DECIMAL(10, 3),
      allowNull: false,
      comment: 'Peso registrado en kg con 3 decimales'
    },
    peso_jaba: {
      type: DataTypes.DECIMAL(10, 3),
      allowNull: true,
      defaultValue: 2.000,
      comment: 'Peso de la jaba para este pesaje'
    },
    descuento_merma_pesaje: {
      type: DataTypes.DECIMAL(10, 3),
      allowNull: true,
      defaultValue: 0.000,
      comment: 'Descuento de merma aplicado a este pesaje'
    },
    peso_neto_pesaje: {
      type: DataTypes.VIRTUAL,
      get() {
        const peso = parseFloat(this.getDataValue('peso')) || 0;
        const pesoJaba = parseFloat(this.getDataValue('peso_jaba')) || 0;
        const descuentoMerma = parseFloat(this.getDataValue('descuento_merma_pesaje')) || 0;
        return peso - pesoJaba - descuentoMerma;
      },
      comment: 'Peso neto calculado automáticamente'
    },
    observacion_pesaje: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Observaciones específicas del pesaje'
    },
    fecha_pesaje: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: 'Timestamp del pesaje'
    },
    // Campos de control
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
    tableName: 'detalle_pesajes',
    timestamps: false,
    freezeTableName: true,
    indexes: [
      {
        unique: true,
        fields: ['ingreso_id', 'numero_pesaje'],
        name: 'unique_pesaje_por_ingreso'
      },
      {
        fields: ['ingreso_id']
      },
      {
        fields: ['fecha_pesaje']
      },
      {
        fields: ['estado']
      }
    ],
    hooks: {
      // Hook para actualizar totales del ingreso después de crear un pesaje
      afterCreate: async (detallePesaje, options) => {
        await actualizarTotalesIngreso(detallePesaje.ingreso_id, options.transaction);
      }
    }
  });

  DetallePesaje.associate = function(models) {
    DetallePesaje.belongsTo(models.Ingreso, {
      foreignKey: 'ingreso_id',
      as: 'ingreso'
    });
    
    DetallePesaje.belongsTo(models.Usuario, {
      foreignKey: 'usuario_creacion_id',
      as: 'usuario_creacion'
    });
    
    DetallePesaje.belongsTo(models.Usuario, {
      foreignKey: 'usuario_modificacion_id',
      as: 'usuario_modificacion'
    });
  };

  return DetallePesaje;
};