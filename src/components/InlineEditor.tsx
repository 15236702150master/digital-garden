import React, { useRef, useEffect, useState, useCallback } from 'react'
import { Bold, Italic, Underline, Highlighter, Code, Link, Quote, Indent, MessageSquare, Type, FileText } from 'lucide-react'
import { Note } from '../types'

interface InlineEditorProps {
  content: string
  onChange: (content: string) => void
  isEditing: boolean
  isDark?: boolean
  className?: string
  notes?: Note[]
  onNoteSelect?: (note: Note) => void
}

interface FormatButton {
  id: string
  icon: React.ComponentType<{ className?: string }>
  label: string
  format: string
}

export default function InlineEditor({ content, onChange, isEditing, isDark = false, className = '', notes = [], onNoteSelect }: InlineEditorProps) {
  const contentRef = useRef<HTMLDivElement>(null)
  const toolbarRef = useRef<HTMLDivElement>(null)
  const [showToolbar, setShowToolbar] = useState(false)
  const [toolbarPosition, setToolbarPosition] = useState({ top: 0, left: 0 })
  const [showNoteInput, setShowNoteInput] = useState(false)
  const [noteText, setNoteText] = useState('')
  const [selectedRange, setSelectedRange] = useState<Range | null>(null)
  const [showNoteSearch, setShowNoteSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([])
  const [selectedNoteRange, setSelectedNoteRange] = useState<Range | null>(null)

  // 格式化按钮配置
  const formatButtons: FormatButton[] = [
    { id: 'bold', icon: Bold, label: '加粗', format: 'bold' },
    { id: 'italic', icon: Italic, label: '斜体', format: 'italic' },
    { id: 'underline', icon: Underline, label: '下划线', format: 'underline' },
    { id: 'highlight', icon: Highlighter, label: '高亮', format: 'highlight' },
    { id: 'code', icon: Code, label: '代码', format: 'code' },
    { id: 'link', icon: Link, label: '链接', format: 'link' },
    { id: 'quote', icon: Quote, label: '引用', format: 'quote' },
    { id: 'note', icon: MessageSquare, label: '备注', format: 'note' },
    { id: 'notelink', icon: FileText, label: '笔记链接', format: 'notelink' },
    { id: 'indent', icon: Indent, label: '缩进', format: 'indent' },
    { id: 'normal', icon: Type, label: '正文', format: 'normal' },
  ]

  // 处理选择变化
  const handleSelection = useCallback(() => {
    if (!isEditing || !contentRef.current) return

    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) {
      setShowToolbar(false)
      return
    }

    const range = selection.getRangeAt(0)
    const selectedText = range.toString().trim()

    if (!selectedText) {
      setShowToolbar(false)
      return
    }

    // 计算工具栏位置
    const rect = range.getBoundingClientRect()
    const containerRect = contentRef.current.getBoundingClientRect()
    
    // 计算理想的居中位置
    const idealLeft = rect.left - containerRect.left + (rect.width / 2)
    
    // 估算工具栏宽度（按钮数量 * 平均宽度）
    const estimatedToolbarWidth = formatButtons.length * 40 + 24 // 40px per button + padding
    
    // 确保工具栏不会超出容器边界，左右各保留20px边距
    const minLeft = 20 + estimatedToolbarWidth / 2 // 左边距 + 工具栏一半宽度
    const maxLeft = containerRect.width - 20 - estimatedToolbarWidth / 2 // 容器宽度 - 右边距 - 工具栏一半宽度
    
    const safeLeft = Math.max(minLeft, Math.min(idealLeft, maxLeft))
    
    setToolbarPosition({
      top: rect.top - containerRect.top - 50,
      left: safeLeft
    })
    
    setShowToolbar(true)
  }, [isEditing, formatButtons.length])

  // 应用格式
  const applyFormat = (format: string) => {
    if (!contentRef.current) return

    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return

    const range = selection.getRangeAt(0)
    const selectedText = range.toString()

    if (!selectedText) return

    let formattedContent = ''
    switch (format) {
      case 'bold':
        formattedContent = `<strong style="color: #000 !important; font-weight: bold;">${selectedText}</strong>`
        break
      case 'italic':
        formattedContent = `<em>${selectedText}</em>`
        break
      case 'underline':
        formattedContent = `<u>${selectedText}</u>`
        break
      case 'highlight':
        formattedContent = `<mark style="background-color: yellow; padding: 2px 4px;">${selectedText}</mark>`
        break
      case 'code':
        formattedContent = `<code style="background-color: #f1f5f9; padding: 2px 4px; border-radius: 4px; font-family: monospace;">${selectedText}</code>`
        break
      case 'link':
        const url = prompt('请输入链接地址:')
        if (url) {
          formattedContent = `<a href="${url}" style="color: #3b82f6; text-decoration: underline;">${selectedText}</a>`
        } else {
          return
        }
        break
      case 'quote':
        formattedContent = `<blockquote style="border-left: 4px solid #ccc; padding-left: 16px; margin: 16px 0; font-style: italic; color: #666;">${selectedText}</blockquote>`
        break
      case 'note':
        // 保存选区，显示备注输入框
        setSelectedRange(range.cloneRange())
        setShowNoteInput(true)
        setShowToolbar(false)
        return
      case 'notelink':
        // 保存选区，显示笔记搜索框
        setSelectedNoteRange(range.cloneRange())
        setShowNoteSearch(true)
        setShowToolbar(false)
        return
      case 'indent':
        formattedContent = `<div style="margin-left: 24px;">${selectedText}</div>`
        break
      case 'normal':
        formattedContent = `<span class="normal-text">${selectedText}</span>`
        break
      default:
        return
    }

    // 替换选中的文本
    range.deleteContents()
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = formattedContent
    const fragment = document.createDocumentFragment()
    let lastNode: Node | null = null
    while (tempDiv.firstChild) {
      lastNode = tempDiv.firstChild
      fragment.appendChild(lastNode)
    }
    range.insertNode(fragment)

    // 将光标移到插入内容的末尾，并添加空格隔断格式
    if (lastNode) {
      // 添加一个空格来隔断格式继承
      const spaceNode = document.createTextNode(' ')
      lastNode.parentNode?.insertBefore(spaceNode, lastNode.nextSibling)
      
      const newRange = document.createRange()
      newRange.setStartAfter(spaceNode)
      newRange.collapse(true)
      selection.removeAllRanges()
      selection.addRange(newRange)
    }
    
    // 触发内容变化
    handleContentChange()
  }

  // 处理备注确认
  const handleNoteConfirm = () => {
    if (!selectedRange || !noteText.trim()) return

    const selectedText = selectedRange.toString()
    const noteId = `note-${Date.now()}`
    
    // 创建带备注的HTML
    const formattedContent = `<span class="text-with-note" data-note-id="${noteId}" data-note-text="${noteText.trim()}" style="text-decoration: underline; text-decoration-style: wavy; text-decoration-color: #3b82f6; cursor: help;">${selectedText}</span>`
    
    // 替换选中的文本
    selectedRange.deleteContents()
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = formattedContent
    const fragment = document.createDocumentFragment()
    let lastNode: Node | null = null
    while (tempDiv.firstChild) {
      lastNode = tempDiv.firstChild
      fragment.appendChild(lastNode)
    }
    selectedRange.insertNode(fragment)

    // 将光标移到插入内容的末尾，并添加空格隔断格式
    if (lastNode) {
      const selection = window.getSelection()
      if (selection) {
        // 添加一个空格来隔断格式继承
        const spaceNode = document.createTextNode(' ')
        lastNode.parentNode?.insertBefore(spaceNode, lastNode.nextSibling)
        
        const newRange = document.createRange()
        newRange.setStartAfter(spaceNode)
        newRange.collapse(true)
        selection.removeAllRanges()
        selection.addRange(newRange)
      }
    }

    // 重置状态
    setShowNoteInput(false)
    setNoteText('')
    setSelectedRange(null)
    
    // 触发内容变化
    handleContentChange()
  }

  // 取消备注
  const handleNoteCancel = () => {
    setShowNoteInput(false)
    setNoteText('')
    setSelectedRange(null)
  }

  // 处理笔记搜索
  const handleNoteSearch = (query: string) => {
    setSearchQuery(query)
    if (!query.trim()) {
      setFilteredNotes([])
      return
    }
    
    const filtered = notes.filter(note => 
      note.title.toLowerCase().includes(query.toLowerCase())
    )
    setFilteredNotes(filtered)
  }

  // 选择笔记链接
  const handleNoteSelect = (selectedNote: Note) => {
    if (!selectedNoteRange) return

    const selectedText = selectedNoteRange.toString()
    const noteId = `notelink-${Date.now()}`
    
    // 创建笔记链接HTML
    const formattedContent = `<span class="note-link" data-note-id="${selectedNote.id}" data-note-title="${selectedNote.title}" style="color: #3b82f6; text-decoration: underline; cursor: pointer;">${selectedText}</span>`
    
    // 替换选中的文本
    selectedNoteRange.deleteContents()
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = formattedContent
    const fragment = document.createDocumentFragment()
    let lastNode: Node | null = null
    while (tempDiv.firstChild) {
      lastNode = tempDiv.firstChild
      fragment.appendChild(lastNode)
    }
    selectedNoteRange.insertNode(fragment)

    // 将光标移到插入内容的末尾，并添加空格隔断格式
    if (lastNode) {
      const selection = window.getSelection()
      if (selection) {
        // 添加一个空格来隔断格式继承
        const spaceNode = document.createTextNode(' ')
        lastNode.parentNode?.insertBefore(spaceNode, lastNode.nextSibling)
        
        const newRange = document.createRange()
        newRange.setStartAfter(spaceNode)
        newRange.collapse(true)
        selection.removeAllRanges()
        selection.addRange(newRange)
      }
    }

    // 重置状态
    setShowNoteSearch(false)
    setSearchQuery('')
    setFilteredNotes([])
    setSelectedNoteRange(null)
    
    // 触发内容变化
    handleContentChange()
  }

  // 取消笔记搜索
  const handleNoteSearchCancel = () => {
    setShowNoteSearch(false)
    setSearchQuery('')
    setFilteredNotes([])
    setSelectedNoteRange(null)
  }

  // 处理内容变化
  const handleContentChange = () => {
    if (!isEditing || !contentRef.current) return
    
    const newContent = contentRef.current.innerHTML
    onChange(newContent)
  }

  // 处理编辑模式切换和内容更新
  useEffect(() => {
    if (contentRef.current) {
      if (isEditing) {
        const currentContent = contentRef.current.innerHTML
        if (currentContent === '' || currentContent === '<p style="color: rgb(153, 153, 153);">这篇笔记还没有内容</p>') {
          contentRef.current.innerHTML = content || '<p style="color: #999;">开始写作...</p>'
        } else if (content && currentContent !== content) {
          // 如果内容发生变化，更新编辑器内容
          contentRef.current.innerHTML = content
        }
        // 聚焦到编辑区域
        setTimeout(() => {
          contentRef.current?.focus()
        }, 10)
      } else {
        // 非编辑模式下，确保内容正确显示
        if (content && contentRef.current.innerHTML !== content) {
          contentRef.current.innerHTML = content || '<p>这篇笔记还没有内容</p>'
        }
      }
    }
  }, [isEditing, content])

  // 监听选择变化
  useEffect(() => {
    const handleMouseUp = () => {
      setTimeout(handleSelection, 10)
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(event.target as Node)) {
        setShowToolbar(false)
      }
    }

    // 处理悬浮显示（备注和笔记链接）
    const handleMouseOver = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      
      // 处理备注悬浮
      if (target.classList.contains('text-with-note')) {
        const noteText = target.getAttribute('data-note-text')
        if (noteText) {
          // 创建悬浮提示
          const tooltip = document.createElement('div')
          tooltip.className = 'note-tooltip'
          tooltip.textContent = noteText
          tooltip.style.cssText = `
            position: absolute;
            background: ${isDark ? '#2a2a2a' : '#333'};
            color: ${isDark ? '#e0e0e0' : '#fff'};
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 12px;
            max-width: 200px;
            word-wrap: break-word;
            z-index: 1000;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            pointer-events: none;
          `
          
          const rect = target.getBoundingClientRect()
          tooltip.style.left = `${rect.left + window.scrollX}px`
          tooltip.style.top = `${rect.top + window.scrollY - 35}px`
          
          document.body.appendChild(tooltip)
          target.setAttribute('data-tooltip-id', tooltip.className)
        }
      }
      
      // 处理笔记链接悬浮
      if (target.classList.contains('note-link')) {
        const noteTitle = target.getAttribute('data-note-title')
        if (noteTitle) {
          // 创建悬浮提示
          const tooltip = document.createElement('div')
          tooltip.className = 'note-link-tooltip'
          tooltip.textContent = `📄 ${noteTitle}`
          tooltip.style.cssText = `
            position: absolute;
            background: ${isDark ? '#2a2a2a' : '#333'};
            color: ${isDark ? '#e0e0e0' : '#fff'};
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 12px;
            max-width: 200px;
            word-wrap: break-word;
            z-index: 1000;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            pointer-events: none;
          `
          
          const rect = target.getBoundingClientRect()
          tooltip.style.left = `${rect.left + window.scrollX}px`
          tooltip.style.top = `${rect.top + window.scrollY - 35}px`
          
          document.body.appendChild(tooltip)
          target.setAttribute('data-tooltip-id', tooltip.className)
        }
      }
    }

    const handleMouseOut = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (target.classList.contains('text-with-note') || target.classList.contains('note-link')) {
        const tooltips = document.querySelectorAll('.note-tooltip, .note-link-tooltip')
        tooltips.forEach(tooltip => tooltip.remove())
      }
    }

    // 处理笔记链接点击
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (target.classList.contains('note-link')) {
        event.preventDefault()
        const noteId = target.getAttribute('data-note-id')
        
        if (noteId && onNoteSelect) {
          // 在当前应用中查找并打开笔记
          const targetNote = notes.find(note => note.id === noteId)
          if (targetNote) {
            onNoteSelect(targetNote)
          }
        }
      }
    }

    if (isEditing) {
      document.addEventListener('mouseup', handleMouseUp)
      document.addEventListener('click', handleClickOutside)
    }
    
    // 备注悬浮功能在编辑和非编辑模式都需要
    document.addEventListener('mouseover', handleMouseOver)
    document.addEventListener('mouseout', handleMouseOut)
    document.addEventListener('click', handleClick)

    return () => {
      document.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('click', handleClickOutside)
      document.removeEventListener('mouseover', handleMouseOver)
      document.removeEventListener('mouseout', handleMouseOut)
      document.removeEventListener('click', handleClick)
    }
  }, [isEditing, handleSelection, isDark, notes, onNoteSelect])

  return (
    <div className={`relative ${className}`}>
      {/* 内容区域 */}
      {!isEditing ? (
        <div
          ref={contentRef}
          className={`
            note-content w-full min-h-[200px] p-4 rounded-lg transition-colors resize-none bg-transparent
            ${isDark ? 'text-[#e0e0e0]' : ''}
            ${className}
          `}
          style={{
            wordBreak: 'break-word',
            whiteSpace: 'pre-wrap'
          }}
          dangerouslySetInnerHTML={{
            __html: content || '<p>这篇笔记还没有内容</p>'
          }}
        />
      ) : (
        <div
          ref={contentRef}
          contentEditable={true}
          suppressContentEditableWarning={true}
          onInput={handleContentChange}
          className={`
            note-content w-full min-h-[200px] p-4 rounded-lg transition-colors resize-none bg-transparent placeholder-gray-500
            ${isDark ? 'text-[#e0e0e0] placeholder-[#a0a0a0]' : ''}
            focus:outline-none
            ${className}
          `}
          style={{
            wordBreak: 'break-word',
            whiteSpace: 'pre-wrap'
          }}
        />
      )}

      {/* 格式化工具栏 */}
      {showToolbar && isEditing && (
        <div
          ref={toolbarRef}
          className={`absolute z-50 flex items-center gap-1 px-3 py-2 rounded-lg shadow-lg border ${
            isDark
              ? 'bg-[#2a2a2a] border-[#404040]'
              : 'bg-white border-gray-200'
          }`}
          style={{
            top: toolbarPosition.top,
            left: toolbarPosition.left,
            transform: 'translateX(-50%)'
          }}
        >
          {formatButtons.map((button) => (
            <div key={button.id} className="relative group">
              <button
                onClick={() => applyFormat(button.format)}
                className={`p-2 rounded hover:bg-opacity-80 transition-colors ${
                  isDark
                    ? 'text-[#e0e0e0] hover:bg-[#404040]'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <button.icon className="w-4 h-4" />
              </button>
              
              {/* 工具提示 */}
              <div className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none ${
                isDark
                  ? 'bg-[#404040] text-[#e0e0e0]'
                  : 'bg-gray-800 text-white'
              }`}>
                {button.label}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 备注输入框 */}
      {showNoteInput && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`p-6 rounded-lg shadow-xl max-w-md w-full mx-4 ${
            isDark ? 'bg-[#2a2a2a] border border-[#404040]' : 'bg-white border border-gray-200'
          }`}>
            <h3 className={`text-lg font-semibold mb-4 ${
              isDark ? 'text-[#e0e0e0]' : 'text-gray-800'
            }`}>
              添加备注
            </h3>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="请输入备注内容..."
              className={`w-full h-24 p-3 border rounded-lg resize-none ${
                isDark 
                  ? 'bg-[#1a1a1a] border-[#404040] text-[#e0e0e0] placeholder-[#a0a0a0]' 
                  : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500'
              } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
              autoFocus
            />
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={handleNoteCancel}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  isDark
                    ? 'bg-[#404040] text-[#e0e0e0] hover:bg-[#4a4a4a]'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                取消
              </button>
              <button
                onClick={handleNoteConfirm}
                disabled={!noteText.trim()}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  noteText.trim()
                    ? isDark
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                    : isDark
                      ? 'bg-[#404040] text-[#666] cursor-not-allowed'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                确认
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 笔记搜索框 */}
      {showNoteSearch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`p-6 rounded-lg shadow-xl max-w-md w-full mx-4 ${
            isDark ? 'bg-[#2a2a2a] border border-[#404040]' : 'bg-white border border-gray-200'
          }`}>
            <h3 className={`text-lg font-semibold mb-4 ${
              isDark ? 'text-[#e0e0e0]' : 'text-gray-800'
            }`}>
              选择笔记链接
            </h3>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleNoteSearch(e.target.value)}
              placeholder="搜索笔记标题..."
              className={`w-full p-3 border rounded-lg ${
                isDark 
                  ? 'bg-[#1a1a1a] border-[#404040] text-[#e0e0e0] placeholder-[#a0a0a0]' 
                  : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500'
              } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
              autoFocus
            />
            
            {/* 搜索结果 */}
            {filteredNotes.length > 0 && (
              <div className={`mt-4 max-h-60 overflow-y-auto border rounded-lg ${
                isDark ? 'border-[#404040]' : 'border-gray-200'
              }`}>
                {filteredNotes.map((note) => (
                  <div
                    key={note.id}
                    onClick={() => handleNoteSelect(note)}
                    className={`p-3 cursor-pointer transition-colors ${
                      isDark
                        ? 'hover:bg-[#3a3a3a] border-b border-[#404040]'
                        : 'hover:bg-gray-50 border-b border-gray-100'
                    } last:border-b-0`}
                  >
                    <div className={`font-medium ${
                      isDark ? 'text-[#e0e0e0]' : 'text-gray-800'
                    }`}>
                      {note.title}
                    </div>
                    <div className={`text-sm mt-1 ${
                      isDark ? 'text-[#a0a0a0]' : 'text-gray-500'
                    }`}>
                      {note.category}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {searchQuery && filteredNotes.length === 0 && (
              <div className={`mt-4 text-center py-4 ${
                isDark ? 'text-[#a0a0a0]' : 'text-gray-500'
              }`}>
                未找到匹配的笔记
              </div>
            )}
            
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={handleNoteSearchCancel}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  isDark
                    ? 'bg-[#404040] text-[#e0e0e0] hover:bg-[#4a4a4a]'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
