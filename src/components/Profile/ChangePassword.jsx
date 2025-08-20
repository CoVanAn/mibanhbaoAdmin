import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import "./ChangePassword.css";

const ChangePassword = () => {
  const { changeUserPassword } = useAuth();
  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (formData.newPassword !== formData.confirmPassword) {
      setError("New passwords don't match.");
      return;
    }
    if (formData.newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    const success = await changeUserPassword({
      oldPassword: formData.oldPassword,
      newPassword: formData.newPassword,
    });

    if (success) {
      setFormData({ oldPassword: "", newPassword: "", confirmPassword: "" });
    }
  };

  return (
    <div className="change-password card">
      <div className="card-header">
        <h3>Change Password</h3>
        <p>Update your password.</p>
      </div>
      <form onSubmit={handleSubmit} className="card-body">
        {error && <p className="error-message">{error}</p>}
        <div className="form-group">
          <label htmlFor="oldPassword">Old Password</label>
          <input
            type="password"
            id="oldPassword"
            name="oldPassword"
            value={formData.oldPassword}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="newPassword">New Password</label>
          <input
            type="password"
            id="newPassword"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm New Password</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
        </div>
        <div className="card-footer">
          <button type="submit" className="btn btn-primary">
            Update Password
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChangePassword;
