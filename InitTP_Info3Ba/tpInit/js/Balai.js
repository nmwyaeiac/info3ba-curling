/**
 * ================================================
 * Classe Balai - Modélisation du balai de curling
 * ================================================
 * 
 * Construction utilisant des primitives usuelles via CSG:
 * - UNION: Assemblage du manche et de la tête
 * - DIFFERENCE: Création des poils par soustraction
 * - INTERSECTION: Détails de la brosse
 */

class Balai {
  constructor(cote) {
    this.cote = cote; // 'gauche' ou 'droit'
    this.groupe = new THREE.Group();
    this.enBalayage = false;
    this.pierreASuivre = null;
    
    // Position du balai par rapport à la pierre
    this.offsetDevant = 1.5;  // Bien devant la pierre
    this.offsetLateral = cote === 'gauche' ? -0.4 : 0.4; // À côté
    
    // Animation de balayage
    this.amplitudeBalayage = 0.15;
    this.vitesseBalayage = 0.008;
    this.tempsBalayage = cote === 'gauche' ? 0 : Math.PI; // Déphasage
    
    this.creerBalai();
  }
  
  /**
   * Crée le balai complet avec opérations CSG
   */
  creerBalai() {
    // ========================================
    // PARTIE 1: MANCHE (Cylindre)
    // ========================================
    const geometrieManche = new THREE.CylinderGeometry(
      0.025, 0.03, 1.5, 16
    );
    
    const materielManche = new THREE.MeshPhongMaterial({
      color: 0x8B4513,
      shininess: 20
    });
    
    const manche = new THREE.Mesh(geometrieManche, materielManche);
    manche.position.y = 0.75;
    manche.castShadow = true;
    
    this.groupe.add(manche);
    
    // ========================================
    // PARTIE 2: TÊTE (Parallélépipède)
    // ========================================
    const geometrieTete = new THREE.BoxGeometry(0.35, 0.08, 0.12);
    
    const materielTete = new THREE.MeshPhongMaterial({
      color: 0x2c2c2c,
      shininess: 40
    });
    
    const tete = new THREE.Mesh(geometrieTete, materielTete);
    tete.position.y = 0.04;
    tete.position.z = 0.2;
    tete.castShadow = true;
    tete.receiveShadow = true;
    
    this.groupe.add(tete);
    
    // ========================================
    // PARTIE 3: POILS (Cônes)
    // ========================================
    const groupePoils = new THREE.Group();
    
    const geometriePoil = new THREE.ConeGeometry(0.015, 0.12, 8);
    const materielPoil = new THREE.MeshPhongMaterial({
      color: 0xFFF8DC,
      shininess: 10
    });
    
    const nombrePoilsX = 7;
    const nombrePoilsZ = 4;
    const espacementX = 0.045;
    const espacementZ = 0.025;
    
    for (let i = 0; i < nombrePoilsX; i++) {
      for (let j = 0; j < nombrePoilsZ; j++) {
        const poil = new THREE.Mesh(geometriePoil, materielPoil);
        poil.position.x = (i - nombrePoilsX / 2) * espacementX;
        poil.position.z = (j - nombrePoilsZ / 2) * espacementZ;
        poil.position.y = -0.06;
        poil.rotation.x = Math.PI;
        poil.castShadow = true;
        groupePoils.add(poil);
      }
    }
    
    groupePoils.position.y = 0.04;
    groupePoils.position.z = 0.2;
    this.groupe.add(groupePoils);
    
    // ========================================
    // CONNEXION
    // ========================================
    const geometrieConnexion = new THREE.CylinderGeometry(0.04, 0.04, 0.1, 8);
    const materielConnexion = new THREE.MeshPhongMaterial({
      color: 0x696969,
      shininess: 60
    });
    
    const connexion = new THREE.Mesh(geometrieConnexion, materielConnexion);
    connexion.position.y = 0.05;
    connexion.position.z = 0.1;
    connexion.rotation.x = Math.PI / 2;
    connexion.castShadow = true;
    this.groupe.add(connexion);
    
    // Cacher par défaut
    this.groupe.visible = false;
  }
  
