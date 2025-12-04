// Lancer une pierre
function lancerpierre() {
    if (isAnimation) return;
    if (lancerCpt >= maxLancer) return;
    if (!courbeCourante) return;
    
    let pierreIndex;
    if (lancerCpt % 2 === 0) {
        pierreIndex = Math.floor(lancerCpt / 2);
        equipeCourante = 'red';
    } else {
        pierreIndex = Math.floor(lancerCpt / 2) + 5;
        equipeCourante = 'blue';
    }
    
    pierreCourante = pierres[pierreIndex];
    
    let startPoint = courbeCourante.getPoint(0);
    pierreCourante.position.copy(startPoint);
    
    pierre_jouer.push(pierreCourante);
    
    isAnimation = true;
    animationProgress = 0;
    scoreCalculated = false;
    collision_courante = false;
    
    lancerCpt++;
    updateGameInfo();
}

// Animation de la pierre
function animatepierre() {
    if (!isAnimation || !pierreCourante) {
        if (balais.length > 0) {
            balais.forEach(balai => balai.visible = false);
        }
        return;
    }
    
    animationProgress += Vanimation;
    
    if (animationProgress >= 1 || collision_courante) {
        animationProgress = 1;
        isAnimation = false;
        
        if (balais.length > 0) {
            balais.forEach(balai => balai.visible = false);
        }
        
        if (!collision_courante) {
            let position = courbeCourante.getPoint(1);
            pierreCourante.position.copy(position);
        }
        
        verifcollisionall(pierreCourante);
        
        if (!scoreCalculated) {
            calcul_score();
            switchTeam();
            scoreCalculated = true;
        }
        
        return;
    }
    
    let position = courbeCourante.getPoint(animationProgress);
    pierreCourante.position.copy(position);
    
    camera.position.set(
        pierreCourante.position.x,
        pierreCourante.position.y + 5,
        pierreCourante.position.z + 8
    );
    camera.lookAt(pierreCourante.position);
    controls.target.copy(pierreCourante.position);
    
    if (balais.length >= 2) {
        let tangent = courbeCourante.getTangent(animationProgress);
        
        let swingSpeed = 25;
        let swingAmount = 0.8;
        let balaiDistance = 1.2;
        
        // Premier balai (à gauche)
        balais[0].visible = true;
        let offsetX1 = Math.sin(animationProgress * swingSpeed) * swingAmount;
        balais[0].position.set(
            pierreCourante.position.x + tangent.x * balaiDistance + offsetX1 - 0.5,
            0.2,
            pierreCourante.position.z + tangent.z * balaiDistance
        );
        let angle = Math.atan2(tangent.x, tangent.z);
        balais[0].rotation.y = angle;
        balais[0].rotation.z = Math.sin(animationProgress * swingSpeed) * 0.5;
        
        // Deuxième balai (à droite, déphasé)
        balais[1].visible = true;
        let offsetX2 = Math.sin(animationProgress * swingSpeed + Math.PI) * swingAmount;
        balais[1].position.set(
            pierreCourante.position.x + tangent.x * balaiDistance + offsetX2 + 0.5,
            0.2,
            pierreCourante.position.z + tangent.z * balaiDistance
        );
        balais[1].rotation.y = angle;
        balais[1].rotation.z = Math.sin(animationProgress * swingSpeed + Math.PI) * 0.5;
    }
    
    verifcollisionall(pierreCourante);
}

// Boucle d'animation principale
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    animatepierre();
    renderer.render(scene, camera);
}
