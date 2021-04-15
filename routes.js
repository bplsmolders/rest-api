'use strict';
const express = require('express');
const { User } = require('./models');
const { Course } = require('./models');
const { authenticateUser } = require('./middleware/auth-user');
const bcrypt = require('bcrypt')


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
        const hashedPassword = bcrypt.hashSync(req.body.password, 10);
        await User.create({
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          emailAddress: req.body.emailAddress,
          password: hashedPassword
        });
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
    let courses = await Course.findAll({
      attributes: ['id', 'title', 'description', 'estimatedTime', 'materialsNeeded']
    })
    res.status(200).json(courses)
}));

// GET Route that returns all courses related to a single user id
router.get('/courses/:id', asyncHandler(async (req, res) => {
  let course = await Course.findAll({
    where: {
        id: req.params.id
    },
    attributes: ['id', 'title', 'description', 'estimatedTime', 'materialsNeeded'],
  });
  res.status(200).json(course)
}));

// POST Route that creates a course
router.post('/courses', authenticateUser, asyncHandler(async (req, res) => {
  try {
      await Course.create(req.body);
      res.status(201).json({ "message": "Course successfully created!" });
  } catch (error) {
      if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
        const errors = error.errors.map(err => err.message);
        res.status(400).json({ errors });   
      } else {
        throw error;
      }
  }    
}));

// PUT Route that will update the corresponding course
router.put('/courses/:id', authenticateUser, asyncHandler(async (req, res) => {
  let course = await Course.findAll({
    where: {
        id: req.params.id
    }
  })
  // && course.title && course.description
  if(course && req.body.title && req.body.description){
    await Course.update({
      title: req.body.title,
      description: req.body.description,
      estimatedTime: req.body.estimatedTime,
      materialsNeeded: req.body.materialsNeeded,
      userId: req.body.userId
    }, {
      where: {id: req.params.id}
    })
    res.status(204).end();
  } else {
    if(course){
      res.status(400).json({message: "Title nor Descriptioin can be empty"});
    }else{
      res.status(404).json({message: "Course Not Found"});
    }
  }
}));

// DELETE Route that will delete the corresponding course
router.delete('/courses/:id', authenticateUser, asyncHandler(async (req, res) => {
  let course = await Course.findAll({
    where: {id: req.params.id}
  });

  if(course){
    Course.destroy({ where: {id: req.params.id} });
    res.status(204).end();
  } else {
    res.status(404).json({message: "Course Not Found"});
  }
}));

module.exports = router;