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
    url: "https://en.wikipedia.org/wiki/Alaskan_Malamute#/media/File:Alaskan_malamut_465.jpg",
    preview: true
  },
  {
    groupId: 1,
    url: "https://en.wikipedia.org/wiki/Alaskan_Malamute#/media/File:Alaskan_Malamute.jpg",
    preview: false
  },
  {
    groupId: 1,
    url: "https://en.wikipedia.org/wiki/Husky#/media/File:Huskiesatrest.jpg",
    preview: false
  },
  {
    groupId: 2,
    url: "https://en.wikipedia.org/wiki/Bear#/media/File:Ours_brun_parcanimalierpyrenees_1.jpg",
    preview: true
  },
  {
    groupId: 3,
    url: "https://upload.wikimedia.org/wikipedia/commons/0/0b/Penguins_collage.png",
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
