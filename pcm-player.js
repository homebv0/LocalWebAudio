export class PCMPlayer extends AudioWorkletProcessor {
    constructor() {
        super();
        this.queue = [];
        this.channels = 2;

        this.port.onmessage = (event) => {
            if (event.data.channels) {
                this.channels = event.data.channels;
                return;
            }
            this.queue.push(new Int16Array(event.data));
        };
    }

    process(inputs, outputs) {
        const output = outputs[0];

        if (this.queue.length === 0) {
            for (let ch = 0; ch < this.channels; ch++)
                output[ch].fill(0);
            return true;
        }

        const pcm = this.queue.shift();
        const frames = pcm.length / this.channels;

        for (let ch = 0; ch < this.channels; ch++) {
            const channel = output[ch];
            for (let i = 0; i < channel.length; i++) {
                const idx = i * this.channels + ch;
                channel[i] = (pcm[idx] || 0) / 32768;
            }
        }

        return true;
    }
}

registerProcessor("pcm-player", PCMPlayer);
