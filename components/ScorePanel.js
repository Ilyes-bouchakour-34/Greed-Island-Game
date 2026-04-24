export class ScorePanel {
    constructor(onTimeUp) {
        this.timerEl = document.getElementById('timer');
        this.moveCounterEl = document.getElementById('move-counter');
        this.pairCounterEl = document.getElementById('pair-counter');
        
        this.moves = 0;
        this.pairs = 0;
        this.totalPairs = 20;
        this.timeLeft = 60; // 60 seconds
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
            this.timeLeft--;
            this.updateDisplay();

            if (this.timeLeft <= 10) {
                this.timerEl.style.color = '#ff3366';
                this.timerEl.classList.add('nen-effect'); // Make it shake when time is low
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
