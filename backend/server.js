const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const { errorHandler } = require('./middleware/errorMiddleware');

// Database connection
const connectDB = require('./config/database');
connectDB();

// Middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Enable CORS
app.use(cors({
    origin: 'http://localhost:5173', 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// Import routes
const equipmentRoutes = require('./routes/equipmentRoutes');
const userRoutes = require('./routes/userRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');

// Use routes
app.use('/equipment', equipmentRoutes);
app.use('/user', userRoutes);
app.use('/inventory', inventoryRoutes);

// Error Handler Middleware - should be after all route handlers
app.use(errorHandler);

// Start the server
const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});