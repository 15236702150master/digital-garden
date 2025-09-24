export interface NoteTemplate {
  id: string
  name: string
  description?: string
  content: string
  category?: string
  tags?: string[]
  createdAt: string
  updatedAt: string
}
