import { Suspense, useEffect, useMemo, type CSSProperties } from 'react'
import { Canvas } from '@react-three/fiber'
import { Bounds, Center, useBounds, useGLTF } from '@react-three/drei'
import { Leva, useControls } from 'leva'
import * as THREE from 'three'
import { MOBILE_QUERY, useMediaQuery } from '../hooks/useMediaQuery'

const MODEL_PATH = '/assets/spellbook_lowpoly_v2.glb'

/** Valeurs trouvees en tatonnant via le panneau Leva. */
const DEFAULT_ROTATION_DEG = { x: -90, y: 0, z: -180 }
const DEFAULT_MARGIN = 0.55

interface SpellbookModelProps {
  rotationDeg: { x: number; y: number; z: number }
}

function SpellbookModel({ rotationDeg }: SpellbookModelProps) {
  const { scene } = useGLTF(MODEL_PATH)
  const rotation: [number, number, number] = [
    THREE.MathUtils.degToRad(rotationDeg.x),
    THREE.MathUtils.degToRad(rotationDeg.y),
    THREE.MathUtils.degToRad(rotationDeg.z),
  ]

  return (
    <group rotation={rotation}>
      <Center>
        <primitive object={scene} />
      </Center>
    </group>
  )
}

/**
 * Force un recadrage de la camera a chaque changement des reglages Leva.
 * `Bounds` ne recadre sinon qu'au montage ou au redimensionnement de la
 * fenetre : une prop comme `margin` qui change seule ne declenche rien.
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
 * Reglages Leva dupliques desktop/mobile : le cadre (--book-frame-*, voir
 * BookSpread.css) change radicalement de forme entre les deux (bande large
 * en mobile vs pleine largeur en desktop), donc la meme marge/rotation
 * d'etirement ne convient jamais aux deux a la fois. Un seul jeu de
 * reglages ecrasait systematiquement l'un des deux formats (constat :
 * livre ecrase en haut en mobile). Toujours le meme modele/scene/canvas,
 * seuls les nombres different selon la largeur d'ecran.
 */
export function BookCanvas() {
  const isMobile = useMediaQuery(MOBILE_QUERY)

  const desktopRotation = useControls('Livre (desktop)', {
    x: { value: DEFAULT_ROTATION_DEG.x, min: -180, max: 180, step: 1 },
    y: { value: DEFAULT_ROTATION_DEG.y, min: -180, max: 180, step: 1 },
    z: { value: DEFAULT_ROTATION_DEG.z, min: -180, max: 180, step: 1 },
    margin: {
      value: DEFAULT_MARGIN,
      min: 0.3,
      max: 3,
      step: 0.05,
      label: 'marge (petit = plus gros)',
    },
  })
  const desktopStretch = useControls('Livre (desktop) - etirement du rendu', {
    scaleX: { value: 1.25, min: 0.3, max: 3, step: 0.01 },
    scaleY: { value: 1, min: 0.3, max: 3, step: 0.01 },
  })

  const mobileRotation = useControls('Livre (mobile)', {
    x: { value: DEFAULT_ROTATION_DEG.x, min: -180, max: 180, step: 1 },
    y: { value: DEFAULT_ROTATION_DEG.y, min: -180, max: 180, step: 1 },
    z: { value: DEFAULT_ROTATION_DEG.z, min: -180, max: 180, step: 1 },
    margin: {
      value: DEFAULT_MARGIN,
      min: 0.3,
      max: 3,
      step: 0.05,
      label: 'marge (petit = plus gros)',
    },
  })
  const mobileStretch = useControls('Livre (mobile) - etirement du rendu', {
    scaleX: { value: 1.25, min: 0.3, max: 3, step: 0.01 },
    scaleY: { value: 1.2, min: 0.3, max: 3, step: 0.01 },
  })

  const { x, y, z, margin } = isMobile ? mobileRotation : desktopRotation
  const { scaleX, scaleY } = isMobile ? mobileStretch : desktopStretch

  // Tableau memoise : un nouveau tableau a chaque rendu relancerait le
  // recadrage de la camera a chaque frappe dans la recherche (App re-rend
  // BookCanvas), pas seulement quand un reglage Leva change. isMobile inclus :
  // le passage desktop/mobile doit aussi redeclencher le recadrage.
  const refitTrigger = useMemo(
    () => [x, y, z, margin, isMobile],
    [x, y, z, margin, isMobile],
  )

  const stretchStyle = {
    width: '100%',
    height: '100%',
    '--book-canvas-scale-x': scaleX,
    '--book-canvas-scale-y': scaleY,
  } as CSSProperties

  return (
    <>
      {/* Panneau Leva : uniquement en dev, comme DevFrame. */}
      <Leva hidden={!import.meta.env.DEV} />
      <div style={stretchStyle}>
        <Canvas className="book-canvas" camera={{ fov: 50 }}>
          <ambientLight intensity={1} />
          <directionalLight position={[5, 5, 5]} intensity={1.5} />
          <Suspense fallback={null}>
            <Bounds fit clip observe margin={margin}>
              <RefitOnChange trigger={refitTrigger} />
              <SpellbookModel rotationDeg={{ x, y, z }} />
            </Bounds>
          </Suspense>
        </Canvas>
      </div>
    </>
  )
}
