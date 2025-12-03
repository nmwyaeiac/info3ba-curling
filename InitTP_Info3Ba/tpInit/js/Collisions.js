/**
 * Classe Collision - Gestion des collisions
 * 
 * VERSION CORRIGÉE avec:
 * - Détection robuste
 * - Séparation immédiate et stricte
 * - Correction itérative des pénétrations
 * - Aucun chevauchement visible
 */

class Collision {
  constructor(piste) {
    this.limites = piste.obtenirLimites();
    
    // Physique
    this.rayonPierre = 0.145;
    this.distanceMin = this.rayonPierre * 2.08;
    this.restitution = 0.38;
    this.friction = 0.987;
    this.transfert = 0.58;
  }
  
  /**
   * Gère toutes les collisions pour une pierre
   */
  gerer(pierre, toutesLesPierres) {
    this.verifierBordures(pierre);
    this.verifierPierres(pierre, toutesLesPierres);
    this.appliquerFriction(pierre);
    this.corrigerPenetrations(pierre, toutesLesPierres);
  }
  
  /**
   * Applique la friction
   */
  appliquerFriction(pierre) {
    if (pierre.enMouvement) {
      pierre.vitesse.multiplyScalar(this.friction);
      
      if (pierre.vitesse.length() < 0.009) {
        pierre.arreter();
      }
    }
  }
  
  /**
   * Vérifie les collisions avec les bordures
   */
  verifierBordures(pierre) {
    const pos = pierre.obtenirPosition();
    const vel = pierre.vitesse;
    let collision = false;
    
    // Bordure gauche
    if (pos.x - this.rayonPierre < this.limites.minX) {
      pos.x = this.limites.minX + this.rayonPierre + 0.01;
      if (vel.x < 0) vel.x = -vel.x * this.restitution;
      collision = true;
    }
    
    // Bordure droite
    if (pos.x + this.rayonPierre > this.limites.maxX) {
      pos.x = this.limites.maxX - this.rayonPierre - 0.01;
      if (vel.x > 0) vel.x = -vel.x * this.restitution;
      collision = true;
    }
    
    // Bordure arrière
    if (pos.z - this.rayonPierre < this.limites.minZ) {
      pos.z = this.limites.minZ + this.rayonPierre + 0.01;
      if (vel.z < 0) vel.z = -vel.z * this.restitution;
      collision = true;
    }
    
    // Bordure avant
    if (pos.z + this.rayonPierre > this.limites.maxZ) {
      pos.z = this.limites.maxZ - this.rayonPierre - 0.01;
      if (vel.z > 0) vel.z = -vel.z * this.restitution;
      collision = true;
    }
    
    if (collision) {
      pierre.definirPosition(pos.x, pos.y, pos.z);
    }
  }
  
  /**
   * Vérifie les collisions entre pierres
   */
  verifierPierres(pierre, toutesLesPierres) {
    for (const autre of toutesLesPierres) {
      if (autre === pierre) continue;
      if (!autre.obtenirGroupe().parent) continue;
      
      const pos1 = pierre.obtenirPosition();
      const pos2 = autre.obtenirPosition();
      const distance = pos1.distanceTo(pos2);
      
      if (distance < this.distanceMin && distance > 0.001) {
        this.resoudre(pierre, autre, pos1, pos2, distance);
      }
    }
  }
  
