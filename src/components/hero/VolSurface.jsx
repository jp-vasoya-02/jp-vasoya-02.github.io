import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  DynamicDrawUsage,
  Matrix4,
  Plane,
  Ray,
  Raycaster,
  ShaderMaterial,
  Vector2,
  Vector3,
} from "three";
import useReducedMotion from "../../hooks/useReducedMotion";
import "./VolSurface.css";

/*
 * An animated implied-volatility surface: sigma(strike, expiry).
 * x = moneyness (strike), z = time to expiry, y = implied vol.
 * Base shape = smile + put skew + term structure, plus slow "live" noise
 * and click ripples. Positions live in one Float32Array shared by a
 * Points cloud and a LineSegments wireframe, updated once per frame.
 */

const WIDTH = 15; // strike axis (world units)
const DEPTH = 9; // expiry axis
const PLANE_Y = 0.7; // reference plane used to place click ripples
const MAX_RIPPLES = 5;
const RIPPLE_LIFE = 4.5; // seconds

// sRGB components, written straight to the framebuffer (no colour management in our shaders).
const INDIGO = new Vector3(0x81 / 255, 0x8c / 255, 0xf8 / 255);
const TEAL = new Vector3(0x5e / 255, 0xea / 255, 0xd4 / 255);

function impliedVol(k, t) {
  // k: moneyness in [-1, 1] (puts on the left), t: expiry in [0, 1] (front month near camera)
  const T = 0.06 + t * 0.94;
  const smile = (0.85 * k * k) / Math.sqrt(T + 0.12);
  const skew = (-0.5 * k) / Math.sqrt(T + 0.18);
  const term = 0.32 * T;
  return 0.6 * (0.35 + smile + skew + term);
}

function buildGrid(nx, nz, rowStep, colStep) {
  const count = nx * nz;
  const positions = new Float32Array(count * 3);
  const uvs = new Float32Array(count * 2);
  const base = new Float32Array(count);
  const ks = new Float32Array(count);
  const ts = new Float32Array(count);
  let hMin = Infinity;
  let hMax = -Infinity;

  for (let j = 0; j < nz; j++) {
    const v = j / (nz - 1);
    for (let i = 0; i < nx; i++) {
      const u = i / (nx - 1);
      const idx = j * nx + i;
      const k = u * 2 - 1;
      const t = 1 - v; // v = 1 is closest to the camera -> front month
      const h = impliedVol(k, t);
      base[idx] = h;
      ks[idx] = k;
      ts[idx] = t;
      positions[idx * 3] = (u - 0.5) * WIDTH;
      positions[idx * 3 + 1] = h;
      positions[idx * 3 + 2] = (v - 0.5) * DEPTH;
      uvs[idx * 2] = u;
      uvs[idx * 2 + 1] = v;
      if (h < hMin) hMin = h;
      if (h > hMax) hMax = h;
    }
  }

  // Wireframe: smile slices along the strike axis, sparser term-structure lines along expiry.
  const segments = [];
  for (let j = 0; j < nz; j += rowStep) {
    for (let i = 0; i < nx - 1; i++) segments.push(j * nx + i, j * nx + i + 1);
  }
  for (let i = 0; i < nx; i += colStep) {
    for (let j = 0; j < nz - 1; j++) segments.push(j * nx + i, (j + 1) * nx + i);
  }

  const position = new BufferAttribute(positions, 3);
  position.setUsage(DynamicDrawUsage);
  const uv = new BufferAttribute(uvs, 2);

  const pointsGeo = new BufferGeometry();
  pointsGeo.setAttribute("position", position);
  pointsGeo.setAttribute("aUv", uv);

  const linesGeo = new BufferGeometry();
  linesGeo.setAttribute("position", position);
  linesGeo.setAttribute("aUv", uv);
  linesGeo.setIndex(segments);

  return { count, positions, position, base, ks, ts, hMin, hMax, pointsGeo, linesGeo };
}

const vertexCommon = /* glsl */ `
  attribute vec2 aUv;
  uniform float uHMin;
  uniform float uHMax;
  uniform float uNear;
  uniform float uFar;
  varying float vH;
  varying float vA;

  float fadeAlpha(vec4 mv) {
    float ex = smoothstep(0.0, 0.2, aUv.x) * smoothstep(1.0, 0.8, aUv.x);
    float ez = smoothstep(0.0, 0.28, aUv.y) * smoothstep(1.0, 0.86, aUv.y);
    float depth = smoothstep(uFar, uNear, -mv.z);
    return ex * ez * depth;
  }
`;

const fragmentCommon = /* glsl */ `
  uniform vec3 uLow;
  uniform vec3 uHigh;
  uniform float uOpacity;
  varying float vH;
  varying float vA;

  vec3 ramp(float h) {
    vec3 c = mix(uLow, uHigh, smoothstep(0.05, 0.85, h));
    return mix(c, vec3(1.0), smoothstep(0.82, 1.0, h) * 0.35);
  }
`;

