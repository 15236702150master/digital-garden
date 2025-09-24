// 核心数据类型定义
export interface Note {
  id: string
  title: string
  content: string
  category: string
  tags: string[]
  createdAt: string
  updatedAt: string
  isPublished: boolean
}

export interface Category {
  id: string
  name: string
  icon: string
  color: string
  description?: string
  parentId?: string
  children?: Category[]
  level?: number
}

export interface Tag {
  id: string
  name: string
  color: string
  count: number
}

export interface SearchResult {
  note: Note
  score: number
  matches: string[]
}
