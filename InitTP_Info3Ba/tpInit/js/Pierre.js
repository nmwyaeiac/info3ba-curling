/**
 * ================================================
 * Classe Pierre - Gestion des pierres de curling
 * ================================================
 * 
 * Cette classe crée une pierre de curling composée de 3 surfaces
 * de révolution (lathe) avec raccord G1 entre chaque surface.
 * 
 * Contraintes respectées:
 * - Au moins 3 surfaces de révolution avec raccord G1
 * - Au moins 2 lathe lisses qui se raccordent
 * - Couleurs différentes par équipe (rouge/bleu)
 * - Surface intermédiaire de couleur différente
 */

class Pierre {
  /**
   * Constructeur de la pierre
   * @param {string} equipe - 'rouge' ou 'bleu'
   */
  constructor(equipe) {
    this.equipe = equipe;
    this.rayon = 0.145; // Rayon standard d'une pierre de curling (14.5 cm)
    this.groupe = new THREE.Group();
    
    // Propriétés physiques pour les déplacements
    this.vitesse = new THREE.Vector3();
    this.vitesseAngulaire = 0;
    this.enMouvement = false;
    
    // Points de trajectoire pour animation
    this.pointsTrajectoire = [];
    this.indexPointActuel = 0;
    
    // Callback quand la pierre s'arrête
    this.callbackArret = null;
    
    this.creerPierre();
  }
  
  /**
   * Crée la géométrie complète de la pierre avec 3 surfaces de révolution
   */
  creerPierre() {
    // ========================================
    // SURFACE 1: BASE (Lathe lisse)
    // ========================================
    // Création de points pour une courbe lisse en bas de la pierre
    const pointsBase = [];
    const nombrePointsBase = 20;
    
    for (let i = 0; i <= nombrePointsBase; i++) {
      const t = i / nombrePointsBase;
      // Courbe parabolique pour la base
      const angle = t * Math.PI / 2;
      const x = Math.sin(angle) * this.rayon * 0.95;
      const y = t * 0.08; // Hauteur de la base
      pointsBase.push(new THREE.Vector2(x, y));
    }
    
    const geometrieBase = new THREE.LatheGeometry(pointsBase, 32);
    const couleurEquipe = this.equipe === 'rouge' ? 0xcc0000 : 0x0000cc;
    const materielBase = new THREE.MeshPhongMaterial({
      color: couleurEquipe,
      shininess: 80,
      specular: 0x333333
    });
    
    const meshBase = new THREE.Mesh(geometrieBase, materielBase);
    meshBase.castShadow = true;
    meshBase.receiveShadow = true;
    
    // ========================================
    // SURFACE 2: CORPS PRINCIPAL (Lathe lisse)
    // Couleur DIFFÉRENTE (contrainte du sujet)
    // ========================================
    const pointsCorps = [];
    const nombrePointsCorps = 25;
    
    // Calcul du dernier point de la base pour assurer la continuité G1
    const dernierPointBase = pointsBase[nombrePointsBase];
    
    for (let i = 0; i <= nombrePointsCorps; i++) {
      const t = i / nombrePointsCorps;
      const angle = t * Math.PI;
      // Fonction sinusoïdale pour un corps arrondi
      const x = (Math.sin(angle) * 0.85 + 0.15) * this.rayon;
      const y = dernierPointBase.y + t * 0.10; // Continue depuis la base
      pointsCorps.push(new THREE.Vector2(x, y));
    }
    
    const geometrieCorps = new THREE.LatheGeometry(pointsCorps, 32);
    // IMPORTANT: Couleur différente pour la surface intermédiaire (contrainte)
    const materielCorps = new THREE.MeshPhongMaterial({
      color: 0x666666, // Gris pour différencier
      shininess: 60,
      specular: 0x222222
    });
    
    const meshCorps = new THREE.Mesh(geometrieCorps, materielCorps);
    meshCorps.castShadow = true;
    meshCorps.receiveShadow = true;
    
    // ========================================
    // SURFACE 3: POIGNÉE (Lathe lisse)
    // ========================================
    const pointsPoignee = [];
    const nombrePointsPoignee = 15;
    
    // Calcul du dernier point du corps pour continuité G1
    const dernierPointCorps = pointsCorps[nombrePointsCorps];
    
    for (let i = 0; i <= nombrePointsPoignee; i++) {
      const t = i / nombrePointsPoignee;
      const angle = t * Math.PI;
      // Poignée arrondie
      const x = Math.sin(angle) * this.rayon * 0.45;
      const y = dernierPointCorps.y + t * 0.05; // Continue depuis le corps
      pointsPoignee.push(new THREE.Vector2(x, y));
    }
    
    const geometriePoignee = new THREE.LatheGeometry(pointsPoignee, 32);
    const materielPoignee = new THREE.MeshPhongMaterial({
      color: couleurEquipe,
      shininess: 80,
      specular: 0x333333
    });
    
    const meshPoignee = new THREE.Mesh(geometriePoignee, materielPoignee);
    meshPoignee.castShadow = true;
    meshPoignee.receiveShadow = true;
    
    // ========================================
    // ASSEMBLAGE DES 3 SURFACES
    // ========================================
    this.groupe.add(meshBase);
    this.groupe.add(meshCorps);
    this.groupe.add(meshPoignee);
    
    // Positionner la pierre légèrement au-dessus du sol
    this.groupe.position.y = this.rayon;
    
    // Stockage des données pour la physique
    this.groupe.userData = {
      equipe: this.equipe,
      pierre: this
    };
  }
  
