import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

@Component({
  selector: 'app-arena',
  imports: [RouterLink],
  template: `
    <div class="stage" #stage>
      <canvas #canvas></canvas>
      <a routerLink="/">Back</a>
      <p class="hint">Drag to rotate · scroll to zoom</p>
    </div>
  `,
  styles: `
    .stage {
      position: fixed;
      inset: 0;
      overflow: hidden;
      background: linear-gradient(#0b4fa8, #3c86d0 55%, #c9ddf0);
    }
    canvas { display: block; width: 100%; height: 100%; }
    .back {
      position: absolute;
      top: 1rem;
      left: 1rem;
      padding: 0.6rem 1.2rem;
      font: inherit;
      font-weight: 700;
      color: #1f4a24;
      background: #a5e04a;
      border: 0;
      border-radius: 0.75rem;
      cursor: pointer;
    }
    .hint {
      position: absolute;
      bottom: 1rem;
      left: 0;
      right: 0;
      margin: 0;
      text-align: center;
      font-family: system-ui, sans-serif;
      color: #f2f6fa;
      opacity: 0.85;
    }
  `,
})
export class ArenaScreen {}

// ---------------------------------------------------------------------------
// Plain Three.js, with no Angular inside. Later this can move to its own file.
// Returns a function that tears everything down.
// ---------------------------------------------------------------------------

const GRASS_LIT = new THREE.Color(0xa5e04a);
const GRASS_MID = new THREE.Color(0x5fb82e);
const GRASS_SHADE = new THREE.Color(0x2f7a2a);
const ROCK = new THREE.Color(0xb9b6ae);

// t = 0 at the valley floor, 1 at the rim
function ringColor(t: number): THREE.Color {
  const c = new THREE.Color();
  if (t < 0.4) return c.lerpColors(GRASS_LIT, GRASS_MID, t / 0.4);
  if (t < 0.8) return c.lerpColors(GRASS_MID, GRASS_SHADE, (t - 0.4) / 0.4);
  return c.lerpColors(GRASS_SHADE, ROCK, (t - 0.8) / 0.2);
}

function startScene(canvas: HTMLCanvasElement, stage: HTMLElement): () => void {
  const disposables: { dispose(): void }[] = [];

  // 1. Renderer: draws the scene onto the canvas. alpha lets the CSS gradient show through.
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.NeutralToneMapping;

  // 2. Scene: the container for everything you can see
  const scene = new THREE.Scene();

  // 3. Camera: orthographic = no perspective shrinking, which gives the isometric look.
  // Placing it at equal x, y, z gives true isometric angles.
  const VIEW = 7; // how many world units fit from the center to the top of the screen
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 100);
  camera.position.set(10, 10, 10);

  const controls = new OrbitControls(camera, canvas);
  controls.target.set(0, 0.5, 0);
  controls.enableDamping = true; // smooth drag, needs controls.update() every frame
  controls.enablePan = false;
  controls.minZoom = 0.6;
  controls.maxZoom = 2.5;
  controls.maxPolarAngle = Math.PI / 2.2; // can't go below the ground

  // 4. Lights: without them, standard materials render black
  scene.add(new THREE.HemisphereLight(0x9cc8f5, 0x5fb82e, 1.1)); // sky above, grass bounce below
  const sun = new THREE.DirectionalLight(0xfff1d0, 2.4);
  sun.position.set(-6, 12, 5);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -7, right: 7, top: 7, bottom: -7, near: 1, far: 40 });
  sun.shadow.camera.updateProjectionMatrix();
  sun.shadow.bias = -0.0005;
  sun.shadow.normalBias = 0.03;
  scene.add(sun);

  // 5. Meshes: a mesh is a geometry (shape) plus a material (surface)

  // Dark base slab, so the arena looks like a diorama
  const slabGeo = new THREE.BoxGeometry(9.6, 0.5, 9.6);
  const slabMat = new THREE.MeshStandardMaterial({ color: 0x1f4a24, roughness: 1 });
  const slab = new THREE.Mesh(slabGeo, slabMat);
  slab.position.y = -0.26;
  slab.receiveShadow = true;
  scene.add(slab);
  disposables.push(slabGeo, slabMat);

  // A 9x9 grid of tiles that rises toward the rim: a small valley
  const tileGeo = new THREE.BoxGeometry(0.94, 1, 0.94).translate(0, 0.5, 0); // base sits at y = 0
  const ringMats = Array.from(
    { length: 5 },
    (_, d) => new THREE.MeshStandardMaterial({ color: ringColor(d / 4), roughness: 0.85 }),
  );
  disposables.push(tileGeo, ...ringMats);

  for (let x = -4; x <= 4; x++) {
    for (let z = -4; z <= 4; z++) {
      const ring = Math.max(Math.abs(x), Math.abs(z)); // 0 at center, 4 at the rim
      const tile = new THREE.Mesh(tileGeo, ringMats[ring]!);
      tile.position.set(x, 0, z);
      tile.scale.y = 0.3 + ring * 0.25; // taller toward the edge
      tile.castShadow = true;
      tile.receiveShadow = true;
      scene.add(tile);
    }
  }

  // The hero cube, standing on the center tile (height 0.3)
  const cubeGeo = new RoundedBoxGeometry(0.8, 0.8, 0.8, 5, 0.12);
  const cubeMat = new THREE.MeshStandardMaterial({ color: 0xd8342c, roughness: 0.45 });
  const cube = new THREE.Mesh(cubeGeo, cubeMat);
  const restY = 0.3 + 0.4;
  cube.position.y = restY;
  cube.castShadow = true;
  scene.add(cube);
  disposables.push(cubeGeo, cubeMat);

  // Keep the canvas and camera matched to the container's size
  const resize = () => {
    const w = stage.clientWidth;
    const h = stage.clientHeight;
    if (w === 0 || h === 0) return;
    const aspect = w / h;
    camera.left = -VIEW * aspect;
    camera.right = VIEW * aspect;
    camera.top = VIEW;
    camera.bottom = -VIEW;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false); // false: the CSS controls the canvas size
  };
  const observer = new ResizeObserver(resize);
  observer.observe(stage);
  resize();

  // 6. The loop: update things, then draw. Runs about 60 times per second.
  let raf = 0;
  const frame = (now: number) => {
    raf = requestAnimationFrame(frame);
    const t = now / 1000;
    cube.rotation.y = t * 0.8;
    cube.position.y = restY + Math.sin(t * 2) * 0.1;
    controls.update();
    renderer.render(scene, camera);
  };
  raf = requestAnimationFrame(frame);

  // Teardown. Three.js does not free GPU memory on its own.
  return () => {
    cancelAnimationFrame(raf);
    observer.disconnect();
    controls.dispose();
    disposables.forEach((d) => d.dispose());
    renderer.dispose();
  };
}