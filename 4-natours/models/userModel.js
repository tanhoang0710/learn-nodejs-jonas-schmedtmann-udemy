const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please tell us your name'],
        unique: true,
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'A user must have a email'],
        trim: true,
        unique: true,
        lowercase: true, // transform, not validator
        validate: [validator.isEmail, 'Please provide a valid email'],
    },
    photo: String,
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 8,
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 8,
    },
});

const User = mongoose.model('user', userSchema);

module.exports = User;
