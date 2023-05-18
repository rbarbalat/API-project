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
      // A group belongsTo an organizer(user),
      Group.belongsTo(models.User, {
        foreignKey: "organizerId",
        as: "Organizer"
      });
      //A group belongsToMany (regular) Users
      Group.belongsToMany(models.User, {
        through: models.Membership,
        foreignKey: "groupId",
        otherKey: "userId",
        as: "Regulars"
      });
      Group.hasMany(models.Membership, {
        foreignKey: "groupId"
      })
      //A group hasMany images
      Group.hasMany(models.GroupImage, {
        foreignKey: "groupId",
        onDelete: "CASCADE",
        hooks: true
        //onUpdate?
      });
      //A group hasMany venues
      Group.hasMany(models.Venue, {
        foreignKey: "groupId",
        onDelete: "CASCADE",
        hooks: true
      });
      //A group belongsToManyVenues
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
        checkNameLength(value)
        {
          //can add Validator.isAlpha(value) if necessary later
          if(value.length > 60 || value.length < 1 || value == "")
          {
            let err =  new Error("Name must be 60 characters or less");
            err.roman = true;
            throw err;
          }
        },
        //this works but i'm not sure yet w/o tagging it but others need the tag...
        notNull: {
          msg: "Name must be 60 characters or less"
        }
      }
    },
    about: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        isLongEnough(value)
        {
          if(value.length < 50 || value == "")
          {
            let err =  new Error("About must be 50 characters or more");
            err.roman = true;
            throw err;
          }
        },
        notNull: {
          msg: "About must be 50 characters or more"
        }
      }
    },
    type: {
      allowNull: false,
      type: DataTypes.ENUM,
      values: ["Online", "In person"],
      validate: {
      isOnlineOrInPerson(value)
      {
        //value == null might not be checked, Alec had error in class
        if(["Online", "In person"].includes(value) == false)
        {
          let err = new Error("Type must be 'Online' or 'In person'");
          err.roman = true;
          throw err;
        }
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
            err.roman = true;
            throw err;
          }
        },
        notNull: {
          msg: "Private must be a boolean"
        }
      }
    },
    city: {
      allowNull: false,
      type: DataTypes.STRING,
      validate: {
        checkCity(value)
        {
          //add Validator.isAlpha(value) later?
          if(value == "")
          {
            let err =  new Error("City is required");
            err.roman = true;
            throw err;
          }
        },
        notNull: {
          msg: "City is required"
        }
      },
    },
    state: {
      allowNull: false,
      type: DataTypes.STRING(2),//change (2) if it doesn't have to be abbrev
      validate: {
        checkState(value)
        {
          //does state have to be an abbreviation? make it isAlpha?
          if(value.length != 2)
          {
            let err = new Error("State is required");
            throw err;
          }
        },
        notNull: {
          msg: "State is required"
        }
      }
    }
  }, {
    sequelize,
    modelName: 'Group',
  });
  return Group;
};
