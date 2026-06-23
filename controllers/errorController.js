const AppError = require('../utils/appError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 404);
};

const handleDuplicateFieldsDB = (err) => {
  const [[field, value]] = Object.entries(err.keyValue);

  const message = `Duplicate ${field} value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError('Invalid token. Please log in again', 401);

const handleJWTExpiredError = () =>
  new AppError('Your token has expired. please log in again.', 401);

const sendErrorDev = (err, req, res) => {
  //A) API
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }

  //B) RENDERED WEBSITE
  console.error('ERROR 💥', err);

  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: err.message,
  });
};

const sendErrorProd = (err, req, res) => {
  //a) API
  if (req.originalUrl.startsWith('/api')) {
    //A) Operational, trusted error: send message to client
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }

    //B) Programming or other unknown error: don't leak error deatails
    //1. log error
    console.error('ERROR 💥', err);

    //2. send a generic message
    return res.status(500).json({
      status: 'error',
      message: 'Something went wrong',
    });
  }

  // B) RENDERED WEBSITE
  //A) Operational, trusted error: send message to client
  if (err.isOperational) {
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong!',
      msg: err.message,
    });
  }

  // B) Programming or other unknown error: don't leak error deatails
  //1. log error
  console.error('ERROR 💥', err);

  //2. send a generic message
  return res.status(res.statusCode).render('error', {
    title: 'Something went  wrong!',
    msg: 'Please try again',
  });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    // let error = { ...err, name: err.name };

    let error = Object.create(
      Object.getPrototypeOf(err),
      Object.getOwnPropertyDescriptors(err),
    );
    error.name = err.name;
    error.code = err.code;

    if (error.name === 'CastError') error = handleCastErrorDB(error); // created by mongoose

    if (error.code === 11000) error = handleDuplicateFieldsDB(error); // created by  mongoDB

    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);
    // created by mongoose

    if (error.name === 'JsonWebTokenError') error = handleJWTError(); // created by JWT
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError(); // created by JWT

    sendErrorProd(error, req, res);
  }
};
