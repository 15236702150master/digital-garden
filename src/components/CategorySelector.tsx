import React, { useState } from 'react'
import { X, Folder, ChevronRight, ChevronDown } from 'lucide-react'
import { Category } from '@/types'

interface CategorySelectorProps {
  categories: Category[]
  currentCategory?: string
  onSelect: (categoryName: string) => void
  onClose: () => void
  isDark?: boolean
}

export default function CategorySelector({
  categories,
  currentCategory,
  onSelect,
  onClose,
  isDark = false
}: CategorySelectorProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['全部', '未分类']))

  // 构建分类树
  const buildCategoryTree = (parentId?: string): Category[] => {
    return categories.filter(cat => cat.parentId === parentId)
  }

  const toggleCategory = (categoryName: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(categoryName)) {
      newExpanded.delete(categoryName)
    } else {
      newExpanded.add(categoryName)
    }
    setExpandedCategories(newExpanded)
  }

  // 递归渲染分类项
  const renderCategoryItem = (category: Category, level: number = 0) => {
    const isExpanded = expandedCategories.has(category.name)
    const children = buildCategoryTree(category.id)
    const hasChildren = children.length > 0
    const isCurrentCategory = currentCategory === category.name
    
    return (
      <div key={category.id} style={{ marginLeft: `${level * 16}px` }}>
        <div className="flex items-center">
          {/* 展开/折叠按钮 */}
          {hasChildren && (
            <button
              onClick={() => toggleCategory(category.name)}
              className="w-4 h-4 flex items-center justify-center mr-1"
            >
              {isExpanded ? (
                <ChevronDown className="w-3 h-3 text-gray-500" />
              ) : (
                <ChevronRight className="w-3 h-3 text-gray-500" />
              )}
            </button>
          )}
          
          {/* 分类选择按钮 */}
          <button
            onClick={() => onSelect(category.name)}
            disabled={isCurrentCategory}
            className={`flex-1 flex items-center gap-2 px-2 py-1.5 text-left text-sm rounded transition-colors ${
              isCurrentCategory
                ? isDark
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : isDark
                  ? 'text-[#e0e0e0] hover:bg-[#404040]'
                  : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Folder className="w-4 h-4" />
            <span className="truncate">{category.name}</span>
            {isCurrentCategory && (
              <span className="text-xs text-gray-400 ml-auto">(当前)</span>
            )}
          </button>
        </div>
        
        {/* 递归渲染子分类 */}
        {hasChildren && isExpanded && (
          <div className="mt-1">
            {children.map(child => renderCategoryItem(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`
        w-96 max-h-96 rounded-lg shadow-xl
        ${isDark 
          ? 'bg-[#2a2a2a] border border-[#404040]' 
          : 'bg-white border border-gray-200'
        }
      `}>
        {/* 标题栏 */}
        <div className={`
          flex items-center justify-between p-4 border-b
          ${isDark ? 'border-[#404040]' : 'border-gray-200'}
        `}>
          <h3 className={`text-lg font-semibold ${
            isDark ? 'text-[#e0e0e0]' : 'text-gray-900'
          }`}>
            选择目标分类
          </h3>
          <button
            onClick={onClose}
            className={`p-1 rounded hover:bg-opacity-20 ${
              isDark ? 'hover:bg-white' : 'hover:bg-gray-500'
            }`}
          >
            <X className={`w-5 h-5 ${
              isDark ? 'text-[#e0e0e0]' : 'text-gray-500'
            }`} />
          </button>
        </div>
        
        {/* 分类列表 */}
        <div className="p-4 max-h-80 overflow-y-auto">
          <div className="space-y-1">
            {/* 默认分类 */}
            <button
              onClick={() => onSelect('未分类')}
              disabled={currentCategory === '未分类'}
              className={`w-full flex items-center gap-2 px-2 py-1.5 text-left text-sm rounded transition-colors ${
                currentCategory === '未分类'
                  ? isDark
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : isDark
                    ? 'text-[#e0e0e0] hover:bg-[#404040]'
                    : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Folder className="w-4 h-4" />
              <span>未分类</span>
              {currentCategory === '未分类' && (
                <span className="text-xs text-gray-400 ml-auto">(当前)</span>
              )}
            </button>
            
            {/* 用户创建的分类 */}
            {buildCategoryTree().map(category => renderCategoryItem(category))}
          </div>
        </div>
        
        {/* 底部提示 */}
        <div className={`
          px-4 py-3 text-xs border-t
          ${isDark 
            ? 'border-[#404040] text-[#a0a0a0]' 
            : 'border-gray-200 text-gray-500'
          }
        `}>
          选择一个分类来移动笔记
        </div>
      </div>
    </div>
  )
}
