'use strict';

/** @type {import('sequelize-cli').Migration} */
let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}

const arr =
[
  {
    eventId: 1,
    userId: 1,
    status: "attending"
  },
  {
    eventId: 2,
    userId: 1,
    status: "attending"
  },
  {
    eventId: 3,
    userId: 1,
    status: "attending"
  },
  {
    eventId: 1,
    userId: 3,
    status: "pending"
  },
  {
    eventId: 1,
    userId: 4,
    status: "waitlist"
  }
];

module.exports = {
  async up (queryInterface, Sequelize) {
    options.tableName = "Attendances";
    return await queryInterface.bulkInsert(options, arr, {});
  },

  async down (queryInterface, Sequelize) {
    options.tableName = "Attendances";
    const Op = Sequelize.Op;
    return await queryInterface.bulkDelete(options, {
      status: {
      [Op.in]: ["attending", "waitlist", "pending"]
  }
  }, {});
  }
};
