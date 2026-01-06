module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define("user", {
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            isEmail: true
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        role : {
            type: DataTypes.ENUM,
            values: ['admin', 'user'],
            allowNull: false,
            defaultValue: 'user'
        }
    })

    return User
}
