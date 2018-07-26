const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const secret = require('../middleware/secret');
const router = express.Router();

// somebody tries to register
// 
//  request should look like this
//  req: {email: string, password: string}
// 
//  response should look like this
//  res: {
//    message: string,
//  }
// 
router.post('/register', (req, res, next) => {
  // hash password from request 
  bcrypt.hash( req.body.password, 10)
    .then( hash =>{
      // create new user for database from email and password
      const user = new User({
        email: req.body.email,
        password: hash
      });
      // save it
      user.save()
        .then( result => {
          // return success status and message
          res.status(201).json({
            message: 'User Created',
            // user: { _id: user._id, email: user.email }
          })
        })
        // or error message if we get one
        .catch( err => {
          res.status(500).json({error: err});
        })
    });
});

// somebody tries to login 
// 
//  request should look like this
//  req: {email: string, password: string}
// 
//  response should look like this
//  res: {
//    message: string,
//    token: string,
//    user: { email: string, _id: string },
//    expiresIn: number
//  }
// 
router.post('/login', (req, res, next) => {
  User.findOne( {email: req.body.email })
    .then( (user) => {
      // if a corresponding user found check for valid user password combo else set to false;
      const isValid = !!user ? bcrypt.compareSync( req.body.password, user.password ) : false;
      // if everthing is cool return user minus hashed password
      if (isValid && user) {
        return { _id: user._id, email: user.email };
      }      
      // throw basic error messages
      throw !user ? 'User not found' : 'Invalid password';
    }).then( (user) => {
      // create token
      const token = jwt.sign(
        {email: user.email, _id: user._id},
        secret, 
        { expiresIn: '30m' }
      );
      // send success response
      res.status(200).json({
        message: 'Logged in',
        token: token,
        user: user,
        expiresIn: 1800, // in seconds
      });
    })
      // send error response
    .catch( err => {
      return res.status(401).json({
        message: err,
        error: err
      })
    })
})

module.exports = router;