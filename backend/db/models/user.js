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
      });
      User.belongsToMany(models.Event, {
        through: models.Attendance,
        foreignKey: "userId",
        otherKey: "eventId"
      })
    }
  }
  User.init({
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        len: {
          args: [4, 30],
          msg: "Username must have between 4 and 30 characters"
        },
        isNotEmail(value)
        {
          if(Validator.isEmail(value))
          throw new Error("Username can't be an email")
        }
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        len: [3, 256],
        //isEmail: true
        isEmail: {
          msg: "Invalid Email"
        }
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
        //len: [1, 30],
        len: {
          args: [1, 30],
          msg: "First name must have between 1 and 30 characters"
        },
        notNull: {
          msg: "firstName can't be null"
        },
        isAlpha: {
          msg: "First Name is invalid"
        }
      }
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: {
          args: [1, 30],
          msg: "Last name must have been 1 and 30 characters"
        },
        isAlpha: {
          msg: "Last Name is invalid"
        },
        notNull: {
          msg: "lastName can't be null"
        }
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
