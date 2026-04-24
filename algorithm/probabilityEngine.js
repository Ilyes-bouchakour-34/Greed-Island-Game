import { PatternDetector } from './patternDetector.js';

export class ProbabilityEngine {
    constructor(totalPairs = 20) {
        this.patternDetector = new PatternDetector();
        this.totalPairs = totalPairs;
    }

    /**
     * Calculates the probability of each unrevealed card matching the active card.
     * @param {Array} cards - The array of all cards {symbol, isMatched}
     * @param {number} activeIndex - Index of the currently flipped card
     * @param {Array} flippedIndices - Indices of cards currently flipped (max 2)
     * @returns {Array} Array of probabilities (0-100) or -1 for hidden/matched cards
     */
    calculateProbabilities(cards, activeIndex, flippedIndices) {
        const probs = new Array(cards.length).fill(-1);
        
        if (activeIndex === null) return probs;

        const activeCard = cards[activeIndex];
        let remainingUnmatched = 0;
        let matchFound = false;

        
        cards.forEach((c, idx) => {
            if (!c.isMatched && !flippedIndices.includes(idx)) {
                remainingUnmatched++;
            }
        });

        
        const baseProb = remainingUnmatched > 0 ? (1 / remainingUnmatched) * 100 : 0;

        cards.forEach((card, index) => {
            
            if (card.isMatched || flippedIndices.includes(index)) {
                return;
            }

            let prob = baseProb;

            
            if (this.patternDetector.isAdjacent(activeIndex, index)) {
                prob += 20;
            }

            
            const distortion = (Math.random() * 20) - 10;
            prob += distortion;

            
            prob = Math.max(0, Math.min(100, prob));

            probs[index] = prob;
        });

        
        
        
        
        
        const pairIndex = cards.findIndex((c, i) => i !== activeIndex && c.symbol === activeCard.symbol);
        if (pairIndex !== -1 && !cards[pairIndex].isMatched && !flippedIndices.includes(pairIndex)) {
            
            probs[pairIndex] += 15;
            probs[pairIndex] = Math.max(0, Math.min(100, probs[pairIndex]));
        }

        return probs;
    }
}
