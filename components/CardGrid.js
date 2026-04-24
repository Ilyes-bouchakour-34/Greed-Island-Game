export class CardGrid {
    constructor(containerId, onCardClick) {
        this.container = document.getElementById(containerId);
        this.onCardClick = onCardClick;
        this.cards = [];
        this.elements = [];
    }

    render(cards) {
        this.cards = cards;
        this.container.innerHTML = '';
        this.elements = [];

        cards.forEach((card, index) => {
            const cardEl = document.createElement('div');
            cardEl.className = 'card';
            cardEl.dataset.index = index;

            const cardFront = document.createElement('div');
            cardFront.className = 'card-face card-front';
            
            
            const probOverlay = document.createElement('div');
            probOverlay.className = 'prob-overlay';
            probOverlay.id = `prob-${index}`;
            probOverlay.style.display = 'none'; 
            cardFront.appendChild(probOverlay);

            const cardBack = document.createElement('div');
            cardBack.className = 'card-face card-back';
            cardBack.textContent = card.symbol; 

            cardEl.appendChild(cardFront);
            cardEl.appendChild(cardBack);

            cardEl.addEventListener('click', () => {
                if (!cardEl.classList.contains('flipped') && !cardEl.classList.contains('matched')) {
                    this.onCardClick(index);
                }
            });

            this.container.appendChild(cardEl);
            this.elements.push(cardEl);
        });
    }

    flipCard(index) {
        if (this.elements[index]) {
            this.elements[index].classList.add('flipped');
        }
    }

    unflipCards(index1, index2) {
        setTimeout(() => {
            if (this.elements[index1]) this.elements[index1].classList.remove('flipped');
            if (this.elements[index2]) this.elements[index2].classList.remove('flipped');
        }, 1000);
    }

    unflipCardImmediate(index) {
        if (this.elements[index]) {
            this.elements[index].classList.remove('flipped');
            this.elements[index].classList.remove('matched');
            
            this.elements[index].classList.add('nen-effect');
            setTimeout(() => {
                this.elements[index].classList.remove('nen-effect');
            }, 500);
        }
    }

    markMatched(index1, index2) {
        setTimeout(() => {
            if (this.elements[index1]) this.elements[index1].classList.add('matched');
            if (this.elements[index2]) this.elements[index2].classList.add('matched');
        }, 500);
    }
}
