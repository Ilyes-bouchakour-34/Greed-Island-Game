import { AudioEngine } from './utils/audioEngine.js';
import { MatcherGame } from './games/MatcherGame.js';
import { JajankenGame } from './games/JajankenGame.js';
import { ReflexGame } from './games/ReflexGame.js';

class HubOrchestrator {
    constructor() {
        this.audioEngine = new AudioEngine();
        
        this.mainMenu = document.getElementById('main-menu');
        
        // Initialize Games
        this.matcherGame = new MatcherGame(this.audioEngine, () => this.showMenu());
        this.jajankenGame = new JajankenGame(this.audioEngine, () => this.showMenu());
        this.reflexGame = new ReflexGame(this.audioEngine, () => this.showMenu());
        
        this.initListeners();
    }
    
    initListeners() {
        document.getElementById('btn-matcher').addEventListener('click', () => {
            this.startGame(this.matcherGame);
        });
        
        document.getElementById('btn-jajanken').addEventListener('click', () => {
            this.startGame(this.jajankenGame);
        });
        
        document.getElementById('btn-reflex').addEventListener('click', () => {
            this.startGame(this.reflexGame);
        });
        
        // Ensure Audio context
        document.body.addEventListener('click', () => {
            if (this.audioEngine.ctx && this.audioEngine.ctx.state === 'suspended') {
                this.audioEngine.ctx.resume();
            }
        }, { once: true });
    }
    
    startGame(gameInstance) {
        this.audioEngine.playFlip();
        this.mainMenu.classList.add('hidden');
        gameInstance.start();
    }
    
    showMenu() {
        this.mainMenu.classList.remove('hidden');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new HubOrchestrator();
});
