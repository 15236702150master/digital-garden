// 本地存储管理
import { Note, Category, Tag } from '@/types'

const STORAGE_KEYS = {
  NOTES: 'digital-garden-notes',
  CATEGORIES: 'digital-garden-categories',
  TAGS: 'digital-garden-tags'
}

// 笔记存储管理
export class NotesStorage {
  static getNotes(): Note[] {
    if (typeof window === 'undefined') return []
    const stored = localStorage.getItem(STORAGE_KEYS.NOTES)
    if (!stored) return []
    
    try {
      const notes = JSON.parse(stored)
      return notes
    } catch {
      return []
    }
  }

  static saveNotes(notes: Note[]): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes))
  }

  static addNote(note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Note {
    const newNote: Note = {
      ...note,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    const notes = this.getNotes()
    notes.unshift(newNote)
    this.saveNotes(notes)
    return newNote
  }

  static updateNote(id: string, updates: Partial<Note>): Note | null {
    const notes = this.getNotes()
    const index = notes.findIndex(note => note.id === id)
    
    if (index === -1) return null
    
    notes[index] = {
      ...notes[index],
      ...updates,
      updatedAt: new Date().toISOString()
    }
    
    this.saveNotes(notes)
    return notes[index]
  }

  static deleteNote(id: string): boolean {
    const notes = this.getNotes()
    const filtered = notes.filter(note => note.id !== id)
    
    if (filtered.length === notes.length) return false
    
    this.saveNotes(filtered)
    return true
  }

  static moveNote(id: string, targetCategory: string): Note | null {
    return this.updateNote(id, { category: targetCategory })
  }
}

// 分类存储管理
export class CategoriesStorage {
  static getCategories(): Category[] {
    if (typeof window === 'undefined') return []
    const stored = localStorage.getItem(STORAGE_KEYS.CATEGORIES)
    return stored ? JSON.parse(stored) : this.getDefaultCategories()
  }

  static getDefaultCategories(): Category[] {
    return [
      { id: '1', name: '学习笔记', icon: '📚', color: '#3b82f6', description: '学习相关的笔记' },
      { id: '2', name: '工作记录', icon: '💼', color: '#10b981', description: '工作相关的记录' },
      { id: '3', name: '生活感悟', icon: '🌱', color: '#f59e0b', description: '生活中的感悟和思考' },
      { id: '4', name: '技术分享', icon: '💻', color: '#8b5cf6', description: '技术相关的分享' },
      { id: '5', name: '随笔', icon: '✍️', color: '#ef4444', description: '随意记录的想法' }
    ]
  }

  static saveCategories(categories: Category[]): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories))
  }

  static addCategory(name: string, parentId?: string): Category | null {
    const categories = this.getCategories()
    
    // 检查是否已存在同名分类（在同一层级下）
    const siblings = parentId 
      ? categories.filter(cat => cat.parentId === parentId)
      : categories.filter(cat => !cat.parentId)
    
    if (siblings.some(cat => cat.name === name)) {
      return null
    }

    const parentLevel = parentId 
      ? (categories.find(cat => cat.id === parentId)?.level || 0)
      : -1

    const newCategory: Category = {
      id: crypto.randomUUID(),
      name,
      icon: '📁',
      color: this.getRandomColor(),
      description: `${name}相关的笔记`,
      parentId,
      level: parentLevel + 1
    }

    categories.push(newCategory)
    this.saveCategories(categories)
    return newCategory
  }

  static updateCategory(oldName: string, newName: string): boolean {
    const categories = this.getCategories()
    const index = categories.findIndex(cat => cat.name === oldName)
    
    if (index === -1) return false
    
    // 检查新名称是否已存在
    if (categories.some(cat => cat.name === newName && cat.name !== oldName)) {
      return false
    }

    categories[index] = {
      ...categories[index],
      name: newName
    }

    this.saveCategories(categories)
    return true
  }

  static deleteCategory(name: string): boolean {
    const categories = this.getCategories()
    const categoryToDelete = categories.find(cat => cat.name === name)
    
    if (!categoryToDelete) return false
    
    // 递归删除所有子分类
    const deleteWithChildren = (categoryId: string) => {
      const children = categories.filter(cat => cat.parentId === categoryId)
      children.forEach(child => deleteWithChildren(child.id))
      return categories.filter(cat => cat.id !== categoryId)
    }
    
    const filtered = deleteWithChildren(categoryToDelete.id)
    this.saveCategories(filtered)
    return true
  }

  // 构建层级分类树
  static buildCategoryTree(): Category[] {
    const categories = this.getCategories()
    const categoryMap = new Map<string, Category>()
    
    // 创建分类映射并初始化children数组
    categories.forEach(cat => {
      categoryMap.set(cat.id, { ...cat, children: [] })
    })
    
    const rootCategories: Category[] = []
    
    // 构建树结构
    categories.forEach(cat => {
      const category = categoryMap.get(cat.id)!
      if (cat.parentId) {
        const parent = categoryMap.get(cat.parentId)
        if (parent) {
          parent.children!.push(category)
        }
      } else {
        rootCategories.push(category)
      }
    })
    
    return rootCategories
  }

  // 获取分类的完整路径
  static getCategoryPath(categoryName: string): string {
    const categories = this.getCategories()
    const category = categories.find(cat => cat.name === categoryName)
    
    if (!category) return categoryName
    
    const buildPath = (cat: Category): string => {
      if (!cat.parentId) return cat.name
      const parent = categories.find(c => c.id === cat.parentId)
      return parent ? `${buildPath(parent)} > ${cat.name}` : cat.name
    }
    
    return buildPath(category)
  }

  private static getRandomColor(): string {
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#84cc16']
    return colors[Math.floor(Math.random() * colors.length)]
  }
}

