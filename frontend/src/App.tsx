import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Layout from "@/components/layout/Layout";
import { Toaster } from "@/components/ui/toaster";
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import TablesPage from "@/pages/TablesPage";
import OrdersPage from "@/pages/OrdersPage";
import OrderNewPage from "@/pages/OrderNewPage";
import OrderDetailPage from "@/pages/OrderDetailPage";
import MenuPage from "@/pages/MenuPage";
import InventoryPage from "@/pages/InventoryPage";
import ReportsPage from "@/pages/ReportsPage";
import UsersPage from "@/pages/UsersPage";
import SettingsPage from "@/pages/SettingsPage";
import KitchenPage from "@/pages/KitchenPage";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="tables" element={<TablesPage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="orders/new" element={<OrderNewPage />} />
            <Route path="orders/:id" element={<OrderDetailPage />} />
            <Route path="menu" element={<MenuPage />} />
            <Route path="inventory" element={<InventoryPage />} />
            <Route path="kitchen" element={<KitchenPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
