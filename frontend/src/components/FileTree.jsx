import { useState } from 'react'

function collectAllFiles(node, files = []) {
  if (node.type === 'file') {
    files.push(node.path)
  } else if (node.children) {
    for (const child of node.children) {
      collectAllFiles(child, files)
    }
  }
  return files
}

function getDirStatus(node, permissions) {
  const files = collectAllFiles(node)
  const hasFiles = files.length > 0
  const allPublic = hasFiles && files.every(p => permissions[p])
  return { allPublic, hasFiles, fileCount: files.length }
}

function TreeNode({ node, selectedPath, onSelect, depth = 0, index = 0, permissions = {}, user, onPublicDirectory, onToggleFile }) {
  const [expanded, setExpanded] = useState(true)
  const [toggling, setToggling] = useState(false)
  const isSelected = node.path === selectedPath
  const paddingLeft = depth * 14 + 10
  const isPublic = permissions[node.path]

  const fileIcon = node.name.endsWith('.md') ? (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--accent-dim)', flexShrink: 0 }}>
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <line x1="10" y1="9" x2="8" y2="9" />
    </svg>
  ) : (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--text-faint)', flexShrink: 0 }}>
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  )

  const handleToggleDirectory = async (e) => {
    e.stopPropagation()
    if (!onPublicDirectory || toggling) return
    setToggling(true)
    try {
      const { allPublic } = getDirStatus(node, permissions)
      await onPublicDirectory(node.path, !allPublic)
    } finally {
      setToggling(false)
    }
  }

  if (node.type === 'file') {
    return (
      <div
        onClick={() => onSelect(node.path)}
        className="flex items-center gap-2 py-1.5 pr-3 text-sm cursor-pointer mx-1 transition-all duration-200 group"
        style={{
          paddingLeft: `${paddingLeft}px`,
          borderRadius: 'var(--radius-sm)',
          color: isSelected ? 'var(--accent)' : 'var(--text-secondary)',
          backgroundColor: isSelected ? 'var(--accent-glow)' : 'transparent',
          borderLeft: isSelected ? '2px solid var(--accent)' : '2px solid transparent',
          animationDelay: `${index * 30}ms`,
          fontFamily: 'var(--font-body)',
        }}
        onMouseEnter={(e) => {
          if (!isSelected) {
            e.currentTarget.style.backgroundColor = 'var(--bg-hover)'
            e.currentTarget.style.color = 'var(--text-primary)'
          }
        }}
        onMouseLeave={(e) => {
          if (!isSelected) {
            e.currentTarget.style.backgroundColor = 'transparent'
            e.currentTarget.style.color = 'var(--text-secondary)'
          }
        }}
      >
        {fileIcon}
        {isPublic && (
          <span
            className="w-1.5 h-1.5 rounded-full shrink-0"
            style={{
              backgroundColor: 'var(--success)',
              boxShadow: '0 0 4px var(--success)',
            }}
            title="PUBLIC"
          />
        )}
        <span className="truncate text-[13px] flex-1">{node.name}</span>
        {user && node.path && onToggleFile && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onToggleFile(node.path)
            }}
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-[10px] px-1.5 py-0.5 rounded shrink-0"
            style={{
              backgroundColor: isPublic ? 'rgba(90, 154, 106, 0.1)' : 'var(--bg-tertiary)',
              color: isPublic ? 'var(--success)' : 'var(--text-muted)',
              border: `1px solid ${isPublic ? 'rgba(90, 154, 106, 0.3)' : 'var(--border)'}`,
              fontFamily: 'var(--font-mono)',
              cursor: 'pointer',
            }}
            title={isPublic ? '当前 PUBLIC，点击设为 PRIVATE' : '当前 PRIVATE，点击设为 PUBLIC'}
          >
            {isPublic ? 'PUBLIC' : 'PRIVATE'}
          </button>
        )}
      </div>
    )
  }

  const { allPublic, hasFiles } = getDirStatus(node, permissions)
  const btnLabel = allPublic ? 'PUBLIC' : 'PRIVATE'

  return (
    <div className="animate-fade-in" style={{ animationDelay: `${index * 20}ms` }}>
      <div
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1.5 py-1.5 pr-3 text-sm cursor-pointer mx-1 transition-all duration-200 group"
        style={{
          paddingLeft: `${paddingLeft}px`,
          borderRadius: 'var(--radius-sm)',
          color: 'var(--text-muted)',
          fontFamily: 'var(--font-body)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--bg-hover)'
          e.currentTarget.style.color = 'var(--text-secondary)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent'
          e.currentTarget.style.color = 'var(--text-muted)'
        }}
      >
        <span
          className="text-[9px] w-4 text-center transition-transform duration-200 shrink-0"
          style={{ color: 'var(--text-faint)' }}
        >
          {expanded ? '▼' : '▶'}
        </span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--accent-dim)', flexShrink: 0 }}>
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
        </svg>
        {allPublic && hasFiles && (
          <span
            className="w-1.5 h-1.5 rounded-full shrink-0"
            style={{
              backgroundColor: 'var(--success)',
              boxShadow: '0 0 4px var(--success)',
            }}
            title="全部 PUBLIC"
          />
        )}
        <span className="font-medium truncate text-[13px] flex-1">{node.name}</span>
        {user && node.path && (
          <button
            onClick={handleToggleDirectory}
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-[10px] px-1.5 py-0.5 rounded shrink-0"
            style={{
              backgroundColor: allPublic ? 'rgba(90, 154, 106, 0.1)' : 'var(--bg-tertiary)',
              color: allPublic ? 'var(--success)' : 'var(--text-muted)',
              border: `1px solid ${allPublic ? 'rgba(90, 154, 106, 0.3)' : 'var(--border)'}`,
              fontFamily: 'var(--font-mono)',
              cursor: toggling ? 'not-allowed' : 'pointer',
            }}
            title={allPublic ? '当前全部 PUBLIC，点击设为 PRIVATE' : '当前存在 PRIVATE，点击全部设为 PUBLIC'}
          >
            {toggling ? '...' : btnLabel}
          </button>
        )}
      </div>
      {expanded && node.children?.map((child, i) => (
        <TreeNode
          key={child.path}
          node={child}
          selectedPath={selectedPath}
          onSelect={onSelect}
          depth={depth + 1}
          index={i}
          permissions={permissions}
          user={user}
          onPublicDirectory={onPublicDirectory}
          onToggleFile={onToggleFile}
        />
      ))}
    </div>
  )
}

export default function FileTree({ tree, selectedPath, onSelect, permissions = {}, user, onPublicDirectory, onToggleFile }) {
  if (!tree) {
    return (
      <div className="p-4 text-sm animate-fade-in" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--accent)' }} />
          INDEXING...
        </div>
      </div>
    )
  }

  return (
    <div className="overflow-y-auto h-full py-3">
      <TreeNode
        node={tree}
        selectedPath={selectedPath}
        onSelect={onSelect}
        permissions={permissions}
        user={user}
        onPublicDirectory={onPublicDirectory}
        onToggleFile={onToggleFile}
      />
    </div>
  )
}
