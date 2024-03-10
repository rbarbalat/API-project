'use strict';
const {
  Model, Validator
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Group extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Group.belongsTo(models.User, {
        foreignKey: "organizerId",
        as: "Organizer"
      });
      Group.belongsToMany(models.User, {
        through: models.Membership,
        foreignKey: "groupId",
        otherKey: "userId",
        as: "Regulars"
      });
      Group.hasMany(models.Membership, {
        foreignKey: "groupId"
      })
      Group.hasMany(models.GroupImage, {
        foreignKey: "groupId",
        onDelete: "CASCADE",
        hooks: true
      });
      Group.hasMany(models.Venue, {
        foreignKey: "groupId",
        onDelete: "CASCADE",
        hooks: true
      });
      Group.belongsToMany(models.Venue,{
        through: models.Event,
        foreignKey: "groupId",
        otherKey: "venueId",
        as: "EventVenues"
      });
      Group.hasMany(models.Event, {
        foreignKey: "groupId"
      })
    }
  }
  Group.init({
    organizerId: DataTypes.INTEGER,
    name: {
      type: DataTypes.STRING(61),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "name can't be an empty string"
        },
        checkNameLength(value)
        {
          if(value.length > 60)
          {
            let err =  new Error("Name must be 60 characters or less");
            throw err;
          }
        },
        notNull: {
          msg: "Name can't be null"
        }
      }
    },
    about: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        isLongEnough(value)
        {
          if(value.length < 30 || value == "")
          {
            let err =  new Error("About must be 50 characters or more");
            throw err;
          }
        },
        notNull: {
          msg: "About can't be null"
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
          msg: "Type must be 'Online' or 'In person'"
        }
      }
    },
    private: {
      allowNull: false,
      type: DataTypes.BOOLEAN,
      validate: {
        checkIfBoolean(value)
        {
          if([0, 1, true, false].includes(value) == false)
          {
            let err =  new Error("Private must be a boolean");
            throw err;
          }
        },
        notNull: {
          msg: "Private can't be null"
        }
      }
    },
    city: {
      allowNull: false,
      type: DataTypes.STRING,
      validate: {
        notEmpty: {
          msg: "City is required"
       },
        notNull: {
          msg: "City can't be null"
        }
      },
    },
    state: {
      allowNull: false,
      //change in migration file as well if you change here
      type: DataTypes.STRING,
      validate: {
        notEmpty: {
          msg: "State is required"
        },
        notNull: {
          msg: "State can't be null"
        }
      }
    }
  }, {
    sequelize,
    modelName: 'Group',
  });
  return Group;
};
