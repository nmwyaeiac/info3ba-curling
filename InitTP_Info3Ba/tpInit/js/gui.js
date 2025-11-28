import { GUI } from './libs/lil-gui.min.js';

export function setupGUI(gameManager, cameraManager, stoneManager) {
  const gui = new GUI();

  const params = {
    équipe: 'red',
    puissance: 0.5,
    rotation: 0.0,
    trajectoire: 'rectiligne',
    lancer: () => throwStone(),
    nouvellePartie: () => gameManager.resetGame()
  };

  // Dossier pour les contrôles de jeu
  const gameFolder = gui.addFolder('Contrôles de Jeu');
  gameFolder.add(params, 'équipe', ['red', 'blue']).name('Équipe');
  gameFolder.add(params, 'puissance', 0, 1, 0.1).name('Puissance');
  gameFolder.add(params, 'rotation', -1, 1, 0.1).name('Rotation');
  gameFolder.add(params, 'trajectoire', ['rectiligne', 'courbe']).name('Trajectoire');
  gameFolder.add(params, 'lancer').name('Lancer la pierre');
  gameFolder.add(params, 'nouvellePartie').name('Nouvelle Partie');
  gameFolder.open();

  // Dossier pour les caméras
  const cameraFolder = gui.addFolder('Caméras');
  cameraFolder.add({ caméra: 'overview' }, 'caméra', {
    "Vue d'ensemble": 'overview',
    "Vue Piste": 'rink',
    "Vue Latérale": 'side'
  }).onChange((value) => {
    cameraManager.setActiveCamera(value);
  });
  cameraFolder.open();

  function throwStone() {
    const velocity = new THREE.Vector3(0, 0, -params.puissance * 0.5);
    velocity.applyAxisAngle(new THREE.Vector3(0, 1, 0), params.rotation);

    gameManager.throwStone(velocity, params.rotation);
  }

  return gui;
}
