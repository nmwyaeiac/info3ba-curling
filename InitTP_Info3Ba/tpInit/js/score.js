// Calcul du score
function calcul_score() {
    let centerPosition = new THREE.Vector3(0, 0.11, -20);
    let houseRadius = 1.83;
    
    let redScores = [];
    let blueScores = [];
    
    for (let i = 0; i < pierre_jouer.length; i++) {
        let pierre = pierre_jouer[i];
        let distance = calculDistance(pierre.position, centerPosition);
        
        if (distance <= houseRadius) {
            let pierreIndex = pierres.indexOf(pierre);
            if (pierreIndex < 5) {
                redScores.push(distance);
            } else {
                blueScores.push(distance);
            }
        }
    }
    
    if (redScores.length === 0 && blueScores.length === 0) {
        updateScoreDisplay(lancerCpt, 0, 'aucune');
        return;
    }
    
    let minRed = redScores.length > 0 ? Math.min(...redScores) : Infinity;
    let minBlue = blueScores.length > 0 ? Math.min(...blueScores) : Infinity;
    
    let score = 0;
    let scoringTeam;
    
    if (minRed < minBlue) {
        scoringTeam = 'red';
        for (let i = 0; i < redScores.length; i++) {
            if (redScores[i] < minBlue) {
                score++;
            }
        }
        totalScoreRed += score;
    } else {
        scoringTeam = 'blue';
        for (let i = 0; i < blueScores.length; i++) {
            if (blueScores[i] < minRed) {
                score++;
            }
        }
        totalScoreBlue += score;
    }
    
    updateScoreDisplay(lancerCpt, score, scoringTeam);
    updateWinnerDisplay();
}

// Mise à jour de l'affichage du score
function updateScoreDisplay(lancerNumber, score, team) {
    let scoreBody = document.getElementById('score-body');
    if (!scoreBody) return;
    
    let row = document.createElement('tr');
    
    let teamColor;
    let teamName;
    
    if (team === 'red') {
        teamColor = '#ff4444';
        teamName = 'Rouge';
    } else if (team === 'blue') {
        teamColor = '#4444ff';
        teamName = 'Bleue';
    } else {
        teamColor = '#888888';
        teamName = 'Aucune';
    }
    
    row.innerHTML = `
        <td style="padding: 8px; text-align: center; color: #fff;">${lancerNumber}</td>
        <td style="padding: 8px; text-align: center; color: ${teamColor}; font-weight: bold;">${score}</td>
        <td style="padding: 8px; text-align: center; color: ${teamColor};">${teamName}</td>
    `;
    
    scoreBody.appendChild(row);
}

// Mise à jour de l'affichage du gagnant
function updateWinnerDisplay() {
    let winnerDisplay = document.getElementById('winner-display');
    
    if (lancerCpt >= maxLancer) {
        winnerDisplay.style.display = 'block';
        if (totalScoreRed > totalScoreBlue) {
            winnerDisplay.innerHTML = `<span style="color: #ff4444">ROUGE GAGNE!</span><br>Score: Rouge ${totalScoreRed} - Bleu ${totalScoreBlue}`;
        } else if (totalScoreBlue > totalScoreRed) {
            winnerDisplay.innerHTML = ` <span style="color: #4444ff">BLEU GAGNE!</span><br>Score: Rouge ${totalScoreRed} - Bleu ${totalScoreBlue}`;
        } else {
            winnerDisplay.innerHTML = ` ÉGALITÉ!<br>Score: Rouge ${totalScoreRed} - Bleu ${totalScoreBlue}`;
        }
    } else {
        if (totalScoreRed === 0 && totalScoreBlue === 0) {
            winnerDisplay.style.display = 'none';
        } else {
            winnerDisplay.style.display = 'block';
            if (totalScoreRed > totalScoreBlue) {
                winnerDisplay.innerHTML = `En tête: <span style="color: #ff4444">ROUGE</span><br>Score: Rouge ${totalScoreRed} - Bleu ${totalScoreBlue}`;
            } else if (totalScoreBlue > totalScoreRed) {
                winnerDisplay.innerHTML = `En tête: <span style="color: #4444ff">BLEU</span><br>Score: Rouge ${totalScoreRed} - Bleu ${totalScoreBlue}`;
            } else {
                winnerDisplay.innerHTML = `<span style="color: #ffd700">ÉGALITÉ</span><br>Score: Rouge ${totalScoreRed} - Bleu ${totalScoreBlue}`;
            }
        }
    }
}

// Mise à jour des informations de jeu
function updateGameInfo() {
    let teamInfo = document.getElementById('team-info');
    teamInfo.textContent = `Équipe actuelle: ${equipeCourante === 'red' ? 'Rouge' : 'Bleue'}`;
    
    let launchesInfo = document.getElementById('launches-info');
    let launchesLeft = maxLancer - lancerCpt;
    launchesInfo.textContent = `Lancers restants: ${launchesLeft}`;
}

// Changement d'équipe
function switchTeam() {
    equipeCourante = equipeCourante === 'red' ? 'blue' : 'red';
    updateGameInfo();
}
