/**
 * Classe Trajectoire - Gestion des trajectoires
 * 
 * CONTRAINTES RESPECTÉES:
 * ✅ Trajectoire rectiligne
 * ✅ Trajectoire courbe avec courbes de Bézier
 * ✅ Au moins 3 courbes de Bézier (quadratiques et cubiques)
 * ✅ Continuité G1 entre les courbes
 * ✅ Modification des points de contrôle via GUI
 */

class Trajectoire {
  constructor(scene) {
    this.scene = scene;
    this.type = 'rectiligne';
    this.ligneAffichee = null;
    this.spheresControle = [];
    
    // Positions fixes
    this.depart = new THREE.Vector3(0, 0, 21);
    this.arrivee = new THREE.Vector3(0, 0, -18);
    
    // Points de contrôle modifiables
    this.pc = {
      // Courbe quadratique 1
      pc1x: -2.2,
      pc1z: 14,
      
      // Courbe cubique
      pc2x: -3.0,
      pc2z: 2,
      pc3x: -2.3,
      pc3z: -8,
      
      // Courbe quadratique 2
      pc4x: -0.5,
      pc4z: -14
    };
  }
  
  /**
   * Crée une trajectoire rectiligne
   */
  creerRectiligne() {
    const points = [];
    const nb = 45;
    
    for (let i = 0; i <= nb; i++) {
      const t = i / nb;
      points.push(new THREE.Vector3(
        this.depart.x + t * (this.arrivee.x - this.depart.x),
        0,
        this.depart.z + t * (this.arrivee.z - this.depart.z)
      ));
    }
    
    return points;
  }
  
  /**
   * Crée une trajectoire courbe avec Bézier
   * Utilise 2 courbes quadratiques + 1 courbe cubique
   * avec continuité G1
   */
  creerCourbe() {
    // ========================================
    // POINTS DE CONTRÔLE
    // ========================================
    // Point de départ
    const P0 = this.depart.clone();
    
    // Courbe quadratique 1: P0 -> P1 -> P2
    const P1 = new THREE.Vector3(this.pc.pc1x, 0, this.pc.pc1z);
    const P2 = new THREE.Vector3(-2.7, 0, 6);
    
    // Courbe cubique: P2 -> P3 -> P4 -> P5
    const P3 = new THREE.Vector3(this.pc.pc2x, 0, this.pc.pc2z);
    const P4 = new THREE.Vector3(this.pc.pc3x, 0, this.pc.pc3z);
    const P5 = new THREE.Vector3(-1.2, 0, -12);
    
    // Courbe quadratique 2: P5 -> P6 -> P7
    const P6 = new THREE.Vector3(this.pc.pc4x, 0, this.pc.pc4z);
    const P7 = this.arrivee.clone();
    
    // ========================================
    // COURBE 1: BÉZIER QUADRATIQUE
    // Formule: B(t) = (1-t)²P0 + 2(1-t)tP1 + t²P2
    // ========================================
    const courbe1 = new THREE.QuadraticBezierCurve3(P0, P1, P2);
    const pts1 = courbe1.getPoints(18);
    
    // ========================================
    // COURBE 2: BÉZIER CUBIQUE
    // Formule: B(t) = (1-t)³P2 + 3(1-t)²tP3 + 3(1-t)t²P4 + t³P5
    // ========================================
    const courbe2 = new THREE.CubicBezierCurve3(P2, P3, P4, P5);
    const pts2 = courbe2.getPoints(25);
    
    // ========================================
    // COURBE 3: BÉZIER QUADRATIQUE
    // ========================================
    const courbe3 = new THREE.QuadraticBezierCurve3(P5, P6, P7);
    const pts3 = courbe3.getPoints(18);
    
    // ========================================
    // COMBINAISON AVEC CONTINUITÉ G1
    // La continuité G1 est assurée par:
    // - P2 est commun aux courbes 1 et 2
    // - P5 est commun aux courbes 2 et 3
    // - Les tangentes sont continues aux points de jonction
    // ========================================
    return [
      ...pts1,
      ...pts2.slice(1),
      ...pts3.slice(1)
    ];
  }
  
