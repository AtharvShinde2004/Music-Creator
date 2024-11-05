// script.js

const instruments = [
  { name: "Kick", sound: "kick.wav" },
  { name: "Snare", sound: "snare.wav" },
  { name: "Hi-Hat", sound: "hihat.wav" },
  { name: "Clap", sound: "clap.wav" },
  { name: "Bass", sound: "bass.wav" }
];

const controlsContainer = document.getElementById("controls");
const beatGrid = document.getElementById("beatGrid");

// Function to initialize instrument controls and grid
function initialize() {
  instruments.forEach((instrument) => {
    const label = document.createElement("label");
    label.innerText = instrument.name;

    const checkboxGrid = document.createElement("div");
    checkboxGrid.classList.add("checkbox-grid");

    for (let i = 0; i < 16; i++) {
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.dataset.instrument = instrument.name;
      checkbox.dataset.index = i;
      checkboxGrid.appendChild(checkbox);
    }

    controlsContainer.appendChild(label);
    beatGrid.appendChild(checkboxGrid);
  });

  // Add playback control buttons
  const playButton = document.createElement("button");
  playButton.innerText = "Play";
  playButton.onclick = playBeat;
  controlsContainer.appendChild(playButton);

  const stopButton = document.createElement("button");
  stopButton.innerText = "Stop";
  stopButton.onclick = stopBeat;
  controlsContainer.appendChild(stopButton);
}

// Function to play the beat based on grid state
function playBeat() {
  const beatInterval = setInterval(() => {
    for (let i = 0; i < 16; i++) {
      instruments.forEach((instrument) => {
        const checkboxes = document.querySelectorAll(`input[data-instrument="${instrument.name}"][data-index="${i}"]`);
        checkboxes.forEach((checkbox) => {
          if (checkbox.checked) {
            playSound(instrument.sound);
          }
        });
      });
    }
  }, 250); // Set tempo by adjusting interval time (e.g., 250ms for 240 BPM)
}

// Function to play sound for each instrument
function playSound(soundFile) {
  const audio = new Audio(`sounds/${soundFile}`);
  audio.play();
}

function stopBeat() {
  clearInterval(beatInterval);
}

// Initialize the site on load
initialize();