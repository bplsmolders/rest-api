'use strict';
const express = require('express');
const { User } = require('./models');
const { Course } = require('./models');
const { authenticateUser } = require('./middleware/auth-user');
const fs = require('fs');



/* Handler function to wrap each route. */
function asyncHandler(cb){
    return async(req, res, next) => {
      try {
        await cb(req, res, next)
      } catch(error){
        // Forward error to the global error handler
        next(error);
      }
    }
}

// function to update a record
function save(data){
  return new Promise((resolve, reject) => {
    fs.writeFile('data.json', JSON.stringify(data, null, 2), (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

// Construct a router instance.
const router = express.Router();

// GET Route that the currently authenticated user
router.get('/users', authenticateUser, asyncHandler(async (req, res) => {
    const user = req.currentUser;

    res.status(200).json({
      firstName: user.firstName,
      lastName: user.lastName,
      emailAdress: user.emailAddress
    });
}));

// POST Route that creates a new user
router.post('/users', asyncHandler(async (req, res) => {
    try {
        await User.create(req.body);
        res.status(201).json({ "message": "Account successfully created!" });
    } catch (error) {
        if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
          const errors = error.errors.map(err => err.message);
          res.status(400).json({ errors });   
        } else {
          throw error;
        }
    }    
}));

// GET Route that returns all courses available
router.get('/courses', asyncHandler(async (req, res) => {
    let courses = await Course.findAll({})
    res.status(200).json(courses)
}));


// GET Route that returns all courses related to a single user id
router.get('/courses/:id', asyncHandler(async (req, res) => {
    let course = await Course.findAll({
        where: {
            id: req.params.id
        }
    });
    res.status(200).json(course)
}));


// PUT Route that will update the corresponding course
router.put('/courses/:id', authenticateUser, asyncHandler(async (req, res) => {
  let course = await Course.findAll({
    where: {
        id: req.params.id
    }
  });

  if(course){
    course.title = req.body.title;
    course.description = req.body.description;
    course.estimatedTime = req.body.estimatedTime;
    course.materialsNeeded = req.body.materialsNeeded;

    res.status(204).end();
  } else {
    res.status(404).json({message: "Quote Not Found"});
  }
}));



module.exports = router;