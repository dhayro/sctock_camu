module.exports = (sequelize, DataTypes) => {
  const Area = sequelize.define('Area', {
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
    tableName: 'areas',
    timestamps: false
  });

  Area.associate = function(models) {
    Area.hasMany(models.Personal, {
      foreignKey: 'area_id',
      as: 'personal'
    });
  };

  return Area;
};