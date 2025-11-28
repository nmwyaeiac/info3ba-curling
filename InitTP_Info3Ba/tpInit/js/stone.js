import * as THREE from './libs/three.min.js';

export class StoneManager {
  constructor(scene) {
    this.scene = scene;
    this.stones = [];
    this.movingStones = [];

    this.setupStoneGeometries();
  }

  setupStoneGeometries() {
    // Géométrie de base pour les pierres (surfaces de révolution)
    this.stoneGeometry = this.createStoneGeometry();
  }

  createStoneGeometry() {
    // Première surface de révolution (base)
    const basePoints = [];
    for (let i = 0; i <= 10; i++) {
      const angle = (i / 10) * Math.PI;
      basePoints.push(new THREE.Vector2(
        Math.sin(angle) * 0.3 + 0.2,
        i * 0.1
      ));
    }
    const baseGeometry = new THREE.LatheGeometry(basePoints, 32);

    // Deuxième surface (corps principal) - lisse
    const bodyPoints = [];
    for (let i = 0; i <= 20; i++) {
      const angle = (i / 20) * Math.PI;
      bodyPoints.push(new THREE.Vector2(
        Math.sin(angle) * 0.4 + 0.1,
        1.0 + i * 0.08
      ));
    }
    const bodyGeometry = new THREE.LatheGeometry(bodyPoints, 32);

    // Troisième surface (bouton) - lisse
    const handlePoints = [];
    for (let i = 0; i <= 8; i++) {
      const angle = (i / 8) * Math.PI;
      handlePoints.push(new THREE.Vector2(
        Math.sin(angle) * 0.15 + 0.05,
        2.6 + i * 0.05
      ));
    }
    const handleGeometry = new THREE.LatheGeometry(handlePoints, 32);

    return { baseGeometry, bodyGeometry, handleGeometry };
  }

  createStone(team) {
    const stoneGroup = new THREE.Group();

    // Matériaux selon les contraintes
    const baseMaterial = new THREE.MeshPhongMaterial({
      color: team === 'red' ? 0xff4444 : 0x4444ff
    });

    const bodyMaterial = new THREE.MeshPhongMaterial({
      color: 0x888888 // Couleur différente pour la surface intermédiaire
    });

    const handleMaterial = new THREE.MeshPhongMaterial({
      color: team === 'red' ? 0xff4444 : 0x4444ff
    });

    // Création des trois surfaces
    const base = new THREE.Mesh(this.stoneGeometry.baseGeometry, baseMaterial);
    const body = new THREE.Mesh(this.stoneGeometry.bodyGeometry, bodyMaterial);
    const handle = new THREE.Mesh(this.stoneGeometry.handleGeometry, handleMaterial);

    // Positionnement
    base.position.y = 0;
    body.position.y = 1.0;
    handle.position.y = 2.6;

    stoneGroup.add(base);
    stoneGroup.add(body);
    stoneGroup.add(handle);

    // Propriétés physiques
    stoneGroup.userData = {
      team: team,
      velocity: new THREE.Vector3(),
      angularVelocity: 0,
      isMoving: false,
      position: new THREE.Vector3(),
      inHouse: false
    };

    return stoneGroup;
  }

  prepareNewStone(team) {
    const stone = this.createStone(team);
    stone.position.set(0, 0.5, 18); // Position de départ
    this.scene.add(stone);
    this.stones.push(stone);

    return stone;
  }

  throwStone(team, velocity, rotation, onStopCallback) {
    const stone = this.prepareNewStone(team);
    stone.userData.velocity.copy(velocity);
    stone.userData.angularVelocity = rotation;
    stone.userData.isMoving = true;
    stone.userData.onStopCallback = onStopCallback;

    this.movingStones.push(stone);
  }

  update() {
    for (let i = this.movingStones.length - 1; i >= 0; i--) {
      const stone = this.movingStones[i];

      if (stone.userData.isMoving) {
        this.updateStonePhysics(stone);

        // Vérifier si la pierre s'est arrêtée
        if (stone.userData.velocity.length() < 0.01) {
          stone.userData.isMoving = false;
          stone.userData.velocity.set(0, 0, 0);
          this.movingStones.splice(i, 1);

          if (stone.userData.onStopCallback) {
            stone.userData.onStopCallback();
          }
        }
      }
    }
  }

  updateStonePhysics(stone) {
    // Application de la friction
    stone.userData.velocity.multiplyScalar(0.98);
    stone.userData.angularVelocity *= 0.98;

    // Mise à jour de la position
    stone.position.add(stone.userData.velocity);

    // Rotation
    stone.rotation.y += stone.userData.angularVelocity;

    // Collisions avec les bords
    this.handleBoundaryCollisions(stone);

    // Collisions entre pierres
    this.handleStoneCollisions(stone);
  }

  handleBoundaryCollisions(stone) {
    const rinkBounds = { minX: -4.5, maxX: 4.5, minZ: -21, maxZ: 21 };

    if (stone.position.x < rinkBounds.minX || stone.position.x > rinkBounds.maxX) {
      stone.userData.velocity.x *= -0.5; // Rebond
      stone.position.x = THREE.MathUtils.clamp(
        stone.position.x,
        rinkBounds.minX,
        rinkBounds.maxX
      );
    }

    if (stone.position.z < rinkBounds.minZ || stone.position.z > rinkBounds.maxZ) {
      stone.userData.velocity.z *= -0.5; // Rebond
      stone.position.z = THREE.MathUtils.clamp(
        stone.position.z,
        rinkBounds.minZ,
        rinkBounds.maxZ
      );
    }
  }

  handleStoneCollisions(stone) {
    for (const otherStone of this.stones) {
      if (otherStone !== stone && otherStone.userData.isMoving) {
        const distance = stone.position.distanceTo(otherStone.position);
        const collisionDistance = 0.6; // Diamètre des pierres

        if (distance < collisionDistance) {
          this.resolveStoneCollision(stone, otherStone);
        }
      }
    }
  }

  resolveStoneCollision(stone1, stone2) {
    // Collision simple et vraisemblable (pas physiquement correcte)
    const direction = new THREE.Vector3()
      .subVectors(stone2.position, stone1.position)
      .normalize();

    const force = 0.5;

    stone1.userData.velocity.sub(direction.clone().multiplyScalar(force));
    stone2.userData.velocity.add(direction.clone().multiplyScalar(force));
  }

  calculateScore() {
    // Calcul du score selon les règles du curling
    let redScore = 0;
    let blueScore = 0;

    // Logique de calcul simplifiée
    for (const stone of this.stones) {
      const distanceToCenter = stone.position.length();
      if (distanceToCenter < 1.83) { // Dans la maison
        if (stone.userData.team === 'red') {
          redScore++;
        } else {
          blueScore++;
        }
      }
    }

    return { red: redScore, blue: blueScore };
  }

  reset() {
    for (const stone of this.stones) {
      this.scene.remove(stone);
    }
    this.stones = [];
    this.movingStones = [];
  }
}
