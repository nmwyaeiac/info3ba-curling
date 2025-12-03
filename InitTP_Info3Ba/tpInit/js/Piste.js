/**
 * Classe Piste - Création de la piste et de la maison
 */

class Piste {
  constructor(scene) {
    this.scene = scene;
    
    // Dimensions
    this.longueur = 46;
    this.largeur = 5;
    this.rayonMaison = 1.83;
    
    // Centre de la maison
    this.centreMaison = new THREE.Vector3(0, 0, -18);
    
    this.creer();
  }
  
  creer() {
    this.creerGlace();
    this.creerBordures();
    this.creerMaison();
    this.creerLignes();
  }
  
  /**
   * Crée la surface de glace
   */
  creerGlace() {
    const geoGlace = new THREE.PlaneGeometry(this.largeur * 2, this.longueur);
    const matGlace = new THREE.MeshStandardMaterial({
      color: 0xcce7f0,
      metalness: 0.2,
      roughness: 0.1
    });
    
    const glace = new THREE.Mesh(geoGlace, matGlace);
    glace.rotation.x = -Math.PI / 2;
    glace.position.y = 0;
    glace.receiveShadow = true;
    
    this.scene.add(glace);
  }
  
  /**
   * Crée les bordures
   */
  creerBordures() {
    const hauteur = 0.25;
    const epaisseur = 0.18;
    
    const matBordure = new THREE.MeshStandardMaterial({
      color: 0x654321,
      roughness: 0.8
    });
    
    // Bordures latérales
    const geoBordureLat = new THREE.BoxGeometry(epaisseur, hauteur, this.longueur);
    
    const bordureGauche = new THREE.Mesh(geoBordureLat, matBordure);
    bordureGauche.position.set(this.largeur + epaisseur / 2, hauteur / 2, 0);
    bordureGauche.castShadow = true;
    bordureGauche.receiveShadow = true;
    this.scene.add(bordureGauche);
    
    const bordureDroite = new THREE.Mesh(geoBordureLat, matBordure);
    bordureDroite.position.set(-this.largeur - epaisseur / 2, hauteur / 2, 0);
    bordureDroite.castShadow = true;
    bordureDroite.receiveShadow = true;
    this.scene.add(bordureDroite);
    
    // Bordures d'extrémité
    const geoBordureExt = new THREE.BoxGeometry(
      this.largeur * 2 + epaisseur * 2,
      hauteur,
      epaisseur
    );
    
    const bordureAvant = new THREE.Mesh(geoBordureExt, matBordure);
    bordureAvant.position.set(0, hauteur / 2, this.longueur / 2 + epaisseur / 2);
    bordureAvant.castShadow = true;
    bordureAvant.receiveShadow = true;
    this.scene.add(bordureAvant);
    
    const bordureArriere = new THREE.Mesh(geoBordureExt, matBordure);
    bordureArriere.position.set(0, hauteur / 2, -this.longueur / 2 - epaisseur / 2);
    bordureArriere.castShadow = true;
    bordureArriere.receiveShadow = true;
    this.scene.add(bordureArriere);
  }
  
  /**
   * Crée la maison avec cercles concentriques
   */
  creerMaison() {
    const cercles = [
      { rayon: this.rayonMaison, couleur: 0x0066cc },
      { rayon: this.rayonMaison * 0.73, couleur: 0xffffff },
      { rayon: this.rayonMaison * 0.47, couleur: 0xcc0000 },
      { rayon: this.rayonMaison * 0.2, couleur: 0xffffff }
    ];
    
    for (let i = 0; i < cercles.length; i++) {
      const cercle = cercles[i];
      const geoCercle = new THREE.CircleGeometry(cercle.rayon, 64);
      const matCercle = new THREE.MeshBasicMaterial({
        color: cercle.couleur,
        side: THREE.DoubleSide
      });
      
      const meshCercle = new THREE.Mesh(geoCercle, matCercle);
      meshCercle.rotation.x = -Math.PI / 2;
      meshCercle.position.set(
        this.centreMaison.x,
        0.01 + i * 0.001,
        this.centreMaison.z
      );
      
      this.scene.add(meshCercle);
    }
    
    // Bouton central
    const geoBouton = new THREE.CircleGeometry(0.055, 32);
    const matBouton = new THREE.MeshBasicMaterial({
      color: 0x000000,
      side: THREE.DoubleSide
    });
    
    const bouton = new THREE.Mesh(geoBouton, matBouton);
    bouton.rotation.x = -Math.PI / 2;
    bouton.position.set(this.centreMaison.x, 0.015, this.centreMaison.z);
    
    this.scene.add(bouton);
  }
  
  /**
   * Crée les lignes de jeu
   */
  creerLignes() {
    const matLigne = new THREE.LineBasicMaterial({
      color: 0xff0000,
      linewidth: 2
    });
    
    // Hog line
    const posHogLine = this.longueur / 2 - 9;
    const geoHogLine = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-this.largeur, 0.015, posHogLine),
      new THREE.Vector3(this.largeur, 0.015, posHogLine)
    ]);
    this.scene.add(new THREE.Line(geoHogLine, matLigne));
    
    // Ligne centrale
    const geoLigneCentrale = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0.015, -this.longueur / 2),
      new THREE.Vector3(0, 0.015, this.longueur / 2)
    ]);
    this.scene.add(new THREE.Line(geoLigneCentrale, matLigne));
    
    // Tee line
    const geoTeeLine = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-this.largeur, 0.015, this.centreMaison.z),
      new THREE.Vector3(this.largeur, 0.015, this.centreMaison.z)
    ]);
    this.scene.add(new THREE.Line(geoTeeLine, matLigne));
    
    // Back line
    const posBackLine = -this.longueur / 2 + 2;
    const geoBackLine = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-this.largeur, 0.015, posBackLine),
      new THREE.Vector3(this.largeur, 0.015, posBackLine)
    ]);
    this.scene.add(new THREE.Line(geoBackLine, matLigne));
  }
  
  obtenirCentreMaison() {
    return this.centreMaison.clone();
  }
  
  obtenirRayonMaison() {
    return this.rayonMaison;
  }
  
  obtenirLimites() {
    return {
      minX: -this.largeur,
      maxX: this.largeur,
      minZ: -this.longueur / 2,
      maxZ: this.longueur / 2
    };
  }
}
