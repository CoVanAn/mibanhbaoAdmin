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
import DealsPage from "./pages/deals";
import CustomersList from "./pages/customers/list";
import CustomerView from "./pages/customers/view";
import { EmployeesList, EmployeeView } from "./pages/employees";
import DashboardPage from "./pages/dashboard";

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
          {/* Default route */}
          <Route index element={<DashboardPage />} />
          <Route path="dashboard" element={<DashboardPage />} />

          {/* Product Routes */}
          <Route path="products" element={<ProductsList />} />
          <Route path="products/add" element={<ProductsAdd />} />
          <Route path="products/edit/:id" element={<ProductsEdit />} />
          <Route path="products/view/:id" element={<ProductsView />} />

          {/* Order Routes */}
          <Route path="orders" element={<Orders />} />
          <Route path="orders/:id" element={<OrderView />} />

          {/* Customer Routes */}
          <Route path="customers" element={<CustomersList />} />
          <Route path="customers/:id" element={<CustomerView />} />

          {/* Employee Routes */}
          <Route path="employees" element={<EmployeesList />} />
          <Route path="employees/:id" element={<EmployeeView />} />

          {/* Other Routes */}
          <Route path="categories" element={<Categories />} />
          <Route path="deals" element={<DealsPage />} />
          <Route path="profile" element={<AdminProfile />} />
        </Route>
      </Routes>
    </>
  );
};

export default App;
