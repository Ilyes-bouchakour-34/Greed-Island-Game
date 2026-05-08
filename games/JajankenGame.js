export class JajankenGame {
    constructor(audioEngine, onExit) {
        this.container = document.getElementById('jajanken-container');
        this.audioEngine = audioEngine;
        this.onExit = onExit;
        
        this.playerScore = 0;
        this.gonScore = 0;
        this.rounds = 3;
        this.currentRound = 0;
        this._timeouts = []; // track all timeouts for cleanup
        
        this.choices = ['Rock', 'Paper', 'Scissors'];
        
        this.initDOM();
        this.initListeners();
    }
    
    initDOM() {
        this.container.innerHTML = `
            <div class="hud" style="justify-content: space-between;">
                <div class="title-panel">
                    <h1>JAJANKEN</h1>
                    <h2 class="subtitle">VS GON FREECSS</h2>
                </div>
                <button id="jajanken-exit" class="glow-on-hover" style="margin-top:0; padding: 8px 16px; font-size: 0.8rem;">EXIT</button>
            </div>
            <div class="jajanken-arena">
                <div class="jajanken-score">
                    <div>YOU: <span id="jajanken-player-score">0</span></div>
                    <div>ROUND: <span id="jajanken-round">1</span>/3</div>
                    <div>GON: <span id="jajanken-gon-score">0</span></div>
                </div>
                
                <div class="jajanken-battle-area">
                    <div id="jajanken-player-move" class="jajanken-move">?</div>
                    <div id="jajanken-vs" class="neon-text">VS</div>
                    <div id="jajanken-gon-move" class="jajanken-move">?</div>
                </div>
                
                <div id="jajanken-result" class="jajanken-result">Choose your Nen!</div>
                
                <div class="jajanken-controls">
                    <button class="glow-on-hover btn-choice" data-choice="Rock">ROCK (Gu)</button>
                    <button class="glow-on-hover btn-choice" data-choice="Paper">PAPER (Pa)</button>
                    <button class="glow-on-hover btn-choice" data-choice="Scissors">SCISSORS (Chi)</button>
                </div>
            </div>
        `;
    }
    
    initListeners() {
        document.getElementById('jajanken-exit').addEventListener('click', () => {
            this.cleanup();
            if (this.onExit) this.onExit(false);
        });

        const btns = this.container.querySelectorAll('.btn-choice');
        btns.forEach(btn => {
            btn.addEventListener('click', (e) => this.playRound(e.target.dataset.choice));
        });
    }
    
    start() {
        this.playerScore = 0;
        this.gonScore = 0;
        this.currentRound = 1;
        this.updateUI();
        this.container.classList.remove('hidden');
        document.getElementById('jajanken-result').textContent = 'Choose your Nen!';
        document.getElementById('jajanken-player-move').textContent = '?';
        document.getElementById('jajanken-gon-move').textContent = '?';
        this.setControlsDisabled(false);
    }
    
    cleanup() {
        // Cancel all pending timeouts to prevent post-exit crashes
        this._timeouts.forEach(t => clearTimeout(t));
        this._timeouts = [];
        this.container.classList.add('hidden');
    }
    
    playRound(playerChoice) {
        this.audioEngine.playFlip();
        this.setControlsDisabled(true);
        
        // Show Gon charging
        document.getElementById('jajanken-gon-move').textContent = 'Charging...';
        document.getElementById('jajanken-gon-move').classList.add('nen-effect');
        
        const t = setTimeout(() => {
            const gonChoice = this.choices[Math.floor(Math.random() * this.choices.length)];
            document.getElementById('jajanken-gon-move').classList.remove('nen-effect');
            this.evaluateRound(playerChoice, gonChoice);
        }, 1000);
        this._timeouts.push(t);
    }
    
    evaluateRound(player, gon) {
        document.getElementById('jajanken-player-move').textContent = this.getEmoji(player);
        document.getElementById('jajanken-gon-move').textContent = this.getEmoji(gon);
        
        const resultEl = document.getElementById('jajanken-result');
        
        if (player === gon) {
            resultEl.textContent = 'DRAW!';
            this.audioEngine.playMatch();
        } else if (
            (player === 'Rock' && gon === 'Scissors') ||
            (player === 'Paper' && gon === 'Rock') ||
            (player === 'Scissors' && gon === 'Paper')
        ) {
            resultEl.textContent = 'YOU WIN ROUND!';
            this.playerScore++;
            this.audioEngine.playWin();
        } else {
            resultEl.textContent = 'GON WINS ROUND!';
            this.gonScore++;
            this.audioEngine.playError();
        }
        
        this.updateUI();
        
        const t = setTimeout(() => {
            if (this.currentRound >= this.rounds) {
                this.endGame();
            } else {
                this.currentRound++;
                this.updateUI();
                this.setControlsDisabled(false);
                resultEl.textContent = 'Next Round... Choose!';
            }
        }, 2000);
        this._timeouts.push(t);
    }
    
    getEmoji(move) {
        if (move === 'Rock') return '✊';
        if (move === 'Paper') return '✋';
        if (move === 'Scissors') return '✌️';
        return '?';
    }
    
    updateUI() {
        document.getElementById('jajanken-player-score').textContent = this.playerScore;
        document.getElementById('jajanken-gon-score').textContent = this.gonScore;
        document.getElementById('jajanken-round').textContent = Math.min(this.currentRound, this.rounds);
    }
    
    setControlsDisabled(disabled) {
        const btns = this.container.querySelectorAll('.btn-choice');
        btns.forEach(b => b.disabled = disabled);
    }
    
    endGame() {
        const resultEl = document.getElementById('jajanken-result');
        const won = this.playerScore > this.gonScore;
        if (won) {
            resultEl.textContent = `YOU DEFEATED GON! (${this.playerScore}-${this.gonScore})`;
            this.audioEngine.playWin();
        } else if (this.gonScore > this.playerScore) {
            resultEl.textContent = `GON DEFEATED YOU! (${this.gonScore}-${this.playerScore})`;
            this.audioEngine.playLose();
        } else {
            resultEl.textContent = "IT'S A TIE! Try again!";
            this.audioEngine.playMatch();
        }

        setTimeout(() => {
            this.cleanup();
            if (this.onExit) this.onExit(won);
        }, 3000);
    }
}
