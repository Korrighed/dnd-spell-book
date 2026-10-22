import { MOBILE_QUERY } from '../hooks/useMediaQuery'

/**
 * Largeurs CSS (px) des ecrans sur lesquels toutes les cotes en px ont ete
 * calees : 15" en desktop, telephone de 390px en mobile.
 */
const DESKTOP_REFERENCE_WIDTH = 1536
const MOBILE_REFERENCE_WIDTH = 390
/**
 * Plafond du zoom mobile : au-dela (tablette en portrait, 600-899px), le
 * livre reste une colonne centree au lieu de tout agrandir x2.
 */
const MOBILE_MAX_SCALE = 1.3

function computeScale(): number {
  if (window.matchMedia(MOBILE_QUERY).matches) {
    return Math.min(window.innerWidth / MOBILE_REFERENCE_WIDTH, MOBILE_MAX_SCALE)
  }
  return window.innerWidth / DESKTOP_REFERENCE_WIDTH
}

/**
 * Facteur de zoom courant de #root : convertit une mesure a l'ecran
 * (getBoundingClientRect, clientY, innerHeight) en px CSS internes.
 */
export function getScreenScale(): number {
  const value = Number.parseFloat(
    getComputedStyle(document.documentElement).getPropertyValue('--screen-scale'),
  )
  return Number.isFinite(value) && value > 0 ? value : 1
}

/**
 * Pose --screen-scale sur <html>, lu par le zoom de #root (index.css) et par
 * les elements pleine largeur (App.css, App.mobile.css). En JS : aucune unite
 * CSS ne divise une largeur par une autre.
 */
export function syncScreenScale(): void {
  const apply = () => {
    document.documentElement.style.setProperty('--screen-scale', String(computeScale()))
  }
  apply()
  window.addEventListener('resize', apply)
}
