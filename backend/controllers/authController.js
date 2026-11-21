const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendOTPEmail = require("../services/emailService");

// ==========================================
// 1. DISABLE PUBLIC REGISTRATION
// ==========================================

const registerUser = async (req, res) => {
    return res.status(403).json({
        success: false,
        message: "Public registration is disabled. Please contact the Admin."
    });
};


// ==========================================
// 2. LOGIN USER
// ==========================================

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please provide email and password"
            });
        }

        const normalizedEmail = email.toLowerCase().trim();

        const user = await User.findOne({
            email: normalizedEmail
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET is not configured");
        }

        const token = jwt.sign(
            {
                id: user._id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error("Login Error:", error);

        res.status(500).json({
            success: false,
            message: "Something went wrong during login."
        });
    }
};


// ==========================================
// 3. CREATE TEACHER (ADMIN ONLY)
// ==========================================

const createTeacher = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (
            typeof name !== "string" ||
            typeof email !== "string" ||
            typeof password !== "string" ||
            !name.trim() ||
            !email.trim() ||
            !password
        ) {
            return res.status(400).json({
                success: false,
                message: "Please provide valid name, email and password."
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters."
            });
        }

        const normalizedEmail = email.toLowerCase().trim();

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(normalizedEmail)) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid email address."
            });
        }

        const existingUser = await User.findOne({
            email: normalizedEmail
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "An account with this email already exists."
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const teacher = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            role: "teacher"
        });

        res.status(201).json({
            success: true,
            message: "Teacher created successfully.",
            teacher: {
                id: teacher._id,
                name: teacher.name,
                email: teacher.email,
                role: teacher.role
            }
        });

    } catch (error) {
        console.error("Create Teacher Error:", error);

        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "An account with this email already exists."
            });
        }

        res.status(500).json({
            success: false,
            message: "Failed to create teacher."
        });
    }
};


// ==========================================
// 4. CHANGE PASSWORD
// ==========================================

const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Please provide current and new password"
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: "New password must be at least 6 characters"
            });
        }

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const isMatch = await bcrypt.compare(
            currentPassword,
            user.password
        );

        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Current password is incorrect"
            });
        }

        const isSamePassword = await bcrypt.compare(
            newPassword,
            user.password
        );

        if (isSamePassword) {
            return res.status(400).json({
                success: false,
                message: "New password must be different from current password"
            });
        }

        user.password = await bcrypt.hash(newPassword, 10);

        await user.save();

        res.status(200).json({
            success: true,
            message: "Password changed successfully. Please log in again."
        });

    } catch (error) {
        console.error("Change Password Error:", error);

        res.status(500).json({
            success: false,
            message: "Something went wrong while changing password."
        });
    }
};


// ==========================================
// 5. GET TOTAL TEACHERS
// ==========================================

const getTotalTeachers = async (req, res) => {
    try {
        const totalTeachers = await User.countDocuments({
            role: "teacher"
        });

        res.status(200).json({
            success: true,
            totalTeachers
        });

    } catch (error) {
        console.error("Get Total Teachers Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch teacher count."
        });
    }
};


// ==========================================
// 6. FORGOT PASSWORD - SEND OTP
// ==========================================

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email || typeof email !== "string") {
            return res.status(400).json({
                success: false,
                message: "Please provide your email address"
            });
        }

        const normalizedEmail = email.toLowerCase().trim();

        const user = await User.findOne({
            email: normalizedEmail
        });

        if (!user) {
            return res.status(200).json({
                success: true,
                message: "If an account exists with this email, an OTP has been sent."
            });
        }

        const otp = crypto.randomInt(100000, 1000000).toString();

        const hashedOTP = await bcrypt.hash(otp, 10);

        user.resetOTP = hashedOTP;
        user.resetOTPExpires = new Date(Date.now() + 5 * 60 * 1000);
        user.resetOTPAttempts = 0;

        await user.save();

        try {
            await sendOTPEmail(user.email, otp);

            console.log("OTP email sent successfully.");

        } catch (emailError) {
            console.error("OTP Email Error:", emailError);

            user.resetOTP = null;
            user.resetOTPExpires = null;
            user.resetOTPAttempts = 0;

            await user.save();

            return res.status(500).json({
                success: false,
                message: "Unable to send OTP email. Please try again later."
            });
        }

        res.status(200).json({
            success: true,
            message: "If an account exists with this email, an OTP has been sent."
        });

    } catch (error) {
        console.error("Forgot Password Error:", error);

        res.status(500).json({
            success: false,
            message: "Something went wrong. Please try again."
        });
    }
};


