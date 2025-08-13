// const { actualizarTotalesIngreso } = require('../utils/ingresoUtils');

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
    producto_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID del producto'
    },
    detalle_orden_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID del detalle de la orden'
    },
    producto_nombre: {
      type: DataTypes.STRING(100),
      comment: 'Nombre del producto'
    },
    tipo_fruta_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID del tipo de fruta'
    },
    tipo_fruta_nombre: {
      type: DataTypes.STRING(50),
      comment: 'Nombre del tipo de fruta'
    },
    peso_bruto: {
      type: DataTypes.DECIMAL(10, 3),
      allowNull: false,
      comment: 'peso_bruto registrado en kg con 3 decimales'
    },
    num_jabas_pesaje: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Número de jabas'
    },
    peso_jaba: {
      type: DataTypes.DECIMAL(10, 3),
      allowNull: false,
      comment: 'Peso total de las jabas'
    },
    descuento_merma: {
      type: DataTypes.DECIMAL(10, 3),
      defaultValue: 0.000,
      comment: 'Descuento de merma aplicado a este pesaje'
    },
    peso_neto: {
      type: DataTypes.VIRTUAL,
      get() {
        const pesoBruto = parseFloat(this.getDataValue('peso_bruto') || 0);
        const pesoTotalJabas = parseFloat(this.getDataValue('peso_jaba') || 0);
        const descuentoMerma = parseFloat(this.getDataValue('descuento_merma') || 0);
        return pesoBruto - pesoTotalJabas - descuentoMerma;
      },
      comment: 'Peso neto calculado automáticamente'
    },
    fecha_pesaje: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      comment: 'fecha_pesaje del pesaje'
    },
    rawData: {
      type: DataTypes.STRING(255),
      comment: 'Datos crudos del pesaje'
    },
    observacion: {
      type: DataTypes.TEXT,
      comment: 'Observaciones específicas del pesaje'
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
        fields: ['timestamp']
      },
      {
        fields: ['estado']
      }
    ],
    hooks: {
      afterCreate: async (detallePesaje, options) => {
        // await actualizarTotalesIngreso(detallePesaje.ingreso_id, options.transaction);
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