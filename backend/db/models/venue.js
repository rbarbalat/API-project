'use strict';
const {
  Model, Validator
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Venue extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // A venue belongstoMany groups
      Venue.belongsToMany(models.Group, {
        through: models.Event,
        foreignKey: "venueId",
        otherKey: "groupId"
      });
    }
  }
  Venue.init({
    groupId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: {
          msg: "Must be an integer"
        },
        notNull: {
          msg: "groupId can't be null"
        }
      }
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Street address is required"
        },
        notNull: {
          msg: "Street address can't be null"
        }
      }
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isAlpha: {
          msg: "City can only contain letters"
        },
        notEmpty: {
          msg: "City is required"
        },
        notNull: {
          msg: "City can't be null"
        }
      }
    },
    state: {
      //if change mig file to String(2), add custom
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isAlpha: {
          msg: "State can only contain letters"
        },
        notEmpty: {
          msg: "State is required"
        },
        notNull: {
          msg: "State can't be null"
        }
      }
    },
    lat: {
      type: DataTypes.DECIMAL,
      allowNull: false,
      validate: {
        isDecimal: {
          msg: "Latitude is not valid"
        },
        notNull: {
          msg: "Latitude can't be null"
        }
      }
    },
    lng: {
      type: DataTypes.DECIMAL,
      allowNull: false,
      validate: {
        isDecimal: {
          msg: "Longitude is not valid"
        },
        notNull: {
          msg: "Longitude can't be null"
        }
      }
    }
  }, {
    sequelize,
    modelName: 'Venue',
  });
  return Venue;
};
