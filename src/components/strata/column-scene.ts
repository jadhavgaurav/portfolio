import * as THREE from 'three';
import { BANDS, CORE_DEPTH, VEIN_RUNS, centreOf, type Band } from '@/lib/core';
import type { VeinId } from '@/data/strata';

/**
 * The core column.
 *
 * One InstancedMesh holds all 46 bands; six thin rods hold the veins. That is the
 * entire scene — no environment map, no post-processing, no particles, no ground
 * plane. Three lights, all of them motivated: a key from upper-left, a hemisphere
 * fill the colour of the paper, and a weak rim so the silhouette separates from
 * the page.
 *
 * The renderer draws on demand. When nothing is moving it draws nothing.
 */

const RADIUS = 0.95;
const VEIN_R = 0.075;
/** Hairline cut between bands, in metres — a core comes out of the ground in pieces. */
const SEAM = 0.022;

/** Radial slots so the veins do not occupy the same axis inside the rock. */
const VEIN_SLOT: Record<string, [number, number]> = {
  assistant: [0, 0],
  retrieval: [0.36, 0.19],
  sight: [-0.34, 0.23],
  prediction: [0.23, -0.33],
  shipping: [-0.23, -0.35],
  commission: [0.45, -0.09],
  coursework: [-0.47, -0.05],
};

export type Mode = 'section' | 'veins';

export class ColumnScene {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera;
  private core: THREE.InstancedMesh;
  private coreMat: THREE.MeshStandardMaterial;
  private veinMeshes = new Map<VeinId, THREE.Mesh>();
  private raycaster = new THREE.Raycaster();
  private pointer = new THREE.Vector2(-2, -2);
  private baseColors: THREE.Color[] = [];

  private dirty = true;
  private disposed = false;
  private slowFrames = 0;
  private dpr: number;

  /** Driven from React each frame; the scene only reads. */
  depth = 0;
  mode: Mode = 'section';
  isolated: VeinId | null = null;
  activeIndex = 0;
  focus = 0; // 0 = surveying, 1 = pushed in on a specimen

  onHover: (b: Band | null) => void = () => {};
  onPick: (b: Band) => void = () => {};

  constructor(private canvas: HTMLCanvasElement) {
    this.dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(this.dpr);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.NoToneMapping;

    this.camera = new THREE.PerspectiveCamera(38, 1, 0.1, 200);

    // ── lights ──────────────────────────────────────────────────────
    const key = new THREE.DirectionalLight(0xfff4e2, 3.15);
    key.position.set(-5, 6, 8);
    const rim = new THREE.DirectionalLight(0xd6cdb8, 1.05);
    rim.position.set(6, -3, -5);
    const fill = new THREE.HemisphereLight(0xf2eee2, 0x585240, 1.9);
    this.scene.add(key, rim, fill);

    // ── the rock ────────────────────────────────────────────────────
    const geo = new THREE.CylinderGeometry(RADIUS, RADIUS, 1, 64, 1, false);
    this.coreMat = new THREE.MeshStandardMaterial({
      roughness: 0.93,
      metalness: 0,
      flatShading: false,
    });
    this.core = new THREE.InstancedMesh(geo, this.coreMat, BANDS.length);
    this.core.instanceMatrix.setUsage(THREE.StaticDrawUsage);

    const m = new THREE.Matrix4();
    BANDS.forEach((b, i) => {
      m.makeScale(1, Math.max(0.06, b.thickness - SEAM), 1);
      m.setPosition(0, -centreOf(b), 0);
      this.core.setMatrixAt(i, m);
      // A deterministic tonal jitter per layer, seeded from the repository name.
      // Real rock varies within a formation; a flat band reads as a UI swatch.
      let h = 0;
      for (let k = 0; k < b.layer.repo.length; k++) h = (h * 31 + b.layer.repo.charCodeAt(k)) | 0;
      const jitter = 0.14 + ((Math.abs(h) % 1000) / 1000) * 0.26;
      const c = new THREE.Color(b.pigment).lerp(new THREE.Color('#FFFFFF'), jitter).convertSRGBToLinear();
      this.baseColors.push(c);
      this.core.setColorAt(i, c);
    });
    this.core.instanceMatrix.needsUpdate = true;
    if (this.core.instanceColor) this.core.instanceColor.needsUpdate = true;
    this.scene.add(this.core);

    // ── the veins ───────────────────────────────────────────────────
    for (const run of VEIN_RUNS) {
      const height = run.base - run.top;
      const g = new THREE.CylinderGeometry(VEIN_R, VEIN_R, height, 12, 1, false);
      const mat = new THREE.MeshStandardMaterial({
        color: new THREE.Color('#3A382E').convertSRGBToLinear(),
        roughness: 0.42,
        metalness: 0.12,
        transparent: true,
        opacity: 0,
      });
      const mesh = new THREE.Mesh(g, mat);
      const [x, z] = VEIN_SLOT[run.vein.id] ?? [0, 0];
      mesh.position.set(x, -(run.top + height / 2), z);
      mesh.visible = false;
      this.veinMeshes.set(run.vein.id, mesh);
      this.scene.add(mesh);
    }

    canvas.addEventListener('pointermove', this.handleMove);
    canvas.addEventListener('pointerleave', this.handleLeave);
    canvas.addEventListener('click', this.handleClick);
  }

