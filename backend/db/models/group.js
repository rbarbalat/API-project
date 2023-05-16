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
      })
    }
  }
  Group.init({
    organizerId: DataTypes.INTEGER,
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      // validate: {
      //   checkNameLength(value)
      //   {
      //     if(value.length > 60 || value.length < 1);
      //     throw new Error("Name must be 60 characters or less");
      //   }
      // }
    },
    about: {
      type: DataTypes.TEXT,
      allowNull: false,
      // validate: {
      //   isLongEnough(value)
      //   {
      //     if(value.length < 50)
      //     throw new Error("About must be 50 characters or more")
      //   }
      // }
    },
    type: {
      allowNull: false,
      type: DataTypes.ENUM,
      values: ["Online", "In person"],
      // isOnlineOrInPerson(value)
      // {
      //   //value == null might not be checked, Alec had error in class
      //   if(["Online", "In person"].includes(value) == false)
      //   throw new Error("Type must be 'Online' or 'In person'");
      // }
    },
    private: {
      allowNull: false,
      type: DataTypes.BOOLEAN,
      // validate: {
      //   checkIfBoolean(value)
      //   {
      //     if(["0", "1", "true", "false"].includes(value) == false)
      //     throw new Error("Private must be a boolean");
      //   }
      // }
    },
    city: {
      allowNull: false,
      type: DataTypes.STRING,
      // validate: {
      //   isAlpha: {//maybe something extra that needs to be removed
      //     msg: "City is required"
      //   },
      // }
    },
    state: {
      allowNull: false,
      type: DataTypes.STRING(2),
      // validate: {
      //   checkStateFormat(value)
      //   {
      //     //not clear if we need this
      //     if(value.length != 2 || Validator.isAlpha(value) == false)
      //     //throw new Error("A valid state is composed of exactly two letters")
      //     throw new Error("State is required");
      //   },
      // }
    }
  }, {
    sequelize,
    modelName: 'Group',
  });
  return Group;
};
