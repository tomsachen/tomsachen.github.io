    const canvas = document.getElementById('torusCanvas');
    const ctx = canvas.getContext('2d');

    const oscilloscopeCanvas = document.getElementById('oscilloscope');
    const oscilloscopeCtx = oscilloscopeCanvas.getContext('2d');
    const oscilloscopeWidth = oscilloscopeCanvas.width;
    const oscilloscopeHeight = oscilloscopeCanvas.height;

    const sineWaveformCheckbox = document.getElementById('sine-waveform');
const sawtoothWaveformCheckbox = document.getElementById('sawtooth-waveform');
const triangleWaveformCheckbox = document.getElementById('triangle-waveform');

    const checkboxes = [
      document.getElementById('a-checkbox'),
      document.getElementById('b-checkbox'),
      document.getElementById('p-checkbox'),
      document.getElementById('q-checkbox')
    ];


const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const frequencySlider = document.getElementById('frequency-slider');


// Function to play audio based on frequency and amplitude
function playAudio() {
const frequency = parseFloat(frequencySlider.value);
const amplitude = parseFloat(amplitudeSlider.value);

const oscillator = audioContext.createOscillator();
oscillator.type = 'sine'; // Default to sine wave
if (document.getElementById('sawtooth-waveform').checked) {
    oscillator.type = 'sawtooth';
} else if (document.getElementById('triangle-waveform').checked) {
    oscillator.type = 'triangle';
}

oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
oscillator.connect(audioContext.destination);
oscillator.start();
oscillator.stop(audioContext.currentTime + .5);

// Display frequency and amplitude values (optional)
document.getElementById('frequency-input').value = frequency;
document.getElementById('amplitude-input').value = amplitude;
}


    let a = 2;
    let b = 1;
    let p = 3;
    let q = 7;
    const thetaMax = 2 * Math.PI;
    const numPoints = 1050;
    const thetaValues = Array.from({ length: numPoints }, (_, i) => (thetaMax * i) / numPoints);

    let angleX = 0.0;
    let angleY = 0.0;
    const rotationSpeed = 0.2;
    const zoomFactor = .75; // Zoom out factor

    let frequency = 1;
    let amplitude = 1.5;
    let sineWavePhase = 0;

    const aCheckbox = document.getElementById('a-checkbox');
    const bCheckbox = document.getElementById('b-checkbox');
    const pCheckbox = document.getElementById('p-checkbox');
    const qCheckbox = document.getElementById('q-checkbox');
    let savedCheckboxStates = null;

    const baseA = 2;
    const baseB = 1;
    const baseP = 3;
    const baseQ = 7;

    function computeTorusKnot(a, b, p, q, theta) {
        const x = (a + b * Math.cos(q * theta)) * Math.cos(p * theta);
        const y = (a + b * Math.cos(q * theta)) * Math.sin(p * theta);
        const z = b * Math.sin(q * theta);
        return { x, y, z };
    }

    function drawTorusKnot(ctx, a, b, p, q, thetaValues, angleX, angleY) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const scaledPoints = thetaValues.map((theta) => {
            const { x, y, z } = computeTorusKnot(a, b, p, q, theta);
            const xRot = x * Math.cos(angleY) - z * Math.sin(angleY);
            const zRot = x * Math.sin(angleY) + z * Math.cos(angleY);
            const yRot = y * Math.cos(angleX) - zRot * Math.sin(angleX);
            const zRotated = y * Math.sin(angleX) + z * Math.cos(angleX);
            const scaledX = xRot * 50 * zoomFactor + canvas.width / 2;
            const scaledY = yRot * 50 * zoomFactor + canvas.height / 2;
            return { x: scaledX, y: scaledY };
        });

        ctx.beginPath();
        ctx.strokeStyle = 'white';
        for (let i = 1; i < scaledPoints.length; i++) {
            const { x, y } = scaledPoints[i];
            ctx.lineTo(x, y);
        }
        ctx.stroke();
    }


    function updateTorusParams() {
        if (aCheckbox.checked) {
            a = parseFloat(document.getElementById('a-slider').value);
            document.getElementById('a-input').value = a;
        }
        if (bCheckbox.checked) {
            b = parseFloat(document.getElementById('b-slider').value);
            document.getElementById('b-input').value = b;
        }
        if (pCheckbox.checked) {
            p = parseInt(document.getElementById('p-slider').value);
            document.getElementById('p-input').value = p;
        }
        if (qCheckbox.checked) {
            q = parseInt(document.getElementById('q-slider').value);
            document.getElementById('q-input').value = q;
        }
    }

    function updateSineWaveParams() {
        frequency = parseFloat(document.getElementById('frequency-slider').value);
        amplitude = parseFloat(document.getElementById('amplitude-slider').value);
        document.getElementById('frequency-input').value = frequency;
        document.getElementById('amplitude-input').value = amplitude;
    }
    function generateWave(t) {
      if (sineWaveformCheckbox.checked) {
        return amplitude * Math.sin(2 * Math.PI * frequency * t);
    } else if (sawtoothWaveformCheckbox.checked) {
    return amplitude * (2 * (t * frequency - Math.floor(t * frequency + 0.5)));
    } else if (triangleWaveformCheckbox.checked) {
    const value = t * frequency * 2 % 2;
    return amplitude * (4 * Math.abs(value - 1) - 1);
}
}

