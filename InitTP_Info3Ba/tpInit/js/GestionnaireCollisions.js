/**
 * ================================================
 * Classe GestionnaireCollisions
 * ================================================
 * 
 * Gère les collisions entre les pierres et avec les bordures.
 * 
 * IMPORTANT: Les chocs sont VRAISEMBLABLES mais PAS physiquement corrects
 * (comme spécifié dans le sujet du projet)
 * 
 * Physique améliorée avec:
 * - Conservation partielle du moment
 * - Transfert d'énergie plus réaliste
 * - Gestion des collisions multiples
 */

class GestionnaireCollisions {
  constructor(piste) {
    this.piste = piste;
    this.limites = piste.obtenirLimites();
    
    // Rayon de collision (diamètre d'une pierre / 2)
    this.rayonPierre = 0.145;
    this.distanceCollision = this.rayonPierre * 2;
    
    // Coefficients physiques (simplifiés)
    this.coefficientRestitution = 0.6;  // Rebond sur les bordures
    this.coefficientFrottement = 0.985; // Friction de la glace
    this.coefficientTransfert = 0.7;    // Transfert d'énergie entre pierres
  }
  
  /**
   * Vérifie et gère toutes les collisions pour une pierre en mouvement
   * @param {Pierre} pierre - Pierre à vérifier
   * @param {Array<Pierre>} toutesLesPierres - Toutes les pierres du jeu
   */
  gererCollisions(pierre, toutesLesPierres) {
    // D'abord, vérifier les collisions avec les bordures
    this.verifierCollisionBordures(pierre);
    
    // Ensuite, vérifier les collisions avec les autres pierres
    this.verifierCollisionPierres(pierre, toutesLesPierres);
  }
  
  /**
   * Vérifie et gère les collisions avec les bordures de la piste
   * @param {Pierre} pierre - Pierre à vérifier
   */
  verifierCollisionBordures(pierre) {
    const position = pierre.obtenirPosition();
    const vitesse = pierre.vitesse;
    let collision = false;
    
    // ========================================
    // COLLISION AVEC BORDURES LATÉRALES (X)
    // ========================================
    if (position.x - this.rayonPierre < this.limites.minX) {
      // Collision avec bordure gauche
      position.x = this.limites.minX + this.rayonPierre;
      vitesse.x = Math.abs(vitesse.x) * this.coefficientRestitution;
      collision = true;
      
    } else if (position.x + this.rayonPierre > this.limites.maxX) {
      // Collision avec bordure droite
      position.x = this.limites.maxX - this.rayonPierre;
      vitesse.x = -Math.abs(vitesse.x) * this.coefficientRestitution;
      collision = true;
    }
    
    // ========================================
    // COLLISION AVEC BORDURES AVANT/ARRIÈRE (Z)
    // ========================================
    if (position.z - this.rayonPierre < this.limites.minZ) {
      // Collision avec bordure arrière
      position.z = this.limites.minZ + this.rayonPierre;
      vitesse.z = Math.abs(vitesse.z) * this.coefficientRestitution;
      collision = true;
      
    } else if (position.z + this.rayonPierre > this.limites.maxZ) {
      // Collision avec bordure avant
      position.z = this.limites.maxZ - this.rayonPierre;
      vitesse.z = -Math.abs(vitesse.z) * this.coefficientRestitution;
      collision = true;
    }
    
    if (collision) {
      pierre.definirPosition(position.x, position.y, position.z);
      pierre.vitesseActuelle = vitesse.length();
    }
  }
  
  /**
   * Vérifie et gère les collisions entre pierres
   * @param {Pierre} pierre - Pierre en mouvement
   * @param {Array<Pierre>} toutesLesPierres - Toutes les pierres
   */
  verifierCollisionPierres(pierre, toutesLesPierres) {
    const positionPierre = pierre.obtenirPosition();
    
    for (const autrePierre of toutesLesPierres) {
      // Ne pas vérifier la collision avec soi-même
      if (autrePierre === pierre) continue;
      
      const positionAutre = autrePierre.obtenirPosition();
      
      // Calculer la distance entre les centres des deux pierres
      const distance = positionPierre.distanceTo(positionAutre);
      
      // Vérifier si collision (distance < somme des rayons)
      if (distance < this.distanceCollision && distance > 0.001) {
        this.resoudreCollisionPierres(pierre, autrePierre, distance);
      }
    }
  }
  
