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
