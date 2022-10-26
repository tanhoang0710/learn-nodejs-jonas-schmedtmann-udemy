const AppError = require('../utils/appError');

const handleCastErrorDB = (err) => {
    const message = `Invalid ${err.path}: ${err.value}.`;
    return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
    // const value = err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];
    // console.log(err);
    const message = `Duplicate field value: ${err.keyValue.name}. Please use another value!`;

    return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
    const errors = Object.values(err.errors);

    const message = `Invalid input data. ${errors.join('. ')}`;
    return new AppError(message, 400);
};

const handleJWTError = () =>
    new AppError('Invalid token. Please login again!', 401);

const handleJWTExpiredError = () =>
    new AppError('Your token has expired! Please login again', 401);

const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
        stack: err.stack,
        error: err,
    });
};

const sendErrorProd = (err, res) => {
    // Operational, trusted error: send message to client
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        });

        // Programming or other unknown error: dont leak error details
    } else {
        // 1) Log error
        // console.log(
        //     '🚀 ~ file: errorController.js ~ line 30 ~ sendErrorProd ~ err',
        //     err
        // );

        // 2) Send generic message
        res.status(500).json({
            status: 'error',
            message: 'Something went very wrong!',
        });
    }
};

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, res);
    } else if (process.env.NODE_ENV === 'production') {
        let error = { ...err };
        console.log('🚀 ~ file: errorController.js ~ line 64 ~ error', error);

        // if (error.name === 'CastError') {
        //     error = handleCastErrorDB(error);
        // }

        if (error.kind === 'ObjectId') {
            error = handleCastErrorDB(error);
        }

        if (error.code === 11000) error = handleDuplicateFieldsDB(error);

        if (error._message === 'Validation failed')
            error = handleValidationErrorDB(error);

        if (error.name === 'JsonWebTokenError') error = handleJWTError();

        if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

        sendErrorProd(error, res);
    }
};