function createMaterials() {
  const shared = {
    uHMin: { value: 0 },
    uHMax: { value: 1 },
    uNear: { value: 8 },
    uFar: { value: 19 },
    uLow: { value: INDIGO },
    uHigh: { value: TEAL },
  };

  const points = new ShaderMaterial({
    uniforms: { ...shared, uOpacity: { value: 0.95 }, uSize: { value: 2.6 }, uDpr: { value: 1 } },
    vertexShader: /* glsl */ `
      ${vertexCommon}
      uniform float uSize;
      uniform float uDpr;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = uSize * uDpr * (10.0 / -mv.z);
        vH = clamp((position.y - uHMin) / (uHMax - uHMin), 0.0, 1.0);
        vA = fadeAlpha(mv);
      }
    `,
    fragmentShader: /* glsl */ `
      ${fragmentCommon}
      void main() {
        float d = length(gl_PointCoord - 0.5);
        float a = smoothstep(0.5, 0.05, d);
        gl_FragColor = vec4(ramp(vH), a * vA * uOpacity);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
  });

  const lines = new ShaderMaterial({
    uniforms: { ...shared, uOpacity: { value: 0.28 } },
    vertexShader: /* glsl */ `
      ${vertexCommon}
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * mv;
        vH = clamp((position.y - uHMin) / (uHMax - uHMin), 0.0, 1.0);
        vA = fadeAlpha(mv);
      }
    `,
    fragmentShader: /* glsl */ `
      ${fragmentCommon}
      void main() {
        gl_FragColor = vec4(ramp(vH), vA * uOpacity);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
  });

  return { points, lines };
}

function Surface({ nx, nz, input, animated }) {
  const groupRef = useRef(null);
  const camera = useThree((s) => s.camera);
  const gl = useThree((s) => s.gl);
  const dpr = useThree((s) => s.viewport.dpr);
  const width = useThree((s) => s.size.width);

  const grid = useMemo(() => buildGrid(nx, nz, nz > 36 ? 2 : 1, nx > 60 ? 4 : 3), [nx, nz]);
  const materials = useMemo(createMaterials, []);

  // Scratch objects reused every frame (no per-frame allocations).
  const sim = useMemo(
    () => ({
      time: 0,
      tiltX: 0,
      tiltY: 0,
      ripples: new Float32Array(MAX_RIPPLES * 3).fill(-1e3), // x, z, startTime
      nextRipple: 0,
      active: new Float32Array(MAX_RIPPLES * 3),
      ndc: new Vector2(),
      raycaster: new Raycaster(),
      plane: new Plane(new Vector3(0, 1, 0), -PLANE_Y),
      inverse: new Matrix4(),
      ray: new Ray(),
      hit: new Vector3(),
    }),
    []
  );

  useEffect(() => {
    const span = grid.hMax - grid.hMin;
    for (const m of [materials.points, materials.lines]) {
      m.uniforms.uHMin.value = grid.hMin - span * 0.05;
      m.uniforms.uHMax.value = grid.hMax + span * 0.1;
    }
  }, [grid, materials]);

  useEffect(() => {
    materials.points.uniforms.uDpr.value = dpr;
  }, [dpr, materials]);

  useEffect(
    () => () => {
      grid.pointsGeo.dispose();
      grid.linesGeo.dispose();
    },
    [grid]
  );

  useEffect(
    () => () => {
      materials.points.dispose();
      materials.lines.dispose();
    },
    [materials]
  );

  useFrame((state, delta) => {
    const group = groupRef.current;
    if (!group) return;
    const dt = Math.min(delta, 0.05);
    if (animated) sim.time += dt;
    const time = sim.time;

    // Pointer tilt (lerped, frame-rate independent).
    const ease = 1 - Math.exp(-dt * 2.4);
    sim.tiltX += (input.x - sim.tiltX) * ease;
    sim.tiltY += (input.y - sim.tiltY) * ease;
    group.rotation.y = -0.38 + Math.sin(time * 0.06) * 0.22 + sim.tiltX * 0.2;
    group.rotation.x = sim.tiltY * 0.07;

    // Click -> project onto the surface's reference plane -> new ripple.
    if (input.click) {
      input.click = false;
      const rect = gl.domElement.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        sim.ndc.set(
          ((input.cx - rect.left) / rect.width) * 2 - 1,
          -((input.cy - rect.top) / rect.height) * 2 + 1
        );
        sim.raycaster.setFromCamera(sim.ndc, camera);
        group.updateMatrixWorld();
        sim.inverse.copy(group.matrixWorld).invert();
        sim.ray.copy(sim.raycaster.ray).applyMatrix4(sim.inverse);
        const hit = sim.ray.intersectPlane(sim.plane, sim.hit);
        if (hit && Math.abs(hit.x) < WIDTH * 0.6 && Math.abs(hit.z) < DEPTH * 0.7) {
          const r = sim.nextRipple * 3;
          sim.ripples[r] = hit.x;
          sim.ripples[r + 1] = hit.z;
          sim.ripples[r + 2] = time;
          sim.nextRipple = (sim.nextRipple + 1) % MAX_RIPPLES;
        }
      }
    }

    // Collect live ripples into the scratch buffer.
    let nActive = 0;
    for (let r = 0; r < MAX_RIPPLES; r++) {
      const age = time - sim.ripples[r * 3 + 2];
      if (age >= 0 && age < RIPPLE_LIFE) {
        sim.active[nActive * 3] = sim.ripples[r * 3];
        sim.active[nActive * 3 + 1] = sim.ripples[r * 3 + 1];
        sim.active[nActive * 3 + 2] = age;
        nActive++;
      }
    }

    const { count, positions, base, ks, ts } = grid;
    const active = sim.active;
    for (let i = 0, p = 0; i < count; i++, p += 3) {
      const k = ks[i];
      const t = ts[i];
      let h =
        base[i] +
        0.07 * Math.sin(k * 3.6 + t * 2.8 + time * 0.55) +
        0.045 * Math.sin(t * 7.0 - k * 1.7 - time * 0.9) +
        0.02 * Math.sin(k * 11.0 + time * 1.7) * (1 - t);

      for (let r = 0; r < nActive; r++) {
        const dx = positions[p] - active[r * 3];
        const dz = positions[p + 2] - active[r * 3 + 1];
        const age = active[r * 3 + 2];
        const d = Math.sqrt(dx * dx + dz * dz);
        const x = d - age * 3.4;
        const amp = 0.55 * Math.exp(-age * 1.05) * (1 - age / RIPPLE_LIFE);
        h += amp * Math.exp(-x * x * 0.9) * Math.cos(x * 3.2);
      }
      positions[p + 1] = h;
    }
    grid.position.needsUpdate = true;
  });

  const offsetX = width >= 1024 ? 2.4 : width >= 768 ? 1 : 0;
  const offsetY = width >= 768 ? -0.9 : -1.5;

  return (
    <group ref={groupRef} position={[offsetX, offsetY, 0]}>
      <lineSegments geometry={grid.linesGeo} material={materials.lines} frustumCulled={false} />
      <points geometry={grid.pointsGeo} material={materials.points} frustumCulled={false} />
    </group>
  );
}

