import { type ReactNode } from 'react'

function parseLine(line: string): ReactNode[] {
  const parts: ReactNode[] = []
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*)/g
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = regex.exec(line)) !== null) {
    if (match.index > lastIndex) {
      parts.push(line.slice(lastIndex, match.index))
    }
    if (match[2]) {
      parts.push(<strong key={match.index}>{match[2]}</strong>)
    } else if (match[3]) {
      parts.push(<em key={match.index}>{match[3]}</em>)
    }
    lastIndex = regex.lastIndex
  }

  if (lastIndex < line.length) {
    parts.push(line.slice(lastIndex))
  }

  return parts.length > 0 ? parts : [line]
}

function isSectionHeader(line: string): boolean {
  const trimmed = line.trim()
  return /^[A-ZÁÉÍÓÚÑ\s]{3,}$/.test(trimmed) && trimmed.length > 5 && !trimmed.includes('•')
}

function isSeparator(line: string): boolean {
  return /^[─═\-]{5,}$/.test(line.trim())
}

interface MessageContentProps {
  content: string
  role: 'user' | 'assistant'
}

export function MessageContent({ content, role }: MessageContentProps) {
  const lines = content.split('\n')

  if (role === 'user') {
    return <>{content}</>
  }

  return (
    <div className="space-y-1.5">
      {lines.map((line, i) => {
        if (isSeparator(line)) {
          return <hr key={i} className="border-neutral-200 my-1" />
        }
        if (isSectionHeader(line)) {
          return (
            <p key={i} className="text-sm font-semibold text-neutral-900 pt-1">
              {line}
            </p>
          )
        }
        if (line.trim() === '') {
          return <div key={i} className="h-1" />
        }
        if (line.trimStart().startsWith('•') || line.trimStart().startsWith('-')) {
          return (
            <div key={i} className="flex gap-2 text-sm text-neutral-700">
              <span className="text-neutral-400 mt-0.5 select-none">•</span>
              <span className="flex-1">{parseLine(line.replace(/^[•\-]\s*/, ''))}</span>
            </div>
          )
        }
        if (line.trimStart().match(/^\d+\./)) {
          return (
            <div key={i} className="flex gap-2 text-sm text-neutral-700">
              <span className="text-neutral-500 font-medium min-w-[1.5ch] select-none">
                {line.trim().match(/^\d+/)?.[0]}
              </span>
              <span className="flex-1">{parseLine(line.replace(/^\d+\.\s*/, ''))}</span>
            </div>
          )
        }
        return (
          <p key={i} className="text-sm text-neutral-700 leading-relaxed">
            {parseLine(line)}
          </p>
        )
      })}
    </div>
  )
}
