// Define available instruments using Tone.js
const instruments = {
  Kick: new Tone.MembraneSynth().toDestination(),
  Snare: new Tone.NoiseSynth({ envelope: { sustain: 0.1 } }).toDestination(),
  HiHat: new Tone.MetalSynth({ resonance: 4000, volume: -10 }).toDestination(),
  Clap: new Tone.MembraneSynth({ pitchDecay: 0.05, volume: -5 }).toDestination(),
  Bass: new Tone.FMSynth({ modulationIndex: 12, volume: -8 }).toDestination(),
};

// State to track the added instruments and current step
const addedInstruments = [];
let currentStep = 0;

// Set up Tone.js transport properties
const bpm = 120;
Tone.Transport.bpm.value = bpm;
Tone.Transport.loop = true;
Tone.Transport.loopEnd = '1m';

// Function to add an instrument row
function addInstrument() {
  const instrumentName = document.getElementById('instrument').value;

  // Prevent duplicate instrument addition
  if (addedInstruments.includes(instrumentName)) {
    alert(`${instrumentName} is already added.`);
    return;
  }

  // Mark the instrument as added
  addedInstruments.push(instrumentName);

  // Create a new row for the instrument in the beat grid
  const beatGrid = document.getElementById('beatGrid');
  const row = document.createElement('div');
  row.classList.add('instrument-row');

  // Label for the instrument
  const label = document.createElement('label');
  label.innerText = instrumentName;
  row.appendChild(label);

  // Create 16 checkboxes for the beats
  for (let i = 0; i < 16; i++) {
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'beat';
    checkbox.dataset.instrument = instrumentName;
    checkbox.dataset.step = i;
    row.appendChild(checkbox);
  }

  // Append the row to the beat grid
  beatGrid.appendChild(row);
}

// Function to play the current step, activating any instruments whose checkboxes are checked
function playStep(time) {
  const step = currentStep % 16;

  document.querySelectorAll(".beat").forEach((checkbox) => {
    if (parseInt(checkbox.dataset.step) === step && checkbox.checked) {
      const instrument = instruments[checkbox.dataset.instrument];
      if (instrument.triggerAttackRelease) {
        instrument.triggerAttackRelease("C2", "8n", time);
      }
    }
  });

  currentStep++;
}

// Initialize playback controls
function initializeControls() {
  document.getElementById("playButton").onclick = () => Tone.Transport.start();
  document.getElementById("stopButton").onclick = () => Tone.Transport.stop();

  // Schedule the playStep function to trigger every sixteenth note
  Tone.Transport.scheduleRepeat((time) => playStep(time), "16n");
}

// Initialize controls on page load
initializeControls();