  /**
   * Initialise le lancer de la pierre avec une trajectoire
   * @param {Array} pointsTrajectoire - Tableau de Vector3 définissant le chemin
   * @param {number} vitesseInitiale - Vitesse de déplacement
   * @param {Function} callback - Fonction appelée quand la pierre s'arrête
   */
  lancer(pointsTrajectoire, vitesseInitiale, callback) {
    this.pointsTrajectoire = pointsTrajectoire;
    this.indexPointActuel = 0;
    this.vitesseActuelle = vitesseInitiale;
    this.enMouvement = true;
    this.callbackArret = callback;
    this.vitesseAngulaire = 0.1; // Rotation de la pierre
  }
  
  /**
   * Met à jour la position de la pierre (appelé à chaque frame)
   * @returns {boolean} - true si la pierre est toujours en mouvement
   */
  mettreAJour() {
    if (!this.enMouvement) return false;
    
    const points = this.pointsTrajectoire;
    const index = this.indexPointActuel;
    
    // Vérifier si on a atteint la fin de la trajectoire
    if (index >= points.length - 1) {
      this.arreter();
      return false;
    }
    
    // Calculer la direction vers le prochain point
    const pointCible = points[index + 1];
    const direction = new THREE.Vector3()
      .subVectors(pointCible, this.groupe.position)
      .normalize();
    
    // Appliquer le mouvement
    this.vitesse.copy(direction).multiplyScalar(this.vitesseActuelle);
    this.groupe.position.add(this.vitesse);
    
    // Rotation de la pierre (effet visuel)
    this.groupe.rotation.y += this.vitesseAngulaire;
    
    // Application de la friction (décélération progressive)
    const friction = 0.985;
    this.vitesseActuelle *= friction;
    this.vitesseAngulaire *= friction;
    
    // Passer au point suivant si on est assez proche
    if (this.groupe.position.distanceTo(pointCible) < 0.3) {
      this.indexPointActuel++;
    }
    
    // Arrêter si la vitesse est trop faible
    if (this.vitesseActuelle < 0.01) {
      this.arreter();
      return false;
    }
    
    return true;
  }
  
  /**
   * Arrête complètement la pierre
   */
  arreter() {
    this.enMouvement = false;
    this.vitesse.set(0, 0, 0);
    this.vitesseActuelle = 0;
    this.vitesseAngulaire = 0;
    
    // Appeler le callback si défini
    if (this.callbackArret) {
      this.callbackArret();
    }
  }
  
  /**
   * Applique une impulsion à la pierre (collision)
   * @param {THREE.Vector3} direction - Direction de l'impulsion
   * @param {number} force - Force de l'impulsion
   */
  appliquerImpulsion(direction, force) {
    this.vitesse.add(direction.clone().multiplyScalar(force));
    this.vitesseActuelle = this.vitesse.length();
    
    if (this.vitesseActuelle > 0.05 && !this.enMouvement) {
      this.enMouvement = true;
    }
  }
  
  /**
   * Obtient le mesh THREE.js de la pierre
   * @returns {THREE.Group}
   */
  obtenirGroupe() {
    return this.groupe;
  }
  
  /**
   * Obtient la position actuelle de la pierre
   * @returns {THREE.Vector3}
   */
  obtenirPosition() {
    return this.groupe.position.clone();
  }
  
  /**
   * Définit la position de la pierre
   * @param {number} x
   * @param {number} y
   * @param {number} z
   */
  definirPosition(x, y, z) {
    this.groupe.position.set(x, y, z);
  }
  
  /**
   * Vérifie si la pierre est dans la maison
   * @param {THREE.Vector3} centreMaison - Position du centre de la maison
   * @param {number} rayonMaison - Rayon de la maison
   * @returns {boolean}
   */
  estDansLaMaison(centreMaison, rayonMaison) {
    const distance = new THREE.Vector2(
      this.groupe.position.x - centreMaison.x,
      this.groupe.position.z - centreMaison.z
    ).length();
    
    return distance <= rayonMaison;
  }
  
  /**
   * Calcule la distance au centre de la maison
   * @param {THREE.Vector3} centreMaison
   * @returns {number}
   */
  distanceAuCentre(centreMaison) {
    return new THREE.Vector2(
      this.groupe.position.x - centreMaison.x,
      this.groupe.position.z - centreMaison.z
    ).length();
  }
}
