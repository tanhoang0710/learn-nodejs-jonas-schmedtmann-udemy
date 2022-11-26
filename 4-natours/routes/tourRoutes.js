const express = require('express');
const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');
const bookingController = require('../controllers/bookingController');
const reviewRouter = require('./reviewRoutes');

const router = express.Router();

// POST /tour/123sdfxv45/reviews
// GET /tour/123sdfxv45/reviews
// GET /tour/123sdfxv45/reviews/12123

// router
//     .route('/:tourId/reviews')
//     .post(
//         authController.protect,
//         authController.retrictTo('user'),
//         reviewController.createReview
//     );

router.use('/:tourId/reviews', reviewRouter);
router.route('/:tourId/bookings').get(bookingController.getAllBookingsOnTour);

// router.param('id', tourController.checkId);

router
    .route('/top-5-cheap')
    .get(tourController.aliasTopTour, tourController.getAllTours);

router.route('/tour-stats').get(tourController.getTourStats);

router
    .route('/monthly-plan/:year')
    .get(
        authController.protect,
        authController.retrictTo('admin', 'lead-guide', 'guide'),
        tourController.getMonthlyPlan
    );

router
    .route('/tours-within/:distance/center/:latlng/unit/:unit')
    .get(tourController.getToursWithin);
// /tours-within?distance=233&center=-40,45&unit=mi
// /tours-within/233/center/-40,45/unit/mi

router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances);

router
    .route('/')
    .get(tourController.getAllTours)
    .post(
        authController.protect,
        authController.retrictTo('admin', 'lead-guide'),
        tourController.createTour
    );

// luu anh khi upload la luu ten anh vao db va anh xa no sang ten o tren o dia
router
    .route('/:id')
    .get(tourController.getTour)
    .patch(
        authController.protect,
        authController.retrictTo('admin', 'lead-guide'),
        tourController.uploadTourImages,
        tourController.resizeTourImages,
        tourController.updateTour
    )
    .delete(
        authController.protect,
        authController.retrictTo('admin', 'lead-guide'),
        tourController.deleteTour
    );

module.exports = router;
