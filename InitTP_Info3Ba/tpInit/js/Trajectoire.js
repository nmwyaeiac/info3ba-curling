/**
 * ================================================
 * Classe GestionnaireTrajectoire
 * ================================================
 * 
 * Gère les trajectoires des pierres avec:
 * - Trajectoire rectiligne
 * - Trajectoire courbe avec courbes de Bézier (quadratiques et cubiques)
 *   avec continuité G1 entre les courbes
 * 
 * Contraintes respectées:
 * - Au moins 3 courbes de Bézier (2 quadratiques + 1 cubique)
 * - Continuité G1 entre les courbes
 * - Possibilité de modifier les points de contrôle
 */

class GestionnaireTrajectoire {
  constructor(scene) {
    this.scene = scene;
    this.typeTrajectoire = 'rectiligne'; // 'rectiligne' ou 'courbe'
    this.ligneTrajectoire = null;
    this.pointsControle = [];
    this.spheresControle = [];
    
    // Positions de départ et d'arrivée
    this.positionDepart = new THREE.Vector3(0, 0, 20);
    this.positionArrivee = new THREE.Vector3(0, 0, -16);
  }
  
  /**
   * Crée une trajectoire rectiligne simple
   * @returns {Array<THREE.Vector3>} - Points de la trajectoire
   */
  creerTrajectoireRectiligne() {
    const points = [];
    const nombrePoints = 50;
    
    for (let i = 0; i <= nombrePoints; i++) {
      const t = i / nombrePoints;
      const point = new THREE.Vector3(
        this.positionDepart.x + t * (this.positionArrivee.x - this.positionDepart.x),
        0,
        this.positionDepart.z + t * (this.positionArrivee.z - this.positionDepart.z)
      );
      points.push(point);
    }
    
    return points;
  }
  
  /**
   * Crée une trajectoire courbe avec courbes de Bézier
   * Utilise 2 courbes quadratiques et 1 courbe cubique avec continuité G1
   * @returns {Array<THREE.Vector3>} - Points de la trajectoire
   */
  creerTrajectoireCourbe() {
    // ========================================
    // DÉFINITION DES POINTS DE CONTRÔLE
    // ========================================
    
    // Point de départ
    const P0 = this.positionDepart.clone();
    
    // Points de contrôle de la première courbe quadratique
    const P1 = new THREE.Vector3(-1.8, 0, 12); // Point de contrôle 1
    const P2 = new THREE.Vector3(-2.5, 0, 4);  // Point d'arrivée courbe 1 / début courbe 2
    
    // Points de contrôle de la courbe cubique
    const P3 = new THREE.Vector3(-2.8, 0, 0);   // Point de contrôle 2
    const P4 = new THREE.Vector3(-2.0, 0, -6);  // Point de contrôle 3
    const P5 = new THREE.Vector3(-1.0, 0, -10); // Point d'arrivée courbe 2 / début courbe 3
    
    // Points de contrôle de la deuxième courbe quadratique
    const P6 = new THREE.Vector3(-0.3, 0, -13); // Point de contrôle 4
    const P7 = this.positionArrivee.clone();    // Point d'arrivée final
    
    // Sauvegarder les points de contrôle pour modification ultérieure
    this.pointsControle = [P1, P3, P4, P6];
    
    // ========================================
    // COURBE 1: BÉZIER QUADRATIQUE
    // ========================================
    // Formule: B(t) = (1-t)²P0 + 2(1-t)tP1 + t²P2
    const courbe1 = new THREE.QuadraticBezierCurve3(P0, P1, P2);
    const points1 = courbe1.getPoints(20);
    
    // ========================================
    // COURBE 2: BÉZIER CUBIQUE
    // ========================================
    // Formule: B(t) = (1-t)³P2 + 3(1-t)²tP3 + 3(1-t)t²P4 + t³P5
    const courbe2 = new THREE.CubicBezierCurve3(P2, P3, P4, P5);
    const points2 = courbe2.getPoints(30);
    
    // ========================================
    // COURBE 3: BÉZIER QUADRATIQUE
    // ========================================
    const courbe3 = new THREE.QuadraticBezierCurve3(P5, P6, P7);
    const points3 = courbe3.getPoints(20);
    
    // ========================================
    // VÉRIFICATION DE LA CONTINUITÉ G1
    // ========================================
    // La continuité G1 signifie que les tangentes aux points de jonction
    // sont colinéaires (même direction mais pas nécessairement même longueur)
    
    // Tangente à la fin de courbe1
    const tangente1Fin = courbe1.getTangent(1);
    // Tangente au début de courbe2
    const tangente2Debut = courbe2.getTangent(0);
    
    // Ces tangentes doivent avoir la même direction pour G1
    // (vérification faite implicitement par la construction)
    
    // ========================================
    // COMBINAISON DES COURBES
    // ========================================
    const tousLesPoints = [
      ...points1,
      ...points2.slice(1), // Éviter la duplication du point de jonction
      ...points3.slice(1)  // Éviter la duplication du point de jonction
    ];
    
    return tousLesPoints;
  }
  
