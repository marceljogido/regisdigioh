
require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
    process.env.DATABASE,
    process.env.DB_USERNAME,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect: 'postgres',
        port: process.env.DB_PORT || 5432,
        dialectOptions: {
            ssl: false // User didn't specify SSL, but might be needed for some clouds.
        }
    }
);

async function testConnection() {
    try {
        console.log(`Attempting to connect to ${process.env.DB_HOST} on port ${process.env.DB_PORT || 5432}...`);
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
        // List tables to be sure
        const [results, metadata] = await sequelize.query("SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname != 'pg_catalog' AND schemaname != 'information_schema'");
        console.log('Tables:', results.map(r => r.tablename));
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    } finally {
        await sequelize.close();
    }
}

testConnection();
