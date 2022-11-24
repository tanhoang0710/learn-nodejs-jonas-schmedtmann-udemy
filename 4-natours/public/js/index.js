/* eslint-disable */
import '@babel/polyfill';
import { login, logout } from './login';
import { displayMap } from './mapbox';
import { bookTour } from './stripe';
import { updateSettings } from './updateSettings';

// DOM ELEMENTS
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form-login');
const logoutBtn = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');
const bookBtn = document.getElementById('book-tour');
console.log('🚀 ~ file: index.js ~ line 15 ~ bookBtn', bookBtn);

// DELEGATION
if (mapBox) {
    const locations = JSON.parse(
        document.getElementById('map').dataset.locations
    );
    displayMap(locations);
}

if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        login(email, password);
    });
}

if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
}

if (userDataForm) {
    userDataForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const form = new FormData();
        form.append('name', document.getElementById('name').value);
        form.append('email', document.getElementById('email').value);
        form.append('photo', document.getElementById('photo').files[0]);
        updateSettings(form, 'data');
    });
}
if (userPasswordForm) {
    userPasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        document.querySelector('.btn--save-password').textContent =
            'Updating...';

        const passwordCurrent =
            document.getElementById('password-current').value;
        const password = document.getElementById('password').value;
        const passwordConfirm =
            document.getElementById('password-confirm').value;
        await updateSettings(
            { passwordCurrent, password, passwordConfirm },
            'password'
        );

        document.querySelector('.btn--save-password').textContent =
            'Save password';

        document.getElementById('password-current').value = '';
        document.getElementById('password').value = '';
        document.getElementById('password-confirm').value = '';
    });
}

if (bookBtn) {
    console.log('🚀 ~ file: index.js ~ line 73 ~ bookBtn', bookBtn);
    bookBtn.addEventListener('click', (e) => {
        e.target.textContent = 'Processing...';
        const { tourId } = e.target.dataset;
        bookTour(tourId);
    });
}
