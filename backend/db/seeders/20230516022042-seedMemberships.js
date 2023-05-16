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
    status: "Organizer",
    memberId: 1
  },
  {
    userId: 2,
    groupId: 1,
    status: "co-host",
    memberId: 2
  },
  {
    userId: 3,
    groupId: 1,
    status: "member",
    memberId: 3
  },
  {
    userId: 4,
    groupId: 1,
    status: "pending",
    memberId: 4
  },
  {
    userId: 5,
    groupId: 1,
    status: "host",
    memberId: 5
  },
  {
    userId: 6,
    groupId: 1,
    status: "member",
    memberId: 6
  }
];

module.exports = {
  async up (queryInterface, Sequelize) {
    options.tableName = "Memberships";
    return await queryInterface.bulkInsert(options, arr, {});
  },

  async down (queryInterface, Sequelize) {
    options.tableName = "Memberships";
    return await queryInterface.bulkDelete(options, {
      memberId: {
      [Op.in]: [1, 2, 3, 4, 5, 6]
    }
  }, {});
  }
};
