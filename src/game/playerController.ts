import * as THREE from 'three';
import { TempleSceneManager, InteractiveZone } from './threeScene';

export type PlayerState = 'idle' | 'walking' | 'sitting' | 'bowing';

export class PlayerController {
  public mesh: THREE.Group;
  public position: THREE.Vector3 = new THREE.Vector3(0, 0, 18); // Spawn in front of Tam Quan Gate
  public state: PlayerState = 'idle';
  public currentSeatIndex: number | null = null;
  public activeZone: InteractiveZone | null = null;

  private sceneManager: TempleSceneManager;
  private camera: THREE.PerspectiveCamera;
  private leftLeg: THREE.Mesh;
  private rightLeg: THREE.Mesh;
  private leftArm: THREE.Mesh;
  private rightArm: THREE.Mesh;
  private torso: THREE.Mesh;
  private head: THREE.Mesh;

  // Camera angles
  public cameraYaw: number = 0;
  public cameraPitch: number = 0.28;
  public cameraDistance: number = 5.2;

  // Keyboard state
  private keys: Record<string, boolean> = {};
  private walkCycleTime: number = 0;

  // Bowing animation state
  private bowingProgress: number = 0;
  private isBowingActive: boolean = false;

  // Virtual joystick input (-1 to 1)
  public joystickInput = { x: 0, y: 0 };

  // Click to move target
  private clickTarget: THREE.Vector3 | null = null;
  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();

