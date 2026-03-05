const audioContext = new (window.AudioContext || window.webkitAudioContext)();
let isPlaying = false;
let sourceNode;
let websocket;

const inputElement = document.createElement('input');
inputElement.type = 'text';
inputElement.placeholder = 'Enter PCM audio data';
document.body.appendChild(inputElement);

const toggleButton = document.createElement('button');
toggleButton.textContent = 'Start Listening';
document.body.appendChild(toggleButton);

toggleButton.addEventListener('click', () => {
    if (isPlaying) {
        stopListening();
    } else {
        startListening();
    }
});

function startListening() {
    websocket = new WebSocket('ws://your-websocket-url');

    websocket.onopen = () => {
        console.log('WebSocket connection established');
        isPlaying = true;
        toggleButton.textContent = 'Stop Listening';
        keepScreenAwake();
    };

    websocket.onmessage = (event) => {
        const audioData = new Float32Array(event.data);
        playAudio(audioData);
    };

    websocket.onclose = () => {
        console.log('WebSocket connection closed');
        stopListening();
    };
}

function stopListening() {
    if (websocket) {
        websocket.close();
    }
    if (sourceNode) {
        sourceNode.stop();
        sourceNode.disconnect();
        sourceNode = null;
    }
    isPlaying = false;
    toggleButton.textContent = 'Start Listening';
}

function playAudio(audioData) {
    if (sourceNode) {
        sourceNode.stop();
        sourceNode.disconnect();
    }
    sourceNode = audioContext.createBufferSource();
    const audioBuffer = audioContext.createBuffer(1, audioData.length, audioContext.sampleRate);
    audioBuffer.copyToChannel(audioData, 0);
    sourceNode.buffer = audioBuffer;
    sourceNode.loop = true;
    sourceNode.connect(audioContext.destination);
    sourceNode.start(0);
}

function keepScreenAwake() {
    if (typeof window.requestIdleCallback === 'function') {
        window.requestIdleCallback(keepScreenAwake);
    } else {
        setTimeout(keepScreenAwake, 1000);
    }
}