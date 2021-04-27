'use strict';
const {Model} = require('sequelize');
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
      allowNull: false,
      validate: {
        notNull: {
          msg: 'A title is required'
        },
        notEmpty: {
          msg: 'Please provide a title'
        }
      }
    }, 
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'A description is required'
        },
        notEmpty: {
          msg: 'Please provide a description'
        }
      }

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
      }
    });
  };

  return Course;
};