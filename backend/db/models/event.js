'use strict';
const {
  Model, Validator
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Event extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // An event belongs to many users
      Event.belongsToMany(models.User, {
        through: models.Attendance,
        foreignKey: "eventId",
        otherKey: "userId"
      });
      Event.hasMany(models.Attendance, {
        foreignKey: "eventId"
      })
      //An event hasMany EventImages
      Event.hasMany(models.EventImage,{
        foreignKey: "eventId",
        onDelete: "CASCADE",
        hooks: true
      });
      Event.belongsTo(models.Group, {
        foreignKey: "groupId"
      });
      Event.belongsTo(models.Venue, {
        foreignKey: "venueId"
      })
    }
  }
  Event.init({
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    //venueId CAN BE NULL
    //have to do some checks if the venueId exists, look in specs
    //maybe this check in the route handler?
    venueId: DataTypes.INTEGER,
    groupId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: {
          msg: "groupId must be an integer"
        },
        notNull: {
          msg: "groupId can't be null"
        }
      }
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        checkLength(value)
        {
          //separate to avoid type error accessing .length of a num
          //but maybe they are all strings anyway since they are input that way?
          if(typeof value != "string")
          throw new Error("Name must be a string containing at least 5 characters")
          else if(value.length < 5)
          throw new Error("Name must be a string containing at least 5 characters")
        },
        notNull: {
          msg: "Name can't be null"
        }
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Description is required"
        },
        notNull: {
          msg: "Description can't be null"
        }
      }
    },
    type: {
      allowNull: false,
      type: DataTypes.ENUM,
      values: ["Online", "In person"],
      validate: {
        isIn: {
          args: [["Online", "In person"]],
          msg: "Type must be Online or In person"
          //online/inperson in "" in other response
        },
        notNull: {
          msg: "Type can't be null"
        }
      }
    },
    capacity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: {
          msg: "Capacity must be an integer"
        },
        notNull: {
          msg: "Capacity can't be null"
        }
      }
    },
    price: {
      type: DataTypes.DECIMAL,
      allowNull: false,
      validate: {
        isDecimal: {
          msg: "Price is invalid"
        },
        notNull: {
          msg: "Price can't be null"
        }
      }
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isDate: {
          msg: "Start date must be a date"
        },
        isAfter: {
          //nested array for double arguments but work for 1 as well?
          args: new Date().toString(),//might need custom
          msg: "Start date must be in the future"
        },
        notNull: {
          msg: "Start date can't be null"
        }
      }
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        afterStart(value)
        {
          if(!Validator.isDate(value))
          throw new Error("End date must be a date");
          else if(value <= this.startDate)
          throw new Error("End date is less than start date");
        },
        notNull: {
          msg: "End date can't be null"
        }
      }
    }
  }, {
    sequelize,
    modelName: 'Event',
  });
  return Event;
};
