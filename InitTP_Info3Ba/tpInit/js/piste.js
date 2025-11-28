/**
 * ================================================
 * Classe Piste - Création de la piste de curling
 * ================================================
 * 
 * Crée la piste complète avec:
 * - Surface de glace
 * - Bordures
 * - La maison (house) avec cercles concentriques
 * - Lignes de jeu (hog line, centre, etc.)
 */

class Piste {
  constructor(scene) {
    this.scene = scene;
    
    // Dimensions de la piste (en mètres)
    this.longueur = 45;
    this.largeur = 5;
    this.rayonMaison = 1.83; // Rayon standard de la maison en curling
    
    // Position du centre de la maison
    this.centreMaison = new THREE.Vector3(0, 0, -this.longueur / 2 + 6);
    
    this.creerPiste();
  }
  
  /**
   * Crée tous les éléments de la piste
   */
  creerPiste() {
    this.creerGlace();
    this.creerBordures();
    this.creerMaison();
    this.creerLignes();
  }
  
  /**
   * Crée la surface de glace
   */
  creerGlace() {
    // Géométrie du plan de glace
    const geometrieGlace = new THREE.PlaneGeometry(
      this.largeur * 2,
      this.longueur
    );
    
    // Matériau avec apparence de glace
    const materielGlace = new THREE.MeshPhongMaterial({
      color: 0xd0e8f0,      // Couleur bleu-blanc glacé
      shininess: 100,        // Brillance élevée pour l'effet glace
      specular: 0x666666,    // Reflets
      side: THREE.DoubleSide
    });
    
    const glace = new THREE.Mesh(geometrieGlace, materielGlace);
    
    // Rotation pour mettre le plan à l'horizontale
    glace.rotation.x = -Math.PI / 2;
    glace.position.y = 0;
    
    // Activer les ombres
    glace.receiveShadow = true;
    
    this.scene.add(glace);
  }
  
  /**
   * Crée les bordures autour de la piste
   */
  creerBordures() {
    const hauteurBordure = 0.3;
    const epaisseurBordure = 0.2;
    
    const materielBordure = new THREE.MeshPhongMaterial({
      color: 0x8B4513, // Couleur bois
      shininess: 30
    });
    
    // ========================================
    // BORDURES LATÉRALES (gauche et droite)
    // ========================================
    const geometrieBordureLaterale = new THREE.BoxGeometry(
      epaisseurBordure,
      hauteurBordure,
      this.longueur
    );
    
    // Bordure gauche
    const bordureGauche = new THREE.Mesh(
      geometrieBordureLaterale,
      materielBordure
    );
    bordureGauche.position.set(
      this.largeur + epaisseurBordure / 2,
      hauteurBordure / 2,
      0
    );
    bordureGauche.castShadow = true;
    bordureGauche.receiveShadow = true;
    this.scene.add(bordureGauche);
    
    // Bordure droite
    const bordureDroite = new THREE.Mesh(
      geometrieBordureLaterale,
      materielBordure
    );
    bordureDroite.position.set(
      -this.largeur - epaisseurBordure / 2,
      hauteurBordure / 2,
      0
    );
    bordureDroite.castShadow = true;
    bordureDroite.receiveShadow = true;
    this.scene.add(bordureDroite);
    
    // ========================================
    // BORDURES D'EXTRÉMITÉ (avant et arrière)
    // ========================================
    const geometrieBordureExtremite = new THREE.BoxGeometry(
      this.largeur * 2 + epaisseurBordure * 2,
      hauteurBordure,
      epaisseurBordure
    );
    
    // Bordure avant
    const bordureAvant = new THREE.Mesh(
      geometrieBordureExtremite,
      materielBordure
    );
    bordureAvant.position.set(
      0,
      hauteurBordure / 2,
      this.longueur / 2 + epaisseurBordure / 2
    );
    bordureAvant.castShadow = true;
    bordureAvant.receiveShadow = true;
    this.scene.add(bordureAvant);
    
    // Bordure arrière
    const bordureArriere = new THREE.Mesh(
      geometrieBordureExtremite,
      materielBordure
    );
    bordureArriere.position.set(
      0,
      hauteurBordure / 2,
      -this.longueur / 2 - epaisseurBordure / 2
    );
    bordureArriere.castShadow = true;
    bordureArriere.receiveShadow = true;
    this.scene.add(bordureArriere);
  }
  