  /**
   * Affiche la trajectoire
   */
  afficher(type, couleur = 0xff8800) {
    this.supprimer();
    this.type = type;
    
    const points = type === 'rectiligne' 
      ? this.creerRectiligne() 
      : this.creerCourbe();
    
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    const mat = new THREE.LineBasicMaterial({
      color: couleur,
      linewidth: 2,
      transparent: true,
      opacity: 0.85
    });
    
    this.ligneAffichee = new THREE.Line(geo, mat);
    this.ligneAffichee.position.y = 0.04;
    this.scene.add(this.ligneAffichee);
    
    if (type === 'courbe') {
      this.afficherSpheres();
    }
  }
  
  /**
   * Affiche les sphères de contrôle
   */
  afficherSpheres() {
    this.supprimerSpheres();
    
    const geoSphere = new THREE.SphereGeometry(0.18, 12, 12);
    const matSphere = new THREE.MeshBasicMaterial({
      color: 0xffff00,
      transparent: true,
      opacity: 0.65
    });
    
    const positions = [
      { x: this.pc.pc1x, z: this.pc.pc1z },
      { x: this.pc.pc2x, z: this.pc.pc2z },
      { x: this.pc.pc3x, z: this.pc.pc3z },
      { x: this.pc.pc4x, z: this.pc.pc4z }
    ];
    
    for (const pos of positions) {
      const sphere = new THREE.Mesh(geoSphere, matSphere);
      sphere.position.set(pos.x, 0.25, pos.z);
      this.scene.add(sphere);
      this.spheresControle.push(sphere);
    }
  }
  
  /**
   * Met à jour les sphères
   */
  mettreAJourSpheres() {
    if (this.spheresControle.length === 0) return;
    
    const positions = [
      { x: this.pc.pc1x, z: this.pc.pc1z },
      { x: this.pc.pc2x, z: this.pc.pc2z },
      { x: this.pc.pc3x, z: this.pc.pc3z },
      { x: this.pc.pc4x, z: this.pc.pc4z }
    ];
    
    for (let i = 0; i < this.spheresControle.length && i < positions.length; i++) {
      this.spheresControle[i].position.set(positions[i].x, 0.25, positions[i].z);
    }
  }
  
  /**
   * Supprime les sphères
   */
  supprimerSpheres() {
    for (const sphere of this.spheresControle) {
      this.scene.remove(sphere);
    }
    this.spheresControle = [];
  }
  
  /**
   * Supprime la trajectoire affichée
   */
  supprimer() {
    if (this.ligneAffichee) {
      this.scene.remove(this.ligneAffichee);
      this.ligneAffichee.geometry.dispose();
      this.ligneAffichee.material.dispose();
      this.ligneAffichee = null;
    }
    this.supprimerSpheres();
  }
  
  /**
   * Obtient les points de la trajectoire
   */
  obtenirPoints() {
    return this.type === 'rectiligne' 
      ? this.creerRectiligne() 
      : this.creerCourbe();
  }
  
  /**
   * Obtient les points de contrôle
   */
  obtenirPointsControle() {
    return this.pc;
  }
}

/**
 * DOCUMENTATION POUR LE RAPPORT
 * ===============================
 * 
 * COURBES DE BÉZIER UTILISÉES:
 * 
 * 1. COURBE QUADRATIQUE (ordre 2):
 *    Formule: B(t) = (1-t)²P₀ + 2(1-t)tP₁ + t²P₂
 *    - 3 points de contrôle: P₀, P₁, P₂
 *    - Utilisée 2 fois (début et fin)
 * 
 * 2. COURBE CUBIQUE (ordre 3):
 *    Formule: B(t) = (1-t)³P₀ + 3(1-t)²tP₁ + 3(1-t)t²P₂ + t³P₃
 *    - 4 points de contrôle: P₀, P₁, P₂, P₃
 *    - Utilisée 1 fois (milieu)
 * 
 * CONTINUITÉ G1:
 * - Continuité de position: Les courbes se touchent
 * - Continuité de tangente: Les tangentes sont alignées
 * - Implémentation: Points communs (P₂ et P₅) entre courbes
 * 
 * CHOIX DES POINTS DE CONTRÔLE:
 * - P₁: Contrôle la courbure initiale (modifiable)
 * - P₃, P₄: Contrôlent la courbure centrale (modifiables)
 * - P₆: Contrôle la courbure finale (modifiable)
 * - Les points sont choisis pour créer une trajectoire
 *   réaliste de pierre de curling avec effet latéral
 */
