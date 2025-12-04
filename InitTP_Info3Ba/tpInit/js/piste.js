// Création de la piste
function creerpiste() {
    piste = new THREE.Group();
    
    // Surface de la piste - BLANC
    let pisteGeometry = new THREE.BoxGeometry(6, 0.1, 50);
    let pisteMaterial = new THREE.MeshStandardMaterial({ color: 0xFFFFFF });
    let pisteSurface = new THREE.Mesh(pisteGeometry, pisteMaterial);
    pisteSurface.position.y = 0.05;
    pisteSurface.receiveShadow = true;
    piste.add(pisteSurface);

    // Matériau des bordures - MARRON BOIS
    let bordureMat = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
    
    // Bordure gauche
    let bordure1 = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 50), bordureMat);
    bordure1.position.set(3, 0.1, 0);
    piste.add(bordure1);

    // Bordure droite
    let bordure2 = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 50), bordureMat);
    bordure2.position.set(-3, 0.1, 0);
    piste.add(bordure2);

    // Bordure avant
    let bordure3 = new THREE.Mesh(new THREE.BoxGeometry(6, 0.2, 0.2), bordureMat);
    bordure3.position.set(0, 0.1, 25);
    piste.add(bordure3);

    // Bordure arrière
    let bordure4 = new THREE.Mesh(new THREE.BoxGeometry(6, 0.2, 0.2), bordureMat);
    bordure4.position.set(0, 0.1, -25);
    piste.add(bordure4);

    // Matériau des lignes
    let ligneMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    
    // Ligne de la maison
    let ligne1 = new THREE.Mesh(new THREE.BoxGeometry(6, 0.01, 0.05), ligneMat);
    ligne1.position.set(0, 0.105, -20);
    piste.add(ligne1);

    // Ligne centrale
    let ligne2 = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.01, 50), ligneMat);
    ligne2.position.set(0, 0.105, 0);
    piste.add(ligne2);

    // Ligne arrière de la maison
    let ligne3 = new THREE.Mesh(new THREE.BoxGeometry(6, 0.01, 0.05), ligneMat);
    ligne3.position.set(0, 0.105, -22);
    piste.add(ligne3);
    
    // Ligne avant de la maison
    let ligne4 = new THREE.Mesh(new THREE.BoxGeometry(6, 0.01, 0.05), ligneMat);
    ligne4.position.set(0, 0.105, -16);
    piste.add(ligne4);

    scene.add(piste);
}
