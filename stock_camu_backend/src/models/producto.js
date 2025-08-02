module.exports = (sequelize, DataTypes) => {
  const Producto = sequelize.define('Producto', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    unidad_medida_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    descripcion: {
      type: DataTypes.TEXT
    },
    estado: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'productos',
    timestamps: false
  });

  Producto.associate = function(models) {
    Producto.belongsTo(models.UnidadMedida, {
      foreignKey: 'unidad_medida_id',
      as: 'unidad_medida'
    });
    
    // Producto.hasMany(models.PedidoLote, {
    //   foreignKey: 'producto_id',
    //   as: 'pedidos'
    // });
    
    // Producto.hasMany(models.Ingreso, {
    //   foreignKey: 'producto_id',
    //   as: 'ingresos'
    // });
    
    Producto.hasMany(models.Salida, {
      foreignKey: 'producto_id',
      as: 'salidas'
    });
  };

  return Producto;
};