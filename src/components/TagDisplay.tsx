import React from 'react'
import { Tag } from '@/types'

interface TagDisplayProps {
  tags: string[]
  isDark?: boolean
  size?: 'sm' | 'md' | 'lg'
  onTagClick?: (tag: string) => void
  className?: string
}

export default function TagDisplay({ 
  tags, 
  isDark = false, 
  size = 'md',
  onTagClick,
  className = ''
}: TagDisplayProps) {
  if (!tags || tags.length === 0) return null

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2'
  }

  const baseClasses = `
    inline-flex items-center rounded-full font-medium transition-all duration-200
    ${sizeClasses[size]}
    ${onTagClick ? 'cursor-pointer hover:scale-105' : ''}
  `

  const getTagColor = (tag: string, index: number) => {
    const colors = [
      { bg: 'bg-blue-100', text: 'text-blue-800', hover: 'hover:bg-blue-200' },
      { bg: 'bg-green-100', text: 'text-green-800', hover: 'hover:bg-green-200' },
      { bg: 'bg-purple-100', text: 'text-purple-800', hover: 'hover:bg-purple-200' },
      { bg: 'bg-orange-100', text: 'text-orange-800', hover: 'hover:bg-orange-200' },
      { bg: 'bg-pink-100', text: 'text-pink-800', hover: 'hover:bg-pink-200' },
      { bg: 'bg-indigo-100', text: 'text-indigo-800', hover: 'hover:bg-indigo-200' },
      { bg: 'bg-teal-100', text: 'text-teal-800', hover: 'hover:bg-teal-200' },
    ]

    const darkColors = [
      { bg: 'bg-blue-900/30', text: 'text-blue-300', hover: 'hover:bg-blue-900/50' },
      { bg: 'bg-green-900/30', text: 'text-green-300', hover: 'hover:bg-green-900/50' },
      { bg: 'bg-purple-900/30', text: 'text-purple-300', hover: 'hover:bg-purple-900/50' },
      { bg: 'bg-orange-900/30', text: 'text-orange-300', hover: 'hover:bg-orange-900/50' },
      { bg: 'bg-pink-900/30', text: 'text-pink-300', hover: 'hover:bg-pink-900/50' },
      { bg: 'bg-indigo-900/30', text: 'text-indigo-300', hover: 'hover:bg-indigo-900/50' },
      { bg: 'bg-teal-900/30', text: 'text-teal-300', hover: 'hover:bg-teal-900/50' },
    ]

    const colorSet = isDark ? darkColors : colors
    const colorIndex = tag.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colorSet.length
    return colorSet[colorIndex]
  }

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {tags.map((tag, index) => {
        const colors = getTagColor(tag, index)
        return (
          <span
            key={tag}
            onClick={() => onTagClick?.(tag)}
            className={`
              ${baseClasses}
              ${colors.bg} ${colors.text} ${colors.hover}
            `}
          >
            #{tag}
          </span>
        )
      })}
    </div>
  )
}
