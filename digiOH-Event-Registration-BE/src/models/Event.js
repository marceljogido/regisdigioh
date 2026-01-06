module.exports = (sequelize, DataTypes) => {
    const Event = sequelize.define("event", {
        name: { type: DataTypes.STRING, allowNull: false },
        start_date: { type: DataTypes.DATEONLY, allowNull: false },
        end_date: { type: DataTypes.DATEONLY, allowNull: false },
        sales: { type: DataTypes.STRING, allowNull: false },
        account_manager: { type: DataTypes.STRING, allowNull: false },
        company: { type: DataTypes.STRING, allowNull: true },
        event_time: { type: DataTypes.STRING, allowNull: true },
        loading_date: { type: DataTypes.DATE, allowNull: true },
        discord_channel: { type: DataTypes.STRING, allowNull: true },
        drive_folder: { type: DataTypes.STRING, allowNull: true },
        location: { type: DataTypes.STRING, allowNull: true },
        last_updated_by: { type: DataTypes.STRING, allowNull: true },
    });

    return Event;
};
