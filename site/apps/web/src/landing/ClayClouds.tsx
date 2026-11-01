/**
 * 3D clay clouds drifting across the hero sky, ported from the ListeningKit
 * website (packages/ui/src/components/clay-clouds.tsx). Uses cloud.glb from
 * public/claybound (Claybound's artwork, see PROVENANCE.md there). three.js and
 * the model load lazily and in parallel; the sky stays plain until the scene is
 * ready, and the flat twemoji band shows only if WebGL or the model fails.
 */
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Clouds } from './Clouds'

type Layer = { count: number; z: number; scale: number; speed: number }

const LAYERS: Layer[] = [
  { count: 12, z: -16, scale: 0.75, speed: 0.05 },
  { count: 9, z: -10, scale: 1.0, speed: 0.08 },
  { count: 6, z: -5, scale: 1.35, speed: 0.13 },
  { count: 3, z: -1, scale: 1.9, speed: 0.22 },
]

const DEFAULT_SRC = '/claybound/cloud.glb'
const BOTTOM_FRACTION = 0.63
const CAMERA_Z = 12
const FOV = 30

function loadDeps(src: string) {
  return Promise.all([
    import('three'),
    import('three/examples/jsm/loaders/GLTFLoader.js'),
    import('three/examples/jsm/libs/meshopt_decoder.module.js'),
    import('three/examples/jsm/environments/RoomEnvironment.js'),
    import('@/lib/clayDither'),
    fetch(src).then((r) => {
      if (!r.ok) throw new Error(`cloud model ${r.status}`)
      return r.arrayBuffer()
    }),
  ])
}

