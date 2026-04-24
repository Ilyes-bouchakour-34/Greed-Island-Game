import { CardGrid } from './components/CardGrid.js';
import { ProbabilityOverlay } from './components/ProbabilityOverlay.js';
import { ScorePanel } from './components/ScorePanel.js';
import { ProbabilityEngine } from './algorithm/probabilityEngine.js';
import { InterferenceManager } from './algorithm/interferenceManager.js';

// --- Game Constants & Symbols ---
const SYMBOLS = [
    '🕷️', '⛓️', '🃏', '🎣', '⚡', '👁️', '🔥', '💧', 
    '🍃', '🦋', '🗡️', '🛡️', '⏳', '🌀', '🎭', '🩸', 
    '🕸️', '✨', '🎲', '🧠'
]; // 20 unique symbols

class GreedIslandGame {
    constructor() {
        this.cards = [];
        this.flippedIndices = [];
        this.isLocked = false;
        
        // Init Components
        this.cardGrid = new CardGrid('card-grid', this.handleCardClick.bind(this));
        this.probOverlay = new ProbabilityOverlay();
        this.scorePanel = new ScorePanel(this.handleTimeUp.bind(this));
        
        // Init Algorithms
        this.probEngine = new ProbabilityEngine();
        this.interferenceMgr = new InterferenceManager();

        // Bind UI elements
        this.alertEl = document.getElementById('interference-alert');
        this.gameOverScreen = document.getElementById('game-over-screen');
        this.restartBtn = document.getElementById('restart-btn');

        this.restartBtn.addEventListener('click', () => this.initGame());

        this.initGame();
    }

    initGame() {
        this.flippedIndices = [];
        this.isLocked = false;
        this.gameOverScreen.classList.add('hidden');
        this.interferenceMgr.reset();

        this.cards = this.generateDeck();
        this.cardGrid.render(this.cards);
        this.probOverlay.init(this.cards.length);
        this.probOverlay.hideAll();
        
        this.scorePanel.start();
    }

    generateDeck() {
        let deck = [];
        SYMBOLS.forEach(symbol => {
            deck.push({ symbol: symbol, isMatched: false });
            deck.push({ symbol: symbol, isMatched: false });
        });

        // Fisher-Yates Shuffle
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }
        return deck;
    }

    handleCardClick(index) {
        if (this.isLocked) return;
        if (this.flippedIndices.includes(index)) return;

        this.cardGrid.flipCard(index);
        this.flippedIndices.push(index);

        if (this.flippedIndices.length === 1) {
            // First card flipped, calculate probabilities for the rest
            const probs = this.probEngine.calculateProbabilities(this.cards, index, this.flippedIndices);
            this.probOverlay.update(probs, index);
        } else if (this.flippedIndices.length === 2) {
            // Second card flipped, lock board and check match
            this.isLocked = true;
            this.probOverlay.hideAll();
            this.scorePanel.incrementMoves();
            this.checkMatch();
        }
    }

    checkMatch() {
        const [index1, index2] = this.flippedIndices;
        const card1 = this.cards[index1];
        const card2 = this.cards[index2];

        if (card1.symbol === card2.symbol) {
            // Match!
            card1.isMatched = true;
            card2.isMatched = true;
            this.cardGrid.markMatched(index1, index2);
            this.scorePanel.incrementPairs();
            this.interferenceMgr.recordMatch();
            
            this.flippedIndices = [];
            this.isLocked = false;

            if (this.scorePanel.pairs === this.scorePanel.totalPairs) {
                this.handleWin();
            }
        } else {
            // Mismatch
            this.cardGrid.unflipCards(index1, index2);
            const triggered = this.interferenceMgr.recordMismatch();
            
            setTimeout(() => {
                this.flippedIndices = [];
                this.isLocked = false;

                if (triggered) {
                    this.showInterferenceAlert();
                    this.interferenceMgr.triggerInterference(this.cards, this.cardGrid, this.scorePanel);
                }
            }, 1000);
        }
    }

    showInterferenceAlert() {
        this.alertEl.classList.remove('hidden');
        setTimeout(() => {
            this.alertEl.classList.add('hidden');
        }, 2000);
    }

    handleTimeUp() {
        this.isLocked = true;
        this.showGameOverScreen(false);
    }

    handleWin() {
        this.scorePanel.stop();
        this.isLocked = true;
        this.showGameOverScreen(true);
    }

    showGameOverScreen(isWin) {
        const titleEl = document.getElementById('game-result-title');
        const descEl = document.getElementById('game-result-desc');
        const finalTimeEl = document.getElementById('final-time');
        const finalMovesEl = document.getElementById('final-moves');

        const stats = this.scorePanel.getStats();

        if (isWin) {
            titleEl.textContent = 'YOU WIN!';
            descEl.textContent = 'You have survived Hisoka\'s game.';
            this.gameOverScreen.querySelector('.modal-content').classList.remove('lose');
        } else {
            titleEl.textContent = 'YOU DIED.';
            descEl.textContent = '"I get bored. And when I\'m bored... people die." - Hisoka';
            this.gameOverScreen.querySelector('.modal-content').classList.add('lose');
        }

        finalTimeEl.textContent = `${stats.timeElapsed}s`;
        finalMovesEl.textContent = stats.moves;

        this.gameOverScreen.classList.remove('hidden');
    }
}

// Start game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new GreedIslandGame();
});
