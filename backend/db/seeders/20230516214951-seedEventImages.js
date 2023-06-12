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
    url: "https://upload.wikimedia.org/wikipedia/commons/1/1f/Chinese_Crested_hairless_agility.jpg",
    preview: true
  },
  {
    eventId: 2,
    url: "https://upload.wikimedia.org/wikipedia/commons/b/b6/US_Navy_040807-N-0331L-002_Rudy_Hutchinson_and_Susan_Frank_are_led_by_cadaver_dog%2C_Tucker_during_the_recovery_of_a_Navy_P-2V_Neptune_aircraft_that_crashed_over_Greenland_in_1962.jpg",
    preview: true
  },
  {
    eventId: 3,
    url: "https://upload.wikimedia.org/wikipedia/commons/b/b1/Hearing_dog%2C_2011.jpg",
    preview: true
  },
  {
    eventId: 4,
    url: "https://upload.wikimedia.org/wikipedia/commons/c/c7/U.S._Air_Force_military_working_dog_Jackson_sits_on_a_U.S._Army_M2A3_Bradley_Fighting_Vehicle_before_heading_out_on_a_mission_in_Kahn_Bani_Sahd%2C_Iraq%2C_Feb._13%2C_2007.jpg",
    preview: true
  },
  {
    eventId: 5,
    url: "https://upload.wikimedia.org/wikipedia/commons/9/93/20060128DalmenyOtto_002.jpg",
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
