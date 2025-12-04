// Création de la maison (cible)
function creermaison() {
    maison = new THREE.Group();
    
    // Cercle extérieur bleu
    let c1 = new THREE.Mesh(
        new THREE.RingGeometry(1.22, 1.83, 64),
        new THREE.MeshBasicMaterial({ color: 0x0000ff })
    );
    
    // Cercle blanc
    let c2 = new THREE.Mesh(
        new THREE.RingGeometry(0.61, 1.22, 64),
        new THREE.MeshBasicMaterial({ color: 0xffffff })
    );
    
    // Cercle rouge
    let c3 = new THREE.Mesh(
        new THREE.RingGeometry(0.15, 0.61, 64),
        new THREE.MeshBasicMaterial({ color: 0xff0000 })
    );
    
    // Centre blanc
    let c4 = new THREE.Mesh(
        new THREE.CircleGeometry(0.15, 64),
        new THREE.MeshBasicMaterial({ color: 0xffffff })
    );
    
    maison.add(c1, c2, c3, c4);
    maison.rotation.x = -Math.PI / 2;
    maison.position.y = 0.11;
    maison.position.z = -20;
    
    scene.add(maison);
}
