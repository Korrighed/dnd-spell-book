import type { ReactNode } from 'react'
import type { LanguageMode } from '../types/language'

interface BilingualProps {
  mode: LanguageMode
  fr: string
  en: string
}

export function Bilingual({ mode, fr, en }: BilingualProps) {
  return <>{mode === 'fr' ? fr : en}</>
}

/**
 * Emphase Markdown des descriptions de l'API (memes marqueurs en en et fr-FR) :
 * `***Nom de l'option.***` en tete des variantes d'un sort (24 sorts, ex.
 * Amelioration de caracteristique) et `*terme*` (2 sorts). Rendus en gras et
 * en italique, sans les asterisques. Elements React, jamais de HTML injecte.
 */
const EMPHASIS = /(\*\*\*[^*]+\*\*\*|\*[^*\s][^*]*\*)/

function renderEmphasis(text: string): ReactNode[] {
  return text.split(EMPHASIS).map((part, i) => {
    if (part.startsWith('***') && part.endsWith('***') && part.length > 6) {
      return <strong key={i}>{part.slice(3, -3)}</strong>
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      return <em key={i}>{part.slice(1, -1)}</em>
    }
    return part
  })
}

interface BilingualParagraphsProps {
  mode: LanguageMode
  fr: string[]
  en: string[]
}

export function BilingualParagraphs({ mode, fr, en }: BilingualParagraphsProps) {
  const paragraphs = mode === 'fr' ? fr : en
  return (
    <>
      {paragraphs.map((paragraph, i) => (
        <p key={`${mode}-${i}`}>{renderEmphasis(paragraph)}</p>
      ))}
    </>
  )
}
