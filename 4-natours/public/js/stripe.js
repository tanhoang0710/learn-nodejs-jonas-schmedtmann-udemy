/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alert';
// const stripe = Stripe(
//     `pk_test_51M7UQDIcbMOMxrqYoctPy2UA2sazulANrt0WQyu3Z88YH450zOQvSv7h9nKoGvpPfr2DvKGZEBrnNLeVZ0RmT7nO001Crjh5aZ`
// );

export const bookTour = async (tourId) => {
    try {
        // 1) Get the checkout session from API
        const session = await axios({
            method: 'GET',
            url: `http://localhost:3000/api/v1/bookings/checkout-session/${tourId}`,
        });

        console.log(session);

        // 2) Create checkout form + charge credit card
        window.open(session.data.session.url);
    } catch (error) {
        console.log(error);
        showAlert('error', error);
    }
};
