const jwt = require('jsonwebtoken');

const secret = require('./secret');


module.exports = ( req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, secret);
    req.userData = {_id: decodedToken._id, email: decodedToken.email };
    next();
  } catch (error) {
    res.status(401).json({
      message: 'auth failed',
    })
  }

}