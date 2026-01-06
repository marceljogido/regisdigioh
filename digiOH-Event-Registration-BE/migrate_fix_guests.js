
require('dotenv').config();
const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize(
    process.env.DATABASE,
    process.env.DB_USERNAME,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect: 'postgres',
        port: process.env.DB_PORT || 5432,
        logging: console.log,
    }
);

async function migrate() {
    try {
        await sequelize.authenticate();
        console.log('Connected to DB.');
        const queryInterface = sequelize.getQueryInterface();

        console.log('Adding column unique_code to guests table...');

        // Check if column exists first to be safe
        const tableInfo = await queryInterface.describeTable('guests');
        if (tableInfo.unique_code) {
            console.log('Column unique_code ALREADY EXISTS. Skipping.');
        } else {
            await queryInterface.addColumn('guests', 'unique_code', {
                type: DataTypes.STRING(8),
                allowNull: true,
                unique: true
            });
            console.log('Column unique_code added successfully.');
        }

    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await sequelize.close();
    }
}

migrate();
