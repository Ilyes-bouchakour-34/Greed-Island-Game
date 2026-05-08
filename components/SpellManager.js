export class SpellManager {
    constructor(audioEngine) {
        this.nenPoints = 0;
        this.maxNen = 100;
        this.audio = audioEngine;
        this.comboMultiplier = 1;

        this.pointsEl = document.getElementById('nen-points');
        this.barFillEl = document.getElementById('nen-bar-fill');
        this.spells = {
            accompany: { cost: 50, el: document.getElementById('spell-accompany') },
            magnetic: { cost: 40, el: document.getElementById('spell-magnetic') },
            thief: { cost: 30, el: document.getElementById('spell-thief') }
        };

        this.initListeners();
        this.updateUI();
    }

    initListeners() {
        this.spells.accompany.el.addEventListener('click', () => this.castAccompany());
        this.spells.magnetic.el.addEventListener('click', () => this.castMagnetic());
        this.spells.thief.el.addEventListener('click', () => this.castThief());
    }

    reset() {
        this.nenPoints = 0;
        this.comboMultiplier = 1;
        this.updateUI();
    }

    addPoints(baseAmount) {
        const added = baseAmount * this.comboMultiplier;
        this.nenPoints = Math.min(this.maxNen, this.nenPoints + added);
        this.comboMultiplier++; // Increase combo for next match
        this.updateUI();
    }

    resetCombo() {
        this.comboMultiplier = 1;
    }

    updateUI() {
        this.pointsEl.textContent = Math.floor(this.nenPoints);
        this.barFillEl.style.width = `${(this.nenPoints / this.maxNen) * 100}%`;

        for (const key in this.spells) {
            const spell = this.spells[key];
            if (this.nenPoints >= spell.cost) {
                spell.el.classList.add('available');
            } else {
                spell.el.classList.remove('available');
            }
        }
    }

    castAccompany() {
        if (this.nenPoints < this.spells.accompany.cost) return;
        this.nenPoints -= this.spells.accompany.cost;
        this.audio.playSpell();
        this.updateUI();
        if (this.onAccompany) this.onAccompany();
    }

    castMagnetic() {
        if (this.nenPoints < this.spells.magnetic.cost) return;
        this.nenPoints -= this.spells.magnetic.cost;
        this.audio.playSpell();
        this.updateUI();
        if (this.onMagnetic) this.onMagnetic();
    }

    castThief() {
        if (this.nenPoints < this.spells.thief.cost) return;
        this.nenPoints -= this.spells.thief.cost;
        this.audio.playSpell();
        this.updateUI();
        if (this.onThief) this.onThief();
    }
}
