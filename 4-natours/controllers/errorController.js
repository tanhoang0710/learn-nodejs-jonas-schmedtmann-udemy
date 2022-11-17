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

const sendErrorDev = (err, req, res) => {
    // API
    if (req.originalUrl.startsWith('/api')) {
        return res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
            stack: err.stack,
            error: err,
        });
    }
    // RENDERED WEBSITE
    return res.status(err.statusCode).render('error', {
        title: 'Something went wrong!',
        msg: err.message,
    });
};

const sendErrorProd = (err, req, res) => {
    // API
    if (req.originalUrl.startsWith('/api')) {
        if (err.isOperational) {
            // Operational, trusted error: send message to client
            return res.status(err.statusCode).json({
                status: err.status,
                message: err.message,
            });

            // Programming or other unknown error: dont leak error details
        }
        // 1) Log error
        // console.log(
        //     '🚀 ~ file: errorController.js ~ line 30 ~ sendErrorProd ~ err',
        //     err
        // );

        // 2) Send generic message
        return res.status(500).json({
            status: 'error',
            message: 'Something went very wrong!',
        });
    } // RENDERED WEBSITE
    if (err.isOperational) {
        return res.status(err.statusCode).render('error', {
            title: 'Something went wrong!',
            msg: err.message,
        });
    }
    return res.status(err.statusCode).render('error', {
        title: 'Something went wrong!',
        msg: 'Please try again later',
    });
};

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, req, res);
    } else if (process.env.NODE_ENV === 'production') {
        let error = { ...err };
        error.message = err.message;
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

        sendErrorProd(error, req, res);
    }
};
