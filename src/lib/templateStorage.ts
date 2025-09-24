import { NoteTemplate } from '../types/template'

const TEMPLATES_KEY = 'digital-garden-templates'

export class TemplateStorage {
  static getTemplates(): NoteTemplate[] {
    try {
      const stored = localStorage.getItem(TEMPLATES_KEY)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('获取模板失败:', error)
      return []
    }
  }

  static saveTemplates(templates: NoteTemplate[]): void {
    try {
      localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates))
    } catch (error) {
      console.error('保存模板失败:', error)
    }
  }

  static createTemplate(templateData: Omit<NoteTemplate, 'id' | 'createdAt' | 'updatedAt'>): NoteTemplate {
    const template: NoteTemplate = {
      ...templateData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const templates = this.getTemplates()
    templates.push(template)
    this.saveTemplates(templates)
    
    return template
  }

  static updateTemplate(templateData: Partial<NoteTemplate> & { id: string }): NoteTemplate | null {
    const templates = this.getTemplates()
    const index = templates.findIndex(t => t.id === templateData.id)
    
    if (index === -1) return null

    const updatedTemplate = {
      ...templates[index],
      ...templateData,
      updatedAt: new Date().toISOString()
    }

    templates[index] = updatedTemplate
    this.saveTemplates(templates)
    
    return updatedTemplate
  }

  static deleteTemplate(id: string): boolean {
    const templates = this.getTemplates()
    const filteredTemplates = templates.filter(t => t.id !== id)
    
    if (filteredTemplates.length === templates.length) return false

    this.saveTemplates(filteredTemplates)
    return true
  }
}
