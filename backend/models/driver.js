module.exports = (sequelize, DataTypes) => {
  const Driver = sequelize.define('Driver', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    username: { type: DataTypes.STRING, allowNull: true, unique: true },
    name: { type: DataTypes.STRING, allowNull: true },
    password: { type: DataTypes.STRING, allowNull: true },
    phone: { type: DataTypes.STRING, allowNull: true },
    status: { type: DataTypes.ENUM('on', 'off'), defaultValue: 'off' },
    role: { type: DataTypes.STRING, defaultValue: 'driver' },
  }, { tableName: 'drivers', timestamps: true });
  return Driver;
};