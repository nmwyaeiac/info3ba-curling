// Création de la trajectoire
function creerTrajectoire() {
    // Empêcher le changement de trajectoire pendant l'animation
    if (isAnimation) {
        console.log("Impossible de changer la trajectoire pendant l'animation");
        return;
    }
    
    if (menuGUI.trajectoryType === 'straight') {
        creerTrajectoireRectiliigne();
        // Afficher le dossier rectiligne, cacher le Bézier
        if (pArriveeDossier) {
            pArriveeDossier.__ul.style.display = 'block';
            pArriveeDossier.open();
        }
        if (trajectoireBezierDossier) {
            trajectoireBezierDossier.__ul.style.display = 'none';
            trajectoireBezierDossier.close();
        }
    } else if (menuGUI.trajectoryType === 'curved') {
        creerTrajNonRectiligne();
        // Afficher le dossier Bézier, cacher le rectiligne
        if (pArriveeDossier) {
            pArriveeDossier.__ul.style.display = 'none';
            pArriveeDossier.close();
        }
        if (trajectoireBezierDossier) {
            trajectoireBezierDossier.__ul.style.display = 'block';
            trajectoireBezierDossier.open();
        }
    }
}

// Trajectoire rectiligne
function creerTrajectoireRectiliigne() {
    if (PcontrolMeshTab && PcontrolMeshTab.length > 0) {
        PcontrolMeshTab.forEach(mesh => mesh.visible = false);
    }
    PcontrolGUIs.forEach(folder => {
        folder.__ul.style.display = 'none';
        folder.close();
    });
    
    guideParrivee.visible = true;
    updateTrajRectiFromParams();
}

// Nouvelle fonction : Mise à jour de la trajectoire rectiligne depuis les paramètres
function updateTrajRectiFromParams() {
    // Empêcher la modification pendant l'animation
    if (isAnimation) return;
    
    let distance = menuGUI.trajectoireParams.distance;
    let angle = menuGUI.trajectoireParams.angle;
    
    // Conversion de l'angle en radians
    let angleRad = (angle * Math.PI) / 180;
    
    // Point de départ
    let startPoint = new THREE.Vector3(0, 0.11, 20);
    
    // Calcul du point d'arrivée avec distance et angle
    let endX = Math.sin(angleRad) * distance;
    let endZ = 20 - Math.cos(angleRad) * distance;
    
    guideParrivee.position.set(endX, 0.11, endZ);
    
    let endPoint = guideParrivee.position.clone();
    
    courbeCourante = new THREE.LineCurve3(startPoint, endPoint);
    visuTrajectoire();
}

// Ancienne fonction : Mise à jour de la trajectoire rectiligne (conservée pour compatibilité)
function updateTrajRecti() {
    // Empêcher la modification pendant l'animation
    if (isAnimation) return;
    
    let startPoint = new THREE.Vector3(0, 0.11, 20);
    let endPoint = guideParrivee.position.clone();
    
    courbeCourante = new THREE.LineCurve3(startPoint, endPoint);
    visuTrajectoire();
}

