import { useCallback, useEffect, useRef } from 'react'
import * as THREE from 'three'

export type AnimationActions = Record<string, THREE.AnimationAction | null>

/** Vitesse du tournage en 3 phases, en part du clip : rapide, normale, lente. */
const PAGE_TURN_PHASES = [
  { clipFraction: 0.3, speed: 8 },
  { clipFraction: 0.4, speed: 4 },
  { clipFraction: 0.3, speed: 2 },
]

export interface PageTurnAnimation {
  setActions: (actions: AnimationActions) => void
  /** Retourne la duree totale (s). */
  playNext: () => number
  /** Memes clips, a l'envers. Retourne la duree totale (s). */
  playPrevious: () => number
}

/** Pilote les clips d'animation du modele pour tourner une page, dans un sens ou l'autre. */
export function usePageTurnAnimation(): PageTurnAnimation {
  const actionsRef = useRef<AnimationActions>({})
  // Changements de phase en attente, annules si un tournage en remplace un autre.
  const pendingPhaseTimeoutsRef = useRef<number[]>([])

  useEffect(() => {
    const pendingPhaseTimeouts = pendingPhaseTimeoutsRef
    return () => {
      pendingPhaseTimeouts.current.forEach((id) => window.clearTimeout(id))
      pendingPhaseTimeouts.current = []
    }
  }, [])

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

    // Phases decoupees sur le plus long clip : tous changent de vitesse ensemble.
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

    // Phase 0 lancee ci-dessus ; programme les suivantes.
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
