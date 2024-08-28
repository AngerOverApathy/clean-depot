const User = require('../models/userSchema');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const asyncHandler = require('express-async-handler');

const userController = {

  // Register a new user
  registerUser: asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;
    
    console.log('Received data:', req.body); // Log received data

    if (!username || !email || !password) {
      res.status(400);
      throw new Error('Please fill all fields');
    }

    // Check if the user already exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400);
      throw new Error('User already exists');
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create the user
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        token: userController.generateToken(user._id),
      });
    } else {
      res.status(400);
      throw new Error('Invalid user data');
    }
  }),

  // Log in an existing user
  loginUser: asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Check for user email
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
        // Generate JWT token
        const token = userController.generateToken(user._id);

        res.json({
            message: "Login successful",
            user: {
                _id: user._id,
                username: user.username,
                email: user.email
            },
            token: token  // Sending token separately for clarity
        });
    } else {
        res.status(401).json({ message: 'Invalid email or password' });
    }
  }),

  // Retrieve data for the logged-in user
  getUserData: asyncHandler(async (req, res) => {
    const { _id, username, email } = await User.findById(req.user.id);

    res.status(200).json({
      id: _id,
      username,
      email,
    });
  }),

  // Generate a JSON Web Token
  generateToken: (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: '30d',
    });
  },
};

module.exports = userController;