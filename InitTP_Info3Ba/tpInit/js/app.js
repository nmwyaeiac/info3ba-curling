import * as THREE from './libs/three.min.js';
import { OrbitControls } from './libs/OrbitControls.js';
import { GUI } from './libs/lil-gui.min.js';
import { CameraManager } from './camera.js';
import { createLights } from './light.js';
import { createRink } from './rink.js';
import { StoneManager } from './stone.js';
import { GameManager } from './game.js';
import { setupGUI } from './gui.js';

class CurlingGame {
  constructor() {
    this.scene = null;
    this.renderer = null;
    this.cameraManager = null;
    this.stoneManager = null;
    this.gameManager = null;
    this.gui = null;

    this.init();
  }

  init() {
    this.createScene();
    this.createRenderer();
    this.setupManagers();
    this.setupEventListeners();
    this.animate();
  }

  createScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87CEEB); // Bleu ciel

    // Ajout de la piste
    const rink = createRink();
    this.scene.add(rink);

    // Ajout des lumières
    const lights = createLights();
    this.scene.add(lights);
  }

  createRenderer() {
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.body.appendChild(this.renderer.domElement);
  }

  setupManagers() {
    // Gestionnaire de caméras
    this.cameraManager = new CameraManager(this.renderer, this.scene);

    // Gestionnaire des pierres
    this.stoneManager = new StoneManager(this.scene);

    // Gestionnaire du jeu
    this.gameManager = new GameManager(this.scene, this.stoneManager);

    // Interface utilisateur
    this.gui = setupGUI(this.gameManager, this.cameraManager, this.stoneManager);
  }

  setupEventListeners() {
    window.addEventListener('resize', () => {
      this.cameraManager.onWindowResize();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    // Mise à jour des pierres en mouvement
    this.stoneManager.update();

    // Rendu de la scène
    this.renderer.render(this.scene, this.cameraManager.getActiveCamera());
  }
}

// Démarrage du jeu
new CurlingGame();
