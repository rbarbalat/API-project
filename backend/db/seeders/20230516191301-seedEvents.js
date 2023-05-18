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
    startDate:"2090-04-16",//pass in through new Date()
    endDate: "2090-04-17"
  },
  {
    groupId: 1,
    venueId: 2,
    name: "Event Two",
    description: "gah gah gah gah gah gah gah gah gah gah gah gah gah",
    type: "In person",
    capacity: 120,
    price: 16.17,
    startDate: "2090-04-18",
    endDate: "2090-04-18"
  },
  {
    groupId: 1,
    venueId: 3,
    name: "Event Three",
    description: "abc abc abc abc abc abc abc abc abc",
    type: "Online",
    capacity: 100,
    price: 13.37,
    startDate:"2090-03-16",
    endDate: "2090-04-01"
  },
  {
    groupId: 2,
    venueId: 4,
    name: "Event Four",
    description: "xyz xyz xyz xyz xyz xyz xyz xyz xyz xyz xyz xyz",
    type: "In person",
    capacity: 35,
    price: 5.84,
    startDate: "2090-05-19",
    endDate: "2090-05-19"
  },
  {
    groupId: 3,//matched to venueid 5 in venue seeder
    //allow null venues, try a second event for it w/ null venue
    name: "Event Five",
    description: "mno mno mno mno mno mno mno mno mno mno mno mno mno mno",
    type: "Online",
    capacity: 20,
    price: 3.37,
    startDate: "2090-04-06",
    endDate:"2090-04-11"
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
