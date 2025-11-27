document.addEventListener('DOMContentLoaded', () => {
    const noteAleatoire = document.getElementById('note-aleatoire');
    const noteButtonsDiv = document.getElementById('note-buttons');
    const newNoteBtn = document.getElementById('new-note-btn');
    const statusMessage = document.getElementById('status-message');
    const scoreSpan = document.getElementById('score');
    const totalSpan = document.getElementById('total');

    // --- CONFIGURATION GÉOMÉTRIQUE ---
    // Correspond au CSS : 1 pas musical (ligne -> interligne) = 4% de la hauteur du conteneur.
    const PITCH_STEP_PERCENT = 4;
    const C4_POS_PERCENT = 50; // Le Do milieu est exactement au centre

    // --- MAPPING DES NOTES ---
    // 'steps' : distance en demi-pas (ligne/interligne) par rapport au Do Milieu (C4 = 0).
    // Positif = vers le haut (Sol), Négatif = vers le bas (Fa).
    const NOTES_MAP = [
        // --- Clé de Sol ---
        { name: 'G', steps: 11 }, // Sol aigu (au-dessus ligne 5)
        { name: 'F', steps: 10 }, // Fa (5e ligne)
        { name: 'E', steps: 9 },  // Mi (4e interligne)
        { name: 'D', steps: 8 },  // Ré (4e ligne)
        { name: 'C', steps: 7 },  // Do (3e interligne)
        { name: 'B', steps: 6 },  // Si (3e ligne)
        { name: 'A', steps: 5 },  // La (2e interligne)
        { name: 'G', steps: 4 },  // Sol (2e ligne)
        { name: 'F', steps: 3 },  // Fa (1er interligne)
        { name: 'E', steps: 2 },  // Mi (1ere ligne - Bas de la portée Sol)
        { name: 'D', steps: 1 },  // Ré (sous la portée Sol)

        // --- Do Milieu ---
        { name: 'C', steps: 0 },  // C4 (Ligne supplémentaire centrale)

        // --- Clé de Fa ---
        { name: 'B', steps: -1 }, // Si (au-dessus portée Fa)
        { name: 'A', steps: -2 }, // La (5e ligne - Haut de la portée Fa)
        { name: 'G', steps: -3 }, // Sol (4e interligne)
        { name: 'F', steps: -4 }, // Fa (4e ligne)
        { name: 'E', steps: -5 }, // Mi (3e interligne)
        { name: 'D', steps: -6 }, // Ré (3e ligne)
        { name: 'C', steps: -7 }, // Do (2e interligne)
        { name: 'B', steps: -8 }, // Si (2e ligne)
        { name: 'A', steps: -9 }, // La (1er interligne)
        { name: 'G', steps: -10 },// Sol (1ere ligne - Bas de la portée Fa)
        { name: 'F', steps: -11 },// Fa (sous la portée Fa)
        { name: 'E', steps: -12 } // Mi (Ligne supplémentaire basse)
    ];

    const BUTTON_NOTES = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
    let currentNote = null;
    let score = 0;
    let totalAttempts = 0;

    function createNoteButtons() {
        BUTTON_NOTES.forEach(note => {
            const button = document.createElement('button');
            button.textContent = note;
            button.className = `btn-${note}`;
            button.dataset.note = note;
            button.addEventListener('click', handleNoteGuess);
            noteButtonsDiv.appendChild(button);
        });
    }

    function updateScoreDisplay() {
        scoreSpan.textContent = score;
        totalSpan.textContent = totalAttempts;
    }

    function generateNewNote() {
        // Sélection aléatoire
        const randomIndex = Math.floor(Math.random() * NOTES_MAP.length);
        currentNote = NOTES_MAP[randomIndex];

        // CALCUL DE LA POSITION
        // Do milieu (50%) - (Nombre de pas * 4%)
        // Ex: Sol (step 4) = 50 - 16 = 34% (Plus haut)
        // Ex: Fa (step -4) = 50 - (-16) = 66% (Plus bas)
        const notePositionPercent = C4_POS_PERCENT - (currentNote.steps * PITCH_STEP_PERCENT);

        // Affichage
        noteAleatoire.style.display = 'block';
        noteAleatoire.style.top = `${notePositionPercent}%`;

        // Nettoyage visuel
        noteAleatoire.innerHTML = '';

        // Gestion des lignes supplémentaires (Ledger lines)
        // On ajoute une ligne si c'est le Do milieu (0)
        // Ou si on dépasse le La aigu (12) ou descend sous le Mi grave (-12)
        // Note: Le La (step -2) et le Mi (step 2) sont des lignes normales de portée, pas besoin de ligne sup.
        // Lignes supplémentaires nécessaires pour :
        // C4 (0), A5 (>11), E2 (<-11), etc.
        // Ici on simplifie : Do milieu, ou notes très hautes/basses paires qui ne sont pas dans la portée

        const absSteps = Math.abs(currentNote.steps);
        const isLineStep = (currentNote.steps % 2 === 0); // Les pas pairs tombent sur des lignes (0, 2, 4...)

        // Logique simplifiée pour l'affichage des barres
        // Do Milieu (0)
        if (currentNote.steps === 0) {
            addLedgerLine();
        }
        // Ligne sup basse (Mi grave à -12)
        else if (currentNote.steps <= -12 && isLineStep) {
            addLedgerLine();
        }
        // Ligne sup haute (La aigu à +12, ici on a juste Sol à +11 mais si on étendait...)
        else if (currentNote.steps >= 12 && isLineStep) {
            addLedgerLine();
        }

        statusMessage.textContent = "Quelle est cette note ?";
        statusMessage.className = '';
    }

    function addLedgerLine() {
        const ligne = document.createElement('div');
        ligne.classList.add('ligne-note');
        noteAleatoire.appendChild(ligne);
    }

    function handleNoteGuess(event) {
        if (!currentNote) return;

        const guessedNote = event.target.dataset.note;
        totalAttempts++;

        if (guessedNote === currentNote.name) {
            score++;
            statusMessage.innerHTML = `✅ <strong>Correct !</strong> C'est bien un ${currentNote.name}.`;
            statusMessage.className = 'correct';

            // Petit délai avant la prochaine note (optionnel, pour fluidité)
            setTimeout(generateNewNote, 1000);
        } else {
            statusMessage.innerHTML = `❌ <strong>Faux.</strong> Vous avez choisi ${guessedNote}.`;
            statusMessage.className = 'incorrect';
        }

        updateScoreDisplay();
    }

    // Init
    newNoteBtn.addEventListener('click', generateNewNote);
    createNoteButtons();
    updateScoreDisplay();
    // Lancer une première note au démarrage
    generateNewNote();
});