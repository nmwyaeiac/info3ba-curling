/**
 * ================================================
 * Classe JeuCurling - Classe principale du jeu
 * ================================================
 * 
 * Orchestre tous les éléments du jeu:
 * - Initialisation de la scène
 * - Gestion des manches
 * - Lancer des pierres
 * - Calcul des scores
 * - Interface utilisateur
 */

class JeuCurling {
  constructor() {
    // Éléments de base Three.js
    this.scene = null;
    this.renderer = null;
    this.gestionnaireCameras = null;
    this.gestionnaireLumieres = null;
    
    // Éléments du jeu
    this.piste = null;
    this.gestionnaireTrajectoire = null;
    this.gestionnaireCollisions = null;
    this.gestionnaireScore = null;
    
    // Pierres
    this.pierres = [];
    this.pierresEnMouvement = [];
    
    // État du jeu
    this.equipeActuelle = 'rouge';
    this.nombreLancers = 0;
    this.lancersParManche = 10; // 5 par équipe
    
    // GUI dat.gui
    this.gui = null;
    this.parametres = {
      trajectoire: 'rectiligne',
      vitesse: 0.35,
      camera: 'vue-ensemble'
    };
    
    // Stats FPS
    this.stats = null;
    
    this.initialiser();
  }
  
  /**
   * Initialise tous les éléments du jeu
   */
  initialiser() {
    this.creerScene();
    this.creerRenderer();
    this.initialiserGestionnaires();
    this.creerPiste();
    this.configurerEvenements();
    this.creerInterface();
    this.afficherTrajectoire();
    this.demarrerAnimation();
  }
  
