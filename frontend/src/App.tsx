import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/context/AuthContext'
import LoginPage from '@/pages/LoginPage'
import './App.css'

import type { User } from '@/context/AuthContext'

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: User['role'][] }) {
  const { token, user } = useAuth()
  if (!token) return <Navigate to="/login" />

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" /> // Or a dedicated unauthorized page
  }

  return <>{children}</>
}

function Dashboard() {
  const { user } = useAuth()
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] relative rounded-2xl overflow-hidden border border-border/20 bg-card/30">
      {/* Ambient Effects */}
      <div className="absolute top-0 right-0 w-[30rem] h-[30rem] bg-primary/10 rounded-full blur-[100px] mix-blend-screen pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[25rem] h-[25rem] bg-accent/20 rounded-full blur-[80px] mix-blend-screen pointer-events-none" />

      <div className="rounded-xl border border-border/50 bg-card/70 backdrop-blur-xl p-10 shadow-2xl text-center relative z-10 w-full max-w-lg mx-4">
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          <span
            className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-amber-200 drop-shadow-md pb-2 inline-block"
            style={{ fontFamily: "'Dancing Script', 'Pacifico', cursive" }}
          >
            {import.meta.env.VITE_APP_NAME || 'Digital Waiter!'}
          </span>
        </h1>
        <h2 className="text-2xl font-semibold mb-2">Welcome, <span className="text-primary">{user?.name || 'Admin'}</span>!</h2>
        <p className="text-muted-foreground">Select an option from the sidebar to manage your inventory.</p>
      </div>
    </div>
  )
}

import AdminLayout from '@/components/AdminLayout'
import CategoriesPage from '@/pages/admin/categories/CategoriesPage'
import IngredientsPage from '@/pages/admin/ingredients/IngredientsPage'
import MenuItemsPage from '@/pages/admin/menu-items/MenuItemsPage'
import OrdersPage from '@/pages/admin/orders/OrdersPage'
import NewOrderPage from '@/pages/waiter/NewOrderPage'

function AppContent() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="/admin/categories" element={<CategoriesPage />} />
        <Route path="/admin/ingredients" element={<IngredientsPage />} />
        <Route path="/admin/menu-items" element={<MenuItemsPage />} />
        <Route path="/admin/orders" element={<OrdersPage />} />
        <Route path="/new-order" element={<NewOrderPage />} />
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
    </AuthProvider>
  )
}

export default App