window.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'ArrowLeft':
            angleY += rotationSpeed;
            break;
        case 'ArrowRight':
            angleY -= rotationSpeed;
            break;
        case 'ArrowUp':
            angleX += rotationSpeed;
            break;
        case 'ArrowDown':
            angleX -= rotationSpeed;
            break;
        case 'Enter':
            angleX = 0;
            angleY = 0;
            break;
        case ' ':
            event.preventDefault(); // Prevent the default scrolling behavior of spacebar
            const anyChecked = checkboxes.some(checkbox => checkbox.checked);
            if (anyChecked) {
                // If any checkboxes are checked, save their states and uncheck them
                savedCheckboxStates = checkboxes.map(checkbox => checkbox.checked);
                checkboxes.forEach(checkbox => checkbox.checked = false);
            } else if (savedCheckboxStates) {
                // If there were saved states, restore them
                checkboxes.forEach((checkbox, index) => checkbox.checked = savedCheckboxStates[index]);
                savedCheckboxStates = null; // Clear saved states
            }
            break;
        case 'm':
        playAudio();
        break;
        case 'q':
            frequencySlider.value = 65.41; // beginning of harmonic series
            playAudio(); // To update sound immediately after changing frequency
            frequencyInput.value = frequencySlider.value; // Update displayed frequency value
            break;
        case 'w':
            frequencySlider.value = 130.81;
            playAudio();
            frequencyInput.value = frequencySlider.value;
            break;
        case 'e':
            frequencySlider.value = 196.00;
            playAudio();
            frequencyInput.value = frequencySlider.value;
            break;
        case 'r':
            frequencySlider.value = 261.63;
            playAudio();
            frequencyInput.value = frequencySlider.value;
            break;
        case 't':
            frequencySlider.value = 329.63;
            playAudio();
            frequencyInput.value = frequencySlider.value;
            break;
        case 'y':
            frequencySlider.value = 392;
            playAudio();
            frequencyInput.value = frequencySlider.value;
            break;
        case 'u':
            frequencySlider.value = 466.16;
            playAudio();
            frequencyInput.value = frequencySlider.value;
            break;
        case 'i':
            frequencySlider.value = 523.25;
            playAudio();
            frequencyInput.value = frequencySlider.value;
            break;
        case 'a':
            frequencySlider.value = 587.33;
            playAudio();
            frequencyInput.value = frequencySlider.value;
            break;
        case 's':
            frequencySlider.value = 659.26;
            playAudio();
            frequencyInput.value = frequencySlider.value;
            break;
        case 'd':
            frequencySlider.value = 739.99;
            playAudio();
            frequencyInput.value = frequencySlider.value;
            break;
        case 'f':
            frequencySlider.value = 783.99;
            playAudio();
            frequencyInput.value = frequencySlider.value;
            break;
        case 'g':
            frequencySlider.value = 830.61;
            playAudio();
            frequencyInput.value = frequencySlider.value;
            break;
        case 'h':
            frequencySlider.value = 932.33;
            playAudio();
            frequencyInput.value = frequencySlider.value;
            break;
        case 'j':
            frequencySlider.value = 987.77;
            playAudio();
            frequencyInput.value = frequencySlider.value;
            break;
        case 'k':
            frequencySlider.value = 1046.50;
            playAudio();
            frequencyInput.value = frequencySlider.value;
            break;
    }
});


// Add event listeners to the text input fields to update the global variables on change

document.getElementById('a-input').addEventListener('input', (e) => {
a = parseFloat(e.target.value);
});

document.getElementById('b-input').addEventListener('input', (e) => {
b = parseFloat(e.target.value);
});

document.getElementById('p-input').addEventListener('input', (e) => {
p = parseInt(e.target.value);
});

document.getElementById('q-input').addEventListener('input', (e) => {
q = parseInt(e.target.value);
});

