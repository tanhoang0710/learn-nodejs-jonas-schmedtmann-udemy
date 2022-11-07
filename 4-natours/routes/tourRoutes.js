const express = require('express');
const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');
// const reviewController = require('../controllers/reviewController');
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
    .route('/')
    .get(tourController.getAllTours)
    .post(
        authController.protect,
        authController.retrictTo('admin', 'lead-guide'),
        tourController.createTour
    );

router
    .route('/:id')
    .get(tourController.getTour)
    .patch(
        authController.protect,
        authController.retrictTo('admin', 'lead-guide'),
        tourController.updateTour
    )
    .delete(
        authController.protect,
        authController.retrictTo('admin', 'lead-guide'),
        tourController.deleteTour
    );

module.exports = router;
