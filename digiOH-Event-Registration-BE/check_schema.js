
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
        logging: false, // Clean output
    }
);

async function checkSchema() {
    try {
        await sequelize.authenticate();
        console.log('Connected to DB.');

        const queryInterface = sequelize.getQueryInterface();
        const tables = ['attrs', 'events', 'guests', 'users'];

        for (const table of tables) {
            try {
                const columns = await queryInterface.describeTable(table);
                console.log(`\n--- Table: ${table} ---`);
                for (const [colName, details] of Object.entries(columns)) {
                    console.log(`${colName}: ${details.type} (AllowNull: ${details.allowNull})`);
                }
            } catch (err) {
                console.log(`\n--- Table: ${table} NOT FOUND or ERROR ---`);
                console.log(err.message);
            }
        }

    } catch (error) {
        console.error('Unable to connect to the database:', error);
    } finally {
        await sequelize.close();
    }
}

checkSchema();
