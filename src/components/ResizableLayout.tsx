import React, { useState, useRef, useEffect } from 'react'

interface ResizableLayoutProps {
  leftPanel: React.ReactNode
  centerPanel: React.ReactNode
  rightPanel: React.ReactNode
  isDark?: boolean
}

export default function ResizableLayout({ 
  leftPanel, 
  centerPanel, 
  rightPanel, 
  isDark = false 
}: ResizableLayoutProps) {
  const [leftWidth, setLeftWidth] = useState(280)
  const [rightWidth, setRightWidth] = useState(280)
  
  // 在客户端加载保存的宽度
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLeftWidth = localStorage.getItem('leftPanelWidth')
      const savedRightWidth = localStorage.getItem('rightPanelWidth')
      
      if (savedLeftWidth) {
        setLeftWidth(parseInt(savedLeftWidth))
      }
      if (savedRightWidth) {
        setRightWidth(parseInt(savedRightWidth))
      }
    }
  }, [])
  
  const [isLeftResizing, setIsLeftResizing] = useState(false)
  const [isRightResizing, setIsRightResizing] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // 保存宽度到localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('leftPanelWidth', leftWidth.toString())
    }
  }, [leftWidth])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('rightPanelWidth', rightWidth.toString())
    }
  }, [rightWidth])

  // 处理左侧面板拖拽
  const handleLeftMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsLeftResizing(true)
  }

  // 处理右侧面板拖拽
  const handleRightMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsRightResizing(true)
  }

  // 处理鼠标移动
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return

      const containerRect = containerRef.current.getBoundingClientRect()
      
      if (isLeftResizing) {
        const newWidth = Math.max(200, Math.min(500, e.clientX - containerRect.left))
        setLeftWidth(newWidth)
      }
      
      if (isRightResizing) {
        const newWidth = Math.max(200, Math.min(500, containerRect.right - e.clientX))
        setRightWidth(newWidth)
      }
    }

    const handleMouseUp = () => {
      setIsLeftResizing(false)
      setIsRightResizing(false)
    }

    if (isLeftResizing || isRightResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [isLeftResizing, isRightResizing])

  return (
    <div ref={containerRef} className="flex h-full w-full">
      {/* 左侧面板 */}
      <div 
        className={`flex-shrink-0 border-r ${
          isDark ? 'border-[#404040]' : 'border-gray-200'
        }`}
        style={{ width: `${leftWidth}px` }}
      >
        <div 
          className="h-full overflow-auto custom-scrollbar"
        >
          {leftPanel}
        </div>
      </div>

      {/* 左侧拖拽条 */}
      <div
        className={`w-1 cursor-col-resize flex-shrink-0 transition-all duration-200 ${
          isLeftResizing 
            ? (isDark ? 'bg-[#505050]' : 'bg-gray-300') 
            : 'bg-transparent hover:bg-gray-300/50'
        }`}
        onMouseDown={handleLeftMouseDown}
      />

      {/* 中央内容区域 */}
      <div className="flex-1 min-w-0">
        <div className="h-full overflow-auto custom-scrollbar">
          {centerPanel}
        </div>
      </div>

      {/* 右侧拖拽条 */}
      <div
        className={`w-1 cursor-col-resize flex-shrink-0 transition-all duration-200 ${
          isRightResizing 
            ? (isDark ? 'bg-[#505050]' : 'bg-gray-300') 
            : 'bg-transparent hover:bg-gray-300/50'
        }`}
        onMouseDown={handleRightMouseDown}
      />

      {/* 右侧面板 */}
      <div 
        className={`flex-shrink-0 border-l ${
          isDark ? 'border-[#404040]' : 'border-gray-200'
        }`}
        style={{ width: `${rightWidth}px` }}
      >
        <div 
          className="h-full overflow-auto custom-scrollbar"
        >
          {rightPanel}
        </div>
      </div>
    </div>
  )
}
