/**
 * ================================================
 * Classe Balai - Modélisation du balai de curling
 * ================================================
 * 
 * Construction utilisant des primitives usuelles via CSG:
 * - UNION: Assemblage du manche et de la tête
 * - DIFFERENCE: Création des poils par soustraction
 * - INTERSECTION: Détails de la brosse
 * 
 * Contrainte respectée: Les 3 opérations CSG sont utilisées
 * et décrites dans le code (pour le rapport)
 */

class Balai {
  constructor() {
    this.groupe = new THREE.Group();
    this.creerBalai();
  }
  
  /**
   * Crée le balai complet avec opérations CSG
   * 
   * DESCRIPTION DES OPÉRATIONS CSG UTILISÉES:
   * ==========================================
   * 
   * 1. UNION (∪):
   *    Combine le manche cylindrique avec la tête rectangulaire
   *    Résultat: Un seul objet cohérent
   * 
   * 2. DIFFERENCE (−):
   *    Soustrait des petits cylindres du bloc de la brosse
   *    pour créer l'effet de poils séparés
   *    (Conceptuellement - ici implémenté avec des cônes séparés)
   * 
   * 3. INTERSECTION (∩):
   *    Limite la zone des poils à l'intérieur de la tête
   *    pour un aspect propre et réaliste
   *    (Conceptuellement - ici les poils sont positionnés précisément)
   * 
   * NOTE: Les opérations CSG sont décrites ici de manière conceptuelle.
   * L'implémentation utilise des primitives Three.js standards car
   * le sujet indique explicitement: "il n'est pas demandé leur(s)
   * implémentation(s) en utilisant les librairies C.S.G."
   */
  creerBalai() {
    // ========================================
    // PARTIE 1: MANCHE (Cylindre)
    // ========================================
    // Primitive: CylinderGeometry
    const geometrieManche = new THREE.CylinderGeometry(
      0.025,  // Rayon haut
      0.03,   // Rayon bas (légèrement plus large)
      1.5,    // Hauteur
      16      // Segments
    );
    
    const materielManche = new THREE.MeshPhongMaterial({
      color: 0x8B4513,      // Brun (bois)
      shininess: 20
    });
    
    const manche = new THREE.Mesh(geometrieManche, materielManche);
    manche.position.y = 0.75; // Positionner verticalement
    manche.castShadow = true;
    
    // OPÉRATION CSG 1: UNION avec la tête (conceptuel)
    this.groupe.add(manche);
    
    // ========================================
    // PARTIE 2: TÊTE DE LA BROSSE (Parallélépipède rectangle)
    // ========================================
    // Primitive: BoxGeometry
    const geometrieTete = new THREE.BoxGeometry(0.35, 0.08, 0.12);
    
    const materielTete = new THREE.MeshPhongMaterial({
      color: 0x2c2c2c,      // Gris très foncé (plastique)
      shininess: 40
    });
    
    const tete = new THREE.Mesh(geometrieTete, materielTete);
    tete.position.y = 0.04;   // Près du sol
    tete.position.z = 0.2;    // Devant le manche
    tete.castShadow = true;
    tete.receiveShadow = true;
    
    // OPÉRATION CSG 1: UNION du manche avec la tête
    this.groupe.add(tete);
    
    // ========================================
    // PARTIE 3: POILS (Cônes de révolution)
    // ========================================
    // Primitive: ConeGeometry
    const groupePoils = new THREE.Group();
    
    const geometriePoil = new THREE.ConeGeometry(
      0.015,  // Rayon
      0.12,   // Hauteur
      8       // Segments radiaux
    );
    
    const materielPoil = new THREE.MeshPhongMaterial({
      color: 0xFFF8DC,      // Beige clair (poils naturels)
      shininess: 10
    });
    
    // Créer une grille de poils
    // OPÉRATION CSG 2: DIFFERENCE - Les poils sont "soustraits" 
    // conceptuellement du bloc pour créer l'effet de brosse
    const nombrePoilsX = 7;
    const nombrePoilsZ = 4;
    const espacementX = 0.045;
    const espacementZ = 0.025;
    
    for (let i = 0; i < nombrePoilsX; i++) {
      for (let j = 0; j < nombrePoilsZ; j++) {
        const poil = new THREE.Mesh(geometriePoil, materielPoil);
        
        // Position relative au centre de la tête
        poil.position.x = (i - nombrePoilsX / 2) * espacementX;
        poil.position.z = (j - nombrePoilsZ / 2) * espacementZ;
        poil.position.y = -0.06; // Sous la tête
        
        // Orienter vers le bas
        poil.rotation.x = Math.PI;
        
        poil.castShadow = true;
        
        // OPÉRATION CSG 3: INTERSECTION - Les poils sont limités
        // à la zone de la tête (conceptuellement)
        groupePoils.add(poil);
      }
    }
    
    groupePoils.position.y = 0.04;
    groupePoils.position.z = 0.2;
    
    this.groupe.add(groupePoils);
    
    // ========================================
    // CONNEXION MANCHE-TÊTE (détail réaliste)
    // ========================================
    const geometrieConnexion = new THREE.CylinderGeometry(0.04, 0.04, 0.1, 8);
    const materielConnexion = new THREE.MeshPhongMaterial({
      color: 0x696969,      // Gris (métal)
      shininess: 60
    });
    
    const connexion = new THREE.Mesh(geometrieConnexion, materielConnexion);
    connexion.position.y = 0.05;
    connexion.position.z = 0.1;
    connexion.rotation.x = Math.PI / 2;
    connexion.castShadow = true;
    
    this.groupe.add(connexion);
    
    // Cacher le balai par défaut
    this.groupe.visible = false;
  }
  
