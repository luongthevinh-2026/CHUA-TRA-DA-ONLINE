import * as THREE from 'three';

export interface SeatInfo {
  index: number;
  position: THREE.Vector3;
  rotationY: number;
  isOccupiedByNpc: boolean;
  npcMesh?: THREE.Group;
  matMesh: THREE.Mesh;
}

export interface InteractiveZone {
  id: 'outer_incense' | 'inner_incense' | 'altar' | 'statue' | 'mat';
  label: string;
  position: THREE.Vector3;
  radius: number;
  data?: unknown;
}

export class TempleSceneManager {
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;
  public container: HTMLElement;
  public seats: SeatInfo[] = [];
  public interactiveZones: InteractiveZone[] = [];
  public smokeParticles: THREE.Points | null = null;
  public haloMesh: THREE.Mesh | null = null;
  public incensePositions: THREE.Vector3[] = [];
  public collisionObstacles: THREE.Box3[] = [];

  private clock = new THREE.Clock();
  private animFrameId: number = 0;
  private smokePositions: Float32Array = new Float32Array(0);
  private smokeVelocities: Float32Array = new Float32Array(0);
  private altarItemsGroup: THREE.Group = new THREE.Group();

  constructor(container: HTMLElement) {
    this.container = container;

    // 1. Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xdceaf5); // Morning peaceful haze
    this.scene.fog = new THREE.FogExp2(0xdceaf5, 0.016);

    // 2. Camera
    this.camera = new THREE.PerspectiveCamera(
      52,
      container.clientWidth / container.clientHeight,
      0.1,
      250
    );
    this.camera.position.set(0, 3.2, 14);

    // 3. Renderer with hardware/software check
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    this.renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = !isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setSize(container.clientWidth, container.clientHeight);

    container.appendChild(this.renderer.domElement);

    // Build the environment
    this.setupLighting();
    this.buildGroundAndCourtyard();
    this.buildTamQuanGate();
    this.buildLotusPond();
    this.buildOuterIncenseBurner();
    this.buildTreesAndLanterns();
    this.buildMainHall();
    this.buildBuddhaStatue();
    this.buildAltarAndDecor();
    this.buildTenMatsAndNpcs();
    this.buildSmokeSystem();

    window.addEventListener('resize', this.onResize);
  }