// Nouvelle fonction : Mise à jour de la trajectoire Bézier depuis les paramètres
function updateTrajBezierFromParams() {
    // Empêcher la modification pendant l'animation
    if (isAnimation) return;
    
    let longueur = menuGUI.trajectoireParams.longueur;
    
    let p0 = new THREE.Vector3(0, 0.11, 20);
    let p7 = new THREE.Vector3(0, 0.11, 20 - longueur);
    
    // Ajuster les points de contrôle en fonction de la longueur
    let ratio = longueur / 42; // 42 est la longueur de base
    
    let p1 = new THREE.Vector3(3, 0.11, 15);
    let p4 = new THREE.Vector3(3, 0.11, -5 * ratio);
    
    let p2 = new THREE.Vector3(
        (p1.x + p4.x) / 2,
        0.11,
        (p1.z + p4.z) / 2
    );
    
    let tangent1 = new THREE.Vector3().subVectors(p2, p1);
    let p3 = new THREE.Vector3().addVectors(p2, tangent1.clone().multiplyScalar(0.8));
    
    let p5 = new THREE.Vector3(
        (p4.x + p7.x) / 2,
        0.11,
        (p4.z + p7.z) / 2
    );
    
    let tangent2 = new THREE.Vector3().subVectors(p5, p4);
    let p6 = new THREE.Vector3().addVectors(p5, tangent2.clone().multiplyScalar(0.6));
    
    // Courbe quadratique de Bézier
    let courbe1 = new THREE.QuadraticBezierCurve3(p0, p1, p2);
    // Courbe cubique de Bézier
    let courbe2 = new THREE.CubicBezierCurve3(p2, p3, p4, p5);
    // Courbe quadratique de Bézier
    let courbe3 = new THREE.QuadraticBezierCurve3(p5, p6, p7);
    
    courbeCourante = new THREE.CurvePath();
    courbeCourante.add(courbe1);
    courbeCourante.add(courbe2);
    courbeCourante.add(courbe3);
    
    PconrolTab = [p1, p4, p7];
    
    if (PcontrolMeshTab.length > 0) {
        PcontrolMeshTab[0].position.copy(p1);
        PcontrolMeshTab[1].position.copy(p4);
        PcontrolMeshTab[2].position.copy(p7);
        PcontrolMeshTab.forEach(mesh => mesh.visible = true);
    }
    
    visuTrajectoire();
}

// Trajectoire courbe (Bézier)
function creerTrajNonRectiligne() {
    if (guideParrivee) {
        guideParrivee.visible = false;
    }
    
    let p0 = new THREE.Vector3(0, 0.11, 20);
    let p7 = new THREE.Vector3(0, 0.11, -22);
    
    let p1 = new THREE.Vector3(3, 0.11, 15);
    let p4 = new THREE.Vector3(3, 0.11, -5);
    
    let p2 = new THREE.Vector3(
        (p1.x + p4.x) / 2,
        0.11,
        (p1.z + p4.z) / 2
    );
    
    let tangent1 = new THREE.Vector3().subVectors(p2, p1);
    let p3 = new THREE.Vector3().addVectors(p2, tangent1.clone().multiplyScalar(0.8));
    
    let p5 = new THREE.Vector3(
        (p4.x + p7.x) / 2,
        0.11,
        (p4.z + p7.z) / 2
    );
    
    let tangent2 = new THREE.Vector3().subVectors(p5, p4);
    let p6 = new THREE.Vector3().addVectors(p5, tangent2.clone().multiplyScalar(0.6));
    
    // Courbe quadratique de Bézier
    let courbe1 = new THREE.QuadraticBezierCurve3(p0, p1, p2);
    // Courbe cubique de Bézier
    let courbe2 = new THREE.CubicBezierCurve3(p2, p3, p4, p5);
    // Courbe quadratique de Bézier
    let courbe3 = new THREE.QuadraticBezierCurve3(p5, p6, p7);
    
    courbeCourante = new THREE.CurvePath();
    courbeCourante.add(courbe1);
    courbeCourante.add(courbe2);
    courbeCourante.add(courbe3);
    
    PconrolTab = [p1, p4, p7];
    
    if (PcontrolMeshTab.length === 0) {
        GuiPointsDeControls(PconrolTab);
    } else {
        PcontrolMeshTab[0].position.copy(p1);
        PcontrolMeshTab[1].position.copy(p4);
        PcontrolMeshTab[2].position.copy(p7);
        PcontrolMeshTab.forEach(mesh => mesh.visible = true);
        
        PcontrolGUIs.forEach(folder => {
            folder.__ul.style.display = 'block';
            folder.open();
        });
    }
    
    visuTrajectoire();
}

// Visualisation de la trajectoire
function visuTrajectoire() {
    if (guideTraj) {
        scene.remove(guideTraj);
    }
    
    let points = courbeCourante.getPoints(100);
    let geometry = new THREE.BufferGeometry().setFromPoints(points);
    let material = new THREE.LineBasicMaterial({ color: 0xff8800 });
    guideTraj = new THREE.Line(geometry, material);
    scene.add(guideTraj);
}

