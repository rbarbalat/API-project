'use strict';
const { Model, Validator } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // A user(organizer) hasMany Groups
      User.hasMany(models.Group, {
        foreignKey: "organizerId",
        //check if actually need cascade
        onDelete: "CASCADE",
        hooks: true,
        //onUpdate?
      });
      //a (regular) User belongsToMany Groups
      User.belongsToMany(models.Group, {
        through: models.Membership,
        foreignKey: "userId",
        otherKey: "groupId"
        //onDelete goes in the migr file if nec
      })
    }
  }
  User.init({
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        len: [4,30],
        isNotEmail(value)
        {
          //unfortunately had v instead of V
          //when merged auth-setup branch, fixed on signup branch
          if(Validator.isEmail(value))
          throw new Error("Cannot be an email")
        }
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        len: [3, 256],
        isEmail: true
      }
    },
    hashedPassword: {
      type: DataTypes.STRING.BINARY,
      allowNull: false,
      validate: {
        len: [60,60]
      }
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1, 30],
        isAlpha: true
      }
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1, 30],
        isAlpha: true
      }
    }
  }, {
    sequelize,
    modelName: 'User',
    defaultScope: {
      attributes: {
        //email included according to api docs
        exclude: ["hashedPassword", "updatedAt", "createdAt"]
      }
    }
  });
  return User;
};
