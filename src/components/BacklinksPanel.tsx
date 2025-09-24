'use client'

import { Note } from '../types'

interface BacklinksPanelProps {
  currentNote: Note
  allNotes: Note[]
  onNoteSelect: (note: Note) => void
  isDark: boolean
}

export default function BacklinksPanel({ currentNote, allNotes, onNoteSelect, isDark }: BacklinksPanelProps) {
  const backlinks = allNotes.filter(note => 
    note.id !== currentNote.id && 
    note.content.includes(`[[${currentNote.title}]]`)
  )

  if (backlinks.length === 0) {
    return null
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-gray-600">反向链接</h3>
      <div className="space-y-1">
        {backlinks.map(note => (
          <button
            key={note.id}
            onClick={() => onNoteSelect(note)}
            className="block w-full text-left p-2 text-sm rounded hover:bg-gray-100 transition-colors"
          >
            {note.title}
          </button>
        ))}
      </div>
    </div>
  )
}
