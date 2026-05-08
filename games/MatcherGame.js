import { CardGrid } from '../components/CardGrid.js';
import { ProbabilityOverlay } from '../components/ProbabilityOverlay.js';
import { ScorePanel } from '../components/ScorePanel.js';
import { SpellManager } from '../components/SpellManager.js';
import { ProbabilityEngine } from '../algorithm/probabilityEngine.js';
import { InterferenceManager } from '../algorithm/interferenceManager.js';

const SYMBOLS = [
    '🕷️', '⛓️', '🃏', '🎣', '⚡', '👁️', '🔥', '💧', 
    '🍃', '🦋', '🗡️', '🛡️', '⏳', '🌀', '🎭', '🩸', 
    '🕸️', '✨', '🎲', '🧠'
];

const STAGES = [
    { level: 1, boss: 'GENTHRU', time: 60, threshold: 5 },
    { level: 2, boss: 'RAZOR', time: 80, threshold: 4 },
    { level: 3, boss: 'HISOKA', time: 100, threshold: 2 }
];

export class MatcherGame {
    constructor(audioEngine, onExit) {
        this.container = document.getElementById('game-container');
        this.cards = [];
        this.flippedIndices = [];
        this.isLocked = false;
        this.currentStageIndex = 0;
        this.onExit = onExit;
        
        this.audioEngine = audioEngine;
        this.cardGrid = new CardGrid('card-grid', this.handleCardClick.bind(this));
        this.probOverlay = new ProbabilityOverlay();
        this.scorePanel = new ScorePanel(this.handleTimeUp.bind(this));
        this.spellManager = new SpellManager(this.audioEngine);
        
        this.probEngine = new ProbabilityEngine();
        this.interferenceMgr = new InterferenceManager();
        
        this.alertEl = document.getElementById('interference-alert');
        this.gameOverScreen = document.getElementById('game-over-screen');
        this.restartBtn = document.getElementById('restart-btn');

        this.stageLevelEl = document.getElementById('stage-level');
        this.stageBossEl = document.getElementById('stage-boss');
        this.exitBtn = document.getElementById('exit-btn');

        this.restartBtn.addEventListener('click', () => {
            this.audioEngine.playFlip(); 
            this.initStage();
        });

        if (this.exitBtn) {
            this.exitBtn.addEventListener('click', () => {
                this.cleanup();
                if (this.onExit) this.onExit(false);
            });
        }

        this.initSpells();
    }

    start() {
        this.container.classList.remove('hidden');
        this.currentStageIndex = 0;
        this.initStage();
    }

    cleanup() {
        if (this.razorInterval) clearInterval(this.razorInterval);
        this.scorePanel.stop();
        this.container.classList.add('hidden');
        this.gameOverScreen.classList.add('hidden');
    }

    initSpells() {
        this.spellManager.onAccompany = () => {
            const unmatched = [];
            this.cards.forEach((card, idx) => {
                if (!card.isMatched) unmatched.push({ card, idx });
            });

            // Find a pair
            let foundPair = null;
            for (let i = 0; i < unmatched.length; i++) {
                for (let j = i + 1; j < unmatched.length; j++) {
                    if (unmatched[i].card.symbol === unmatched[j].card.symbol) {
                        foundPair = [unmatched[i].idx, unmatched[j].idx];
                        break;
                    }
                }
                if (foundPair) break;
            }

            if (foundPair) {
                const [idx1, idx2] = foundPair;
                this.cards[idx1].isMatched = true;
                this.cards[idx2].isMatched = true;
                this.cardGrid.flipCard(idx1);
                this.cardGrid.flipCard(idx2);
                this.cardGrid.markMatched(idx1, idx2);
                this.scorePanel.incrementPairs();
                
                if (this.scorePanel.pairs === this.scorePanel.totalPairs) {
                    setTimeout(() => this.handleWin(), 1000);
                }
            }
        };

        this.spellManager.onMagnetic = () => {
            this.scorePanel.freezeTimer(10);
        };

        this.spellManager.onThief = () => {
            this.scorePanel.addTime(10);
        };
    }

    initStage() {
        const stage = STAGES[this.currentStageIndex];
        this.stageLevelEl.textContent = stage.level;
        this.stageBossEl.textContent = stage.boss;
        this.interferenceMgr.threshold = stage.threshold;
        this.scorePanel.timeLeft = stage.time;

        this.flippedIndices = [];
        this.isLocked = false;
        this.gameOverScreen.classList.add('hidden');
        this.interferenceMgr.reset();
        this.spellManager.reset();

        this.cards = this.generateDeck();
        this.cardGrid.render(this.cards);
        this.probOverlay.init(this.cards.length);
        this.probOverlay.hideAll();
        
        this.scorePanel.start();
        
        if (stage.boss === 'GENTHRU') {
            this.plantBombs();
        } else if (stage.boss === 'RAZOR') {
            this.startRazorDodgeball();
        }
    }

    plantBombs() {
        // Genthru plants 3 bombs
        this.bombs = [];
        while(this.bombs.length < 3) {
            const r = Math.floor(Math.random() * this.cards.length);
            if (!this.bombs.includes(r)) this.bombs.push(r);
        }
    }

