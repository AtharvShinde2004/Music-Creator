// Instruments setup with Tone.js
const instruments = {
  Kick: new Tone.MembraneSynth().toDestination(),
  Snare: new Tone.NoiseSynth({ volume: -10 }).toDestination(),
  HiHat: new Tone.MetalSynth({ volume: -15 }).toDestination(),
  Clap: new Tone.MembraneSynth({ volume: -5 }).toDestination(),
  Bass: new Tone.FMSynth({ volume: -8 }).toDestination(),
};

// Tempo for the beat
const bpm = 120;
Tone.Transport.bpm.value = bpm;
Tone.Transport.loop = true;
Tone.Transport.loopEnd = '1m';

let currentStep = 0;

// Initialize beat grid and control panel
function initialize() {
  const controlsContainer = document.getElementById("controls");
  const beatGrid = document.getElementById("beatGrid");

  // Create instrument labels and buttons
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

  // Schedule a repeat event
  Tone.Transport.scheduleRepeat((time) => playStep(time), "16n");
}

// Play the current step and check each instrument's checkboxes
function playStep(time) {
  const step = currentStep % 16;
  document.querySelectorAll(".beat").forEach((checkbox) => {
    if (parseInt(checkbox.dataset.step) === step && checkbox.checked) {
      const instrument = instruments[checkbox.dataset.instrument];
      if (instrument.triggerAttack) {
        instrument.triggerAttackRelease("C2", "8n", time);
      }
    }
  });
  currentStep++;
}

// Initialize the interface on page load
initialize();