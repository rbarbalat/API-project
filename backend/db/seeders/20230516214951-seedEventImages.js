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
    url: "www.abc.com",
    preview: true
  },
  {
    eventId: 1,
    url: "www.def.com",
    preview: false
  },
  {
    eventId: 1,
    url: "www.ghi.com",
    preview: true
  },
  {
    eventId: 2,
    url: "www.jkl.com",
    preview: true
  },
  {
    eventId: 3,
    url: "www.mnop.com",
    preview: false
  }
];

module.exports = {
  async up (queryInterface, Sequelize) {
    options.tableName = "EventImages";
    return await queryInterface.bulkInsert(options, arr, {});
  },

  async down (queryInterface, Sequelize) {
    options.tableName = "EventImages";
    const Op = Sequelize.Op;
    return await queryInterface.bulkDelete(options, {
      preview: {
      [Op.in]: [true, false]
    }
  }, {});
  }
};