// Création des points de contrôle GUI
function GuiPointsDeControls(points) {
    PcontrolGUIs.forEach(folder => folder.destroy());
    PcontrolGUIs = [];
    
    if (PcontrolMeshTab && PcontrolMeshTab.length > 0) {
        PcontrolMeshTab.forEach(p => scene.remove(p));
    }
    PcontrolMeshTab = [];
    
    if (!points || points.length === 0) return;
    
    // Point 0
    let geometry1 = new THREE.SphereGeometry(0.2, 16, 16);
    let material1 = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    let mesh1 = new THREE.Mesh(geometry1, material1);
    mesh1.position.copy(points[0]);
    scene.add(mesh1);
    PcontrolMeshTab.push(mesh1);

    const pointFolder1 = gui.addFolder('Point 0');
    PcontrolGUIs.push(pointFolder1);
    pointFolder1.add(mesh1.position, 'x', -6, 6, 0.1).name('X').onChange(() => updateTrajectoryFromControlPoints());
    pointFolder1.add(mesh1.position, 'z', 0, 20, 0.1).name('Z').onChange(() => updateTrajectoryFromControlPoints());
    pointFolder1.open();

    // Point 1
    let geometry2 = new THREE.SphereGeometry(0.2, 16, 16);
    let material2 = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    let mesh2 = new THREE.Mesh(geometry2, material2);
    mesh2.position.copy(points[1]);
    scene.add(mesh2);
    PcontrolMeshTab.push(mesh2);

    const pointFolder2 = gui.addFolder('Point 1');
    PcontrolGUIs.push(pointFolder2);
    pointFolder2.add(mesh2.position, 'x', -6, 6, 0.1).name('X').onChange(() => updateTrajectoryFromControlPoints());
    pointFolder2.add(mesh2.position, 'z', -20, 0, 0.1).name('Z').onChange(() => updateTrajectoryFromControlPoints());
    pointFolder2.open();

    // Point 2 (Arrivée)
    let geometry3 = new THREE.SphereGeometry(0.2, 16, 16);
    let material3 = new THREE.MeshBasicMaterial({ color: 0xff8800 });
    let mesh3 = new THREE.Mesh(geometry3, material3);
    mesh3.position.copy(points[2]);
    scene.add(mesh3);
    PcontrolMeshTab.push(mesh3);

    const pointFolder3 = gui.addFolder('Point 2 (Arrivée)');
    PcontrolGUIs.push(pointFolder3);
    pointFolder3.add(mesh3.position, 'x', -6, 6, 0.1).name('X').onChange(() => updateTrajectoryFromControlPoints());
    pointFolder3.add(mesh3.position, 'z', -25, -10, 0.1).name('Z').onChange(() => updateTrajectoryFromControlPoints());
    pointFolder3.open();
}

// Mise à jour de la trajectoire depuis les points de contrôle
function updateTrajectoryFromControlPoints() {
    // Empêcher la modification pendant l'animation
    if (isAnimation) return;
    if (PcontrolMeshTab.length < 3) return;
    
    let p1 = PcontrolMeshTab[0].position.clone();
    let p4 = PcontrolMeshTab[1].position.clone();
    let p7 = PcontrolMeshTab[2].position.clone();
    
    let p0 = new THREE.Vector3(0, 0.11, 20);
    
    let p2 = new THREE.Vector3(
        (p1.x + p4.x) / 2,
        0.11,
        (p1.z + p4.z) / 2
    );
    
    let tangent1 = new THREE.Vector3().subVectors(p2, p1);
    let p3 = new THREE.Vector3().addVectors(p2, tangent1.clone().multiplyScalar(0.8));
    
    let p5 = new THREE.Vector3(
        (p4.x + p7.x) / 2,
        0.11,
        (p4.z + p7.z) / 2
    );
    
    let tangent2 = new THREE.Vector3().subVectors(p5, p4);
    let p6 = new THREE.Vector3().addVectors(p5, tangent2.clone().multiplyScalar(0.6));
    
    let courbe1 = new THREE.QuadraticBezierCurve3(p0, p1, p2);
    let courbe2 = new THREE.CubicBezierCurve3(p2, p3, p4, p5);
    let courbe3 = new THREE.QuadraticBezierCurve3(p5, p6, p7);
    
    courbeCourante = new THREE.CurvePath();
    courbeCourante.add(courbe1);
    courbeCourante.add(courbe2);
    courbeCourante.add(courbe3);
    
    visuTrajectoire();
}
