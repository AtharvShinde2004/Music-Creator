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

function clearBeats() {
  Array.from(beatGrid.children).forEach(checkbox => {
    checkbox.checked = false;
  });
}

function saveAudio() {
  const beatPattern = Array.from(beatGrid.children).map(checkbox => checkbox.checked);
  const tempo = parseInt(tempoInput.value);
  const beatDuration = 60 / tempo / 4;

  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const offlineContext = new OfflineAudioContext(1, audioContext.sampleRate * beatPattern.length * beatDuration, audioContext.sampleRate);

  // Schedule the sounds based on beat pattern
  let currentTime = 0;
  beatPattern.forEach((isSelected, index) => {
    if (isSelected) {
      const instrument = instrumentSelect.value;
      const frequency = instrumentFrequencies[instrument];
      
      // Create and configure oscillator
      const oscillator = offlineContext.createOscillator();
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(frequency, currentTime);

      const gainNode = offlineContext.createGain();
      gainNode.gain.setValueAtTime(0.5, currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + beatDuration * 0.9);

      oscillator.connect(gainNode);
      gainNode.connect(offlineContext.destination);

      oscillator.start(currentTime);
      oscillator.stop(currentTime + beatDuration * 0.9);
    }
    currentTime += beatDuration;
  });

  // Render the audio
  offlineContext.startRendering().then(renderedBuffer => {
    // Convert to MP3 format using libmp3lame.js
    const wavData = new Int16Array(renderedBuffer.length);
    for (let i = 0; i < renderedBuffer.length; i++) {
      wavData[i] = Math.max(-1, Math.min(1, renderedBuffer.getChannelData(0)[i])) * 32767;
    }

    const mp3encoder = new lamejs.Mp3Encoder(1, audioContext.sampleRate, 128);
    const mp3Data = [];
    const sampleBlockSize = 1152;

    for (let i = 0; i < wavData.length; i += sampleBlockSize) {
      const sampleChunk = wavData.subarray(i, i + sampleBlockSize);
      const mp3buf = mp3encoder.encodeBuffer(sampleChunk);
      if (mp3buf.length > 0) mp3Data.push(new Int8Array(mp3buf));
    }

    const endBuf = mp3encoder.flush();
    if (endBuf.length > 0) mp3Data.push(new Int8Array(endBuf));

    // Create MP3 Blob and download
    const mp3Blob = new Blob(mp3Data, { type: "audio/mp3" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(mp3Blob);
    link.download = "beatPattern.mp3";
    link.click();
  });
}



window.onload = loadBeat;