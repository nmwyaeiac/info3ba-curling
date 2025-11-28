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
 * Types de chocs possibles:
 * 1. Collision pierre-pierre: transfert d'énergie simplifié
 * 2. Collision pierre-bordure: rebond avec perte d'énergie
 * 3. Collision multiple: traitement séquentiel
 */

class GestionnaireCollisions {
  constructor(piste) {
    this.piste = piste;
    this.limites = piste.obtenirLimites();
    
    // Rayon de collision (diamètre d'une pierre / 2)
    this.rayonPierre = 0.145;
    this.distanceCollision = this.rayonPierre * 2;
    
    // Coefficient de restitution (pour les rebonds)
    // Valeur < 1 signifie perte d'énergie lors de la collision
    this.coefficientRestitution = 0.4;
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
    
    // ========================================
    // COLLISION AVEC BORDURES LATÉRALES (X)
    // ========================================
    if (position.x - this.rayonPierre < this.limites.minX) {
      // Collision avec bordure gauche
      position.x = this.limites.minX + this.rayonPierre;
      vitesse.x = Math.abs(vitesse.x) * this.coefficientRestitution;
      pierre.definirPosition(position.x, position.y, position.z);
      
    } else if (position.x + this.rayonPierre > this.limites.maxX) {
      // Collision avec bordure droite
      position.x = this.limites.maxX - this.rayonPierre;
      vitesse.x = -Math.abs(vitesse.x) * this.coefficientRestitution;
      pierre.definirPosition(position.x, position.y, position.z);
    }
    
    // ========================================
    // COLLISION AVEC BORDURES AVANT/ARRIÈRE (Z)
    // ========================================
    if (position.z - this.rayonPierre < this.limites.minZ) {
      // Collision avec bordure arrière
      position.z = this.limites.minZ + this.rayonPierre;
      vitesse.z = Math.abs(vitesse.z) * this.coefficientRestitution;
      pierre.definirPosition(position.x, position.y, position.z);
      
    } else if (position.z + this.rayonPierre > this.limites.maxZ) {
      // Collision avec bordure avant
      position.z = this.limites.maxZ - this.rayonPierre;
      vitesse.z = -Math.abs(vitesse.z) * this.coefficientRestitution;
      pierre.definirPosition(position.x, position.y, position.z);
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
      if (distance < this.distanceCollision) {
        this.resoudreCollisionPierres(pierre, autrePierre, distance);
      }
    }
  }
  
  /**
   * Résout une collision entre deux pierres
   * 
   * MÉTHODE CHOISIE: Transfert d'impulsion simplifié
   * Cette méthode est VRAISEMBLABLE mais pas physiquement correcte.
   * 
   * Justification du choix:
   * - Simple à implémenter
   * - Donne des résultats visuellement satisfaisants
   * - Permet des collisions multiples sans bugs
   * - Évite les calculs complexes de physique réelle
   * 
   * @param {Pierre} pierre1 - Première pierre (en mouvement)
   * @param {Pierre} pierre2 - Deuxième pierre
   * @param {number} distance - Distance entre les centres
   */
  resoudreCollisionPierres(pierre1, pierre2, distance) {
    // ========================================
    // CALCUL DE LA DIRECTION DE COLLISION
    // ========================================
    const pos1 = pierre1.obtenirPosition();
    const pos2 = pierre2.obtenirPosition();
    
    // Vecteur de collision (de pierre1 vers pierre2)
    const direction = new THREE.Vector3()
      .subVectors(pos2, pos1)
      .normalize();
    
    // ========================================
    // SÉPARATION DES PIERRES
    // ========================================
    // Empêcher les pierres de se chevaucher
    const chevauchement = this.distanceCollision - distance;
    const separation = chevauchement / 2 + 0.01; // +0.01 pour éviter des collisions multiples
    
    pos1.sub(direction.clone().multiplyScalar(separation));
    pos2.add(direction.clone().multiplyScalar(separation));
    
    pierre1.definirPosition(pos1.x, pos1.y, pos1.z);
    pierre2.definirPosition(pos2.x, pos2.y, pos2.z);
    
    // ========================================
    // TRANSFERT D'IMPULSION (SIMPLIFIÉ)
    // ========================================
    // Cette approche est simplifiée et non physiquement correcte
    // mais donne des résultats visuellement acceptables
    
    // Force basée sur la vitesse de pierre1
    const vitessePierre1 = pierre1.vitesse.length();
    const force = vitessePierre1 * 0.6; // Facteur de transfert
    
    // Appliquer une impulsion à pierre2 dans la direction de collision
    pierre2.appliquerImpulsion(direction, force);
    
    // Réduire la vitesse de pierre1 (perte d'énergie)
    pierre1.vitesse.multiplyScalar(0.3);
    pierre1.vitesseActuelle = pierre1.vitesse.length();
    
    // ========================================
    // EFFETS SECONDAIRES
    // ========================================
    // Si pierre2 n'était pas en mouvement, la mettre en mouvement
    if (!pierre2.enMouvement && pierre2.vitesseActuelle > 0.05) {
      pierre2.enMouvement = true;
    }
    
    // Si pierre1 est trop lente, l'arrêter
    if (pierre1.vitesseActuelle < 0.05) {
      pierre1.arreter();
    }
  }
  
  /**
   * Vérifie si une pierre est sortie de la zone de jeu
   * @param {Pierre} pierre - Pierre à vérifier
   * @returns {boolean} - true si hors limites
   */
  estHorsLimites(pierre) {
    const position = pierre.obtenirPosition();
    
    return (
      position.x < this.limites.minX - 1 ||
      position.x > this.limites.maxX + 1 ||
      position.z < this.limites.minZ - 1 ||
      position.z > this.limites.maxZ + 1
    );
  }
  
  /**
   * TYPES DE CHOCS POSSIBLES (pour le rapport)
   * 
   * 1. CHOC ÉLASTIQUE PARFAIT:
   *    - Conservation totale de l'énergie cinétique
   *    - Physiquement correct mais complexe
   *    - Formules: v1' = ((m1-m2)v1 + 2m2v2)/(m1+m2)
   *    - Non utilisé car trop complexe pour ce projet
   * 
   * 2. CHOC INÉLASTIQUE:
   *    - Perte d'énergie lors de la collision
   *    - Plus réaliste pour le curling
   *    - Nécessite coefficient de restitution
   *    - Partiellement utilisé (pour les bordures)
   * 
   * 3. TRANSFERT D'IMPULSION SIMPLIFIÉ (CHOISI):
   *    - Direction de collision calculée
   *    - Transfert proportionnel à la vitesse
   *    - Perte d'énergie pour pierre1
   *    - AVANTAGES:
   *      * Simple à comprendre et déboguer
   *      * Visuellement satisfaisant
   *      * Stable numériquement
   *      * Permet collisions multiples
   *    - INCONVÉNIENTS:
   *      * Pas physiquement correct
   *      * Conservation d'énergie non respectée
   *    - JUSTIFICATION:
   *      Le sujet demande explicitement des chocs VRAISEMBLABLES
   *      et NON physiquement corrects. Cette méthode répond
   *      parfaitement à cette exigence.
   */
}