  /**
   * Crée la scène Three.js
   */
  creerScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87CEEB); // Bleu ciel
    
    // Brouillard pour effet de profondeur
    this.scene.fog = new THREE.Fog(0x87CEEB, 50, 100);
  }
  
  /**
   * Crée le renderer WebGL
   */
  creerRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false
    });
    
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    
    // Configuration des ombres
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    // Ajouter le canvas au DOM
    const conteneur = document.getElementById('conteneur-webgl');
    conteneur.appendChild(this.renderer.domElement);
  }
  
  /**
   * Initialise tous les gestionnaires
   */
  initialiserGestionnaires() {
    // Gestionnaire de caméras
    this.gestionnaireCameras = new GestionnaireCamera(this.renderer);
    
    // Gestionnaire de lumières
    this.gestionnaireLumieres = new GestionnaireLumiere(this.scene);
  }
  
  /**
   * Crée la piste et initialise les gestionnaires associés
   */
  creerPiste() {
    // Créer la piste
    this.piste = new Piste(this.scene);
    
    // Gestionnaire de trajectoires
    this.gestionnaireTrajectoire = new GestionnaireTrajectoire(this.scene);
    
    // Gestionnaire de collisions
    this.gestionnaireCollisions = new GestionnaireCollisions(this.piste);
    
    // Gestionnaire de score
    this.gestionnaireScore = new GestionnaireScore(this.piste);
    this.gestionnaireScore.mettreAJourNumeroManche();
  }
  
  /**
   * Configure les événements (clavier, souris, fenêtre)
   */
  configurerEvenements() {
    // Redimensionnement de la fenêtre
    window.addEventListener('resize', () => {
      this.gestionnaireCameras.gererRedimensionnement();
    });
    
    // Événements clavier
    window.addEventListener('keydown', (e) => this.gererClavier(e));
    
    // Clic sur le canvas
    this.renderer.domElement.addEventListener('click', (e) => {
      this.changerTrajectoire();
    });
  }
  
  /**
   * Gère les événements clavier
   * @param {KeyboardEvent} event
   */
  gererClavier(event) {
    switch(event.code) {
      case 'Space':
        event.preventDefault();
        this.lancerPierre();
        break;
        
      case 'KeyL':
        this.parametres.trajectoire = 'rectiligne';
        this.afficherTrajectoire();
        break;
        
      case 'KeyC':
        this.parametres.trajectoire = 'courbe';
        this.afficherTrajectoire();
        break;
        
      case 'KeyR':
        this.reinitialiserJeu();
        break;
        
      case 'Digit1':
        this.gestionnaireCameras.activerCamera('vue-ensemble');
        break;
        
      case 'Digit2':
        this.gestionnaireCameras.activerCamera('vue-piste');
        break;
        
      case 'Digit3':
        this.gestionnaireCameras.activerCamera('vue-laterale');
        break;
        
      case 'Digit4':
        this.gestionnaireCameras.activerCamera('vue-maison');
        break;
    }
  }
  
  /**
   * Change le type de trajectoire (clic)
   */
  changerTrajectoire() {
    if (this.pierresEnMouvement.length > 0) return;
    
    this.parametres.trajectoire = 
      this.parametres.trajectoire === 'rectiligne' ? 'courbe' : 'rectiligne';
    
    this.afficherTrajectoire();
  }
  
  /**
   * Affiche la trajectoire actuelle
   */
  afficherTrajectoire() {
    const couleur = this.equipeActuelle === 'rouge' ? 0xff0000 : 0x0000ff;
    this.gestionnaireTrajectoire.afficherTrajectoire(
      this.parametres.trajectoire,
      couleur
    );
  }
  
  /**
   * Lance une pierre
   */
  lancerPierre() {
    // Ne pas lancer si une pierre est déjà en mouvement
    if (this.pierresEnMouvement.length > 0) return;
    
    // Créer la pierre
    const pierre = new Pierre(this.equipeActuelle);
    pierre.definirPosition(0, pierre.rayon, 20);
    
    this.scene.add(pierre.obtenirGroupe());
    this.pierres.push(pierre);
    
    // Obtenir les points de la trajectoire
    const points = this.gestionnaireTrajectoire.obtenirPoints();
    
    // Lancer la pierre avec callback
    pierre.lancer(points, this.parametres.vitesse, () => {
      this.pierreArretee(pierre);
    });
    
    this.pierresEnMouvement.push(pierre);
    
    // Cacher la trajectoire pendant le lancer
    setTimeout(() => {
      this.gestionnaireTrajectoire.supprimerTrajectoire();
    }, 300);
  }
  
  /**
   * Appelé quand une pierre s'arrête
   * @param {Pierre} pierre
   */
  pierreArretee(pierre) {
    // Retirer de la liste des pierres en mouvement
    const index = this.pierresEnMouvement.indexOf(pierre);
    if (index > -1) {
      this.pierresEnMouvement.splice(index, 1);
    }
    
    // Si toutes les pierres sont arrêtées, passer au tour suivant
    if (this.pierresEnMouvement.length === 0) {
      setTimeout(() => {
        this.tourSuivant();
      }, 500);
    }
  }
  
  /**
   * Passe au tour suivant
   */
  tourSuivant() {
    this.nombreLancers++;
    
    // Vérifier si la manche est terminée
    if (this.nombreLancers >= this.lancersParManche) {
      this.terminerManche();
    } else {
      // Changer d'équipe
      this.equipeActuelle = this.equipeActuelle === 'rouge' ? 'bleu' : 'rouge';
      this.mettreAJourInterface();
      this.afficherTrajectoire();
    }
  }
  
  /**
   * Termine la manche et calcule le score
   */
  terminerManche() {
    // Calculer le score
    const resultat = this.gestionnaireScore.calculerScore(this.pierres);
    
    // Enregistrer le score
    this.gestionnaireScore.enregistrerScore(resultat.rouge, resultat.bleu);
    
    // Afficher dans le tableau
    this.gestionnaireScore.mettreAJourAffichage(
      resultat.rouge,
      resultat.bleu,
      resultat.gagnant
    );
    
    // Afficher un message
    if (resultat.gagnant) {
      const message = resultat.gagnant === 'rouge' ? 
        `Équipe Rouge marque ${resultat.rouge} point(s) !` :
        `Équipe Bleue marque ${resultat.bleu} point(s) !`;
      
      console.log(message);
    } else {
      console.log('Aucune pierre dans la maison - Pas de score');
    }
    
    // Préparer la manche suivante
    setTimeout(() => {
      this.preparerNouvelleManche();
    }, 2000);
  }
  
  /**
   * Prépare une nouvelle manche
   */
  preparerNouvelleManche() {
    // Retirer toutes les pierres de la scène
    for (const pierre of this.pierres) {
      this.scene.remove(pierre.obtenirGroupe());
    }
    
    this.pierres = [];
    this.pierresEnMouvement = [];
    this.nombreLancers = 0;
    
    // L'équipe qui n'a pas marqué commence
    // (règle simplifiée - normalement c'est plus complexe)
    
    this.mettreAJourInterface();
    this.gestionnaireScore.mettreAJourNumeroManche();
    this.afficherTrajectoire();
  }
  
  /**
   * Met à jour les pierres en mouvement
   */
  mettreAJourPierres() {
    for (let i = this.pierresEnMouvement.length - 1; i >= 0; i--) {
      const pierre = this.pierresEnMouvement[i];
      
      // Mettre à jour la position de la pierre
      pierre.mettreAJour();
      
      // Gérer les collisions
      this.gestionnaireCollisions.gererCollisions(pierre, this.pierres);
      
      // Vérifier si sortie de la piste
      if (this.gestionnaireCollisions.estHorsLimites(pierre)) {
        this.scene.remove(pierre.obtenirGroupe());
        const index = this.pierres.indexOf(pierre);
        if (index > -1) this.pierres.splice(index, 1);
        this.pierresEnMouvement.splice(i, 1);
      }
    }
  }
  
  /**
   * Met à jour l'interface utilisateur
   */
  mettreAJourInterface() {
    // Équipe actuelle
    const elementEquipe = document.getElementById('nom-equipe');
    const nomEquipe = this.equipeActuelle === 'rouge' ? 'Rouge' : 'Bleu';
    elementEquipe.textContent = nomEquipe;
    elementEquipe.className = `equipe-${this.equipeActuelle}`;
    
    // Lancers restants
    const lancersRestants = this.lancersParManche - this.nombreLancers;
    document.getElementById('nombre-lancers').textContent = lancersRestants;
  }
  
  /**
   * Réinitialise complètement le jeu
   */
  reinitialiserJeu() {
    // Retirer toutes les pierres
    for (const pierre of this.pierres) {
      this.scene.remove(pierre.obtenirGroupe());
    }
    
    this.pierres = [];
    this.pierresEnMouvement = [];
    this.nombreLancers = 0;
    this.equipeActuelle = 'rouge';
    
    // Réinitialiser les scores
    this.gestionnaireScore.reinitialiser();
    this.gestionnaireScore.mettreAJourNumeroManche();
    
    this.mettreAJourInterface();
    this.afficherTrajectoire();
  }
  
  /**
   * Crée l'interface dat.GUI
   */
  creerInterface() {
    // Vérifier si dat.GUI est disponible
    if (typeof dat === 'undefined' || !dat.GUI) {
      console.log('dat.GUI non disponible');
      return;
    }
    
    this.gui = new dat.GUI();
    
    // Dossier Jeu
    const dossierJeu = this.gui.addFolder('Contrôles du Jeu');
    
    dossierJeu.add(this.parametres, 'trajectoire', ['rectiligne', 'courbe'])
      .name('Type de trajectoire')
      .onChange(() => this.afficherTrajectoire());
    
    dossierJeu.add(this.parametres, 'vitesse', 0.1, 0.8, 0.05)
      .name('Vitesse de lancer');
    
    dossierJeu.add(this, 'lancerPierre').name('Lancer (Espace)');
    dossierJeu.add(this, 'reinitialiserJeu').name('Recommencer (R)');
    
    dossierJeu.open();
    
    // Dossier Caméras
    const dossierCamera = this.gui.addFolder('Caméras');
    
    const cameras = {
      'Vue Ensemble': 'vue-ensemble',
      'Vue Piste': 'vue-piste',
      'Vue Latérale': 'vue-laterale',
      'Vue Maison': 'vue-maison'
    };
    
    dossierCamera.add(this.parametres, 'camera', cameras)
      .name('Caméra active')
      .onChange((valeur) => {
        this.gestionnaireCameras.activerCamera(valeur);
      });
    
    dossierCamera.open();
    
    // Créer les stats FPS si disponible
    if (typeof Stats !== 'undefined') {
      this.stats = new Stats();
      this.stats.showPanel(0); // 0: fps, 1: ms, 2: mb
      document.getElementById('stats-container').appendChild(this.stats.dom);
    }
  }
  
  /**
   * Boucle d'animation principale
   */
  animer() {
    requestAnimationFrame(() => this.animer());
    
    // Stats FPS
    if (this.stats) this.stats.begin();
    
    // Mise à jour des éléments
    this.mettreAJourPierres();
    this.gestionnaireCameras.mettreAJour();
    
    // Rendu
    this.renderer.render(
      this.scene,
      this.gestionnaireCameras.obtenirCameraActive()
    );
    
    // Stats FPS
    if (this.stats) this.stats.end();
  }
  
  /**
   * Démarre l'animation
   */
  demarrerAnimation() {
    this.animer();
  }
}

// ================================================
// DÉMARRAGE DU JEU
// ================================================
// Attendre que le DOM soit chargé
window.addEventListener('DOMContentLoaded', () => {
  // Créer et démarrer le jeu
  const jeu = new JeuCurling();
  
  console.log('===========================================');
  console.log('Projet Curling - Info3Ba 2025-2026');
  console.log('===========================================');
  console.log('Contrôles:');
  console.log('  - Espace: Lancer la pierre');
  console.log('  - Clic: Changer de trajectoire');
  console.log('  - L: Trajectoire rectiligne');
  console.log('  - C: Trajectoire courbe');
  console.log('  - R: Réinitialiser le jeu');
  console.log('  - 1/2/3/4: Changer de caméra');
  console.log('===========================================');
});
