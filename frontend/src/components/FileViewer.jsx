import { useRef, useEffect, useMemo } from 'react'
import { useAuth } from '../hooks/useAuth.jsx'
import PermissionToggle from './PermissionToggle.jsx'

function hasOwnStyles(html) {
  const lower = html.toLowerCase()
  return (
    lower.includes('<style') ||
    lower.includes('<link') ||
    lower.includes('<html') ||
    lower.includes('<head') ||
    lower.includes('<body') ||
    lower.includes('<script')
  )
}

function IframeViewer({ html, title }) {
  const iframeRef = useRef(null)

  const blobUrl = useMemo(() => {
    if (!html) return ''
    const blob = new Blob([html], { type: 'text/html; charset=utf-8' })
    return URL.createObjectURL(blob)
  }, [html])

  useEffect(() => {
    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl)
    }
  }, [blobUrl])

  return (
    <iframe
      ref={iframeRef}
      src={blobUrl}
      className="w-full h-full"
      style={{ border: 'none', display: 'block' }}
      sandbox="allow-scripts allow-same-origin"
      title={title || 'Document'}
    />
  )
}

export default function FileViewer({ content, loading, error, immersive }) {
  const { user } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-5 h-5 border-2 rounded-full animate-spin"
            style={{ borderColor: 'var(--border)', borderTopColor: 'var(--accent)' }}
          />
          <span className="text-xs tracking-widest uppercase" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            Loading Document
          </span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="text-center px-6">
          <div className="text-3xl mb-3" style={{ color: 'var(--danger)', fontFamily: 'var(--font-mono)' }}>⚠</div>
          <p className="text-sm" style={{ color: 'var(--danger)' }}>{error}</p>
        </div>
      </div>
    )
  }

  if (!content) {
    return (
      <div className="flex items-center justify-center h-full" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="text-center px-6">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-xl mb-4"
            style={{
              backgroundColor: 'var(--bg-tertiary)',
              border: '1px solid var(--border)',
            }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"
              style={{ color: 'var(--text-faint)' }}
            >
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
          </div>
          <p className="text-sm mb-1" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
            从左侧选择一个文件
          </p>
          <p className="text-xs" style={{ color: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}>
            SELECT A DOCUMENT TO VIEW
          </p>
        </div>
      </div>
    )
  }

  // Immersive mode: full-screen iframe with zero chrome
  if (immersive && content.type === 'html') {
    return (
      <div className="w-full h-full animate-fade-in">
        {hasOwnStyles(content.html) ? (
          <IframeViewer html={content.html} title={content.info?.name} />
        ) : (
          <div
            className="html-raw animate-fade-in-up h-full overflow-y-auto px-8 py-10"
            dangerouslySetInnerHTML={{ __html: content.html }}
          />
        )}
      </div>
    )
  }

  const isPdf = content.type === 'pdf'

  return (
    <div
      className={`h-full animate-fade-in ${isPdf ? 'flex flex-col overflow-hidden' : 'overflow-y-auto'}`}
      style={{ backgroundColor: 'var(--bg-primary)' }}
    >
      {isPdf ? (
        <>
          {/* Document Header */}
          <div className="px-8 pt-10 pb-4 shrink-0"
            style={{ borderBottom: '1px solid var(--border)' }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h1
                  className="text-2xl font-bold leading-tight"
                  style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
                >
                  {content.info?.name?.replace(/\.pdf$/i, '')}
                </h1>
                <p className="text-xs mt-2 flex items-center gap-2"
                  style={{ color: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}
                >
                  <span className="inline-block w-1 h-1 rounded-full" style={{ backgroundColor: 'var(--accent-dim)' }} />
                  {content.info?.path}
                </p>
              </div>
              {user && content.info?.path && (
                <div className="shrink-0 pt-1">
                  <PermissionToggle filePath={content.info.path} />
                </div>
              )}
            </div>
          </div>

          {/* PDF Viewer */}
          <div className="flex-1 min-h-0 p-4">
            <embed
              src={`/api/files/raw/${encodeURIComponent(content.info.path)}`}
              type="application/pdf"
              className="w-full h-full rounded-lg"
              style={{ border: '1px solid var(--border)', display: 'block' }}
            />
          </div>
        </>
      ) : (
        <div className="max-w-3xl mx-auto px-8 py-10">
          {/* Document Header */}
          <div className="flex items-start justify-between gap-4 mb-8 pb-6"
            style={{ borderBottom: '1px solid var(--border)' }}
          >
            <div className="min-w-0">
              <h1
                className="text-2xl font-bold leading-tight"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
              >
                {content.info?.name?.replace(/\.md$|\.html$/, '')}
              </h1>
              <p className="text-xs mt-2 flex items-center gap-2"
                style={{ color: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}
              >
                <span className="inline-block w-1 h-1 rounded-full" style={{ backgroundColor: 'var(--accent-dim)' }} />
                {content.info?.path}
              </p>
            </div>
            {user && content.info?.path && (
              <div className="shrink-0 pt-1">
                <PermissionToggle filePath={content.info.path} />
              </div>
            )}
          </div>

          {/* Content */}
          {content.type === 'markdown' && (
            <div
              className="markdown-body animate-fade-in-up"
              dangerouslySetInnerHTML={{ __html: content.html }}
            />
          )}

          {content.type === 'html' && (
            hasOwnStyles(content.html) ? (
              <IframeViewer html={content.html} title={content.info?.name} />
            ) : (
              <div
                className="html-raw animate-fade-in-up"
                dangerouslySetInnerHTML={{ __html: content.html }}
              />
            )
          )}

          {/* Footer divider */}
          <div className="mt-16 pt-6" style={{ borderTop: '1px solid var(--border)' }}>
            <p className="text-[10px] tracking-wider uppercase text-center"
              style={{ color: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}
            >
              End of Document
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
