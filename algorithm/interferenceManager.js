export class InterferenceManager {
    constructor() {
        this.consecutiveMismatches = 0;
        this.threshold = 3;
    }

    recordMatch() {
        this.consecutiveMismatches = 0; 
    }

    recordMismatch() {
        this.consecutiveMismatches++;
        return this.consecutiveMismatches >= this.threshold;
    }

    reset() {
        this.consecutiveMismatches = 0;
    }

    /**
     * Executes the interference: randomly unflipping a matched pair
     * @param {Array} cards - The array of card objects
     * @param {Object} cardGrid - The UI grid component to trigger visual unflip
     * @param {Object} scorePanel - The score panel to decrement pair count
     * @returns {boolean} True if interference occurred
     */
    triggerInterference(cards, cardGrid, scorePanel) {
        this.consecutiveMismatches = 0; 

        
        const matchedIndices = [];
        cards.forEach((card, index) => {
            if (card.isMatched) {
                matchedIndices.push(index);
            }
        });

        if (matchedIndices.length === 0) return false;

        
        const randomIndex = matchedIndices[Math.floor(Math.random() * matchedIndices.length)];
        const targetSymbol = cards[randomIndex].symbol;

        
        let unflippedCount = 0;
        cards.forEach((card, index) => {
            if (card.symbol === targetSymbol && card.isMatched) {
                card.isMatched = false;
                cardGrid.unflipCardImmediate(index);
                unflippedCount++;
            }
        });

        if (unflippedCount > 0) {
            scorePanel.decrementPairs();
            return true;
        }

        return false;
    }
}
