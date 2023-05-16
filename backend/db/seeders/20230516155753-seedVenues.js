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
    address: "123 Murray Ave",
    city: "Pittsburgh",
    state: "PA",
    lat: 30.331,
    lng: 12.2967
  },
  {
    groupId: 1,
    address: "345 Forbes Ave",
    city: "Pheonix",
    state: "AZ",
    lat: 21.22,
    lng: 13.79
  },
  {
    groupId: 1,
    address: "567 Shady Ave",
    city: "Los Angeles",
    state: "CA",
    lat: 17.51,
    lng: 10
  },
  {
    groupId: 2,
    address: "123 Greenfield St",
    city: "Pittsburgh",
    state: "PA",
    lat: 1,
    lng: 2
  },
  {
    groupId: 3,
    address: "432 Forward Ave",
    city: "Cleveland",
    state: "OH",
    lat: 1.27,
    lng: 3.536
  }
];

module.exports = {
  async up (queryInterface, Sequelize) {
    options.tableName = "Venues";
    return await queryInterface.bulkInsert(options, arr, {});
  },

  async down (queryInterface, Sequelize) {
    options.tableName = "Venues";
    const Op = Sequelize.Op;
    return await queryInterface.bulkDelete(options, {
      groupId: {
      [Op.in]: [1,2,3]
  }
  }, {});
  }
};
