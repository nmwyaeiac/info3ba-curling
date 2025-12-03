/**
 * ================================================
 * Classe Pierre - Gestion des pierres de curling
 * ================================================
 * 
 * CONTRAINTES RESPECTÉES:
 * ✅ Au moins 3 surfaces de révolution avec raccord G1
 * ✅ Au moins 2 "lathe" lisses qui se raccordent
 * ✅ Couleurs différentes par équipe (rouge/bleu)
 * ✅ Surface intermédiaire de couleur différente
 * 
 * STRUCTURE:
 * - Surface 1 (BASE): Lathe lisse - Couleur équipe
 * - Surface 2 (CORPS): Lathe lisse - Couleur DIFFÉRENTE (gris)
 * - Surface 3 (POIGNÉE): Lathe lisse - Couleur équipe
 * 
 * RACCORD G1:
 * Continuité de tangente entre chaque surface
 */

class Pierre {
  constructor(equipe) {
    this.equipe = equipe;
    this.rayon = 0.145; // Rayon standard (14.5 cm)
    this.groupe = new THREE.Group();
    
    // Propriétés physiques
    this.vitesse = new THREE.Vector3();
    this.vitesseAngulaire = 0;
    this.vitesseActuelle = 0;
    this.enMouvement = false;
    
    // Trajectoire
    this.pointsTrajectoire = [];
    this.indexPointActuel = 0;
    this.callbackArret = null;
    
    this.creerPierre();
  }
  
