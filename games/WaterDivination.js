export class WaterDivination {
    constructor(audioEngine, onComplete) {
        this.container = document.getElementById('water-divination-container');
        this.audioEngine = audioEngine;
        this.onComplete = onComplete;
        
        this.questions = [
            { q: "You are blocked by an immovable wall. What do you do?", a: [
                { t: "Enhancer", text: "Punch through it with all my might." },
                { t: "Transmuter", text: "Find a way to bypass or deceive it." },
                { t: "Emitter", text: "Blast it from a distance." }
            ]},
            { q: "In a fight, what is your priority?", a: [
                { t: "Conjurer", text: "Analyze and use a specific tool to win." },
                { t: "Manipulator", text: "Control the environment and the opponent." },
                { t: "Specialist", text: "Use an unpredictable, unique method." }
            ]},
            { q: "What drives you as a Hunter?", a: [
                { t: "Enhancer", text: "Protecting friends and getting stronger." },
                { t: "Transmuter", text: "Satisfying my own curiosity and desires." },
                { t: "Specialist", text: "Discovering the ultimate unknown truth." }
            ]}
        ];
        this.currentQ = 0;
        this.scores = { Enhancer: 0, Transmuter: 0, Emitter: 0, Conjurer: 0, Manipulator: 0, Specialist: 0 };
        
        this.initDOM();
    }

    initDOM() {
        this.container.innerHTML = `
            <div class="divination-content">
                <h1 class="neon-text">WATER DIVINATION</h1>
                <p class="subtitle">Focus your aura into the glass...</p>
                <div class="water-glass" id="water-glass">
                    <div class="water-level"></div>
                    <div class="leaf" id="leaf">🍃</div>
                </div>
                <div id="quiz-area" class="quiz-area">
                    <h3 id="question-text"></h3>
                    <div id="answers-container" class="answers-container"></div>
                </div>
                <div id="divination-result" class="hidden result-area">
                    <h2 id="nen-type-result"></h2>
                    <p id="nen-desc"></p>
                    <button id="accept-license" class="glow-on-hover">ACCEPT HUNTER LICENSE</button>
                </div>
            </div>
        `;
    }

    start() {
        this.container.classList.remove('hidden');
        this.currentQ = 0;
        this.scores = { Enhancer: 0, Transmuter: 0, Emitter: 0, Conjurer: 0, Manipulator: 0, Specialist: 0 };
        this.showQuestion();
        this.audioEngine.playTone(300, 'sine', 2, 0.05); // Mysterious hum
    }

    showQuestion() {
        if (this.currentQ >= this.questions.length) {
            this.revealNen();
            return;
        }

        const q = this.questions[this.currentQ];
        document.getElementById('question-text').textContent = q.q;
        
        const container = document.getElementById('answers-container');
        container.innerHTML = '';
        
        q.a.forEach(ans => {
            const btn = document.createElement('button');
            btn.className = 'quiz-btn glow-on-hover';
            btn.textContent = ans.text;
            btn.onclick = () => {
                this.audioEngine.playFlip();
                this.scores[ans.t]++;
                this.currentQ++;
                this.showQuestion();
            };
            container.appendChild(btn);
        });
    }

    revealNen() {
        document.getElementById('quiz-area').classList.add('hidden');
        this.audioEngine.playTone(400, 'sine', 3, 0.1);
        
        let highest = 'Enhancer';
        let max = -1;
        for (const type in this.scores) {
            if (this.scores[type] > max) {
                max = this.scores[type];
                highest = type;
            }
        }
        
        // Random fallback to make it interesting if tied
        if (max === 0) {
            const types = Object.keys(this.scores);
            highest = types[Math.floor(Math.random() * types.length)];
        }

        this.animateGlass(highest);

        setTimeout(() => {
            document.getElementById('divination-result').classList.remove('hidden');
            const resEl = document.getElementById('nen-type-result');
            resEl.textContent = \`NEN TYPE: \${highest.toUpperCase()}\`;
            
            // Set Color
            const colors = {
                'Enhancer': '#ffaa00', 'Transmuter': '#cc00ff', 'Emitter': '#ff3333',
                'Conjurer': '#00ffcc', 'Manipulator': '#aaaaaa', 'Specialist': '#0033ff'
            };
            resEl.style.color = colors[highest];
            resEl.style.textShadow = \`0 0 15px \${colors[highest]}\`;

            const descs = {
                'Enhancer': 'The water volume increased! You are straightforward and honest.',
                'Transmuter': 'The water tastes sweet! You are whimsical and prone to deceit.',
                'Emitter': 'The water color changed! You are impatient and volatile.',
                'Conjurer': 'Impurities appeared in the water! You are high-strung and observant.',
                'Manipulator': 'The leaf moved! You are logical and do things at your own pace.',
                'Specialist': 'The leaf withered! You are independent and charismatic.'
            };
            document.getElementById('nen-desc').textContent = descs[highest];

            document.getElementById('accept-license').onclick = () => {
                this.audioEngine.playWin();
                this.container.classList.add('hidden');
                if (this.onComplete) this.onComplete({
                    name: 'Hunter ' + Math.floor(Math.random() * 9999),
                    nenType: highest,
                    stars: 1
                });
            };
        }, 3000);
    }

    animateGlass(type) {
        const glass = document.getElementById('water-glass');
        const leaf = document.getElementById('leaf');
        
        glass.classList.add('aura-burst');
        
        if (type === 'Enhancer') {
            glass.querySelector('.water-level').style.transform = 'scaleY(1.5)';
        } else if (type === 'Transmuter') {
            glass.querySelector('.water-level').style.backgroundColor = 'rgba(255, 0, 255, 0.5)';
        } else if (type === 'Emitter') {
            glass.querySelector('.water-level').style.backgroundColor = 'rgba(255, 0, 0, 0.5)';
        } else if (type === 'Conjurer') {
            leaf.textContent = '🍂 (Impurities)';
        } else if (type === 'Manipulator') {
            leaf.style.animation = 'spin 1s infinite linear';
        } else if (type === 'Specialist') {
            leaf.style.opacity = '0.2';
            leaf.style.filter = 'grayscale(100%)';
        }
    }
}
