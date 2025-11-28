/**
 * ================================================
 * Classe GestionnaireCamera
 * ================================================
 * 
 * Gère les différentes caméras et leurs contrôles.
 * Permet de changer de vue facilement.
 */

class GestionnaireCamera {
  constructor(renderer) {
    this.renderer = renderer;
    this.cameras = {};
    this.cameraActive = null;
    this.controles = null;
    
    this.creerCameras();
    this.activerCamera('vue-ensemble');
  }
  
  /**
   * Crée toutes les caméras du jeu
   */
  creerCameras() {
    const aspect = window.innerWidth / window.innerHeight;
    
    // ========================================
    // CAMÉRA 1: VUE D'ENSEMBLE
    // ========================================
    // Vue globale de la piste depuis le haut
    this.cameras['vue-ensemble'] = new THREE.PerspectiveCamera(
      50,      // Angle de vue
      aspect,  // Ratio d'aspect
      0.1,     // Near clipping plane
      1000     // Far clipping plane
    );
    this.cameras['vue-ensemble'].position.set(0, 20, 25);
    this.cameras['vue-ensemble'].lookAt(0, 0, 0);
    
    // ========================================
    // CAMÉRA 2: VUE LATÉRALE
    // ========================================
    // Vue de côté pour voir les trajectoires
    this.cameras['vue-laterale'] = new THREE.PerspectiveCamera(
      60,
      aspect,
      0.1,
      500
    );
    this.cameras['vue-laterale'].position.set(15, 10, 0);
    this.cameras['vue-laterale'].lookAt(0, 0, 0);
    
    // ========================================
    // CAMÉRA 3: VUE DE LA PISTE
    // ========================================
    // Vue depuis l'extrémité de la piste
    this.cameras['vue-piste'] = new THREE.PerspectiveCamera(
      55,
      aspect,
      0.1,
      500
    );
    this.cameras['vue-piste'].position.set(0, 8, 22);
    this.cameras['vue-piste'].lookAt(0, 0, -10);
    
    // ========================================
    // CAMÉRA 4: VUE MAISON
    // ========================================
    // Vue focalisée sur la maison
    this.cameras['vue-maison'] = new THREE.PerspectiveCamera(
      45,
      aspect,
      0.1,
      200
    );
    this.cameras['vue-maison'].position.set(0, 12, -10);
    this.cameras['vue-maison'].lookAt(0, 0, -16);
  }
  
  /**
   * Active une caméra spécifique
   * @param {string} nomCamera - Nom de la caméra à activer
   */
  activerCamera(nomCamera) {
    if (this.cameras[nomCamera]) {
      this.cameraActive = this.cameras[nomCamera];
      
      // Mettre à jour les contrôles
      if (this.controles) {
        this.controles.dispose();
      }
      
      // Créer les contrôles pour la nouvelle caméra
      // Note: THREE.TrackballControls doit être chargé
      if (typeof THREE.TrackballControls !== 'undefined') {
        this.controles = new THREE.TrackballControls(
          this.cameraActive,
          this.renderer.domElement
        );
        this.controles.rotateSpeed = 1.5;
        this.controles.zoomSpeed = 1.2;
        this.controles.panSpeed = 0.8;
        this.controles.staticMoving = true;
        this.controles.dynamicDampingFactor = 0.3;
      }
    }
  }
  
  /**
   * Obtient la caméra actuellement active
   * @returns {THREE.Camera}
   */
  obtenirCameraActive() {
    return this.cameraActive;
  }
  
  /**
   * Met à jour les contrôles (à appeler dans la boucle d'animation)
   */
  mettreAJour() {
    if (this.controles) {
      this.controles.update();
    }
  }
  
  /**
   * Gère le redimensionnement de la fenêtre
   */
  gererRedimensionnement() {
    const aspect = window.innerWidth / window.innerHeight;
    
    // Mettre à jour toutes les caméras
    for (const nom in this.cameras) {
      this.cameras[nom].aspect = aspect;
      this.cameras[nom].updateProjectionMatrix();
    }
    
    // Mettre à jour le renderer
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    
    // Mettre à jour les contrôles
    if (this.controles) {
      this.controles.handleResize();
    }
  }
  
  /**
   * Obtient la liste des noms de caméras disponibles
   * @returns {Array<string>}
   */
  obtenirNomsCamera() {
    return Object.keys(this.cameras);
  }
}
