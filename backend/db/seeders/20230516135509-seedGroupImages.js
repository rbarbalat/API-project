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
    url: "https://upload.wikimedia.org/wikipedia/commons/4/4b/Australian_Shepherd_Black_Tri%2C_Red_Tri%2C_Blue_Merle.jpg",
    preview: true
  },
  {
    groupId: 4,
    url: "https://upload.wikimedia.org/wikipedia/commons/9/9f/Alaskan_Malamute.jpg",
    preview: true
  },
  {
    groupId: 5,
    url: "https://upload.wikimedia.org/wikipedia/commons/7/7a/Huskiesatrest.jpg",
    preview: true
  },
  {
    groupId: 2,
    url: "https://upload.wikimedia.org/wikipedia/commons/b/bd/Golden_Retriever_Dukedestiny01_drvd.jpg",
    preview: true
  },
  {
    groupId: 3,
    url: "https://upload.wikimedia.org/wikipedia/commons/d/d0/German_Shepherd_-_DSC_0346_%2810096362833%29.jpg",
    preview: true
  }
]
module.exports = {
  async up (queryInterface, Sequelize) {
    options.tableName = "GroupImages";
    return await queryInterface.bulkInsert(options, arr, {});
  },

  async down (queryInterface, Sequelize) {
    options.tableName = "GroupImages";
    const Op = Sequelize.Op;
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