    startRazorDodgeball() {
        if (this.razorInterval) clearInterval(this.razorInterval);
        this.razorInterval = setInterval(() => {
            if (this.isLocked || this.scorePanel.timeLeft <= 0) return;
            
            // Shuffle 4 random unmatched cards
            const unmatched = [];
            this.cards.forEach((card, idx) => {
                if (!card.isMatched && !this.flippedIndices.includes(idx)) unmatched.push(idx);
            });

            if (unmatched.length > 4) {
                this.showInterferenceAlert('RAZOR: DODGEBALL!', 'A ball shuffled your cards!');
                this.audioEngine.playError();
                
                // pick 4 random indices
                for(let i=0; i<4; i++) {
                    const r = Math.floor(Math.random() * unmatched.length);
                    const idx1 = unmatched.splice(r, 1)[0];
                    const r2 = Math.floor(Math.random() * unmatched.length);
                    const idx2 = unmatched.splice(r2, 1)[0];
                    
                    // swap in this.cards array
                    [this.cards[idx1], this.cards[idx2]] = [this.cards[idx2], this.cards[idx1]];
                    
                    this.cardGrid.updateCardSymbol(idx1, this.cards[idx1].symbol);
                    this.cardGrid.updateCardSymbol(idx2, this.cards[idx2].symbol);
                }
            }
        }, 20000); // Every 20 seconds
    }

    generateDeck() {
        let deck = [];
        SYMBOLS.forEach(symbol => {
            deck.push({ symbol: symbol, isMatched: false });
            deck.push({ symbol: symbol, isMatched: false });
        });

        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }
        return deck;
    }

    handleCardClick(index) {
        if (this.isLocked) return;
        if (this.flippedIndices.includes(index)) return;

        this.audioEngine.playFlip();

        if (this.bombs && this.bombs.includes(index)) {
            this.audioEngine.playError();
            this.showInterferenceAlert('LITTLE FLOWER!', 'Genthru detonated a bomb! -5s');
            this.scorePanel.addTime(-5);
            this.bombs = this.bombs.filter(b => b !== index);
        }

        this.cardGrid.flipCard(index);
        this.flippedIndices.push(index);

        if (this.flippedIndices.length === 1) {
            const probs = this.probEngine.calculateProbabilities(this.cards, index, this.flippedIndices);
            this.probOverlay.update(probs, index);
        } else if (this.flippedIndices.length === 2) {
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
            card1.isMatched = true;
            card2.isMatched = true;
            this.cardGrid.markMatched(index1, index2);
            this.scorePanel.incrementPairs();
            this.interferenceMgr.recordMatch();
            
            this.audioEngine.playMatch();
            this.spellManager.addPoints(10); // Gain 10 NP per match

            this.flippedIndices = [];
            this.isLocked = false;

            if (this.scorePanel.pairs === this.scorePanel.totalPairs) {
                this.handleWin();
            }
        } else {
            this.spellManager.resetCombo();
            this.cardGrid.unflipCards(index1, index2);
            const triggered = this.interferenceMgr.recordMismatch();
            
            this.audioEngine.playMismatch();

            setTimeout(() => {
                this.flippedIndices = [];
                this.isLocked = false;

                if (triggered) {
                    this.audioEngine.playError();
                    this.showInterferenceAlert('BUNGEE GUM INTERFERENCE!', 'A pair was detached!');
                    this.interferenceMgr.triggerInterference(this.cards, this.cardGrid, this.scorePanel);
                }
            }, 1000);
        }
    }

    showInterferenceAlert(title, desc) {
        this.alertEl.querySelector('h3').textContent = title;
        this.alertEl.querySelector('p').textContent = desc;
        this.alertEl.classList.remove('hidden');
        setTimeout(() => {
            this.alertEl.classList.add('hidden');
        }, 2000);
    }

    handleTimeUp() {
        this.isLocked = true;
        this.audioEngine.playLose();
        this.showGameOverScreen(false);
    }

    handleWin() {
        this.scorePanel.stop();
        this.isLocked = true;
        if (this.razorInterval) clearInterval(this.razorInterval);

        if (this.currentStageIndex < STAGES.length - 1) {
            this.audioEngine.playWin();
            this.currentStageIndex++;
            this.showGameOverScreen(true, true);
        } else {
            this.audioEngine.playWin();
            this.showGameOverScreen(true, false);
            // Signal full win to hub
            setTimeout(() => {
                this.cleanup();
                if (this.onExit) this.onExit(true);
            }, 5000);
        }
    }

    showGameOverScreen(isWin, hasNextStage = false) {
        const titleEl = document.getElementById('game-result-title');
        const descEl = document.getElementById('game-result-desc');
        const finalTimeEl = document.getElementById('final-time');
        const finalMovesEl = document.getElementById('final-moves');

        const stats = this.scorePanel.getStats();

        if (isWin) {
            if (hasNextStage) {
                titleEl.textContent = 'STAGE CLEAR!';
                descEl.textContent = `You survived ${STAGES[this.currentStageIndex-1].boss}! Get ready for the next stage.`;
                this.restartBtn.textContent = 'NEXT STAGE';
            } else {
                titleEl.textContent = 'GAME CLEARED!';
                descEl.textContent = 'You have beaten Greed Island!';
                this.restartBtn.textContent = 'PLAY AGAIN';
                this.currentStageIndex = 0; // Reset
            }
            this.gameOverScreen.querySelector('.modal-content').classList.remove('lose');
        } else {
            titleEl.textContent = 'YOU DIED.';
            descEl.textContent = `Defeated by ${STAGES[this.currentStageIndex].boss}.`;
            this.gameOverScreen.querySelector('.modal-content').classList.add('lose');
            this.restartBtn.textContent = 'TRY AGAIN';
            this.currentStageIndex = 0; // Reset
        }

        finalTimeEl.textContent = `${stats.timeElapsed}s`;
        finalMovesEl.textContent = stats.moves;

        this.gameOverScreen.classList.remove('hidden');
    }
}


