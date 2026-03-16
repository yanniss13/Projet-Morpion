let largeur = 7;
let hauteur = 6;
let nbPourGagner = 4;
let grille = Array(hauteur * largeur).fill('');
let joueurActuel = 'X';
let partieTerminee = false;
let mode = 'jvj';
let enAttente = false;

const inputLargeur = document.getElementById("largeur");
const inputHauteur = document.getElementById("hauteur");
const btnTaille = document.getElementById("btnTaille");

btnTaille.addEventListener("click", () => {
  changerTaille(inputLargeur.value, inputHauteur.value);
});



function verifierGagnant() {
    const N = nbPourGagner;
    const directions = [
        [0, 1],   // ligne
        [1, 0],   // colonne
        [1, 1],   // diagonale \
        [1, -1]   // diagonale /
    ];

    for (let i = 0; i < hauteur; i++) {
        for (let j = 0; j < largeur; j++) {
            const premier = grille[i * largeur + j];
            if (!premier) continue;

            for (const [di, dj] of directions) {
                const cases = [];

                for (let k = 0; k < N; k++) {
                    const li = i + k * di;
                    const col = j + k * dj;
                    if (li < 0 || li >= hauteur || col < 0 || col >= largeur) break;
                    if (grille[li * largeur + col] !== premier) break;
                    cases.push(li * largeur + col);
                }

                if (cases.length === N) {
                    return { gagnant: premier, casesGagnantes: cases };
                }
            }
        }
    }
    return null;
}


function changerTaille(nouvelleLargeur, nouveauHauteur) {
    largeur = parseInt(nouvelleLargeur);
    hauteur = parseInt(nouveauHauteur);
    reinitialiser();
}


function changerMode(nouveauMode) {
    mode = nouveauMode;
    document.getElementById('btn-jvj').classList.toggle('active', nouveauMode === 'jvj');
    document.getElementById('btn-jvo').classList.toggle('active', nouveauMode === 'jvo');
    reinitialiser();
}


function afficherGrille(casesGagnantes = []) {
    const magrille = document.getElementById('grille');
    magrille.innerHTML = '';
    magrille.style.gridTemplateColumns = 'repeat(' + largeur + ', 1fr)';
    magrille.style.gridTemplateRows = 'repeat(' + hauteur + ', 1fr)';

    grille.forEach(function(valeur, index) {
        const macase = document.createElement('div');
        const col = index % largeur;

        if (valeur) {
            macase.className = 'case ' + valeur + ' occupee';
        } else {
            macase.className = 'case';
        }

        if (casesGagnantes.includes(index)) {
            macase.classList.add('gagnante');
        }

        macase.textContent = valeur;
        macase.onclick = function() { jouerColonne(col); };
        magrille.appendChild(macase);
    });
}



function grilleComplete() {
    return grille.every(function(caseVal) {
        return caseVal !== '';
    });
}


function jouerColonne(col) {
    if (partieTerminee || enAttente) return;

    // On cherche la case la plus basse libre dans la colonne
    let indexCible = -1;
    for (let ligne = hauteur - 1; ligne >= 0; ligne--) {
        const index = ligne * largeur + col;
        if (grille[index] === '') {
            indexCible = index;
            break;
        }
    }

    // La colonne est pleine
    if (indexCible === -1) return;

    grille[indexCible] = joueurActuel;
    const resultat = verifierGagnant();

    if (resultat) {
        afficherGrille(resultat.casesGagnantes);
        let nomGagnant;
        if (resultat.gagnant === 'X') {
            nomGagnant = 'Joueur 1 (X)';
        } else if (mode === 'jvo') {
            nomGagnant = 'Ordinateur (O)';
        } else {
            nomGagnant = 'Joueur 2 (O)';
        }
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


function tourOrdinateur() {
    enAttente = false;

    // Colonnes qui ont encore au moins une case libre
    const colonnesLibres = [];
    for (let col = 0; col < largeur; col++) {
        if (grille[col] === '') { 
            colonnesLibres.push(col);
        }
    }

    if (colonnesLibres.length === 0) return;

    const col = colonnesLibres[Math.floor(Math.random() * colonnesLibres.length)];
    jouerColonne(col);

    const resultat = verifierGagnant();

    if (resultat) {
        afficherGrille(resultat.casesGagnantes);
        afficherMessage('Ordinateur a gagné !');
        terminerPartie();
        return;
    }

    if (grilleComplete()) {
        afficherGrille();
        afficherMessage('Match nul !');
        terminerPartie();
        return;
    }

    joueurActuel = 'X';
    afficherGrille();
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