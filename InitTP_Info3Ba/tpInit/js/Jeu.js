/**
 * Classe Jeu - Classe principale du jeu de curling
 */

class Jeu {
  constructor() {
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controles = null;
    
    this.piste = null;
    this.trajectoire = null;
    this.collision = null;
    this.score = null;
    this.balai = null;
    
    this.pierres = [];
    this.pierresEnMouvement = [];
    
    this.equipeActuelle = 'rouge';
    this.nombreLancers = 0;
    this.lancersParManche = 10;
    
    this.gui = null;
    this.params = {
      typeTrajectoire: 'rectiligne',
      vitesse: 0.18,
      afficherBalai: true
    };
    
    this.scoreCalcule = false;
    
    this.initialiser();
  }
  
  /**
   * Initialise le jeu
   */
  initialiser() {
    this.creerScene();
    this.creerCamera();
    this.creerRenderer();
    this.creerControles();
    this.creerLumieres();
    this.creerPiste();
    this.creerBalai();
    this.creerGUI();
    this.configurerEvenements();
    this.afficherTrajectoire();
    this.demarrer();
  }
  
  /**
   * Crée la scène
   */
  creerScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x8fd3f4);
    this.scene.fog = new THREE.Fog(0x8fd3f4, 45, 90);
  }
  
  /**
   * Crée la caméra
   */
  creerCamera() {
    this.camera = new THREE.PerspectiveCamera(
      60,
      (window.innerWidth - 300) / (window.innerHeight - 70),
      0.1,
      800
    );
    this.camera.position.set(0, 18, 28);
    this.camera.lookAt(0, 0, 0);
  }
  
  /**
   * Crée le renderer
   */
  creerRenderer() {
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth - 300, window.innerHeight - 70);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    document.getElementById('conteneur-webgl').appendChild(this.renderer.domElement);
  }
  
  /**
   * Crée les contrôles
   */
  creerControles() {
    this.controles = new THREE.OrbitControls(this.camera, this.renderer.domElement);
    this.controles.enableDamping = true;
    this.controles.dampingFactor = 0.05;
    this.controles.maxPolarAngle = Math.PI / 2 - 0.1;
  }
  
  /**
   * Crée les lumières
   */
  creerLumieres() {
    const ambiante = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambiante);
    
    const directionnelle = new THREE.DirectionalLight(0xffffff, 0.7);
    directionnelle.position.set(9, 18, 9);
    directionnelle.castShadow = true;
    directionnelle.shadow.mapSize.width = 2048;
    directionnelle.shadow.mapSize.height = 2048;
    directionnelle.shadow.camera.left = -25;
    directionnelle.shadow.camera.right = 25;
    directionnelle.shadow.camera.top = 25;
    directionnelle.shadow.camera.bottom = -25;
    this.scene.add(directionnelle);
    
    const ponctuelle = new THREE.PointLight(0xffffff, 0.3, 45);
    ponctuelle.position.set(0, 13, 0);
    this.scene.add(ponctuelle);
  }
  
  /**
   * Crée la piste
   */
  creerPiste() {
    this.piste = new Piste(this.scene);
    this.trajectoire = new Trajectoire(this.scene);
    this.collision = new Collision(this.piste);
    this.score = new Score(this.piste);
    this.score.mettreAJourNumero();
  }
  
  /**
   * Crée le balai
   */
  creerBalai() {
    this.balai = new Balai();
    this.scene.add(this.balai.obtenirGroupe());
  }
  
  /**
   * Crée le GUI
   */
  creerGUI() {
    if (typeof dat === 'undefined') return;
    
    this.gui = new dat.GUI({ width: 320 });
    
    const dossierJeu = this.gui.addFolder('🎮 Contrôles');
    dossierJeu.add(this.params, 'typeTrajectoire', ['rectiligne', 'courbe'])
      .name('Trajectoire')
      .onChange(() => this.afficherTrajectoire());
    
    dossierJeu.add(this.params, 'vitesse', 0.1, 0.25, 0.01)
      .name('Vitesse');
    
    dossierJeu.add(this.params, 'afficherBalai')
      .name('Afficher balai');
    
    dossierJeu.add(this, 'lancerPierre').name('🥌 Lancer (ESPACE)');
    dossierJeu.add(this, 'reinitialiser').name('🔄 Réinitialiser (R)');
    dossierJeu.open();
    
    const dossierBezier = this.gui.addFolder('📐 Points de Contrôle');
    const pc = this.trajectoire.obtenirPointsControle();
    
    const cp1 = dossierBezier.addFolder('Point 1 (Quad)');
    cp1.add(pc, 'pc1x', -4, 4, 0.1).name('X').onChange(() => this.majTrajectoire());
    cp1.add(pc, 'pc1z', -20, 20, 0.5).name('Z').onChange(() => this.majTrajectoire());
    
    const cp2 = dossierBezier.addFolder('Point 2 (Cubique)');
    cp2.add(pc, 'pc2x', -4, 4, 0.1).name('X').onChange(() => this.majTrajectoire());
    cp2.add(pc, 'pc2z', -20, 20, 0.5).name('Z').onChange(() => this.majTrajectoire());
    
    const cp3 = dossierBezier.addFolder('Point 3 (Cubique)');
    cp3.add(pc, 'pc3x', -4, 4, 0.1).name('X').onChange(() => this.majTrajectoire());
    cp3.add(pc, 'pc3z', -20, 20, 0.5).name('Z').onChange(() => this.majTrajectoire());
    
    const cp4 = dossierBezier.addFolder('Point 4 (Quad)');
    cp4.add(pc, 'pc4x', -4, 4, 0.1).name('X').onChange(() => this.majTrajectoire());
    cp4.add(pc, 'pc4z', -20, 20, 0.5).name('Z').onChange(() => this.majTrajectoire());
    
    const dossierCamera = this.gui.addFolder('📷 Caméras');
    dossierCamera.add({ vue1: () => this.changerVue(0, 18, 28) }, 'vue1').name('Vue Ensemble');
    dossierCamera.add({ vue2: () => this.changerVue(0, 8, 23) }, 'vue2').name('Vue Piste');
    dossierCamera.add({ vue3: () => this.changerVue(12, 10, 0) }, 'vue3').name('Vue Latérale');
    dossierCamera.add({ vue4: () => this.changerVue(0, 10, -12) }, 'vue4').name('Vue Maison');
    dossierCamera.open();
  }
  
  /**
   * Configure les événements
   */
  configurerEvenements() {
    window.addEventListener('resize', () => this.gererRedimensionnement());
    window.addEventListener('keydown', (e) => this.gererClavier(e));
  }
  
  /**
   * Gère le redimensionnement
   */
  gererRedimensionnement() {
    this.camera.aspect = (window.innerWidth - 300) / (window.innerHeight - 70);
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth - 300, window.innerHeight - 70);
  }
  
  /**
   * Gère le clavier
   */
  gererClavier(event) {
    switch(event.code) {
      case 'Space':
        event.preventDefault();
        this.lancerPierre();
        break;
      case 'KeyL':
        this.params.typeTrajectoire = 'rectiligne';
        this.afficherTrajectoire();
        this.afficherNotification('Trajectoire rectiligne');
        break;
      case 'KeyC':
        this.params.typeTrajectoire = 'courbe';
        this.afficherTrajectoire();
        this.afficherNotification('Trajectoire courbe');
        break;
      case 'KeyR':
        this.reinitialiser();
        break;
      case 'Digit1':
        this.changerVue(0, 18, 28);
        break;
      case 'Digit2':
        this.changerVue(0, 8, 23);
        break;
      case 'Digit3':
        this.changerVue(12, 10, 0);
        break;
      case 'Digit4':
        this.changerVue(0, 10, -12);
        break;
    }
  }
  
  /**
   * Change la vue de la caméra
   */
  changerVue(x, y, z) {
    this.camera.position.set(x, y, z);
    this.camera.lookAt(0, 0, 0);
  }
  
  /**
   * Affiche une notification
   */
  afficherNotification(message) {
    const notif = document.getElementById('notification');
    notif.textContent = message;
    notif.classList.add('visible');
    
    setTimeout(() => {
      notif.classList.remove('visible');
    }, 2000);
  }
  
  /**
   * Affiche la trajectoire
   */
  afficherTrajectoire() {
    const couleur = this.equipeActuelle === 'rouge' ? 0xff6b6b : 0x4ecdc4;
    this.trajectoire.afficher(this.params.typeTrajectoire, couleur);
  }
  
  /**
   * Met à jour la trajectoire
   */
  majTrajectoire() {
    if (this.params.typeTrajectoire === 'courbe') {
      this.trajectoire.mettreAJourSpheres();
      this.afficherTrajectoire();
    }
  }
  
  /**
   * Lance une pierre
   */
  lancerPierre() {
    if (this.pierresEnMouvement.length > 0) {
      this.afficherNotification('⚠️ Attendez la fin du lancer');
      return;
    }
    
    const pierre = new Pierre(this.equipeActuelle);
    pierre.definirPosition(0, pierre.rayon, 21);
    
    this.scene.add(pierre.obtenirGroupe());
    this.pierres.push(pierre);
    
    const points = this.trajectoire.obtenirPoints();
    pierre.lancer(points, this.params.vitesse, () => {
      this.pierreArretee(pierre);
    });
    
    this.pierresEnMouvement.push(pierre);
    
    if (this.params.afficherBalai) {
      this.balai.commencer(pierre);
    }
    
    setTimeout(() => {
      this.trajectoire.supprimer();
    }, 250);
    
    this.scoreCalcule = false;
    this.afficherNotification('🥌 Pierre lancée !');
  }
  
  /**
   * Gère l'arrêt d'une pierre
   */
  pierreArretee(pierre) {
    const index = this.pierresEnMouvement.indexOf(pierre);
    if (index > -1) {
      this.pierresEnMouvement.splice(index, 1);
    }
    
    if (this.balai && this.balai.estActif()) {
      this.balai.arreter();
    }
    
    if (this.pierresEnMouvement.length === 0) {
      setTimeout(() => this.tourSuivant(), 450);
    }
  }
  
  /**
   * Passe au tour suivant
   */
  tourSuivant() {
    this.nombreLancers++;
    
    if (this.nombreLancers >= this.lancersParManche) {
      this.terminerManche();
    } else {
      this.equipeActuelle = this.equipeActuelle === 'rouge' ? 'bleu' : 'rouge';
      this.mettreAJourInterface();
      this.afficherTrajectoire();
    }
  }
  
  /**
   * Termine une manche
   */
  terminerManche() {
    const resultat = this.score.calculer(this.pierres);
    this.score.enregistrer(resultat.rouge, resultat.bleu);
    this.score.mettreAJourAffichage(resultat.rouge, resultat.bleu, resultat.gagnant);
    
    this.mettreAJourMeneur();
    
    if (resultat.gagnant) {
      const nomEquipe = resultat.gagnant === 'rouge' ? 'Rouge' : 'Bleue';
      const pts = resultat[resultat.gagnant];
      this.afficherNotification(`🎯 Équipe ${nomEquipe}: ${pts} point${pts > 1 ? 's' : ''} !`);
    } else {
      this.afficherNotification('Aucun point marqué');
    }
    
    setTimeout(() => this.preparerNouvelleManche(), 2800);
  }
  
  /**
   * Met à jour l'affichage du meneur
   */
  mettreAJourMeneur() {
    const meneur = this.score.obtenirMeneur();
    const totalRouge = this.score.obtenirTotal('rouge');
    const totalBleu = this.score.obtenirTotal('bleu');
    
    const texte = document.getElementById('texte-meneur');
    
    if (meneur === 'rouge') {
      texte.innerHTML = `🏆 <span class="rouge">Rouge</span> mène ${totalRouge}-${totalBleu}`;
    } else if (meneur === 'bleu') {
      texte.innerHTML = `🏆 <span class="bleu">Bleu</span> mène ${totalBleu}-${totalRouge}`;
    } else {
      texte.innerHTML = `⚖️ Égalité ${totalRouge}-${totalBleu}`;
    }
  }
  
  /**
   * Prépare une nouvelle manche
   */
  preparerNouvelleManche() {
    for (const pierre of this.pierres) {
      this.scene.remove(pierre.obtenirGroupe());
    }
    
    this.pierres = [];
    this.pierresEnMouvement = [];
    this.nombreLancers = 0;
    
    this.mettreAJourInterface();
    this.score.mettreAJourNumero();
    this.afficherTrajectoire();
  }
  
  /**
   * Met à jour les pierres en mouvement
   */
  mettreAJourPierres() {
    for (let i = this.pierresEnMouvement.length - 1; i >= 0; i--) {
      const pierre = this.pierresEnMouvement[i];
      
      pierre.mettreAJour();
      this.collision.gerer(pierre, this.pierres);
      
      if (this.collision.estHorsLimites(pierre)) {
        this.scene.remove(pierre.obtenirGroupe());
        const idx = this.pierres.indexOf(pierre);
        if (idx > -1) this.pierres.splice(idx, 1);
        this.pierresEnMouvement.splice(i, 1);
      }
    }
    
    if (this.balai) this.balai.mettreAJour();
  }
  
  /**
   * Met à jour l'interface
   */
  mettreAJourInterface() {
    const elemEquipe = document.getElementById('equipe-courante');
    const nomEquipe = this.equipeActuelle === 'rouge' ? 'Rouge' : 'Bleue';
    elemEquipe.textContent = nomEquipe;
    elemEquipe.className = `valeur ${this.equipeActuelle}`;
    
    const lancersRestants = this.lancersParManche - this.nombreLancers;
    document.getElementById('lancers-restants').textContent = lancersRestants;
  }
  
  /**
   * Réinitialise le jeu
   */
  reinitialiser() {
    if (this.balai && this.balai.estActif()) {
      this.balai.arreter();
    }
    
    for (const pierre of this.pierres) {
      this.scene.remove(pierre.obtenirGroupe());
    }
    
    this.pierres = [];
    this.pierresEnMouvement = [];
    this.nombreLancers = 0;
    this.equipeActuelle = 'rouge';
    
    this.score.reinitialiser();
    this.score.mettreAJourNumero();
    
    document.getElementById('texte-meneur').textContent = 'Début de partie';
    
    this.mettreAJourInterface();
    this.afficherTrajectoire();
    
    this.afficherNotification('🔄 Jeu réinitialisé');
  }
  
  /**
   * Boucle d'animation
   */
  animer() {
    requestAnimationFrame(() => this.animer());
    
    this.mettreAJourPierres();
    this.controles.update();
    this.renderer.render(this.scene, this.camera);
  }
  
  /**
   * Démarre le jeu
   */
  demarrer() {
    this.animer();
  }
}

// Démarrage du jeu au chargement de la page
window.addEventListener('DOMContentLoaded', () => {
  const jeu = new Jeu();
  
  console.log('========================================');
  console.log('🥌 Projet Curling - Info3Ba 2025-2026');
  console.log('========================================');
  console.log('✅ 3 surfaces de révolution avec G1');
  console.log('✅ 2 lathe lisses qui se raccordent');
  console.log('✅ Surface intermédiaire couleur différente');
  console.log('✅ Balai avec opérations CSG conceptuelles');
  console.log('✅ Trajectoire rectiligne');
  console.log('✅ Trajectoire courbe (2 quad + 1 cubique)');
  console.log('✅ Continuité G1 entre courbes');
  console.log('✅ Points de contrôle modifiables');
  console.log('✅ Collisions vraisemblables');
  console.log('✅ Score selon règles du curling');
  console.log('========================================');
});
