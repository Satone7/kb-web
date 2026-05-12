import { useState, useEffect, useCallback, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import Header from '../components/Header.jsx'
import FileTree from '../components/FileTree.jsx'
import FileViewer from '../components/FileViewer.jsx'
import PermissionToggle from '../components/PermissionToggle.jsx'
import { useAuth } from '../hooks/useAuth.jsx'
import { useFileTree, useFileContent } from '../hooks/useFiles.js'
import api from '../api.js'

export default function Home() {
  const { user } = useAuth()
  const { tree, loading: treeLoading, error: treeError, fetchTree } = useFileTree()
  const { content, loading: contentLoading, error: contentError, fetchContent } = useFileContent()
  const [selectedPath, setSelectedPath] = useState('')
  const [searchResults, setSearchResults] = useState(null)
  const [publicTree, setPublicTree] = useState(null)
  const [searchParams, setSearchParams] = useSearchParams()
  const [barsExpanded, setBarsExpanded] = useState(false)
  const collapseTimerRef = useRef(null)

  const expandBars = useCallback(() => {
    if (collapseTimerRef.current) {
      clearTimeout(collapseTimerRef.current)
      collapseTimerRef.current = null
    }
    setBarsExpanded(true)
  }, [])

  const scheduleCollapse = useCallback(() => {
    collapseTimerRef.current = setTimeout(() => {
      setBarsExpanded(false)
      collapseTimerRef.current = null
    }, 1000)
  }, [])

  useEffect(() => {
    return () => {
      if (collapseTimerRef.current) clearTimeout(collapseTimerRef.current)
    }
  }, [])

  useEffect(() => {
    if (user) {
      fetchTree()
    }
  }, [fetchTree, user])

  useEffect(() => {
    if (!user) {
      api.get('/public/tree')
        .then(res => setPublicTree(res.data))
        .catch(() => setPublicTree(null))
    } else {
      setPublicTree(null)
    }
  }, [user])

  // Sync content with URL ?file= param
  useEffect(() => {
    const fileFromUrl = searchParams.get('file')
    if (fileFromUrl) {
      if (selectedPath !== fileFromUrl) {
        setSelectedPath(fileFromUrl)
      }
      fetchContent(fileFromUrl)
    } else {
      if (selectedPath) {
        setSelectedPath('')
      }
    }
  }, [searchParams])

  const handleSelect = useCallback((path) => {
    setSearchResults(null)
    setSearchParams({ file: path })
  }, [setSearchParams])

  const handleSearch = useCallback(async (query) => {
    if (!query) {
      setSearchResults(null)
      return
    }
    try {
      const res = await api.get(`/files/search?q=${encodeURIComponent(query)}`)
      setSearchResults(res.data)
    } catch (err) {
      console.error('Search failed:', err)
      setSearchResults([])
    }
  }, [])

  const displayTree = user ? tree : publicTree
  const isImmersive = selectedPath.toLowerCase().endsWith('.html') && searchResults === null

  return (
    <div className={`h-screen ${isImmersive ? 'relative overflow-hidden' : 'flex flex-col'}`}
      style={{ backgroundColor: 'var(--bg-primary)' }}
    >
      {/* ===== Header ===== */}
      {isImmersive ? (
        <div
          className="immersive-top-bar absolute top-0 left-0 right-0 z-50 overflow-hidden transition-all duration-300"
          style={{
            height: barsExpanded ? 56 : 6,
            backgroundColor: 'rgba(10, 10, 16, 0.95)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderBottom: '1px solid var(--border)',
          }}
          onMouseEnter={expandBars}
          onMouseLeave={scheduleCollapse}
        >
          <div className="h-14">
            <Header onSearch={handleSearch} />
          </div>
        </div>
      ) : (
        <div className="h-14 shrink-0 relative z-20">
          <Header onSearch={handleSearch} />
        </div>
      )}

      {/* ===== Body ===== */}
      {isImmersive ? (
        <div className="absolute inset-0">
          {/* Left sidebar strip */}
          <div
            className="immersive-sidebar-bar absolute left-0 bottom-0 z-40 overflow-hidden transition-all duration-300"
            style={{
              top: barsExpanded ? 56 : 6,
              width: barsExpanded ? 288 : 6,
              backgroundColor: 'var(--bg-secondary)',
              borderRight: '1px solid var(--border)',
            }}
            onMouseEnter={expandBars}
            onMouseLeave={scheduleCollapse}
          >
            <div className="w-72 h-full flex flex-col">
              {/* Sidebar Header */}
              <div className="px-4 py-3 flex items-center justify-between"
                style={{ borderBottom: '1px solid var(--border)' }}
              >
                <span className="text-[10px] font-medium tracking-widest uppercase"
                  style={{ color: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}
                >
                  File Index
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px]" style={{ color: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}>
                    {treeLoading ? '...' : (displayTree ? countFiles(displayTree) + ' docs' : '0 docs')}
                  </span>
                  {user && selectedPath && (
                    <PermissionToggle filePath={selectedPath} />
                  )}
                </div>
              </div>

              {/* Tree */}
              <div className="flex-1 overflow-hidden">
                {treeError ? (
                  <div className="p-4 text-sm" style={{ color: 'var(--danger)', fontFamily: 'var(--font-mono)' }}>
                    {treeError}
                  </div>
                ) : (
                  <FileTree
                    tree={displayTree}
                    selectedPath={selectedPath}
                    onSelect={handleSelect}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Main content — full screen iframe */}
          <div className="absolute left-[6px] right-0 bottom-0 top-[6px]">
            <FileViewer
              content={content}
              loading={contentLoading}
              error={contentError}
              immersive
            />
          </div>
        </div>
      ) : (
        <div className="flex flex-1 overflow-hidden relative z-10">
          {/* Sidebar */}
          <div
            className="w-72 flex flex-col shrink-0"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              borderRight: '1px solid var(--border)',
            }}
          >
            {/* Sidebar Header */}
            <div className="px-4 py-3 flex items-center justify-between"
              style={{ borderBottom: '1px solid var(--border)' }}
            >
              <span className="text-[10px] font-medium tracking-widest uppercase"
                style={{ color: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}
              >
                File Index
              </span>
              <span className="text-[10px]" style={{ color: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}>
                {treeLoading ? '...' : (displayTree ? countFiles(displayTree) + ' docs' : '0 docs')}
              </span>
            </div>

            {/* Tree */}
            <div className="flex-1 overflow-hidden">
              {treeError ? (
                <div className="p-4 text-sm" style={{ color: 'var(--danger)', fontFamily: 'var(--font-mono)' }}>
                  {treeError}
                </div>
              ) : (
                <FileTree
                  tree={displayTree}
                  selectedPath={selectedPath}
                  onSelect={handleSelect}
                />
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-hidden" style={{ backgroundColor: 'var(--bg-primary)' }}>
            {searchResults !== null ? (
              <SearchResults results={searchResults} onSelect={handleSelect} />
            ) : (
              <FileViewer
                content={content}
                loading={contentLoading}
                error={contentError}
              />
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function SearchResults({ results, onSelect }) {
  return (
    <div className="h-full overflow-y-auto animate-fade-in" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="max-w-3xl mx-auto px-8 py-8">
        {/* Search Header */}
        <div className="mb-8 pb-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="flex items-center gap-3 mb-1">
            <span className="text-[10px] tracking-widest uppercase"
              style={{ color: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}
            >
              Search Results
            </span>
          </div>
          <h2 className="text-lg font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
            找到 {results.length} 个结果
          </h2>
        </div>

        {results.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-3xl mb-3" style={{ color: 'var(--text-faint)' }}>∅</div>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>没有找到匹配的文件</p>
          </div>
        ) : (
          <div className="space-y-3">
            {results.map((result, i) => (
              <div
                key={result.path}
                onClick={() => onSelect(result.path)}
                className="p-4 cursor-pointer transition-all duration-300 animate-fade-in-up"
                style={{
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  animationDelay: `${i * 40}ms`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-hover)'
                  e.currentTarget.style.boxShadow = '0 0 16px var(--accent-glow)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-sm font-medium" style={{ color: 'var(--accent)', fontFamily: 'var(--font-body)' }}>
                    {result.name}
                  </span>
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded"
                    style={{
                      backgroundColor: 'var(--bg-tertiary)',
                      color: 'var(--text-muted)',
                      fontFamily: 'var(--font-mono)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    {result.type === 'name' ? 'NAME' : 'CONTENT'}
                  </span>
                </div>
                <p className="text-xs mb-2" style={{ color: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}>
                  {result.path}
                </p>
                {result.snippet && (
                  <p className="text-sm line-clamp-2" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}>
                    {result.snippet}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function countFiles(node) {
  if (node.type === 'file') return 1
  return (node.children || []).reduce((sum, child) => sum + countFiles(child), 0)
}
