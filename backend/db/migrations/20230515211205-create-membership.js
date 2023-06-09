'use strict';
/** @type {import('sequelize-cli').Migration} */

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

module.exports = {
  async up(queryInterface, Sequelize) {
    return await queryInterface.createTable('Memberships', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: "Users",
          key: "id"
        },
        onDelete: "CASCADE"
      },
      groupId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: "Groups",
          key: "id"
        },
        onDelete: "CASCADE"
      },
      status: {
        //may have to check regular host and cap O on organizer
        type: Sequelize.ENUM("pending", "member", "co-host", "host", "Organizer"),
        allowNull: false,
        //defaulValue pending?
      },
      memberId: {
        //prob can be null while pending, check later
        //auto increment?
        type: Sequelize.INTEGER
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP")
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP")
      }
    }, options);
  },
  async down(queryInterface, Sequelize) {
    options.tableName = "Memberships"
    return await queryInterface.dropTable(options);
  }
};
