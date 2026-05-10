/**
 * Demographics
 * Holds population counts for any registered population types.
 * Generic — doesn't know what "peasants" or "elves" mean; that's the game layer's job.
 */
export class Demographics {
    /**
     * @param {Object} popCounts - e.g. { peasants: 5000, burghers: 500, nobles: 50 }
     */
    constructor(popCounts) {
        Object.assign(this, popCounts);
    }

    getTotal() {
        return Object.values(this).reduce((sum, v) => sum + (typeof v === 'number' ? v : 0), 0);
    }

    toJSON() {
        return { ...this };
    }

    static fromJSON(data) {
        return new Demographics(data);
    }
}