import { ScoreManager } from './score.js';

export class GameManager {
  constructor(scene, stoneManager) {
    this.scene = scene;
    this.stoneManager = stoneManager;
    this.scoreManager = new ScoreManager();

    this.currentTeam = 'red'; // Équipe rouge commence
    this.shotsRemaining = 16; // 8 pierres par équipe
    this.gameState = 'aiming'; // aiming, shooting, scoring

    this.setupGame();
  }

  setupGame() {
    this.updateScoreDisplay();
  }

  throwStone(velocity, rotation) {
    if (this.gameState !== 'aiming') return;

    this.gameState = 'shooting';
    this.stoneManager.throwStone(this.currentTeam, velocity, rotation, () => {
      this.onStoneStopped();
    });
  }

  onStoneStopped() {
    this.gameState = 'scoring';
    this.calculateScore();
    this.nextTurn();
  }

  calculateScore() {
    const score = this.stoneManager.calculateScore();
    this.scoreManager.addScore(this.currentTeam, score);
    this.updateScoreDisplay();
  }

  nextTurn() {
    this.shotsRemaining--;

    // Changement d'équipe
    this.currentTeam = this.currentTeam === 'red' ? 'blue' : 'red';

    if (this.shotsRemaining > 0) {
      this.gameState = 'aiming';
      this.prepareNextShot();
    } else {
      this.endGame();
    }
  }

  prepareNextShot() {
    // Positionner la nouvelle pierre
    this.stoneManager.prepareNewStone(this.currentTeam);
  }

  endGame() {
    console.log('Jeu terminé!');
    const winner = this.scoreManager.getWinner();
    alert(`Jeu terminé! Vainqueur: ${winner}`);
  }

  updateScoreDisplay() {
    const scoreElement = document.getElementById('score-display');
    if (scoreElement) {
      scoreElement.innerHTML = this.scoreManager.getScoreHTML();
    }
  }

  resetGame() {
    this.scoreManager.reset();
    this.stoneManager.reset();
    this.currentTeam = 'red';
    this.shotsRemaining = 16;
    this.gameState = 'aiming';
    this.updateScoreDisplay();
    this.prepareNextShot();
  }
}
