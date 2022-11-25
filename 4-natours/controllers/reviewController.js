const Booking = require('../models/bookingModel');
const Review = require('../models/reviewModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

// exports.getAllReviews = catchAsync(async (req, res, next) => {
//     let filter = {};
//     if (req.params.tourId) filter = { tour: req.params.tourId };

//     const reviews = await Review.find(filter);

//     res.status(200).json({
//         status: 'success',
//         results: reviews.length,
//         data: { reviews },
//     });
// });

exports.setTourUserIds = (req, res, next) => {
    // Allow nested routes
    if (!req.body.tour) req.body.tour = req.params.tourId;
    if (!req.body.user) req.body.user = req.user.id;

    next();
};

// exports.createReview = catchAsync(async (req, res, next) => {
//     // Allow nested routes
//     if (!req.body.tour) req.body.tour = req.params.tourId;
//     if (!req.body.user) req.body.user = req.user.id;
//     const newReview = await Review.create(req.body);

//     res.status(201).json({
//         status: 'success',
//         data: {
//             review: newReview,
//         },
//     });
// });

exports.checkUserBookTour = catchAsync(async (req, res, next) => {
    const { tour, user } = req.body;
    const booking = await Booking.findOne({ tour, user });
    console.log(
        '🚀 ~ file: reviewController.js ~ line 44 ~ exports.checkUserBookTour=catchAsync ~ booking',
        booking
    );
    if (!booking)
        return next(
            new AppError('You need to book this tour before review', 401)
        );
    next();
});

exports.createReview = factory.createOne(Review);
exports.getAllReviews = factory.getAll(Review);
exports.getReview = factory.getOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);
