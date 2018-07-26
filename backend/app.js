const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const app = express();

const postRoutes = require('./routes/posts')
const userRoutes = require('./routes/user')

mongoose.connect('mongodb://localhost:27017/max-post-tutorial')
  .then( () => {
    console.log('connected to mongo');
  }).catch( () => {
    console.error('connection to mongo failed')
  })

app.use( ( req, res, next ) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers', 
    'Origin X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.setHeader(
    'Access-Control-Allow-Methods', 
    'GET, POST, PATCH, DELETE, OPTIONS, PUT'
  );
  next();
})
app.use('/images', express.static(path.join('backend/images')) );
app.use( bodyParser.json() );

app.use( '/api/posts', postRoutes );
app.use( '/api/user', userRoutes );
module.exports = app;