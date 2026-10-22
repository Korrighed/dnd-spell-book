import { MOBILE_QUERY } from '../hooks/useMediaQuery'

/** Largeur CSS (px) de l'ecran sur lequel toutes les cotes desktop en px ont ete calees. */
const REFERENCE_WIDTH = 1536

/**
 * Pose --screen-scale (largeur d'ecran / REFERENCE_WIDTH) sur <html>, lu par
 * le zoom de #root (index.css) et par les bandeaux pleine largeur (App.css).
 * En JS : aucune unite CSS ne divise une largeur par une autre. 1 en mobile,
 * ou la mise en page a ses propres valeurs et aucun zoom.
 */
export function syncScreenScale(): void {
  const apply = () => {
    const scale = window.matchMedia(MOBILE_QUERY).matches ? 1 : window.innerWidth / REFERENCE_WIDTH
    document.documentElement.style.setProperty('--screen-scale', String(scale))
  }
  apply()
  window.addEventListener('resize', apply)
}
