import { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import ProtectedRoute from "./components/auth/ProtectedRouteNew";
import AdminLayout from "./components/Layout/AdminLayout";
import { Loading } from "./components/common";

const AdminLogin = lazy(() => import("./pages/login"));
const AdminProfile = lazy(() => import("./pages/profile"));
const Categories = lazy(() => import("./pages/categories"));
const Orders = lazy(() => import("./pages/orders/over"));
const OrderView = lazy(() => import("./pages/orders/view"));
const ProductsList = lazy(() =>
  import("./pages/products").then((module) => ({
    default: module.ProductsList,
  })),
);
const ProductsAdd = lazy(() =>
  import("./pages/products").then((module) => ({
    default: module.ProductsAdd,
  })),
);
const ProductsEdit = lazy(() =>
  import("./pages/products").then((module) => ({
    default: module.ProductsEdit,
  })),
);
const ProductsView = lazy(() =>
  import("./pages/products").then((module) => ({
    default: module.ProductsView,
  })),
);
const DealsPage = lazy(() => import("./pages/deals"));
const CustomersList = lazy(() => import("./pages/customers/list"));
const CustomerView = lazy(() => import("./pages/customers/view"));
const EmployeesList = lazy(() =>
  import("./pages/employees").then((module) => ({
    default: module.EmployeesList,
  })),
);
const EmployeeView = lazy(() =>
  import("./pages/employees").then((module) => ({
    default: module.EmployeeView,
  })),
);
const DashboardPage = lazy(() => import("./pages/dashboard"));

const withPageSuspense = (element: React.ReactElement) => (
  <Suspense fallback={<Loading />}>{element}</Suspense>
);

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
        <Route path="/login" element={withPageSuspense(<AdminLogin />)} />

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
          <Route index element={withPageSuspense(<DashboardPage />)} />
          <Route
            path="dashboard"
            element={withPageSuspense(<DashboardPage />)}
          />

          {/* Product Routes */}
          <Route path="products" element={withPageSuspense(<ProductsList />)} />
          <Route
            path="products/add"
            element={withPageSuspense(<ProductsAdd />)}
          />
          <Route
            path="products/edit/:id"
            element={withPageSuspense(<ProductsEdit />)}
          />
          <Route
            path="products/view/:id"
            element={withPageSuspense(<ProductsView />)}
          />

          {/* Order Routes */}
          <Route path="orders" element={withPageSuspense(<Orders />)} />
          <Route path="orders/:id" element={withPageSuspense(<OrderView />)} />

          {/* Customer Routes */}
          <Route
            path="customers"
            element={withPageSuspense(<CustomersList />)}
          />
          <Route
            path="customers/:id"
            element={withPageSuspense(<CustomerView />)}
          />

          {/* Employee Routes */}
          <Route
            path="employees"
            element={withPageSuspense(<EmployeesList />)}
          />
          <Route
            path="employees/:id"
            element={withPageSuspense(<EmployeeView />)}
          />

          {/* Other Routes */}
          <Route path="categories" element={withPageSuspense(<Categories />)} />
          <Route path="deals" element={withPageSuspense(<DealsPage />)} />
          <Route path="profile" element={withPageSuspense(<AdminProfile />)} />
        </Route>
      </Routes>
    </>
  );
};

export default App;
