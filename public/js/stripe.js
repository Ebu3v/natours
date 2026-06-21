/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';
const stripe = Stripe(
  'pk_test_51TjHWAAoREbEbffeoLcQy5uUAAtsg3gs2rn5vjf2U9WWFDXnmnlZGE6EQEWigyhp4oMmuc5AUIaeGzYZp1c6v2Ce00EbICXdKK',
);

export const bookTour = async (tourId) => {
  try {
    // 1) Get checkout session from API

    const session = await axios(
      `http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`,
    );

    console.log(session);

    // 2) Create checkout form + charge credit card
    // Redirect to Stripe Checkout using the session URL
    window.location.assign(session.data.session.url);
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};
