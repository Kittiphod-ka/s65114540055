module.exports = (sequelize, DataTypes) => {
  const BookingImage = sequelize.define('BookingImage', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    bookingId: { type: DataTypes.INTEGER, allowNull: true },
    imageUrl: { type: DataTypes.STRING, allowNull: true },
    uploadedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  }, { tableName: 'booking_images', timestamps: true });

  return BookingImage;
};