const amplitudeSlider = document.getElementById('amplitude-slider');
const frequencyInput = document.getElementById('frequency-input');
const amplitudeInput = document.getElementById('amplitude-input');

let audioSource = null;

function playAudio() {
    if (audioSource) {
        // Introduce a short release time for the currently playing sound
        audioSource.gainNode.gain.setValueAtTime(audioSource.gainNode.gain.value, audioContext.currentTime);
        audioSource.gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1); // 100ms release
        audioSource.oscillator.stop(audioContext.currentTime + 0.1);
    }

    const frequency = parseFloat(frequencySlider.value);
    const amplitude = parseFloat(amplitudeSlider.value);

    const oscillator = audioContext.createOscillator();
    oscillator.type = 'sine'; // Default to sine wave
    if (document.getElementById('sawtooth-waveform').checked) {
        oscillator.type = 'sawtooth';
    } else if (document.getElementById('triangle-waveform').checked) {
        oscillator.type = 'triangle';
    }

    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);

    const gainNode = audioContext.createGain();

    // Slight attack time to avoid pops
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(amplitude, audioContext.currentTime + 0.02); // 20ms attack
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1.5);

    // Low-pass filter with some resonance
    const filter = audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1500, audioContext.currentTime); // Adjust as needed

    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 1.5);

    // Display frequency and amplitude values (optional)
    frequencyInput.value = frequency;
    amplitudeInput.value = amplitude;

    // Store the oscillator and gainNode for future reference
    audioSource = { oscillator: oscillator, gainNode: gainNode };
}



    function drawOscilloscope(ctx, time) {
        ctx.clearRect(0, 0, oscilloscopeWidth, oscilloscopeHeight);

        let valuesToUpdate = [];
        if (aCheckbox.checked) valuesToUpdate.push('a');
        if (bCheckbox.checked) valuesToUpdate.push('b');
        if (pCheckbox.checked) valuesToUpdate.push('p');
        if (qCheckbox.checked) valuesToUpdate.push('q');

        let waveAmplitude = generateWave(time);

        ctx.beginPath();
        ctx.moveTo(oscilloscopeWidth / 2, 0);

        const timeStretch = .00001
        for (let i = 0; i < oscilloscopeWidth; i++) {
            const t = time + (i * timeStretch);
            const y = generateWave(t);
            const yScaled = oscilloscopeHeight / 2 - (y * (oscilloscopeHeight / 2) / 10);


            ctx.lineTo(i, yScaled);

            if (i === oscilloscopeWidth / 2) {
                ctx.strokeStyle = 'white';
                ctx.moveTo(i, yScaled);
            }
        }

        ctx.strokeStyle = 'white';
        ctx.stroke();

        if (valuesToUpdate.length > 0) {
            let updateAmountRadii = .3*waveAmplitude;
            let updateAmountWinds = waveAmplitude
            valuesToUpdate.forEach((param) => {
              if (param === 'a') {
                 a = baseA + updateAmountRadii * waveAmplitude;
                 document.getElementById('a-slider').value = a;
                 document.getElementById('a-input').value = Math.round(a);
              }
              if (param === 'b') {
                 b = baseB + updateAmountRadii * waveAmplitude;
                 document.getElementById('b-slider').value = b;
                 document.getElementById('b-input').value = Math.round(b);
              }
              if (param === 'p') {
                 p = baseP + updateAmountRadii * waveAmplitude;
                 document.getElementById('p-slider').value = p;
                 document.getElementById('p-input').value = Math.round(p);
              }
              if (param === 'q') {
                 q = baseQ + updateAmountRadii * waveAmplitude;
                 document.getElementById('q-slider').value = q;
                 document.getElementById('q-input').value = Math.round(q);
              }
            });
        }
    }


    function animate() {
        sineWavePhase += 0.02;
        updateTorusParams();
        updateSineWaveParams();

        drawTorusKnot(ctx, a, b, p, q, thetaValues, angleX, angleY);

        drawOscilloscope(oscilloscopeCtx, sineWavePhase);

        requestAnimationFrame(animate);
    }

    // Ensure only one waveform checkbox is selected at a time.
    [sineWaveformCheckbox, sawtoothWaveformCheckbox, triangleWaveformCheckbox].forEach((checkbox) => {
        checkbox.addEventListener('change', () => {
            if (checkbox.checked) {
                [sineWaveformCheckbox, sawtoothWaveformCheckbox, triangleWaveformCheckbox].forEach((c) => {
                    c.checked = (c === checkbox);
                });
            }
        });
    });

    animate();