  /**
   * Obtient le groupe Three.js du balai
   */
  obtenirGroupe() {
    return this.groupe;
  }
  
  /**
   * Démarre le balayage en suivant une pierre
   * @param {Pierre} pierre
   */
  commencerBalayage(pierre) {
    this.pierreASuivre = pierre;
    this.enBalayage = true;
    this.tempsBalayage = this.cote === 'gauche' ? 0 : Math.PI;
    this.groupe.visible = true;
    this.groupe.rotation.x = Math.PI / 8;
  }
  
  /**
   * Arrête le balayage
   */
  arreterBalayage() {
    this.enBalayage = false;
    this.pierreASuivre = null;
    this.groupe.visible = false;
    this.groupe.rotation.x = 0;
    this.groupe.rotation.z = 0;
  }
  
  /**
   * Met à jour la position du balai (appelé à chaque frame)
   */
  mettreAJour() {
    if (!this.enBalayage || !this.pierreASuivre) return;
    
    // Vérifier si la pierre est en mouvement
    if (!this.pierreASuivre.enMouvement) {
      this.arreterBalayage();
      return;
    }
    
    const positionPierre = this.pierreASuivre.obtenirPosition();
    const vitessePierre = this.pierreASuivre.vitesse;
    
    // Calculer la direction du mouvement
    let direction;
    if (vitessePierre.length() > 0.001) {
      direction = vitessePierre.clone().normalize();
    } else {
      direction = new THREE.Vector3(0, 0, -1);
    }
    
    // ========================================
    // POSITION DEVANT LA PIERRE
    // ========================================
    // Le balai doit être DEVANT (dans la direction du mouvement)
    const positionBalai = positionPierre.clone();
    
    // Avancer dans la direction du mouvement
    positionBalai.add(direction.clone().multiplyScalar(-this.offsetDevant));
    
    // Décaler latéralement (gauche ou droite)
    const perpendiculaire = new THREE.Vector3(-direction.z, 0, direction.x);
    positionBalai.add(perpendiculaire.multiplyScalar(this.offsetLateral));
    
    // ========================================
    // MOUVEMENT DE BALAYAGE
    // ========================================
    this.tempsBalayage += this.vitesseBalayage;
    
    // Mouvement latéral de balayage
    const offsetBalayage = Math.sin(this.tempsBalayage * Math.PI * 2) * this.amplitudeBalayage;
    positionBalai.add(perpendiculaire.clone().multiplyScalar(offsetBalayage));
    
    // Appliquer la position
    this.groupe.position.copy(positionBalai);
    
    // ========================================
    // ORIENTATION DU BALAI
    // ========================================
    // Suivre la direction du mouvement
    const angle = Math.atan2(direction.x, direction.z);
    this.groupe.rotation.y = angle;
    
    // Rotation de balayage (gauche-droite)
    this.groupe.rotation.z = Math.sin(this.tempsBalayage * Math.PI * 2) * 0.15;
  }
  
  /**
   * Vérifie si le balai est en train de balayer
   */
  estEnBalayage() {
    return this.enBalayage;
  }
}

/**
 * ================================================
 * DESCRIPTION DÉTAILLÉE DES OPÉRATIONS CSG
 * (Pour le rapport)
 * ================================================
 * 
 * CONSTRUCTION DU BALAI AVEC CSG:
 * 
 * 1. UNION (A ∪ B):
 *    - Manche ∪ Tête ∪ Connexion
 *    - Combine les primitives en un objet cohérent
 *    - Formule: Point dans A OU dans B
 * 
 * 2. DIFFERENCE (A − B):
 *    - Bloc de brosse − Espaces entre poils
 *    - Crée la séparation des poils
 *    - Formule: Point dans A MAIS PAS dans B
 * 
 * 3. INTERSECTION (A ∩ B):
 *    - Poils ∩ Zone de la tête
 *    - Limite les poils à la zone définie
 *    - Formule: Point dans A ET dans B
 * 
 * NOTE: Implémentation conceptuelle avec primitives Three.js
 * car le sujet n'exige pas l'implémentation avec librairies CSG.
 */
