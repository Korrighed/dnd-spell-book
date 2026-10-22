import type { LanguageMode } from '../types/language'

interface BilingualProps {
  mode: LanguageMode
  fr: string
  en: string
}

export function Bilingual({ mode, fr, en }: BilingualProps) {
  return <>{mode === 'fr' ? fr : en}</>
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
        <p key={`${mode}-${i}`}>{paragraph}</p>
      ))}
    </>
  )
}
