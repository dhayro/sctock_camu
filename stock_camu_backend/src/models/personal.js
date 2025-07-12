module.exports = (sequelize, DataTypes) => {
  const Personal = sequelize.define('Personal', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    dni: {
      type: DataTypes.STRING(8),
      allowNull: false,
      unique: true
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    apellido: {
      type: DataTypes.STRING(100)
    },
    cargo_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    area_id: {
      type: DataTypes.INTEGER
    },
    telefono: {
      type: DataTypes.STRING(15)
    },
    direccion: { 
      type: DataTypes.STRING(200) 
    },
    email: {
      type: DataTypes.STRING(100)
    },
    estado: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'personal',
    timestamps: false
  });

  Personal.associate = function(models) {
    Personal.belongsTo(models.Cargo, {
      foreignKey: 'cargo_id',
      as: 'cargo'
    });
    
    Personal.belongsTo(models.Area, {
      foreignKey: 'area_id',
      as: 'area'
    });
    
    Personal.hasOne(models.Usuario, {
      foreignKey: 'personal_id',
      as: 'usuario'
    });
  };

  return Personal;
};