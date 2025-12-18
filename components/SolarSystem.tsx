
import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Line2 } from 'three/addons/lines/Line2.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { PLANETS, SUN_DATA } from '../constants';
import { ViewMode } from '../types';

interface SolarSystemProps {
  selectedPlanetId: string | null;
  onPlanetClick: (id: string | null) => void;
  simDays: number;
  showLabels: boolean;
  showStars: boolean;
  showSunFlare: boolean;
  useRealScale: boolean;
  viewMode: ViewMode;
}

const DEG_TO_RAD = Math.PI / 180;

// Shaders
const atmosphereVertexShader = `
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying vec3 vWorldPosition;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = -mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const sunCoronaFragmentShader = `
  uniform vec3 color;
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  void main() {
    float intensity = pow(0.6 - dot(vNormal, normalize(vViewPosition)), 2.0);
    gl_FragColor = vec4(color, intensity * 0.8);
  }
`;

const atmosphereFragmentShader = `
  uniform vec3 color;
  uniform vec3 sunPosition;
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying vec3 vWorldPosition;
  void main() {
    vec3 viewDir = normalize(vViewPosition);
    float fresnel = pow(1.0 - dot(vNormal, viewDir), 3.0);
    vec3 lightDir = normalize(sunPosition - vWorldPosition);
    float sunIntensity = smoothstep(-0.4, 0.4, dot(vNormal, lightDir));
    gl_FragColor = vec4(color, fresnel * sunIntensity * 0.8);
  }
`;

const haloFragmentShader = `
  uniform vec3 color;
  uniform vec3 sunPosition;
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying vec3 vWorldPosition;
  void main() {
    float intensity = pow(0.7 - dot(vNormal, normalize(vViewPosition)), 5.0);
    vec3 lightDir = normalize(sunPosition - vWorldPosition);
    float sunIntensity = smoothstep(-0.2, 0.6, dot(vNormal, lightDir));
    gl_FragColor = vec4(color, intensity * sunIntensity * 1.5);
  }
