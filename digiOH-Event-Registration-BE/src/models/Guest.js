module.exports = (sequelize, DataTypes) => {
    const Guest = sequelize.define("guest", {
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            isEmail: true
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false
        },
        phoneNum: {
            type: DataTypes.STRING,
            allowNull: false
        },
        confirmation: {
            type: DataTypes.ENUM,
            values: ['confirmed', 'represented', 'to be confirmed', 'cancelled'],
            allowNull: false,
            defaultValue: 'to be confirmed'
        },
        attendance: {
            type: DataTypes.ENUM,
            values: ['attended', 'represented', 'did not attend'],
            allowNull: false,
            defaultValue: 'did not attend'
        },
        instansi: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: false,
        },
        emailed: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        confirmation_updated_by: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        attendance_updated_by: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        attributes_updated_by: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        email_sent_by: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        unique_code: {
            type: DataTypes.STRING(8),
            allowNull: true,
            unique: true,
        },
        event_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'events',
                key: 'id'
            }
        },
        merchandise: {
            type: DataTypes.ENUM,
            values: ['received', 'not received'],
            allowNull: false,
            defaultValue: 'not received'
        },
        merchandise_updated_by: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        registration_type: {
            type: DataTypes.ENUM,
            values: ['rsvp', 'ots'],
            allowNull: false,
            defaultValue: 'rsvp' // Existing data defaults to rsvp (old background)
        },
    });

    return Guest;
};
