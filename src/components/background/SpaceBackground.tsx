'use client'

import { useRef, useMemo, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Points, PointMaterial, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

// Particle stars component
function Stars({ count = 5000 }) {
  const ref = useRef<THREE.Points>(null!)

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      const radius = Math.random() * 50 + 10
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos((Math.random() * 2) - 1)

      pos[i3] = radius * Math.sin(phi) * Math.cos(theta)
      pos[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
      pos[i3 + 2] = radius * Math.cos(phi)
    }
    return pos
  }, [count])

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.x -= delta * 0.05
      ref.current.rotation.y -= delta * 0.03
    }
  })

  return (
    <Points ref={ref} positions={positions} stride={3}>
      <PointMaterial
        transparent
        color="#ffffff"
        size={0.15}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.8}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  )
}

// Vortex tunnel component with custom geometry
function Vortex({ scrollProgress = 0 }: { scrollProgress: number }) {
  const ref = useRef<THREE.Mesh>(null!)
  const materialRef = useRef<THREE.ShaderMaterial>(null!)

  // Custom shader for vortex effect
  const vertexShader = `
    varying vec2 vUv;
    varying vec3 vPosition;

    void main() {
      vUv = uv;
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `

  const fragmentShader = `
    uniform float time;
    uniform float scrollProgress;
    varying vec2 vUv;
    varying vec3 vPosition;

    // Noise function for organic movement
    float noise(vec2 p) {
      return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
    }

    void main() {
      vec2 center = vUv - 0.5;
      float dist = length(center);
      float angle = atan(center.y, center.x);

      // Swirl effect based on distance and time
      float swirl = angle + dist * 5.0 - time * 0.5 - scrollProgress * 2.0;

      // Color gradient from center to edge
      vec3 color1 = vec3(0.357, 0.129, 0.714); // Purple #5b21b6
      vec3 color2 = vec3(0.925, 0.282, 0.6);   // Pink #ec4899
      vec3 color3 = vec3(0.231, 0.51, 0.965);  // Blue #3b82f6

      // Mix colors based on angle and distance
      vec3 color = mix(color1, color2, sin(swirl) * 0.5 + 0.5);
      color = mix(color, color3, dist);

      // Add noise texture
      float n = noise(vUv * 10.0 + time * 0.1);
      color += n * 0.1;

      // Fade out at edges
      float alpha = smoothstep(0.5, 0.0, dist) * 0.6;

      gl_FragColor = vec4(color, alpha);
    }
  `

  const uniforms = useMemo(
    () => ({
      time: { value: 0 },
      scrollProgress: { value: 0 }
    }),
    []
  )

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = state.clock.elapsedTime
      materialRef.current.uniforms.scrollProgress.value = scrollProgress
    }
    if (ref.current) {
      ref.current.rotation.z = state.clock.elapsedTime * 0.1 + scrollProgress * 0.5
    }
  })

  return (
    <mesh ref={ref} position={[0, 0, -20]}>
      <planeGeometry args={[100, 100, 32, 32]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        blending={THREE.AdditiveBlending}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

// Animated nebula clouds
function Nebula() {
  const ref = useRef<THREE.Mesh>(null!)

  useFrame((state) => {
    if (ref.current && ref.current.material instanceof THREE.Material) {
      ref.current.rotation.z = state.clock.elapsedTime * 0.02
      if ('opacity' in ref.current.material) {
        ref.current.material.opacity = Math.sin(state.clock.elapsedTime * 0.5) * 0.1 + 0.15
      }
    }
  })

  return (
    <mesh ref={ref} position={[0, 0, -30]}>
      <sphereGeometry args={[30, 32, 32]} />
      <meshBasicMaterial
        color="#7c3aed"
        transparent
        opacity={0.15}
        blending={THREE.AdditiveBlending}
        side={THREE.BackSide}
      />
    </mesh>
  )
}

// Camera controller that responds to scroll
function CameraController({ scrollProgress }: { scrollProgress: number }) {
  const { camera } = useThree()

  useFrame(() => {
    // Move camera based on scroll
    camera.position.z = 5 - scrollProgress * 10
    camera.lookAt(0, 0, 0)
  })

  return null
}

// Main scene component
function Scene({ scrollProgress }: { scrollProgress: number }) {
  return (
    <>
      <CameraController scrollProgress={scrollProgress} />
      <ambientLight intensity={0.1} />
      <pointLight position={[10, 10, 10]} intensity={0.5} color="#3b82f6" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ec4899" />

      <Stars count={8000} />
      <Vortex scrollProgress={scrollProgress} />
      <Nebula />
    </>
  )
}

// Main component with scroll tracking
export default function SpaceBackground() {
  const containerRef = useRef<HTMLDivElement>(null)
  const scrollProgressRef = useRef(0)
  const frameRef = useRef<number>()

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      scrollProgressRef.current = Math.min(scrollTop / Math.max(docHeight, 1), 1)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -1,
        background: 'linear-gradient(to bottom, #0a0e27 0%, #050816 50%, #1a1f3a 100%)'
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 5], fov: 75 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance'
        }}
      >
        <Scene scrollProgress={scrollProgressRef.current} />
      </Canvas>
    </div>
  )
}
