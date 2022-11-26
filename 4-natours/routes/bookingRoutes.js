const express = require('express');
const bookingController = require('../controllers/bookingController');
const authController = require('../controllers/authController');

// const router = express.Router({ mergeParams: true });
const router = express.Router();

router.use(authController.protect);

router.get('/checkout-session/:tourId', bookingController.getCheckoutSession);

router.use(authController.retrictTo('admin', 'lead-guide'));

// ko de duoc vi trung route
// router.route('/').get(bookingController.getAllBookingsOnTour);
// router.route('/').get(bookingController.getAllBookingsOnUser);

router
    .route('/')
    .get(bookingController.getAllBookings)
    .post(bookingController.createBooking);

router
    .route('/:id')
    .get(
        bookingController.getBooking,
        bookingController.updateBooking,
        bookingController.deleteBooking
    );

module.exports = router;