`;

export interface SolarSystemHandle {
  captureScreenshot: () => string | null;
  zoomIn: () => void;
  zoomOut: () => void;
}

const SolarSystem = forwardRef<SolarSystemHandle, SolarSystemProps>(({
  selectedPlanetId,
  onPlanetClick,
  simDays,
  showLabels,
  showStars,
  showSunFlare,
  useRealScale,
  viewMode
}, ref) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const composerRef = useRef<EffectComposer | null>(null);
  const bloomPassRef = useRef<UnrealBloomPass | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const starsRef = useRef<THREE.Points | null>(null);
  const sunCoronaRef = useRef<THREE.Mesh | null>(null);
  
  const simDaysRef = useRef(simDays);
  const showLabelsRef = useRef(showLabels);
  const showStarsRef = useRef(showStars);
  const useRealScaleRef = useRef(useRealScale);
  const selectedPlanetIdRef = useRef(selectedPlanetId);
  const viewModeRef = useRef(viewMode);
  
  const hoveredOrbitIdRef = useRef<string | null>(null);
  const hoveredPlanetIdRef = useRef<string | null>(null);

  useImperativeHandle(ref, () => ({
    captureScreenshot: () => {
      if (!rendererRef.current || !sceneRef.current || !composerRef.current) return null;
      composerRef.current.render();
      return rendererRef.current.domElement.toDataURL('image/png');
    },
    zoomIn: () => {
      if (controlsRef.current) {
        controlsRef.current.dollyIn(1.25);
        controlsRef.current.update();
      }
    },
    zoomOut: () => {
      if (controlsRef.current) {
        controlsRef.current.dollyOut(1.25);
        controlsRef.current.update();
      }
    }
  }));

  useEffect(() => { simDaysRef.current = simDays; }, [simDays]);
  useEffect(() => { showLabelsRef.current = showLabels; }, [showLabels]);
  useEffect(() => { 
    showStarsRef.current = showStars;
    if (starsRef.current) starsRef.current.visible = showStars;
  }, [showStars]);
  useEffect(() => { 
    if (sunCoronaRef.current) sunCoronaRef.current.visible = showSunFlare;
    if (bloomPassRef.current) bloomPassRef.current.strength = showSunFlare ? 2.0 : 0.6;
  }, [showSunFlare]);
  useEffect(() => { useRealScaleRef.current = useRealScale; }, [useRealScale]);
  useEffect(() => { selectedPlanetIdRef.current = selectedPlanetId; }, [selectedPlanetId]);
  useEffect(() => { viewModeRef.current = viewMode; }, [viewMode]);

  const getScaledDistance = (au: number, isReal: boolean) => {
    if (isReal) return au * 1200; 
    return 80 + Math.pow(au, 0.65) * 150;
  };

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x000001);

    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000000);
    camera.position.set(200, 300, 600);

    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      logarithmicDepthBuffer: true,
      powerPreference: "high-performance",
      preserveDrawingBuffer: true 
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    rendererRef.current = renderer;
    mountRef.current.appendChild(renderer.domElement);

    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      showSunFlare ? 2.0 : 0.6,
      0.5,
      0.7
    );
    composer.addPass(bloomPass);
    composerRef.current = composer;
    bloomPassRef.current = bloomPass;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxDistance = 900000;
    controls.minDistance = 5;
    controlsRef.current = controls;

    const textureLoader = new THREE.TextureLoader();

    scene.add(new THREE.AmbientLight(0xffffff, 0.1));
    const sunLight = new THREE.PointLight(0xffffff, 80, 0, 1);
    scene.add(sunLight);

    const sunTex = textureLoader.load(SUN_DATA.textureUrl);
    const sun = new THREE.Mesh(
      new THREE.SphereGeometry(SUN_DATA.radius, 128, 128),
      new THREE.MeshStandardMaterial({ 
        emissive: SUN_DATA.color, 
        emissiveIntensity: 12.0, 
        map: sunTex, 
        emissiveMap: sunTex 
      })
    );
    scene.add(sun);

    const coronaGeo = new THREE.SphereGeometry(SUN_DATA.radius * 1.3, 64, 64);
    const coronaMat = new THREE.ShaderMaterial({
      uniforms: { color: { value: new THREE.Color(0xffaa00) } },
      vertexShader: atmosphereVertexShader,
      fragmentShader: sunCoronaFragmentShader,
      side: THREE.BackSide,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const corona = new THREE.Mesh(coronaGeo, coronaMat);
    corona.visible = showSunFlare;
    sun.add(corona);
    sunCoronaRef.current = corona;

    const starCount = 60000;
    const starPos = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const idx = i * 3;
      const r = 150000 + Math.random() * 400000;
      const th = 2 * Math.PI * Math.random();
      const ph = Math.acos(2 * Math.random() - 1);
      starPos[idx] = r * Math.sin(ph) * Math.cos(th);
      starPos[idx + 1] = r * Math.sin(ph) * Math.sin(th);
      starPos[idx + 2] = r * Math.cos(ph);
      const l = 0.4 + Math.random() * 0.6;
      starColors[idx] = l; starColors[idx+1] = l; starColors[idx+2] = l + 0.1;
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
    const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ size: 2.8, vertexColors: true, transparent: true, opacity: 0.8 }));
    stars.visible = showStarsRef.current;
    scene.add(stars);
    starsRef.current = stars;

    const planetsMap = new Map<string, THREE.Mesh>();
    const orbitsMap = new Map<string, Line2>();
    const labelsMap = new Map<string, THREE.Sprite>();

    PLANETS.forEach(planet => {
      const pMesh = new THREE.Mesh(
        new THREE.SphereGeometry(planet.radius, 64, 64),
        new THREE.MeshStandardMaterial({ 
          map: textureLoader.load(planet.textureUrl), 
          roughness: 0.9, metalness: 0.1,
          emissive: new THREE.Color(planet.color),
          emissiveIntensity: 0.05
        })
      );
      pMesh.userData = { id: planet.id, type: 'planet' };
      scene.add(pMesh);
      planetsMap.set(planet.id, pMesh);

      if (planet.atmosphereColor) {
        const atmosColor = new THREE.Color(planet.atmosphereColor);
        const hazeGeo = new THREE.SphereGeometry(planet.radius * 1.02, 64, 64);
        const hazeMat = new THREE.ShaderMaterial({
          uniforms: { color: { value: atmosColor }, sunPosition: { value: new THREE.Vector3(0, 0, 0) } },
          vertexShader: atmosphereVertexShader, fragmentShader: atmosphereFragmentShader,
          transparent: true, blending: THREE.AdditiveBlending, side: THREE.FrontSide, depthWrite: false
        });
        pMesh.add(new THREE.Mesh(hazeGeo, hazeMat));

        const haloGeo = new THREE.SphereGeometry(planet.radius * 1.15, 64, 64);
        const haloMat = new THREE.ShaderMaterial({
          uniforms: { color: { value: atmosColor }, sunPosition: { value: new THREE.Vector3(0, 0, 0) } },
          vertexShader: atmosphereVertexShader, fragmentShader: haloFragmentShader,
          transparent: true, blending: THREE.AdditiveBlending, side: THREE.BackSide, depthWrite: false
        });
        pMesh.add(new THREE.Mesh(haloGeo, haloMat));
      }

      const orbitGeo = new LineGeometry();
      const orbitMat = new LineMaterial({ 
        color: new THREE.Color(0x444466).getHex(), 
        linewidth: 1, transparent: true, opacity: 0.15,
        resolution: new THREE.Vector2(window.innerWidth, window.innerHeight)
      });
      const orbitLine = new Line2(orbitGeo, orbitMat);
      orbitLine.userData = { id: planet.id, type: 'orbit' };
      scene.add(orbitLine);
      orbitsMap.set(planet.id, orbitLine);

      const canvas = document.createElement('canvas');
      canvas.width = 300; canvas.height = 80;
      const ctx = canvas.getContext('2d')!;
      ctx.font = 'bold 32px Inter'; ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.textAlign = 'center';
      ctx.shadowColor = 'rgba(0,0,0,1)'; ctx.shadowBlur = 8;
      ctx.fillText(planet.name.toUpperCase(), 150, 50);
      const label = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(canvas), transparent: true, depthTest: false }));
      label.scale.set(12, 3.2, 1);
      scene.add(label);
      labelsMap.set(planet.id, label);

      if (planet.hasRings && planet.ringTextureUrl) {
        const ring = new THREE.Mesh(
          new THREE.RingGeometry(planet.radius * 1.6, planet.radius * 3.6, 128),
          new THREE.MeshBasicMaterial({ map: textureLoader.load(planet.ringTextureUrl), side: THREE.DoubleSide, transparent: true, opacity: 0.8 })
        );
        ring.rotation.x = Math.PI / 2.2;
        pMesh.add(ring);
      }
    });

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onMouseDown = (e: MouseEvent) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(scene.children, true);
      const planetHit = hits.find(h => h.object.userData.type === 'planet');
      if (planetHit) { onPlanetClick(planetHit.object.userData.id); return; }
      const orbitHit = hits.find(h => h.object.userData.type === 'orbit');
      if (orbitHit) { onPlanetClick(orbitHit.object.userData.id); return; }
      onPlanetClick(null);
    };

    const onMouseMove = (e: MouseEvent) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(scene.children, true);
      const orbitHit = hits.find(h => h.object.userData.type === 'orbit');
      const planetHit = hits.find(h => h.object.userData.type === 'planet');
      hoveredOrbitIdRef.current = orbitHit ? orbitHit.object.userData.id : null;
      hoveredPlanetIdRef.current = planetHit ? planetHit.object.userData.id : null;
      if (mountRef.current) mountRef.current.style.cursor = (orbitHit || planetHit) ? 'pointer' : 'default';
    };

    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);

    let lastScale: boolean | null = null;

    const animate = () => {
      requestRef.current = requestAnimationFrame(animate);
      const d = simDaysRef.current;
      const T = d / 36525.0; 
      const isReal = useRealScaleRef.current;
      const selectedId = selectedPlanetIdRef.current;

      PLANETS.forEach(planet => {
        const pMesh = planetsMap.get(planet.id);
        const orbitLine = orbitsMap.get(planet.id);
        const label = labelsMap.get(planet.id);
        if (!pMesh || !orbitLine || !label) return;

        const { elements } = planet;
        const a = elements.a + (elements.a_rate || 0) * T;
        const e = elements.e + (elements.e_rate || 0) * T;
        const i = (elements.i + (elements.i_rate || 0) * T) * DEG_TO_RAD;
        const L = (elements.L + (elements.L_rate || 0) * T) * DEG_TO_RAD;
        const lp = (elements.longPeri + (elements.longPeri_rate || 0) * T) * DEG_TO_RAD;
        const ln = (elements.longNode + (elements.longNode_rate || 0) * T) * DEG_TO_RAD;
        const M = L - lp;
        const w = lp - ln;
        let E = M;
        for(let n = 0; n < 6; n++) E = M + e * Math.sin(E);
        const x_p = a * (Math.cos(E) - e);
        const y_p = a * (Math.sqrt(Math.max(0, 1 - e * e)) * Math.sin(E));
        const x = (Math.cos(w)*Math.cos(ln) - Math.sin(w)*Math.sin(ln)*Math.cos(i)) * x_p + (-Math.sin(w)*Math.cos(ln) - Math.cos(w)*Math.sin(ln)*Math.cos(i)) * y_p;
        const y = (Math.cos(w)*Math.sin(ln) + Math.sin(w)*Math.cos(ln)*Math.cos(i)) * x_p + (-Math.sin(w)*Math.sin(ln) + Math.cos(w)*Math.cos(ln)*Math.cos(i)) * y_p;
        const z = (Math.sin(w)*Math.sin(i)) * x_p + (Math.cos(w)*Math.sin(i)) * y_p;
        const distScale = (val: number) => getScaledDistance(val, isReal);
        const actualR = Math.sqrt(x*x + y*y + z*z);
        const displayR = distScale(actualR);
        pMesh.position.set((x/actualR)*displayR, (z/actualR)*displayR, -(y/actualR)*displayR);
        pMesh.rotation.y += planet.rotationSpeed * 0.015;

        const mat = pMesh.material as THREE.MeshStandardMaterial;
        const isPlanetHovered = hoveredPlanetIdRef.current === planet.id;
        const isPlanetSelected = selectedId === planet.id;
        const targetIntensity = isPlanetSelected ? 1.0 : (isPlanetHovered ? 0.8 : 0.05);
        const targetEmissiveColor = new THREE.Color(planet.color);
        if (isPlanetSelected) targetEmissiveColor.multiplyScalar(1.2);
        else if (isPlanetHovered) targetEmissiveColor.multiplyScalar(2.0);
        else targetEmissiveColor.multiplyScalar(0.4);
        mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, targetIntensity, 0.1);
        mat.emissive.lerp(targetEmissiveColor, 0.1);
        const targetScaleVal = (isPlanetSelected || isPlanetHovered) ? 1.15 : 1.0;
        pMesh.scale.lerp(new THREE.Vector3(targetScaleVal, targetScaleVal, targetScaleVal), 0.1);

        label.position.copy(pMesh.position).add(new THREE.Vector3(0, planet.radius * 1.5 + 8, 0));
        label.visible = showLabelsRef.current;

        if (lastScale !== isReal) {
          const pts = [];
          for (let step = 0; step <= 180; step++) {
            const angle = (step / 180) * Math.PI * 2;
            let E_o = angle; for(let n = 0; n < 4; n++) E_o = angle + e * Math.sin(E_o);
            const xp_o = a * (Math.cos(E_o) - e);
            const yp_o = a * (Math.sqrt(Math.max(0, 1 - e * e)) * Math.sin(E_o));
            const xo = (Math.cos(w)*Math.cos(ln) - Math.sin(w)*Math.sin(ln)*Math.cos(i)) * xp_o + (-Math.sin(w)*Math.cos(ln) - Math.cos(w)*Math.sin(ln)*Math.cos(i)) * yp_o;
            const yo = (Math.cos(w)*Math.sin(ln) + Math.sin(w)*Math.cos(ln)*Math.cos(i)) * xp_o + (-Math.sin(w)*Math.sin(ln) + Math.cos(w)*Math.cos(ln)*Math.cos(i)) * yp_o;
            const zo = (Math.sin(w)*Math.sin(i)) * xp_o + (Math.cos(w)*Math.sin(i)) * yp_o;
            const r_o = Math.sqrt(xo*xo + yo*yo + zo*zo);
            const dr_o = distScale(r_o);
            pts.push((xo/r_o)*dr_o, (zo/r_o)*dr_o, -(yo/r_o)*dr_o);
          }
          orbitLine.geometry.setPositions(pts);
        }
        const isOrbitHovered = hoveredOrbitIdRef.current === planet.id;
        const isOrbitSelected = selectedId === planet.id;
        const orbitMat = orbitLine.material as LineMaterial;
        orbitMat.opacity = isOrbitSelected ? 0.9 : (isOrbitHovered ? 0.6 : 0.15);
        orbitMat.color.set(isOrbitSelected ? 0x88ccff : 0x444466);
        orbitMat.linewidth = isOrbitSelected ? 2.5 : (isOrbitHovered ? 2.5 : 1);
      });

      lastScale = isReal;
      if (selectedId && viewModeRef.current === ViewMode.Focus) {
        const targetMesh = planetsMap.get(selectedId);
        if (targetMesh) controls.target.lerp(targetMesh.position, 0.08);
      } else {
        controls.target.lerp(new THREE.Vector3(0, 0, 0), 0.04);
      }
      controls.update();
      composerRef.current?.render();
    };

    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      composerRef.current?.setSize(window.innerWidth, window.innerHeight);
      orbitsMap.forEach(o => (o.material as LineMaterial).resolution.set(window.innerWidth, window.innerHeight));
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(requestRef.current!);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, [onPlanetClick]);

  return <div ref={mountRef} className="w-full h-full" />;
});

export default SolarSystem;
