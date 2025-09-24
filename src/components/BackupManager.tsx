'use client'
import React, { useState } from 'react'
import { Download, Upload, AlertCircle, CheckCircle } from 'lucide-react'
import { NotesStorage, CategoriesStorage, TagsStorage } from '../lib/storage'
import { Note, Category, Tag } from '../types'

interface BackupManagerProps {
  isDark: boolean
  onDataRestore: () => void
}

interface BackupData {
  notes: Note[]
  categories: Category[]
  tags: Tag[]
  timestamp: string
  version: string
  appName: string
}

export default function BackupManager({ isDark, onDataRestore }: BackupManagerProps) {
  const [notification, setNotification] = useState<{
    message: string
    type: 'success' | 'error' | 'warning'
  } | null>(null)

  // 显示通知
  const showNotification = (message: string, type: 'success' | 'error' | 'warning') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 3000)
  }

  // 手动导出数据
  const exportData = () => {
    try {
      const backupData: BackupData = {
        notes: NotesStorage.getNotes(),
        categories: CategoriesStorage.getCategories(),
        tags: TagsStorage.getTags(),
        timestamp: new Date().toISOString(),
        version: '1.0',
        appName: 'Digital Garden'
      }

      const dataStr = JSON.stringify(backupData, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      
      const link = document.createElement('a')
      link.href = URL.createObjectURL(dataBlob)
      link.download = `digital-garden-backup-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      showNotification('数据已成功导出到本地文件！', 'success')
    } catch (error) {
      console.error('导出失败:', error)
      showNotification('数据导出失败，请重试', 'error')
    }
  }

  // 手动导入数据
  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const backupData: BackupData = JSON.parse(e.target?.result as string)
        
        // 验证数据格式
        if (!backupData.notes || !backupData.timestamp || backupData.appName !== 'Digital Garden') {
          throw new Error('无效的备份文件格式')
        }

        // 确认恢复操作
        if (!confirm(`确定要从备份文件恢复数据吗？\n\n备份时间: ${new Date(backupData.timestamp).toLocaleString()}\n版本: ${backupData.version}\n\n当前数据将被完全替换，此操作不可撤销！`)) {
          return
        }

        // 恢复数据
        if (backupData.notes) {
          NotesStorage.saveNotes(backupData.notes)
        }
        if (backupData.categories) {
          CategoriesStorage.saveCategories(backupData.categories)
        }
        if (backupData.tags) {
          TagsStorage.saveTags(backupData.tags)
        }

        // 通知父组件数据已恢复
        onDataRestore()
        
        showNotification(`数据已成功恢复！共恢复 ${backupData.notes.length} 篇笔记`, 'success')
        
        // 清空文件输入
        event.target.value = ''
        
      } catch (error) {
        console.error('导入失败:', error)
        showNotification('数据导入失败：' + (error as Error).message, 'error')
        event.target.value = ''
      }
    }
    
    reader.readAsText(file)
  }

  return (
    <div className="flex items-center gap-2">
      {/* 导出按钮 */}
      <button
        onClick={exportData}
        className={`
          p-2 rounded-lg transition-colors
          ${isDark 
            ? 'bg-[#404040] hover:bg-[#505050] text-[#e0e0e0]' 
            : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
          }
        `}
        title="导出数据备份"
      >
        <Download className="w-4 h-4" />
      </button>

      {/* 导入按钮 */}
      <label
        className={`
          p-2 rounded-lg transition-colors cursor-pointer
          ${isDark 
            ? 'bg-[#404040] hover:bg-[#505050] text-[#e0e0e0]' 
            : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
          }
        `}
        title="导入数据备份"
      >
        <Upload className="w-4 h-4" />
        <input
          type="file"
          accept=".json"
          onChange={importData}
          className="hidden"
        />
      </label>

      {/* 通知显示 */}
      {notification && (
        <div className={`
          fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center gap-2 max-w-sm
          ${notification.type === 'success' 
            ? (isDark ? 'bg-green-900 text-green-100' : 'bg-green-100 text-green-800')
            : notification.type === 'error'
            ? (isDark ? 'bg-red-900 text-red-100' : 'bg-red-100 text-red-800')
            : (isDark ? 'bg-yellow-900 text-yellow-100' : 'bg-yellow-100 text-yellow-800')
          }
        `}>
          {notification.type === 'success' && <CheckCircle className="w-5 h-5" />}
          {notification.type === 'error' && <AlertCircle className="w-5 h-5" />}
          {notification.type === 'warning' && <AlertCircle className="w-5 h-5" />}
          <span className="text-sm">{notification.message}</span>
        </div>
      )}
    </div>
  )
}
