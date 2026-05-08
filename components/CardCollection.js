export class CardCollection {
    constructor() {
        this.load();
    }

    load() {
        try {
            const data = localStorage.getItem('hxh_collection');
            this.collected = data ? JSON.parse(data) : [];
        } catch (e) {
            this.collected = [];
        }
    }

    save() {
        try {
            localStorage.setItem('hxh_collection', JSON.stringify(this.collected));
        } catch (e) {}
    }

    hasCard(cardId) {
        return this.collected.includes(cardId);
    }

    addCard(cardId) {
        if (!this.hasCard(cardId)) {
            this.collected.push(cardId);
            this.save();
        }
    }

    getCount() {
        return this.collected.length;
    }

    // All 3 collectable cards
    static CARDS = {
        matcher: {
            id: 'card_book',
            number: '#00',
            symbol: '📖',
            name: 'BOOK',
            quote: '"The game begins. Your fate is now tied to this island." — Ging Freecss'
        },
        jajanken: {
            id: 'card_wild_luck',
            number: '#32',
            symbol: '🍀',
            name: 'WILD LUCK ALEXANDRITE',
            quote: '"I\'ve never lost at Jajanken!" — Gon Freecss'
        },
        reflex: {
            id: 'card_rulers_blessing',
            number: '#83',
            symbol: '⚡',
            name: "RULER'S BLESSING",
            quote: '"I\'ll show you what a real kill looks like." — Killua Zoldyck'
        }
    };
}
