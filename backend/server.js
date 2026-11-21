require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const studentRoutes = require("./routes/studentRoutes");
const authRoutes = require("./routes/authRoutes");
const authMiddleware = require("./middleware/authMiddleware");

const app = express();

// Allowed frontend URLs
const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:5174",
    process.env.FRONTEND_URL
].filter(Boolean);

// CORS Configuration
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    }
}));

// Middleware
app.use(express.json());

// Health Check API
app.get("/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Backend is healthy!"
    });
});

// Home API
app.get("/", (req, res) => {
    res.send("Student Management System API is running!");
});

// API Routes
app.use("/api/students", authMiddleware, studentRoutes);
app.use("/api/auth", authRoutes);

// MongoDB Connection and Server Start
const startServer = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log("MongoDB Connected Successfully!");

        const PORT = process.env.PORT || 5000;

        app.listen(PORT, "0.0.0.0", () => {
            console.log(`Server running on port ${PORT}`);
        });

    } catch (error) {
        console.error("Server Startup Failed:", error.message);
        process.exit(1);
    }
};

startServer();