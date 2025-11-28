/**
 * ================================================
 * Classe GestionnaireScore
 * ================================================
 * 
 * Gère le calcul et l'affichage des scores selon les règles du curling.
 * 
 * Règles du curling pour le score:
 * - Seule l'équipe avec la pierre la plus proche du centre marque
 * - Cette équipe marque 1 point par pierre plus proche que la meilleure
 *   pierre adverse
 * - Les pierres doivent être dans la maison pour compter
 */

class GestionnaireScore {
  constructor(piste) {
    this.piste = piste;
    this.centreMaison = piste.obtenirCentreMaison();
    this.rayonMaison = piste.obtenirRayonMaison();
    
    // Historique des scores par manche
    this.scoresRouge = [];
    this.scoresBleu = [];
    
    // Numéro de la manche actuelle
    this.mancheActuelle = 1;
  }
  
  /**
   * Calcule le score pour la manche actuelle
   * @param {Array<Pierre>} pierres - Toutes les pierres sur la piste
   * @returns {Object} - {rouge: score, bleu: score, gagnant: 'rouge'|'bleu'|null}
   */
  calculerScore(pierres) {
    // ========================================
    // ÉTAPE 1: FILTRER LES PIERRES DANS LA MAISON
    // ========================================
    const pierresDansLaMaison = this.filtrerPierresDansLaMaison(pierres);
    
    if (pierresDansLaMaison.length === 0) {
      // Aucune pierre dans la maison = pas de score
      return { rouge: 0, bleu: 0, gagnant: null };
    }
    
    // ========================================
    // ÉTAPE 2: TRIER PAR DISTANCE AU CENTRE
    // ========================================
    pierresDansLaMaison.sort((a, b) => a.distance - b.distance);
    
    // ========================================
    // ÉTAPE 3: DÉTERMINER L'ÉQUIPE GAGNANTE
    // ========================================
    const equipePlusProche = pierresDansLaMaison[0].equipe;
    
    // ========================================
    // ÉTAPE 4: COMPTER LES POINTS
    // ========================================
    // Compter combien de pierres de l'équipe gagnante sont plus proches
    // que la meilleure pierre adverse
    let score = 0;
    
    for (const pierreDonnees of pierresDansLaMaison) {
      if (pierreDonnees.equipe === equipePlusProche) {
        score++;
      } else {
        // Dès qu'on rencontre une pierre adverse, on arrête
        break;
      }
    }
    
    // ========================================
    // ÉTAPE 5: RETOURNER LE RÉSULTAT
    // ========================================
    const resultat = {
      rouge: equipePlusProche === 'rouge' ? score : 0,
      bleu: equipePlusProche === 'bleu' ? score : 0,
      gagnant: equipePlusProche
    };
    
    return resultat;
  }
  
  /**
   * Filtre les pierres qui sont dans la maison et calcule leur distance
   * @param {Array<Pierre>} pierres - Toutes les pierres
   * @returns {Array} - [{pierre, equipe, distance}, ...]
   */
  filtrerPierresDansLaMaison(pierres) {
    const pierresDansLaMaison = [];
    
    for (const pierre of pierres) {
      if (!pierre || !pierre.obtenirGroupe().parent) {
        // Pierre n'existe pas ou a été retirée de la scène
        continue;
      }
      
      const distance = pierre.distanceAuCentre(this.centreMaison);
      
      if (distance <= this.rayonMaison) {
        pierresDansLaMaison.push({
          pierre: pierre,
          equipe: pierre.equipe,
          distance: distance
        });
      }
    }
    
    return pierresDansLaMaison;
  }
  
  /**
   * Enregistre le score d'une manche
   * @param {number} scoreRouge - Score de l'équipe rouge
   * @param {number} scoreBleu - Score de l'équipe bleue
   */
  enregistrerScore(scoreRouge, scoreBleu) {
    this.scoresRouge.push(scoreRouge);
    this.scoresBleu.push(scoreBleu);
  }
  
