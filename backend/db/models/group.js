'use strict';
const {
  Model
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
      })
    }
  }
  Group.init({
    organizerId: DataTypes.INTEGER,
    name: {
      type: DataTypes.STRING,
      //allowNull: false,
      validate: {
        checkNameLength(value)
        {
          if(value.length > 60 || value.length < 1 || !value || value == "");
          {
            let err =  new Error("Name must be 60 characters or less");
            err.roman = true;
            throw err;
          }
        }
      }
    },
    about: {
      type: DataTypes.TEXT,
      //allowNull: false,
      validate: {
        isLongEnough(value)
        {
          if(value.length < 50 || !value || value == "")
          {
            let err =  new Error("About must be 50 characters or more");
            err.roman = true;
            throw err;
          }
        }
      }
    },
    type: {
      //allowNull: false,
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
      }
    }
    },
    private: {
      //allowNull: false,
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
        }
      }
    },
    city: {
      //allowNull: false,
      type: DataTypes.STRING,
      validate: {
        checkCity(value)
        {
          if(value == null || value == undefined || value == "")
          {
            let err =  new Error("City is required");
            err.roman = true;
            throw err;
          }
        }
      },
    },
    state: {
      //allowNull: false,
      type: DataTypes.STRING(2),
      validate: {
        checkState(value)
        {
          //does state have to be an abbreviation? maybe change the last one
          if(!value || value == "" || value.length != 2)
          {
            let err = new Error("State is required");
            err.roman = true;
            throw err;
          }
        }
      }
    }
  }, {
    sequelize,
    modelName: 'Group',
  });
  return Group;
};
