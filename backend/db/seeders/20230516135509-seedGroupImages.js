'use strict';
/** @type {import('sequelize-cli').Migration} */

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}

const arr =
[
  {
    groupId: 1,
    url: "www.google.com",
    preview: true
  },
  {
    groupId: 1,
    url: "www.yahoo.com",
    preview: false
  },
  {
    groupId: 1,
    url: "www.bing.com",
    preview: false
  },
  {
    groupId: 2,
    url: "www.reddit.com",
    preview: true
  },
  {
    groupId: 3,
    url: "www.penguins.com",
    preview: false
  }
]
module.exports = {
  async up (queryInterface, Sequelize) {
    options.tableName = "GroupImages";
    return await queryInterface.bulkInsert(options, arr, {});
  },

  async down (queryInterface, Sequelize) {
    options.tableName = "GroupImages";
    return await queryInterface.bulkDelete(options, {
      preview: {
      [Op.in]:
      [
        true,
        false,
      ]
  }
  }, {});
  }
};
