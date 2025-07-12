module.exports = (sequelize, DataTypes) => {
  const UnidadMedida = sequelize.define('UnidadMedida', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nombre: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    abreviatura: {
      type: DataTypes.STRING(10),
      allowNull: false
    }
  }, {
    tableName: 'unidades_medida',
    timestamps: false
  });

  UnidadMedida.associate = function(models) {
    UnidadMedida.hasMany(models.Producto, {
      foreignKey: 'unidad_medida_id',
      as: 'productos'
    });
    
    UnidadMedida.hasMany(models.PedidoLote, {
      foreignKey: 'unidad_medida_id',
      as: 'pedidos'
    });
    
    UnidadMedida.hasMany(models.Ingreso, {
      foreignKey: 'unidad_medida_id',
      as: 'ingresos'
    });
    
    UnidadMedida.hasMany(models.Salida, {
      foreignKey: 'unidad_medida_id',
      as: 'salidas'
    });
  };

  return UnidadMedida;
};