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
    venueId: 1,
    name: "Event One",
    description: "blah blah blah blah blah blah blah blah blah blah blah blah",
    type: "Online",
    capacity: 100,
    price: 13.37,
    startDate: new Date("2020-04-16 08:30"),//pass in through new Date()
    endDate: new Date("2020-04-17 13:45")
  },
  {
    groupId: 1,
    venueId: 2,
    name: "Event Two",
    description: "gah gah gah gah gah gah gah gah gah gah gah gah gah",
    type: "In person",
    capacity: 120,
    price: 16.17,
    startDate: new Date("2090-04-18 01:15"),
    endDate: new Date("2090-04-19 21:20")
  },
  {
    groupId: 1,
    venueId: 3,
    name: "Event Three",
    description: "abc abc abc abc abc abc abc abc abc",
    type: "Online",
    capacity: 100,
    price: 13.37,
    startDate: new Date("2090-03-16 14:04"),
    endDate: new Date("2090-04-01 18:21")
  },
  {
    groupId: 2,
    venueId: 4,
    name: "Event Four",
    description: "xyz xyz xyz xyz xyz xyz xyz xyz xyz xyz xyz xyz",
    type: "In person",
    capacity: 35,
    price: 5.84,
    startDate: new Date("2090-05-19 05:22"),
    endDate: new Date("2090-05-19 09:47")
  },
  {
    groupId: 3,//matched to venueid 5 in venue seeder
    //allow null venues, try a second event for it w/ null venue
    name: "Event Five",
    description: "mno mno mno mno mno mno mno mno mno mno mno mno mno mno",
    type: "Online",
    capacity: 20,
    price: 3.37,
    startDate: new Date("2020-04-06 07:15"),
    endDate: new Date("2020-04-11 08:15")
  }
];

module.exports = {
  async up (queryInterface, Sequelize) {
    options.tableName = "Events";
    return await queryInterface.bulkInsert(options, arr, {});
  },

  async down (queryInterface, Sequelize) {
    options.tableName = "Events";
    const Op = Sequelize.Op;
    return await queryInterface.bulkDelete(options, {
      type: {
      [Op.in]: ["Online", "In person"]
  }
  }, {});
  }
};
