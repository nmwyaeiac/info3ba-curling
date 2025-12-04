// Fonction d'initialisation principale
function init() {
    creerScene();
    creerCamera();
    creerRenderer();
    creerControls();
    creerLumiere();
    creerpiste();
    creermaison();
    creerpierres();
    creerbalais();
    creerGUI();
    creerTrajectoire();
    updateGameInfo();
    animate();
}

// Démarrage du jeu
init();
