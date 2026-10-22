import {
  Suspense,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  type CSSProperties,
} from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Bounds, Center, useAnimations, useBounds, useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { MOBILE_QUERY, useMediaQuery } from '../hooks/useMediaQuery'
import { usePageTurnAnimation, type AnimationActions } from '../hooks/usePageTurnAnimation'

const MODEL_PATH = '/assets/spellbook_lowpoly_v2.glb'

/**
 * Cadrage du livre, un jeu par format.
 * - rotation : orientation du modele, en degres.
 * - margin : marge de cadrage de Bounds (petit = livre plus gros). La changer
 *   impose de reajuster --book-edge-top (App.css, App.mobile.css).
 * - scaleX / scaleY / offsetX : etirement et decalage du rendu (BookSpread.css).
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

/** Tournage de page. Chaque methode retourne la duree de l'animation (s). */
export interface BookCanvasHandle {
  playNext: () => number
  playPrevious: () => number
}

interface SpellbookModelProps {
  rotationDeg: { x: number; y: number; z: number }
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

const SETTLED_FRAMES = 10

/**
 * Signale la fin du deploiement du livre : camera immobile pendant
 * SETTLED_FRAMES images apres l'animation de cadrage de Bounds (~1 s), dont
 * le onFit part au debut et non a la fin. Un seul appel.
 */
function SettledSignal({ onSettled }: { onSettled?: () => void }) {
  const last = useRef<{ position: THREE.Vector3; quaternion: THREE.Quaternion } | null>(null)
  const stillFrames = useRef(0)
  const done = useRef(false)

  useFrame(({ camera }) => {
    if (done.current) return
    const previous = last.current
    if (
      previous &&
      previous.position.equals(camera.position) &&
      previous.quaternion.equals(camera.quaternion)
    ) {
      stillFrames.current += 1
    } else {
      stillFrames.current = 0
    }
    last.current = { position: camera.position.clone(), quaternion: camera.quaternion.clone() }
    if (stillFrames.current >= SETTLED_FRAMES) {
      done.current = true
      onSettled?.()
    }
  })

  return null
}

/** Recadre au passage desktop / mobile : Bounds ignore un changement de `margin` seul. */
function RefitOnChange({ trigger }: { trigger: unknown }) {
  const bounds = useBounds()
  useEffect(() => {
    bounds.refresh().fit()
  }, [trigger, bounds])
  return null
}

interface BookCanvasProps {
  /** Livre deploye : modele charge et camera immobile. */
  onReady?: () => void
}

/**
 * Fond 3D du grimoire. Bounds cadre la camera sur le modele : seules la
 * rotation et la marge de cadrage ont un effet visible.
 */
export const BookCanvas = forwardRef<BookCanvasHandle, BookCanvasProps>(function BookCanvas(
  { onReady },
  ref,
) {
  const isMobile = useMediaQuery(MOBILE_QUERY)
  const pageTurn = usePageTurnAnimation()

  const { rotation, margin, scaleX, scaleY, offsetX } = isMobile
    ? MOBILE_SETTINGS
    : DESKTOP_SETTINGS
  const { x, y, z } = rotation

  // Memoise : un nouveau tableau a chaque rendu relancerait le recadrage.
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
            <SpellbookModel
              rotationDeg={{ x, y, z }}
              onActionsReady={pageTurn.setActions}
            />
            <SettledSignal onSettled={onReady} />
          </Bounds>
        </Suspense>
      </Canvas>
    </div>
  )
})
