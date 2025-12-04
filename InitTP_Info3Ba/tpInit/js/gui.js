// Création du GUI
function creerGUI() {
    gui = new dat.GUI();
    
    // Menu principal
    gui.add(menuGUI, 'trajectoryType', ['straight', 'curved'])
       .name('Type de trajectoire')
       .onChange(() => creerTrajectoire());
    
    gui.add(menuGUI, 'lancerPierre').name('Lancer la pierre');
    
    // Dossier Caméra avec menu déroulant
    let cameraFolder = gui.addFolder('Caméra');
    
    let cameraViews = {
        viewSelect: 'Vue piste',
        changeView: function() {
            switch(this.viewSelect) {
                case 'Vue piste':
                    camera.position.set(0, 10, 30);
                    camera.lookAt(0, 0, 0);
                    controls.target.set(0, 0, 0);
                    break;
                case 'Vue maison':
                    camera.position.set(0, 8, -25);
                    camera.lookAt(0, 0, -20);
                    controls.target.set(0, 0, -20);
                    break;
                case 'Vue lancer':
                    camera.position.set(0, 5, 30);
                    camera.lookAt(0, 0, 0);
                    controls.target.set(0, 0, 0);
                    break;
            }
        }
    };
    
    cameraFolder.add(cameraViews, 'viewSelect', ['Vue piste', 'Vue maison', 'Vue lancer'])
        .name('Point de vue')
        .onChange(() => cameraViews.changeView());
    
    cameraFolder.open();

    // Dossier Point d'Arrivée (pour trajectoire rectiligne)
    pArriveeDossier = gui.addFolder('Trajectoire Rectiligne');
    
    let geometry = new THREE.SphereGeometry(0.2, 16, 16);
    let material = new THREE.MeshBasicMaterial({ color: 0xff8800 });
    guideParrivee = new THREE.Mesh(geometry, material);
    guideParrivee.position.set(0, 0.11, -20);
    scene.add(guideParrivee);
    
    pArriveeDossier.add(menuGUI.trajectoireParams, 'distance', 10, 45, 0.5)
        .name('Distance')
        .onChange(() => updateTrajRectiFromParams());
    
    pArriveeDossier.add(menuGUI.trajectoireParams, 'angle', -45, 45, 1)
        .name('Angle (degrés)')
        .onChange(() => updateTrajRectiFromParams());
    
    pArriveeDossier.open();
    
    // Dossier pour trajectoire Bézier
    trajectoireBezierDossier = gui.addFolder('Trajectoire Bézier');
    
    trajectoireBezierDossier.add(menuGUI.trajectoireParams, 'longueur', 30, 50, 0.5)
        .name('Longueur')
        .onChange(() => updateTrajBezierFromParams());
    
    trajectoireBezierDossier.__ul.style.display = 'none';
    trajectoireBezierDossier.close();
}
