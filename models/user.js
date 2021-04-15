'use strict';
const {Model} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {}
  User.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false
    }, 
    lastName:{
      type: DataTypes.STRING,
      allowNull: false
    }, 
    emailAddress: {
      type: DataTypes.STRING,
      allowNull: false
    }, 
    password: {
      type: DataTypes.STRING,
      allowNull: false
    } 
  }, 
  {
    sequelize,
    modelName: 'User',
  });

  User.associate = (models) => {
    User.hasMany(models.Course, {
      foreignKey: {
        fieldName: 'userId',
        allowNull: false
    }})
  };

  return User;
};