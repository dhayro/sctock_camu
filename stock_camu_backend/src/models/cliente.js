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
      unique: true,
      validate: {
        isNumeric: {
          msg: 'El RUC debe contener solo números'
        },
        len: {
          args: [11, 11],
          msg: 'El RUC debe tener exactamente 11 dígitos'
        }
      }
    },
    direccion: {
      type: DataTypes.STRING(200)
    },
    telefono: {
      type: DataTypes.STRING(20)
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: true, // Allow null values
      validate: {
        isEmail: {
          msg: 'Debe ser un correo electrónico válido',
          args: true,
        },
      },
      set(value) {
        // Convert empty string or dash to null
        this.setDataValue('email', (value === '' || value === '-') ? null : value);
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