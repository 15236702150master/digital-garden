import React, { useState, useEffect } from 'react'
import { X, Plus, Hash } from 'lucide-react'
import { Tag } from '@/types'
import { TagsStorage } from '@/lib/storage'

interface TagSelectorProps {
  selectedTags: string[]
  onTagsChange: (tags: string[]) => void
  onClose: () => void
  isDark?: boolean
}

export default function TagSelector({ selectedTags, onTagsChange, onClose, isDark = false }: TagSelectorProps) {
  const [availableTags, setAvailableTags] = useState<Tag[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isCreatingTag, setIsCreatingTag] = useState(false)
  const [newTagName, setNewTagName] = useState('')

  useEffect(() => {
    loadTags()
  }, [])

  const loadTags = () => {
    const tags = TagsStorage.getTags()
    setAvailableTags(tags.sort((a, b) => b.count - a.count))
  }

  const filteredTags = availableTags.filter(tag =>
    tag.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleTagToggle = (tagName: string) => {
    if (selectedTags.includes(tagName)) {
      onTagsChange(selectedTags.filter(t => t !== tagName))
    } else {
      onTagsChange([...selectedTags, tagName])
    }
  }

  const handleCreateTag = () => {
    if (!newTagName.trim()) return

    const newTag = TagsStorage.addTag(newTagName.trim())
    setNewTagName('')
    setIsCreatingTag(false)
    loadTags()
    
    // 自动选中新创建的标签
    if (!selectedTags.includes(newTag.name)) {
      onTagsChange([...selectedTags, newTag.name])
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newTagName.trim()) {
      handleCreateTag()
    } else if (e.key === 'Escape') {
      if (isCreatingTag) {
        setIsCreatingTag(false)
        setNewTagName('')
      } else {
        onClose()
      }
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[70vh] overflow-hidden">
        {/* 标题栏 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Hash className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-semibold text-gray-900">选择标签</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 搜索框 */}
        <div className="p-4 border-b border-gray-200">
          <input
            type="text"
            placeholder="搜索标签..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* 已选标签 */}
        {selectedTags.length > 0 && (
          <div className="p-4 bg-blue-50 border-b border-gray-200">
            <div className="text-sm font-medium text-gray-700 mb-2">已选标签：</div>
            <div className="flex flex-wrap gap-2">
              {selectedTags.map((tagName) => {
                const tag = availableTags.find(t => t.name === tagName)
                return (
                  <span
                    key={tagName}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-white"
                    style={{ backgroundColor: tag?.color || '#3b82f6' }}
                  >
                    {tagName}
                    <button
                      onClick={() => handleTagToggle(tagName)}
                      className="hover:bg-black hover:bg-opacity-20 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )
              })}
            </div>
          </div>
        )}

        {/* 标签列表 */}
        <div className="p-4 overflow-y-auto max-h-[40vh]">
          {/* 创建新标签 */}
          {isCreatingTag ? (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <input
                type="text"
                placeholder="输入新标签名称..."
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleCreateTag}
                  disabled={!newTagName.trim()}
                  className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 disabled:opacity-50"
                >
                  创建
                </button>
                <button
                  onClick={() => {
                    setIsCreatingTag(false)
                    setNewTagName('')
                  }}
                  className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400"
                >
                  取消
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsCreatingTag(true)}
              className="w-full mb-4 p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors flex items-center justify-center gap-2 text-gray-600 hover:text-blue-600"
            >
              <Plus className="w-4 h-4" />
              创建新标签
            </button>
          )}

          {/* 可用标签列表 */}
          <div className="space-y-2">
            {filteredTags.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Hash className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p>{searchQuery ? '未找到匹配的标签' : '还没有创建任何标签'}</p>
              </div>
            ) : (
              filteredTags.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => handleTagToggle(tag.name)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                    selectedTags.includes(tag.name)
                      ? 'bg-blue-100 border-2 border-blue-300'
                      : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: tag.color }}
                    />
                    <span className="font-medium text-gray-900">{tag.name}</span>
                  </div>
                  <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
                    {tag.count}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="p-4 border-t border-gray-200 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
          >
            取消
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            确定
          </button>
        </div>
      </div>
    </div>
  )
}
