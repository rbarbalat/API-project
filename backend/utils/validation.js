const { validationResult } = require('express-validator');

// middleware for formatting errors from express-validator middleware
// (to customize, see express-validator's documentation)
const handleValidationErrors = (req, _res, next) => {
  const validationErrors = validationResult(req);
  //console.log(validationErrors.array());
  const arr = validationErrors.array();
  if(arr.length != 0)
  {
    const errors = {};
    arr.forEach(ele => {
      errors[ele.path] = ele.msg;
    })

    const err = new Error();
    err.title = "Validation Error"
    err.errors = errors;
    err.roman = true;
    next(err);
  }
  next();
};

module.exports = {
  handleValidationErrors
};
