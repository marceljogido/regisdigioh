module.exports = (sequelize, DataTypes) => {
    const Attribute = sequelize.define("attr", {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        event_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: false,
        },
        guest_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: false,
        },
        attribute_key: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        attribute_value: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    }, {
        tableName: 'attributes',
        indexes: [
            {
                unique: true,
                fields: ['event_id', 'guest_id', 'attribute_key'],
                name: 'unique_event_guest_key'
            }
        ]
    });

    return Attribute
}
