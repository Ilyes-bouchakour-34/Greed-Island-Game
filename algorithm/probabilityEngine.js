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

        // Count how many cards are left unrevealed/unmatched
        cards.forEach((c, idx) => {
            if (!c.isMatched && !flippedIndices.includes(idx)) {
                remainingUnmatched++;
            }
        });

        // Base probability if we just guess blindly
        const baseProb = remainingUnmatched > 0 ? (1 / remainingUnmatched) * 100 : 0;

        cards.forEach((card, index) => {
            // Skip already matched cards and currently flipped cards
            if (card.isMatched || flippedIndices.includes(index)) {
                return;
            }

            let prob = baseProb;

            // Pattern Detection: "Adjacent cards share aura. +20%"
            if (this.patternDetector.isAdjacent(activeIndex, index)) {
                prob += 20;
            }

            // Hisoka's Distortion: Add random noise (-10% to +10%)
            const distortion = (Math.random() * 20) - 10;
            prob += distortion;

            // Cap between 0 and 100
            prob = Math.max(0, Math.min(100, prob));

            probs[index] = prob;
        });

        // If by some logic (like memory) the exact match is known, the probability would be 100%, 
        // but since the player doesn't know, we only show statistical probability.
        // However, to make it fun, if the exact matching card is adjacent, we give it a massive boost occasionally.
        
        // Find the actual pair to apply a slight subtle "truth" distortion
        const pairIndex = cards.findIndex((c, i) => i !== activeIndex && c.symbol === activeCard.symbol);
        if (pairIndex !== -1 && !cards[pairIndex].isMatched && !flippedIndices.includes(pairIndex)) {
            // The real card has a slightly higher base chance naturally to reward players who follow high numbers
            probs[pairIndex] += 15;
            probs[pairIndex] = Math.max(0, Math.min(100, probs[pairIndex]));
        }

        return probs;
    }
}
