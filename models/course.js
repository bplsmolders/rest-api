'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Course extends Model {}
  Course.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    }, 
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    }, 
    estimatedTime: {
      type: DataTypes.STRING,
      allowNull: true
    }, 
    materialsNeeded: {
      type: DataTypes.STRING,
      allowNull: true
    } 
  }, 
  {
    sequelize,
    modelName: 'Course',
  });

  Course.associate = (models) => {
    Course.belongsTo(models.User, {
      foreignKey: {
        fieldName: 'userId',
        allowNull: false
      }
    });
  };

  return Course;
};