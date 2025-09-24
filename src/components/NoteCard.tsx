'use client'
import React from 'react'
import { Note } from '../types'
import { Calendar, Tag, Eye, EyeOff, Edit, Trash2 } from 'lucide-react'
import TagDisplay from './TagDisplay'

interface NoteCardProps {
  note: Note
  isDark: boolean
  onEdit?: (note: Note) => void
  onDelete?: (id: string) => void
  onClick?: (note: Note) => void
}

export default function NoteCard({ note, isDark, onEdit, onDelete, onClick }: NoteCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const truncateContent = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content
    return content.substring(0, maxLength) + '...'
  }

  return (
    <div
      className={`
        group relative p-6 rounded-lg transition-all duration-200 cursor-pointer
        hover:shadow-lg hover:scale-[1.02]
        ${isDark 
          ? 'bg-[#2a2a2a]' 
          : 'bg-white'
        }
      `}
      onClick={() => onClick?.(note)}
    >
      {/* 标题 */}
      <h3 className={`
        text-lg font-semibold mb-2 line-clamp-2
        ${isDark ? 'text-[#e0e0e0]' : 'text-[#2d3748]'}
      `}>
        {note.title}
      </h3>

      {/* 内容预览 */}
      <p className={`
        text-sm mb-4 line-clamp-3
        ${isDark ? 'text-[#a0a0a0]' : 'text-[#718096]'}
      `}>
        {truncateContent(note.content)}
      </p>

      {/* 标签 */}
      {note.tags.length > 0 && (
        <div className="mt-3">
          <TagDisplay 
            tags={note.tags}
            isDark={isDark}
            size="sm"
          />
        </div>
      )}

      {/* 底部信息 */}
      <div className="flex items-center justify-between">
        <div className={`
          flex items-center text-xs
          ${isDark ? 'text-[#a0a0a0]' : 'text-gray-500'}
        `}>
          <Calendar className="w-3 h-3 mr-1" />
          {formatDate(note.updatedAt)}
        </div>

        {/* 分类标识 */}
        <div className={`
          px-2 py-1 rounded-full text-xs font-medium
          ${isDark 
            ? 'bg-[#404040] text-[#e0e0e0]' 
            : 'bg-blue-50 text-blue-700'
          }
        `}>
          {note.category}
        </div>
      </div>

      {/* 悬浮操作按钮 */}
      <div className={`
        absolute top-4 right-4 opacity-0 group-hover:opacity-100 
        transition-opacity duration-200 flex gap-2
      `}>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onEdit?.(note)
          }}
          className={`
            p-2 rounded-full transition-colors
            ${isDark 
              ? 'bg-[#404040] hover:bg-[#505050] text-[#e0e0e0]' 
              : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
            }
          `}
        >
          <Edit className="w-4 h-4" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete?.(note.id)
          }}
          className={`
            p-2 rounded-full transition-colors
            ${isDark 
              ? 'bg-red-900/20 hover:bg-red-900/30 text-red-400' 
              : 'bg-red-50 hover:bg-red-100 text-red-600'
            }
          `}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* 发布状态指示器 */}
      {!note.isPublished && (
        <div className={`
          absolute top-2 left-2 w-2 h-2 rounded-full
          ${isDark ? 'bg-yellow-400' : 'bg-yellow-500'}
        `} title="草稿" />
      )}
    </div>
  )
}
