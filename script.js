const pttButton = document.getElementById('ptt-btn');
const statusDisplay = document.getElementById('status');
const freqInput = document.getElementById('frequency');
const myIdDisplay = document.getElementById('my-id');
const peerIdInput = document.getElementById('peer-id-input');
const connectBtn = document.getElementById('connect-btn');
const led = document.getElementById('led');
const screenWrapper = document.querySelector('.screen-wrapper');

let isGendarmerieVerified = false;
let isPoliceVerified = false;
let audioCtx = null; 
let isTalking = false; // Permet de savoir si on est déjà en train de parler avec le clavier

// Initialisation audio prioritaire pour supprimer la latence
function initFastAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
}
window.addEventListener('click', initFastAudio);
window.addEventListener('touchstart', initFastAudio);

// Système d'ID unique par joueur
function mettreAJourID() {
    if (isGendarmerieVerified) {
        myIdDisplay.textContent = `ID unique : 1280`; 
    } else if (isPoliceVerified) {
        myIdDisplay.textContent = `ID unique : POLICE`; 
    } else {
        const idCivil = "VRL-" + Math.floor(1000 + Math.random() * 9000);
        myIdDisplay.textContent = `ID unique : ${idCivil}`;
    }
}

// Configuration des Fréquences Sécurisées
const FREQ_GENDARMERIE = "74.8"; 
const CODE_GENDARMERIE = "1234"; 
const FREQ_POLICE = "55.1"; 
const CODE_POLICE = "5507"; 

mettreAJourID();
statusDisplay.textContent = "En attente...";

// Générateur de Bip Radio (Roger Beep)
function playRogerBeep() {
    try {
        initFastAudio(); 
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.type = 'sine'; 
        oscillator.frequency.setValueAtTime(1350, audioCtx.currentTime); 
        
        gainNode.gain.setValueAtTime(0.12, audioCtx.currentTime); 
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.15);
    } catch (e) {
        console.log("Audio en attente.");
    }
}

// Fonctions d'activation et désactivation de la parole
function startTransmission() {
    if (isTalking) return; // Évite les répétitions si la touche reste enfoncée
    isTalking = true;
    statusDisplay.textContent = `🎙️ ÉMISSION...`;
    statusDisplay.className = "status-talking";
    led.className = "led-talking"; 
}

function stopTransmission() {
    if (!isTalking) return;
    isTalking = false;
    statusDisplay.textContent = "En attente...";
    statusDisplay.className = "status-idle";
    led.className = "led-idle"; 
    playRogerBeep(); 
}

// ==========================================
//    NOUVEAU : CONTRÔLE PAR LA TOUCHE "T"
// ==========================================
window.addEventListener('keydown', (event) => {
    // Si l'utilisateur est en train de taper dans la case de l'ID, on ne déclenche pas le talkie
    if (document.activeElement === peerIdInput || document.activeElement === freqInput) return;

    // Si on appuie sur la touche T (mauscule ou minuscule)
    if (event.key === 't' || event.key === 'T') {
        initFastAudio();
        startTransmission();
    }
});

window.addEventListener('keyup', (event) => {
    if (event.key === 't' || event.key === 'T') {
        stopTransmission();
    }
});

// Conservation des contrôles à la souris (au cas où)
pttButton.addEventListener('mousedown', startTransmission);
pttButton.addEventListener('mouseup', stopTransmission);

// Support Tactile Mobile
pttButton.addEventListener('touchstart', (e) => { e.preventDefault(); startTransmission(); });
pttButton.addEventListener('touchend', stopTransmission);

// Surveillance et verrouillage des canaux
freqInput.addEventListener('change', () => {
    let checkFreq = parseFloat(freqInput.value).toFixed(1);
    screenWrapper.style.filter = "none";
    isGendarmerieVerified = false;
    isPoliceVerified = false;

    if (checkFreq === FREQ_GENDARMERIE) {
        let mdp = prompt("🔐 Fréquence Gendarmerie sécurisée. Entrez le code d'accès :");
        if (mdp === CODE_GENDARMERIE) {
            isGendarmerieVerified = true;
            statusDisplay.textContent = "🔒 Fréquence GEND Validée";
            mettreAJourID(); 
        } else {
            alert("Code incorrect !");
            freqInput.value = "446.1";
            statusDisplay.textContent = "En attente...";
            mettreAJourID();
        }
    } 
    else if (checkFreq === FREQ_POLICE) {
        let mdp = prompt("🚨 Fréquence POLICE sécurisée. Entrez le code d'accès :");
        if (mdp === CODE_POLICE) {
            isPoliceVerified = true;
            statusDisplay.textContent = "🚨 Canal POLICE Actif";
            screenWrapper.style.filter = "hue-rotate(140deg) saturate(1.5)"; 
            mettreAJourID();
        } else {
            alert("Code incorrect !");
            freqInput.value = "446.1";
            statusDisplay.textContent = "En attente...";
            mettreAJourID();
        }
    } 
    else {
        statusDisplay.textContent = "En attente...";
        mettreAJourID();
    }
});

connectBtn.addEventListener('click', () => {
    const idAmi = peerIdInput.value.trim();
    if (!idAmi) return alert("Veuillez entrer un ID.");
    statusDisplay.textContent = `Connecté à (${idAmi})`;
});
