import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import "./ProfileForm.css";

const ProfileForm = () => {
  const { user, updateUserProfile } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await updateUserProfile(formData);
  };

  return (
    <div className="profile-form card">
      <div className="card-header">
        <h3>Personal Information</h3>
        <p>Update your personal details.</p>
      </div>
      <form onSubmit={handleSubmit} className="card-body">
        <div className="form-group">
          <label htmlFor="name">Full Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="card-footer">
          <button type="submit" className="btn btn-primary">
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileForm;
