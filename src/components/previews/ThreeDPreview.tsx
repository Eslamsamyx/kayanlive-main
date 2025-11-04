'use client';

import React, { Suspense, useState, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Center, Bounds, Environment, useGLTF, Grid } from '@react-three/drei';
import {
  Download,
  RotateCw,
  Grid3x3,
  Maximize,
  Maximize2,
  Minimize2,
  Sun,
  Moon,
  Sunrise,
  Sunset,
  Info,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';

interface ThreeDPreviewProps {
  fileUrl: string;
  fileName: string;
  onDownload?: () => void;
}

type CameraPreset = 'default' | 'front' | 'top' | 'isometric';
type LightingMode = 'studio' | 'sunset' | 'dawn' | 'night';

function Model({ url, wireframe }: { url: string; wireframe: boolean }) {
  const { scene } = useGLTF(url);
  const modelRef = useRef<THREE.Group>(null);

  useEffect(() => {
    if (scene) {
      scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.material.wireframe = wireframe;
        }
      });
    }
  }, [scene, wireframe]);

  return (
    <group ref={modelRef}>
      <Center>
        <primitive object={scene} scale={[0.5, 0.5, 0.5]} />
      </Center>
    </group>
  );
}

function LoadingProgress() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#7afdd6" wireframe />
    </mesh>
  );
}

