// Calcul de la distance entre deux positions
function calculDistance(pos1, pos2) {
    return Math.sqrt(
        Math.pow(pos2.x - pos1.x, 2) + 
        Math.pow(pos2.z - pos1.z, 2)
    );
}

// Tri du tableau des pierres jouées
function trie_tab() {
    pierre_jouer.sort((a, b) => a.position.z - b.position.z);
}

// Vérification de toutes les collisions
function verifcollisionall(pierre) {
    verifcollisionpierre(pierre);
    verifcollisionborder(pierre);
}

// Vérification des collisions entre pierres
function verifcollisionpierre(pierre) {
    if (pierre_jouer.length > 0) {
        trie_tab();
        
        for (let i = 0; i < pierre_jouer.length; i++) {
            if (pierre_jouer[i] !== pierre && 
                calculDistance(pierre.position, pierre_jouer[i].position) <= (2 * r_)) {
                
                if (pierre === pierreCourante) {
                    collision_courante = true;
                }
                
                let pierre_temp = pierre_jouer[i];
                let dist_rebond = 0.5 + 0.25 * Math.random();
                rebond(pierre, pierre_temp, dist_rebond);
            }
        }
    }
}

// Gestion du rebond entre deux pierres
function rebond(pierre1, pierre2, multiply) {
    let x = pierre2.position.x - pierre1.position.x;
    let z = pierre2.position.z - pierre1.position.z;
    
    pierre2.position.x += x * multiply;
    pierre2.position.z += z * multiply;
    
    verifcollisionall(pierre2);
    
    if (multiply >= 0.1 && pierre2 !== null) {
        setTimeout(function() {
            rebond(pierre1, pierre2, multiply / 2);
        }, 16);
    } else {
        verifcollisionall(pierre1);
    }
}

// Vérification des collisions avec les bordures
function verifcollisionborder(pierre) {
    if (pierre.position.x > 2.8 || pierre.position.x < -2.8 || 
        pierre.position.z > 24.8 || pierre.position.z < -24.8) {
        
        if (pierre === pierreCourante) {
            if (balais.length > 0) {
                balais.forEach(balai => balai.visible = false);
            }
            // Arrêter l'animation
            isAnimation = false;
        }
        
        scene.remove(pierre);
        let index = pierre_jouer.indexOf(pierre);
        if (index > -1) {
            pierre_jouer.splice(index, 1);
        }
        
        // Ne calculer le score qu'une seule fois après la sortie de la pierre courante
        if (pierre === pierreCourante && !scoreCalculated) {
            calcul_score();
            switchTeam();
            scoreCalculated = true;
        }
    }
}
