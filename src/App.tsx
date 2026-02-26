import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import ProtectedRoute from "./components/auth/ProtectedRouteNew";
import AdminLogin from "./pages/login";
import AdminProfile from "./pages/profile";
import Categories from "./pages/categories";
import Orders from "./pages/orders/over";
import OrderView from "./pages/orders/view";
import {
  ProductsList,
  ProductsAdd,
  ProductsEdit,
  ProductsView,
} from "./pages/products";
import AdminLayout from "./components/Layout/AdminLayout";

const App = () => {
  return (
    <>
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
          <Route index element={<ProductsList />} />

          {/* Product Routes */}
          <Route path="products" element={<ProductsList />} />
          <Route path="products/add" element={<ProductsAdd />} />
          <Route path="products/edit/:id" element={<ProductsEdit />} />
          <Route path="products/view/:id" element={<ProductsView />} />

          {/* Order Routes */}
          <Route path="orders" element={<Orders />} />
          <Route path="orders/:id" element={<OrderView />} />

          {/* Other Routes */}
          <Route path="categories" element={<Categories />} />
          <Route path="profile" element={<AdminProfile />} />
        </Route>
      </Routes>
    </>
  );
};

export default App;
