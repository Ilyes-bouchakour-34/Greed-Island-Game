export class ProbabilityOverlay {
    constructor() {
        this.overlays = [];
    }

    init(totalCards) {
        this.overlays = [];
        for (let i = 0; i < totalCards; i++) {
            this.overlays.push(document.getElementById(`prob-${i}`));
        }
    }

    update(probabilities, activeCardIndex) {
        this.overlays.forEach((overlay, index) => {
            if (!overlay) return;

            
            if (activeCardIndex === index || probabilities[index] === -1) {
                overlay.style.display = 'none';
                return;
            }

            const prob = probabilities[index];
            if (prob !== null && activeCardIndex !== null) {
                overlay.textContent = `${Math.round(prob)}%`;
                overlay.style.display = 'block';

                
                overlay.classList.remove('prob-high', 'prob-low');
                if (prob >= 50) {
                    overlay.classList.add('prob-high');
                } else if (prob <= 10) {
                    overlay.classList.add('prob-low');
                }
            } else {
                
                overlay.style.display = 'none';
            }
        });
    }

    hideAll() {
        this.overlays.forEach(overlay => {
            if (overlay) overlay.style.display = 'none';
        });
    }
}
