'use client'

import { Note } from '../types'

interface NotesPanelProps {
  currentNote: Note
  onNoteUpdate: (note: Note) => void
  onScrollToAnnotation: (position: number) => void
  isDark: boolean
}

export default function NotesPanel({ currentNote, onNoteUpdate, onScrollToAnnotation, isDark }: NotesPanelProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-gray-600">笔记信息</h3>
      <div className="text-xs text-gray-500 space-y-1">
        <div>创建时间: {new Date(currentNote.createdAt).toLocaleDateString()}</div>
        <div>更新时间: {new Date(currentNote.updatedAt).toLocaleDateString()}</div>
        <div>分类: {currentNote.category}</div>
        <div>标签: {currentNote.tags?.join(', ') || '无'}</div>
      </div>
    </div>
  )
}
