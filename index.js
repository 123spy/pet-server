const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const router = require("./router");
const errorHandler = require("./middleware/error-handler");
const session = require("express-session");

// Import database models
require("./model");

// Initialize Express application
const app = express();

// Middleware configuration
app.use(cors({
    credentials: true,
    origin: (req, callback) => {
        // Dynamically set origin to allow any source
        callback(null, true);
    }
}));

// Session configuration
app.use(session({
    secret: 'abc_123', // Secret key for signing session ID
    resave: false,     // Whether to resave session on every request
    saveUninitialized: true, // Whether to save uninitialized sessions
    cookie: {
        secure: false, // Set to true if using HTTPS
        maxAge: 1000 * 60 * 60 * 24 // Session validity period (24 hours)
    }
}));

// Parse JSON request body, set maximum size to 50MB
app.use(express.json({ limit: '50mb' }));

// Parse URL-encoded form data, set maximum size to 50MB
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Logging middleware
app.use(morgan("dev"));

// Routes
app.use(router);

// Error handling middleware
app.use(errorHandler());

// Listen on port
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});