  constructor(sceneManager: TempleSceneManager) {
    this.sceneManager = sceneManager;
    this.camera = sceneManager.camera;

    // 1. Build Player Mesh (Low Poly Buddhist Devotee / Áo lam)
    this.mesh = new THREE.Group();
    this.mesh.position.copy(this.position);

    const robeMat = new THREE.MeshStandardMaterial({
      color: 0x5c7c99, // Calm blue-grey Buddhist devotee robe (Áo lam)
      roughness: 0.6,
    });
    const skinMat = new THREE.MeshStandardMaterial({
      color: 0xffcc80,
      roughness: 0.5,
    });
    const hairMat = new THREE.MeshStandardMaterial({
      color: 0x212121,
      roughness: 0.9,
    });
    const shoeMat = new THREE.MeshStandardMaterial({
      color: 0x3e2723,
      roughness: 0.8,
    });

    // Torso (Áo lam)
    this.torso = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.32, 0.8, 10), robeMat);
    this.torso.position.y = 0.95;
    this.torso.castShadow = true;
    this.mesh.add(this.torso);

    // Head
    this.head = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 12), skinMat);
    this.head.position.y = 1.55;
    this.head.castShadow = true;
    this.mesh.add(this.head);

    // Hair / Topknot
    const hair = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), hairMat);
    hair.position.set(0, 1.72, -0.04);
    this.mesh.add(hair);

    // Left Arm
    this.leftArm = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.08, 0.55, 8), robeMat);
    this.leftArm.position.set(-0.34, 1.05, 0);
    this.mesh.add(this.leftArm);

    // Right Arm
    this.rightArm = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.08, 0.55, 8), robeMat);
    this.rightArm.position.set(0.34, 1.05, 0);
    this.mesh.add(this.rightArm);

    // Left Leg
    this.leftLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.1, 0.6, 8), shoeMat);
    this.leftLeg.position.set(-0.16, 0.35, 0);
    this.mesh.add(this.leftLeg);

    // Right Leg
    this.rightLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.1, 0.6, 8), shoeMat);
    this.rightLeg.position.set(0.16, 0.35, 0);
    this.mesh.add(this.rightLeg);

    this.sceneManager.scene.add(this.mesh);

    // Event listeners
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
  }

  private onKeyDown = (e: KeyboardEvent) => {
    this.keys[e.code] = true;
    if (this.state === 'sitting' && (e.code === 'KeyW' || e.code === 'KeyS' || e.code === 'KeyA' || e.code === 'KeyD')) {
      this.standUp();
    }
  };

  private onKeyUp = (e: KeyboardEvent) => {
    this.keys[e.code] = false;
  };

  public handlePointerDown(e: MouseEvent | TouchEvent, domElement: HTMLElement) {
    // If not sitting or bowing, test for click-to-move
    if (this.state === 'sitting' || this.state === 'bowing') return;

    let clientX = 0;
    let clientY = 0;
    if (e instanceof MouseEvent) {
      // Only handle left click
      if (e.button !== 0) return;
      clientX = e.clientX;
      clientY = e.clientY;
    } else if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    }

    const rect = domElement.getBoundingClientRect();
    this.mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    // Cast against ground plane
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const intersectPoint = new THREE.Vector3();
    if (this.raycaster.ray.intersectPlane(plane, intersectPoint)) {
      // Limit click distance to 30 units
      if (intersectPoint.distanceTo(this.position) < 30) {
        this.clickTarget = intersectPoint;
      }
    }
  }

  public sitDownOnSeat(seatIndex: number, seatPos: THREE.Vector3) {
    this.state = 'sitting';
    this.currentSeatIndex = seatIndex;
    this.clickTarget = null;

    // Sit directly on top of the cushion
    this.position.set(seatPos.x, seatPos.y + 0.1, seatPos.z);
    this.mesh.position.copy(this.position);
    this.mesh.rotation.y = 0; // Face the Buddha statue (-Z direction)

    // Adjust limbs for seated lotus meditation pose
    this.torso.position.y = 0.55;
    this.head.position.y = 1.15;
    this.leftLeg.rotation.x = Math.PI / 2;
    this.leftLeg.position.set(-0.16, 0.15, 0.12);
    this.rightLeg.rotation.x = Math.PI / 2;
    this.rightLeg.position.set(0.16, 0.15, 0.12);
    this.leftArm.rotation.x = 0.5;
    this.leftArm.position.set(-0.25, 0.65, 0.18);
    this.rightArm.rotation.x = 0.5;
    this.rightArm.position.set(0.25, 0.65, 0.18);
  }

  public standUp() {
    this.state = 'idle';
    this.currentSeatIndex = null;
    this.position.y = 0.8; // Standing inside hall height
    this.mesh.position.copy(this.position);

    // Reset limbs to standing
    this.torso.position.y = 0.95;
    this.head.position.y = 1.55;
    this.leftLeg.rotation.set(0, 0, 0);
    this.leftLeg.position.set(-0.16, 0.35, 0);
    this.rightLeg.rotation.set(0, 0, 0);
    this.rightLeg.position.set(0.16, 0.35, 0);
    this.leftArm.rotation.set(0, 0, 0);
    this.leftArm.position.set(-0.34, 1.05, 0);
    this.rightArm.rotation.set(0, 0, 0);
    this.rightArm.position.set(0.34, 1.05, 0);
  }

  public triggerBowingAnimation(onComplete?: () => void) {
    if (this.isBowingActive) return;
    this.isBowingActive = true;
    this.state = 'bowing';
    this.bowingProgress = 0;

    const startTime = performance.now();
    const duration = 1400; // 1.4s per bow

    const animateBow = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Sine curve for smooth bowing down and rising up
      const bowAngle = Math.sin(progress * Math.PI) * 0.95;

      this.torso.rotation.x = bowAngle;
      this.head.rotation.x = bowAngle * 1.2;
      this.head.position.z = -Math.sin(bowAngle) * 0.35;
      this.head.position.y = 1.55 - Math.sin(bowAngle) * 0.35;
      this.leftArm.rotation.x = bowAngle * 0.7;
      this.rightArm.rotation.x = bowAngle * 0.7;

      if (progress < 1) {
        requestAnimationFrame(animateBow);
      } else {
        this.torso.rotation.x = 0;
        this.head.rotation.x = 0;
        this.head.position.set(0, 1.55, 0);
        this.leftArm.rotation.x = 0;
        this.rightArm.rotation.x = 0;
        this.isBowingActive = false;
        this.state = 'idle';
        if (onComplete) onComplete();
      }
    };

    requestAnimationFrame(animateBow);
  }

  private checkCollision(newPos: THREE.Vector3): boolean {
    const playerRadius = 0.35;
    const playerBox = new THREE.Box3(
      new THREE.Vector3(newPos.x - playerRadius, 0, newPos.z - playerRadius),
      new THREE.Vector3(newPos.x + playerRadius, 2, newPos.z + playerRadius)
    );

    for (const obstacle of this.sceneManager.collisionObstacles) {
      if (obstacle.intersectsBox(playerBox)) {
        return true;
      }
    }
    return false;
  }

  private updateInteractiveZones() {
    this.activeZone = null;
    let closestDist = Infinity;

    for (const zone of this.sceneManager.interactiveZones) {
      const dist = this.position.distanceTo(zone.position);
      if (dist <= zone.radius && dist < closestDist) {
        closestDist = dist;
        this.activeZone = zone;
      }
    }
  }

  public update(delta: number) {
    if (this.state === 'sitting' || this.state === 'bowing') {
      this.updateCamera(delta);
      return;
    }

    // Determine movement direction vector
    let moveX = 0;
    let moveZ = 0;

    // 1. Keyboard Input
    if (this.keys['KeyW'] || this.keys['ArrowUp']) moveZ -= 1;
    if (this.keys['KeyS'] || this.keys['ArrowDown']) moveZ += 1;
    if (this.keys['KeyA'] || this.keys['ArrowLeft']) moveX -= 1;
    if (this.keys['KeyD'] || this.keys['ArrowRight']) moveX += 1;

    // 2. Virtual Joystick Input
    if (Math.abs(this.joystickInput.x) > 0.05 || Math.abs(this.joystickInput.y) > 0.05) {
      moveX = this.joystickInput.x;
      moveZ = -this.joystickInput.y;
      this.clickTarget = null;
    }

    // 3. Click-to-Move Target
    if (this.clickTarget && moveX === 0 && moveZ === 0) {
      const dir = new THREE.Vector3().subVectors(this.clickTarget, this.position);
      dir.y = 0;
      if (dir.length() > 0.3) {
        dir.normalize();
        moveX = dir.x;
        moveZ = dir.z;
      } else {
        this.clickTarget = null;
      }
    }

    const isMoving = Math.abs(moveX) > 0.01 || Math.abs(moveZ) > 0.01;

    if (isMoving) {
      this.state = 'walking';
      const speed = 4.8 * delta;

      // Calculate world movement relative to camera yaw
      let targetAngle = Math.atan2(moveX, moveZ) + this.cameraYaw;
      const worldDirX = Math.sin(targetAngle);
      const worldDirZ = Math.cos(targetAngle);

      const nextPos = this.position.clone();
      nextPos.x += worldDirX * speed;
      nextPos.z += worldDirZ * speed;

      // Handle elevation (stairs into the temple platform at z <= -9)
      if (nextPos.z <= -9.5) {
        nextPos.y = 0.8; // Raised main hall platform
      } else if (nextPos.z <= -8.5) {
        nextPos.y = 0.4; // Mid stair step
      } else {
        nextPos.y = 0.0; // Courtyard level
      }

      // Check collision
      if (!this.checkCollision(nextPos)) {
        this.position.copy(nextPos);
      } else {
        // Slide on X or Z
        const slideX = this.position.clone();
        slideX.x = nextPos.x;
        if (!this.checkCollision(slideX)) {
          this.position.x = nextPos.x;
        } else {
          const slideZ = this.position.clone();
          slideZ.z = nextPos.z;
          if (!this.checkCollision(slideZ)) {
            this.position.z = nextPos.z;
          }
        }
      }

      this.mesh.position.copy(this.position);

      // Rotate player smoothly toward direction of movement
      const curRot = this.mesh.rotation.y;
      const diff = Math.atan2(Math.sin(targetAngle - curRot), Math.cos(targetAngle - curRot));
      this.mesh.rotation.y += diff * 12 * delta;

      // Walking limb swing animation
      this.walkCycleTime += delta * 10;
      const swing = Math.sin(this.walkCycleTime) * 0.45;
      this.leftLeg.rotation.x = swing;
      this.rightLeg.rotation.x = -swing;
      this.leftArm.rotation.x = -swing * 0.8;
      this.rightArm.rotation.x = swing * 0.8;
    } else {
      this.state = 'idle';
      // Reset limbs smoothly to resting position
      this.leftLeg.rotation.x *= 0.8;
      this.rightLeg.rotation.x *= 0.8;
      this.leftArm.rotation.x *= 0.8;
      this.rightArm.rotation.x *= 0.8;
    }

    this.updateInteractiveZones();
    this.updateCamera(delta);
  }

  private updateCamera(delta: number) {
    // Third-person camera following behind player with smooth damping
    const targetDistance = this.state === 'sitting' ? 3.4 : this.cameraDistance;
    const targetHeight = this.state === 'sitting' ? 1.6 : 2.0;

    const camX = this.position.x - Math.sin(this.cameraYaw) * Math.cos(this.cameraPitch) * targetDistance;
    const camZ = this.position.z - Math.cos(this.cameraYaw) * Math.cos(this.cameraPitch) * targetDistance;
    const camY = this.position.y + targetHeight + Math.sin(this.cameraPitch) * targetDistance;

    // Smooth camera interpolation
    this.camera.position.x = THREE.MathUtils.damp(this.camera.position.x, camX, 8, delta);
    this.camera.position.y = THREE.MathUtils.damp(this.camera.position.y, camY, 8, delta);
    this.camera.position.z = THREE.MathUtils.damp(this.camera.position.z, camZ, 8, delta);

    const lookTarget = new THREE.Vector3(
      this.position.x,
      this.position.y + (this.state === 'sitting' ? 1.2 : 1.4),
      this.position.z
    );
    this.camera.lookAt(lookTarget);
  }

  public dispose() {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
  }
}
