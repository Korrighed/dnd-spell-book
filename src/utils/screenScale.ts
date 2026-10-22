import { MOBILE_QUERY } from '../hooks/useMediaQuery'

/** Largeurs CSS (px) des ecrans de reference des cotes en px. */
const DESKTOP_REFERENCE_WIDTH = 1536
const MOBILE_REFERENCE_WIDTH = 390
/** Plafond du zoom mobile : sur tablette, le livre reste une colonne centree. */
const MOBILE_MAX_SCALE = 1.3

function computeScale(): number {
  if (window.matchMedia(MOBILE_QUERY).matches) {
    return Math.min(window.innerWidth / MOBILE_REFERENCE_WIDTH, MOBILE_MAX_SCALE)
  }
  return window.innerWidth / DESKTOP_REFERENCE_WIDTH
}

/** Zoom courant de #root : divise une mesure a l'ecran pour obtenir des px internes. */
export function getScreenScale(): number {
  const value = Number.parseFloat(
    getComputedStyle(document.documentElement).getPropertyValue('--screen-scale'),
  )
  return Number.isFinite(value) && value > 0 ? value : 1
}

/** Pose --screen-scale sur <html> (zoom de #root, index.css), mis a jour au redimensionnement. */
export function syncScreenScale(): void {
  const apply = () => {
    document.documentElement.style.setProperty('--screen-scale', String(computeScale()))
  }
  apply()
  window.addEventListener('resize', apply)
}
