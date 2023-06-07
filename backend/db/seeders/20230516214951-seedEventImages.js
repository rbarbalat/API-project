'use strict';

/** @type {import('sequelize-cli').Migration} */

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}

const arr =
[
  {
    eventId: 1,
    url: "https://appacademy-open-assets.s3.us-west-1.amazonaws.com/Modular-Curriculum/content/week-07/EventSight/new-york-city-sunset-skyline-river.jpg",
    preview: true
  },
  {
    eventId: 1,
    url: "https://appacademy-open-assets.s3.us-west-1.amazonaws.com/Modular-Curriculum/content/week-07/MyReads/sample-book-photo-1.png",
    preview: false
  },
  {
    eventId: 1,
    url: "https://appacademy-open-assets.s3.us-west-1.amazonaws.com/Modular-Curriculum/content/week-07/MyReads/sample-book-photo-2.png",
    preview: false
  },
  {
    eventId: 4,
    url: "https://appacademy-open-assets.s3.us-west-1.amazonaws.com/Modular-Curriculum/content/week-07/EventSight/new-york-city-brooklyn-bridge-river.jpg",
    preview: true
  },
  {
    eventId: 5,
    url: "https://appacademy-open-assets.s3.us-west-1.amazonaws.com/Modular-Curriculum/content/week-07/EventSight/new-york-manhattan-city-street-yellow-cabs.jpg",
    preview: true
  }
];

module.exports = {
  async up (queryInterface, Sequelize) {
    options.tableName = "EventImages";
    return await queryInterface.bulkInsert(options, arr, {});
  },

  async down (queryInterface, Sequelize) {
    options.tableName = "EventImages";
    const Op = Sequelize.Op;
    return await queryInterface.bulkDelete(options, {
      preview: {
      [Op.in]: [true, false]
    }
  }, {});
  }
};
