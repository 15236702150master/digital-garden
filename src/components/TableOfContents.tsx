import React, { useState, useEffect } from 'react'
import { ChevronRight, ChevronDown } from 'lucide-react'

interface TocItem {
  id: string
  text: string
  level: number
  element?: HTMLElement
}

interface TableOfContentsProps {
  content: string
  isDark?: boolean
  className?: string
}

export default function TableOfContents({ content, isDark = false, className = '' }: TableOfContentsProps) {
  const [tocItems, setTocItems] = useState<TocItem[]>([])
  const [activeId, setActiveId] = useState<string>('')
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

  // 解析内容中的标题
  useEffect(() => {
    if (!content) {
      setTocItems([])
      return
    }

    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = content

    // 查找所有标题（包括自定义标题）
    const allHeadings = tempDiv.querySelectorAll('h1, h2, h3, h4, h5, h6, .custom-heading-1, .custom-heading-2, .custom-heading-3')
    const items: TocItem[] = []

    allHeadings.forEach((heading, index) => {
      let level = 1
      
      // 确定标题级别
      if (heading.tagName && heading.tagName.match(/^H[1-6]$/)) {
        // HTML标题标签
        level = parseInt(heading.tagName.charAt(1))
      } else if (heading.classList.contains('custom-heading-1')) {
        level = 1
      } else if (heading.classList.contains('custom-heading-2')) {
        level = 2
      } else if (heading.classList.contains('custom-heading-3')) {
        level = 3
      }
      
      const text = heading.textContent || ''
      const id = heading.id || `heading-${Date.now()}-${index}`
      
      // 为标题添加ID（如果没有的话）
      if (!heading.id) {
        (heading as HTMLElement).id = id
      }

      items.push({
        id: heading.id || id,
        text: text.trim(),
        level,
        element: heading as HTMLElement
      })
    })

    setTocItems(items)

    // 默认展开所有项目
    const allIds = new Set(items.map(item => item.id))
    setExpandedItems(allIds)
  }, [content])

  // 监听滚动，高亮当前可见的标题
  useEffect(() => {
    const handleScroll = () => {
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6')
      let currentActiveId = ''

      headings.forEach((heading) => {
        const rect = heading.getBoundingClientRect()
        if (rect.top <= 100 && rect.bottom >= 0) {
          currentActiveId = heading.id
        }
      })

      setActiveId(currentActiveId)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // 点击标题跳转
  const handleItemClick = (id: string) => {
    // 首先尝试通过ID查找
    let element = document.getElementById(id)
    
    // 如果没找到，尝试通过文本内容查找
    if (!element) {
      const tocItem = tocItems.find(item => item.id === id)
      if (tocItem) {
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6, .custom-heading-1, .custom-heading-2, .custom-heading-3')
        element = Array.from(headings).find(h => h.textContent?.trim() === tocItem.text.trim()) as HTMLElement
        
        // 如果找到了元素但没有ID，给它添加ID
        if (element && !element.id) {
          element.id = id
        }
      }
    }
    
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  // 切换展开/折叠
  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedItems(newExpanded)
  }

  // 获取子项目
  const getChildren = (parentLevel: number, startIndex: number): TocItem[] => {
    const children: TocItem[] = []
    for (let i = startIndex + 1; i < tocItems.length; i++) {
      const item = tocItems[i]
      if (item.level <= parentLevel) break
      if (item.level === parentLevel + 1) {
        children.push(item)
      }
    }
    return children
  }

  // 渲染TOC项目
  const renderTocItem = (item: TocItem, index: number, depth: number = 0) => {
    const children = getChildren(item.level, index)
    const hasChildren = children.length > 0
    const isExpanded = expandedItems.has(item.id)
    const isActive = activeId === item.id

    return (
      <div key={item.id} className="toc-item">
        <div
          className={`flex items-center gap-2 py-1 px-2 cursor-pointer transition-colors ${
            isActive
              ? isDark
                ? 'text-blue-400'
                : 'text-blue-600'
              : isDark
                ? 'text-[rgb(40,75,99)] hover:text-[rgb(132,201,184)]'
                : 'text-[rgb(40,75,99)] hover:text-[rgb(132,201,184)]'
          }`}
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
          onClick={() => handleItemClick(item.id)}
        >
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                toggleExpanded(item.id)
              }}
              className="p-0.5 rounded"
            >
              {isExpanded ? (
                <ChevronDown className="w-3 h-3" />
              ) : (
                <ChevronRight className="w-3 h-3" />
              )}
            </button>
          )}
          {!hasChildren && <div className="w-4" />}
          <span
            className={`text-sm truncate ${
              item.level === 1 ? 'font-semibold' : 
              item.level === 2 ? 'font-medium' : 'font-normal'
            }`}
            title={item.text}
          >
            {item.text}
          </span>
        </div>
        
        {hasChildren && isExpanded && (
          <div className="toc-children">
            {children.map((child) => {
              const childIndex = tocItems.findIndex(t => t.id === child.id)
              return renderTocItem(child, childIndex, depth + 1)
            })}
          </div>
        )}
      </div>
    )
  }

  // 如果没有标题，显示空状态
  if (tocItems.length === 0) {
    return (
      <div className={`${className} p-4`}>
        <h3 className={`text-sm font-semibold mb-3 ${
          isDark ? 'text-[#e0e0e0]' : 'text-gray-900'
        }`}>
          目录
        </h3>
        <div className={`text-sm ${
          isDark ? 'text-[#666]' : 'text-gray-500'
        }`}>
          目录为空
        </div>
      </div>
    )
  }

  return (
    <div className={`${className} p-4`}>
      <h3 className={`text-sm font-semibold mb-3 ${
        isDark ? 'text-[#e0e0e0]' : 'text-gray-900'
      }`}>
        目录
      </h3>
      <div className="space-y-1 max-h-96 overflow-y-auto">
        {tocItems
          .filter(item => item.level === 1)
          .map((item) => {
            const index = tocItems.findIndex(t => t.id === item.id)
            return renderTocItem(item, index)
          })}
      </div>
    </div>
  )
}
