// script.js
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const tempoInput = document.getElementById("tempo");
const instrumentSelect = document.getElementById("instrument");
const beatGrid = document.getElementById("beatGrid");

// Create beat grid (16 beats, 4 rows for each instrument)
for (let i = 0; i < 64; i++) {
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  beatGrid.appendChild(checkbox);
}

function playSound(frequency, time, duration) {
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();
  osc.connect(gain);
  gain.connect(audioContext.destination);

  osc.frequency.value = frequency;
  osc.type = "sine";
  gain.gain.setValueAtTime(0.5, time);
  gain.gain.exponentialRampToValueAtTime(0.01, time + duration);

  osc.start(time);
  osc.stop(time + duration);
}

const instrumentFrequencies = {
  kick: 150,
  snare: 300,
  hiHat: 600,
  synth: 800
};

async function playBeat() {
  const tempo = parseInt(tempoInput.value);
  const beatDuration = 60 / tempo / 4;
  const checkboxes = Array.from(beatGrid.children);

  for (let beat = 0; beat < 16; beat++) {
    checkboxes.forEach((checkbox, index) => {
      const row = Math.floor(index / 16);
      if (index % 16 === beat && checkbox.checked) {
        const instrument = instrumentSelect.value;
        const frequency = instrumentFrequencies[instrument];
        const time = audioContext.currentTime;
        
        playSound(frequency, time, beatDuration * 0.9);
        
        // Add active class to animate the current beat
        checkbox.classList.add("active");
        
        // Remove active class after the beat duration
        setTimeout(() => checkbox.classList.remove("active"), beatDuration * 1000);
      }
    });

    // Wait for the duration of each beat
    await new Promise(resolve => setTimeout(resolve, beatDuration * 1000));
  }
}

function saveBeat() {
  const beatPattern = Array.from(beatGrid.children).map(checkbox => checkbox.checked);
  localStorage.setItem("savedBeat", JSON.stringify(beatPattern));
  alert("Beat saved!");
}

function loadBeat() {
  const savedBeat = JSON.parse(localStorage.getItem("savedBeat"));
  if (savedBeat) {
    Array.from(beatGrid.children).forEach((checkbox, index) => {
      checkbox.checked = savedBeat[index];
    });
  }
}

window.onload = loadBeat;