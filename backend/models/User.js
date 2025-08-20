module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    username: { type: DataTypes.STRING, allowNull: true, unique: true, },
    email: { type: DataTypes.STRING, allowNull: true, unique: true },
    phone: { type: DataTypes.STRING, allowNull: true },
    password: { type: DataTypes.STRING, allowNull: true },
    profile: { type: DataTypes.STRING },
    role: { type: DataTypes.ENUM('user', 'admin', 'driver'), defaultValue: 'user' },
  }, { tableName: 'users', timestamps: true });
  return User;
};