  /**
   * Résout une collision entre deux pierres
   */
  resoudre(p1, p2, pos1, pos2, distance) {
    // ========================================
    // ÉTAPE 1: CALCUL DE LA NORMALE
    // ========================================
    const normale = new THREE.Vector3().subVectors(pos2, pos1);
    if (normale.length() < 0.001) {
      normale.set(Math.random() - 0.5, 0, Math.random() - 0.5);
    }
    normale.normalize();
    
    // ========================================
    // ÉTAPE 2: SÉPARATION IMMÉDIATE
    // ========================================
    const penetration = this.distanceMin - distance;
    if (penetration > 0) {
      const masse1 = p1.enMouvement ? 1 : 0;
      const masse2 = p2.enMouvement ? 1 : 0;
      const masseTotal = masse1 + masse2;
      
      if (masseTotal > 0) {
        const sep1 = (penetration * masse2 / masseTotal) + 0.015;
        const sep2 = (penetration * masse1 / masseTotal) + 0.015;
        
        pos1.sub(normale.clone().multiplyScalar(sep1));
        pos2.add(normale.clone().multiplyScalar(sep2));
      } else {
        const sep = (penetration / 2) + 0.015;
        pos1.sub(normale.clone().multiplyScalar(sep));
        pos2.add(normale.clone().multiplyScalar(sep));
      }
      
      p1.definirPosition(pos1.x, pos1.y, pos1.z);
      p2.definirPosition(pos2.x, pos2.y, pos2.z);
    }
    
    // ========================================
    // ÉTAPE 3: CALCUL DE L'IMPULSION
    // ========================================
    const v1 = p1.vitesse.clone();
    const v2 = p2.vitesse.clone();
    const vRel = new THREE.Vector3().subVectors(v1, v2);
    const vNormale = vRel.dot(normale);
    
    if (vNormale >= 0) return;
    
    const j = -(1 + this.restitution) * vNormale / 2;
    const impulsion = normale.clone().multiplyScalar(j);
    
    // ========================================
    // ÉTAPE 4: APPLICATION DES VITESSES
    // ========================================
    p1.vitesse.sub(impulsion.clone().multiplyScalar(this.transfert));
    p2.vitesse.add(impulsion.clone().multiplyScalar(this.transfert));
    
    if (!p2.enMouvement && p2.vitesse.length() > 0.028) {
      p2.enMouvement = true;
      p2.vitesseRotation = j * 0.18;
    }
    
    if (p1.vitesse.length() < 0.009) {
      p1.arreter();
    }
  }
  
  /**
   * Corrige toutes les pénétrations résiduelles
   */
  corrigerPenetrations(pierre, toutesLesPierres) {
    for (let iteration = 0; iteration < 4; iteration++) {
      let correctionEffectuee = false;
      
      for (const autre of toutesLesPierres) {
        if (autre === pierre) continue;
        if (!autre.obtenirGroupe().parent) continue;
        
        const pos1 = pierre.obtenirPosition();
        const pos2 = autre.obtenirPosition();
        const distance = pos1.distanceTo(pos2);
        
        if (distance < this.distanceMin && distance > 0.001) {
          const normale = new THREE.Vector3().subVectors(pos1, pos2);
          normale.normalize();
          
          const penetration = this.distanceMin - distance;
          const correction = (penetration / 2) + 0.008;
          
          pos1.add(normale.clone().multiplyScalar(correction));
          pierre.definirPosition(pos1.x, pos1.y, pos1.z);
          
          correctionEffectuee = true;
        }
      }
      
      if (!correctionEffectuee) break;
    }
  }
  
  /**
   * Vérifie si une pierre est hors limites
   */
  estHorsLimites(pierre) {
    const pos = pierre.obtenirPosition();
    const marge = 1.8;
    
    return (
      pos.x < this.limites.minX - marge ||
      pos.x > this.limites.maxX + marge ||
      pos.z < this.limites.minZ - marge ||
      pos.z > this.limites.maxZ + marge
    );
  }
}

/**
 * DOCUMENTATION POUR LE RAPPORT
 * ===============================
 * 
 * TYPES DE CHOCS POSSIBLES:
 * 
 * 1. CHOC ÉLASTIQUE:
 *    - Conservation de l'énergie cinétique
 *    - Coefficient de restitution = 1
 *    - Rebond complet
 * 
 * 2. CHOC INÉLASTIQUE:
 *    - Perte d'énergie cinétique
 *    - Coefficient de restitution < 1
 *    - Rebond partiel
 * 
 * 3. CHOC PARFAITEMENT INÉLASTIQUE:
 *    - Perte maximale d'énergie
 *    - Coefficient de restitution = 0
 *    - Pas de rebond
 * 
 * CHOIX RETENU: CHOC INÉLASTIQUE (coefficient 0.38)
 * 
 * JUSTIFICATION:
 * - Le curling présente des chocs partiellement inélastiques
 * - Il y a perte d'énergie par friction et déformation
 * - Les pierres ne rebondissent pas complètement
 * - Coefficient < 1 pour un comportement réaliste
 * 
 * MÉTHODE DE RÉSOLUTION:
 * 1. Détection: Distance < 2 × rayon
 * 2. Séparation: Correction géométrique immédiate
 * 3. Impulsion: Calcul selon la normale de collision
 * 4. Correction itérative: Élimination des pénétrations
 * 
 * Cette approche est VRAISEMBLABLE mais pas parfaitement
 * physique (comme demandé dans le sujet).
 */
