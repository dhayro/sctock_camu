module.exports = (sequelize, DataTypes) => {
  const DetallePesaje = sequelize.define('DetallePesaje', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    ingreso_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    numero_pesaje: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    peso: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    estado: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    usuario_creacion_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    usuario_modificacion_id: {
      type: DataTypes.INTEGER
    }
  }, {
    tableName: 'detalle_pesajes',
    timestamps: false
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