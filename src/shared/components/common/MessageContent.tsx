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
      parts.push(<strong key={match.index} className="font-semibold text-neutral-900">{match[2]}</strong>)
    } else if (match[3]) {
      parts.push(<em key={match.index} className="text-neutral-700 italic">{match[3]}</em>)
    }
    lastIndex = regex.lastIndex
  }

  if (lastIndex < line.length) {
    parts.push(line.slice(lastIndex))
  }

  return parts.length > 0 ? parts : [line]
}

function isSingleWordHeader(line: string): boolean {
  const trimmed = line.trim().replace(/\*+/g, '').trim()
  if (!trimmed) return false
  const words = trimmed.split(/\s+/)
  if (words.length > 5) return false
  const hasColon = trimmed.endsWith(':')
  const isCapitalized = /^[A-ZÁÉÍÓÚÑ][a-záéíóúñ]/.test(trimmed)
  const isShortPhrase = trimmed.length < 60 && words.length <= 4
  return (isCapitalized && isShortPhrase) || hasColon
}

function isBoldHeader(line: string): boolean {
  const trimmed = line.trim()
  return trimmed.startsWith('**') && trimmed.endsWith('**')
}

function isSeparator(line: string): boolean {
  return /^[─═\-]{5,}$/.test(line.trim())
}

function isCodeInline(line: string): boolean {
  return line.includes('`') && !line.trim().startsWith('```')
}

interface MessageContentProps {
  content: string
  role: 'user' | 'assistant'
}

function renderInlineCode(text: string): ReactNode[] {
  const parts: ReactNode[] = []
  const regex = /`([^`]+)`/g
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index))
    }
    parts.push(
      <code key={match.index} className="rounded bg-neutral-100 px-1.5 py-0.5 text-xs font-mono text-primary-700 border border-neutral-200">
        {match[1]}
      </code>
    )
    lastIndex = regex.lastIndex
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex))
  }

  return parts.length > 0 ? parts : [text]
}

function parseLineWithCode(line: string): ReactNode[] {
  if (line.includes('`')) {
    const segments = line.split(/(`[^`]+`)/)
    return segments.map((seg, i) => {
      if (seg.startsWith('`') && seg.endsWith('`')) {
        return (
          <code key={i} className="rounded bg-neutral-100 px-1.5 py-0.5 text-xs font-mono text-primary-700 border border-neutral-200">
            {seg.slice(1, -1)}
          </code>
        )
      }
      return <>{parseLine(seg)}</>
    })
  }
  return parseLine(line)
}

export function MessageContent({ content, role }: MessageContentProps) {
  if (role === 'user') {
    return <span className="text-sm leading-relaxed">{content}</span>
  }

  const blocks = content.split(/(```[\s\S]*?```)/)
  const elements: ReactNode[] = []
  let blockIndex = 0

  for (const block of blocks) {
    if (block.startsWith('```') && block.endsWith('```')) {
      const lang = block.split('\n')[0].replace(/^```/, '').trim()
      const code = block.slice(3 + lang.length + (lang ? 0 : 0)).replace(/```$/, '').trim()
      elements.push(
        <div key={`code-${blockIndex++}`} className="my-3 rounded-xl border border-neutral-200/80 bg-neutral-900 overflow-hidden shadow-xs">
          {lang && (
            <div className="border-b border-neutral-700/80 bg-neutral-800 px-3.5 py-1.5 text-xs text-neutral-400 font-mono flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-green-500/60" />
              {lang}
            </div>
          )}
          <pre className="overflow-x-auto p-4 text-sm text-neutral-100 leading-relaxed font-mono"><code>{code}</code></pre>
        </div>
      )
    } else {
      const lines = block.split('\n')
      elements.push(
        <div key={`text-${blockIndex++}`} className="space-y-1.5">
          {lines.map((line, i) => {
            const trimmed = line.trim()

            if (isSeparator(line)) {
              return <hr key={i} className="border-neutral-200/60 my-2" />
            }

            if (trimmed === '') {
              return <div key={i} className="h-1.5" />
            }

            if (isBoldHeader(line)) {
              const text = line.replace(/^\*\*/, '').replace(/\*\*$/, '').trim()
              return (
                <div key={i} className="flex items-center gap-2 pt-1">
                  <div className="h-4 w-1 rounded-full bg-gold flex-shrink-0" />
                  <p className="text-sm font-bold text-neutral-900">{text}</p>
                </div>
              )
            }

            if (isSingleWordHeader(line)) {
              const clean = line.replace(/\*+/g, '').trim()
              return (
                <div key={i} className="flex items-center gap-2 pt-2 pb-0.5">
                  <div className="h-4 w-1 rounded-full bg-primary-500 flex-shrink-0" />
                  <p className="text-sm font-bold text-neutral-900">{clean}</p>
                </div>
              )
            }

            if (trimmed.startsWith('•') || trimmed.startsWith('-')) {
              return (
                <div key={i} className="flex gap-2.5 text-sm text-neutral-700 pl-1">
                  <span className="text-gold mt-0.5 select-none text-lg leading-none">•</span>
                  <span className="flex-1 leading-relaxed">{parseLineWithCode(line.replace(/^[•\-]\s*/, ''))}</span>
                </div>
              )
            }

            if (trimmed.match(/^\d+\./)) {
              const num = trimmed.match(/^\d+/)?.[0]
              return (
                <div key={i} className="flex gap-2 text-sm text-neutral-700 pl-1">
                  <span className="text-gold-dark font-semibold min-w-[1.8ch] select-none text-right">
                    {num}
                  </span>
                  <span className="flex-1 leading-relaxed">{parseLineWithCode(line.replace(/^\d+\.\s*/, ''))}</span>
                </div>
              )
            }

            if (trimmed.startsWith('>')) {
              return (
                <div key={i} className="border-l-2 border-gold/30 bg-gold/[0.03] rounded-r-lg px-3.5 py-2 text-sm text-neutral-600 italic">
                  {parseLineWithCode(line.replace(/^>\s*/, ''))}
                </div>
              )
            }

            if (trimmed.startsWith(':') || trimmed.startsWith('💡') || trimmed.startsWith('📌')) {
              return (
                <div key={i} className="flex gap-2 text-sm text-neutral-700 bg-primary-50/50 rounded-lg px-3 py-2 border border-primary-100/60">
                  <span className="flex-1 leading-relaxed">{parseLineWithCode(line.replace(/^[:💡📌]\s*/, ''))}</span>
                </div>
              )
            }

            return (
              <p key={i} className="text-sm text-neutral-700 leading-relaxed">
                {parseLineWithCode(line)}
              </p>
            )
          })}
        </div>
      )
    }
  }

  return <div className="space-y-2">{elements}</div>
}
