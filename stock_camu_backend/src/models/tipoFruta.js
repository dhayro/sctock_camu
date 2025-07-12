module.exports = (sequelize, DataTypes) => {
  const TipoFruta = sequelize.define('TipoFruta', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nombre: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    descripcion: {
      type: DataTypes.TEXT
    }
  }, {
    tableName: 'tipos_fruta',
    timestamps: false
  });

  TipoFruta.associate = function(models) {
    TipoFruta.hasMany(models.PedidoLote, {
      foreignKey: 'tipo_fruta_id',
      as: 'pedidos'
    });
    
    TipoFruta.hasMany(models.Ingreso, {
      foreignKey: 'tipo_fruta_id',
      as: 'ingresos'
    });
  };

  return TipoFruta;
};