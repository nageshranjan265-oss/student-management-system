import { useState } from "react";
import axios from "axios";
import Dashboard from "./Dashboard";
import "./App.css";

function App() {
    const [isRegistering, setIsRegistering] = useState(false);
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const [isResettingPassword, setIsResettingPassword] = useState(false);

    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem("user");
        return savedUser ? JSON.parse(savedUser) : null;
    });

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // LOGIN
    const handleLogin = async (e) => {
        e.preventDefault();

        setError("");
        setMessage("");
        setLoading(true);

        try {
            const response = await axios.post(
                "http://localhost:5000/api/auth/login",
                { email, password }
            );

            const loggedInUser = response.data.data;

            localStorage.setItem("token", response.data.token);
            localStorage.setItem("user", JSON.stringify(loggedInUser));

            setUser(loggedInUser);

        } catch (err) {
            setError(
                err.response?.data?.message || "Login failed. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    // REGISTER
    const handleRegister = async (e) => {
        e.preventDefault();

        setError("");
        setMessage("");
        setLoading(true);

        try {
            const response = await axios.post(
                "http://localhost:5000/api/auth/register",
                { name, email, password }
            );

            setMessage(response.data.message);

            setIsRegistering(false);
            setName("");
            setPassword("");

        } catch (err) {
            setError(
                err.response?.data?.message || "Registration failed."
            );
        } finally {
            setLoading(false);
        }
    };

    // FORGOT PASSWORD
    const handleForgotPassword = async (e) => {
        e.preventDefault();

        setError("");
        setMessage("");
        setLoading(true);

        try {
            const response = await axios.post(
                "http://localhost:5000/api/auth/forgot-password",
                { email }
            );

            setMessage(response.data.message);
            setIsForgotPassword(false);
            setIsResettingPassword(true);

        } catch (err) {
            setError(
                err.response?.data?.message || "Unable to send OTP."
            );
        } finally {
            setLoading(false);
        }
    };

    // RESET PASSWORD
    const handleResetPassword = async (e) => {
        e.preventDefault();

        setError("");
        setMessage("");

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        if (newPassword.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post(
                "http://localhost:5000/api/auth/reset-password",
                {
                    email,
                    otp,
                    newPassword
                }
            );

            setMessage(response.data.message);

            setIsResettingPassword(false);
            setOtp("");
            setNewPassword("");
            setConfirmPassword("");
            setPassword("");

        } catch (err) {
            setError(
                err.response?.data?.message || "Password reset failed."
            );
        } finally {
            setLoading(false);
        }
    };

    // LOGOUT
    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        setUser(null);
        setEmail("");
        setPassword("");
        setMessage("");
        setError("");
    };

    // DASHBOARD
    if (user) {
        return (
            <Dashboard
                user={user}
                onLogout={handleLogout}
            />
        );
    }

    // FRONTEND
    return (
        <div className="auth-container">
            <div className="auth-box">

                <h1>Student Management System</h1>

                <p>Welcome! Please access your account.</p>

                {message && (
                    <div className="success-message">
                        {message}
                    </div>
                )}

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                {/* REGISTER FORM */}
                {isRegistering && (
                    <>
                        <h2>Create Account</h2>

                        <form onSubmit={handleRegister}>

                            <input
                                type="text"
                                placeholder="Full Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />

                            <input
                                type="email"
                                placeholder="Email Address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />

                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />

                            <button type="submit" disabled={loading}>
                                {loading ? "Registering..." : "Register"}
                            </button>

                        </form>

                        <p>
                            Already have an account?{" "}
                            <button
                                type="button"
                                onClick={() => {
                                    setIsRegistering(false);
                                    setError("");
                                    setMessage("");
                                }}
                            >
                                Login
                            </button>
                        </p>
                    </>
                )}

                {/* FORGOT PASSWORD FORM */}
                {isForgotPassword && (
                    <>
                        <h2>Forgot Password</h2>

                        <form onSubmit={handleForgotPassword}>

                            <input
                                type="email"
                                placeholder="Enter your registered email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />

                            <button type="submit" disabled={loading}>
                                {loading ? "Sending OTP..." : "Send OTP"}
                            </button>

                        </form>

                        <button
                            type="button"
                            onClick={() => {
                                setIsForgotPassword(false);
                                setError("");
                                setMessage("");
                            }}
                        >
                            Back to Login
                        </button>
                    </>
                )}

                {/* RESET PASSWORD FORM */}
                {isResettingPassword && (
                    <>
                        <h2>Reset Password</h2>

                        <form onSubmit={handleResetPassword}>

                            <input
                                type="text"
                                placeholder="Enter 6-digit OTP"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                maxLength="6"
                                required
                            />

                            <input
                                type="password"
                                placeholder="New Password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                            />

                            <input
                                type="password"
                                placeholder="Confirm New Password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />

                            <button type="submit" disabled={loading}>
                                {loading ? "Resetting..." : "Reset Password"}
                            </button>

                        </form>
                    </>
                )}

                {/* LOGIN FORM */}
                {!isRegistering &&
                    !isForgotPassword &&
                    !isResettingPassword && (
                        <>
                            <h2>Login</h2>

                            <form onSubmit={handleLogin}>

                                <input
                                    type="email"
                                    placeholder="Email Address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />

                                <input
                                    type="password"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />

                                <button type="submit" disabled={loading}>
                                    {loading ? "Logging in..." : "Login"}
                                </button>

                            </form>

                            <button
                                type="button"
                                onClick={() => {
                                    setIsForgotPassword(true);
                                    setError("");
                                    setMessage("");
                                }}
                            >
                                Forgot Password?
                            </button>

                            <p>
                                Don't have an account?{" "}
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsRegistering(true);
                                        setError("");
                                        setMessage("");
                                    }}
                                >
                                    Register
                                </button>
                            </p>
                        </>
                    )}

            </div>
        </div>
    );
}

export default App;