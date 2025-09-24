import React, { useEffect, useRef } from 'react'
import { Plus, Edit, Trash2, FolderPlus, Folder, Move } from 'lucide-react'

interface ContextMenuProps {
  x: number
  y: number
  onClose: () => void
  // 分类操作
  onAddNote?: () => void
  onAddCategory?: () => void
  onAddSubCategory?: () => void
  onEditCategory?: () => void
  onDeleteCategory?: () => void
  categoryName?: string
  categoryId?: string
  // 笔记操作
  onEditNote?: () => void
  onMoveNote?: () => void
  onDeleteNote?: () => void
  noteTitle?: string
  noteId?: string
  // 菜单类型
  type?: 'category' | 'note'
  isDark?: boolean
}

export default function ContextMenu({ 
  x, 
  y, 
  onClose, 
  onAddNote, 
  onAddCategory,
  onAddSubCategory,
  onEditCategory,
  onDeleteCategory,
  onEditNote,
  onMoveNote,
  onDeleteNote,
  categoryName,
  categoryId,
  noteTitle,
  noteId,
  type = 'category',
  isDark = false 
}: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [onClose])

  return (
    <div
      ref={menuRef}
      className={`
        fixed z-50 min-w-32 py-2 rounded-lg shadow-lg
        ${isDark 
          ? 'bg-[#2a2a2a] border border-[#404040]' 
          : 'bg-white border border-gray-200'
        }
      `}
      style={{ left: x, top: y }}
    >
      {type === 'category' && (
        <>
          {onAddNote && (
            <button
              onClick={() => {
                onAddNote()
                onClose()
              }}
              className={`
                w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors
                ${isDark 
                  ? 'text-[#e0e0e0] hover:bg-[#404040]' 
                  : 'text-gray-700 hover:bg-gray-50'
                }
              `}
            >
              <Plus className="w-4 h-4" />
              新建笔记
            </button>
          )}

          {/* 分隔线 */}
          <div className={`my-1 h-px ${isDark ? 'bg-[#404040]' : 'bg-gray-200'}`} />

          {/* 分类管理选项 */}
          {onAddCategory && (
            <button
              onClick={() => {
                onAddCategory()
                onClose()
              }}
              className={`
                w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors
                ${isDark 
                  ? 'text-[#e0e0e0] hover:bg-[#404040]' 
                  : 'text-gray-700 hover:bg-gray-50'
                }
              `}
            >
              <FolderPlus className="w-4 h-4" />
              新建分类
            </button>
          )}

          {onAddSubCategory && categoryId && (
            <button
              onClick={() => {
                onAddSubCategory()
                onClose()
              }}
              className={`
                w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors
                ${isDark 
                  ? 'text-[#e0e0e0] hover:bg-[#404040]' 
                  : 'text-gray-700 hover:bg-gray-50'
                }
              `}
            >
              <Folder className="w-4 h-4" />
              添加子分类
            </button>
          )}

          {onEditCategory && categoryName && (
            <button
              onClick={() => {
                onEditCategory()
                onClose()
              }}
              className={`
                w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors
                ${isDark 
                  ? 'text-[#e0e0e0] hover:bg-[#404040]' 
                  : 'text-gray-700 hover:bg-gray-50'
                }
              `}
            >
              <Edit className="w-4 h-4" />
              编辑分类
            </button>
          )}

          {onDeleteCategory && categoryName && categoryName !== '全部' && categoryName !== '未分类' && (
            <button
              onClick={() => {
                onDeleteCategory()
                onClose()
              }}
              className={`
                w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors
                ${isDark 
                  ? 'text-red-400 hover:bg-[#404040]' 
                  : 'text-red-600 hover:bg-gray-50'
                }
              `}
            >
              <Trash2 className="w-4 h-4" />
              删除分类
            </button>
          )}
        </>
      )}

      {type === 'note' && (
        <>
          {onEditNote && noteTitle && (
            <button
              onClick={() => {
                onEditNote()
                onClose()
              }}
              className={`
                w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors
                ${isDark 
                  ? 'text-[#e0e0e0] hover:bg-[#404040]' 
                  : 'text-gray-700 hover:bg-gray-50'
                }
              `}
            >
              <Edit className="w-4 h-4" />
              重命名
            </button>
          )}

          {onMoveNote && noteTitle && (
            <button
              onClick={() => {
                onMoveNote()
                onClose()
              }}
              className={`
                w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors
                ${isDark 
                  ? 'text-[#e0e0e0] hover:bg-[#404040]' 
                  : 'text-gray-700 hover:bg-gray-50'
                }
              `}
            >
              <Move className="w-4 h-4" />
              移动到...
            </button>
          )}

          {onDeleteNote && noteTitle && (
            <button
              onClick={() => {
                onDeleteNote()
                onClose()
              }}
              className={`
                w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors
                ${isDark 
                  ? 'text-red-400 hover:bg-[#404040]' 
                  : 'text-red-600 hover:bg-gray-50'
                }
              `}
            >
              <Trash2 className="w-4 h-4" />
              删除笔记
            </button>
          )}
        </>
      )}
    </div>
  )
}