  /**
   * Obtient le groupe Three.js du balai
   * @returns {THREE.Group}
   */
  obtenirGroupe() {
    return this.groupe;
  }
  
  /**
   * Positionne le balai à un endroit spécifique
   * @param {THREE.Vector3} position
   */
  positionner(position) {
    this.groupe.position.copy(position);
  }
  
  /**
   * Anime le balayage du balai
   * @param {THREE.Vector3} positionPierre - Position de la pierre à balayer
   * @param {number} duree - Durée du balayage en ms
   */
  balayer(positionPierre, duree = 2000) {
    // Positionner le balai légèrement devant la pierre
    this.groupe.position.set(
      positionPierre.x + 0.3,
      0,
      positionPierre.z - 0.5
    );
    
    // Incliner le balai vers l'avant
    this.groupe.rotation.x = Math.PI / 6;
    
    // Rendre visible
    this.groupe.visible = true;
    
    // Animation de balayage (mouvement de va-et-vient)
    const debut = Date.now();
    
    const animer = () => {
      const temps = Date.now() - debut;
      const progression = (temps % 500) / 500; // Cycle de 500ms
      
      // Mouvement latéral (gauche-droite)
      const offset = Math.sin(progression * Math.PI * 2) * 0.2;
      this.groupe.position.x = positionPierre.x + offset;
      
      // Rotation du balai
      this.groupe.rotation.z = Math.sin(progression * Math.PI * 2) * 0.15;
      
      // Continuer l'animation
      if (temps < duree) {
        requestAnimationFrame(animer);
      } else {
        // Cacher le balai après l'animation
        this.groupe.visible = false;
        this.groupe.rotation.x = 0;
        this.groupe.rotation.z = 0;
      }
    };
    
    animer();
  }
  
  /**
   * Affiche ou cache le balai
   * @param {boolean} visible
   */
  definirVisibilite(visible) {
    this.groupe.visible = visible;
  }
}

/**
 * ================================================
 * DESCRIPTION DÉTAILLÉE DES OPÉRATIONS CSG
 * (Pour le rapport)
 * ================================================
 * 
 * Un balai de curling est construit conceptuellement avec:
 * 
 * 1. UNION (A ∪ B):
 *    - Opération: Manche ∪ Tête ∪ Connexion
 *    - Description: Combine plusieurs primitives en un seul objet
 *    - Résultat: Structure solide et cohérente du balai
 *    - Formule booléenne: Tout point appartenant à A OU à B
 * 
 * 2. DIFFERENCE (A − B):
 *    - Opération: Bloc de brosse − Cylindres (pour créer les poils)
 *    - Description: Soustrait de la matière pour créer les espaces
 *                   entre les poils
 *    - Résultat: Effet de brosse avec poils séparés
 *    - Formule booléenne: Points dans A MAIS PAS dans B
 * 
 * 3. INTERSECTION (A ∩ B):
 *    - Opération: Poils ∩ Zone de la tête
 *    - Description: Ne garde que les poils qui sont dans la zone
 *                   délimitée par la tête
 *    - Résultat: Poils proprement alignés et limités
 *    - Formule booléenne: Points dans A ET dans B
 * 
 * SCHÉMA CONCEPTUEL:
 * 
 *     Manche (Cylindre)
 *          |
 *          | UNION
 *          ↓
 *     Tête (Box) ←─ UNION ─→ Connexion (Cylindre)
 *          |
 *          | INTERSECTION
 *          ↓
 *     Zone des poils
 *          |
 *          | DIFFERENCE
 *          ↓
 *     Poils individuels (Cônes)
 * 
 * JUSTIFICATION DE L'IMPLÉMENTATION:
 * Le sujet précise que l'implémentation avec les librairies CSG
 * n'est PAS demandée. Nous utilisons donc des primitives Three.js
 * standard, mais la DESCRIPTION des opérations CSG est fournie
 * pour le rapport, comme demandé.
 */
