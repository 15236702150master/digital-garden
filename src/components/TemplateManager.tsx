'use client'

import { X } from 'lucide-react'
import { Category } from '../types'

interface NoteTemplate {
  id: string
  name: string
  content: string
  createdAt: string
  updatedAt: string
}

interface TemplateManagerProps {
  isOpen: boolean
  onClose: () => void
  onCreateNote: (title: string, content: string, categoryName: string, template?: NoteTemplate) => void
  onCreateTemplate: () => void
  onEditTemplate: (template: NoteTemplate) => void
  categories: Category[]
  isDark: boolean
}

export default function TemplateManager({ 
  isOpen, 
  onClose, 
  onCreateNote, 
  onCreateTemplate, 
  onEditTemplate, 
  categories, 
  isDark 
}: TemplateManagerProps) {
  if (!isOpen) return null

  const templates: NoteTemplate[] = [
    {
      id: '1',
      name: '日记模板',
      content: '# 日记 - {{date}}\n\n## 今日总结\n\n## 明日计划\n\n## 心情记录\n\n',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '2',
      name: '学习笔记',
      content: '# {{title}}\n\n## 核心概念\n\n## 重点内容\n\n## 个人思考\n\n## 相关链接\n\n',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">模板管理</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-4 space-y-4 overflow-y-auto">
          <button
            onClick={onCreateTemplate}
            className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
          >
            + 创建新模板
          </button>
          
          <div className="space-y-2">
            {templates.map(template => (
              <div key={template.id} className="border rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">{template.name}</h3>
                  <button
                    onClick={() => onEditTemplate(template)}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    编辑
                  </button>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  {template.content.substring(0, 100)}...
                </p>
                <button
                  onClick={() => {
                    const categoryName = categories[0]?.name || '未分类'
                    onCreateNote(template.name, template.content, categoryName, template)
                    onClose()
                  }}
                  className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                >
                  使用模板
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
