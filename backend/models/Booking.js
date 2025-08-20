module.exports = (sequelize, DataTypes) => {
  const Booking = sequelize.define('Booking', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: true },
    driverId: { type: DataTypes.INTEGER, allowNull: true },
    name: { type: DataTypes.STRING, allowNull: true },
    user_phone: { type: DataTypes.STRING, allowNull: true },
    vehicle_type: { type: DataTypes.STRING, allowNull: true },
    vehicle_model: { type: DataTypes.STRING },
    license_plate: { type: DataTypes.STRING },

    // location: แทนของเดิม pickup_location.{latitude,longitude}, dropoff_location.{...}
    pickup_latitude: { type: DataTypes.DOUBLE },
    pickup_longitude: { type: DataTypes.DOUBLE },
    dropoff_latitude: { type: DataTypes.DOUBLE },
    dropoff_longitude: { type: DataTypes.DOUBLE },

    items: { type: DataTypes.JSONB },      // ถ้ามีรายการของ
    description: { type: DataTypes.TEXT },
    total_price: { type: DataTypes.FLOAT },
    payment_status: { type: DataTypes.ENUM('pending', 'paid', 'failed'), defaultValue: 'pending' },

    status: {
      type: DataTypes.ENUM('รอคนขับรับงาน', 'กำลังดำเนินการ', 'เสร็จสิ้น', 'ยกเลิก'),
      defaultValue: 'รอคนขับรับงาน',
    },
    status2: {
      type: DataTypes.ENUM('กำลังไปรับ', 'กำลังไปส่ง', 'เสร็จสิ้น'),
      defaultValue: 'กำลังไปรับ',
    },
  }, { tableName: 'bookings', timestamps: true });

  return Booking;
};
