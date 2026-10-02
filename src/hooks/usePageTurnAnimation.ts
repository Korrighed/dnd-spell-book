import { useCallback, useRef } from 'react'
import * as THREE from 'three'

export type AnimationActions = Record<string, THREE.AnimationAction | null>

/**
 * Vitesse du tournage de page en 3 phases, decoupees sur le temps DU CLIP
 * lui-meme (pas le temps reel) : 30% rapide, 40% a vitesse normale, 30% lent.
 * Donne un effet d'acceleration/decceleration (plutot qu'une vitesse plate)
 * sans reecrire le fichier .glb. Multiplicateurs ajustables a l'oeil.
 * Note : c'est un ease-out (rapide -> lent), pas un ease-in-out symetrique.
 */
const PAGE_TURN_PHASES = [
  { clipFraction: 0.3, speed: 8 },
  { clipFraction: 0.4, speed: 4 },
  { clipFraction: 0.3, speed: 2 },
]

export interface PageTurnAnimation {
  /** A appeler des que useAnimations() fournit les actions (voir BookCanvas). */
  setActions: (actions: AnimationActions) => void
  /** Joue le tournage vers l'avant. Retourne la duree totale (s). */
  playNext: () => number
  /** Joue le tournage vers l'arriere (memes clips, a l'envers). Retourne la duree totale (s). */
  playPrevious: () => number
}

/**
 * Pilote les clips d'animation du modele (ArmatureAction.001, PlaneAction,
 * CubeAction, PlaneAction.001 - voir docs du modele) pour simuler le
 * tournage d'une page, dans un sens ou l'autre, en 3 phases de vitesse.
 * Isole de BookCanvas.tsx : pas de dependance a react-three-fiber ici, juste
 * des THREE.AnimationAction deja resolues par useAnimations (drei).
 */
export function usePageTurnAnimation(): PageTurnAnimation {
  const actionsRef = useRef<AnimationActions>({})
  // setTimeout des changements de phase (vitesse) en cours : annules si un
  // nouveau tournage de page demarre avant la fin du precedent (clic rapide).
  const pendingPhaseTimeoutsRef = useRef<number[]>([])

  const setActions = useCallback((actions: AnimationActions) => {
    actionsRef.current = actions
  }, [])

  const playDirection = useCallback((reverse: boolean) => {
    pendingPhaseTimeoutsRef.current.forEach((id) => window.clearTimeout(id))
    pendingPhaseTimeoutsRef.current = []

    const entries = Object.values(actionsRef.current).filter(
      (action): action is THREE.AnimationAction => action !== null,
    )
    if (entries.length === 0) return 0

    // Reference commune (le plus long clip) : les 3 phases sont decoupees
    // dessus pour que tous les clips changent de vitesse en meme temps et
    // restent synchronises, meme si leurs propres durees different.
    const refDuration = Math.max(...entries.map((action) => action.getClip().duration))
    const sign = reverse ? -1 : 1
    let wallElapsed = 0

    entries.forEach((action) => {
      action.reset()
      action.clampWhenFinished = true
      action.loop = THREE.LoopOnce
      action.timeScale = sign * PAGE_TURN_PHASES[0].speed
      action.time = reverse ? action.getClip().duration : 0
      action.paused = false
      action.play()
    })

    // Phase 0 deja lancee ci-dessus. Programme les phases 1 et 2 (vitesse
    // normale puis lente) a l'instant ou la phase precedente, a sa vitesse,
    // aurait fini de parcourir sa part du clip de reference.
    PAGE_TURN_PHASES.forEach((phase, index) => {
      const wallPhaseDuration = (phase.clipFraction * refDuration) / phase.speed
      if (index > 0) {
        const delayMs = wallElapsed * 1000
        const timeoutId = window.setTimeout(() => {
          entries.forEach((action) => {
            action.timeScale = sign * phase.speed
          })
        }, delayMs)
        pendingPhaseTimeoutsRef.current.push(timeoutId)
      }
      wallElapsed += wallPhaseDuration
    })

    return wallElapsed
  }, [])

  const playNext = useCallback(() => playDirection(false), [playDirection])
  const playPrevious = useCallback(() => playDirection(true), [playDirection])

  return { setActions, playNext, playPrevious }
}
