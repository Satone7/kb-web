import { useState } from 'react'

function TreeNode({ node, selectedPath, onSelect, depth = 0, index = 0 }) {
  const [expanded, setExpanded] = useState(true)
  const isSelected = node.path === selectedPath
  const paddingLeft = depth * 14 + 10

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

  if (node.type === 'file') {
    return (
      <div
        onClick={() => onSelect(node.path)}
        className="flex items-center gap-2 py-1.5 pr-3 text-sm cursor-pointer mx-1 transition-all duration-200"
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
        <span className="truncate text-[13px]">{node.name}</span>
      </div>
    )
  }

  return (
    <div className="animate-fade-in" style={{ animationDelay: `${index * 20}ms` }}>
      <div
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1.5 py-1.5 pr-3 text-sm cursor-pointer mx-1 transition-all duration-200"
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
        <span className="font-medium truncate text-[13px]">{node.name}</span>
      </div>
      {expanded && node.children?.map((child, i) => (
        <TreeNode
          key={child.path}
          node={child}
          selectedPath={selectedPath}
          onSelect={onSelect}
          depth={depth + 1}
          index={i}
        />
      ))}
    </div>
  )
}

export default function FileTree({ tree, selectedPath, onSelect }) {
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
      <TreeNode node={tree} selectedPath={selectedPath} onSelect={onSelect} />
    </div>
  )
}
