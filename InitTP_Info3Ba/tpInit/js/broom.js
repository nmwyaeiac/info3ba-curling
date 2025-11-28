import * as THREE from './libs/three.min.js';

export class Broom {
  constructor() {
    this.broomGroup = new THREE.Group();
    this.createBroom();
  }

  createBroom() {
    // Manche (cylindre)
    const handleGeometry = new THREE.CylinderGeometry(0.05, 0.05, 1.5, 8);
    const handleMaterial = new THREE.MeshPhongMaterial({ color: 0x8B4513 });
    const handle = new THREE.Mesh(handleGeometry, handleMaterial);
    handle.position.y = 0.75;

    // Tête (parallélépipède rectangle)
    const headGeometry = new THREE.BoxGeometry(0.4, 0.1, 0.15);
    const headMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 0.05;
    head.position.z = 0.2;

    // Poils (cônes de révolution)
    const bristlesGroup = new THREE.Group();
    const bristleGeometry = new THREE.ConeGeometry(0.02, 0.1, 8);
    const bristleMaterial = new THREE.MeshPhongMaterial({ color: 0xFFFFFF });

    // Création de plusieurs poils
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 3; j++) {
        const bristle = new THREE.Mesh(bristleGeometry, bristleMaterial);
        bristle.position.x = (i - 2) * 0.08;
        bristle.position.z = (j - 1) * 0.05;
        bristle.position.y = -0.05;
        bristle.rotation.x = Math.PI;
        bristlesGroup.add(bristle);
      }
    }

    bristlesGroup.position.y = 0;
    bristlesGroup.position.z = 0.25;

    // Assemblage
    this.broomGroup.add(handle);
    this.broomGroup.add(head);
    this.broomGroup.add(bristlesGroup);

    return this.broomGroup;
  }

  getBroom() {
    return this.broomGroup;
  }

  // Animation du balayage
  sweep(position) {
    this.broomGroup.position.copy(position);
    this.broomGroup.visible = true;

    // Animation simple de balayage
    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = (elapsed % 1000) / 1000;

      this.broomGroup.rotation.z = Math.sin(progress * Math.PI * 2) * 0.3;

      if (elapsed < 2000) {
        requestAnimationFrame(animate);
      } else {
        this.broomGroup.visible = false;
      }
    };

    animate();
  }
}