// 标签存储管理
export class TagsStorage {
  static getTags(): Tag[] {
    if (typeof window === 'undefined') return []
    const stored = localStorage.getItem(STORAGE_KEYS.TAGS)
    return stored ? JSON.parse(stored) : []
  }

  static saveTags(tags: Tag[]): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(STORAGE_KEYS.TAGS, JSON.stringify(tags))
  }

  static updateTagCounts(notes: Note[]): void {
    const tagCounts = new Map<string, number>()
    
    notes.forEach(note => {
      note.tags.forEach(tag => {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1)
      })
    })

    const existingTags = this.getTags()
    const updatedTags = Array.from(tagCounts.entries()).map(([name, count]) => {
      const existing = existingTags.find(tag => tag.name === name)
      return {
        id: existing?.id || crypto.randomUUID(),
        name,
        color: existing?.color || this.getRandomColor(),
        count
      }
    })

    this.saveTags(updatedTags)
  }

  static addTag(name: string, color?: string): Tag {
    const tags = this.getTags()
    const existing = tags.find(tag => tag.name === name)
    if (existing) return existing

    const newTag: Tag = {
      id: crypto.randomUUID(),
      name,
      color: color || this.getRandomColor(),
      count: 0
    }

    tags.push(newTag)
    this.saveTags(tags)
    return newTag
  }

  static updateTag(id: string, updates: Partial<Tag>): Tag | null {
    const tags = this.getTags()
    const index = tags.findIndex(tag => tag.id === id)
    if (index === -1) return null

    tags[index] = { ...tags[index], ...updates }
    this.saveTags(tags)
    return tags[index]
  }

  static deleteTag(id: string): boolean {
    const tags = this.getTags()
    const index = tags.findIndex(tag => tag.id === id)
    if (index === -1) return false

    tags.splice(index, 1)
    this.saveTags(tags)
    return true
  }

  static getTagByName(name: string): Tag | null {
    const tags = this.getTags()
    return tags.find(tag => tag.name === name) || null
  }

  private static getRandomColor(): string {
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#84cc16']
    return colors[Math.floor(Math.random() * colors.length)]
  }
}
