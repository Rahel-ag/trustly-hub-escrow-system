require('dotenv').config();

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check route
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
});

// Import and use your auth middleware (for testing)
const { authMiddleware } = require('./src/middleware');

// Test protected route
app.get('/api/protected', authMiddleware, (req, res) => {
    res.json({ 
        message: 'You accessed a protected route!',
        user: req.user 
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📝 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🔒 Protected route: http://localhost:${PORT}/api/protected`);
});