/**
 * ================================================
 * Classe GestionnaireLumiere
 * ================================================
 * 
 * Gère l'éclairage de la scène pour un rendu optimal.
 * Combine plusieurs types de lumières pour un effet réaliste.
 */

class GestionnaireLumiere {
  constructor(scene) {
    this.scene = scene;
    this.lumieres = [];
    
    this.creerLumieres();
  }
  
  /**
   * Crée toutes les lumières de la scène
   */
  creerLumieres() {
    // ========================================
    // LUMIÈRE AMBIANTE
    // ========================================
    // Éclairage général uniforme (pas d'ombres)
    const lumiereAmbiante = new THREE.AmbientLight(
      0xffffff, // Couleur blanche
      0.5       // Intensité modérée
    );
    this.scene.add(lumiereAmbiante);
    this.lumieres.push(lumiereAmbiante);
    
    // ========================================
    // LUMIÈRE DIRECTIONNELLE PRINCIPALE
    // ========================================
    // Simule le soleil ou un éclairage de salle
    const lumiereDirectionnelle = new THREE.DirectionalLight(
      0xffffff, // Couleur blanche
      0.7       // Intensité
    );
    
    // Position de la lumière
    lumiereDirectionnelle.position.set(10, 20, 10);
    
    // Configuration des ombres
    lumiereDirectionnelle.castShadow = true;
    lumiereDirectionnelle.shadow.mapSize.width = 2048;
    lumiereDirectionnelle.shadow.mapSize.height = 2048;
    
    // Zone de projection des ombres
    const d = 30;
    lumiereDirectionnelle.shadow.camera.left = -d;
    lumiereDirectionnelle.shadow.camera.right = d;
    lumiereDirectionnelle.shadow.camera.top = d;
    lumiereDirectionnelle.shadow.camera.bottom = -d;
    lumiereDirectionnelle.shadow.camera.near = 0.5;
    lumiereDirectionnelle.shadow.camera.far = 100;
    
    // Qualité des ombres
    lumiereDirectionnelle.shadow.bias = -0.0001;
    
    this.scene.add(lumiereDirectionnelle);
    this.lumieres.push(lumiereDirectionnelle);
    
    // ========================================
    // LUMIÈRE PONCTUELLE AU-DESSUS DE LA PISTE
    // ========================================
    // Éclairage supplémentaire pour mieux voir les pierres
    const lumierePonctuelle = new THREE.PointLight(
      0xffffff, // Couleur blanche
      0.3,      // Intensité faible
      50        // Distance d'influence
    );
    lumierePonctuelle.position.set(0, 15, 0);
    this.scene.add(lumierePonctuelle);
    this.lumieres.push(lumierePonctuelle);
    
    // ========================================
    // LUMIÈRE PONCTUELLE SUR LA MAISON
    // ========================================
    // Éclairage focalisé sur la zone de score
    const lumiereMaison = new THREE.PointLight(
      0xffffcc, // Légèrement jaunâtre
      0.4,      // Intensité modérée
      30        // Distance d'influence
    );
    lumiereMaison.position.set(0, 10, -16);
    this.scene.add(lumiereMaison);
    this.lumieres.push(lumiereMaison);
    
    // ========================================
    // LUMIÈRE HÉMISPHÉRIQUE (ciel/sol)
    // ========================================
    // Donne un éclairage naturel avec couleur du ciel et du sol
    const lumiereHemispherique = new THREE.HemisphereLight(
      0x87CEEB, // Couleur du ciel (bleu ciel)
      0x444444, // Couleur du sol (gris foncé)
      0.3       // Intensité faible
    );
    this.scene.add(lumiereHemispherique);
    this.lumieres.push(lumiereHemispherique);
  }
  
  /**
   * Active ou désactive toutes les lumières
   * @param {boolean} actif - true pour activer, false pour désactiver
   */
  activerLumieres(actif) {
    for (const lumiere of this.lumieres) {
      lumiere.visible = actif;
    }
  }
  
  /**
   * Modifie l'intensité globale de l'éclairage
   * @param {number} facteur - Multiplicateur d'intensité (1.0 = normal)
   */
  modifierIntensite(facteur) {
    for (const lumiere of this.lumieres) {
      if (lumiere.intensity !== undefined) {
        lumiere.intensity *= facteur;
      }
    }
  }
  
  /**
   * Ajoute un helper visuel pour déboguer les lumières
   * (utile pendant le développement)
   */
  ajouterHelpers() {
    for (const lumiere of this.lumieres) {
      if (lumiere instanceof THREE.DirectionalLight) {
        const helper = new THREE.DirectionalLightHelper(lumiere, 5);
        this.scene.add(helper);
      } else if (lumiere instanceof THREE.PointLight) {
        const helper = new THREE.PointLightHelper(lumiere, 1);
        this.scene.add(helper);
      }
    }
  }
}