  /**
   * Résout une collision entre deux pierres avec physique améliorée
   * 
   * MÉTHODE: Collision élastique simplifiée avec conservation du moment
   * 
   * @param {Pierre} pierre1 - Première pierre (en mouvement)
   * @param {Pierre} pierre2 - Deuxième pierre
   * @param {number} distance - Distance entre les centres
   */
  resoudreCollisionPierres(pierre1, pierre2, distance) {
    const pos1 = pierre1.obtenirPosition();
    const pos2 = pierre2.obtenirPosition();
    
    // ========================================
    // ÉTAPE 1: VECTEUR DE COLLISION
    // ========================================
    const directionCollision = new THREE.Vector3()
      .subVectors(pos2, pos1)
      .normalize();
    
    // ========================================
    // ÉTAPE 2: SÉPARATION DES PIERRES
    // ========================================
    const chevauchement = this.distanceCollision - distance;
    const separation = chevauchement / 2 + 0.02;
    
    pos1.sub(directionCollision.clone().multiplyScalar(separation));
    pos2.add(directionCollision.clone().multiplyScalar(separation));
    
    pierre1.definirPosition(pos1.x, pos1.y, pos1.z);
    pierre2.definirPosition(pos2.x, pos2.y, pos2.z);
    
    // ========================================
    // ÉTAPE 3: CALCUL DES VITESSES RELATIVES
    // ========================================
    const v1 = pierre1.vitesse.clone();
    const v2 = pierre2.vitesse.clone();
    
    // Vitesse relative
    const vitesseRelative = new THREE.Vector3().subVectors(v1, v2);
    
    // Vitesse le long de la normale de collision
    const vitesseNormale = vitesseRelative.dot(directionCollision);
    
    // Ne résoudre que si les pierres se rapprochent
    if (vitesseNormale > 0) return;
    
    // ========================================
    // ÉTAPE 4: IMPULSION DE COLLISION
    // ========================================
    // Formule simplifiée (masses égales)
    const impulsion = -(1 + this.coefficientRestitution) * vitesseNormale / 2;
    
    const impulseVector = directionCollision.clone().multiplyScalar(impulsion);
    
    // ========================================
    // ÉTAPE 5: APPLICATION DES NOUVELLES VITESSES
    // ========================================
    // Appliquer l'impulsion à pierre1 (négative)
    pierre1.vitesse.sub(impulseVector.clone().multiplyScalar(this.coefficientTransfert));
    pierre1.vitesseActuelle = pierre1.vitesse.length();
    
    // Appliquer l'impulsion à pierre2 (positive)
    pierre2.vitesse.add(impulseVector.clone().multiplyScalar(this.coefficientTransfert));
    pierre2.vitesseActuelle = pierre2.vitesse.length();
    
    // ========================================
    // ÉTAPE 6: GESTION DES ÉTATS
    // ========================================
    // Activer pierre2 si elle reçoit assez d'énergie
    if (!pierre2.enMouvement && pierre2.vitesseActuelle > 0.03) {
      pierre2.enMouvement = true;
    }
    
    // Arrêter pierre1 si trop lente
    if (pierre1.vitesseActuelle < 0.02) {
      pierre1.arreter();
    }
    
    // ========================================
    // ÉTAPE 7: ROTATION (effet visuel)
    // ========================================
    // Modifier légèrement la rotation pour l'effet visuel
    pierre1.vitesseAngulaire *= 0.7;
    pierre2.vitesseAngulaire = impulsion * 0.5;
  }
  
  /**
   * Vérifie si une pierre est sortie de la zone de jeu
   * @param {Pierre} pierre - Pierre à vérifier
   * @returns {boolean} - true si hors limites
   */
  estHorsLimites(pierre) {
    const position = pierre.obtenirPosition();
    const marge = 2; // Marge avant suppression
    
    return (
      position.x < this.limites.minX - marge ||
      position.x > this.limites.maxX + marge ||
      position.z < this.limites.minZ - marge ||
      position.z > this.limites.maxZ + marge
    );
  }
  
  /**
   * DOCUMENTATION POUR LE RAPPORT
   * ==============================
   * 
   * TYPES DE CHOCS POSSIBLES:
   * 
   * 1. CHOC ÉLASTIQUE PARFAIT:
   *    - Conservation totale de l'énergie cinétique
   *    - e = 1 (coefficient de restitution)
   *    - Formules: v1' = ((m1-m2)v1 + 2m2v2)/(m1+m2)
   *    - Avantage: Physiquement correct
   *    - Inconvénient: Trop "rebondissant" pour le curling
   * 
   * 2. CHOC INÉLASTIQUE:
   *    - Perte d'énergie lors de la collision
   *    - 0 < e < 1
   *    - Plus réaliste pour les pierres de curling
   *    - Utilisé dans ce projet avec e = 0.6
   * 
   * 3. CHOC PARFAITEMENT INÉLASTIQUE:
   *    - Les objets restent collés après le choc
   *    - e = 0
   *    - Pas adapté au curling
   * 
   * CHOIX RETENU: Choc inélastique avec conservation partielle du moment
   * 
   * JUSTIFICATION:
   * - Les pierres de curling sur la glace ont un coefficient de
   *   restitution entre 0.4 et 0.7
   * - Notre implémentation utilise e = 0.6 pour un comportement
   *   visuellement satisfaisant
   * - La méthode simplifie les calculs (masses égales) tout en
   *   donnant des résultats vraisemblables
   * - Stable numériquement, évite les bugs de collisions multiples
   * 
   * AMÉLIORATIONS PAR RAPPORT À LA VERSION PRÉCÉDENTE:
   * - Meilleure séparation des pierres (évite le chevauchement)
   * - Calcul d'impulsion basé sur la vitesse relative
   * - Vérification que les pierres se rapprochent avant collision
   * - Transfert d'énergie plus réaliste
   * - Gestion améliorée des rotations
   */
}
