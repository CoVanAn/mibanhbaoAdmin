import { useAuth } from "../../context/AuthContext";
import AvatarUpload from "../../components/Profile/AvatarUpload";
import ProfileForm from "../../components/Profile/ProfileForm";
import ChangePassword from "../../components/Profile/ChangePassword";
import "./AdminProfile.css";

const AdminProfile = () => {
  const { user } = useAuth();

  if (!user) {
    return <div className="loading-container">Loading profile...</div>;
  }

  return (
    <div className="admin-profile-page">
      <div className="profile-header">
        <h1>Admin Profile</h1>
        <p>Manage your profile information and password.</p>
      </div>
      <div className="profile-grid">
        <div className="profile-avatar-section">
          <AvatarUpload />
        </div>
        <div className="profile-form-section">
          <ProfileForm />
          <ChangePassword />
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
