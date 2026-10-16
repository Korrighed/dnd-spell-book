import {
  Suspense,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  type CSSProperties,
} from 'react'
import { Canvas } from '@react-three/fiber'
import { Bounds, Center, useAnimations, useBounds, useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { MOBILE_QUERY, useMediaQuery } from '../hooks/useMediaQuery'
import { usePageTurnAnimation, type AnimationActions } from '../hooks/usePageTurnAnimation'

const MODEL_PATH = '/assets/spellbook_lowpoly_v2.glb'

/**
 * Cadrage du livre, fige a partir des valeurs reglees a l'oeil avec l'ancien
 * panneau Leva (retire). Deux jeux, desktop et mobile : le cadre du canvas
 * (--book-frame-*, voir BookSpread.css) change radicalement de forme entre les
 * deux, la meme marge/etirement ne convient jamais aux deux a la fois.
 * - rotation : orientation du modele, en degres.
 * - margin : marge de cadrage de Bounds (petit = livre plus gros). Changer
 *   cette valeur deplace le bord haut du livre dessine : reajuster alors
 *   --book-edge-top (App.css / App.mobile.css), qui y colle les marque-pages.
 * - scaleX / scaleY / offsetX : etirement et decalage du RENDU (CSS, voir
 *   BookSpread.css), independants de la boite du canvas.
 */
interface BookFraming {
  rotation: { x: number; y: number; z: number }
  margin: number
  scaleX: number
  scaleY: number
  offsetX: number
}

const DESKTOP_SETTINGS: BookFraming = {
  rotation: { x: -90, y: 0, z: -180 },
  margin: 0.55,
  scaleX: 1.3,
  scaleY: 1,
  offsetX: 0,
}

const MOBILE_SETTINGS: BookFraming = {
  rotation: { x: -90, y: 0, z: -180 },
  margin: 0.55,
  scaleX: 0.95,
  scaleY: 1.24,
  offsetX: 0,
}

/** Impose par le methode exposee a l'exterieur (voir BookCanvasHandle). */
export interface BookCanvasHandle {
  /** Joue l'animation de tournage de page vers l'avant. Retourne sa duree (s). */
  playNext: () => number
  /** Joue l'animation de tournage de page vers l'arriere (meme clips, a l'envers). Retourne sa duree (s). */
  playPrevious: () => number
}

interface SpellbookModelProps {
  rotationDeg: { x: number; y: number; z: number }
  /** Remonte les actions d'animation vers BookCanvas des qu'elles sont pretes
      (le modele est charge en Suspense, donc pas disponible au premier rendu
      de BookCanvas). */
  onActionsReady: (actions: AnimationActions) => void
}

function SpellbookModel({ rotationDeg, onActionsReady }: SpellbookModelProps) {
  const groupRef = useRef<THREE.Group>(null)
  const { scene, animations } = useGLTF(MODEL_PATH)
  const { actions } = useAnimations(animations, groupRef)
  const rotation: [number, number, number] = [
    THREE.MathUtils.degToRad(rotationDeg.x),
    THREE.MathUtils.degToRad(rotationDeg.y),
    THREE.MathUtils.degToRad(rotationDeg.z),
  ]

  useEffect(() => {
    onActionsReady(actions)
  }, [actions, onActionsReady])

  return (
    <group ref={groupRef} rotation={rotation}>
      <Center>
        <primitive object={scene} />
      </Center>
    </group>
  )
}

/**
 * Force un recadrage de la camera quand le jeu de reglages change (passage
 * desktop/mobile). `Bounds` ne recadre sinon qu'au montage ou au
 * redimensionnement de la fenetre : une prop comme `margin` qui change seule
 * ne declenche rien.
 */
function RefitOnChange({ trigger }: { trigger: unknown }) {
  const bounds = useBounds()
  useEffect(() => {
    bounds.refresh().fit()
  }, [trigger, bounds])
  return null
}

/**
 * Fond 3D du grimoire. `Bounds` cadre automatiquement la camera sur le
 * modele (echelle/origine inconnues a l'export) : pas de position de camera
 * a deviner a la main. Consequence : ni la position ni l'echelle du modele
 * n'ont d'effet visible (Bounds recentre/rezoom dessus) - seules la rotation
 * et la marge de cadrage (`margin`, taille apparente du livre) comptent.
 *
 * Reglages dupliques desktop/mobile (DESKTOP_SETTINGS / MOBILE_SETTINGS) :
 * un seul jeu ecrasait systematiquement l'un des deux formats (constat :
 * livre ecrase en haut en mobile). Toujours le meme modele/scene/canvas,
 * seuls les nombres different selon la largeur d'ecran.
 *
 * Expose playNext/playPrevious (ref imperatif) : le pilotage des clips
 * d'animation (tournage de page) est dans le hook usePageTurnAnimation.
 */
export const BookCanvas = forwardRef<BookCanvasHandle>(function BookCanvas(_props, ref) {
  const isMobile = useMediaQuery(MOBILE_QUERY)
  const pageTurn = usePageTurnAnimation()

  const { rotation, margin, scaleX, scaleY, offsetX } = isMobile
    ? MOBILE_SETTINGS
    : DESKTOP_SETTINGS
  const { x, y, z } = rotation

  // Tableau memoise : un nouveau tableau a chaque rendu relancerait le
  // recadrage de la camera a chaque frappe dans la recherche (App re-rend
  // BookCanvas). Ne change qu'au passage desktop/mobile.
  const refitTrigger = useMemo(
    () => [x, y, z, margin, isMobile],
    [x, y, z, margin, isMobile],
  )

  useImperativeHandle(
    ref,
    () => ({
      playNext: pageTurn.playNext,
      playPrevious: pageTurn.playPrevious,
    }),
    [pageTurn],
  )

  const stretchStyle = {
    width: '100%',
    height: '100%',
    '--book-canvas-scale-x': scaleX,
    '--book-canvas-scale-y': scaleY,
    '--book-canvas-offset-x': `${offsetX}px`,
  } as CSSProperties

  return (
    <div style={stretchStyle}>
      <Canvas className="book-canvas" camera={{ fov: 50 }}>
        <ambientLight intensity={1} />
        <directionalLight position={[5, 5, 5]} intensity={1.5} />
        <Suspense fallback={null}>
          <Bounds fit clip observe margin={margin}>
            <RefitOnChange trigger={refitTrigger} />
            <SpellbookModel rotationDeg={{ x, y, z }} onActionsReady={pageTurn.setActions} />
          </Bounds>
        </Suspense>
      </Canvas>
    </div>
  )
})
