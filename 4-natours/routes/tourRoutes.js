const express = require('express');
const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');
const reviewController = require('../controllers/reviewController');

const router = express.Router();

// router.param('id', tourController.checkId);

router
    .route('/top-5-cheap')
    .get(tourController.aliasTopTour, tourController.getAllTours);

router.route('/tour-stats').get(tourController.getTourStats);

router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);

router
    .route('/')
    .get(authController.protect, tourController.getAllTours)
    .post(tourController.createTour);

router
    .route('/:id')
    .get(tourController.getTour)
    .patch(tourController.updateTour)
    .delete(
        authController.protect,
        authController.retrictTo('admin', 'lead-guide'),
        tourController.deleteTour
    );

// POST /tour/123sdfxv45/reviews
// GET /tour/123sdfxv45/reviews
// GET /tour/123sdfxv45/reviews/12123

router
    .route('/:tourId/reviews')
    .post(
        authController.protect,
        authController.retrictTo('user'),
        reviewController.createReview
    );

module.exports = router;
