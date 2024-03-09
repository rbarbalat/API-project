'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Membership extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Membership.init({
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    userId: DataTypes.INTEGER,
    groupId: DataTypes.INTEGER,
    status: {
      type: DataTypes.ENUM,
      values: ["pending", "member", "co-host", "host", "Organizer"],
      validate: {
        isValidStatus(value)
        {
          if(["pending", "member", "co-host", "host", "Organizer"].includes(value) == false)
          throw new Error("Invalid status update message later");
        }
      }
    },
    memberId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Membership',
  });
  return Membership;
};
