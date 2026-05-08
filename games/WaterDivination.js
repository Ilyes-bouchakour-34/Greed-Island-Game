export class WaterDivination {
    constructor(audioEngine, onComplete) {
        this.container = document.getElementById('water-divination-container');
        this.audioEngine = audioEngine;
        this.onComplete = onComplete;

        this.questions = [
            {
                q: "You face an enemy blocking your path. What is your instinct?",
                a: [
                    { t: "Enhancer",    text: "Charge forward and break through with raw power." },
                    { t: "Transmuter",  text: "Transform your approach — use deception and misdirection." },
                    { t: "Emitter",     text: "Attack from a safe distance before they can react." }
                ]
            },
            {
                q: "What does being a Hunter mean to you?",
                a: [
                    { t: "Conjurer",    text: "Having the perfect tool for every situation." },
                    { t: "Manipulator", text: "The freedom to control your own destiny — and others'." },
                    { t: "Specialist",  text: "Pursuing a unique truth no one else can find." }
                ]
            },
            {
                q: "In Greed Island, which strategy do you choose?",
                a: [
                    { t: "Enhancer",    text: "Protect allies and grow stronger together." },
                    { t: "Transmuter",  text: "Play mind games and keep opponents guessing." },
                    { t: "Specialist",  text: "Do what nobody expects. Break every rule." }
                ]
            },
            {
                q: "Which Greed Island card would you covet most?",
                a: [
                    { t: "Conjurer",    text: "Sword of Truth — a blade that cuts through all illusions." },
                    { t: "Manipulator", text: "Accompany — controlling who travels with you." },
                    { t: "Emitter",     text: "Levy — blast anyone who crosses you off the island." }
                ]
            }
        ];

        this.currentQ = 0;
        this.scores = { Enhancer: 0, Transmuter: 0, Emitter: 0, Conjurer: 0, Manipulator: 0, Specialist: 0 };
        this.playerName = '';
        this.initDOM();
    }

    initDOM() {
        this.container.innerHTML = `
            <div class="divination-content">
                <div class="divination-header">
                    <h1 class="neon-text" style="font-size:1.8rem; letter-spacing:4px;">WATER DIVINATION</h1>
                    <p class="subtitle" style="margin-top:4px;">Focus your aura into the water...</p>
                </div>

                <!-- Name input step -->
                <div id="name-step" class="name-step">
                    <div class="water-glass" id="water-glass-pre">
                        <div class="water-level water-level-pre"></div>
                        <div class="leaf" id="leaf-pre">🍃</div>
                    </div>
                    <p style="color:#aaa; margin-bottom:16px;">Before the divination begins, state your name, Hunter.</p>
                    <input type="text" id="hunter-name-input" class="hunter-name-input" placeholder="Enter your Hunter name..." maxlength="20" autocomplete="off"/>
                    <button id="begin-divination-btn" class="glow-on-hover" style="margin-top:16px;">BEGIN DIVINATION</button>
                </div>

                <!-- Quiz step -->
                <div id="quiz-step" class="hidden">
                    <div class="water-glass" id="water-glass">
                        <div class="water-level"></div>
                        <div class="leaf" id="leaf">🍃</div>
                    </div>
                    <div class="quiz-progress">
                        <div class="quiz-progress-bar" id="quiz-progress-bar"></div>
                    </div>
                    <div class="quiz-area">
                        <h3 id="question-text"></h3>
                        <div id="answers-container" class="answers-container"></div>
                    </div>
                </div>

                <!-- Result step -->
                <div id="divination-result" class="hidden result-area">
                    <div class="water-glass" id="water-glass-result">
                        <div class="water-level" id="result-water-level"></div>
                        <div class="leaf" id="leaf-result">🍃</div>
                    </div>
                    <h2 id="nen-type-result"></h2>
                    <p id="nen-desc" style="color:#ccc; font-size:1rem; margin: 10px 0 20px; max-width:400px; text-align:center;"></p>
                    <button id="accept-license" class="glow-on-hover">✦ ACCEPT HUNTER LICENSE ✦</button>
                </div>
            </div>
        `;

        document.getElementById('begin-divination-btn').addEventListener('click', () => {
            const nameEl = document.getElementById('hunter-name-input');
            const name = nameEl.value.trim();
            if (!name) {
                nameEl.style.border = '2px solid #ff3366';
                nameEl.placeholder = 'You must provide a name!';
                return;
            }
            this.playerName = name;
            this.startQuiz();
        });

        document.getElementById('hunter-name-input').addEventListener('keydown', (e) => {
            if (e.key === 'Enter') document.getElementById('begin-divination-btn').click();
        });
    }

    start() {
        this.container.classList.remove('hidden');
        this.currentQ = 0;
        this.scores = { Enhancer: 0, Transmuter: 0, Emitter: 0, Conjurer: 0, Manipulator: 0, Specialist: 0 };
    }

    startQuiz() {
        document.getElementById('name-step').classList.add('hidden');
        document.getElementById('quiz-step').classList.remove('hidden');
        this.updateProgress();
        this.showQuestion();
    }

    updateProgress() {
        const pct = (this.currentQ / this.questions.length) * 100;
        document.getElementById('quiz-progress-bar').style.width = `${pct}%`;
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
        container.style.opacity = '0';

        // Animate in
        setTimeout(() => { container.style.transition = 'opacity 0.4s'; container.style.opacity = '1'; }, 50);

        q.a.forEach(ans => {
            const btn = document.createElement('button');
            btn.className = 'quiz-btn glow-on-hover';
            btn.textContent = ans.text;
            btn.onclick = () => {
                this.audioEngine.playFlip();
                this.scores[ans.t]++;
                this.currentQ++;
                this.updateProgress();
                container.style.opacity = '0';
                setTimeout(() => this.showQuestion(), 400);
            };
            container.appendChild(btn);
        });
    }

    revealNen() {
        document.getElementById('quiz-step').classList.add('hidden');
        document.getElementById('divination-result').classList.remove('hidden');

        let highest = 'Enhancer';
        let max = -1;
        for (const type in this.scores) {
            if (this.scores[type] > max) {
                max = this.scores[type];
                highest = type;
            }
        }
        if (max === 0) {
            const types = Object.keys(this.scores);
            highest = types[Math.floor(Math.random() * types.length)];
        }

        const colors = {
            'Enhancer': '#ffaa00', 'Transmuter': '#cc00ff', 'Emitter': '#ff3333',
            'Conjurer': '#00ffcc', 'Manipulator': '#aaaaaa', 'Specialist': '#0066ff'
        };
        const color = colors[highest];

        this.animateGlass(highest, color);
        this.audioEngine.playTone(400, 'sine', 3, 0.08);

        const resEl = document.getElementById('nen-type-result');
        resEl.textContent = `${this.playerName.toUpperCase()} — ${highest.toUpperCase()}`;
        resEl.style.color = color;
        resEl.style.textShadow = `0 0 20px ${color}`;
        resEl.style.fontFamily = "'Orbitron', sans-serif";
        resEl.style.fontSize = '1.6rem';

        const descs = {
            'Enhancer':    'The water volume surged! — You are straightforward, honest, and fiercely loyal. Like Gon, your strength comes from unwavering resolve.',
            'Transmuter':  'The water turned sweet! — Whimsical and deceptive, you change your nature at will. Like Killua, your potential is limitless.',
            'Emitter':     'The water changed color! — Volatile and impatient, you strike before others can think. Your energy knows no bounds.',
            'Conjurer':    'Impurities appeared! — Meticulous and high-strung, you create your perfect weapon through absolute discipline.',
            'Manipulator': 'The leaf moved on its own! — Calculating and methodical, you prefer logic over emotion. Everything follows your design.',
            'Specialist':  'The leaf withered! — Utterly unique and unpredictable. Like Kurapika, your power defies classification.'
        };
        document.getElementById('nen-desc').textContent = descs[highest];

        document.getElementById('accept-license').style.borderColor = color;
        document.getElementById('accept-license').style.boxShadow = `0 0 20px ${color}`;
        document.getElementById('accept-license').onclick = () => {
            this.audioEngine.playWin();
            this.container.classList.add('hidden');
            if (this.onComplete) this.onComplete({
                name: this.playerName,
                nenType: highest,
                nenColor: color
            });
        };
    }

    animateGlass(type, color) {
        const waterLevel = document.getElementById('result-water-level');
        const leaf = document.getElementById('leaf-result');
        waterLevel.style.backgroundColor = `${color}55`;
        waterLevel.style.boxShadow = `0 0 20px ${color}`;

        if (type === 'Enhancer') { waterLevel.style.height = '90%'; }
        else if (type === 'Transmuter') { waterLevel.style.backgroundColor = 'rgba(200, 0, 255, 0.5)'; }
        else if (type === 'Emitter') { waterLevel.style.backgroundColor = 'rgba(255, 50, 50, 0.5)'; }
        else if (type === 'Conjurer') { leaf.textContent = '🍂'; }
        else if (type === 'Manipulator') { leaf.style.animation = 'spin 2s infinite linear'; }
        else if (type === 'Specialist') { leaf.style.opacity = '0.15'; leaf.style.filter = 'grayscale(100%)'; }
    }
}
