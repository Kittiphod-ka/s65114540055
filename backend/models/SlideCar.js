module.exports = (sequelize, DataTypes) => {
  const SlideCar = sequelize.define('SlideCar', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    brand: { type: DataTypes.STRING, allowNull: true },
    model: { type: DataTypes.STRING, allowNull: true },
    licensePlate: { type: DataTypes.STRING, allowNull: true, unique: true },
    status: { type: DataTypes.ENUM('พร้อมใช้งาน', 'ไม่พร้อมใช้งาน'), defaultValue: 'พร้อมใช้งาน' },
    driverId: { type: DataTypes.INTEGER, allowNull: true },
  }, { tableName: 'slide_cars', timestamps: true });
  return SlideCar;
};
