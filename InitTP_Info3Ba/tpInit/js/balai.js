// Création d'un balai
function creerbalai() {
    let balaiGroup = new THREE.Group();
    
    // Manche (cylindre)
    let manche = new THREE.Mesh(
        new THREE.CylinderGeometry(0.02, 0.02, 1.5, 16),
        new THREE.MeshStandardMaterial({ color: 0x8B4513 })
    );
    manche.position.y = 0.75;
    balaiGroup.add(manche);
    
    // Tête (parallélépipède)
    let tete = new THREE.Mesh(
        new THREE.BoxGeometry(0.3, 0.05, 0.1),
        new THREE.MeshStandardMaterial({ color: 0x333333 })
    );
    balaiGroup.add(tete);
    
    // Poils (cônes)
    let rows = 5;
    let cols = 8;
    let spacing = 0.035;
    
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            let poil = new THREE.Mesh(
                new THREE.ConeGeometry(0.008, 0.2, 9),
                new THREE.MeshStandardMaterial({ color: 0x000000 })
            );
            
            let x = -0.14 + col * spacing;
            let z = -0.04 + row * 0.02;
            poil.position.set(x, -0.075, z);
            
            balaiGroup.add(poil);
        }
    }
    
    return balaiGroup;
}

// Création de tous les balais
function creerbalais() {
    // Premier balai
    let balai1 = creerbalai();
    balai1.position.set(0, 0.2, 0);
    balai1.visible = false;
    balais.push(balai1);
    scene.add(balai1);
    
    // Deuxième balai
    let balai2 = creerbalai();
    balai2.position.set(0, 0.2, 0);
    balai2.visible = false;
    balais.push(balai2);
    scene.add(balai2);
}
