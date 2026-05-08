import { AudioEngine } from './utils/audioEngine.js';
import { ParticleSystem } from './utils/particleSystem.js';
import { MatcherGame } from './games/MatcherGame.js';
import { JajankenGame } from './games/JajankenGame.js';
import { ReflexGame } from './games/ReflexGame.js';
import { HunterLicense } from './components/HunterLicense.js';
import { WaterDivination } from './games/WaterDivination.js';
import { CardCollection } from './components/CardCollection.js';

class HubOrchestrator {
    constructor() {
        this.audioEngine = new AudioEngine();
        this.particles = new ParticleSystem();
        this.license = new HunterLicense();
        this.collection = new CardCollection();

        this.mainMenu = document.getElementById('main-menu');
        this.bootScreen = document.getElementById('boot-screen');
        this.transitionOverlay = document.getElementById('transition-overlay');
        this.cardAwardScreen = document.getElementById('card-award-screen');

        this.divination = new WaterDivination(this.audioEngine, (profile) => {
            this.license.save(profile);
            this.particles.setNenColor(profile.nenColor);
            this.transitionTo(() => this.showMenu());
        });

        this.matcherGame  = new MatcherGame(this.audioEngine, (won) => this.handleGameEnd('matcher', won));
        this.jajankenGame = new JajankenGame(this.audioEngine, (won) => this.handleGameEnd('jajanken', won));
        this.reflexGame   = new ReflexGame(this.audioEngine, (won) => this.handleGameEnd('reflex', won));

        this.initListeners();
        this.startBootSequence();
    }

    initListeners() {
        document.getElementById('btn-matcher').addEventListener('click', () => this.launchGame(this.matcherGame));
        document.getElementById('btn-jajanken').addEventListener('click', () => this.launchGame(this.jajankenGame));
        document.getElementById('btn-reflex').addEventListener('click', () => this.launchGame(this.reflexGame));

        document.getElementById('btn-reset-license').addEventListener('click', () => {
            if (confirm('Reset your Hunter License and start over?')) {
                localStorage.removeItem('hxh_license');
                localStorage.removeItem('hxh_collection');
                localStorage.removeItem('hxh_scores');
                location.reload();
            }
        });

        document.getElementById('award-continue-btn').addEventListener('click', () => {
            this.cardAwardScreen.classList.add('hidden');
            this.transitionTo(() => this.showMenu());
        });

        // Resume AudioContext on first interaction
        document.body.addEventListener('click', () => {
            const ctx = this.audioEngine._getCtx();
            if (ctx && ctx.state === 'suspended') ctx.resume();
        }, { once: true });
    }

    startBootSequence() {
        // hide everything
        this.mainMenu.classList.add('hidden');
        document.getElementById('game-container').classList.add('hidden');
        document.getElementById('jajanken-container').classList.add('hidden');
        document.getElementById('reflex-container').classList.add('hidden');
        document.getElementById('water-divination-container').classList.add('hidden');
        this.cardAwardScreen.classList.add('hidden');

        // Step 1: Typewriter tagline
        const tagline = 'You have entered Greed Island.';
        const taglineEl = document.getElementById('boot-tagline');
        let charIdx = 0;
        const typeInterval = setInterval(() => {
            taglineEl.textContent += tagline[charIdx++];
            if (charIdx >= tagline.length) clearInterval(typeInterval);
        }, 55);

        // Step 2: Boot messages (HxH lore flavored)
        const lines = [
            { text: '> NEN SIGNATURE DETECTED', delay: 1600 },
            { text: '> AUTHENTICATING HUNTER LICENSE...', delay: 2200 },
            { text: '> CARD DATABASE [100 / 100] LOADED', delay: 2900 },
            { text: '> BUNGEE GUM PROTOCOL: ACTIVE', delay: 3500 },
            { text: '> GAME MASTER: GING FREECSS', delay: 4100 },
            { text: '> WELCOME, HUNTER. THE ISLAND AWAITS.', delay: 4700, special: true },
        ];

        const bootLinesEl = document.getElementById('boot-lines');
        const bootBar = document.getElementById('boot-bar');
        const bootBarLabel = document.getElementById('boot-bar-label');

        lines.forEach((item, i) => {
            setTimeout(() => {
                const line = document.createElement('div');
                line.className = item.special ? 'boot-line boot-line-final' : 'boot-line';
                line.textContent = item.text;
                bootLinesEl.appendChild(line);
                bootBar.style.width = `${((i + 1) / lines.length) * 100}%`;
                bootBarLabel.textContent = item.special ? 'READY' : `${Math.round(((i+1)/lines.length)*100)}%`;
            }, item.delay);
        });

        // Step 3: Transition out
        setTimeout(() => {
            this.bootScreen.classList.add('boot-fade-out');
            setTimeout(() => {
                this.bootScreen.classList.add('hidden');
                if (this.license.hasLicense()) {
                    this.particles.setNenColor(this.license.profile.nenColor || '#00ffaa');
                    this.transitionTo(() => this.showMenu());
                } else {
                    this.divination.start();
                }
            }, 700);
        }, 5800);
    }