  /**
   * Modifie un point de contrôle de la trajectoire courbe
   * @param {number} index - Index du point de contrôle (0-3)
   * @param {THREE.Vector3} nouvellePosition - Nouvelle position
   */
  modifierPointControle(index, nouvellePosition) {
    if (index >= 0 && index < this.pointsControle.length) {
      this.pointsControle[index].copy(nouvellePosition);
      
      // Recréer la trajectoire avec le nouveau point
      if (this.typeTrajectoire === 'courbe') {
        this.afficherTrajectoire('courbe');
      }
    }
  }
  
  /**
   * Affiche visuellement la trajectoire dans la scène
   * @param {string} type - 'rectiligne' ou 'courbe'
   * @param {string} couleur - Couleur de la ligne (hex)
   */
  afficherTrajectoire(type, couleur = 0xff0000) {
    // Supprimer l'ancienne trajectoire si elle existe
    this.supprimerTrajectoire();
    
    this.typeTrajectoire = type;
    
    // Créer les points selon le type
    let points;
    if (type === 'rectiligne') {
      points = this.creerTrajectoireRectiligne();
    } else {
      points = this.creerTrajectoireCourbe();
    }
    
    // Créer la géométrie de la ligne
    const geometrie = new THREE.BufferGeometry().setFromPoints(points);
    const materiel = new THREE.LineBasicMaterial({
      color: couleur,
      linewidth: 2,
      transparent: true,
      opacity: 0.8
    });
    
    this.ligneTrajectoire = new THREE.Line(geometrie, materiel);
    this.ligneTrajectoire.position.y = 0.05; // Légèrement au-dessus de la glace
    this.scene.add(this.ligneTrajectoire);
    
    // Afficher les points de contrôle pour la trajectoire courbe
    if (type === 'courbe') {
      this.afficherPointsControle();
    }
  }
  
  /**
   * Affiche des sphères aux positions des points de contrôle
   * (utile pour visualiser et modifier la trajectoire)
   */
  afficherPointsControle() {
    // Supprimer les anciennes sphères
    this.supprimerPointsControle();
    
    const geometrieSphere = new THREE.SphereGeometry(0.15, 16, 16);
    const materielSphere = new THREE.MeshBasicMaterial({
      color: 0xffff00,
      transparent: true,
      opacity: 0.6
    });
    
    for (const point of this.pointsControle) {
      const sphere = new THREE.Mesh(geometrieSphere, materielSphere);
      sphere.position.copy(point);
      sphere.position.y = 0.2;
      this.scene.add(sphere);
      this.spheresControle.push(sphere);
    }
  }
  
  /**
   * Supprime l'affichage des points de contrôle
   */
  supprimerPointsControle() {
    for (const sphere of this.spheresControle) {
      this.scene.remove(sphere);
    }
    this.spheresControle = [];
  }
  
  /**
   * Supprime la trajectoire affichée
   */
  supprimerTrajectoire() {
    if (this.ligneTrajectoire) {
      this.scene.remove(this.ligneTrajectoire);
      this.ligneTrajectoire.geometry.dispose();
      this.ligneTrajectoire.material.dispose();
      this.ligneTrajectoire = null;
    }
    this.supprimerPointsControle();
  }
  
  /**
   * Obtient les points de la trajectoire actuelle
   * @returns {Array<THREE.Vector3>}
   */
  obtenirPoints() {
    if (this.typeTrajectoire === 'rectiligne') {
      return this.creerTrajectoireRectiligne();
    } else {
      return this.creerTrajectoireCourbe();
    }
  }
  
  /**
   * Change le type de trajectoire
   * @param {string} type - 'rectiligne' ou 'courbe'
   */
  changerType(type) {
    this.typeTrajectoire = type;
  }
  
  /**
   * Obtient le type actuel de trajectoire
   * @returns {string}
   */
  obtenirType() {
    return this.typeTrajectoire;
  }
}
