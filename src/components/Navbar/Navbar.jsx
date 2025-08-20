import "./Navbar.css";
import { assets } from "../../assets/assets";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import { useState } from "react";

const Navbar = () => {
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success("Đăng xuất thành công!");
    setShowUserMenu(false);
  };

  // if (!isAuthenticated) {
  //   return null; // Don't show navbar on login page
  // }

  return (
    <div className="navbar">
      <div className="navbar-left">
        <img className="logo" src={assets.logo} alt="Mi Bánh Bao" />
        <div className="navbar-title">
          {/* <h3>Mi Bánh Bao</h3> */}
          {/* <span>Admin Panel</span> */}
        </div>
      </div>

      <div className="navbar-right">
        <div className="user-info">
          <span className="user-name">{user?.name}</span>
          <span className={`user-role ${user?.role?.toLowerCase()}`}>
            {user?.role}
          </span>
        </div>

        <div className="user-menu-container">
          <img
            className="profile"
            src={user?.avatar || assets.profile_image}
            alt="Profile"
            onClick={() => setShowUserMenu(!showUserMenu)}
          />

          {showUserMenu && (
            <div className="user-dropdown">
              <div className="dropdown-header">
                <img src={user?.avatar || assets.profile_image} alt="Avatar" />
                <div>
                  <p className="dropdown-name">{user?.name}</p>
                  <p className="dropdown-email">{user?.email}</p>
                </div>
              </div>

              <div className="dropdown-divider"></div>

              <div className="dropdown-menu">
                <button
                  className="dropdown-item"
                  onClick={() => {
                    window.location.href = "/profile";
                    setShowUserMenu(false);
                  }}
                >
                  <span>👤</span> Thông tin cá nhân
                </button>

                <button
                  className="dropdown-item"
                  onClick={() => {
                    window.location.href = "/profile/change-password";
                    setShowUserMenu(false);
                  }}
                >
                  <span>🔒</span> Đổi mật khẩu
                </button>

                <div className="dropdown-divider"></div>

                <button className="dropdown-item logout" onClick={handleLogout}>
                  <span>🚪</span> Đăng xuất
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Overlay to close dropdown */}
      {showUserMenu && (
        <div
          className="dropdown-overlay"
          onClick={() => setShowUserMenu(false)}
        ></div>
      )}
    </div>
  );
};

export default Navbar;
