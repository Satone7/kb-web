import { useState, useEffect, useCallback } from 'react'
import api from '../api.js'

export function useFileTree() {
  const [tree, setTree] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchTree = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get('/files/tree')
      setTree(res.data)
      setError(null)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load file tree')
      setTree(null)
    } finally {
      setLoading(false)
    }
  }, [])

  return { tree, loading, error, fetchTree }
}

export function useFileContent(path) {
  const [content, setContent] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchContent = useCallback(async (filePath) => {
    if (!filePath) return
    setLoading(true)
    try {
      const res = await api.get(`/files/content/${encodeURIComponent(filePath)}`)
      setContent(res.data)
      setError(null)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load file')
      setContent(null)
    } finally {
      setLoading(false)
    }
  }, [])

  return { content, loading, error, fetchContent }
}

export function usePermissions() {
  const [permissions, setPermissions] = useState({})
  const [loading, setLoading] = useState(false)

  const fetchPermissions = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get('/permissions/')
      setPermissions(res.data)
    } catch (err) {
      setPermissions({})
    } finally {
      setLoading(false)
    }
  }, [])

  const publicDirectory = useCallback(async (dirPath, isPublic) => {
    const res = await api.post(`/permissions/directory/${encodeURIComponent(dirPath)}`, { public: isPublic })
    return res.data
  }, [])

  const toggleFile = useCallback(async (filePath) => {
    const current = permissions[filePath] || false
    const res = await api.post(`/permissions/${encodeURIComponent(filePath)}`, { public: !current })
    setPermissions(prev => ({ ...prev, [filePath]: res.data.public }))
    return res.data
  }, [permissions])

  return { permissions, loading, fetchPermissions, publicDirectory, toggleFile }
}
