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
        const user = await User.create({
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          emailAddress: req.body.emailAddress,
          password: req.body.password
        });

        await user.update({
          password: bcrypt.hashSync(user.password, 10)
        })

        res.location('/').status(201);
        res.end();
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
      attributes: ['id', 'title', 'description', 'estimatedTime', 'materialsNeeded'],
      include: [{
        model: User,
        attributes: ['id', 'firstName', 'lastName', 'emailAddress']
      }]  
    })
    res.status(200).json(courses)
}));

// GET Route that returns all courses related to a single user id
router.get('/courses/:id', asyncHandler(async (req, res) => {
  let course = await Course.findAll({
    where: {
        id: req.params.id,
    },
    attributes: ['id', 'title', 'description', 'estimatedTime', 'materialsNeeded'],
    include: [{
      model: User,
      attributes: ['id', 'firstName', 'lastName', 'emailAddress']
    }]
  });
  res.status(200).json(course)
}));

// POST Route that creates a course
router.post('/courses', authenticateUser, asyncHandler(async (req, res) => {
  try {
      const course = await Course.create(req.body);
      console.log(course.id)
      res.location(`/courses/${course.id}`).status(201);
      res.end()
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
  const course = await Course.findAll({
    where: {
        id: req.params.id
    }
  })

  // first checks if the course belongs to the current user, then if the course exist and title/description is filled in.
  if(req.currentUser.id === course[0].dataValues.id){
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
      let errors = new Error(); 
      if(course){
        errors.message = "Title nor Descriptioin can be empty"
        res.status(400).json({ errors });
      }else{
        res.status(404).json({message: "Course Not Found"});
      }
    }
  } else {
    res.status(403).json({ message: 'Access Denied' });
  }
}));

// DELETE Route that will delete the corresponding course
router.delete('/courses/:id', authenticateUser, asyncHandler(async (req, res) => {
  let course = await Course.findAll({
    where: {id: req.params.id},
  });

  // first checks if course belongs to the current user, then if course exists:
  if(req.currentUser.id === course[0].dataValues.id){
    if(course){
      Course.destroy({ where: {id: req.params.id} });
      res.status(204).end();
    } else {
      res.status(404).json({message: "Course Not Found"});
    }
  } else {
    res.status(403).json({ message: 'Access Denied' });
  }
}));

module.exports = router;