export function ThreeDPreview({ fileUrl, fileName, onDownload }: ThreeDPreviewProps) {
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('default');
  const [lightingMode, setLightingMode] = useState<LightingMode>('studio');
  const [wireframe, setWireframe] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [autoRotate, setAutoRotate] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const controlsRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Validate fileUrl
  if (!fileUrl || fileUrl === '') {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-[#0a0a0a] via-[#1a1a19] to-[#0a0a0a] text-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-8 bg-[#2c2c2b]/80 backdrop-blur-xl rounded-2xl border border-[#333]"
        >
          <div className="text-red-400 text-xl mb-3">Failed to load 3D model</div>
          <div className="text-[#b2b2b2] text-sm mb-6 max-w-md">
            No file URL available. The file path may be missing.
          </div>
          {onDownload && (
            <button
              onClick={onDownload}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#7afdd6] to-[#6ce7c3] text-[#1a1a19] font-semibold hover:shadow-lg hover:shadow-[#7afdd6]/30 transition-all"
            >
              <Download className="w-5 h-5" />
              Try Download
            </button>
          )}
        </motion.div>
      </div>
    );
  }

  const cameraPositions: Record<CameraPreset, [number, number, number]> = {
    default: [5, 5, 5],
    front: [0, 0, 8],
    top: [0, 8, 0],
    isometric: [7, 7, 7],
  };

  const handleCameraChange = (preset: CameraPreset) => {
    setCameraPreset(preset);
    if (controlsRef.current) {
      const position = cameraPositions[preset];
      controlsRef.current.object.position.set(...position);
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
    }
  };

  const lightingIcons: Record<LightingMode, React.ReactNode> = {
    studio: <Sun className="w-4 h-4" />,
    sunset: <Sunset className="w-4 h-4" />,
    dawn: <Sunrise className="w-4 h-4" />,
    night: <Moon className="w-4 h-4" />,
  };

  // Check WebGL support
  useEffect(() => {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) {
      setError('WebGL is not supported in your browser. 3D preview requires WebGL.');
    }
  }, []);

  // Fullscreen functionality
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;

    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error('Error toggling fullscreen:', error);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'i' || e.key === 'I') {
        e.preventDefault();
        setShowInfo(!showInfo);
      } else if (e.key === 'g' || e.key === 'G') {
        e.preventDefault();
        setShowGrid(!showGrid);
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        setAutoRotate(!autoRotate);
      } else if (e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        setWireframe(!wireframe);
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        toggleFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [showInfo, showGrid, autoRotate, wireframe]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-[#0a0a0a] via-[#1a1a19] to-[#0a0a0a] text-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-8 bg-[#2c2c2b]/80 backdrop-blur-xl rounded-2xl border border-[#333]"
        >
          <div className="text-red-400 text-xl mb-3">3D Preview Not Available</div>
          <div className="text-[#b2b2b2] text-sm mb-6 max-w-md">{error}</div>
          {onDownload && (
            <button
              onClick={onDownload}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#7afdd6] to-[#6ce7c3] text-[#1a1a19] font-semibold hover:shadow-lg hover:shadow-[#7afdd6]/30 transition-all"
            >
              <Download className="w-5 h-5" />
              Download Model
            </button>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative h-full bg-gradient-to-br from-[#0a0a0a] via-[#1a1a19] to-[#0a0a0a]">
      {/* Top gradient overlay */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/60 to-transparent pointer-events-none z-10" />

      {/* Bottom gradient overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/60 to-transparent pointer-events-none z-10" />

      {/* Toolbar */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 bg-[#2c2c2b]/90 backdrop-blur-xl rounded-xl p-2 border border-[#333]/50 shadow-2xl">
          {/* Camera Presets */}
          <div className="flex items-center gap-1 bg-[#1a1a19]/80 rounded-lg p-1">
            {(['default', 'front', 'top', 'isometric'] as CameraPreset[]).map((preset) => (
              <button
                key={preset}
                onClick={() => handleCameraChange(preset)}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
                  cameraPreset === preset
                    ? 'bg-[#7afdd6] text-[#1a1a19]'
                    : 'text-white hover:bg-[#7afdd6]/20 hover:text-[#7afdd6]'
                }`}
              >
                {preset.charAt(0).toUpperCase() + preset.slice(1)}
              </button>
            ))}
          </div>

          <div className="w-px h-6 bg-[#333]" />

          {/* Lighting Modes */}
          <div className="flex items-center gap-1 bg-[#1a1a19]/80 rounded-lg p-1">
            {(['studio', 'sunset', 'dawn', 'night'] as LightingMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setLightingMode(mode)}
                className={`p-2 rounded transition-all ${
                  lightingMode === mode
                    ? 'bg-[#7afdd6] text-[#1a1a19]'
                    : 'text-white hover:bg-[#7afdd6]/20 hover:text-[#7afdd6]'
                }`}
                title={mode.charAt(0).toUpperCase() + mode.slice(1)}
              >
                {lightingIcons[mode]}
              </button>
            ))}
          </div>

          <div className="w-px h-6 bg-[#333]" />

          {/* View Options */}
          <button
            onClick={() => setWireframe(!wireframe)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              wireframe
                ? 'bg-[#7afdd6] text-[#1a1a19]'
                : 'bg-[#1a1a19]/80 hover:bg-[#7afdd6]/20 hover:text-[#7afdd6] text-white'
            }`}
            title="Toggle wireframe (W)"
          >
            <Maximize className="w-4 h-4" />
            <span className="hidden sm:inline">Wireframe</span>
          </button>

          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              showGrid
                ? 'bg-[#7afdd6] text-[#1a1a19]'
                : 'bg-[#1a1a19]/80 hover:bg-[#7afdd6]/20 hover:text-[#7afdd6] text-white'
            }`}
            title="Toggle grid (G)"
          >
            <Grid3x3 className="w-4 h-4" />
            <span className="hidden sm:inline">Grid</span>
          </button>

          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              autoRotate
                ? 'bg-[#7afdd6] text-[#1a1a19]'
                : 'bg-[#1a1a19]/80 hover:bg-[#7afdd6]/20 hover:text-[#7afdd6] text-white'
            }`}
            title="Auto-rotate (R)"
          >
            <RotateCw className="w-4 h-4" />
            <span className="hidden sm:inline">Rotate</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleFullscreen}
            className={`p-2.5 rounded-xl ${
              isFullscreen ? 'bg-[#7afdd6] text-[#1a1a19]' : 'bg-[#2c2c2b]/90 text-white hover:bg-[#7afdd6]/20 hover:text-[#7afdd6]'
            } backdrop-blur-xl border border-[#333]/50 shadow-2xl transition-all`}
            aria-label="Toggle fullscreen"
            title={isFullscreen ? 'Exit fullscreen (F)' : 'Enter fullscreen (F)'}
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>

          <button
            onClick={() => setShowInfo(!showInfo)}
            className={`p-2.5 rounded-xl ${
              showInfo ? 'bg-[#7afdd6] text-[#1a1a19]' : 'bg-[#2c2c2b]/90 text-white hover:bg-[#7afdd6]/20 hover:text-[#7afdd6]'
            } backdrop-blur-xl border border-[#333]/50 shadow-2xl transition-all`}
            aria-label="Toggle info"
            title="Toggle info (I)"
          >
            <Info className="w-5 h-5" />
          </button>

          {onDownload && (
            <button
              onClick={onDownload}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#7afdd6] to-[#6ce7c3] text-[#1a1a19] font-semibold hover:shadow-lg hover:shadow-[#7afdd6]/30 transition-all border border-[#7afdd6]/20"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Download</span>
            </button>
          )}
        </div>
      </div>

      {/* Info Panel */}
      <AnimatePresence>
        {showInfo && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
            className="absolute top-24 right-4 z-20 bg-[#2c2c2b]/95 backdrop-blur-xl rounded-xl p-4 border border-[#333]/50 shadow-2xl min-w-[220px]"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[#7afdd6] font-semibold text-sm">3D Model Info</h3>
              <button
                onClick={() => setShowInfo(false)}
                className="p-1 rounded-lg hover:bg-[#1a1a19] text-[#b2b2b2] hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[#b2b2b2]">Camera:</span>
                <span className="text-white font-medium capitalize">{cameraPreset}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#b2b2b2]">Lighting:</span>
                <span className="text-white font-medium capitalize">{lightingMode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#b2b2b2]">Wireframe:</span>
                <span className="text-white font-medium">{wireframe ? 'On' : 'Off'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#b2b2b2]">Grid:</span>
                <span className="text-white font-medium">{showGrid ? 'On' : 'Off'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#b2b2b2]">Auto-Rotate:</span>
                <span className="text-white font-medium">{autoRotate ? 'On' : 'Off'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#b2b2b2]">Fullscreen:</span>
                <span className="text-white font-medium">{isFullscreen ? 'On' : 'Off'}</span>
              </div>
              <div className="pt-2 border-t border-[#333]">
                <div className="text-[#b2b2b2] text-xs truncate" title={fileName}>
                  {fileName}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3D Canvas */}
      <div className="absolute inset-0">
        <Canvas
          camera={{ position: cameraPositions[cameraPreset], fov: 50 }}
          gl={{ preserveDrawingBuffer: true, antialias: true }}
          onCreated={({ gl }) => {
            gl.setClearColor('#000000');
          }}
        >
          <Suspense fallback={<LoadingProgress />}>
            {/* Lighting */}
            <ambientLight intensity={0.5} />
            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
            <pointLight position={[-10, -10, -10]} intensity={0.5} />

            {/* Environment */}
            <Environment preset={lightingMode} background blur={0.6} />

            {/* Grid */}
            {showGrid && (
              <Grid
                args={[20, 20]}
                cellSize={0.5}
                cellThickness={0.5}
                cellColor="#333"
                sectionSize={2}
                sectionThickness={1}
                sectionColor="#7afdd6"
                fadeDistance={30}
                fadeStrength={1}
                followCamera={false}
              />
            )}

            {/* Model */}
            <Bounds fit clip observe margin={1.2}>
              <Model url={fileUrl} wireframe={wireframe} />
            </Bounds>

            {/* Controls */}
            <OrbitControls
              ref={controlsRef}
              autoRotate={autoRotate}
              autoRotateSpeed={2}
              enableDamping
              dampingFactor={0.05}
              minDistance={2}
              maxDistance={50}
              makeDefault
            />
          </Suspense>
        </Canvas>
      </div>

      {/* Keyboard Shortcuts Hint */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
        <div className="text-xs text-[#b2b2b2] bg-[#1a1a19]/60 backdrop-blur-sm rounded-full px-4 py-2 border border-[#333]/30">
          <span className="hidden sm:inline">
            <kbd className="px-1.5 py-0.5 bg-[#2c2c2b] rounded text-[#7afdd6] font-mono">Left Click</kbd> Rotate •
            <kbd className="px-1.5 py-0.5 bg-[#2c2c2b] rounded text-[#7afdd6] font-mono mx-1">Right Click</kbd> Pan •
            <kbd className="px-1.5 py-0.5 bg-[#2c2c2b] rounded text-[#7afdd6] font-mono mx-1">Scroll</kbd> Zoom •
            <kbd className="px-1.5 py-0.5 bg-[#2c2c2b] rounded text-[#7afdd6] font-mono mx-1">F</kbd> Fullscreen •
            <kbd className="px-1.5 py-0.5 bg-[#2c2c2b] rounded text-[#7afdd6] font-mono mx-1">I</kbd> Info
          </span>
          <span className="sm:hidden">Touch: One finger rotate • Two fingers zoom & pan</span>
        </div>
      </div>
    </div>
  );
}
