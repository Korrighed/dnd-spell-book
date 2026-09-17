import { useEffect, useState, type CSSProperties, type ReactNode } from 'react'
import './DevFrame.css'

/**
 * Outil de developpement uniquement. Encadre un composant, affiche son nom et ses
 * sources de donnees. Une meme couleur de pastille sur deux cadres = meme source.
 * Hors `npm run dev`, ne rend que ses enfants.
 */

const STORAGE_KEY = 'dnd-dev-frames'
const BODY_CLASS = 'dev-frames'

/** Couleur fixe par source : lisible et stable d'un rendu a l'autre. */
const SOURCE_COLORS: Record<string, string> = {
  useSpellList: '#e6194b',
  useClassList: '#3cb44b',
  useSchoolList: '#4363d8',
  useClassSpellIndices: '#f58231',
  useSchoolSpellIndices: '#911eb4',
  usePersonalSpellbook: '#f032e6',
  useSpellcastingClasses: '#bcf60c',
  useSpellAccess: '#46f0f0',
  useSpellDetail: '#fabebe',
  'state:search': '#aaffc3',
  'state:filtres': '#ffe119',
  'state:hideOutOfProfile': '#9a6324',
  'state:selectedIndex': '#ffffff',
  'state:language': '#808000',
}

/** Couleur de cadre derivee du nom : chaque composant a la sienne. */
function frameColor(name: string): string {
  let hash = 0
  for (const char of name) hash = (hash * 31 + char.charCodeAt(0)) % 360
  return `hsl(${hash}, 80%, 60%)`
}

interface DevFrameProps {
  name: string
  uses: string[]
  children: ReactNode
}

export function DevFrame({ name, uses, children }: DevFrameProps) {
  if (!import.meta.env.DEV) return <>{children}</>

  return (
    <div className="dev-frame" style={{ '--dev-frame-color': frameColor(name) } as CSSProperties}>
      <div className="dev-frame-label">
        <strong>{name}</strong>
        {uses.map((source) => (
          <span
            key={source}
            className="dev-frame-chip"
            style={{ '--dev-chip-color': SOURCE_COLORS[source] ?? '#999' } as CSSProperties}
          >
            {source}
          </span>
        ))}
      </div>
      {children}
    </div>
  )
}

function readEnabled(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

export function DevFramesToggle() {
  const [enabled, setEnabled] = useState(readEnabled)

  useEffect(() => {
    document.body.classList.toggle(BODY_CLASS, enabled)
    try {
      localStorage.setItem(STORAGE_KEY, enabled ? '1' : '0')
    } catch {
      // Preference de confort : sans stockage, on repart desactive au rechargement.
    }
  }, [enabled])

  if (!import.meta.env.DEV) return null

  return (
    <button type="button" className="dev-frames-toggle" onClick={() => setEnabled((on) => !on)}>
      {enabled ? 'Masquer les cadres dev' : 'Afficher les cadres dev'}
    </button>
  )
}
