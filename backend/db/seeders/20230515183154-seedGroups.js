'use strict';
/** @type {import('sequelize-cli').Migration} */



let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}
const arr =
[
  {
    name: "Australian Shepherds",
    about: "Originally used solely as a herding dog, the Australian Shepherd has become one of the most popular companion dog breeds in North America.",
    type: "In person",
    private: true,
    city: "Pittsburgh",
    state: "PA",
    organizerId: 1
  },
  {
    name: "Golden Retrievers",
    about: "Golden Retrievers are characterized by their gentle and affectionate nature and a striking golden coat.",
    type: "Online",
    private: true,
    city: "Philadelphia",
    state: "PA",
    organizerId: 1
  },
  {
    name: "German Shepherds",
    about: "Originally bred as a herding dog, it is commonly kept as a companion dog but is also used for many types of work.",
    type: "In person",
    private: false,
    city: "Boston",
    state: "MA",
    organizerId: 1
  },
  {
    name: "Alaskan Malamutes",
    about: "Legenday for their endurance and ability to haul heavy freight.",
    type: "In person",
    private: false,
    city: "Boston",
    state: "MA",
    organizerId: 2
  },
  {
    name: "Siberian Huskies",
    about: "Notable for their cold weather tolerance and overall hardiness, they are great sled racing dogs.",
    type: "Online",
    private: false,
    city: "Denver",
    state: "CO",
    organizerId: 2
  }
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    options.tableName = "Groups";
    return await queryInterface.bulkInsert(options, arr, {});
  },

  async down (queryInterface, Sequelize) {
    options.tableName = "Groups";
    const Op = Sequelize.Op;
    return await queryInterface.bulkDelete(options, {
        name: {
        [Op.in]:
        [
          "Hockey on the Water",
          "Soccer on the Water",
          "Baseball on the Water",
          "Football on the Water",
          "Lacrosse on the Water"
        ]
    }
    }, {});
  }
};
