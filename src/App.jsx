import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import AuthContextProvider from "./context/AuthContext";
import ProtectedRoute from "./components/Auth/ProtectedRoute";
import AdminLogin from "./pages/Auth/AdminLogin";
import Add from "./pages/Add/Add";
import List from "./pages/List/List";
import Orders from "./pages/Orders/Orders";
import AdminProfile from "./pages/Profile/AdminProfile";
import Categories from "./pages/Categories/Categories";
import AdminLayout from "./components/Layout/AdminLayout";

const App = () => {
  return (
    <AuthContextProvider>
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
        <Route path="/login" element={<AdminLogin />} />

        {/* Protected Routes within AdminLayout */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          {/* Default route to a dashboard or list */}
          <Route index element={<List />} />
          <Route path="add" element={<Add />} />
          <Route path="list" element={<List />} />
          <Route path="categories" element={<Categories />} />
          <Route path="orders" element={<Orders />} />
          <Route path="profile" element={<AdminProfile />} />
          {/* Add other routes like categories here later */}
        </Route>
      </Routes>
    </AuthContextProvider>
  );
};

export default App;
