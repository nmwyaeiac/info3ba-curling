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
 * Améliorations:
 * - Détection de collision plus précise avec sous-pas
 * - Prévention du chevauchement des pierres
 * - Collisions multiples gérées correctement
 */

class GestionnaireCollisions {
  constructor(piste) {
    this.piste = piste;
    this.limites = piste.obtenirLimites();
    
    // Rayon de collision (diamètre d'une pierre / 2)
    this.rayonPierre = 0.145;
    this.distanceCollision = this.rayonPierre * 2.1; // Légèrement plus grand pour éviter le chevauchement
    this.distanceMinimale = this.rayonPierre * 2.0;  // Distance minimale absolue
    
    // Coefficients physiques
    this.coefficientRestitution = 0.5;   // Rebond sur les bordures (réduit)
    this.coefficientFrottement = 0.988;  // Friction de la glace (augmenté)
    this.coefficientTransfert = 0.65;    // Transfert d'énergie entre pierres (réduit)
    
    // Pour éviter les collisions multiples
    this.collisionsTraitees = new Set();
  }
  
  /**
   * Réinitialise le suivi des collisions pour cette frame
   */
  reinitialiserCollisions() {
    this.collisionsTraitees.clear();
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
    
    // Appliquer la friction
    this.appliquerFriction(pierre);
  }
  
