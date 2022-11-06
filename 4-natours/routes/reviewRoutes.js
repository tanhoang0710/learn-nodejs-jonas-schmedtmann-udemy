const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

const router = express.Router({ mergeParams: true });

router
    .route('/')
    .get(reviewController.getAllReviews)
    .post(
        authController.protect,
        authController.retrictTo('user'),
        reviewController.setTourUserIds,
        reviewController.createReview
    ); // login user can review

router
    .route('/:id')
    .get(reviewController.getReview)
    .delete(reviewController.deleteReview)
    .patch(reviewController.updateReview);

module.exports = router;
