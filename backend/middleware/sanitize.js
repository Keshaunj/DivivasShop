const sanitize = require('express-mongo-sanitize');

module.exports = (req, res, next) => {

  if (req.query) {
    req.query = JSON.parse(JSON.stringify(req.query));
  }
  if (req.body) {
    req.body = JSON.parse(JSON.stringify(req.body));
  }
  

  sanitize.sanitize(req.query);
  sanitize.sanitize(req.body);
  
  next();
};