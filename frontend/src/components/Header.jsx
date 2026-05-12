import { useState } from 'react'
import { useAuth } from '../hooks/useAuth.jsx'

export default function Header({ onSearch }) {
  const { user, logout, openLoginModal } = useAuth()
  const [query, setQuery] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)

  const handleSearch = (e) => {
    e.preventDefault()
    if (query.trim()) {
      onSearch(query.trim())
    }
  }

  const handleClear = () => {
    setQuery('')
    onSearch('')
  }

  return (
    <>
      <header
        className="flex items-center justify-between px-5 h-14 shrink-0 relative z-20"
        style={{
          backgroundColor: 'rgba(10, 10, 16, 0.9)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--border)',
        }}
      >
      {/* Logo */}
      <div className="flex items-center gap-2.5 shrink-0">
        <div
          className="flex items-center justify-center w-7 h-7 rounded-md"
          style={{
            backgroundColor: 'var(--bg-tertiary)',
            border: '1px solid var(--border)',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
            style={{ color: 'var(--accent)' }}
          >
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          </svg>
        </div>
        <span
          className="text-sm font-bold tracking-wide"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
        >
          知识库
        </span>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex-1 max-w-lg mx-6">
        <div
          className="flex items-center gap-2 px-3 py-1.5 transition-all duration-300"
          style={{
            backgroundColor: 'var(--bg-tertiary)',
            border: `1px solid ${searchFocused ? 'var(--accent-dim)' : 'var(--border)'}`,
            borderRadius: 'var(--radius-sm)',
            boxShadow: searchFocused ? '0 0 12px var(--accent-glow)' : 'none',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
            style={{ color: 'var(--text-muted)', flexShrink: 0 }}
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="搜索文件..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className="flex-1 text-sm outline-none bg-transparent min-w-0"
            style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-body)' }}
          />
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="text-[10px] px-1.5 py-0.5 rounded transition-colors"
              style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
            >
              ESC
            </button>
          )}
        </div>
      </form>

      {/* User */}
      <div className="flex items-center gap-3 shrink-0">
        {user ? (
          <>
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
                style={{
                  backgroundColor: 'var(--accent-glow)',
                  color: 'var(--accent)',
                  border: '1px solid var(--accent-dim)',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                {user.username.charAt(0).toUpperCase()}
              </div>
              <span className="text-xs" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}>
                {user.username}
              </span>
            </div>
            <button
              onClick={logout}
              className="p-1.5 rounded-md transition-all duration-200"
              style={{ color: 'var(--text-muted)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--danger)'
                e.currentTarget.style.backgroundColor = 'rgba(196, 90, 90, 0.1)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-muted)'
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
              title="登出"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </>
        ) : (
          <button
            onClick={openLoginModal}
            className="text-xs px-3 py-1.5 rounded-md transition-all duration-200"
            style={{
              color: 'var(--text-muted)',
              border: '1px solid var(--border)',
              backgroundColor: 'transparent',
              fontFamily: 'var(--font-mono)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--accent)'
              e.currentTarget.style.borderColor = 'var(--accent-dim)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-muted)'
              e.currentTarget.style.borderColor = 'var(--border)'
            }}
          >
            未登录
          </button>
        )}
      </div>

    </header>
  </>
  )
}
