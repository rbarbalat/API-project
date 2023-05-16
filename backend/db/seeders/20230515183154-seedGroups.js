'use strict';
/** @type {import('sequelize-cli').Migration} */



let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}
const arr =
[
  {
    name: "Hockey on the Water",
    about: "Enjoy rounds of hockey with a tight-nit group of people on the water facing the Brooklyn Bridge. Singles or doubles.",
    type: "In person",
    private: true,
    city: "Pittsburgh",
    state: "PA",
    organizerId: 1
  },
  {
    name: "Soccer on the Water",
    about: "Enjoy rounds of soccer with a loose-nit group of people on the water facing the Brooklyn Bridge. Singles or doubles.",
    type: "Online",
    private: true,
    city: "Philadelphia",
    state: "PA",
    organizerId: 1
  },
  {
    name: "Baseball on the Water",
    about: "Enjoy rounds of baseball with a tight-nit group of people on the water facing the Brooklyn Bridge. Singles or doubles.",
    type: "In person",
    private: false,
    city: "Boston",
    state: "MA",
    organizerId: 1
  },
  {
    name: "Football on the Water",
    about: "Enjoy rounds of football with a tight-nit group of people on the water facing the Brooklyn Bridge. Singles or doubles.",
    type: "In person",
    private: false,
    city: "Boston",
    state: "MA",
    organizerId: 2
  },
  {
    name: "Lacrosse on the Water",
    about: "Enjoy rounds of lacrosse with a tight-nit group of people on the water facing the Brooklyn Bridge. Singles or doubles.",
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
