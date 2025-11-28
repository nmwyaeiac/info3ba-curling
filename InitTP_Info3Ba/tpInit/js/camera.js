import * as THREE from './libs/three.min.js';
import { OrbitControls } from './libs/OrbitControls.js';

export class CameraManager {
  constructor(renderer, scene) {
    this.renderer = renderer;
    this.scene = scene;
    this.cameras = {};
    this.activeCamera = null;
    this.controls = null;

    this.createCameras();
    this.setupControls();
    this.setActiveCamera('overview');
  }

  createCameras() {
    // Vue d'ensemble
    this.cameras.overview = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.cameras.overview.position.set(0, 25, 30);
    this.cameras.overview.lookAt(0, 0, 0);

    // Vue piste
    this.cameras.rink = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      500
    );
    this.cameras.rink.position.set(0, 12, 15);
    this.cameras.rink.lookAt(0, 0, -10);

    // Vue latérale
    this.cameras.side = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      500
    );
    this.cameras.side.position.set(15, 8, 0);
    this.cameras.side.lookAt(0, 0, 0);
  }

  setupControls() {
    this.controls = new OrbitControls(this.cameras.overview, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
  }

  setActiveCamera(cameraName) {
    if (this.cameras[cameraName]) {
      this.activeCamera = this.cameras[cameraName];
      this.controls.object = this.activeCamera;
      this.controls.update();
    }
  }

  getActiveCamera() {
    return this.activeCamera;
  }

  onWindowResize() {
    Object.values(this.cameras).forEach(camera => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    });
  }
}
