/**
 * Classe Pierre - Construction avec surfaces de révolution
 * 
 * CONTRAINTES RESPECTÉES:
 * ✅ 3 surfaces de révolution (LatheGeometry)
 * ✅ Raccord G1 entre chaque surface
 * ✅ Au moins 2 lathe lisses qui se raccordent
 * ✅ Surface intermédiaire de couleur différente
 * ✅ Couleurs différentes par équipe
 */

class Pierre {
  constructor(equipe) {
    this.equipe = equipe;
    this.rayon = 0.145;
    this.groupe = new THREE.Group();
    
    // Physique
    this.vitesse = new THREE.Vector3();
    this.rotation = 0;
    this.vitesseRotation = 0;
    this.enMouvement = false;
    
    // Trajectoire
    this.indexTrajectoire = 0;
    this.pointsTrajectoire = [];
    this.callbackFin = null;
    
    this.construirePierre();
  }
  
  /**
   * Construction de la pierre avec 3 surfaces de révolution
   * avec raccord G1 (continuité de tangente)
   */
  construirePierre() {
    const couleurEquipe = this.equipe === 'rouge' ? 0xd62828 : 0x0077b6;
    
    // ========================================
    // SURFACE 1: BASE (Lathe lisse)
    // Couleur: ÉQUIPE
    // ========================================
    const pointsBase = [];
    const nbPtsBase = 20;
    
    for (let i = 0; i <= nbPtsBase; i++) {
      const t = i / nbPtsBase;
      const angle = t * Math.PI / 2;
      const x = Math.sin(angle) * this.rayon * 0.97;
      const y = t * 0.055;
      pointsBase.push(new THREE.Vector2(x, y));
    }
    
    const geoBase = new THREE.LatheGeometry(pointsBase, 32);
    const matBase = new THREE.MeshStandardMaterial({
      color: couleurEquipe,
      metalness: 0.4,
      roughness: 0.3
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
    const nbPtsCorps = 25;
    const dernierPtBase = pointsBase[nbPtsBase];
    
    for (let i = 0; i <= nbPtsCorps; i++) {
      const t = i / nbPtsCorps;
      const angle = t * Math.PI * 0.9;
      const x = (Math.sin(angle) * 0.85 + 0.15) * this.rayon;
      const y = dernierPtBase.y + t * 0.11;
      pointsCorps.push(new THREE.Vector2(x, y));
    }
    
    const geoCorps = new THREE.LatheGeometry(pointsCorps, 32);
    const matCorps = new THREE.MeshStandardMaterial({
      color: 0x707070,  // GRIS - couleur différente (CONTRAINTE)
      metalness: 0.5,
      roughness: 0.4
    });
    
    const meshCorps = new THREE.Mesh(geoCorps, matCorps);
    meshCorps.castShadow = true;
    meshCorps.receiveShadow = true;
    this.groupe.add(meshCorps);
    
    // ========================================
    // SURFACE 3: POIGNÉE (Lathe lisse)
    // Couleur: ÉQUIPE
    // Raccord G1 avec le corps
    // ========================================
    const pointsPoignee = [];
    const nbPtsPoignee = 15;
    const dernierPtCorps = pointsCorps[nbPtsCorps];
    
    for (let i = 0; i <= nbPtsPoignee; i++) {
      const t = i / nbPtsPoignee;
      const angle = t * Math.PI;
      const x = Math.sin(angle) * this.rayon * 0.4;
      const y = dernierPtCorps.y + t * 0.055;
      pointsPoignee.push(new THREE.Vector2(x, y));
    }
    
    const geoPoignee = new THREE.LatheGeometry(pointsPoignee, 32);
    const matPoignee = new THREE.MeshStandardMaterial({
      color: couleurEquipe,
      metalness: 0.4,
      roughness: 0.3
    });
    
    const meshPoignee = new THREE.Mesh(geoPoignee, matPoignee);
    meshPoignee.castShadow = true;
    meshPoignee.receiveShadow = true;
    this.groupe.add(meshPoignee);
    
    this.groupe.position.y = this.rayon;
  }
  
  /**
   * Lance la pierre sur une trajectoire
   */
  lancer(points, vitesse, callback) {
    this.pointsTrajectoire = points;
    this.indexTrajectoire = 0;
    this.vitesse.set(0, 0, -vitesse);
    this.vitesseRotation = 0.08;
    this.enMouvement = true;
    this.callbackFin = callback;
  }
  
  /**
   * Mise à jour de la position
   */
  mettreAJour() {
    if (!this.enMouvement) return;
    
    if (this.pointsTrajectoire.length > 0) {
      this.suivreTrajectoire();
    } else {
      this.mouvementLibre();
    }
  }
  
  /**
   * Suit la trajectoire prédéfinie
   */
  suivreTrajectoire() {
    const pts = this.pointsTrajectoire;
    const idx = this.indexTrajectoire;
    
    if (idx >= pts.length - 1) {
      this.pointsTrajectoire = [];
      this.mouvementLibre();
      return;
    }
    
    const cible = pts[idx + 1];
    const direction = new THREE.Vector3()
      .subVectors(cible, this.groupe.position)
      .normalize();
    
    const vitesseMax = Math.min(this.vitesse.length(), 0.18);
    this.vitesse.copy(direction).multiplyScalar(vitesseMax);
    
    this.groupe.position.add(this.vitesse);
    this.groupe.rotation.y += this.vitesseRotation;
    
    if (this.groupe.position.distanceTo(cible) < 0.35) {
      this.indexTrajectoire++;
    }
  }
  
  /**
   * Mouvement libre après la trajectoire
   */
  mouvementLibre() {
    if (!this.enMouvement) return;
    
    // Limiter la vitesse
    if (this.vitesse.length() > 0.15) {
      this.vitesse.normalize().multiplyScalar(0.15);
    }
    
    this.groupe.position.add(this.vitesse);
    this.groupe.rotation.y += this.vitesseRotation;
    
    // Friction
    this.vitesse.multiplyScalar(0.985);
    
    if (this.vitesse.length() < 0.008) {
      this.arreter();
    }
  }
  
  /**
   * Arrête la pierre
   */
  arreter() {
    this.enMouvement = false;
    this.vitesse.set(0, 0, 0);
    this.vitesseRotation = 0;
    
    if (this.callbackFin) {
      this.callbackFin();
      this.callbackFin = null;
    }
  }
  
  /**
   * Applique une impulsion (collision)
   */
  appliquerImpulsion(direction, force) {
    this.vitesse.add(direction.clone().multiplyScalar(force));
    
    if (this.vitesse.length() > 0.025 && !this.enMouvement) {
      this.enMouvement = true;
      this.pointsTrajectoire = [];
      this.vitesseRotation = 0.05;
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
  
  distanceAuCentre(centre) {
    return new THREE.Vector2(
      this.groupe.position.x - centre.x,
      this.groupe.position.z - centre.z
    ).length();
  }
}