  /**
   * Crée la maison (house) avec cercles concentriques
   */
  creerMaison() {
    // ========================================
    // CERCLES CONCENTRIQUES DE LA MAISON
    // ========================================
    // Couleurs standard du curling: bleu, blanc, rouge, blanc (centre)
    const cercles = [
      { rayon: this.rayonMaison,        couleur: 0x0000ff }, // Bleu (extérieur)
      { rayon: this.rayonMaison * 0.75, couleur: 0xffffff }, // Blanc
      { rayon: this.rayonMaison * 0.50, couleur: 0xff0000 }, // Rouge
      { rayon: this.rayonMaison * 0.25, couleur: 0xffffff }  // Blanc (intérieur)
    ];
    
    for (let i = 0; i < cercles.length; i++) {
      const cercle = cercles[i];
      
      const geometrieCercle = new THREE.CircleGeometry(cercle.rayon, 64);
      const materielCercle = new THREE.MeshBasicMaterial({
        color: cercle.couleur,
        side: THREE.DoubleSide
      });
      
      const meshCercle = new THREE.Mesh(geometrieCercle, materielCercle);
      
      // Rotation pour mettre à l'horizontale
      meshCercle.rotation.x = -Math.PI / 2;
      
      // Position légèrement au-dessus de la glace (éviter z-fighting)
      meshCercle.position.set(
        this.centreMaison.x,
        0.01 + i * 0.001, // Chaque cercle un peu plus haut
        this.centreMaison.z
      );
      
      this.scene.add(meshCercle);
    }
    
    // ========================================
    // BOUTON CENTRAL (centre exact de la maison)
    // ========================================
    const geometrieBouton = new THREE.CircleGeometry(0.06, 32);
    const materielBouton = new THREE.MeshBasicMaterial({
      color: 0x000000,
      side: THREE.DoubleSide
    });
    
    const bouton = new THREE.Mesh(geometrieBouton, materielBouton);
    bouton.rotation.x = -Math.PI / 2;
    bouton.position.set(
      this.centreMaison.x,
      0.02,
      this.centreMaison.z
    );
    
    this.scene.add(bouton);
  }
  
  /**
   * Crée les lignes de jeu
   */
  creerLignes() {
    const materielLigne = new THREE.LineBasicMaterial({
      color: 0xff0000,
      linewidth: 2
    });
    
    // ========================================
    // HOG LINE (ligne de début)
    // ========================================
    // La pierre doit être lâchée avant cette ligne
    const positionHogLine = this.longueur / 2 - 10;
    
    const geometrieHogLine = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-this.largeur, 0.02, positionHogLine),
      new THREE.Vector3(this.largeur, 0.02, positionHogLine)
    ]);
    
    const hogLine = new THREE.Line(geometrieHogLine, materielLigne);
    this.scene.add(hogLine);
    
    // ========================================
    // LIGNE CENTRALE (verticale)
    // ========================================
    const geometrieLigneCentrale = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0.02, -this.longueur / 2),
      new THREE.Vector3(0, 0.02, this.longueur / 2)
    ]);
    
    const ligneCentrale = new THREE.Line(geometrieLigneCentrale, materielLigne);
    this.scene.add(ligneCentrale);
    
    // ========================================
    // TEE LINE (ligne passant par le centre de la maison)
    // ========================================
    const geometrieTeeLine = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-this.largeur, 0.02, this.centreMaison.z),
      new THREE.Vector3(this.largeur, 0.02, this.centreMaison.z)
    ]);
    
    const teeLine = new THREE.Line(geometrieTeeLine, materielLigne);
    this.scene.add(teeLine);
    
    // ========================================
    // BACK LINE (ligne de fond)
    // ========================================
    const positionBackLine = -this.longueur / 2 + 2;
    
    const geometrieBackLine = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-this.largeur, 0.02, positionBackLine),
      new THREE.Vector3(this.largeur, 0.02, positionBackLine)
    ]);
    
    const backLine = new THREE.Line(geometrieBackLine, materielLigne);
    this.scene.add(backLine);
  }
  
  /**
   * Obtient le centre de la maison
   * @returns {THREE.Vector3}
   */
  obtenirCentreMaison() {
    return this.centreMaison.clone();
  }
  
  /**
   * Obtient le rayon de la maison
   * @returns {number}
   */
  obtenirRayonMaison() {
    return this.rayonMaison;
  }
  
  /**
   * Obtient les limites de la piste
   * @returns {Object} - {minX, maxX, minZ, maxZ}
   */
  obtenirLimites() {
    return {
      minX: -this.largeur,
      maxX: this.largeur,
      minZ: -this.longueur / 2,
      maxZ: this.longueur / 2
    };
  }
}
