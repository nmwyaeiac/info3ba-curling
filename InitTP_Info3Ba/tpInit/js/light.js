import * as THREE from './libs/three.min.js';

export function createLights() {
  const lights = new THREE.Group();

  // Lumière ambiante
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  lights.add(ambientLight);

  // Lumière directionnelle principale
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(10, 20, 5);
  directionalLight.castShadow = true;

  // Configuration des ombres
  directionalLight.shadow.mapSize.width = 2048;
  directionalLight.shadow.mapSize.height = 2048;
  directionalLight.shadow.camera.near = 0.5;
  directionalLight.shadow.camera.far = 50;
  directionalLight.shadow.camera.left = -20;
  directionalLight.shadow.camera.right = 20;
  directionalLight.shadow.camera.top = 20;
  directionalLight.shadow.camera.bottom = -20;

  lights.add(directionalLight);

  // Lumière ponctuelle pour mieux voir les pierres
  const pointLight = new THREE.PointLight(0xffffff, 0.4);
  pointLight.position.set(0, 15, 0);
  lights.add(pointLight);

  return lights;
}
