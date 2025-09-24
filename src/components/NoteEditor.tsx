'use client'

import { useState, useEffect } from 'react'
import { Note, Category } from '@/types'
import { X, Save, Plus, Tag as TagIcon, Hash } from 'lucide-react'
import TagSelector from './TagSelector'

interface NoteEditorProps {
  note?: Note
  categories: Category[]
  isDark: boolean
  onSave: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void
  onCancel: () => void
}

export default function NoteEditor({ note, categories, isDark, onSave, onCancel }: NoteEditorProps) {
  const [title, setTitle] = useState(note?.title || '')
  const [content, setContent] = useState(note?.content || '')
  const [category, setCategory] = useState(note?.category || categories[0]?.name || '')
  const [tags, setTags] = useState<string[]>(note?.tags || [])
  const [newTag, setNewTag] = useState('')
  const [isPublished, setIsPublished] = useState(note?.isPublished ?? true)
  const [showTagSelector, setShowTagSelector] = useState(false)

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()])
      setNewTag('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const handleSave = () => {
    if (!title.trim()) return

    onSave({
      title: title.trim(),
      content: content.trim(),
      category,
      tags,
      isPublished
    })
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSave()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className={`
        w-full max-w-4xl max-h-[90vh] rounded-lg shadow-xl overflow-hidden
        ${isDark ? 'bg-[#2a2a2a]' : 'bg-white'}
      `}>
        {/* 头部 */}
        <div className={`
          flex items-center justify-between p-6
        `}>
          <h2 className={`
            text-xl font-semibold
            ${isDark ? 'text-[#e0e0e0]' : 'text-[#2d3748]'}
          `}>
            {note ? '编辑笔记' : '新建笔记'}
          </h2>
          <button
            onClick={onCancel}
            className={`
              p-2 rounded-full transition-colors
              ${isDark 
                ? 'hover:bg-[#404040] text-[#a0a0a0]' 
                : 'hover:bg-gray-100 text-gray-500'
              }
            `}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 内容区域 */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* 标题输入 */}
          <div className="mb-6">
            <label className={`
              block text-sm font-medium mb-2
              ${isDark ? 'text-[#e0e0e0]' : 'text-[#2d3748]'}
            `}>
              标题 *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="输入笔记标题..."
              className={`
                w-full px-4 py-3 rounded-lg transition-colors
                ${isDark 
                  ? 'bg-[#1a1a1a] text-[#e0e0e0] placeholder-[#a0a0a0]' 
                  : 'bg-white text-[#2d3748] placeholder-gray-400'
                }
                focus:outline-none focus:ring-2 focus:ring-blue-500/20
              `}
            />
          </div>

          {/* 分类和发布状态 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className={`
                block text-sm font-medium mb-2
                ${isDark ? 'text-[#e0e0e0]' : 'text-[#2d3748]'}
              `}>
                分类
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={`
                  w-full px-4 py-3 rounded-lg transition-colors
                  ${isDark 
                    ? 'bg-[#1a1a1a] text-[#e0e0e0]' 
                    : 'bg-white text-[#2d3748]'
                  }
                  focus:outline-none focus:ring-2 focus:ring-blue-500/20
                `}
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={`
                block text-sm font-medium mb-2
                ${isDark ? 'text-[#e0e0e0]' : 'text-[#2d3748]'}
              `}>
                状态
              </label>
              <div className="flex items-center space-x-4 pt-3">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    checked={isPublished}
                    onChange={() => setIsPublished(true)}
                    className="mr-2"
                  />
                  <span className={isDark ? 'text-[#e0e0e0]' : 'text-[#2d3748]'}>
                    已发布
                  </span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    checked={!isPublished}
                    onChange={() => setIsPublished(false)}
                    className="mr-2"
                  />
                  <span className={isDark ? 'text-[#e0e0e0]' : 'text-[#2d3748]'}>
                    草稿
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* 标签管理 */}
          <div className="mb-6">
            <label className={`
              block text-sm font-medium mb-2
              ${isDark ? 'text-[#e0e0e0]' : 'text-[#2d3748]'}
            `}>
              标签
            </label>
            
            {/* 现有标签 */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {tags.map((tag, index) => (
                  <span
                    key={index}
                    className={`
                      inline-flex items-center px-3 py-1 rounded-full text-sm
                      ${isDark 
                        ? 'bg-[#404040] text-[#e0e0e0]' 
                        : 'bg-blue-50 text-blue-700'
                      }
                    `}
                  >
                    <TagIcon className="w-3 h-3 mr-1" />
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-2 text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* 添加新标签 */}
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                  placeholder="添加标签..."
                  className={`
                    flex-1 px-4 py-2 rounded-lg transition-colors
                    ${isDark 
                      ? 'bg-[#1a1a1a] text-[#e0e0e0] placeholder-[#a0a0a0]' 
                      : 'bg-white text-[#2d3748] placeholder-gray-400'
                    }
                    focus:outline-none focus:ring-2 focus:ring-blue-500/20
                  `}
                />
                <button
                  onClick={handleAddTag}
                  disabled={!newTag.trim()}
                  className={`
                    px-4 py-2 rounded-lg transition-colors disabled:opacity-50
                    ${isDark 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                    }
                  `}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              
              {/* 从标签云选择按钮 */}
              <button
                onClick={() => setShowTagSelector(true)}
                className={`
                  w-full px-4 py-2 rounded-lg transition-colors border-2 border-dashed
                  ${isDark 
                    ? 'border-gray-600 text-gray-400 hover:border-blue-500 hover:text-blue-400' 
                    : 'border-gray-300 text-gray-600 hover:border-blue-400 hover:text-blue-600'
                  }
                  flex items-center justify-center gap-2
                `}
              >
                <Hash className="w-4 h-4" />
                从标签云选择
              </button>
            </div>
          </div>

          {/* 内容输入 */}
          <div className="mb-6">
            <label className={`
              block text-sm font-medium mb-2
              ${isDark ? 'text-[#e0e0e0]' : 'text-[#2d3748]'}
            `}>
              内容
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="开始写下你的想法..."
              rows={12}
              className={`
                w-full px-4 py-3 rounded-lg transition-colors resize-none
                ${isDark 
                  ? 'bg-[#1a1a1a] text-[#e0e0e0] placeholder-[#a0a0a0]' 
                  : 'bg-white text-[#2d3748] placeholder-gray-400'
                }
                focus:outline-none focus:ring-2 focus:ring-blue-500/20
              `}
            />
          </div>
        </div>

        {/* 底部操作 */}
        <div className={`
          flex items-center justify-between p-6
        `}>
          <div className={`
            text-sm
            ${isDark ? 'text-[#a0a0a0]' : 'text-gray-500'}
          `}>
            按 Ctrl+Enter 快速保存
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className={`
                px-6 py-2 rounded-lg transition-colors
                ${isDark 
                  ? 'text-[#e0e0e0] hover:bg-[#404040]' 
                  : 'text-gray-700 hover:bg-gray-50'
                }
              `}
            >
              取消
            </button>
            <button
              onClick={handleSave}
              disabled={!title.trim()}
              className={`
                px-6 py-2 rounded-lg transition-colors disabled:opacity-50
                flex items-center gap-2
                ${isDark 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
                }
              `}
            >
              <Save className="w-4 h-4" />
              保存
            </button>
          </div>
        </div>
      </div>

      {/* 标签选择器 */}
      {showTagSelector && (
        <TagSelector
          selectedTags={tags}
          onTagsChange={setTags}
          onClose={() => setShowTagSelector(false)}
          isDark={isDark}
        />
      )}
    </div>
  )
}