  /* ── input ───────────────────────────────────────────────────────── */

  private handleMove = (e: PointerEvent) => {
    const r = this.canvas.getBoundingClientRect();
    this.pointer.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    this.dirty = true;
  };
  private handleLeave = () => { this.pointer.set(-2, -2); this.onHover(null); this.dirty = true; };
  private handleClick = () => { const b = this.pickBand(); if (b) this.onPick(b); };

  private pickBand(): Band | null {
    if (this.pointer.x < -1.5) return null;
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const hit = this.raycaster.intersectObject(this.core, false)[0];
    if (!hit || hit.instanceId == null) return null;
    return BANDS[hit.instanceId] ?? null;
  }

  /* ── frame ───────────────────────────────────────────────────────── */

  resize(w: number, h: number) {
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.dirty = true;
  }

  invalidate() { this.dirty = true; }

  private hovered: Band | null = null;

  frame() {
    if (this.disposed) return;

    // Camera rides the reading head. Pushing in on a specimen is the only
    // move that is not a straight translation.
    const f = this.focus;
    // Looking straight down -Z, not at the column: the core stays off-axis in
    // the right third of the frame and we see its side, rather than the camera
    // swinging round to centre it.
    const camX = -2.4 + 1.5 * f;
    this.camera.position.set(camX, -this.depth, 15 - 5.4 * f);
    this.camera.lookAt(camX, -this.depth, 0);

    const veinsOn = this.mode === 'veins';
    const targetOpacity = veinsOn ? (this.isolated ? 0.66 : 0.3) : 1;
    if (Math.abs(this.coreMat.opacity - targetOpacity) > 0.004) {
      this.coreMat.opacity += (targetOpacity - this.coreMat.opacity) * 0.14;
      this.dirty = true;
    } else {
      this.coreMat.opacity = targetOpacity;
    }
    this.coreMat.transparent = this.coreMat.opacity < 0.999;
    this.coreMat.depthWrite = !this.coreMat.transparent;

    this.veinMeshes.forEach((mesh, id) => {
      const want = veinsOn ? (this.isolated ? (this.isolated === id ? 1 : 0.06) : 0.72) : 0;
      const mat = mesh.material as THREE.MeshStandardMaterial;
      if (Math.abs(mat.opacity - want) > 0.004) {
        mat.opacity += (want - mat.opacity) * 0.16;
        this.dirty = true;
      } else mat.opacity = want;
      mesh.visible = mat.opacity > 0.01;
    });

    const hit = this.pickBand();
    if (hit?.index !== this.hovered?.index) {
      this.hovered = hit;
      this.onHover(hit);
      this.canvas.style.cursor = hit ? 'pointer' : 'default';
      this.dirty = true;
    }

    if (this.dirty) this.paintInstances();

    if (this.dirty) {
      const t = performance.now();
      this.renderer.render(this.scene, this.camera);
      this.dirty = false;

      // Adaptive quality: two slow frames and the pixel ratio drops once.
      if (performance.now() - t > 24 && this.dpr > 1) {
        if (++this.slowFrames >= 2) {
          this.dpr = 1;
          this.renderer.setPixelRatio(1);
          this.slowFrames = 0;
        }
      }
    }
  }

  private paintInstances() {
    const tmp = new THREE.Color();
    for (let i = 0; i < BANDS.length; i++) {
      const band = BANDS[i];
      tmp.copy(this.baseColors[i]);

      if (this.isolated && !band.layer.veins.includes(this.isolated)) {
        tmp.lerp(new THREE.Color('#E7E2D6').convertSRGBToLinear(), 0.93);
      }
      if (i === this.activeIndex || i === this.hovered?.index) {
        tmp.lerp(new THREE.Color('#FFFFFF').convertSRGBToLinear(), i === this.hovered?.index ? 0.2 : 0.12);
      }
      this.core.setColorAt(i, tmp);
    }
    if (this.core.instanceColor) this.core.instanceColor.needsUpdate = true;
  }

  dispose() {
    this.disposed = true;
    this.canvas.removeEventListener('pointermove', this.handleMove);
    this.canvas.removeEventListener('pointerleave', this.handleLeave);
    this.canvas.removeEventListener('click', this.handleClick);
    this.core.geometry.dispose();
    this.coreMat.dispose();
    this.veinMeshes.forEach((m) => {
      m.geometry.dispose();
      (m.material as THREE.Material).dispose();
    });
    this.renderer.dispose();
  }
}

export { CORE_DEPTH };
