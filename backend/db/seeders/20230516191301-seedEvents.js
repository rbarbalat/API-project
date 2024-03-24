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
    name: "Agility Competition",
    description: "An agility course consists of a set of standard obstacles laid out by a judge in a design of their own choosing in an area of a specified size. The surface may be of grass, dirt, rubber, or special matting.",
    type: "Online",
    capacity: 100,
    price: 13.37,
    startDate: new Date("2030-03-06 07:15"),
    endDate: new Date("2030-03-06 019:15")
  },
  {
    groupId: 1,
    venueId: 2,
    name: "Search and Rescue Training",
    description: "Train to find missing people and animals after natural or man made disasters.  Use your nose to find people under water, under snow and under collapsed buildings.",
    type: "In person",
    capacity: 120,
    price: 16.17,
    startDate: new Date("2029-04-11 14:15"),
    endDate: new Date("2029-04-12 07:15")
  },
  {
    groupId: 1,
    venueId: 3,
    name: "Assistance Dog Support",
    description: "Come talk to your colleagues about all the difficulties you encounter on the job dealing with humans who can't do anything on their own.  You need a break",
    type: "Online",
    capacity: 100,
    price: 13.37,
    startDate: new Date("2020-04-06 19:15"),
    endDate: new Date("2020-04-07 07:15")
  },
  {
    groupId: 2,
    venueId: 4,
    name: "Military Dogs",
    description: "Interested in the role of dogs in warfare, in the past and present?  We discuss our participation in man's most dangerous activity.",
    type: "In person",
    capacity: 35,
    price: 5.84,
    startDate: new Date("2090-05-19 05:37"),
    endDate: new Date("2090-05-21 15:41")
  },
  {
    groupId: 3,//matched to venueid 5 in venue seeder
    name: "Swim Lessons",
    description: "Are you terrified of the water?  Join this group for a gentle introduction to the world of water.  Get comfortable in the pool or the ocean in no time.",
    type: "Online",
    capacity: 20,
    price: 3.37,
    startDate: new Date("2020-04-06 07:31"),
    endDate: new Date("2020-04-07 12:15")
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
