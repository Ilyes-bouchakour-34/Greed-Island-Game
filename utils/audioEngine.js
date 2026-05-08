export class AudioEngine {
    constructor() {
        this.ctx = null;
        this.enabled = true;
    }

    _getCtx() {
        if (!this.ctx) {
            try {
                this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            } catch (e) {
                console.warn('AudioContext not supported', e);
                this.enabled = false;
            }
        }
        return this.ctx;
    }

    playTone(frequency, type, duration, vol = 0.1) {
        if (!this.enabled) return;
        const ctx = this._getCtx();
        if (!ctx) return;

        try {
            if (ctx.state === 'suspended') ctx.resume();

            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = type;
            osc.frequency.setValueAtTime(frequency, ctx.currentTime);

            gain.gain.setValueAtTime(vol, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start();
            osc.stop(ctx.currentTime + duration);
        } catch (e) {
            // Silently ignore audio errors
        }
    }

    playFlip() {
        this.playTone(300, 'sine', 0.1, 0.05);
        setTimeout(() => this.playTone(400, 'sine', 0.1, 0.05), 50);
    }

    playMatch() {
        this.playTone(440, 'sine', 0.1, 0.1);
        setTimeout(() => this.playTone(554.37, 'sine', 0.1, 0.1), 100);
        setTimeout(() => this.playTone(659.25, 'sine', 0.2, 0.1), 200);
    }

    playMismatch() {
        this.playTone(200, 'sawtooth', 0.15, 0.05);
        setTimeout(() => this.playTone(150, 'sawtooth', 0.2, 0.05), 100);
    }

    playError() {
        this.playTone(100, 'square', 0.3, 0.1);
    }

    playSpell() {
        this.playTone(800, 'sine', 0.1, 0.1);
        setTimeout(() => this.playTone(1200, 'sine', 0.3, 0.1), 100);
    }

    playWin() {
        this.playMatch();
        setTimeout(() => this.playTone(880, 'sine', 0.4, 0.1), 300);
    }

    playLose() {
        this.playTone(200, 'sawtooth', 0.3, 0.1);
        setTimeout(() => this.playTone(150, 'sawtooth', 0.3, 0.1), 300);
        setTimeout(() => this.playTone(100, 'sawtooth', 0.6, 0.1), 600);
    }
}
