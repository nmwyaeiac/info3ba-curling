/**
 * Classe Score - Gestion des scores
 * 
 * Règles du curling:
 * - Seule l'équipe avec la pierre la plus proche du centre marque
 * - Elle marque 1 point par pierre plus proche que la meilleure adverse
 * - Les pierres doivent être dans la maison pour compter
 */

class Score {
  constructor(piste) {
    this.centreMaison = piste.obtenirCentreMaison();
    this.rayonMaison = piste.obtenirRayonMaison();
    
    this.scoresRouge = [];
    this.scoresBleu = [];
    this.mancheActuelle = 1;
  }
  
  /**
   * Calcule le score d'une manche
   */
  calculer(pierres) {
    // Filtrer les pierres dans la maison
    const pierresDansLaMaison = this.filtrerDansLaMaison(pierres);
    
    if (pierresDansLaMaison.length === 0) {
      return { rouge: 0, bleu: 0, gagnant: null };
    }
    
    // Trier par distance au centre
    pierresDansLaMaison.sort((a, b) => a.distance - b.distance);
    
    // Déterminer l'équipe gagnante
    const equipePlusProche = pierresDansLaMaison[0].equipe;
    
    // Compter les points
    let score = 0;
    for (const p of pierresDansLaMaison) {
      if (p.equipe === equipePlusProche) {
        score++;
      } else {
        break;
      }
    }
    
    return {
      rouge: equipePlusProche === 'rouge' ? score : 0,
      bleu: equipePlusProche === 'bleu' ? score : 0,
      gagnant: equipePlusProche
    };
  }
  
  /**
   * Filtre les pierres dans la maison
   */
  filtrerDansLaMaison(pierres) {
    const result = [];
    
    for (const pierre of pierres) {
      if (!pierre || !pierre.obtenirGroupe().parent) continue;
      
      const distance = pierre.distanceAuCentre(this.centreMaison);
      
      if (distance <= this.rayonMaison) {
        result.push({
          pierre: pierre,
          equipe: pierre.equipe,
          distance: distance
        });
      }
    }
    
    return result;
  }
  
  /**
   * Enregistre le score
   */
  enregistrer(scoreRouge, scoreBleu) {
    this.scoresRouge.push(scoreRouge);
    this.scoresBleu.push(scoreBleu);
  }
  
  /**
   * Met à jour l'affichage HTML
   */
  mettreAJourAffichage(scoreRouge, scoreBleu, gagnant) {
    const tbody = document.getElementById('scores-body');
    
    const ligne = tbody.insertRow();
    ligne.className = 'nouvelle-ligne';
    
    // Manche
    const cellManche = ligne.insertCell(0);
    cellManche.textContent = this.mancheActuelle;
    
    // Score rouge
    const cellRouge = ligne.insertCell(1);
    cellRouge.textContent = scoreRouge;
    cellRouge.className = 'rouge';
    if (gagnant === 'rouge') cellRouge.classList.add('gagnant');
    
    // Score bleu
    const cellBleu = ligne.insertCell(2);
    cellBleu.textContent = scoreBleu;
    cellBleu.className = 'bleu';
    if (gagnant === 'bleu') cellBleu.classList.add('gagnant');
    
    this.mettreAJourTotaux();
    this.mancheActuelle++;
  }
  
  /**
   * Met à jour les totaux
   */
  mettreAJourTotaux() {
    const totalRouge = this.scoresRouge.reduce((a, b) => a + b, 0);
    const totalBleu = this.scoresBleu.reduce((a, b) => a + b, 0);
    
    document.getElementById('total-rouge').textContent = totalRouge;
    document.getElementById('total-bleu').textContent = totalBleu;
  }
  
  /**
   * Obtient le total d'une équipe
   */
  obtenirTotal(equipe) {
    if (equipe === 'rouge') {
      return this.scoresRouge.reduce((a, b) => a + b, 0);
    } else {
      return this.scoresBleu.reduce((a, b) => a + b, 0);
    }
  }
  
  /**
   * Obtient le meneur
   */
  obtenirMeneur() {
    const totalRouge = this.obtenirTotal('rouge');
    const totalBleu = this.obtenirTotal('bleu');
    
    if (totalRouge > totalBleu) return 'rouge';
    if (totalBleu > totalRouge) return 'bleu';
    return 'egalite';
  }
  
  /**
   * Réinitialise les scores
   */
  reinitialiser() {
    this.scoresRouge = [];
    this.scoresBleu = [];
    this.mancheActuelle = 1;
    
    document.getElementById('scores-body').innerHTML = '';
    document.getElementById('total-rouge').textContent = '0';
    document.getElementById('total-bleu').textContent = '0';
  }
  
  /**
   * Met à jour le numéro de manche
   */
  mettreAJourNumero() {
    document.getElementById('manche-numero').textContent = this.mancheActuelle;
  }
}
