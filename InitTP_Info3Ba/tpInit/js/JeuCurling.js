/**
 * ================================================
 * Classe JeuCurling - Classe principale
 * ================================================
 */

class JeuCurling {
  constructor() {
    this.scene = null;
    this.renderer = null;
    this.gestionnaireCameras = null;
    this.gestionnaireLumieres = null;
    
    this.piste = null;
    this.gestionnaireTrajectoire = null;
    this.gestionnaireCollisions = null;
    this.gestionnaireScore = null;
    
    // DEUX balais (gauche et droite)
    this.balaiGauche = null;
    this.balaiDroit = null;
    
    this.pierres = [];
    this.pierresEnMouvement = [];
    
    this.equipeActuelle = 'rouge';
    this.nombreLancers = 0;
    this.lancersParManche = 10;
    
    this.gui = null;
    this.parametres = {
      trajectoire: 'rectiligne',
      vitesse: 0.20,
      camera: 'vue-ensemble',
      afficherBalais: true
    };
    
    this.stats = null;
    
    this.initialiser();
  }
  
  initialiser() {
    this.creerScene();
    this.creerRenderer();
    this.initialiserGestionnaires();
    this.creerPiste();
    this.creerBalais();
    this.configurerEvenements();
    this.creerInterface();
    this.afficherTrajectoire();
    this.demarrerAnimation();
  }
  
  creerScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87CEEB);
    this.scene.fog = new THREE.Fog(0x87CEEB, 50, 100);
  }
  
  creerRenderer() {
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth - 320, window.innerHeight - 80);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    const conteneur = document.getElementById('conteneur-webgl');
    conteneur.appendChild(this.renderer.domElement);
  }
  
  initialiserGestionnaires() {
    this.gestionnaireCameras = new GestionnaireCamera(this.renderer);
    this.gestionnaireLumieres = new GestionnaireLumiere(this.scene);
  }
  
  creerPiste() {
    this.piste = new Piste(this.scene);
    this.gestionnaireTrajectoire = new GestionnaireTrajectoire(this.scene);
    this.gestionnaireCollisions = new GestionnaireCollisions(this.piste);
    this.gestionnaireScore = new GestionnaireScore(this.piste);
    this.gestionnaireScore.mettreAJourNumeroManche();
  }
  
  /**
   * Crée DEUX balais (gauche et droit)
   */
  creerBalais() {
    this.balaiGauche = new Balai('gauche');
    this.balaiDroit = new Balai('droit');
    
    this.scene.add(this.balaiGauche.obtenirGroupe());
    this.scene.add(this.balaiDroit.obtenirGroupe());
  }
  
  configurerEvenements() {
    window.addEventListener('resize', () => {
      this.gestionnaireCameras.gererRedimensionnement();
      this.renderer.setSize(window.innerWidth - 320, window.innerHeight - 80);
    });
    
    window.addEventListener('keydown', (e) => this.gererClavier(e));
    this.renderer.domElement.addEventListener('click', () => this.changerTrajectoire());
  }
  
  gererClavier(event) {
    switch(event.code) {
      case 'Space':
        event.preventDefault();
        this.lancerPierre();
        break;
      case 'KeyL':
        this.parametres.trajectoire = 'rectiligne';
        this.afficherTrajectoire();
        this.afficherNotification('Trajectoire rectiligne');
        break;
      case 'KeyC':
        this.parametres.trajectoire = 'courbe';
        this.afficherTrajectoire();
        this.afficherNotification('Trajectoire courbe');
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
  
  afficherNotification(message) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.classList.add('visible');
    
    setTimeout(() => {
      notification.classList.remove('visible');
    }, 2000);
  }
  
  changerTrajectoire() {
    if (this.pierresEnMouvement.length > 0) return;
    
    this.parametres.trajectoire = 
      this.parametres.trajectoire === 'rectiligne' ? 'courbe' : 'rectiligne';
    
    this.afficherTrajectoire();
  }
  
  afficherTrajectoire() {
    const couleur = this.equipeActuelle === 'rouge' ? 0xff6b6b : 0x4ecdc4;
    this.gestionnaireTrajectoire.afficherTrajectoire(
      this.parametres.trajectoire,
      couleur
    );
  }
  
  lancerPierre() {
    if (this.pierresEnMouvement.length > 0) {
      this.afficherNotification('⚠️ Attendez la fin du lancer');
      return;
    }
    
    const pierre = new Pierre(this.equipeActuelle);
    pierre.definirPosition(0, pierre.rayon, 20);
    
    this.scene.add(pierre.obtenirGroupe());
    this.pierres.push(pierre);
    
    const points = this.gestionnaireTrajectoire.obtenirPoints();
    
    pierre.lancer(points, this.parametres.vitesse, () => {
      this.pierreArretee(pierre);
    });
    
    this.pierresEnMouvement.push(pierre);
    
    // Démarrer les DEUX balais
    if (this.parametres.afficherBalais) {
      this.balaiGauche.commencerBalayage(pierre);
      this.balaiDroit.commencerBalayage(pierre);
    }
    
    setTimeout(() => {
      this.gestionnaireTrajectoire.supprimerTrajectoire();
    }, 300);
    
    this.afficherNotification('🥌 Pierre lancée !');
  }
  
  pierreArretee(pierre) {
    const index = this.pierresEnMouvement.indexOf(pierre);
    if (index > -1) {
      this.pierresEnMouvement.splice(index, 1);
    }
    
    // Arrêter les deux balais
    if (this.balaiGauche && this.balaiGauche.estEnBalayage()) {
      this.balaiGauche.arreterBalayage();
    }
    if (this.balaiDroit && this.balaiDroit.estEnBalayage()) {
      this.balaiDroit.arreterBalayage();
    }
    
    if (this.pierresEnMouvement.length === 0) {
      setTimeout(() => this.tourSuivant(), 500);
    }
  }
  
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
  
  terminerManche() {
    const resultat = this.gestionnaireScore.calculerScore(this.pierres);
    this.gestionnaireScore.enregistrerScore(resultat.rouge, resultat.bleu);
    this.gestionnaireScore.mettreAJourAffichage(
      resultat.rouge,
      resultat.bleu,
      resultat.gagnant
    );
    
    this.mettreAJourMeneur();
    
    if (resultat.gagnant) {
      const nomEquipe = resultat.gagnant === 'rouge' ? 'Rouge' : 'Bleue';
      const score = resultat[resultat.gagnant];
      this.afficherNotification(
        `🎯 Équipe ${nomEquipe}: ${score} point${score > 1 ? 's' : ''} !`
      );
    } else {
      this.afficherNotification('Aucun point marqué');
    }
    
    setTimeout(() => this.preparerNouvelleManche(), 3000);
  }
  
  mettreAJourMeneur() {
    const meneur = this.gestionnaireScore.obtenirMeneur();
    const totalRouge = this.gestionnaireScore.obtenirTotal('rouge');
    const totalBleu = this.gestionnaireScore.obtenirTotal('bleu');
    
    const meneurTexte = document.getElementById('meneur-texte');
    
    if (meneur === 'rouge') {
      meneurTexte.innerHTML = `🏆 <span class="equipe-rouge">Équipe Rouge</span> mène ${totalRouge}-${totalBleu}`;
    } else if (meneur === 'bleu') {
      meneurTexte.innerHTML = `🏆 <span class="equipe-bleue">Équipe Bleue</span> mène ${totalBleu}-${totalRouge}`;
    } else {
      meneurTexte.innerHTML = `⚖️ Égalité ${totalRouge}-${totalBleu}`;
    }
  }
  
  preparerNouvelleManche() {
    for (const pierre of this.pierres) {
      this.scene.remove(pierre.obtenirGroupe());
    }
    
    this.pierres = [];
    this.pierresEnMouvement = [];
    this.nombreLancers = 0;
    
    this.mettreAJourInterface();
    this.gestionnaireScore.mettreAJourNumeroManche();
    this.afficherTrajectoire();
  }
  
  mettreAJourPierres() {
    for (let i = this.pierresEnMouvement.length - 1; i >= 0; i--) {
      const pierre = this.pierresEnMouvement[i];
      
      pierre.mettreAJour();
      this.gestionnaireCollisions.gererCollisions(pierre, this.pierres);
      
      if (this.gestionnaireCollisions.estHorsLimites(pierre)) {
        this.scene.remove(pierre.obtenirGroupe());
        const index = this.pierres.indexOf(pierre);
        if (index > -1) this.pierres.splice(index, 1);
        this.pierresEnMouvement.splice(i, 1);
      }
    }
    
    // Mettre à jour les DEUX balais
    if (this.balaiGauche) this.balaiGauche.mettreAJour();
    if (this.balaiDroit) this.balaiDroit.mettreAJour();
  }
  
  mettreAJourInterface() {
    const elementEquipe = document.getElementById('nom-equipe');
    const nomEquipe = this.equipeActuelle === 'rouge' ? 'Rouge' : 'Bleue';
    elementEquipe.textContent = nomEquipe;
    elementEquipe.className = `valeur equipe-${this.equipeActuelle}`;
    
    // Animation de changement
    elementEquipe.classList.add('valeur-change');
    setTimeout(() => elementEquipe.classList.remove('valeur-change'), 600);
    
    const lancersRestants = this.lancersParManche - this.nombreLancers;
    document.getElementById('nombre-lancers').textContent = lancersRestants;
  }
  
  reinitialiserJeu() {
    if (this.balaiGauche && this.balaiGauche.estEnBalayage()) {
      this.balaiGauche.arreterBalayage();
    }
    if (this.balaiDroit && this.balaiDroit.estEnBalayage()) {
      this.balaiDroit.arreterBalayage();
    }
    
    for (const pierre of this.pierres) {
      this.scene.remove(pierre.obtenirGroupe());
    }
    
    this.pierres = [];
    this.pierresEnMouvement = [];
    this.nombreLancers = 0;
    this.equipeActuelle = 'rouge';
    
    this.gestionnaireScore.reinitialiser();
    this.gestionnaireScore.mettreAJourNumeroManche();
    
    document.getElementById('meneur-texte').textContent = 'En attente...';
    
    this.mettreAJourInterface();
    this.afficherTrajectoire();
    
    this.afficherNotification('🔄 Jeu réinitialisé');
  }
  
  creerInterface() {
    if (typeof dat === 'undefined' || !dat.GUI) return;
    
    this.gui = new dat.GUI({ width: 350 });
    
    const dossierJeu = this.gui.addFolder('🎮 Contrôles du Jeu');
    
    dossierJeu.add(this.parametres, 'trajectoire', ['rectiligne', 'courbe'])
      .name('Type de trajectoire')
      .onChange(() => this.afficherTrajectoire());
    
    dossierJeu.add(this.parametres, 'vitesse', 0.1, 0.3, 0.05)
      .name('Vitesse (max 0.3)');
    
    dossierJeu.add(this.parametres, 'afficherBalais')
      .name('Afficher les balais');
    
    dossierJeu.add(this, 'lancerPierre').name('🥌 Lancer (Espace)');
    dossierJeu.add(this, 'reinitialiserJeu').name('🔄 Recommencer (R)');
    dossierJeu.open();
    
    const dossierBezier = this.gui.addFolder('📐 Points de Contrôle Bézier');
    const pts = this.gestionnaireTrajectoire.obtenirPointsControle();
    
    const dossierCP1 = dossierBezier.addFolder('Point 1 (Quad)');
    dossierCP1.add(pts, 'cp1x', -5, 5, 0.1).name('X').onChange(() => this.mettreAJourTrajectoire());
    dossierCP1.add(pts, 'cp1z', -25, 25, 0.5).name('Z').onChange(() => this.mettreAJourTrajectoire());
    
    const dossierCP2 = dossierBezier.addFolder('Point 2 (Cubique)');
    dossierCP2.add(pts, 'cp2x', -5, 5, 0.1).name('X').onChange(() => this.mettreAJourTrajectoire());
    dossierCP2.add(pts, 'cp2z', -25, 25, 0.5).name('Z').onChange(() => this.mettreAJourTrajectoire());
    
    const dossierCP3 = dossierBezier.addFolder('Point 3 (Cubique)');
    dossierCP3.add(pts, 'cp3x', -5, 5, 0.1).name('X').onChange(() => this.mettreAJourTrajectoire());
    dossierCP3.add(pts, 'cp3z', -25, 25, 0.5).name('Z').onChange(() => this.mettreAJourTrajectoire());
    
    const dossierCP4 = dossierBezier.addFolder('Point 4 (Quad)');
    dossierCP4.add(pts, 'cp4x', -5, 5, 0.1).name('X').onChange(() => this.mettreAJourTrajectoire());
    dossierCP4.add(pts, 'cp4z', -25, 25, 0.5).name('Z').onChange(() => this.mettreAJourTrajectoire());
    
    const dossierCamera = this.gui.addFolder('📷 Caméras');
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
    
    if (typeof Stats !== 'undefined') {
      this.stats = new Stats();
      this.stats.showPanel(0);
      document.getElementById('stats-container').appendChild(this.stats.dom);
    }
  }
  
  mettreAJourTrajectoire() {
    if (this.parametres.trajectoire === 'courbe') {
      this.gestionnaireTrajectoire.mettreAJourSpheresControle();
      this.afficherTrajectoire();
    }
  }
  
  animer() {
    requestAnimationFrame(() => this.animer());
    
    if (this.stats) this.stats.begin();
    
    this.mettreAJourPierres();
    this.gestionnaireCameras.mettreAJour();
    
    this.renderer.render(
      this.scene,
      this.gestionnaireCameras.obtenirCameraActive()
    );
    
    if (this.stats) this.stats.end();
  }
  
  demarrerAnimation() {
    this.animer();
  }
}

window.addEventListener('DOMContentLoaded', () => {
  const jeu = new JeuCurling();
  
  console.log('===========================================');
  console.log('🥌 Projet Curling - Info3Ba 2025-2026');
  console.log('===========================================');
  console.log('✅ 3 surfaces de révolution avec G1');
  console.log('✅ 2 lathe lisses qui se raccordent');
  console.log('✅ Surface intermédiaire couleur différente');
  console.log('✅ 2 balais qui suivent la pierre');
  console.log('✅ Collisions corrigées (pas de clipping)');
  console.log('✅ Vitesse limitée à 0.3 max');
  console.log('===========================================');
});
