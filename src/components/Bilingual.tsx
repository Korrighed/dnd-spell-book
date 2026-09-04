import type { LanguageMode } from '../types/language'

interface BilingualProps {
  mode: LanguageMode
  fr: string
  en: string
}

export function Bilingual({ mode, fr, en }: BilingualProps) {
  if (mode === 'fr') return <>{fr}</>
  if (mode === 'en') return <>{en}</>
  return (
    <>
      {fr} <em>{en}</em>
    </>
  )
}

interface BilingualParagraphsProps {
  mode: LanguageMode
  fr: string[]
  en: string[]
}

export function BilingualParagraphs({ mode, fr, en }: BilingualParagraphsProps) {
  return (
    <>
      {mode !== 'en' && fr.map((paragraph, i) => <p key={`fr-${i}`}>{paragraph}</p>)}
      {mode !== 'fr' &&
        en.map((paragraph, i) => (
          <p key={`en-${i}`}>{mode === 'both' ? <em>{paragraph}</em> : paragraph}</p>
        ))}
    </>
  )
}
