/**
 * Classe Balai - Construction avec primitives CSG
 * 
 * OPÉRATIONS CSG CONCEPTUELLES:
 * 1. UNION: Assemblage manche + tête + poils
 * 2. DIFFERENCE: Création des espaces entre les poils
 * 3. INTERSECTION: Limitation des poils à la zone de brosse
 */

class Balai {
  constructor(cote) {
    this.cote = cote; // 'gauche' ou 'droite'
    this.groupe = new THREE.Group();
    this.actif = false;
    this.pierreASuivre = null;
    
    // Paramètres d'animation
    this.tempsBalayage = cote === 'gauche' ? 0 : Math.PI;
    this.vitesseBalayage = 0.01;
    this.amplitudeBalayage = 0.12;
    this.distanceDevant = 1.3;
    this.offsetLateral = cote === 'gauche' ? -0.5 : 0.5;
    
    this.construireBalai();
  }
  
  /**
   * Construction du balai avec opérations CSG conceptuelles
   */
  construireBalai() {
    // ========================================
    // PARTIE 1: MANCHE (Cylindre)
    // Opération: UNION (base)
    // ========================================
    const geoManche = new THREE.CylinderGeometry(0.022, 0.028, 1.4, 12);
    const matManche = new THREE.MeshStandardMaterial({
      color: 0x8b4513,
      roughness: 0.7
    });
    
    const manche = new THREE.Mesh(geoManche, matManche);
    manche.position.y = 0.7;
    manche.castShadow = true;
    this.groupe.add(manche);
    
    // ========================================
    // PARTIE 2: TÊTE (Parallélépipède)
    // Opération: UNION avec le manche
    // ========================================
    const geoTete = new THREE.BoxGeometry(0.32, 0.07, 0.11);
    const matTete = new THREE.MeshStandardMaterial({
      color: 0x2a2a2a,
      roughness: 0.5
    });
    
    const tete = new THREE.Mesh(geoTete, matTete);
    tete.position.y = 0.035;
    tete.position.z = 0.18;
    tete.castShadow = true;
    tete.receiveShadow = true;
    this.groupe.add(tete);
    
    // ========================================
    // PARTIE 3: POILS (Cônes)
    // Opérations: INTERSECTION (zone tête) et DIFFERENCE (espacement)
    // ========================================
    const groupePoils = new THREE.Group();
    const geoPoil = new THREE.ConeGeometry(0.012, 0.11, 7);
    const matPoil = new THREE.MeshStandardMaterial({
      color: 0xfff5dc,
      roughness: 0.8
    });
    
    const nbPoilsX = 6;
    const nbPoilsZ = 3;
    const espacementX = 0.048;
    const espacementZ = 0.028;
    
    for (let i = 0; i < nbPoilsX; i++) {
      for (let j = 0; j < nbPoilsZ; j++) {
        const poil = new THREE.Mesh(geoPoil, matPoil);
        poil.position.x = (i - nbPoilsX / 2 + 0.5) * espacementX;
        poil.position.z = (j - nbPoilsZ / 2 + 0.5) * espacementZ;
        poil.position.y = -0.055;
        poil.rotation.x = Math.PI;
        poil.castShadow = true;
        groupePoils.add(poil);
      }
    }
    
    groupePoils.position.y = 0.035;
    groupePoils.position.z = 0.18;
    this.groupe.add(groupePoils);
    
    // ========================================
    // CONNEXION (Cylindre)
    // Opération: UNION pour joindre manche et tête
    // ========================================
    const geoConnexion = new THREE.CylinderGeometry(0.035, 0.035, 0.09, 8);
    const matConnexion = new THREE.MeshStandardMaterial({
      color: 0x606060,
      metalness: 0.3,
      roughness: 0.4
    });
    
    const connexion = new THREE.Mesh(geoConnexion, matConnexion);
    connexion.position.y = 0.045;
    connexion.position.z = 0.09;
    connexion.rotation.x = Math.PI / 2;
    connexion.castShadow = true;
    this.groupe.add(connexion);
    
    this.groupe.visible = false;
  }
  
  /**
   * Commence à suivre une pierre
   */
  commencer(pierre) {
    this.pierreASuivre = pierre;
    this.actif = true;
    this.groupe.visible = true;
    this.groupe.rotation.x = Math.PI / 8;
  }
  
  /**
   * Arrête de suivre la pierre
   */
  arreter() {
    this.actif = false;
    this.pierreASuivre = null;
    this.groupe.visible = false;
    this.groupe.rotation.x = 0;
    this.groupe.rotation.z = 0;
  }
  
  /**
   * Mise à jour de la position du balai
   */
  mettreAJour() {
    if (!this.actif || !this.pierreASuivre) return;
    
    if (!this.pierreASuivre.enMouvement) {
      this.arreter();
      return;
    }
    
    const posPierre = this.pierreASuivre.obtenirPosition();
    const vitesse = this.pierreASuivre.vitesse;
    
    // Direction du mouvement
    let direction;
    if (vitesse.length() > 0.001) {
      direction = vitesse.clone().normalize();
    } else {
      direction = new THREE.Vector3(0, 0, -1);
    }
    
    // Position devant la pierre
    const posBalai = posPierre.clone();
    posBalai.add(direction.clone().multiplyScalar(-this.distanceDevant));
    
    // Décalage latéral (gauche ou droite)
    const perpendiculaire = new THREE.Vector3(-direction.z, 0, direction.x);
    posBalai.add(perpendiculaire.multiplyScalar(this.offsetLateral));
    
    // Mouvement de balayage latéral
    this.tempsBalayage += this.vitesseBalayage;
    const offsetX = Math.sin(this.tempsBalayage * Math.PI * 2) * this.amplitudeBalayage;
    posBalai.add(perpendiculaire.clone().multiplyScalar(offsetX));
    
    this.groupe.position.copy(posBalai);
    
    // Orientation
    const angle = Math.atan2(direction.x, direction.z);
    this.groupe.rotation.y = angle;
    this.groupe.rotation.z = Math.sin(this.tempsBalayage * Math.PI * 2) * 0.12;
  }
  
  obtenirGroupe() {
    return this.groupe;
  }
  
  estActif() {
    return this.actif;
  }
}
