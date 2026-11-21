const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",

    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Send Password Reset OTP Email
const sendOTPEmail = async (email, otp) => {

    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: email,
        subject: "Student Management System - Password Reset OTP",

        html: `
            <div style="font-family: Arial; padding: 20px;">

                <h2>Password Reset Request</h2>

                <p>Your password reset OTP is:</p>

                <h1 style="color: #2563eb; letter-spacing: 5px;">
                    ${otp}
                </h1>

                <p>This OTP is valid for 5 minutes.</p>

                <p>If you did not request a password reset,
                please ignore this email.</p>

                <br>

                <p>Student Management System</p>

            </div>
        `
    };

    await transporter.sendMail(mailOptions);
};

module.exports = sendOTPEmail;