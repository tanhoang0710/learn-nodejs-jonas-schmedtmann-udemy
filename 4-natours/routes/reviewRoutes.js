const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

const router = express.Router({ mergeParams: true });

router.use(authController.protect);

router
    .route('/')
    .get(reviewController.getAllReviews)
    .post(
        authController.retrictTo('user'),
        reviewController.setTourUserIds,
        reviewController.checkUserBookTour,
        reviewController.createReview
    ); // login user can review

router
    .route('/:id')
    .get(reviewController.getReview)
    .delete(
        authController.retrictTo('user', 'admin'),
        reviewController.deleteReview
    )
    .patch(
        authController.retrictTo('user', 'admin'),
        reviewController.updateReview
    );

module.exports = router;
