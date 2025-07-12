module.exports = (sequelize, DataTypes) => {
  const Cargo = sequelize.define('Cargo', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nombre: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    descripcion: {
      type: DataTypes.TEXT
    }
  }, {
    tableName: 'cargos',
    timestamps: false
  });

  Cargo.associate = function(models) {
    Cargo.hasMany(models.Personal, {
      foreignKey: 'cargo_id',
      as: 'personal'
    });
  };

  return Cargo;
};