  private onResize = () => {
    if (!this.container) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  private setupLighting() {
    // Warm morning sunrise key light
    const sunLight = new THREE.DirectionalLight(0xfffaed, 2.2);
    sunLight.position.set(24, 38, 20);
    sunLight.castShadow = this.renderer.shadowMap.enabled;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 120;
    const d = 26;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    sunLight.shadow.bias = -0.0005;
    this.scene.add(sunLight);

    // Ambient hemisphere fill (Sky warm blue / Ground warm ochre)
    const hemiLight = new THREE.HemisphereLight(0xddeeff, 0x8d6e63, 1.2);
    this.scene.add(hemiLight);

    // Soft warm interior light for the main hall
    const hallLight = new THREE.PointLight(0xffb74d, 2.8, 18, 1.2);
    hallLight.position.set(0, 4.5, -20);
    this.scene.add(hallLight);
  }

  // Texture generator for stone tiles and wood
  private createTileTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#bcaaa4';
    ctx.fillRect(0, 0, 512, 512);

    // Stone tile grid lines
    ctx.strokeStyle = '#8d6e63';
    ctx.lineWidth = 4;
    const size = 64;
    for (let x = 0; x <= 512; x += size) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 512);
      ctx.stroke();
    }
    for (let y = 0; y <= 512; y += size) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(512, y);
      ctx.stroke();
    }

    // Subtle stone noise
    for (let i = 0; i < 400; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
      ctx.fillRect(Math.random() * 512, Math.random() * 512, 12, 12);
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(12, 24);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  private createSignTexture(text: string): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#5d1010'; // Lacquer red
    ctx.fillRect(0, 0, 512, 128);

    // Gold border
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 8;
    ctx.strokeRect(8, 8, 496, 112);

    // Gold calligraphy text
    ctx.font = 'bold 44px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#fff4a3';
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 6;
    ctx.fillText(text, 256, 64);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  private buildGroundAndCourtyard() {
    // 1. Large natural grass terrain
    const grassGeo = new THREE.PlaneGeometry(120, 120);
    const grassMat = new THREE.MeshStandardMaterial({
      color: 0x5b7f43,
      roughness: 0.9,
      metalness: 0.05,
    });
    const grass = new THREE.Mesh(grassGeo, grassMat);
    grass.rotation.x = -Math.PI / 2;
    grass.position.y = -0.05;
    grass.receiveShadow = true;
    this.scene.add(grass);

    // 2. Stone path from gate (z=14) to temple hall (z=-12)
    const pathTex = this.createTileTexture();
    const pathGeo = new THREE.PlaneGeometry(5.2, 28);
    const pathMat = new THREE.MeshStandardMaterial({
      map: pathTex,
      roughness: 0.75,
      metalness: 0.1,
    });
    const path = new THREE.Mesh(pathGeo, pathMat);
    path.rotation.x = -Math.PI / 2;
    path.position.set(0, 0.01, 0);
    path.receiveShadow = true;
    this.scene.add(path);

    // Courtyard outer boundary fence (brick walls)
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0x8d5c48,
      roughness: 0.8,
    });
    const tileMat = new THREE.MeshStandardMaterial({
      color: 0x9e2a2b, // Terracotta roof tile
      roughness: 0.6,
    });

    const addWallSection = (x: number, z: number, length: number, isVertical: boolean) => {
      const wallGroup = new THREE.Group();
      const wallGeo = isVertical
        ? new THREE.BoxGeometry(0.6, 2.2, length)
        : new THREE.BoxGeometry(length, 2.2, 0.6);
      const wall = new THREE.Mesh(wallGeo, wallMat);
      wall.position.y = 1.1;
      wall.castShadow = true;
      wall.receiveShadow = true;
      wallGroup.add(wall);

      // Wall roof ridge
      const ridgeGeo = isVertical
        ? new THREE.BoxGeometry(1.0, 0.35, length + 0.4)
        : new THREE.BoxGeometry(length + 0.4, 0.35, 1.0);
      const ridge = new THREE.Mesh(ridgeGeo, tileMat);
      ridge.position.y = 2.3;
      ridge.castShadow = true;
      wallGroup.add(ridge);

      wallGroup.position.set(x, 0, z);
      this.scene.add(wallGroup);

      // Collision box
      const box = new THREE.Box3();
      box.setFromObject(wallGroup);
      this.collisionObstacles.push(box);
    };

    // Left wall, Right wall, Back wall
    addWallSection(-16, -5, 42, true);
    addWallSection(16, -5, 42, true);
    addWallSection(0, -28, 32, false);

    // Front walls leaving opening for gate
    addWallSection(-10.5, 15, 11, false);
    addWallSection(10.5, 15, 11, false);
  }

  private buildTamQuanGate() {
    const gateGroup = new THREE.Group();
    gateGroup.position.set(0, 0, 15);

    const pillarMat = new THREE.MeshStandardMaterial({
      color: 0x8c261e, // Deep temple red pillar
      roughness: 0.45,
    });
    const roofMat = new THREE.MeshStandardMaterial({
      color: 0xb53826, // Red roof tile
      roughness: 0.5,
    });
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x757575,
      roughness: 0.8,
    });

    // 4 Main Pillars for 3 portals
    const pillarPositions = [-3.8, -1.3, 1.3, 3.8];
    pillarPositions.forEach((px, i) => {
      const height = i === 1 || i === 2 ? 4.8 : 3.8;
      // Stone base
      const base = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.4, 0.4, 12), baseMat);
      base.position.set(px, 0.2, 0);
      base.castShadow = true;
      gateGroup.add(base);

      // Wood pillar
      const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.28, height, 16), pillarMat);
      pillar.position.set(px, height / 2 + 0.2, 0);
      pillar.castShadow = true;
      gateGroup.add(pillar);
    });

    // Center higher roof
    const centerRoof = new THREE.Mesh(new THREE.ConeGeometry(3.6, 1.4, 4), roofMat);
    centerRoof.position.set(0, 5.6, 0);
    centerRoof.rotation.y = Math.PI / 4;
    centerRoof.castShadow = true;
    gateGroup.add(centerRoof);

    // Left and Right lower roofs
    const leftRoof = new THREE.Mesh(new THREE.ConeGeometry(2.2, 1.0, 4), roofMat);
    leftRoof.position.set(-2.6, 4.3, 0);
    leftRoof.rotation.y = Math.PI / 4;
    leftRoof.castShadow = true;
    gateGroup.add(leftRoof);

    const rightRoof = new THREE.Mesh(new THREE.ConeGeometry(2.2, 1.0, 4), roofMat);
    rightRoof.position.set(2.6, 4.3, 0);
    rightRoof.rotation.y = Math.PI / 4;
    rightRoof.castShadow = true;
    gateGroup.add(rightRoof);

    // Temple Sign Board "CHÙA AN LẠC"
    const signTex = this.createSignTexture('CHÙA AN LẠC');
    const signMat = new THREE.MeshStandardMaterial({ map: signTex, roughness: 0.3 });
    const signMesh = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.7, 0.1), signMat);
    signMesh.position.set(0, 4.5, 0.15);
    gateGroup.add(signMesh);

    this.scene.add(gateGroup);

    // Add gate pillar collision
    const boxLeft = new THREE.Box3(new THREE.Vector3(-4.2, 0, 14.5), new THREE.Vector3(-1.4, 4, 15.5));
    const boxRight = new THREE.Box3(new THREE.Vector3(1.4, 0, 14.5), new THREE.Vector3(4.2, 4, 15.5));
    this.collisionObstacles.push(boxLeft, boxRight);
  }

  private buildLotusPond() {
    const pondGroup = new THREE.Group();
    pondGroup.position.set(-8, 0, 5);

    // Stone border ring
    const borderMat = new THREE.MeshStandardMaterial({ color: 0x90a4ae, roughness: 0.7 });
    const borderMesh = new THREE.Mesh(new THREE.TorusGeometry(3.6, 0.35, 12, 32), borderMat);
    borderMesh.rotation.x = Math.PI / 2;
    borderMesh.position.y = 0.18;
    borderMesh.castShadow = true;
    pondGroup.add(borderMesh);

    // Water surface (peaceful turquoise mirror)
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x1f7a8c,
      roughness: 0.1,
      metalness: 0.8,
      transparent: true,
      opacity: 0.88,
    });
    const water = new THREE.Mesh(new THREE.CircleGeometry(3.5, 32), waterMat);
    water.rotation.x = -Math.PI / 2;
    water.position.y = 0.12;
    pondGroup.add(water);

    // Lotus leaves & flowers
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x2e7d32, roughness: 0.6 });
    const petalMat = new THREE.MeshStandardMaterial({ color: 0xf48fb1, roughness: 0.5 });
    const coreMat = new THREE.MeshStandardMaterial({ color: 0xffd54f, roughness: 0.4 });

    const leafPositions = [
      { x: -1.2, z: -0.8, r: 0.7 },
      { x: 0.8, z: 1.2, r: 0.85 },
      { x: -1.8, z: 1.0, r: 0.6 },
      { x: 1.5, z: -1.0, r: 0.75 },
      { x: 0.1, z: -1.8, r: 0.65 },
      { x: -0.3, z: 0.4, r: 0.8 },
      { x: 1.8, z: 0.2, r: 0.55 },
    ];

    leafPositions.forEach((pos, i) => {
      // Lotus leaf
      const leaf = new THREE.Mesh(new THREE.CylinderGeometry(pos.r, pos.r, 0.04, 16), leafMat);
      leaf.position.set(pos.x, 0.15, pos.z);
      leaf.rotation.y = i * 0.9;
      pondGroup.add(leaf);

      // Lotus Flower on some leaves
      if (i % 2 === 0) {
        const flowerGroup = new THREE.Group();
        flowerGroup.position.set(pos.x + 0.15, 0.22, pos.z - 0.1);

        // Core
        const core = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.1, 0.12, 10), coreMat);
        flowerGroup.add(core);

        // Petals in a rosette
        for (let p = 0; p < 8; p++) {
          const angle = (p / 8) * Math.PI * 2;
          const petal = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.32, 6), petalMat);
          petal.position.set(Math.cos(angle) * 0.18, 0.05, Math.sin(angle) * 0.18);
          petal.rotation.z = -Math.cos(angle) * 0.6;
          petal.rotation.x = Math.sin(angle) * 0.6;
          flowerGroup.add(petal);
        }
        pondGroup.add(flowerGroup);
      }
    });

    this.scene.add(pondGroup);

    // Collision box for lotus pond
    const pondBox = new THREE.Box3(
      new THREE.Vector3(-11.8, 0, 1.2),
      new THREE.Vector3(-4.2, 1, 8.8)
    );
    this.collisionObstacles.push(pondBox);
  }

  private buildOuterIncenseBurner() {
    // Large bronze incense burner in center of courtyard
    const burnerGroup = new THREE.Group();
    burnerGroup.position.set(0, 0, 6.5);

    const bronzeMat = new THREE.MeshStandardMaterial({
      color: 0x5d4037, // Aged temple bronze
      roughness: 0.4,
      metalness: 0.7,
    });
    const ashMat = new THREE.MeshStandardMaterial({
      color: 0xd7ccc8,
      roughness: 0.95,
    });

    // 3 Legged Base
    for (let i = 0; i < 3; i++) {
      const angle = (i / 3) * Math.PI * 2;
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.15, 0.6, 8), bronzeMat);
      leg.position.set(Math.cos(angle) * 0.6, 0.3, Math.sin(angle) * 0.6);
      burnerGroup.add(leg);
    }

    // Main cauldron body
    const cauldron = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.6, 0.9, 20), bronzeMat);
    cauldron.position.y = 0.95;
    cauldron.castShadow = true;
    burnerGroup.add(cauldron);

    // Cauldron lip
    const lip = new THREE.Mesh(new THREE.TorusGeometry(0.92, 0.1, 10, 24), bronzeMat);
    lip.rotation.x = Math.PI / 2;
    lip.position.y = 1.4;
    burnerGroup.add(lip);

    // Incense ash bed inside
    const ash = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.85, 0.1, 20), ashMat);
    ash.position.y = 1.35;
    burnerGroup.add(ash);

    // Incense sticks bundle
    const stickMat = new THREE.MeshStandardMaterial({ color: 0xb71c1c });
    const tipMat = new THREE.MeshBasicMaterial({ color: 0xff5722 });
    for (let s = 0; s < 7; s++) {
      const sx = (Math.random() - 0.5) * 0.4;
      const sz = (Math.random() - 0.5) * 0.4;
      const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.65, 6), stickMat);
      stick.position.set(sx, 1.65, sz);
      burnerGroup.add(stick);

      const tip = new THREE.Mesh(new THREE.SphereGeometry(0.025, 6, 6), tipMat);
      tip.position.set(sx, 1.98, sz);
      burnerGroup.add(tip);
    }

    this.scene.add(burnerGroup);

    // Save position for particles and interaction
    this.incensePositions.push(new THREE.Vector3(0, 1.95, 6.5));
    this.interactiveZones.push({
      id: 'outer_incense',
      label: 'Thắp hương (Lư hương sân)',
      position: new THREE.Vector3(0, 0, 6.5),
      radius: 2.5,
    });

    // Collision
    const burnerBox = new THREE.Box3(
      new THREE.Vector3(-1.2, 0, 5.3),
      new THREE.Vector3(1.2, 2, 7.7)
    );
    this.collisionObstacles.push(burnerBox);
  }

  private buildTreesAndLanterns() {
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x4e342e, roughness: 0.85 });
    const foliageMat1 = new THREE.MeshStandardMaterial({ color: 0x2e7d32, roughness: 0.7 });
    const foliageMat2 = new THREE.MeshStandardMaterial({ color: 0x388e3c, roughness: 0.65 });

    const treePositions = [
      { x: -11, z: -3, s: 1.2 },
      { x: -12, z: 11, s: 1.0 },
      { x: 11, z: 5, s: 1.15 },
      { x: 12, z: -4, s: 1.3 },
      { x: 10, z: 12, s: 0.95 },
    ];

    treePositions.forEach((tp) => {
      const tree = new THREE.Group();
      tree.position.set(tp.x, 0, tp.z);
      tree.scale.set(tp.s, tp.s, tp.s);

      // Trunk
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.45, 3.2, 8), trunkMat);
      trunk.position.y = 1.6;
      trunk.castShadow = true;
      tree.add(trunk);

      // Foliage layers (Bodhi / Pine tree style)
      const f1 = new THREE.Mesh(new THREE.ConeGeometry(2.4, 2.2, 8), foliageMat1);
      f1.position.y = 3.6;
      f1.castShadow = true;
      tree.add(f1);

      const f2 = new THREE.Mesh(new THREE.ConeGeometry(1.8, 1.8, 8), foliageMat2);
      f2.position.y = 4.8;
      f2.castShadow = true;
      tree.add(f2);

      const f3 = new THREE.Mesh(new THREE.ConeGeometry(1.1, 1.4, 8), foliageMat1);
      f3.position.y = 5.8;
      f3.castShadow = true;
      tree.add(f3);

      this.scene.add(tree);

      const tBox = new THREE.Box3(
        new THREE.Vector3(tp.x - 0.7, 0, tp.z - 0.7),
        new THREE.Vector3(tp.x + 0.7, 4, tp.z + 0.7)
      );
      this.collisionObstacles.push(tBox);
    });

    // Hanging red temple lanterns
    const lanternMat = new THREE.MeshStandardMaterial({
      color: 0xd32f2f,
      emissive: 0x8b0000,
      emissiveIntensity: 0.35,
      roughness: 0.4,
    });
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xffd700, roughness: 0.3 });

    const lanternPositions = [
      { x: -3.8, z: 14.8, y: 3.2 },
      { x: 3.8, z: 14.8, y: 3.2 },
      { x: -5.5, z: -10.5, y: 3.6 },
      { x: 5.5, z: -10.5, y: 3.6 },
    ];

    lanternPositions.forEach((lp) => {
      const lantern = new THREE.Group();
      lantern.position.set(lp.x, lp.y, lp.z);

      const body = new THREE.Mesh(new THREE.SphereGeometry(0.3, 12, 12), lanternMat);
      body.scale.set(1, 1.3, 1);
      lantern.add(body);

      const topRing = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.08, 10), goldMat);
      topRing.position.y = 0.4;
      lantern.add(topRing);

      const tassel = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.08, 0.35, 8), lanternMat);
      tassel.position.y = -0.55;
      lantern.add(tassel);

      this.scene.add(lantern);
    });
  }

  private buildMainHall() {
    const hallGroup = new THREE.Group();
    hallGroup.position.set(0, 0, -18);

    const pillarMat = new THREE.MeshStandardMaterial({ color: 0x8c261e, roughness: 0.4 });
    const wallMat = new THREE.MeshStandardMaterial({ color: 0xd7ccc8, roughness: 0.8 });
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x4e342e, roughness: 0.45 });
    const roofMat = new THREE.MeshStandardMaterial({ color: 0xa52a2a, roughness: 0.5 });
    const stepMat = new THREE.MeshStandardMaterial({ color: 0x9e9e9e, roughness: 0.7 });

    // 1. Raised Temple Platform (Bậc tam cấp)
    const steps = [
      { w: 14.8, d: 18.8, h: 0.25, y: 0.125 },
      { w: 14.2, d: 18.2, h: 0.25, y: 0.375 },
      { w: 13.6, d: 17.6, h: 0.25, y: 0.625 },
    ];
    steps.forEach((s) => {
      const stepMesh = new THREE.Mesh(new THREE.BoxGeometry(s.w, s.h, s.d), stepMat);
      stepMesh.position.set(0, s.y, 0);
      stepMesh.receiveShadow = true;
      hallGroup.add(stepMesh);
    });

    // 2. Interior Polished Wooden Floor
    const floorMesh = new THREE.Mesh(new THREE.BoxGeometry(13.2, 0.15, 17.0), floorMat);
    floorMesh.position.set(0, 0.8, 0);
    floorMesh.receiveShadow = true;
    hallGroup.add(floorMesh);

    // 3. Main hall walls (Back, Left, Right; Front is open)
    const backWall = new THREE.Mesh(new THREE.BoxGeometry(13.2, 5.2, 0.5), wallMat);
    backWall.position.set(0, 3.4, -8.3);
    backWall.castShadow = true;
    backWall.receiveShadow = true;
    hallGroup.add(backWall);

    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.5, 5.2, 17.0), wallMat);
    leftWall.position.set(-6.4, 3.4, 0);
    leftWall.castShadow = true;
    leftWall.receiveShadow = true;
    hallGroup.add(leftWall);

    const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.5, 5.2, 17.0), wallMat);
    rightWall.position.set(6.4, 3.4, 0);
    rightWall.castShadow = true;
    rightWall.receiveShadow = true;
    hallGroup.add(rightWall);

    // 4. Columns / Pillars (Cột chánh điện)
    const pillarPositions = [
      { x: -5.6, z: -7.0 },
      { x: -5.6, z: 0.0 },
      { x: -5.6, z: 7.2 },
      { x: 5.6, z: -7.0 },
      { x: 5.6, z: 0.0 },
      { x: 5.6, z: 7.2 },
      { x: -2.0, z: 7.2 },
      { x: 2.0, z: 7.2 },
    ];
    pillarPositions.forEach((pos) => {
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.35, 5.2, 16), pillarMat);
      col.position.set(pos.x, 3.4, pos.z);
      col.castShadow = true;
      hallGroup.add(col);
    });

    // 5. Traditional Curved Pagoda Roofs (2 Tiers)
    const lowerRoof = new THREE.Mesh(new THREE.ConeGeometry(11.2, 2.8, 4), roofMat);
    lowerRoof.position.set(0, 6.8, 0);
    lowerRoof.rotation.y = Math.PI / 4;
    lowerRoof.castShadow = true;
    hallGroup.add(lowerRoof);

    const upperRoof = new THREE.Mesh(new THREE.ConeGeometry(8.5, 2.4, 4), roofMat);
    upperRoof.position.set(0, 8.8, 0);
    upperRoof.rotation.y = Math.PI / 4;
    upperRoof.castShadow = true;
    hallGroup.add(upperRoof);

    // Roof spire / lotus finial on top
    const finialMat = new THREE.MeshStandardMaterial({ color: 0xffd700, roughness: 0.3 });
    const finial = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.3, 1.2, 8), finialMat);
    finial.position.set(0, 10.6, 0);
    hallGroup.add(finial);

    this.scene.add(hallGroup);

    // Add wall collision boxes
    const backBox = new THREE.Box3(new THREE.Vector3(-7, 0, -27), new THREE.Vector3(7, 6, -25.5));
    const leftBox = new THREE.Box3(new THREE.Vector3(-7.2, 0, -27), new THREE.Vector3(-6.0, 6, -9));
    const rightBox = new THREE.Box3(new THREE.Vector3(6.0, 0, -27), new THREE.Vector3(7.2, 6, -9));
    this.collisionObstacles.push(backBox, leftBox, rightBox);
  }

  private buildBuddhaStatue() {
    const statueGroup = new THREE.Group();
    statueGroup.position.set(0, 0.8, -25); // At back center of main hall

    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xf5b700, // Golden Buddha
      roughness: 0.3,
      metalness: 0.75,
    });
    const lotusMat = new THREE.MeshStandardMaterial({
      color: 0xf06292, // Pink lotus throne
      roughness: 0.5,
    });
    const throneBaseMat = new THREE.MeshStandardMaterial({
      color: 0x8d6e63,
      roughness: 0.6,
    });

    // 1. Throne Base
    const throneBase = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.8, 0.6, 16), throneBaseMat);
    throneBase.position.y = 0.3;
    throneBase.castShadow = true;
    statueGroup.add(throneBase);

    // 2. Multi-tier Lotus Petal Throne
    const lotusThrone = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.2, 0.4, 16), lotusMat);
    lotusThrone.position.y = 0.75;
    statueGroup.add(lotusThrone);

    for (let i = 0; i < 14; i++) {
      const angle = (i / 14) * Math.PI * 2;
      const petal = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.5, 6), lotusMat);
      petal.position.set(Math.cos(angle) * 1.35, 0.85, Math.sin(angle) * 1.35);
      petal.rotation.z = -Math.cos(angle) * 0.45;
      petal.rotation.x = Math.sin(angle) * 0.45;
      statueGroup.add(petal);
    }

    // 3. Buddha Torso in Meditation (Kiết Già)
    const crossedLegs = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.1, 0.4, 12), goldMat);
    crossedLegs.position.y = 1.15;
    statueGroup.add(crossedLegs);

    const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.7, 1.2, 12), goldMat);
    torso.position.y = 1.9;
    torso.castShadow = true;
    statueGroup.add(torso);

    // Shoulders & Head
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.38, 16, 16), goldMat);
    head.position.y = 2.75;
    head.castShadow = true;
    statueGroup.add(head);

    // Ushnisha (chignon of wisdom on top of head)
    const ushnisha = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.25, 8), goldMat);
    ushnisha.position.y = 3.2;
    statueGroup.add(ushnisha);

    // Folded Hands in Dhyana Mudra (Thiền Định)
    const hands = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.16, 0.3), goldMat);
    hands.position.set(0, 1.55, 0.4);
    statueGroup.add(hands);

    // 4. Rotating Luminous Golden Halo (Quầng sáng hào quang)
    const haloGeo = new THREE.RingGeometry(0.65, 1.35, 32);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0xfff176,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
    });
    const halo = new THREE.Mesh(haloGeo, haloMat);
    halo.position.set(0, 2.75, -0.4);
    statueGroup.add(halo);
    this.haloMesh = halo;

    this.scene.add(statueGroup);

    // Interactive zone for bowing in front of statue
    this.interactiveZones.push({
      id: 'statue',
      label: 'Lạy Phật (Trước tượng Phật)',
      position: new THREE.Vector3(0, 0.8, -21.8),
      radius: 2.2,
    });

    // Collision box for Buddha statue
    const statueBox = new THREE.Box3(
      new THREE.Vector3(-2.0, 0, -27.0),
      new THREE.Vector3(2.0, 5, -23.0)
    );
    this.collisionObstacles.push(statueBox);
  }

  private buildAltarAndDecor() {
    const altarGroup = new THREE.Group();
    altarGroup.position.set(0, 0.8, -22.2);

    const woodMat = new THREE.MeshStandardMaterial({
      color: 0x3e2723, // Dark polished red sandalwood
      roughness: 0.3,
    });
    const brassMat = new THREE.MeshStandardMaterial({
      color: 0xffb300,
      roughness: 0.35,
      metalness: 0.8,
    });

    // Main Altar Table
    const tableTop = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.2, 1.2), woodMat);
    tableTop.position.y = 0.95;
    tableTop.castShadow = true;
    tableTop.receiveShadow = true;
    altarGroup.add(tableTop);

    // Table legs
    const legGeo = new THREE.BoxGeometry(0.18, 0.95, 0.18);
    const legOffsets = [
      [-1.9, -0.45],
      [1.9, -0.45],
      [-1.9, 0.45],
      [1.9, 0.45],
    ];
    legOffsets.forEach(([lx, lz]) => {
      const leg = new THREE.Mesh(legGeo, woodMat);
      leg.position.set(lx, 0.475, lz);
      altarGroup.add(leg);
    });

    // Inner Cauldron (Lư hương trong điện)
    const innerBurner = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.28, 0.4, 16), brassMat);
    innerBurner.position.set(0, 1.22, 0);
    altarGroup.add(innerBurner);

    // 2 Brass Candle Lamps on sides
    const leftLamp = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.15, 0.5, 10), brassMat);
    leftLamp.position.set(-1.4, 1.25, 0);
    altarGroup.add(leftLamp);

    const rightLamp = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.15, 0.5, 10), brassMat);
    rightLamp.position.set(1.4, 1.25, 0);
    altarGroup.add(rightLamp);

    // Temple Bell (Chuông Đại Hồng Chung) on left stand
    const bellGroup = new THREE.Group();
    bellGroup.position.set(-4.2, 0, 0);
    const bellMesh = new THREE.Mesh(new THREE.ConeGeometry(0.55, 1.1, 16), brassMat);
    bellMesh.position.y = 1.4;
    bellMesh.rotation.x = Math.PI;
    bellGroup.add(bellMesh);
    altarGroup.add(bellGroup);

    // Wooden Fish (Mõ gỗ) on right cushion
    const moGroup = new THREE.Group();
    moGroup.position.set(4.2, 0, 0);
    const moMesh = new THREE.Mesh(new THREE.SphereGeometry(0.35, 12, 10), woodMat);
    moMesh.scale.set(1.2, 0.8, 1.0);
    moMesh.position.y = 0.9;
    moGroup.add(moMesh);
    altarGroup.add(moGroup);

    // Group for dynamically offered items (flowers, fruits, lamps)
    this.altarItemsGroup.position.set(0, 1.1, 0);
    altarGroup.add(this.altarItemsGroup);

    this.scene.add(altarGroup);

    // Save positions
    this.incensePositions.push(new THREE.Vector3(0, 2.3, -22.2));

    // Interactive zones
    this.interactiveZones.push({
      id: 'inner_incense',
      label: 'Thắp hương (Chánh điện)',
      position: new THREE.Vector3(0, 0.8, -21.0),
      radius: 2.2,
    });

    this.interactiveZones.push({
      id: 'altar',
      label: 'Dâng lễ (Bàn lễ chánh điện)',
      position: new THREE.Vector3(0, 0.8, -20.6),
      radius: 2.4,
    });

    // Collision
    const altarBox = new THREE.Box3(
      new THREE.Vector3(-2.4, 0, -23.2),
      new THREE.Vector3(2.4, 2, -21.2)
    );
    this.collisionObstacles.push(altarBox);
  }

  public updateAltarOfferings(offerings: Array<{ type: string }>) {
    // Clear previous items
    while (this.altarItemsGroup.children.length > 0) {
      this.altarItemsGroup.remove(this.altarItemsGroup.children[0]);
    }

    const lotusMat = new THREE.MeshStandardMaterial({ color: 0xf48fb1, roughness: 0.4 });
    const fruitMat1 = new THREE.MeshStandardMaterial({ color: 0xd32f2f }); // Red apples
    const fruitMat2 = new THREE.MeshStandardMaterial({ color: 0xff9800 }); // Oranges
    const flameMat = new THREE.MeshBasicMaterial({ color: 0xffca28 });

    offerings.slice(-6).forEach((item, idx) => {
      const offsetX = ((idx % 3) - 1) * 0.75;
      const offsetZ = idx >= 3 ? 0.3 : -0.25;

      if (item.type === 'lotus') {
        const flower = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), lotusMat);
        flower.position.set(offsetX, 0.1, offsetZ);
        this.altarItemsGroup.add(flower);
      } else if (item.type === 'fruit') {
        const dish = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.2, 0.05, 12), fruitMat2);
        dish.position.set(offsetX, 0.03, offsetZ);
        this.altarItemsGroup.add(dish);

        const apple = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), fruitMat1);
        apple.position.set(offsetX, 0.14, offsetZ);
        this.altarItemsGroup.add(apple);
      } else if (item.type === 'lamp') {
        const lamp = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.14, 0.18, 10), fruitMat2);
        lamp.position.set(offsetX, 0.09, offsetZ);
        this.altarItemsGroup.add(lamp);

        const flame = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.15, 6), flameMat);
        flame.position.set(offsetX, 0.24, offsetZ);
        this.altarItemsGroup.add(flame);
      }
    });
  }

  private buildTenMatsAndNpcs() {
    // 10 Bồ đoàn (Mats) in 2 rows of 5, facing the Buddha (north / -Z)
    // Left row: x = -2.4; Right row: x = 2.4
    // Spaced along Z: z = -14.5 to -18.5
    const matGeo = new THREE.CylinderGeometry(0.48, 0.52, 0.14, 16);
    const matMat = new THREE.MeshStandardMaterial({
      color: 0xef6c00, // Saffron / Orange Buddhist meditation cushion
      roughness: 0.8,
    });

    const zPositions = [-14.0, -15.2, -16.4, -17.6, -18.8];
    const occupiedIndices = new Set<number>();

    // Pick 4 to 6 random seats to be occupied by simulated NPCs
    const npcCount = 4 + Math.floor(Math.random() * 3); // 4, 5, or 6
    while (occupiedIndices.size < npcCount) {
      occupiedIndices.add(Math.floor(Math.random() * 10));
    }

    let seatIdx = 1;
    // Row 1 (Left)
    zPositions.forEach((z) => {
      this.createSeat(seatIdx, new THREE.Vector3(-2.2, 0.88, z), matGeo, matMat, occupiedIndices.has(seatIdx - 1));
      seatIdx++;
    });

    // Row 2 (Right)
    zPositions.forEach((z) => {
      this.createSeat(seatIdx, new THREE.Vector3(2.2, 0.88, z), matGeo, matMat, occupiedIndices.has(seatIdx - 1));
      seatIdx++;
    });
  }

  private createSeat(
    index: number,
    position: THREE.Vector3,
    matGeo: THREE.CylinderGeometry,
    matMat: THREE.Material,
    isOccupied: boolean
  ) {
    const mat = new THREE.Mesh(matGeo, matMat);
    mat.position.copy(position);
    mat.receiveShadow = true;
    this.scene.add(mat);

    let npcMesh: THREE.Group | undefined;

    if (isOccupied) {
      // Create simulated NPC sitting in lotus meditation pose
      npcMesh = new THREE.Group();
      npcMesh.position.set(position.x, position.y + 0.08, position.z);

      const robeMat = new THREE.MeshStandardMaterial({
        color: index % 2 === 0 ? 0x795548 : 0x546e7a, // Brown or grey monastic robes
        roughness: 0.7,
      });
      const skinMat = new THREE.MeshStandardMaterial({ color: 0xffcc80, roughness: 0.6 });

      // Crossed legs
      const legs = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.42, 0.2, 10), robeMat);
      legs.position.y = 0.1;
      npcMesh.add(legs);

      // Torso
      const body = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.28, 0.6, 10), robeMat);
      body.position.y = 0.48;
      npcMesh.add(body);

      // Head
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 12), skinMat);
      head.position.y = 0.92;
      npcMesh.add(head);

      // Floating label above NPC: "[Mô phỏng] Đồng tu"
      const labelTex = this.createNpcLabelTexture(`[Mô phỏng] Chỗ #${index}`);
      const labelMat = new THREE.SpriteMaterial({ map: labelTex, transparent: true });
      const labelSprite = new THREE.Sprite(labelMat);
      labelSprite.position.set(0, 1.35, 0);
      labelSprite.scale.set(1.4, 0.35, 1);
      npcMesh.add(labelSprite);

      this.scene.add(npcMesh);
    } else {
      // Empty mat: add interactive zone for player to sit
      this.interactiveZones.push({
        id: 'mat',
        label: `Ngồi thiền (Bồ đoàn #${index})`,
        position: position.clone(),
        radius: 1.4,
        data: { seatIndex: index, seatPos: position },
      });
    }

    this.seats.push({
      index,
      position,
      rotationY: 0,
      isOccupiedByNpc: isOccupied,
      npcMesh,
      matMesh: mat,
    });
  }

  private createNpcLabelTexture(text: string): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
    ctx.roundRect ? ctx.roundRect(4, 4, 248, 56, 12) : ctx.fillRect(4, 4, 248, 56);
    ctx.fill();

    ctx.strokeStyle = '#ffd54f';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.font = 'bold 22px sans-serif';
    ctx.fillStyle = '#fff9c4';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 128, 32);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  private buildSmokeSystem() {
    // Particle system for incense smoke (gently rising and swirling)
    const count = 120;
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const origin = this.incensePositions[i % this.incensePositions.length];
      positions[i * 3] = origin.x + (Math.random() - 0.5) * 0.15;
      positions[i * 3 + 1] = origin.y + Math.random() * 1.5;
      positions[i * 3 + 2] = origin.z + (Math.random() - 0.5) * 0.15;

      velocities[i * 3] = (Math.random() - 0.5) * 0.08;
      velocities[i * 3 + 1] = 0.2 + Math.random() * 0.35; // Rise speed
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.08;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const smokeMat = new THREE.PointsMaterial({
      color: 0xeeeeee,
      size: 0.16,
      transparent: true,
      opacity: 0.45,
    });

    this.smokeParticles = new THREE.Points(geo, smokeMat);
    this.smokePositions = positions;
    this.smokeVelocities = velocities;
    this.scene.add(this.smokeParticles);
  }

  public updateAnimation(delta: number) {
    // 1. Rotate Buddha halo slowly
    if (this.haloMesh) {
      this.haloMesh.rotation.z += delta * 0.25;
    }

    // 2. Animate incense smoke particles
    if (this.smokeParticles && this.smokePositions.length > 0) {
      const posAttr = this.smokeParticles.geometry.attributes.position as THREE.BufferAttribute;
      const count = this.smokePositions.length / 3;

      for (let i = 0; i < count; i++) {
        const origin = this.incensePositions[i % this.incensePositions.length];
        this.smokePositions[i * 3] += this.smokeVelocities[i * 3] * delta;
        this.smokePositions[i * 3 + 1] += this.smokeVelocities[i * 3 + 1] * delta;
        this.smokePositions[i * 3 + 2] += this.smokeVelocities[i * 3 + 2] * delta;

        // Reset particle when it rises too high
        if (this.smokePositions[i * 3 + 1] > origin.y + 2.5) {
          this.smokePositions[i * 3] = origin.x + (Math.random() - 0.5) * 0.15;
          this.smokePositions[i * 3 + 1] = origin.y;
          this.smokePositions[i * 3 + 2] = origin.z + (Math.random() - 0.5) * 0.15;
        }
      }
      posAttr.needsUpdate = true;
    }
  }

  public render() {
    const delta = this.clock.getDelta();
    this.updateAnimation(delta);
    this.renderer.render(this.scene, this.camera);
  }

  public dispose() {
    window.removeEventListener('resize', this.onResize);
    cancelAnimationFrame(this.animFrameId);
    this.renderer.dispose();
  }
}
