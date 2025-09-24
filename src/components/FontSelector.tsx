'use client'

import { Type } from 'lucide-react'

interface FontSelectorProps {
  isDark: boolean
  onFontChange: (font: string) => void
  currentFont: string
}

export default function FontSelector({ isDark, onFontChange, currentFont }: FontSelectorProps) {
  const fonts = [
    { name: 'Inter', value: 'Inter, system-ui, -apple-system, sans-serif' },
    { name: 'System UI', value: 'system-ui, -apple-system, sans-serif' },
    { name: 'Georgia', value: 'Georgia, serif' },
    { name: 'Times', value: 'Times, serif' },
  ]

  return (
    <div className="relative group">
      <button className="p-2 rounded-lg transition-colors bg-white text-[#52575b] hover:bg-gray-50">
        <Type className="w-5 h-5" />
      </button>
      <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
        <div className="p-2">
          <div className="text-sm font-medium mb-2">选择字体</div>
          {fonts.map(font => (
            <button
              key={font.value}
              onClick={() => onFontChange(font.value)}
              className={`block w-full text-left px-2 py-1 text-sm rounded hover:bg-gray-100 ${
                currentFont === font.value ? 'bg-blue-50 text-blue-600' : ''
              }`}
              style={{ fontFamily: font.value }}
            >
              {font.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
