let largeur = 7;
let hauteur = 6;
let nbPourGagner = 4;
let grille = Array(hauteur * largeur).fill('');
let joueurActuel = 'X';
let partieTerminee = false;
let mode = 'jvj';       // 'jvj' ou 'jvo'
let typeJeu = 'puissance4'; // 'puissance4' ou 'morpion'
let enAttente = false;

const inputLargeur = document.getElementById("largeur");
const inputHauteur = document.getElementById("hauteur");
const btnTaille = document.getElementById("btnTaille");

btnTaille.addEventListener("click", () => {
  changerTaille(inputLargeur.value, inputHauteur.value);
});

// ───────────────────────────────────────────
// CHANGEMENT DE TYPE DE JEU (puissance4 / morpion)
// ───────────────────────────────────────────
function changerTypeJeu(nouveauType) {
    typeJeu = nouveauType;
    document.getElementById('btn-puissance4').classList.toggle('active', nouveauType === 'puissance4');
    document.getElementById('btn-morpion').classList.toggle('active', nouveauType === 'morpion');

    if (nouveauType === 'puissance4') {
        largeur = 7;
        hauteur = 6;
        nbPourGagner = 4;
    } else {
        // Morpion : grille 3x3 par défaut, 3 à aligner
        largeur = 3;
        hauteur = 3;
        nbPourGagner = 3;
    }

    // Synchronise les inputs
    if (inputLargeur) inputLargeur.value = largeur;
    if (inputHauteur)  inputHauteur.value  = hauteur;

    reinitialiser();
}

// ───────────────────────────────────────────
// CHANGEMENT DE MODE (jvj / jvo)
// ───────────────────────────────────────────
function changerMode(nouveauMode) {
    mode = nouveauMode;
    document.getElementById('btn-jvj').classList.toggle('active', nouveauMode === 'jvj');
    document.getElementById('btn-jvo').classList.toggle('active', nouveauMode === 'jvo');
    reinitialiser();
}

function changerTaille(nouvelleLargeur, nouveauHauteur) {
    largeur = parseInt(nouvelleLargeur);
    hauteur = parseInt(nouveauHauteur);
    reinitialiser();
}

// ───────────────────────────────────────────
// VÉRIFICATION DU GAGNANT
// ───────────────────────────────────────────
function verifierGagnant() {
    const N = nbPourGagner;
    const directions = [[0,1],[1,0],[1,1],[1,-1]];

    for (let i = 0; i < hauteur; i++) {
        for (let j = 0; j < largeur; j++) {
            const premier = grille[i * largeur + j];
            if (!premier) continue;

            for (const [di, dj] of directions) {
                const cases = [];
                for (let k = 0; k < N; k++) {
                    const li  = i + k * di;
                    const col = j + k * dj;
                    if (li < 0 || li >= hauteur || col < 0 || col >= largeur) break;
                    if (grille[li * largeur + col] !== premier) break;
                    cases.push(li * largeur + col);
                }
                if (cases.length === N) return { gagnant: premier, casesGagnantes: cases };
            }
        }
    }
    return null;
}

// ───────────────────────────────────────────
// AFFICHAGE DE LA GRILLE
// ───────────────────────────────────────────
function afficherGrille(casesGagnantes = []) {
    const magrille = document.getElementById('grille');
    magrille.innerHTML = '';
    magrille.style.gridTemplateColumns = `repeat(${largeur}, 1fr)`;
    magrille.style.gridTemplateRows    = `repeat(${hauteur}, 1fr)`;

    grille.forEach(function(valeur, index) {
        const macase = document.createElement('div');
        const col = index % largeur;

        macase.className = valeur ? `case ${valeur} occupee` : 'case';
        if (casesGagnantes.includes(index)) macase.classList.add('gagnante');
        macase.textContent = valeur;

        // ► Puissance 4 : clic sur toute la colonne → gravité
        // ► Morpion     : clic direct sur la case → pas de gravité
        if (typeJeu === 'puissance4') {
            macase.onclick = () => jouerColonne(col);
        } else {
            macase.onclick = () => jouerCase(index);
        }

        magrille.appendChild(macase);
    });
}

// ───────────────────────────────────────────
// ACTIONS DE JEU
// ───────────────────────────────────────────

/** Puissance 4 : la pièce tombe en bas de la colonne */
function jouerColonne(col) {
    if (partieTerminee || enAttente) return;

    let indexCible = -1;
    for (let ligne = hauteur - 1; ligne >= 0; ligne--) {
        const index = ligne * largeur + col;
        if (grille[index] === '') { indexCible = index; break; }
    }
    if (indexCible === -1) return; // colonne pleine

    jouerIndex(indexCible);
}

/** Morpion : placement direct sur la case cliquée */
function jouerCase(index) {
    if (partieTerminee || enAttente) return;
    if (grille[index] !== '') return; // case déjà occupée

    jouerIndex(index);
}

/** Logique commune : place la pièce, vérifie victoire/nul, passe le tour */
function jouerIndex(index) {
    grille[index] = joueurActuel;
    const resultat = verifierGagnant();

    if (resultat) {
        afficherGrille(resultat.casesGagnantes);
        const nomGagnant = resultat.gagnant === 'X'
            ? 'Joueur 1 (X)'
            : (mode === 'jvo' ? 'Ordinateur (O)' : 'Joueur 2 (O)');
        afficherMessage(nomGagnant + ' a gagné !');
        terminerPartie();
        return;
    }

    if (grilleComplete()) {
        afficherGrille();
        afficherMessage('Match nul !');
        terminerPartie();
        return;
    }

    joueurActuel = joueurActuel === 'X' ? 'O' : 'X';
    afficherGrille();

    if (mode === 'jvo' && joueurActuel === 'O' && !partieTerminee) {
        enAttente = true;
        setTimeout(tourOrdinateur, 400);
    }
}

// ───────────────────────────────────────────
// ORDINATEUR (aléatoire)
// ───────────────────────────────────────────
function tourOrdinateur() {
    enAttente = false;

    if (typeJeu === 'puissance4') {
        // Colonnes ayant encore au moins une case libre (vérifie le sommet)
        const colonnesLibres = [];
        for (let col = 0; col < largeur; col++) {
            if (grille[col] === '') colonnesLibres.push(col);
        }
        if (colonnesLibres.length === 0) return;
        jouerColonne(colonnesLibres[Math.floor(Math.random() * colonnesLibres.length)]);

    } else {
        // Morpion : cases libres directement
        const casesLibres = grille
            .map((v, i) => v === '' ? i : null)
            .filter(i => i !== null);
        if (casesLibres.length === 0) return;
        jouerCase(casesLibres[Math.floor(Math.random() * casesLibres.length)]);
    }
}

// ───────────────────────────────────────────
// UTILITAIRES
// ───────────────────────────────────────────
function grilleComplete() {
    return grille.every(c => c !== '');
}

function afficherMessage(texte) {
    document.getElementById('message').textContent = texte;
    document.getElementById('btn-rejouer').style.display = 'inline-block';
}

function terminerPartie() {
    partieTerminee = true;
}

function reinitialiser() {
    grille = Array(largeur * hauteur).fill('');
    joueurActuel = 'X';
    partieTerminee = false;
    enAttente = false;
    document.getElementById('message').textContent = '';
    document.getElementById('btn-rejouer').style.display = 'none';
    afficherGrille();
}

afficherGrille();