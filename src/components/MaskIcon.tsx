import type { CSSProperties } from 'react'

interface MaskIconProps {
  /** Fichier dans public/icons (ex. « funnel.svg »). */
  file: string
  className?: string
}

/** Icone SVG decorative de public/icons, en masque CSS (couleur du texte). */
export function MaskIcon({ file, className }: MaskIconProps) {
  return (
    <span
      className={className ? `mask-icon ${className}` : 'mask-icon'}
      aria-hidden="true"
      style={{ '--icon': `url(${import.meta.env.BASE_URL}icons/${file})` } as CSSProperties}
    />
  )
}
