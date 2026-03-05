import { keepWake, letSleep } from "./wake-lock.js";

const toggle = document.getElementById("theToggle");
const url = document.getElementById("theURL");

export function main()
{
    toggle.onclick = () => startStop();

    let x = localStorage.getItem("url");
    if (x != null) { url.value = x; }
    url.onchange = () => { localStorage.setItem("url", url.value); }
}


let audio;
let node;
let ws;
let isRunning = false;

export async function startListen() 
{
    if (running) return;
    isRunning = true;
    keepWake();

    audio = new AudioContext();
    await audio.audioWorklet.addModule("pcm-player.js");

    node = new AudioWorkletNode(audio, "pcm-player");
    node.connect(audio.destination);

    ws = new WebSocket(`${url.value}/pcm`);
    ws.binaryType = "arraybuffer";

    ws.onmessage = (ev) => {
        if (typeof ev.data === "string") {
            const meta = JSON.parse(ev.data);
            node.port.postMessage({ channels: meta.channels });
            return;
        }
        node.port.postMessage(ev.data);
    };

    ws.onclose = () => {
        isRunning = false;
        letSleep();
    };

    await audio.resume();

    toggle.textContent = "Stop";
}

export function stopListen() {
    if (!running) return;
    isRunning = false;

    ws?.close();
    node?.disconnect();
    audio?.close();
    letSleep();
    toggle.textContent = "Start";
}

function startStop()
{
    if (isRunning) { stopListen(); }
    else { startListen(); }
}