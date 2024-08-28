const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: false,
        trim: true, // Trims whitespace from the username
        minlength: 3
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true, // Ensures the email is stored in lowercase
        match: [/.+\@.+\..+/, 'Please fill a valid email address'] // Regex to validate email
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    register_date: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true // Automatically generates createdAt and updatedAt fields
});


// Create the model from the schema and export it
const User = mongoose.model('User', userSchema);
module.exports = User;
