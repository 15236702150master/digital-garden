import React from 'react'
import { ChevronRight } from 'lucide-react'

interface BreadcrumbItem {
  label: string
  href?: string
  onClick?: () => void
}

interface BreadcrumbNavProps {
  items: BreadcrumbItem[]
  isDark?: boolean
  className?: string
}

export default function BreadcrumbNav({ 
  items, 
  isDark = false, 
  className = '' 
}: BreadcrumbNavProps) {
  if (!items || items.length === 0) return null

  return (
    <nav className={`flex items-center space-x-1 text-sm ${className}`}>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <ChevronRight className={`w-4 h-4 ${
              isDark ? 'text-gray-500' : 'text-gray-400'
            }`} />
          )}
          
          {item.onClick || item.href ? (
            <button
              onClick={item.onClick}
              className={`
                transition-colors duration-200 hover:underline
                ${isDark 
                  ? 'text-gray-300 hover:text-white' 
                  : 'text-gray-600 hover:text-gray-900'
                }
                ${index === items.length - 1 
                  ? (isDark ? 'text-gray-100 font-medium' : 'text-gray-900 font-medium')
                  : ''
                }
              `}
            >
              {item.label}
            </button>
          ) : (
            <span className={`
              ${index === items.length - 1 
                ? (isDark ? 'text-gray-100 font-medium' : 'text-gray-900 font-medium')
                : (isDark ? 'text-gray-400' : 'text-gray-500')
              }
            `}>
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  )
}
