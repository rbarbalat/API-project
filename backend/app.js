const express = require('express');
require('express-async-errors');
const morgan = require('morgan');
const cors = require('cors');
const csurf = require('csurf');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');

const routes = require('./routes');

const { environment } = require('./config');
const isProduction = environment === 'production';

const { ValidationError } = require('sequelize');

const app = express();

app.use(morgan('dev'));

app.use(cookieParser());
//this line for aws
//app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Security Middleware
if (!isProduction) {
  // enable cors only in development
  app.use(cors());
}

  // helmet helps set a variety of headers to better secure your app
app.use(
  helmet.crossOriginResourcePolicy({
    policy: "cross-origin"
  })
);

  // Set the _csrf token and create req.csrfToken method
app.use(
  csurf({
    cookie: {
      secure: isProduction,
      sameSite: isProduction && "Lax",
      httpOnly: true
    }
  })
);

app.use(routes);

// Catch unhandled requests and forward to error handler.
app.use((_req, _res, next) => {
  const err = new Error("The requested resource couldn't be found.");
  err.title = "Resource Not Found";
  err.errors = { message: "The requested resource couldn't be found." };
  err.status = 404;

  next(err);
});

// Process sequelize errors
app.use((err, _req, _res, next) => {
  // check if error is a Sequelize error:
  if (err instanceof ValidationError) {
    let errors = {};
    for (let error of err.errors) {
      errors[error.path] = error.message;
    }
    err.title = 'Validation error';
    err.errors = errors;
    //tag sequelize errors and adjust their format
    //inside the final formatter
    err.customValidation = true;
  }
  next(err);
});

// Error formatter
app.use((err, _req, res, _next) => {
  //reformat according to api specs
  if(err.customValidation === true)
  {
    res.status(400);
    return res.json({
      message: "Validation error",
      errors: err.errors
    });
  }
  //reformat according to api specs
  if(err.authentication === true)
  {
    res.status(401);
    return res.json({ message: "Authentication required" });
  }


  res.status(err.status || 500);
  res.json({
    title: err.title || 'Server Error',
    message: err.message,
    errors: err.errors,
    stack: isProduction ? null : err.stack
  });
});

  module.exports = app;
