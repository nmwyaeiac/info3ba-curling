// Variables globales de la scène
let scene, camera, renderer, controls, gui;

// Objets de la scène
let piste, maison;
let pierres = [];
let balais = [];
let pierre_jouer = [];

// Gestion du jeu
let equipeCourante = 'red';
let lancerCpt = 0;
let maxLancer = 10;
let isAnimation = false;
let scoreCalculated = false;
let collision_courante = false;

// Scores totaux
let totalScoreRed = 0;
let totalScoreBlue = 0;

// Trajectoire
let courbeCourante = null;
let guideTraj = null;
let PcontrolTab = [];
let PcontrolMeshTab = [];
let guideParrivee = null;
let pArriveeDossier = null;
let PcontrolGUIs = [];

// Animation
let animationProgress = 0;
let Vanimation = 0.002;
let pierreCourante = null;
let balai_courant = null;

// Constantes
const r_ = 0.12; // Rayon de la pierre

// Menu GUI
let menuGUI = {
    trajectoryType: 'straight',
    lancerPierre: function() { lancerpierre(); }
};
