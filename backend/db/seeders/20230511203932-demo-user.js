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
    hashedPassword: bcrypt.hashSync('first'),
    firstName: "James",
    lastName: "Howlett"
  },
  {
    email: "mno@yahoo.com",
    username: "gambit",
    hashedPassword: bcrypt.hashSync('second'),
    firstName: "Remy",
    lastName: "Lebeau"
  },
  {
    email: "xyz@bing.com",
    username: "cyclops",
    hashedPassword: bcrypt.hashSync('third'),
    firstName: "Scott",
    lastName: "Summers"
  },
  {
    email: "superman@gmail.com",
    username: "superman",
    hashedPassword: bcrypt.hashSync('blahgahfah'),
    firstName: "Clark",
    lastName: "Kent"
  },
  {
    email: "batman@yahoo.com",
    username: "batman",
    hashedPassword: bcrypt.hashSync('gahblahfah'),
    firstName: "Bruce",
    lastName: "Wayne"
  },
  {
    email: "professor@bing.com",
    username: "professor",
    hashedPassword: bcrypt.hashSync('thirdsecond'),
    firstName: "Charles",
    lastName: "Xavier"
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
      username: { [Op.in]: ['wolverine', 'gambit', 'cyclops', 'superman', 'batman', 'professor'] }
    }, {});
  }
};
