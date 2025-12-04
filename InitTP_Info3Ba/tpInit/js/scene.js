// Création de la scène
function creerScene() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
}

// Création de la caméra
function creerCamera() {
    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.set(0, 8, -25);
    camera.lookAt(0, 0, -20);
}

// Création du renderer
function creerRenderer() {
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    document.getElementById('webgl').appendChild(renderer.domElement);
}

// Création des contrôles
function creerControls() {
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(0, 0, -20);
}

// Création de la lumière
function creerLumiere() {
    let lumiereAmbiante = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(lumiereAmbiante);
    
    let lumiereDirectionnelle = new THREE.DirectionalLight(0xffffff, 0.8);
    lumiereDirectionnelle.position.set(10, 20, 10);
    lumiereDirectionnelle.castShadow = true;
    scene.add(lumiereDirectionnelle);
}

// Redimensionnement de la fenêtre
window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
