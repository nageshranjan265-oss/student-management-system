const express = require("express");
const router = express.Router();

const {
    registerUser,
    loginUser,
    createTeacher,
    changePassword,
    getTotalTeachers,
    forgotPassword,
    resetPassword,
    getAllTeachers
} = require("../controllers/authController");

const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

// ==========================================
// PUBLIC ROUTES
// ==========================================

// Public registration disabled
router.post("/register", registerUser);

// Login
router.post("/login", loginUser);

// Forgot password
router.post("/forgot-password", forgotPassword);

// Reset password
router.post("/reset-password", resetPassword);


// ==========================================
// ADMIN ONLY ROUTES
// ==========================================

// Create Teacher (Admin Only)
router.post(
    "/teachers",
    authMiddleware,
    authorizeRoles("admin"),
    createTeacher
);

// Get All Teachers (Admin Only)
router.get(
    "/teachers",
    authMiddleware,
    authorizeRoles("admin"),
    getAllTeachers
);

// Get Total Teachers (Admin Only)
router.get(
    "/teachers/count",
    authMiddleware,
    authorizeRoles("admin"),
    getTotalTeachers
);


// ==========================================
// AUTHENTICATED USER ROUTES
// ==========================================

// Change Password
router.put(
    "/change-password",
    authMiddleware,
    changePassword
);

module.exports = router;