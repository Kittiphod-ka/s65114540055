const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const User = require('./User')(sequelize, DataTypes);
const Driver = require('./driver')(sequelize, DataTypes);
const SlideCar = require('./SlideCar')(sequelize, DataTypes);
const Booking = require('./Booking')(sequelize, DataTypes);
const BookingImage = require('./BookingImage')(sequelize, DataTypes);

// Relations
Driver.hasMany(SlideCar, { foreignKey: 'driverId' });
SlideCar.belongsTo(Driver, { foreignKey: 'driverId' });

User.hasMany(Booking, { foreignKey: 'userId' });
Booking.belongsTo(User, { foreignKey: 'userId' });

Driver.hasMany(Booking, { foreignKey: 'driverId' });
Booking.belongsTo(Driver, { foreignKey: 'driverId' });

Booking.hasMany(BookingImage, { foreignKey: 'bookingId' });
BookingImage.belongsTo(Booking, { foreignKey: 'bookingId' });

module.exports = { sequelize, User, Driver, SlideCar, Booking, BookingImage };
