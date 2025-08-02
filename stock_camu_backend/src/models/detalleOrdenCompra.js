module.exports = (sequelize, DataTypes) => {
    const DetalleOrdenCompra = sequelize.define('DetalleOrdenCompra', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      orden_compra_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'ordenes_compra',
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
      tipo_fruta_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'tipos_fruta',
          key: 'id'
        }
      },
      cantidad: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        get() {
          const value = this.getDataValue('cantidad');
          return value ? parseFloat(value) : 0;
        }
      },
      precio: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        get() {
          const value = this.getDataValue('precio');
          return value ? parseFloat(value) : 0;
        }
      },
      subtotal: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        get() {
          const value = this.getDataValue('subtotal');
          return value ? parseFloat(value) : 0;
        }
      },
      cantidad_ingresada: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
        get() {
          const value = this.getDataValue('cantidad_ingresada');
          return value ? parseFloat(value) : 0;
        }
      },
      estado: {
        type: DataTypes.ENUM('pendiente', 'en_proceso', 'completado', 'cancelado'),
        defaultValue: 'pendiente'
      },
      observacion: {
        type: DataTypes.TEXT,
        allowNull: true
      }
    }, {
      tableName: 'detalle_ordenes_compra',
      timestamps: false
    });

    DetalleOrdenCompra.associate = function(models) {
      DetalleOrdenCompra.belongsTo(models.OrdenCompra, {
        foreignKey: 'orden_compra_id',
        as: 'orden_compra'
      });
      
      DetalleOrdenCompra.belongsTo(models.Producto, {
        foreignKey: 'producto_id',
        as: 'producto'
      });
      
      DetalleOrdenCompra.belongsTo(models.TipoFruta, {
        foreignKey: 'tipo_fruta_id',
        as: 'tipo_fruta'
      });

      DetalleOrdenCompra.hasMany(models.Salida, {
        foreignKey: 'detalle_orden_id',
        as: 'salidas'
      });
    };

    return DetalleOrdenCompra;
};