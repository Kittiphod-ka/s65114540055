const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

function buildSequelize() {
  const url = (process.env.DATABASE_URL || process.env.POSTGRES_URI || '').trim();
  const NEED_SSL = (process.env.PGSSL || '').toLowerCase() === 'true';

  if (url) {
    if (!/^postgres(ql)?:\/\//i.test(url)) {
      throw new Error(`DATABASE_URL ไม่ถูกต้อง: "${url}"`);
    }
    return new Sequelize(url, {
      dialect: 'postgres',
      logging: false,
      ...(NEED_SSL && { dialectOptions: { ssl: { require: true, rejectUnauthorized: false } } }),
    });
  }

  const { PGHOST, PGPORT, PGUSER, PGPASSWORD, PGDATABASE } = process.env;
  if (!PGHOST || !PGPORT || !PGUSER || !PGDATABASE) {
    throw new Error('ต้องตั้งค่า DATABASE_URL หรือ PGHOST, PGPORT, PGUSER, PGPASSWORD, PGDATABASE');
  }

  return new Sequelize(PGDATABASE, PGUSER, PGPASSWORD, {
    host: PGHOST,
    port: Number(PGPORT),
    dialect: 'postgres',
    logging: false,
    ...(NEED_SSL && { dialectOptions: { ssl: { require: true, rejectUnauthorized: false } } }),
  });
}

const sequelize = buildSequelize();

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ PostgreSQL connected via Sequelize');
  } catch (err) {
    console.error('❌ PostgreSQL connection failed:', err.message);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
