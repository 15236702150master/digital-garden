'use client'
import React from 'react'
import { Note } from '../types'
import { Edit, Trash2, Calendar, Tag, Eye, EyeOff } from 'lucide-react'
import TagDisplay from './TagDisplay'
import BreadcrumbNav from './BreadcrumbNav'

interface ArticleViewProps {
  note: Note
  isDark: boolean
  onEdit: (note: Note) => void
  onDelete: (id: string) => void
}

export default function ArticleView({ note, isDark, onEdit, onDelete }: ArticleViewProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const formatContent = (content: string) => {
    return content.split('\n').map((paragraph, index) => (
      <p key={index} className="mb-4 leading-relaxed">
        {paragraph}
      </p>
    ))
  }

  return (
    <article className={`
      max-w-none prose prose-lg
      ${isDark ? 'prose-invert' : ''}
    `}>
      {/* 文章头部 */}
      <header className="mb-8 pb-6">
        <div className="flex items-start justify-between mb-4">
          <h1 className={`
            text-3xl font-bold leading-tight mb-0
            ${isDark ? 'text-[#e0e0e0]' : 'text-[#2d3748]'}
          `}>
            {note.title}
          </h1>
          
          <div className="flex items-center gap-2 ml-4">
            <button
              onClick={() => onEdit(note)}
              className={`
                p-2 rounded-lg transition-colors
                ${isDark 
                  ? 'bg-[#404040] hover:bg-[#505050] text-[#e0e0e0]' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                }
              `}
              title="编辑"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(note.id)}
              className={`
                p-2 rounded-lg transition-colors
                ${isDark 
                  ? 'bg-red-900/20 hover:bg-red-900/30 text-red-400' 
                  : 'bg-red-50 hover:bg-red-100 text-red-600'
                }
              `}
              title="删除"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 元信息 */}
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <div className={`
            flex items-center gap-1
            ${isDark ? 'text-[#a0a0a0]' : 'text-gray-600'}
          `}>
            <Calendar className="w-4 h-4" />
            <span>{formatDate(note.updatedAt)}</span>
          </div>

          <div className={`
            flex items-center gap-1
            ${isDark ? 'text-[#a0a0a0]' : 'text-gray-600'}
          `}>
            {note.isPublished ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            <span>{note.isPublished ? '已发布' : '草稿'}</span>
          </div>

          <div className={`
            px-3 py-1 rounded-full text-xs font-medium
            ${isDark 
              ? 'bg-[#404040] text-[#e0e0e0]' 
              : 'bg-blue-50 text-blue-700'
            }
          `}>
            {note.category}
          </div>
        </div>

        {/* 面包屑导航 */}
        <div className="mt-4">
          <BreadcrumbNav 
            items={[
              { label: 'Home' },
              { label: 'C Knowledge' },
              { label: '认知卡片' },
              { label: note.tags.join('、') }
            ]}
            isDark={isDark}
          />
        </div>

        {/* 标签 */}
        {note.tags.length > 0 && (
          <div className="mt-6">
            <TagDisplay 
              tags={note.tags}
              isDark={isDark}
              size="md"
            />
          </div>
        )}
      </header>

      {/* 文章内容 */}
      <div className={`
        text-base leading-relaxed
        ${isDark ? 'text-[#e0e0e0]' : 'text-[#2d3748]'}
      `}>
        {formatContent(note.content)}
      </div>

      {/* 文章底部信息 */}
      <footer className={`
        mt-12 pt-6 text-sm
        ${isDark ? 'text-[#a0a0a0]' : 'text-gray-600'}
      `}>
        <div className="flex items-center justify-between">
          <div>
            创建于 {formatDate(note.createdAt)}
            {note.createdAt !== note.updatedAt && (
              <span className="ml-4">
                更新于 {formatDate(note.updatedAt)}
              </span>
            )}
          </div>
        </div>
      </footer>
    </article>
  )
}
