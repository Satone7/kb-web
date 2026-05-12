import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'

export default function LoginForm({ onSuccess }) {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [focused, setFocused] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await login(username, password)
      if (onSuccess) {
        onSuccess()
      } else {
        navigate('/')
      }
    } catch (err) {
      setError(err.response?.data?.error || '登录失败')
    } finally {
      setSubmitting(false)
    }
  }

  if (onSuccess) {
    return (
      <div className="w-full max-w-sm px-6">
        <div
          className="p-8 animate-fade-in-up"
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          <div className="text-center mb-8">
            <div
              className="inline-flex items-center justify-center w-12 h-12 mb-4 rounded-lg"
              style={{
                backgroundColor: 'var(--bg-tertiary)',
                border: '1px solid var(--border)',
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
                style={{ color: 'var(--accent)' }}
              >
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
            </div>
            <h1
              className="text-xl font-bold tracking-wide"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
            >
              知识库
            </h1>
            <p className="text-xs mt-1.5 tracking-widest uppercase" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              Archive Access
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                className="block text-xs font-medium mb-1.5 tracking-wide"
                style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}
              >
                USERNAME
              </label>
              <div
                className="relative transition-all duration-300"
                style={{
                  borderRadius: 'var(--radius-sm)',
                  boxShadow: focused === 'username' ? '0 0 0 1px var(--accent-dim), 0 0 12px var(--accent-glow)' : 'none',
                }}
              >
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onFocus={() => setFocused('username')}
                  onBlur={() => setFocused(null)}
                  className="w-full px-3.5 py-2.5 text-sm outline-none transition-colors"
                  style={{
                    backgroundColor: 'var(--bg-tertiary)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-body)',
                  }}
                  required
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label
                className="block text-xs font-medium mb-1.5 tracking-wide"
                style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}
              >
                PASSWORD
              </label>
              <div
                className="relative transition-all duration-300"
                style={{
                  borderRadius: 'var(--radius-sm)',
                  boxShadow: focused === 'password' ? '0 0 0 1px var(--accent-dim), 0 0 12px var(--accent-glow)' : 'none',
                }}
              >
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocused('password')}
                  onBlur={() => setFocused(null)}
                  className="w-full px-3.5 py-2.5 text-sm outline-none transition-colors"
                  style={{
                    backgroundColor: 'var(--bg-tertiary)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-body)',
                  }}
                  required
                />
              </div>
            </div>

            {error && (
              <div
                className="px-3 py-2 text-xs rounded-md animate-fade-in"
                style={{
                  backgroundColor: 'rgba(196, 90, 90, 0.1)',
                  border: '1px solid rgba(196, 90, 90, 0.2)',
                  color: 'var(--danger)',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 text-sm font-medium tracking-wide transition-all duration-300 relative overflow-hidden"
              style={{
                backgroundColor: submitting ? 'var(--bg-tertiary)' : 'var(--bg-tertiary)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                color: submitting ? 'var(--text-muted)' : 'var(--accent)',
                fontFamily: 'var(--font-mono)',
              }}
              onMouseEnter={(e) => {
                if (!submitting) {
                  e.currentTarget.style.borderColor = 'var(--accent-dim)'
                  e.currentTarget.style.boxShadow = '0 0 16px var(--accent-glow)'
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              {submitting ? 'VERIFYING...' : 'ACCESS ARCHIVE'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Decorative vertical lines */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute left-[15%] top-0 bottom-0 w-px" style={{ background: 'linear-gradient(to bottom, transparent, var(--border), transparent)' }} />
        <div className="absolute left-[35%] top-0 bottom-0 w-px" style={{ background: 'linear-gradient(to bottom, transparent, var(--border), transparent)' }} />
        <div className="absolute right-[25%] top-0 bottom-0 w-px" style={{ background: 'linear-gradient(to bottom, transparent, var(--border), transparent)' }} />
      </div>

      <div className="relative z-10 w-full max-w-sm px-6">
        {/* Card */}
        <div
          className="p-8 animate-fade-in-up"
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div
              className="inline-flex items-center justify-center w-12 h-12 mb-4 rounded-lg"
              style={{
                backgroundColor: 'var(--bg-tertiary)',
                border: '1px solid var(--border)',
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
                style={{ color: 'var(--accent)' }}
              >
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
            </div>
            <h1
              className="text-xl font-bold tracking-wide"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
            >
              知识库
            </h1>
            <p className="text-xs mt-1.5 tracking-widest uppercase" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              Archive Access
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                className="block text-xs font-medium mb-1.5 tracking-wide"
                style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}
              >
                USERNAME
              </label>
              <div
                className="relative transition-all duration-300"
                style={{
                  borderRadius: 'var(--radius-sm)',
                  boxShadow: focused === 'username' ? '0 0 0 1px var(--accent-dim), 0 0 12px var(--accent-glow)' : 'none',
                }}
              >
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onFocus={() => setFocused('username')}
                  onBlur={() => setFocused(null)}
                  className="w-full px-3.5 py-2.5 text-sm outline-none transition-colors"
                  style={{
                    backgroundColor: 'var(--bg-tertiary)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-body)',
                  }}
                  required
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label
                className="block text-xs font-medium mb-1.5 tracking-wide"
                style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}
              >
                PASSWORD
              </label>
              <div
                className="relative transition-all duration-300"
                style={{
                  borderRadius: 'var(--radius-sm)',
                  boxShadow: focused === 'password' ? '0 0 0 1px var(--accent-dim), 0 0 12px var(--accent-glow)' : 'none',
                }}
              >
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocused('password')}
                  onBlur={() => setFocused(null)}
                  className="w-full px-3.5 py-2.5 text-sm outline-none transition-colors"
                  style={{
                    backgroundColor: 'var(--bg-tertiary)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-body)',
                  }}
                  required
                />
              </div>
            </div>

            {error && (
              <div
                className="px-3 py-2 text-xs rounded-md animate-fade-in"
                style={{
                  backgroundColor: 'rgba(196, 90, 90, 0.1)',
                  border: '1px solid rgba(196, 90, 90, 0.2)',
                  color: 'var(--danger)',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 text-sm font-medium tracking-wide transition-all duration-300 relative overflow-hidden"
              style={{
                backgroundColor: submitting ? 'var(--bg-tertiary)' : 'var(--bg-tertiary)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                color: submitting ? 'var(--text-muted)' : 'var(--accent)',
                fontFamily: 'var(--font-mono)',
              }}
              onMouseEnter={(e) => {
                if (!submitting) {
                  e.currentTarget.style.borderColor = 'var(--accent-dim)'
                  e.currentTarget.style.boxShadow = '0 0 16px var(--accent-glow)'
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              {submitting ? 'VERIFYING...' : 'ACCESS ARCHIVE'}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 pt-4 text-center" style={{ borderTop: '1px solid var(--border)' }}>
            <p className="text-[10px] tracking-wider uppercase" style={{ color: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}>
              Private Knowledge Base
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
