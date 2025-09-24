'use client'

import { useEffect } from 'react'

interface HighlightJS {
  highlightAll: () => void
  highlightElement: (element: Element) => void
  initLineNumbersOnLoad?: () => void
  lineNumbersBlock?: (element: Element) => void
}

declare global {
  interface Window {
    hljs: HighlightJS
  }
}

export default function CodeHighlighter() {
  useEffect(() => {
    // 动态加载 highlight.js 样式
    const loadCSS = () => {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = 'https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.9.0/build/styles/github.min.css'
      document.head.appendChild(link)
    }

    // 动态加载 highlight.js 脚本
    const loadHighlightJS = () => {
      return new Promise<void>((resolve) => {
        if (window.hljs) {
          resolve()
          return
        }

        const script = document.createElement('script')
        script.src = 'https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.9.0/build/highlight.min.js'
        script.onload = () => resolve()
        document.head.appendChild(script)
      })
    }

    // 动态加载行号插件
    const loadLineNumbers = () => {
      return new Promise<void>((resolve) => {
        const script = document.createElement('script')
        script.src = 'https://cdn.jsdelivr.net/npm/highlightjs-line-numbers.js@2.9.0/dist/highlightjs-line-numbers.min.js'
        script.onload = () => resolve()
        document.head.appendChild(script)
      })
    }

    // 初始化代码高亮
    const initHighlight = async () => {
      loadCSS()
      await loadHighlightJS()
      await loadLineNumbers()
      
      if (window.hljs) {
        window.hljs.highlightAll()
        if (window.hljs.initLineNumbersOnLoad) {
          window.hljs.initLineNumbersOnLoad()
        }
      }
    }

    initHighlight()

    // 监听DOM变化，为新添加的代码块应用高亮
    const observer = new MutationObserver(() => {
      if (window.hljs) {
        // 为新添加的代码块应用高亮
        document.querySelectorAll('pre code:not(.hljs)').forEach((block) => {
          window.hljs.highlightElement(block)
        })
        
        // 为新添加的代码块应用行号
        if (window.hljs.lineNumbersBlock) {
          document.querySelectorAll('pre code.hljs:not(.hljs-ln-code-container)').forEach((block) => {
            window.hljs.lineNumbersBlock?.(block)
          })
        }
      }
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true
    })

    return () => {
      observer.disconnect()
    }
  }, [])

  return null
}
