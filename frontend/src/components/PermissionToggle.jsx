import { useState, useEffect } from 'react'
import api from '../api.js'

export default function PermissionToggle({ filePath }) {
  const [isPublic, setIsPublic] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchPermission = async () => {
      try {
        const res = await api.get(`/permissions/${encodeURIComponent(filePath)}`)
        setIsPublic(res.data.public)
      } catch (err) {
        console.error('Failed to load permission:', err)
      }
    }
    fetchPermission()
  }, [filePath])

  const toggle = async () => {
    setLoading(true)
    try {
      const res = await api.post(`/permissions/${encodeURIComponent(filePath)}`, {
        public: !isPublic,
      })
      setIsPublic(res.data.public)
    } catch (err) {
      console.error('Failed to update permission:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className="flex items-center gap-2 px-3 py-1.5 text-xs transition-all duration-300"
      style={{
        borderRadius: 'var(--radius-sm)',
        backgroundColor: isPublic ? 'rgba(90, 154, 106, 0.1)' : 'var(--bg-tertiary)',
        border: `1px solid ${isPublic ? 'rgba(90, 154, 106, 0.3)' : 'var(--border)'}`,
        color: isPublic ? 'var(--success)' : 'var(--text-muted)',
        fontFamily: 'var(--font-mono)',
        cursor: loading ? 'not-allowed' : 'pointer',
        opacity: loading ? 0.6 : 1,
      }}
      onMouseEnter={(e) => {
        if (!loading) {
          e.currentTarget.style.borderColor = isPublic ? 'var(--success)' : 'var(--accent-dim)'
          e.currentTarget.style.boxShadow = '0 0 8px var(--accent-glow)'
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = isPublic ? 'rgba(90, 154, 106, 0.3)' : 'var(--border)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full transition-all duration-300"
        style={{
          backgroundColor: isPublic ? 'var(--success)' : 'var(--text-faint)',
          boxShadow: isPublic ? '0 0 4px var(--success)' : 'none',
        }}
      />
      {isPublic ? 'PUBLIC' : 'PRIVATE'}
    </button>
  )
}
