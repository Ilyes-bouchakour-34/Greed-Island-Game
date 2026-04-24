export class PatternDetector {
    constructor(cols = 8, rows = 5) {
        this.cols = cols;
        this.rows = rows;
    }

    /**
     * Returns true if index2 is adjacent to index1 (horizontally, vertically, or diagonally)
     */
    isAdjacent(index1, index2) {
        const x1 = index1 % this.cols;
        const y1 = Math.floor(index1 / this.cols);
        
        const x2 = index2 % this.cols;
        const y2 = Math.floor(index2 / this.cols);

        
        const dx = Math.abs(x1 - x2);
        const dy = Math.abs(y1 - y2);

        return dx <= 1 && dy <= 1 && !(dx === 0 && dy === 0);
    }
}
