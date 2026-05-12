import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth.jsx'
import LoginForm from './components/LoginForm.jsx'
import Home from './pages/Home.jsx'
import LoginPage from './pages/LoginPage.jsx'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-5 h-5 border-2 rounded-full animate-spin"
            style={{ borderColor: 'var(--border)', borderTopColor: 'var(--accent)' }}
          />
          <span className="text-sm" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
            加载中...
          </span>
        </div>
      </div>
    )
  }
  return user ? children : <Navigate to="/login" replace />
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-5 h-5 border-2 rounded-full animate-spin"
            style={{ borderColor: 'var(--border)', borderTopColor: 'var(--accent)' }}
          />
          <span className="text-sm" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
            加载中...
          </span>
        </div>
      </div>
    )
  }
  return user ? <Navigate to="/" replace /> : children
}

function AppRoutes() {
  const { showLoginModal, closeLoginModal } = useAuth()
  return (
    <>
      <Routes>
        <Route path="/login" element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        } />
        <Route path="/*" element={<Home />} />
      </Routes>
      {showLoginModal && (
        <div
          className="fixed inset-0 flex items-center justify-center animate-fade-in"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(4px)', zIndex: 9999 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) closeLoginModal()
          }}
        >
          <LoginForm onSuccess={closeLoginModal} />
        </div>
      )}
    </>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <div className="ambient-glow" />
      <div className="noise-overlay" />
      <AppRoutes />
    </AuthProvider>
  )
}
