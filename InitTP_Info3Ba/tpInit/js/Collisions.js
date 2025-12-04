/**
 * Classe Collision - Gestion des collisions
 * 
 * VERSION CORRIGÉE avec collisions réalistes
 */

class Collision {
  constructor(piste) {
    this.limites = piste.obtenirLimites();
    
    // Physique
    this.rayonPierre = 0.145;
    this.distanceMin = this.rayonPierre * 2.08;
    this.restitution = 0.38;
    this.friction = 0.987;
    this.transfert = 0.6;
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
    
    if (pos.x - this.rayonPierre < this.limites.minX) {
      pos.x = this.limites.minX + this.rayonPierre + 0.01;
      if (vel.x < 0) vel.x = -vel.x * this.restitution;
      collision = true;
    }
    
    if (pos.x + this.rayonPierre > this.limites.maxX) {
      pos.x = this.limites.maxX - this.rayonPierre - 0.01;
      if (vel.x > 0) vel.x = -vel.x * this.restitution;
      collision = true;
    }
    
    if (pos.z - this.rayonPierre < this.limites.minZ) {
      pos.z = this.limites.minZ + this.rayonPierre + 0.01;
      if (vel.z < 0) vel.z = -vel.z * this.restitution;
      collision = true;
    }
    
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
    // Calcul de la normale
    const normale = new THREE.Vector3().subVectors(pos2, pos1);
    if (normale.length() < 0.001) {
      normale.set(Math.random() - 0.5, 0, Math.random() - 0.5);
    }
    normale.normalize();
    
    // Séparation immédiate
    const penetration = this.distanceMin - distance;
    if (penetration > 0) {
      const masse1 = p1.enMouvement ? 1 : 0;
      const masse2 = p2.enMouvement ? 1 : 0;
      const masseTotal = masse1 + masse2;
      
      if (masseTotal > 0) {
        const sep1 = (penetration * masse2 / masseTotal) + 0.02;
        const sep2 = (penetration * masse1 / masseTotal) + 0.02;
        
        pos1.sub(normale.clone().multiplyScalar(sep1));
        pos2.add(normale.clone().multiplyScalar(sep2));
      } else {
        const sep = (penetration / 2) + 0.02;
        pos1.sub(normale.clone().multiplyScalar(sep));
        pos2.add(normale.clone().multiplyScalar(sep));
      }
      
      p1.definirPosition(pos1.x, pos1.y, pos1.z);
      p2.definirPosition(pos2.x, pos2.y, pos2.z);
    }
    
    // Calcul de l'impulsion
    const v1 = p1.vitesse.clone();
    const v2 = p2.vitesse.clone();
    const vRel = new THREE.Vector3().subVectors(v1, v2);
    const vNormale = vRel.dot(normale);
    
    if (vNormale >= 0) return;
    
    const j = -(1 + this.restitution) * vNormale / 2;
    const impulsion = normale.clone().multiplyScalar(j);
    
    // Application des vitesses avec angles
    const nouvelleVitesse1 = impulsion.clone().multiplyScalar(-this.transfert * 1.2);
    p1.vitesse.add(nouvelleVitesse1);
    
    const nouvelleVitesse2 = impulsion.clone().multiplyScalar(this.transfert * 1.2);
    p2.vitesse.add(nouvelleVitesse2);
    
    if (p1.enMouvement) {
      const transfertEnergie = v1.clone().multiplyScalar(0.5);
      p2.vitesse.add(transfertEnergie);
    }
    
    if (!p2.enMouvement && p2.vitesse.length() > 0.02) {
      p2.enMouvement = true;
      p2.vitesseRotation = j * 0.15;
    }
    
    if (p1.vitesse.length() < 0.008) {
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
