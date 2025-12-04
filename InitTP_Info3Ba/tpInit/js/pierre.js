// Création d'une pierre avec raccord G¹
function pierre(pos, team) {
    let h = 0.135;
    let r = (0.745 / Math.PI) / 2;

    // LATHE 1 : Base (Cubique)
    function lathe1() {
        let p0 = new THREE.Vector3(0, 0, 0);
        let p1 = new THREE.Vector3(r * 0.6, 0, 0);
        let p2 = new THREE.Vector3(r, h / 8, 0);
        let p3 = new THREE.Vector3(r, (3 * h) / 8, 0);
        
        let curve = new THREE.CubicBezierCurve3(p0, p1, p2, p3);
        
        const geometry = new THREE.LatheGeometry(curve.getPoints(25), 50);
        const material = new THREE.MeshPhongMaterial({ color: 0x82878f });
        const lathe = new THREE.Mesh(geometry, material);
        
        return lathe;
    }

    // LATHE 2 : Milieu (Quadratique) avec raccord G¹
    function lathe2() {
        let p0 = new THREE.Vector3(r, (3 * h) / 8, 0);
        let p1 = new THREE.Vector3(r, h / 2, 0);
        let p2 = new THREE.Vector3(r, (5 * h) / 8, 0);
        
        let curve = new THREE.QuadraticBezierCurve3(p0, p1, p2);
        
        const geometry = new THREE.LatheGeometry(curve.getPoints(25), 50);
        const material = new THREE.MeshPhongMaterial({ color: 0xcccccc });
        const lathe = new THREE.Mesh(geometry, material);
        
        return lathe;
    }

    // LATHE 3 : Haut (Cubique) avec raccord G¹
    function lathe3() {
        let p0 = new THREE.Vector3(r, (5 * h) / 8, 0);
        let p1 = new THREE.Vector3(r, (3 * h) / 4, 0);
        let p2 = new THREE.Vector3(r * 0.5, h, 0);
        let p3 = new THREE.Vector3(0, h, 0);
        
        let curve = new THREE.CubicBezierCurve3(p0, p1, p2, p3);
        
        const geometry = new THREE.LatheGeometry(curve.getPoints(25), 50);
        const material = new THREE.MeshPhongMaterial({ color: 0x82878f });
        const lathe = new THREE.Mesh(geometry, material);
        
        return lathe;
    }

    // Cylindre au-dessus
    function cylinder1(coul) {
        const geometry = new THREE.CylinderGeometry(0.085, 0.085, 0.03, 30);
        const material = new THREE.MeshPhongMaterial({ color: coul });
        const cylinder = new THREE.Mesh(geometry, material);
        cylinder.position.y = h + 0.015;
        return cylinder;
    }

    // Cylindre du manche
    function cylinder2(coul) {
        const geometry = new THREE.CylinderGeometry(0.0075, 0.0075, 0.1, 20);
        const material = new THREE.MeshPhongMaterial({ color: coul });
        const cylinder = new THREE.Mesh(geometry, material);
        cylinder.position.y = h + 0.03 + 0.05;
        cylinder.rotation.z = Math.PI / 2;
        return cylinder;
    }

    // Pavé du manche
    function box(coul) {
        const geometry = new THREE.BoxGeometry(0.015, 0.095, 0.015);
        const material = new THREE.MeshPhongMaterial({ color: coul });
        const box = new THREE.Mesh(geometry, material);
        box.position.x = 0.05;
        box.position.y = h + 0.03;
        return box;
    }

    // Couleur selon l'équipe
    const coul = team === 'red' ? 0xff0000 : 0x0000ff;

    // Groupe final
    const group = new THREE.Group();
    group.add(lathe1());
    group.add(lathe2());
    group.add(lathe3());
    group.add(cylinder1(coul));
    group.add(cylinder2(coul));
    group.add(box(coul));

    group.position.copy(pos);
    // Pas de rotation, les pierres sont déjà orientées correctement

    return group;
}

// Création de toutes les pierres
function creerpierres() {
    // 5 pierres rouges
    for (let i = 0; i < 5; i++) {
        let pos = new THREE.Vector3(-2 + i * 1, 0.2, 22);
        let p = pierre(pos, 'red');
        pierres.push(p);
        scene.add(p);
    }
    
    // 5 pierres bleues
    for (let i = 0; i < 5; i++) {
        let pos = new THREE.Vector3(-2 + i * 1, 0.2, 24);
        let p = pierre(pos, 'blue');
        pierres.push(p);
        scene.add(p);
    }
}
