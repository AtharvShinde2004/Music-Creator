// Define the instruments using Tone.js
const instruments = {
  Kick: new Tone.MembraneSynth().toDestination(),
  Snare: new Tone.NoiseSynth({ envelope: { sustain: 0.1 } }).toDestination(),
  HiHat: new Tone.MetalSynth({ resonance: 4000, volume: -10 }).toDestination(),
  Clap: new Tone.MembraneSynth({ pitchDecay: 0.05, volume: -5 }).toDestination(),
  Bass: new Tone.FMSynth({ modulationIndex: 12, volume: -8 }).toDestination(),
};

// Set up the transport properties
const bpm = 120;
Tone.Transport.bpm.value = bpm;
Tone.Transport.loop = true;
Tone.Transport.loopEnd = '1m';

let currentStep = 0;

// Function to initialize the beat grid and controls
function initialize() {
  const controlsContainer = document.getElementById("controls");
  const beatGrid = document.getElementById("beatGrid");

  // Generate controls and beat grid for each instrument
  Object.keys(instruments).forEach((instrument) => {
    const label = document.createElement("label");
    label.innerText = instrument;
    controlsContainer.appendChild(label);

    for (let i = 0; i < 16; i++) {
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.className = "beat";
      checkbox.dataset.instrument = instrument;
      checkbox.dataset.step = i;
      beatGrid.appendChild(checkbox);
    }
  });

  // Play and Stop buttons
  const playButton = document.createElement("button");
  playButton.innerText = "Play";
  playButton.onclick = () => Tone.Transport.start();
  controlsContainer.appendChild(playButton);

  const stopButton = document.createElement("button");
  stopButton.innerText = "Stop";
  stopButton.onclick = () => Tone.Transport.stop();
  controlsContainer.appendChild(stopButton);

  // Schedule the playStep function to trigger every sixteenth note
  Tone.Transport.scheduleRepeat((time) => playStep(time), "16n");
}

// Play the current step, activating any instruments whose checkboxes are checked
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

// Initialize the beat maker interface on page load
initialize();