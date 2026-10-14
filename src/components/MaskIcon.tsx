import type { CSSProperties } from 'react'

interface MaskIconProps {
  /** Fichier dans public/icons (ex. « funnel.svg »). */
  file: string
  className?: string
}

/**
 * Icone SVG de public/icons en masque CSS : prend la couleur du texte
 * (currentColor), comme les onglets et les boutons. Decorative (aria-hidden) :
 * le sens est porte par le texte ou l'aria-label voisin. Taille et masque :
 * App.css (.mask-icon).
 */
export function MaskIcon({ file, className }: MaskIconProps) {
  return (
    <span
      className={className ? `mask-icon ${className}` : 'mask-icon'}
      aria-hidden="true"
      style={{ '--icon': `url(${import.meta.env.BASE_URL}icons/${file})` } as CSSProperties}
    />
  )
}
