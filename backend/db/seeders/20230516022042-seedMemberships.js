'use strict';
/** @type {import('sequelize-cli').Migration} */
let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}

const arr =
[
  {
    userId: 1,
    groupId: 1,
    status: "Organizer"
  },
  {
    userId: 2,
    groupId: 1,
    status: "co-host"
  },
  {
    userId: 3,
    groupId: 1,
    status: "member"
  },
  {
    userId: 4,
    groupId: 1,
    status: "pending"
  },
  {
    userId: 1,
    groupId: 2,
    status: "Organizer"
  },
  {
    userId: 1,
    groupId: 3,
    status: "Organizer"
  },
  {
    userId: 2,
    groupId: 4,
    status: "Organizer"
  },
  {
    userId: 2,
    groupId: 5,
    status: "Organizer"
  }
];

module.exports = {
  async up (queryInterface, Sequelize) {
    options.tableName = "Memberships";
    return await queryInterface.bulkInsert(options, arr, {});
  },

  async down (queryInterface, Sequelize) {
    options.tableName = "Memberships";
    const Op = Sequelize.Op;
    return await queryInterface.bulkDelete(options, {
      status: {
      [Op.in]: ["Organizer", "co-host", "member", "pending"]
    }
  }, {});
  }
};
