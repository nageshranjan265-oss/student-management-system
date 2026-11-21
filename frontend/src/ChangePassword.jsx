import { useState } from "react";
import axios from "axios";

function ChangePassword() {

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        setMessage("");
        setError("");

        if (newPassword !== confirmPassword) {
            setError("New password and confirm password do not match.");
            return;
        }

        try {

            const token = localStorage.getItem("token");

            const response = await axios.put(
                "http://localhost:5000/api/auth/change-password",
                {
                    currentPassword,
                    newPassword
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setMessage(response.data.message);

            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");

        } catch (err) {

            setError(
                err.response?.data?.message ||
                "Unable to change password. Please try again."
            );

        }
    };

    return (

        <div className="student-management">

            <h2>Change Password</h2>

            <p>Update your account password securely.</p>

            {message && (
                <p style={{ color: "green" }}>
                    {message}
                </p>
            )}

            {error && (
                <p style={{ color: "red" }}>
                    {error}
                </p>
            )}

            <form onSubmit={handleSubmit}>

                <div className="form-group">
                    <label>Current Password</label>

                    <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Enter current password"
                        required
                    />
                </div>

                <div className="form-group">
                    <label>New Password</label>

                    <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                        minLength="6"
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Confirm New Password</label>

                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                        minLength="6"
                        required
                    />
                </div>

                <button type="submit">
                    Update Password
                </button>

            </form>

        </div>

    );
}

export default ChangePassword;