// ==========================================
// 7. RESET PASSWORD - VERIFY OTP
// ==========================================

const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        if (!email || !otp || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Please provide email, OTP and new password"
            });
        }

        if (typeof otp !== "string" || !/^\d{6}$/.test(otp)) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid 6-digit OTP"
            });
        }

        if (typeof newPassword !== "string" || newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters"
            });
        }

        const normalizedEmail = email.toLowerCase().trim();

        const user = await User.findOne({
            email: normalizedEmail
        });

        if (!user || !user.resetOTP || !user.resetOTPExpires) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired OTP"
            });
        }

        if (user.resetOTPExpires.getTime() < Date.now()) {
            user.resetOTP = null;
            user.resetOTPExpires = null;
            user.resetOTPAttempts = 0;

            await user.save();

            return res.status(400).json({
                success: false,
                message: "OTP has expired. Please request a new OTP."
            });
        }

        if (user.resetOTPAttempts >= 5) {
            user.resetOTP = null;
            user.resetOTPExpires = null;
            user.resetOTPAttempts = 0;

            await user.save();

            return res.status(400).json({
                success: false,
                message: "Too many incorrect attempts. Please request a new OTP."
            });
        }

        const isOTPValid = await bcrypt.compare(
            otp,
            user.resetOTP
        );

        if (!isOTPValid) {
            user.resetOTPAttempts += 1;

            if (user.resetOTPAttempts >= 5) {
                user.resetOTP = null;
                user.resetOTPExpires = null;
                user.resetOTPAttempts = 0;

                await user.save();

                return res.status(400).json({
                    success: false,
                    message: "Too many incorrect attempts. Please request a new OTP."
                });
            }

            await user.save();

            return res.status(400).json({
                success: false,
                message: "Incorrect OTP. Please try again."
            });
        }

        const isSamePassword = await bcrypt.compare(
            newPassword,
            user.password
        );

        if (isSamePassword) {
            return res.status(400).json({
                success: false,
                message: "New password must be different from current password"
            });
        }

        user.password = await bcrypt.hash(newPassword, 10);

        user.resetOTP = null;
        user.resetOTPExpires = null;
        user.resetOTPAttempts = 0;

        await user.save();

        res.status(200).json({
            success: true,
            message: "Password reset successfully. Please log in with your new password."
        });

    } catch (error) {
        console.error("Reset Password Error:", error);

        res.status(500).json({
            success: false,
            message: "Something went wrong. Please try again."
        });
    }
};


// ==========================================
// 8. GET ALL TEACHERS (ADMIN ONLY)
// ==========================================

const getAllTeachers = async (req, res) => {
    try {
        const teachers = await User.find({
            role: "teacher"
        })
            .select("-password -resetOTP -resetOTPExpires -resetOTPAttempts")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            totalTeachers: teachers.length,
            teachers
        });

    } catch (error) {
        console.error("Get All Teachers Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch teachers."
        });
    }
};


// ==========================================
// EXPORT ALL FUNCTIONS
// ==========================================

module.exports = {
    registerUser,
    loginUser,
    createTeacher,
    changePassword,
    getTotalTeachers,
    forgotPassword,
    resetPassword,
    getAllTeachers
};