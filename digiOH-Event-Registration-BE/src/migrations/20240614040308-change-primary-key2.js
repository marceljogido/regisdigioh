'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Menjadikan kolom `id` sebagai primary key
    await queryInterface.changeColumn('attrs', 'id', {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    });

    // 2. Menjadikan kolom `guest_id` sebagai non-primary key
    await queryInterface.changeColumn('attrs', 'guest_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: false,
    });

    // 3. Menjadikan kolom `event_id` sebagai non-primary key
    await queryInterface.changeColumn('attrs', 'event_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: false,
    });
  },

  down: async (queryInterface, Sequelize) => {
    // 1. Mengembalikan kolom `id` agar tidak menjadi primary key
    await queryInterface.changeColumn('attrs', 'id', {
      type: Sequelize.INTEGER,
      allowNull: false,
      autoIncrement: false,
    });

    // 2. Mengembalikan kolom `guest_id` sebagai primary key
    await queryInterface.changeColumn('attrs', 'guest_id', {
      type: Sequelize.INTEGER,
      primaryKey: true,
      allowNull: false,
    });

    // 3. Mengembalikan kolom `event_id` sebagai primary key
    await queryInterface.changeColumn('attrs', 'event_id', {
      type: Sequelize.INTEGER,
      primaryKey: true,
      allowNull: false,
    });
  }
};
