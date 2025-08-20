import { Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import AuthContextProvider from "./context/AuthContext";
import ProtectedRoute from "./components/Auth/ProtectedRoute";
import AdminLogin from "./pages/Auth/AdminLogin";
import Navbar from "./components/Navbar/Navbar";
import Sidebar from "./components/Sidebar/Sidebar";
import Add from "./pages/Add/Add";
import List from "./pages/List/List";
import Orders from "./pages/Orders/Orders";
import AdminProfile from "./pages/Profile/AdminProfile";

const url = import.meta.env.VITE_API_URL || "http://localhost:4000";

const App = () => {
  return (
    <AuthContextProvider>
      <div className="app">
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />

        <Routes>
          {/* Public route - Login */}
          <Route path="/login" element={<AdminLogin />} />

          {/* Protected routes - Admin Panel */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <AdminPanel />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </AuthContextProvider>
  );
};

// Admin Panel Layout Component
const AdminPanel = () => {
  return (
    <>
      <Navbar />
      <div className="app-content">
        <Sidebar />
        <div className="main-content">
          <Routes>
            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/list" replace />} />

            {/* Admin routes */}
            <Route path="/add" element={<Add url={url} />} />
            <Route path="/list" element={<List url={url} />} />
            <Route path="/orders" element={<Orders url={url} />} />
            <Route path="/profile" element={<AdminProfile />} />

            {/* Catch all - redirect to list */}
            <Route path="*" element={<Navigate to="/list" replace />} />
          </Routes>
        </div>
      </div>
    </>
  );
};

export default App;
