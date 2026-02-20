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
  const { user, logout } = useAuth()
  return (
    <div className="flex min-h-screen items-center justify-center bg-background flex-col gap-4 relative overflow-hidden">
      {/* Ambient Effects */}
      <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-primary/10 rounded-full blur-[120px] mix-blend-screen pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[35rem] h-[35rem] bg-accent/20 rounded-full blur-[100px] mix-blend-screen pointer-events-none" />

      <div className="rounded-xl border border-border/50 bg-card/70 backdrop-blur-xl p-8 shadow-2xl text-center relative z-10 w-full max-w-md">
        <h1 className="text-3xl font-bold font-mono tracking-tight text-primary mb-4">Welcome, <span className="text-foreground">{user?.name || 'Admin'}</span>!</h1>
        <p className="mt-2 text-muted-foreground mb-8 text-sm">You have successfully logged in.</p>
        <button onClick={logout} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">Logout</button>
      </div>
    </div>
  )
}

function AppContent() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <Dashboard />
        </ProtectedRoute>
      } />
    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  )
}

export default App
