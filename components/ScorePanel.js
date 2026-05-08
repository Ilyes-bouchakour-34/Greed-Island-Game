export class ScorePanel {
    constructor(onTimeUp) {
        this.timerEl = document.getElementById('timer');
        this.moveCounterEl = document.getElementById('move-counter');
        this.pairCounterEl = document.getElementById('pair-counter');
        
        this.moves = 0;
        this.pairs = 0;
        this.totalPairs = 20;
        this.timeLeft = 60; 
        this.timerInterval = null;
        this.onTimeUp = onTimeUp;
    }

    start() {
        this.moves = 0;
        this.pairs = 0;
        this.timeLeft = 60;
        this.updateDisplay();

        clearInterval(this.timerInterval);
        this.timerInterval = setInterval(() => {
            if (this.isFrozen) return;
            this.timeLeft--;
            this.updateDisplay();

            if (this.timeLeft <= 10) {
                this.timerEl.style.color = '#ff3366';
                this.timerEl.classList.add('nen-effect'); 
            }

            if (this.timeLeft <= 0) {
                this.stop();
                if (this.onTimeUp) this.onTimeUp();
            }
        }, 1000);
    }

    stop() {
        clearInterval(this.timerInterval);
        this.timerEl.classList.remove('nen-effect');
    }

    incrementMoves() {
        this.moves++;
        this.updateDisplay();
    }

    addTime(seconds) {
        this.timeLeft += seconds;
        this.updateDisplay();
    }

    freezeTimer(duration) {
        this.isFrozen = true;
        this.timerEl.style.color = '#00f3ff';
        this.timerEl.classList.add('nen-effect');
        setTimeout(() => {
            this.isFrozen = false;
            this.timerEl.classList.remove('nen-effect');
            this.timerEl.style.color = '';
        }, duration * 1000);
    }

    incrementPairs() {
        this.pairs++;
        this.updateDisplay();
    }
    
    decrementPairs() {
        if(this.pairs > 0) this.pairs--;
        this.updateDisplay();
    }

    updateDisplay() {
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        this.timerEl.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        this.moveCounterEl.textContent = this.moves;
        this.pairCounterEl.textContent = `${this.pairs} / ${this.totalPairs}`;
    }
    
    getStats() {
        return {
            moves: this.moves,
            timeElapsed: 60 - this.timeLeft
        };
    }
}
