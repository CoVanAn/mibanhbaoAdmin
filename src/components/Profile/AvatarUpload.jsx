import { useState, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import "./AvatarUpload.css";
import { assets } from "../../assets/assets";

const AvatarUpload = () => {
  const { user, updateUserAvatar } = useAuth();
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(
    user?.avatar || assets.profile_image
  );
  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUpload = async () => {
    if (image) {
      await updateUserAvatar(image);
      // Optionally, you can clear the image state after upload
      // setImage(null);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="avatar-upload card">
      <div className="card-header">
        <h3>Profile Picture</h3>
        <p>Update your profile picture.</p>
      </div>
      <div className="card-body">
        <div className="avatar-preview" onClick={triggerFileSelect}>
          <img src={previewUrl} alt="Avatar Preview" />
          <div className="overlay">
            <span>Change</span>
          </div>
        </div>
        <input
          type="file"
          onChange={handleImageChange}
          ref={fileInputRef}
          style={{ display: "none" }}
          accept="image/*"
        />
        <div className="user-info">
          <h4>{user?.name}</h4>
          <p className={`role-badge role-${user?.role.toLowerCase()}`}>
            {user?.role}
          </p>
        </div>
      </div>
      <div className="card-footer">
        <button onClick={triggerFileSelect} className="btn btn-secondary">
          Select Image
        </button>
        <button
          onClick={handleUpload}
          className="btn btn-primary"
          disabled={!image}
        >
          Save
        </button>
      </div>
    </div>
  );
};

export default AvatarUpload;
