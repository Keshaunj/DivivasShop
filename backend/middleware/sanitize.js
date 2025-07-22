const { sanitize } = require('express-mongo-sanitize');


module.exports = [
  (req, _, next) => {
    if (req.query) req.query = sanitize(req.query);
    if (req.body) req.body = sanitize(req.body);
    next();
  }
];