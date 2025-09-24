'use client'
import React, { useState, useEffect, useRef } from 'react'
import { Palette, X, Check, Trash2 } from 'lucide-react'

interface ColorPickerProps {
  isDark: boolean
  onColorChange: (color: string) => void
  currentColor: string
}

interface SavedColor {
  id: string
  color: string
  name: string
  timestamp: string
}

export default function ColorPicker({ isDark, onColorChange, currentColor }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedColor, setSelectedColor] = useState(currentColor)
  const [rgbValues, setRgbValues] = useState({ r: 248, g: 249, b: 250 })
  const [savedColors, setSavedColors] = useState<SavedColor[]>([])
  const [colorName, setColorName] = useState('')
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const brightnessRef = useRef<HTMLCanvasElement>(null)

  // 加载保存的颜色
  useEffect(() => {
    const saved = localStorage.getItem('digital-garden-saved-colors')
    if (saved) {
      setSavedColors(JSON.parse(saved))
    }
  }, [])

  // 初始化颜色面板
  useEffect(() => {
    if (isOpen) {
      drawColorPalette()
      drawBrightnessSlider()
    }
  }, [isOpen])

  // 绘制颜色面板
  const drawColorPalette = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height

    // 创建彩虹渐变
    const gradient = ctx.createLinearGradient(0, 0, width, 0)
    gradient.addColorStop(0, '#ff0000')
    gradient.addColorStop(1/6, '#ffff00')
    gradient.addColorStop(2/6, '#00ff00')
    gradient.addColorStop(3/6, '#00ffff')
    gradient.addColorStop(4/6, '#0000ff')
    gradient.addColorStop(5/6, '#ff00ff')
    gradient.addColorStop(1, '#ff0000')

    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)

    // 添加饱和度渐变
    const satGradient = ctx.createLinearGradient(0, 0, 0, height)
    satGradient.addColorStop(0, 'rgba(255, 255, 255, 1)')
    satGradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
    ctx.fillStyle = satGradient
    ctx.fillRect(0, 0, width, height)
  }

  // 绘制亮度滑块
  const drawBrightnessSlider = () => {
    const canvas = brightnessRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height

    const gradient = ctx.createLinearGradient(0, 0, 0, height)
    gradient.addColorStop(0, '#000000')
    gradient.addColorStop(1, '#ffffff')

    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)
  }

  // 处理颜色面板点击
  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const imageData = ctx.getImageData(x, y, 1, 1)
    const [r, g, b] = imageData.data

    setRgbValues({ r, g, b })
    setSelectedColor(`rgb(${r}, ${g}, ${b})`)
  }

  // 处理RGB输入变化
  const handleRgbChange = (component: 'r' | 'g' | 'b', value: string) => {
    const numValue = Math.max(0, Math.min(255, parseInt(value) || 0))
    const newRgb = { ...rgbValues, [component]: numValue }
    setRgbValues(newRgb)
    setSelectedColor(`rgb(${newRgb.r}, ${newRgb.g}, ${newRgb.b})`)
  }

  // 处理十六进制颜色输入
  const handleHexChange = (hex: string) => {
    if (hex.startsWith('#')) {
      hex = hex.slice(1)
    }
    
    if (hex.length === 6) {
      const r = parseInt(hex.slice(0, 2), 16)
      const g = parseInt(hex.slice(2, 4), 16)
      const b = parseInt(hex.slice(4, 6), 16)
      
      if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
        setRgbValues({ r, g, b })
        setSelectedColor(`rgb(${r}, ${g}, ${b})`)
      }
    }
  }

  // 保存颜色
  const saveColor = () => {
    if (!colorName.trim()) return

    const newColor: SavedColor = {
      id: Date.now().toString(),
      color: selectedColor,
      name: colorName.trim(),
      timestamp: new Date().toISOString()
    }

    const updated = [...savedColors, newColor]
    setSavedColors(updated)
    localStorage.setItem('digital-garden-saved-colors', JSON.stringify(updated))
    setColorName('')
  }

  // 删除保存的颜色
  const deleteSavedColor = (id: string) => {
    const updated = savedColors.filter(color => color.id !== id)
    setSavedColors(updated)
    localStorage.setItem('digital-garden-saved-colors', JSON.stringify(updated))
  }

  // 应用颜色
  const applyColor = () => {
    onColorChange(selectedColor)
    setIsOpen(false)
  }

  // RGB转十六进制
  const rgbToHex = (r: number, g: number, b: number) => {
    return '#' + [r, g, b].map(x => {
      const hex = x.toString(16)
      return hex.length === 1 ? '0' + hex : hex
    }).join('')
  }

  return (
    <div className="relative">
      {/* 触发按钮 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          p-2 rounded-lg transition-colors
          ${isDark 
            ? 'bg-[#2a2a2a] text-[#e0e0e0] hover:bg-[#404040]' 
            : 'bg-white text-[#52575b] hover:bg-gray-50'
          }
        `}
        title="自定义背景颜色"
      >
        <Palette className="w-5 h-5" />
      </button>

      {/* 颜色选择器面板 */}
      {isOpen && (
        <div className={`
          absolute top-12 right-0 z-50 p-6 rounded-lg shadow-xl border w-96
          ${isDark 
            ? 'bg-[#2a2a2a] border-[#404040] text-[#e0e0e0]' 
            : 'bg-white border-gray-200 text-gray-800'
          }
        `}>
          {/* 标题栏 */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">自定义背景颜色</h3>
            <button
              onClick={() => setIsOpen(false)}
              className={`p-1 rounded hover:${isDark ? 'bg-[#404040]' : 'bg-gray-100'}`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* 颜色面板 */}
          <div className="mb-4">
            <canvas
              ref={canvasRef}
              width={320}
              height={180}
              className="w-full h-32 border rounded cursor-crosshair"
              onClick={handleCanvasClick}
            />
          </div>

          {/* 亮度滑块 */}
          <div className="mb-4">
            <canvas
              ref={brightnessRef}
              width={320}
              height={20}
              className="w-full h-5 border rounded cursor-pointer"
            />
          </div>

          {/* 颜色预览 */}
          <div className="flex items-center gap-4 mb-4">
            <div
              className="w-16 h-8 border rounded"
              style={{ backgroundColor: selectedColor }}
            />
            <div className="text-sm">
              {selectedColor}
            </div>
          </div>

          {/* RGB输入 */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div>
              <label className="block text-xs mb-1">红色 (R)</label>
              <input
                type="number"
                min="0"
                max="255"
                value={rgbValues.r}
                onChange={(e) => handleRgbChange('r', e.target.value)}
                className={`w-full px-2 py-1 text-sm border rounded ${
                  isDark 
                    ? 'bg-[#404040] border-[#555] text-[#e0e0e0]' 
                    : 'bg-white border-gray-300'
                }`}
              />
            </div>
            <div>
              <label className="block text-xs mb-1">绿色 (G)</label>
              <input
                type="number"
                min="0"
                max="255"
                value={rgbValues.g}
                onChange={(e) => handleRgbChange('g', e.target.value)}
                className={`w-full px-2 py-1 text-sm border rounded ${
                  isDark 
                    ? 'bg-[#404040] border-[#555] text-[#e0e0e0]' 
                    : 'bg-white border-gray-300'
                }`}
              />
            </div>
            <div>
              <label className="block text-xs mb-1">蓝色 (B)</label>
              <input
                type="number"
                min="0"
                max="255"
                value={rgbValues.b}
                onChange={(e) => handleRgbChange('b', e.target.value)}
                className={`w-full px-2 py-1 text-sm border rounded ${
                  isDark 
                    ? 'bg-[#404040] border-[#555] text-[#e0e0e0]' 
                    : 'bg-white border-gray-300'
                }`}
              />
            </div>
          </div>

          {/* 十六进制输入 */}
          <div className="mb-4">
            <label className="block text-xs mb-1">十六进制颜色</label>
            <input
              type="text"
              placeholder="#000000"
              value={rgbToHex(rgbValues.r, rgbValues.g, rgbValues.b)}
              onChange={(e) => handleHexChange(e.target.value)}
              className={`w-full px-2 py-1 text-sm border rounded ${
                isDark 
                  ? 'bg-[#404040] border-[#555] text-[#e0e0e0]' 
                  : 'bg-white border-gray-300'
              }`}
            />
          </div>

          {/* 保存颜色 */}
          <div className="mb-4">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="颜色名称"
                value={colorName}
                onChange={(e) => setColorName(e.target.value)}
                className={`flex-1 px-2 py-1 text-sm border rounded ${
                  isDark 
                    ? 'bg-[#404040] border-[#555] text-[#e0e0e0]' 
                    : 'bg-white border-gray-300'
                }`}
              />
              <button
                onClick={saveColor}
                disabled={!colorName.trim()}
                className={`px-3 py-1 text-sm rounded transition-colors ${
                  colorName.trim()
                    ? (isDark ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white')
                    : (isDark ? 'bg-[#404040] text-[#888]' : 'bg-gray-200 text-gray-400')
                }`}
              >
                保存
              </button>
            </div>
          </div>

          {/* 保存的颜色 */}
          {savedColors.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium mb-2">已保存的颜色</h4>
              <div className="grid grid-cols-4 gap-2 max-h-32 overflow-y-auto">
                {savedColors.map((color) => (
                  <div
                    key={color.id}
                    className="group relative"
                  >
                    <div
                      className="w-full h-8 border rounded cursor-pointer hover:scale-105 transition-transform"
                      style={{ backgroundColor: color.color }}
                      onClick={() => setSelectedColor(color.color)}
                      title={color.name}
                    />
                    <button
                      onClick={() => deleteSavedColor(color.id)}
                      className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    >
                      <Trash2 className="w-2 h-2" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 操作按钮 */}
          <div className="flex gap-2">
            <button
              onClick={() => setIsOpen(false)}
              className={`flex-1 px-4 py-2 text-sm rounded transition-colors ${
                isDark 
                  ? 'bg-[#404040] hover:bg-[#505050] text-[#e0e0e0]' 
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
            >
              取消
            </button>
            <button
              onClick={applyColor}
              className="flex-1 px-4 py-2 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors flex items-center justify-center gap-1"
            >
              <Check className="w-4 h-4" />
              确定
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