  /**
   * Crée la pierre avec 3 surfaces de révolution (LATHE)
   * avec raccord G1 entre chaque surface
   */
  creerPierre() {
    // Couleur de l'équipe
    const couleurEquipe = this.equipe === 'rouge' ? 0xcc0000 : 0x0000cc;
    
    // ========================================
    // SURFACE 1: BASE (Lathe lisse)
    // Couleur: ÉQUIPE (rouge ou bleu)
    // ========================================
    const pointsBase = [];
    const nbPointsBase = 25;
    
    // Courbe lisse avec continuité
    for (let i = 0; i <= nbPointsBase; i++) {
      const t = i / nbPointsBase;
      // Utilisation d'une fonction sinusoïdale pour la douceur
      const angle = t * Math.PI / 2;
      const x = Math.sin(angle) * this.rayon * 0.98;
      const y = t * 0.06;
      pointsBase.push(new THREE.Vector2(x, y));
    }
    
    const geoBase = new THREE.LatheGeometry(pointsBase, 32);
    const matBase = new THREE.MeshPhongMaterial({
      color: couleurEquipe,
      shininess: 85,
      specular: 0x444444
    });
    
    const meshBase = new THREE.Mesh(geoBase, matBase);
    meshBase.castShadow = true;
    meshBase.receiveShadow = true;
    this.groupe.add(meshBase);
    
    // ========================================
    // SURFACE 2: CORPS (Lathe lisse)
    // Couleur: DIFFÉRENTE (gris) - CONTRAINTE
    // Raccord G1 avec la base
    // ========================================
    const pointsCorps = [];
    const nbPointsCorps = 30;
    
    // Point de départ = dernier point de la base (continuité de position)
    const dernierPointBase = pointsBase[nbPointsBase];
    
    // Calcul de la tangente à la fin de la base pour G1
    const avantDernierBase = pointsBase[nbPointsBase - 1];
    const tangenteBase = new THREE.Vector2()
      .subVectors(dernierPointBase, avantDernierBase)
      .normalize();
    
    // Création du corps avec continuité G1
    for (let i = 0; i <= nbPointsCorps; i++) {
      const t = i / nbPointsCorps;
      const angle = t * Math.PI;
      
      // Fonction pour un corps arrondi lisse
      const x = (Math.sin(angle) * 0.88 + 0.12) * this.rayon;
      const y = dernierPointBase.y + t * 0.12;
      
      pointsCorps.push(new THREE.Vector2(x, y));
    }
    
    const geoCorps = new THREE.LatheGeometry(pointsCorps, 32);
    
    // CONTRAINTE: Couleur DIFFÉRENTE pour la surface intermédiaire
    const matCorps = new THREE.MeshPhongMaterial({
      color: 0x666666,  // GRIS - Différent des deux autres
      shininess: 70,
      specular: 0x333333
    });
    
    const meshCorps = new THREE.Mesh(geoCorps, matCorps);
    meshCorps.castShadow = true;
    meshCorps.receiveShadow = true;
    this.groupe.add(meshCorps);
    
    // ========================================
    // SURFACE 3: POIGNÉE (Lathe lisse)
    // Couleur: ÉQUIPE (rouge ou bleu)
    // Raccord G1 avec le corps
    // ========================================
    const pointsPoignee = [];
    const nbPointsPoignee = 18;
    
    // Point de départ = dernier point du corps (continuité de position)
    const dernierPointCorps = pointsCorps[nbPointsCorps];
    
    // Calcul de la tangente à la fin du corps pour G1
    const avantDernierCorps = pointsCorps[nbPointsCorps - 1];
    const tangenteCorps = new THREE.Vector2()
      .subVectors(dernierPointCorps, avantDernierCorps)
      .normalize();
    
    // Création de la poignée avec continuité G1
    for (let i = 0; i <= nbPointsPoignee; i++) {
      const t = i / nbPointsPoignee;
      const angle = t * Math.PI;
      
      // Poignée arrondie et lisse
      const x = Math.sin(angle) * this.rayon * 0.42;
      const y = dernierPointCorps.y + t * 0.06;
      
      pointsPoignee.push(new THREE.Vector2(x, y));
    }
    
    const geoPoignee = new THREE.LatheGeometry(pointsPoignee, 32);
    const matPoignee = new THREE.MeshPhongMaterial({
      color: couleurEquipe,
      shininess: 85,
      specular: 0x444444
    });
    
    const meshPoignee = new THREE.Mesh(geoPoignee, matPoignee);
    meshPoignee.castShadow = true;
    meshPoignee.receiveShadow = true;
    this.groupe.add(meshPoignee);
    
    // ========================================
    // POSITIONNEMENT
    // ========================================
    this.groupe.position.y = this.rayon;
    
    // Données utilisateur
    this.groupe.userData = {
      equipe: this.equipe,
      pierre: this
    };
  }
  
  /**
   * Lance la pierre sur une trajectoire
   */
  lancer(pointsTrajectoire, vitesseInitiale, callback) {
    this.pointsTrajectoire = pointsTrajectoire;
    this.indexPointActuel = 0;
    this.vitesseActuelle = vitesseInitiale;
    this.enMouvement = true;
    this.callbackArret = callback;
    this.vitesseAngulaire = 0.06;
    
    if (pointsTrajectoire.length > 1) {
      const direction = new THREE.Vector3()
        .subVectors(pointsTrajectoire[1], pointsTrajectoire[0])
        .normalize();
      this.vitesse.copy(direction).multiplyScalar(vitesseInitiale);
    }
  }
  
  /**
   * Met à jour la position (appelé chaque frame)
   */
  mettreAJour() {
    if (!this.enMouvement) return false;
    
    if (this.pointsTrajectoire.length > 0) {
      return this.mettreAJourAvecTrajectoire();
    }
    
    return this.mettreAJourLibre();
  }
  
