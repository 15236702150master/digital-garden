import React, { useState, useRef, useEffect } from 'react'
import { Bold, Italic, Underline, Highlighter, Link, Code, Type } from 'lucide-react'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  isDark?: boolean
  className?: string
}

interface FormatButton {
  icon: React.ReactNode
  label: string
  action: () => void
  isActive?: boolean
}

export default function RichTextEditor({ 
  value, 
  onChange, 
  placeholder = "开始写作...", 
  isDark = false,
  className = ""
}: RichTextEditorProps) {
  const [showToolbar, setShowToolbar] = useState(false)
  const [toolbarPosition, setToolbarPosition] = useState({ x: 0, y: 0 })
  const [selectedText, setSelectedText] = useState('')
  const editorRef = useRef<HTMLDivElement>(null)
  const toolbarRef = useRef<HTMLDivElement>(null)

  // 处理文本选择
  const handleSelection = () => {
    setTimeout(() => {
      const textarea = editorRef.current?.querySelector('textarea')
      if (!textarea) return

      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const text = textarea.value.substring(start, end).trim()

      if (text.length > 0 && start !== end) {
        setSelectedText(text)
        
        // 计算工具栏位置 - 使用固定位置避免复杂计算
        const rect = textarea.getBoundingClientRect()
        
        setToolbarPosition({
          x: 200, // 固定水平位置
          y: -50  // 固定在编辑器上方
        })
        
        setShowToolbar(true)
      } else {
        setShowToolbar(false)
      }
    }, 10)
  }

  // 应用格式
  const applyFormat = (format: string) => {
    if (!selectedText) return

    let formattedText = ''
    
    switch (format) {
      case 'bold':
        formattedText = `**${selectedText}**`
        break
      case 'italic':
        formattedText = `*${selectedText}*`
        break
      case 'underline':
        formattedText = `<u>${selectedText}</u>`
        break
      case 'highlight':
        formattedText = `<mark>${selectedText}</mark>`
        break
      case 'code':
        formattedText = `\`${selectedText}\``
        break
      case 'link':
        const url = prompt('请输入链接地址:')
        if (url) {
          formattedText = `[${selectedText}](${url})`
        } else {
          return
        }
        break
      default:
        return
    }

    // 获取textarea元素
    const textarea = editorRef.current?.querySelector('textarea')
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    
    // 替换选中的文本
    const beforeText = value.substring(0, start)
    const afterText = value.substring(end)
    const newValue = beforeText + formattedText + afterText
    
    onChange(newValue)
    setShowToolbar(false)
    
    // 重新聚焦textarea并设置光标位置
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + formattedText.length, start + formattedText.length)
    }, 10)
  }

  // 格式化按钮配置
  const formatButtons: FormatButton[] = [
    {
      icon: <Bold className="w-4 h-4" />,
      label: '加粗',
      action: () => applyFormat('bold')
    },
    {
      icon: <Italic className="w-4 h-4" />,
      label: '斜体',
      action: () => applyFormat('italic')
    },
    {
      icon: <Underline className="w-4 h-4" />,
      label: '下划线',
      action: () => applyFormat('underline')
    },
    {
      icon: <Highlighter className="w-4 h-4" />,
      label: '高亮',
      action: () => applyFormat('highlight')
    },
    {
      icon: <Code className="w-4 h-4" />,
      label: '代码',
      action: () => applyFormat('code')
    },
    {
      icon: <Link className="w-4 h-4" />,
      label: '链接',
      action: () => applyFormat('link')
    }
  ]

  // 监听选择变化
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(event.target as Node)) {
        setShowToolbar(false)
      }
    }

    document.addEventListener('click', handleClickOutside)

    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [])

  return (
    <div className={`relative ${className}`}>
      {/* 编辑器 */}
      <div
        ref={editorRef}
        className={`relative min-h-96 p-4 rounded-lg border resize-none ${
          isDark
            ? 'bg-[#2a2a2a] border-[#404040] text-[#e0e0e0]'
            : 'bg-white border-gray-300 text-gray-700'
        } focus-within:ring-2 focus-within:ring-blue-500/20`}
      >
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full h-full min-h-96 bg-transparent border-none outline-none resize-none ${
            isDark ? 'text-[#e0e0e0] placeholder-[#a0a0a0]' : 'text-gray-700 placeholder-gray-400'
          }`}
          onMouseUp={handleSelection}
          onKeyUp={handleSelection}
        />

      </div>

      {/* 格式化工具栏 - 固定在编辑器上方 */}
      {showToolbar && (
        <div
          ref={toolbarRef}
          className={`absolute top-2 left-2 z-50 flex items-center gap-1 px-3 py-2 rounded-lg shadow-lg border ${
            isDark
              ? 'bg-[#2a2a2a] border-[#404040]'
              : 'bg-white border-gray-200'
          }`}
        >
          <span className={`text-xs mr-2 ${isDark ? 'text-[#a0a0a0]' : 'text-gray-500'}`}>
            已选择: "{selectedText.substring(0, 20)}{selectedText.length > 20 ? '...' : ''}"
          </span>
          {formatButtons.map((button, index) => (
            <div key={index} className="relative group">
              <button
                onClick={button.action}
                className={`p-2 rounded transition-colors ${
                  isDark
                    ? 'hover:bg-[#404040] text-[#e0e0e0]'
                    : 'hover:bg-gray-100 text-gray-600'
                }`}
                title={button.label}
              >
                {button.icon}
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

      {/* 预览区域（可选） */}
      {value && (
        <div className="mt-4">
          <h4 className={`text-sm font-medium mb-2 ${
            isDark ? 'text-[#a0a0a0]' : 'text-gray-500'
          }`}>
            预览效果：
          </h4>
          <div 
            className={`p-4 rounded-lg border ${
              isDark
                ? 'bg-[#1a1a1a] border-[#404040] text-[#e0e0e0]'
                : 'bg-gray-50 border-gray-200 text-gray-700'
            }`}
            dangerouslySetInnerHTML={{
              __html: value
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.*?)\*/g, '<em>$1</em>')
                .replace(/`(.*?)`/g, '<code class="px-1 py-0.5 bg-gray-200 rounded text-sm">$1</code>')
                .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-blue-500 hover:underline">$1</a>')
                .replace(/\n/g, '<br>')
            }}
          />
        </div>
      )}
    </div>
  )
}
