const { sanitize } = require('express-mongo-sanitize');
const { query, body } = require('express-validator');

module.exports = [
  
  query('*').escape(), 
  body('*').escape(),   


  (req, res, next) => {
    req.sanitizedQuery = req.query ? sanitize({ ...req.query }) : {};
    req.sanitizedBody = req.body ? sanitize({ ...req.body }) : {};
    next();
  }
];