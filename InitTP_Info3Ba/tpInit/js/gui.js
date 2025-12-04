// Création du GUI
function creerGUI() {
    gui = new dat.GUI();
    
    // Menu principal
    gui.add(menuGUI, 'trajectoryType', ['straight', 'curved'])
       .name('Type de trajectoire')
       .onChange(() => creerTrajectoire());
    
    gui.add(menuGUI, 'lancerPierre').name('Lancer la pierre');
    
    // Dossier Caméra
    let cameraFolder = gui.addFolder('Caméra');
    
    cameraFolder.add({
        vuePiste: function() {
            camera.position.set(0, 10, 30);
            camera.lookAt(0, 0, 0);
            controls.target.set(0, 0, 0);
        }
    }, 'vuePiste').name('Vue piste');

    cameraFolder.add({
        vueMaison: function() {
            camera.position.set(0, 8, -25);
            camera.lookAt(0, 0, -20);
            controls.target.set(0, 0, -20);
        }
    }, 'vueMaison').name('Vue maison');
    
    cameraFolder.add({
        vueLancer: function() {
            camera.position.set(0, 5, 30);
            camera.lookAt(0, 0, 0);
            controls.target.set(0, 0, 0);
        }
    }, 'vueLancer').name('Vue lancer');
    
    cameraFolder.open();

    // Dossier Point d'Arrivée
    pArriveeDossier = gui.addFolder('Point Arrivée');
    
    let geometry = new THREE.SphereGeometry(0.2, 16, 16);
    let material = new THREE.MeshBasicMaterial({ color: 0xff8800 });
    guideParrivee = new THREE.Mesh(geometry, material);
    guideParrivee.position.set(0, 0.5, -20);
    scene.add(guideParrivee);
    
    pArriveeDossier.add(guideParrivee.position, 'x', -3, 3, 0.1)
        .name('X')
        .onChange(() => updateTrajRecti());
    
    pArriveeDossier.add(guideParrivee.position, 'z', -25, -15, 0.1)
        .name('Z')
        .onChange(() => updateTrajRecti());
    
    pArriveeDossier.open();
}
