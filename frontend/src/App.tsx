import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/context/AuthContext'
import LoginPage from '@/pages/LoginPage'
import { SpeedInsights } from '@vercel/speed-insights/react'
import './App.css'

import { useEffect } from 'react';
import { useSettingsStore } from '@/store/settingsStore';
import { useInventoryStore } from '@/store/inventoryStore';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token } = useAuth()
  const { fetchSettings } = useSettingsStore()
  const { fetchIngredients } = useInventoryStore()

  useEffect(() => {
    if (token) {
      fetchSettings();
      fetchIngredients();
    }
  }, [token, fetchSettings, fetchIngredients]);

  if (!token) return <Navigate to="/login" />

  return <>{children}</>
}

import AdminLayout from '@/components/AdminLayout'
import DashboardPage from '@/pages/overview/DashboardPage'
import CategoriesPage from '@/pages/management/CategoriesPage'
import IngredientsPage from '@/pages/management/IngredientsPage'
import MenuItemsPage from '@/pages/management/MenuItemsPage'
import RecipesPage from '@/pages/management/RecipesPage'
import OrdersPage from '@/pages/operations/OrdersPage'
import NewOrderPage from '@/pages/operations/NewOrderPage'
import StockLogPage from '@/pages/operations/StockLogPage'

function AppContent() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={
        <ProtectedRoute>
          <AdminLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/overview/dashboard" replace />} />
        <Route path="/overview/dashboard" element={<DashboardPage />} />
        <Route path="/management/categories" element={<CategoriesPage />} />
        <Route path="/management/ingredients" element={<IngredientsPage />} />
        <Route path="/management/menu-items" element={<MenuItemsPage />} />
        <Route path="/management/recipes" element={<RecipesPage />} />
        <Route path="/operations/orders" element={<OrdersPage />} />
        <Route path="/operations/new-order" element={<NewOrderPage />} />
        <Route path="/operations/stock-log" element={<StockLogPage />} />
      </Route>
    </Routes>
  )
}

import { Toaster } from 'sonner'

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
      <Toaster position="top-center" richColors />
      <SpeedInsights />
    </AuthProvider>
  )
}

export default App
