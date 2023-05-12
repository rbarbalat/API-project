'use strict';
/** @type {import('sequelize-cli').Migration} */

const bcrypt = require("bcryptjs");

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}
const arr =
[
  {
    email: "abc@gmail.com",
    username: "wolverine",
    hashedPassword: bcrypt.hashSync('first')
  },
  {
    email: "mno@yahoo.com",
    username: "gambit",
    hashedPassword: bcrypt.hashSync('second')
  },
  {
    email: "xyz@bing.com",
    username: "cyclops",
    hashedPassword: bcrypt.hashSync('third')
  }
];
module.exports = {
  async up (queryInterface, Sequelize) {
   options.tableName = "Users";
   return await queryInterface.bulkInsert(options, arr, {});
  },

  async down (queryInterface, Sequelize) {
    options.tableName = "Users";
    const Op = Sequelize.Op;
    return await queryInterface.bulkDelete(options, {
      username: { [Op.in]: ['wolverine', 'gambit', 'cyclops'] }
    }, {});
  }
};