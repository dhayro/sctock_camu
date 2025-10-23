module.exports = (sequelize, DataTypes) => {
    const OrdenCompra = sequelize.define('OrdenCompra', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      codigo_lote: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true
      },
      tipo_lote: {
        type: DataTypes.ENUM('organica', 'convencional'),
        allowNull: false
      },
      tipo_pago: {
        type: DataTypes.ENUM('contado', 'credito'),
        allowNull: false
      },
      cliente_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      numero_orden: {
        type: DataTypes.STRING(20)
      },
      fecha_emision: {
        type: DataTypes.DATEONLY,
        allowNull: false
      },
      fecha_entrega: {
        type: DataTypes.DATEONLY
      },
      lugar_entrega: {
        type: DataTypes.TEXT
      },
      estado: {
        type: DataTypes.ENUM('pendiente', 'en_proceso', 'completado', 'cancelado','terminado'),
        defaultValue: 'pendiente'
      },
      observacion: {
        type: DataTypes.TEXT
      },
      forma_pago: {
        type: DataTypes.STRING(50)
      },
      usuario_creacion_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      fecha_creacion: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      },
      usuario_modificacion_id: {
        type: DataTypes.INTEGER
      },
      fecha_modificacion: {
        type: DataTypes.DATE
      }
    }, {
      tableName: 'ordenes_compra',
      timestamps: false
    });
  
    OrdenCompra.associate = function(models) {
      OrdenCompra.belongsTo(models.Cliente, {
        foreignKey: 'cliente_id',
        as: 'cliente'
      });
      
      OrdenCompra.belongsTo(models.Usuario, {
        foreignKey: 'usuario_creacion_id',
        as: 'usuario_creacion'
      });
      
      OrdenCompra.belongsTo(models.Usuario, {
        foreignKey: 'usuario_modificacion_id',
        as: 'usuario_modificacion'
      });
      
      OrdenCompra.hasMany(models.DetalleOrdenCompra, {
        foreignKey: 'orden_compra_id',
        as: 'detalles'
      });
    };
  
    return OrdenCompra;
  };