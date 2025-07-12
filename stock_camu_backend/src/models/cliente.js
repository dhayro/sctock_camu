module.exports = (sequelize, DataTypes) => {
  const Cliente = sequelize.define('Cliente', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    razon_social: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    ruc: {
      type: DataTypes.STRING(11),
      allowNull: false,
      unique: true
    },
    direccion: {
      type: DataTypes.STRING(200)
    },
    telefono: {
      type: DataTypes.STRING(20)
    },
    email: {
      type: DataTypes.STRING(100),
      validate: {
        isEmail: true
      }
    },
    estado: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'clientes',
    timestamps: false
  });

  Cliente.associate = function(models) {
    Cliente.hasMany(models.PedidoLote, {
      foreignKey: 'cliente_id',
      as: 'pedidos'
    });
    
    Cliente.hasMany(models.Salida, {
      foreignKey: 'cliente_id',
      as: 'salidas'
    });
  };

  return Cliente;
};