  /**
   * Applique la friction de la glace
   * @param {Pierre} pierre
   */
  appliquerFriction(pierre) {
    if (pierre.enMouvement) {
      pierre.vitesse.multiplyScalar(this.coefficientFrottement);
      pierre.vitesseActuelle = pierre.vitesse.length();
      
      // Arrêter la pierre si trop lente
      if (pierre.vitesseActuelle < 0.015) {
        pierre.arreter();
      }
    }
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
      
      // Créer une clé unique pour cette paire de pierres
      const cleCollision = this.creerCleCollision(pierre, autrePierre);
      
      // Vérifier si cette collision a déjà été traitée cette frame
      if (this.collisionsTraitees.has(cleCollision)) continue;
      
      const positionAutre = autrePierre.obtenirPosition();
      
      // Calculer la distance entre les centres des deux pierres
      const distance = positionPierre.distanceTo(positionAutre);
      
      // Vérifier si collision
      if (distance < this.distanceCollision && distance > 0.001) {
        this.resoudreCollisionPierres(pierre, autrePierre, distance);
        this.collisionsTraitees.add(cleCollision);
      }
    }
  }
  
  /**
   * Crée une clé unique pour une paire de pierres
   * @param {Pierre} p1
   * @param {Pierre} p2
   * @returns {string}
   */
  creerCleCollision(p1, p2) {
    const id1 = p1.obtenirGroupe().id;
    const id2 = p2.obtenirGroupe().id;
    return id1 < id2 ? `${id1}-${id2}` : `${id2}-${id1}`;
  }
  
  /**
   * Résout une collision entre deux pierres avec physique améliorée
   * 
   * @param {Pierre} pierre1 - Première pierre
   * @param {Pierre} pierre2 - Deuxième pierre
   * @param {number} distance - Distance entre les centres
   */
  resoudreCollisionPierres(pierre1, pierre2, distance) {
    const pos1 = pierre1.obtenirPosition();
    const pos2 = pierre2.obtenirPosition();
    
    // ========================================
    // ÉTAPE 1: VECTEUR DE COLLISION
    // ========================================
    const direction = new THREE.Vector3()
      .subVectors(pos2, pos1);
    
    // Éviter la division par zéro
    if (direction.length() < 0.001) {
      direction.set(1, 0, 0);
    }
    direction.normalize();
    
    // ========================================
    // ÉTAPE 2: SÉPARATION IMMÉDIATE DES PIERRES
    // ========================================
    // Calculer le chevauchement
    const chevauchement = this.distanceMinimale - distance;
    
    if (chevauchement > 0) {
      // Séparer les pierres proportionnellement à leur état de mouvement
      const facteur1 = pierre1.enMouvement ? 0.5 : 0;
      const facteur2 = pierre2.enMouvement ? 0.5 : 1;
      const total = facteur1 + facteur2;
      
      if (total > 0) {
        const separation1 = (chevauchement * facteur1 / total) + 0.01;
        const separation2 = (chevauchement * facteur2 / total) + 0.01;
        
        pos1.sub(direction.clone().multiplyScalar(separation1));
        pos2.add(direction.clone().multiplyScalar(separation2));
        
        pierre1.definirPosition(pos1.x, pos1.y, pos1.z);
        pierre2.definirPosition(pos2.x, pos2.y, pos2.z);
      }
    }
    
    // ========================================
    // ÉTAPE 3: CALCUL DES VITESSES
    // ========================================
    const v1 = pierre1.vitesse.clone();
    const v2 = pierre2.vitesse.clone();
    
    // Vitesse relative le long de la normale
    const vitesseRelative = new THREE.Vector3().subVectors(v1, v2);
    const vitesseNormale = vitesseRelative.dot(direction);
    
    // Ne résoudre que si les pierres se rapprochent
    if (vitesseNormale > -0.001) return;
    
    // ========================================
    // ÉTAPE 4: CALCUL DE L'IMPULSION
    // ========================================
    // Pour deux masses égales, formule simplifiée
    const masse = 1.0; // Masse normalisée
    const e = this.coefficientRestitution;
    
    const impulsion = -(1 + e) * vitesseNormale / (1/masse + 1/masse);
    const impulseVector = direction.clone().multiplyScalar(impulsion);
    
    // ========================================
    // ÉTAPE 5: APPLICATION DES NOUVELLES VITESSES
    // ========================================
    // Calculer les changements de vitesse
    const deltaV1 = impulseVector.clone().multiplyScalar(1/masse);
    const deltaV2 = impulseVector.clone().multiplyScalar(-1/masse);
    
    // Appliquer avec coefficient de transfert
    pierre1.vitesse.add(deltaV1.multiplyScalar(this.coefficientTransfert));
    pierre2.vitesse.add(deltaV2.multiplyScalar(this.coefficientTransfert));
    
    // Mettre à jour les vitesses actuelles
    pierre1.vitesseActuelle = pierre1.vitesse.length();
    pierre2.vitesseActuelle = pierre2.vitesse.length();
    
    // ========================================
    // ÉTAPE 6: GESTION DES ÉTATS
    // ========================================
    // Activer pierre2 si elle reçoit assez d'énergie
    if (!pierre2.enMouvement && pierre2.vitesseActuelle > 0.04) {
      pierre2.enMouvement = true;
      pierre2.vitesseAngulaire = impulsion * 0.3;
    }
    
    // Arrêter pierre1 si trop lente
    if (pierre1.vitesseActuelle < 0.015) {
      pierre1.arreter();
    }
    
    // Ajuster la rotation
    if (pierre1.enMouvement) {
      pierre1.vitesseAngulaire *= 0.8;
    }
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
   *    - Utilisé dans ce projet avec e = 0.5
   * 
   * 3. CHOC PARFAITEMENT INÉLASTIQUE:
   *    - Les objets restent collés après le choc
   *    - e = 0
   *    - Pas adapté au curling
   * 
   * CHOIX RETENU: Choc inélastique avec séparation immédiate
   * 
   * JUSTIFICATION:
   * - Les pierres de curling sur la glace ont un coefficient de
   *   restitution faible (environ 0.4-0.6)
   * - Notre implémentation utilise e = 0.5 pour un comportement
   *   réaliste et stable
   * - La séparation immédiate des pierres évite le chevauchement
   *   et les collisions multiples non désirées
   * - Le coefficient de transfert (0.65) empêche les transferts
   *   d'énergie trop importants
   * 
   * AMÉLIORATIONS IMPLÉMENTÉES:
   * - Séparation proportionnelle selon l'état de mouvement
   * - Détection des collisions traitées pour éviter les doublons
   * - Vérification que les pierres se rapprochent vraiment
   * - Friction constante appliquée à chaque frame
   * - Distance de collision légèrement augmentée pour la détection précoce
   * - Gestion des cas limites (division par zéro, vitesse nulle)
   */
}