function ClaySky({ src = DEFAULT_SRC }: { src?: string }) {
  const hostRef = useRef<HTMLDivElement>(null)
  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    let disposed = false
    let cleanup = () => {}

    void (async () => {
      const [THREE, { GLTFLoader }, { MeshoptDecoder }, { RoomEnvironment }, { applyClayDither }, modelBuffer] = await loadDeps(src)
      if (disposed) return

      let renderer: InstanceType<typeof THREE.WebGLRenderer>
      try {
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' })
      } catch {
        setFailed(true)
        return
      }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
      renderer.outputColorSpace = THREE.SRGBColorSpace
      renderer.toneMapping = THREE.ACESFilmicToneMapping
      renderer.toneMappingExposure = 1.15
      renderer.shadowMap.enabled = true
      renderer.shadowMap.type = THREE.PCFSoftShadowMap
      renderer.domElement.className = 'absolute inset-0 size-full'
      host.appendChild(renderer.domElement)

      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 100)
      camera.position.set(0, 0, CAMERA_Z)
      scene.fog = new THREE.Fog(0x5aa6ff, 16, 34)

      const pmrem = new THREE.PMREMGenerator(renderer)
      const envMap = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
      scene.environment = envMap
      scene.environmentIntensity = 0.55

      scene.add(new THREE.HemisphereLight(0xffffff, 0x6fb2ff, 0.9))
      const key = new THREE.DirectionalLight(0xfff1dc, 2.8)
      key.position.set(-6, 9, 10)
      key.castShadow = true
      key.shadow.mapSize.set(1024, 1024)
      key.shadow.radius = 6
      key.shadow.bias = -0.0005
      key.shadow.normalBias = 0.03
      Object.assign(key.shadow.camera, { left: -28, right: 28, top: 14, bottom: -14, near: 1, far: 60 })
      scene.add(key)
      const fill = new THREE.DirectionalLight(0xa8d1ff, 0.7)
      fill.position.set(8, -2, 6)
      scene.add(fill)
      const rim = new THREE.DirectionalLight(0xe6f3ff, 2.2)
      rim.position.set(2, 4, -12)
      scene.add(rim)

      const loader = new GLTFLoader()
      loader.setMeshoptDecoder(MeshoptDecoder)
      const gltf = await loader.parseAsync(modelBuffer, '')
      if (disposed) {
        renderer.dispose()
        return
      }
      const template = gltf.scene
      const dpr = renderer.getPixelRatio()
      template.traverse((node) => {
        const mesh = node as InstanceType<typeof THREE.Mesh>
        if (!mesh.isMesh) return
        mesh.castShadow = true
        mesh.receiveShadow = true
        applyClayDither(mesh.material as InstanceType<typeof THREE.Material>, {
          cellSize: Math.round(3 * dpr),
          solid: { r: 1, g: 1, b: 1 },
          shade: { r: 0.62, g: 0.8, b: 1 },
          blackPoint: 0.3,
          whitePoint: 0.92,
          key: 'hero-cloud',
        })
      })

      const halfWidthAt = (z: number) => Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * (camera.position.z - z) * camera.aspect
      const halfHeightAt = (z: number) => Math.tan(THREE.MathUtils.degToRad(FOV / 2)) * (CAMERA_Z - z)

      type Cloud = { obj: InstanceType<typeof THREE.Object3D>; layer: Layer; baseY: number; phase: number; spin: number }
      const clouds: Cloud[] = []
      for (const layer of LAYERS) {
        for (let i = 0; i < layer.count; i++) {
          const obj = template.clone(true)
          const s = layer.scale * (0.6 + Math.random() * 0.7)
          obj.scale.set(s, s * (0.8 + Math.random() * 0.3), s)
          obj.rotation.y = (Math.random() - 0.5) * 0.9
          const half = halfHeightAt(layer.z)
          const minY = half - BOTTOM_FRACTION * 2 * half + 0.5 * s
          const maxY = half - 0.55 * s
          const baseY = minY + Math.random() * Math.max(0, maxY - minY)
          obj.position.set(0, baseY, layer.z + (Math.random() - 0.5))
          scene.add(obj)
          clouds.push({ obj, layer, baseY, phase: Math.random() * Math.PI * 2, spin: (Math.random() - 0.5) * 0.08 })
        }
      }

      const resize = () => {
        const { width, height } = host.getBoundingClientRect()
        if (!width || !height) return
        renderer.setSize(width, height, false)
        camera.aspect = width / height
        camera.updateProjectionMatrix()
        for (const layer of LAYERS) {
          const members = clouds.filter((c) => c.layer === layer)
          const span = halfWidthAt(layer.z) * 2 + 3
          members.forEach((c, i) => {
            c.obj.position.x = -span / 2 + (span / members.length) * (i + Math.random() * 0.6)
          })
        }
      }
      resize()
      const ro = new ResizeObserver(resize)
      ro.observe(host)

      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      let visible = true
      const io = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting
      })
      io.observe(host)

      const clock = new THREE.Clock()
      let frame = 0
      const tick = () => {
        frame = requestAnimationFrame(tick)
        if (!visible) {
          clock.getDelta()
          return
        }
        const dt = Math.min(clock.getDelta(), 0.05)
        const t = clock.elapsedTime
        if (!reduceMotion) {
          for (const c of clouds) {
            const edge = halfWidthAt(c.layer.z) + 2
            c.obj.position.x += c.layer.speed * dt
            if (c.obj.position.x > edge) c.obj.position.x = -edge
            c.obj.position.y = c.baseY + Math.sin(t * 0.5 + c.phase) * 0.08
            c.obj.rotation.y += c.spin * dt
          }
        }
        renderer.render(scene, camera)
      }
      await renderer.compileAsync(scene, camera).catch(() => {})
      if (disposed) {
        renderer.dispose()
        renderer.domElement.remove()
        return
      }
      tick()
      setReady(true)

      cleanup = () => {
        cancelAnimationFrame(frame)
        ro.disconnect()
        io.disconnect()
        scene.traverse((node) => {
          ;(node as InstanceType<typeof THREE.Mesh>).geometry?.dispose()
        })
        gltf.scene.traverse((node) => {
          const material = (node as InstanceType<typeof THREE.Mesh>).material as InstanceType<typeof THREE.MeshStandardMaterial> | undefined
          if (!material) return
          for (const tex of [material.map, material.normalMap, material.roughnessMap, material.metalnessMap]) tex?.dispose()
          material.dispose()
        })
        envMap.dispose()
        pmrem.dispose()
        renderer.dispose()
        renderer.domElement.remove()
      }
    })().catch(() => {
      if (!disposed) setFailed(true)
    })

    return () => {
      disposed = true
      cleanup()
    }
  }, [src])

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      {failed ? <Clouds className="absolute inset-0" /> : null}
      <div ref={hostRef} className={`absolute inset-0 transition-opacity duration-300 ${ready ? 'opacity-100' : 'opacity-0'}`} />
    </div>
  )
}

export function ClayClouds({ children, className = 'h-[40rem]' }: { children?: ReactNode; className?: string }) {
  return (
    <div className={`relative w-full overflow-hidden ${className}`}>
      <ClaySky />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[3]"
        style={{ background: 'linear-gradient(to right, #2a8cff 0%, transparent 12%, transparent 88%, #2a8cff 100%)' }}
      />
      {children ? <div className="absolute inset-0 z-10 flex items-center justify-center">{children}</div> : null}
    </div>
  )
}