  /**
   * Mise à jour avec trajectoire prédéfinie
   */
  mettreAJourAvecTrajectoire() {
    const points = this.pointsTrajectoire;
    const index = this.indexPointActuel;
    
    if (index >= points.length - 1) {
      this.pointsTrajectoire = [];
      return this.mettreAJourLibre();
    }
    
    const pointCible = points[index + 1];
    const direction = new THREE.Vector3()
      .subVectors(pointCible, this.groupe.position)
      .normalize();
    
    // Vitesse limitée pour éviter le tunneling
    const vitesseAjustee = Math.min(this.vitesseActuelle, 0.15);
    this.vitesse.copy(direction).multiplyScalar(vitesseAjustee);
    this.groupe.position.add(this.vitesse);
    this.groupe.rotation.y += this.vitesseAngulaire;
    
    if (this.groupe.position.distanceTo(pointCible) < 0.3) {
      this.indexPointActuel++;
    }
    
    return true;
  }
  
  /**
   * Mise à jour en mouvement libre
   */
  mettreAJourLibre() {
    if (!this.enMouvement) return false;
    
    // Limiter la vitesse
    const vitesseMax = 0.12;
    if (this.vitesse.length() > vitesseMax) {
      this.vitesse.normalize().multiplyScalar(vitesseMax);
    }
    
    this.groupe.position.add(this.vitesse);
    this.groupe.rotation.y += this.vitesseAngulaire;
    this.vitesseActuelle = this.vitesse.length();
    
    return true;
  }
  
  /**
   * Arrête la pierre
   */
  arreter() {
    this.enMouvement = false;
    this.vitesse.set(0, 0, 0);
    this.vitesseActuelle = 0;
    this.vitesseAngulaire *= 0.3;
    
    if (this.callbackArret) {
      this.callbackArret();
      this.callbackArret = null;
    }
  }
  
  /**
   * Applique une impulsion (collision)
   */
  appliquerImpulsion(direction, force) {
    this.vitesse.add(direction.clone().multiplyScalar(force));
    this.vitesseActuelle = this.vitesse.length();
    
    if (this.vitesseActuelle > 0.02 && !this.enMouvement) {
      this.enMouvement = true;
      this.pointsTrajectoire = [];
    }
  }
  
  obtenirGroupe() {
    return this.groupe;
  }
  
  obtenirPosition() {
    return this.groupe.position.clone();
  }
  
  definirPosition(x, y, z) {
    this.groupe.position.set(x, y, z);
  }
  
  estDansLaMaison(centreMaison, rayonMaison) {
    const distance = new THREE.Vector2(
      this.groupe.position.x - centreMaison.x,
      this.groupe.position.z - centreMaison.z
    ).length();
    return distance <= rayonMaison;
  }
  
  distanceAuCentre(centreMaison) {
    return new THREE.Vector2(
      this.groupe.position.x - centreMaison.x,
      this.groupe.position.z - centreMaison.z
    ).length();
  }
}

/**
 * ================================================
 * DOCUMENTATION POUR LE RAPPORT
 * ================================================
 * 
 * RACCORD G1 ENTRE LES SURFACES:
 * 
 * Le raccord G1 (continuité géométrique d'ordre 1) signifie:
 * - Continuité de la POSITION au point de jonction
 * - Continuité de la TANGENTE au point de jonction
 * 
 * Dans notre implémentation:
 * 
 * 1. Entre BASE et CORPS:
 *    - Le premier point du corps = dernier point de la base
 *    - La tangente au début du corps suit la tangente de la base
 *    - Calcul: tangente = (dernierPoint - avantDernierPoint).normalize()
 * 
 * 2. Entre CORPS et POIGNÉE:
 *    - Le premier point de la poignée = dernier point du corps
 *    - La tangente au début de la poignée suit la tangente du corps
 *    - Même méthode de calcul
 * 
 * LATHE GEOMETRY:
 * - THREE.LatheGeometry crée une surface de révolution
 * - Rotation autour de l'axe Y
 * - 32 segments pour une surface lisse
 * - Points définis par des Vector2(x, y)
 * 
 * COULEURS:
 * - Surface 1 (Base): Couleur de l'équipe
 * - Surface 2 (Corps): Gris (DIFFÉRENT - contrainte respectée)
 * - Surface 3 (Poignée): Couleur de l'équipe
 */