  /**
   * Met à jour l'affichage HTML du tableau des scores
   * @param {number} scoreRouge - Score de la manche actuelle
   * @param {number} scoreBleu - Score de la manche actuelle
   * @param {string} gagnant - 'rouge', 'bleu' ou null
   */
  mettreAJourAffichage(scoreRouge, scoreBleu, gagnant) {
    const tbody = document.getElementById('corps-table-scores');
    
    // Créer une nouvelle ligne
    const ligne = tbody.insertRow();
    ligne.className = 'nouvelle-ligne-score'; // Pour animation CSS
    
    // Colonne manche
    const celluleManche = ligne.insertCell(0);
    celluleManche.textContent = this.mancheActuelle;
    
    // Colonne score rouge
    const celluleRouge = ligne.insertCell(1);
    celluleRouge.textContent = scoreRouge;
    if (gagnant === 'rouge') {
      celluleRouge.className = 'equipe-rouge meneur-manche';
    }
    
    // Colonne score bleu
    const celluleBleu = ligne.insertCell(2);
    celluleBleu.textContent = scoreBleu;
    if (gagnant === 'bleu') {
      celluleBleu.className = 'equipe-bleue meneur-manche';
    }
    
    // Colonne meneur
    const celluleMeneur = ligne.insertCell(3);
    if (gagnant === 'rouge') {
      celluleMeneur.textContent = 'Rouge';
      celluleMeneur.className = 'equipe-rouge';
    } else if (gagnant === 'bleu') {
      celluleMeneur.textContent = 'Bleu';
      celluleMeneur.className = 'equipe-bleue';
    } else {
      celluleMeneur.textContent = '-';
    }
    
    // Mettre à jour les totaux
    this.mettreAJourTotaux();
    
    // Incrémenter le numéro de manche
    this.mancheActuelle++;
  }
  
  /**
   * Met à jour les totaux dans le pied de tableau
   */
  mettreAJourTotaux() {
    const totalRouge = this.scoresRouge.reduce((a, b) => a + b, 0);
    const totalBleu = this.scoresBleu.reduce((a, b) => a + b, 0);
    
    document.getElementById('total-rouge').textContent = totalRouge;
    document.getElementById('total-bleu').textContent = totalBleu;
    
    const celluleMeneurTotal = document.getElementById('meneur-total');
    if (totalRouge > totalBleu) {
      celluleMeneurTotal.textContent = 'Rouge';
      celluleMeneurTotal.className = 'equipe-rouge';
    } else if (totalBleu > totalRouge) {
      celluleMeneurTotal.textContent = 'Bleu';
      celluleMeneurTotal.className = 'equipe-bleue';
    } else {
      celluleMeneurTotal.textContent = 'Égalité';
      celluleMeneurTotal.className = '';
    }
  }
  
  /**
   * Obtient le score total d'une équipe
   * @param {string} equipe - 'rouge' ou 'bleu'
   * @returns {number}
   */
  obtenirTotal(equipe) {
    if (equipe === 'rouge') {
      return this.scoresRouge.reduce((a, b) => a + b, 0);
    } else {
      return this.scoresBleu.reduce((a, b) => a + b, 0);
    }
  }
  
  /**
   * Obtient l'équipe en tête
   * @returns {string} - 'rouge', 'bleu' ou 'egalite'
   */
  obtenirMeneur() {
    const totalRouge = this.obtenirTotal('rouge');
    const totalBleu = this.obtenirTotal('bleu');
    
    if (totalRouge > totalBleu) return 'rouge';
    if (totalBleu > totalRouge) return 'bleu';
    return 'egalite';
  }
  
  /**
   * Réinitialise tous les scores
   */
  reinitialiser() {
    this.scoresRouge = [];
    this.scoresBleu = [];
    this.mancheActuelle = 1;
    
    // Vider le tableau HTML
    const tbody = document.getElementById('corps-table-scores');
    tbody.innerHTML = '';
    
    // Réinitialiser les totaux
    document.getElementById('total-rouge').textContent = '0';
    document.getElementById('total-bleu').textContent = '0';
    document.getElementById('meneur-total').textContent = '';
  }
  
  /**
   * Met à jour le numéro de manche affiché
   */
  mettreAJourNumeroManche() {
    document.getElementById('numero-manche').textContent = this.mancheActuelle;
  }
}