    launchGame(gameInstance) {
        this.audioEngine.playFlip();
        this.transitionTo(() => {
            this.mainMenu.classList.add('hidden');
            gameInstance.start();
        });
    }

    handleGameEnd(gameKey, won) {
        if (won && !this.collection.hasCard(CardCollection.CARDS[gameKey].id)) {
            this.collection.addCard(CardCollection.CARDS[gameKey].id);
            this.saveBestScore(gameKey);
            this.showCardAward(gameKey);
        } else {
            this.saveBestScore(gameKey);
            this.transitionTo(() => this.showMenu());
        }
    }

    saveBestScore(gameKey) {
        // Called from games via onExit — scores tracked per-game
        try {
            const scores = JSON.parse(localStorage.getItem('hxh_scores') || '{}');
            // Games pass score data via a shared object — we just timestamp the win
            if (!scores[gameKey]) scores[gameKey] = { wins: 0 };
            scores[gameKey].wins++;
            localStorage.setItem('hxh_scores', JSON.stringify(scores));
        } catch (e) {}
    }

    showCardAward(gameKey) {
        const card = CardCollection.CARDS[gameKey];
        document.getElementById('award-card-number').textContent = card.number;
        document.getElementById('award-card-symbol').textContent = card.symbol;
        document.getElementById('award-card-name').textContent = card.name;
        document.getElementById('award-quote').textContent = card.quote;

        this.cardAwardScreen.classList.remove('hidden');
        this.audioEngine.playWin();
    }

    showMenu() {
        this.mainMenu.classList.remove('hidden');
        this.updateLicenseUI();
        this.updateCollectionUI();
        this.updateBestScores();

        this.mainMenu.classList.remove('book-appear');
        void this.mainMenu.offsetWidth;
        this.mainMenu.classList.add('book-appear');
    }

    transitionTo(callback) {
        this.transitionOverlay.classList.remove('hidden');
        this.transitionOverlay.classList.add('transition-in');

        setTimeout(() => {
            callback();
            this.transitionOverlay.classList.remove('transition-in');
            this.transitionOverlay.classList.add('transition-out');
            setTimeout(() => {
                this.transitionOverlay.classList.add('hidden');
                this.transitionOverlay.classList.remove('transition-out');
            }, 500);
        }, 400);
    }

    updateLicenseUI() {
        if (!this.license.hasLicense()) return;
        const lic = document.getElementById('license-display');
        if (!lic) return;
        const color = this.license.getNenColor();
        const p = this.license.profile;
        lic.innerHTML = `
            <div class="license-card" style="border-color:${color}; box-shadow: 0 0 25px ${color}44;">
                <div class="license-header">✦ OFFICIAL HUNTER LICENSE ✦</div>
                <div class="license-body">
                    <div class="license-name">${p.name}</div>
                    <div class="license-type" style="color:${color}">NEN TYPE: ${p.nenType.toUpperCase()}</div>
                    <div class="license-rank">RANK: ${this.getHunterRank()}</div>
                </div>
            </div>
        `;
    }

    getHunterRank() {
        const wins = this.collection.getCount();
        if (wins === 0) return '★☆☆ Novice Hunter';
        if (wins === 1) return '★★☆ Licensed Hunter';
        if (wins >= 2) return '★★★ Pro Hunter';
        return 'Unranked';
    }

    updateCollectionUI() {
        const el = document.getElementById('collection-display');
        if (!el) return;
        const total = Object.keys(CardCollection.CARDS).length;
        const owned = this.collection.getCount();
        el.innerHTML = `
            <div class="collection-label">SPECIFIED SLOT CARDS: ${owned} / ${total}</div>
            <div class="collection-cards">
                ${Object.values(CardCollection.CARDS).map(c => `
                    <div class="mini-card ${this.collection.hasCard(c.id) ? 'mini-card-owned' : 'mini-card-locked'}">
                        <span>${this.collection.hasCard(c.id) ? c.symbol : '🔒'}</span>
                        <small>${c.number}</small>
                    </div>
                `).join('')}
            </div>
        `;
    }

    updateBestScores() {
        try {
            const scores = JSON.parse(localStorage.getItem('hxh_scores') || '{}');
            ['matcher', 'jajanken', 'reflex'].forEach(key => {
                const el = document.getElementById(`best-${key}`);
                if (!el) return;
                const s = scores[key];
                if (s && s.wins > 0) {
                    el.textContent = `✓ Completed — ${s.wins} win${s.wins > 1 ? 's' : ''}`;
                    el.style.color = '#00ffaa';
                } else {
                    el.textContent = 'Not yet completed';
                    el.style.color = '#555';
                }
            });
        } catch (e) {}
    }
}

new HubOrchestrator();
window.appLoaded = true;
