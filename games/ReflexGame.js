export class ReflexGame {
    constructor(audioEngine, onExit) {
        this.container = document.getElementById('reflex-container');
        this.audioEngine = audioEngine;
        this.onExit = onExit;
        
        this.score = 0;
        this.targetClicks = 10;
        this.clicks = 0;
        this.interval = null;
        
        this.initDOM();
        this.initListeners();
    }
    
    initDOM() {
        this.container.innerHTML = `
            <div class="hud" style="justify-content: space-between;">
                <div class="title-panel">
                    <h1>GODSPEED</h1>
                    <h2 class="subtitle">HEAVEN'S ARENA TRAINING</h2>
                </div>
                <button id="reflex-exit" class="glow-on-hover" style="margin-top:0; padding: 8px 16px; font-size: 0.8rem;">EXIT</button>
            </div>
            <div class="reflex-arena">
                <div class="reflex-instructions">Click the lightning target before it moves! Catch 10.</div>
                <div class="reflex-score">Score: <span id="reflex-score">0</span> / 10</div>
                <div class="reflex-board" id="reflex-board">
                    <div id="reflex-target" class="reflex-target">⚡</div>
                </div>
                <div id="reflex-result" class="neon-text" style="font-size: 2rem; margin-top: 20px; text-align: center;"></div>
            </div>
        `;
    }
    
    initListeners() {
        document.getElementById('reflex-exit').addEventListener('click', () => {
            this.cleanup();
            if (this.onExit) this.onExit(false);
        });
        
        const target = document.getElementById('reflex-target');
        // Support both mouse and touch (mobile)
        target.addEventListener('mousedown', () => this.hitTarget());
        target.addEventListener('touchstart', (e) => { e.preventDefault(); this.hitTarget(); }, { passive: false });
    }
    
    start() {
        this.score = 0;
        this.clicks = 0;
        document.getElementById('reflex-score').textContent = '0';
        document.getElementById('reflex-result').textContent = '';
        this.container.classList.remove('hidden');
        
        this.moveTarget();
        this.interval = setInterval(() => this.moveTarget(), 1000); // Target moves every 1s initially
    }
    
    cleanup() {
        if (this.interval) clearInterval(this.interval);
        this.container.classList.add('hidden');
    }
    
    moveTarget() {
        const board = document.getElementById('reflex-board');
        const target = document.getElementById('reflex-target');
        
        const maxX = board.clientWidth - target.clientWidth;
        const maxY = board.clientHeight - target.clientHeight;
        
        const rX = Math.floor(Math.random() * maxX);
        const rY = Math.floor(Math.random() * maxY);
        
        target.style.left = `${rX}px`;
        target.style.top = `${rY}px`;
    }
    
    hitTarget() {
        this.score++;
        document.getElementById('reflex-score').textContent = this.score;
        this.audioEngine.playFlip();
        
        if (this.score >= this.targetClicks) {
            this.endGame();
        } else {
            // Speed up
            clearInterval(this.interval);
            const newSpeed = Math.max(300, 1000 - (this.score * 70));
            this.moveTarget();
            this.interval = setInterval(() => this.moveTarget(), newSpeed);
        }
    }
    
    endGame() {
        clearInterval(this.interval);
        this.audioEngine.playWin();
        document.getElementById('reflex-result').textContent = 'TRAINING COMPLETE! ⚡';

        setTimeout(() => {
            this.cleanup();
            if (this.onExit) this.onExit(true);
        }, 3000);
    }
}
