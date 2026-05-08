import { AudioEngine } from './utils/audioEngine.js';
import { MatcherGame } from './games/MatcherGame.js';
import { JajankenGame } from './games/JajankenGame.js';
import { ReflexGame } from './games/ReflexGame.js';
import { HunterLicense } from './components/HunterLicense.js';
import { WaterDivination } from './games/WaterDivination.js';

class HubOrchestrator {
    constructor() {
        this.audioEngine = new AudioEngine();
        this.license = new HunterLicense();
        
        this.mainMenu = document.getElementById('main-menu');
        this.bootScreen = document.getElementById('boot-screen');
        
        this.divination = new WaterDivination(this.audioEngine, (profile) => {
            this.license.save(profile);
            this.showMenu();
        });
        
        // Initialize Games
        this.matcherGame = new MatcherGame(this.audioEngine, () => this.showMenu());
        this.jajankenGame = new JajankenGame(this.audioEngine, () => this.showMenu());
        this.reflexGame = new ReflexGame(this.audioEngine, () => this.showMenu());
        
        this.initListeners();
        this.startBootSequence();
    }
    
    initListeners() {
        document.getElementById('btn-matcher').addEventListener('click', () => this.startGame(this.matcherGame));
        document.getElementById('btn-jajanken').addEventListener('click', () => this.startGame(this.jajankenGame));
        document.getElementById('btn-reflex').addEventListener('click', () => this.startGame(this.reflexGame));
        
        document.body.addEventListener('click', () => {
            if (this.audioEngine.ctx && this.audioEngine.ctx.state === 'suspended') {
                this.audioEngine.ctx.resume();
            }
        }, { once: true });
    }
    
    startBootSequence() {
        // Hide all
        this.mainMenu.classList.add('hidden');
        document.getElementById('game-container').classList.add('hidden');
        document.getElementById('jajanken-container').classList.add('hidden');
        document.getElementById('reflex-container').classList.add('hidden');
        document.getElementById('water-divination-container').classList.add('hidden');
        
        if (this.bootScreen) this.bootScreen.classList.remove('hidden');

        // Simulate Greed Island Console Boot
        setTimeout(() => {
            if (this.bootScreen) this.bootScreen.classList.add('hidden');
            
            if (this.license.hasLicense()) {
                this.showMenu();
            } else {
                this.divination.start();
            }
        }, 2500);
    }
    
    startGame(gameInstance) {
        this.audioEngine.playFlip();
        this.mainMenu.classList.add('hidden');
        gameInstance.start();
    }
    
    showMenu() {
        this.mainMenu.classList.remove('hidden');
        this.updateLicenseUI();
        
        // "Book" appear animation
        this.mainMenu.classList.remove('book-appear');
        void this.mainMenu.offsetWidth; // trigger reflow
        this.mainMenu.classList.add('book-appear');
        this.audioEngine.playTone(600, 'sine', 0.5, 0.1);
    }
    
    updateLicenseUI() {
        if (!this.license.hasLicense()) return;
        const lic = document.getElementById('license-display');
        if (!lic) return;
        
        lic.innerHTML = \`
            <div class="license-card" style="box-shadow: 0 0 20px \${this.license.getNenColor()}">
                <div class="license-header">HUNTER LICENSE</div>
                <div class="license-body">
                    <div class="license-name">\${this.license.profile.name}</div>
                    <div class="license-type" style="color:\${this.license.getNenColor()}">NEN: \${this.license.profile.nenType}</div>
                </div>
            </div>
        \`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new HubOrchestrator();
});
