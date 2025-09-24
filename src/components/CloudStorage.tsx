'use client'

import React from 'react'
import { Cloud, X } from 'lucide-react'

interface CloudStorageProps {
  onClose: () => void
  isDark?: boolean
}

export default function CloudStorage({ onClose, isDark = false }: CloudStorageProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} rounded-lg w-full max-w-md`}>
        {/* 头部 */}
        <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center gap-2">
            <Cloud className="w-5 h-5" />
            <h2 className="text-lg font-semibold">云端存储</h2>
          </div>
          <button
            onClick={onClose}
            className={`p-1 rounded hover:${isDark ? 'bg-gray-700' : 'bg-gray-100'} transition-colors`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 内容区域 */}
        <div className="p-4">
          <div className="text-center py-8">
            <Cloud className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium mb-2">云端存储功能</h3>
            <p className="text-gray-500 mb-4">
              云端存储功能正在开发中，敬请期待！
            </p>
            <p className="text-sm text-gray-400">
              目前数据存储在浏览器本地，请定期使用备份功能导出数据。
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
