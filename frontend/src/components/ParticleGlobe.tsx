'use client';

import { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';

interface ParticleGlobeProps {
  className?: string;
}

const PARTICLE_COUNT = 3200;
const SPHERE_RADIUS = 5;
const CONNECTION_DISTANCE = 1.2;
const MAX_CONNECTIONS = 150;

export default function ParticleGlobe({ className }: ParticleGlobeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    mouseRef.current.x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    mouseRef.current.y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.z = 10;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Create particles
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const colors = new Float32Array(PARTICLE_COUNT * 3);
    const colorOptions = [
      new THREE.Color('#22d3ee'), // cyan
      new THREE.Color('#3b82f6'), // blue
      new THREE.Color('#7c3aed'), // violet
    ];

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // Sphere distribution
      const phi = Math.acos(2 * Math.random() - 1);
      const theta = Math.random() * Math.PI * 2;
      const r = SPHERE_RADIUS * Math.cbrt(Math.random());

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);

      const color = colorOptions[Math.floor(Math.random() * colorOptions.length)];
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.04,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(geometry, particleMaterial);
    scene.add(particles);

    // Connection lines
    const linePositions = new Float32Array(MAX_CONNECTIONS * 6); // 2 vertices per line, 3 coords each
    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));

    const lineMaterial = new THREE.LineBasicMaterial({
      color: '#22d3ee',
      transparent: true,
      opacity: 0.15,
      blending: THREE.AdditiveBlending,
    });

    const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(lines);

    // Animation
    let animationId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Rotate particles
      particles.rotation.y = elapsed * 0.1;
      particles.rotation.x = Math.sin(elapsed * 0.05) * 0.1;

      // Mouse parallax
      const targetX = mouseRef.current.x * 0.5;
      const targetY = -mouseRef.current.y * 0.5;
      camera.position.x += (targetX - camera.position.x) * 0.05;
      camera.position.y += (targetY - camera.position.y) * 0.05;
      camera.lookAt(scene.position);

      // Update connection lines
      const pos = geometry.attributes.position.array as Float32Array;
      let lineCount = 0;

      // Sample subset for connections (performance)
      const sampleSize = 200;
      const indices = Array.from({ length: PARTICLE_COUNT }, (_, i) => i);
      const shuffled = indices.sort(() => Math.random() - 0.5).slice(0, sampleSize);

      for (let i = 0; i < shuffled.length && lineCount < MAX_CONNECTIONS; i++) {
        for (let j = i + 1; j < shuffled.length && lineCount < MAX_CONNECTIONS; j++) {
          const idx1 = shuffled[i];
          const idx2 = shuffled[j];

          const x1 = pos[idx1 * 3], y1 = pos[idx1 * 3 + 1], z1 = pos[idx1 * 3 + 2];
          const x2 = pos[idx2 * 3], y2 = pos[idx2 * 3 + 1], z2 = pos[idx2 * 3 + 2];

          const dist = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2 + (z2 - z1) ** 2);

          if (dist < CONNECTION_DISTANCE) {
            const lineIdx = lineCount * 6;
            linePositions[lineIdx] = x1;
            linePositions[lineIdx + 1] = y1;
            linePositions[lineIdx + 2] = z1;
            linePositions[lineIdx + 3] = x2;
            linePositions[lineIdx + 4] = y2;
            linePositions[lineIdx + 5] = z2;
            lineCount++;
          }
        }
      }

      // Clear unused lines
      for (let i = lineCount * 6; i < MAX_CONNECTIONS * 6; i++) {
        linePositions[i] = 0;
      }

      lineGeometry.attributes.position.needsUpdate = true;
      lines.rotation.copy(particles.rotation);

      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      container.removeChild(renderer.domElement);
      geometry.dispose();
      lineGeometry.dispose();
      particleMaterial.dispose();
      lineMaterial.dispose();
      renderer.dispose();
    };
  }, [handleMouseMove]);

  return <div ref={containerRef} className={className} />;
}