function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setMatches(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [query]);
  return matches;
}

const INTERACTIVE = "a, button, input, textarea, select, [role='button']";

/**
 * Decorative WebGL background. Pointer events are read from `eventSource`
 * (the hero <section>) so the canvas never blocks text selection or buttons.
 */
export default function VolSurface({ eventSource }) {
  const reduced = useReducedMotion();
  const narrow = useMediaQuery("(max-width: 767px)");
  const [inView, setInView] = useState(true);
  const [pageVisible, setPageVisible] = useState(() => document.visibilityState !== "hidden");
  const [ready, setReady] = useState(false);
  const input = useMemo(() => ({ x: 0, y: 0, click: false, cx: 0, cy: 0 }), []);

  // Pause the render loop when the hero is offscreen or the tab is hidden.
  useEffect(() => {
    const el = eventSource?.current;
    if (!el || typeof IntersectionObserver === "undefined") return undefined;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, [eventSource]);

  useEffect(() => {
    const onVisibility = () => setPageVisible(document.visibilityState !== "hidden");
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  // Pointer tilt + click ripples, attached to the section rather than the canvas.
  useEffect(() => {
    const el = eventSource?.current;
    if (!el || reduced) return undefined;

    const onMove = (e) => {
      const rect = el.getBoundingClientRect();
      input.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      input.y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    };
    const onLeave = () => {
      input.x = 0;
      input.y = 0;
    };
    const onClick = (e) => {
      if (e.target instanceof Element && e.target.closest(INTERACTIVE)) return;
      const selection = window.getSelection?.();
      if (selection && !selection.isCollapsed) return;
      input.cx = e.clientX;
      input.cy = e.clientY;
      input.click = true;
    };

    el.addEventListener("pointermove", onMove, { passive: true });
    el.addEventListener("pointerleave", onLeave);
    el.addEventListener("click", onClick);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      el.removeEventListener("click", onClick);
    };
  }, [eventSource, reduced, input]);

  const running = !reduced && inView && pageVisible;

  return (
    <div className={`vol-surface${ready ? " is-ready" : ""}`} aria-hidden="true">
      <Canvas
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        camera={{ position: [0, 4.6, 10.5], fov: 40, near: 0.1, far: 60 }}
        frameloop={running ? "always" : "demand"}
        style={{ pointerEvents: "none" }}
        onCreated={({ camera, gl }) => {
          camera.lookAt(0, 0.2, 0);
          gl.setClearColor(0x000000, 0);
          setReady(true);
        }}
      >
        <Surface nx={narrow ? 48 : 84} nz={narrow ? 30 : 50} input={input} animated={!reduced} />
      </Canvas>
    </div>
  );
}
