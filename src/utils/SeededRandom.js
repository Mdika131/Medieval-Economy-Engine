/**
 * SeededRandom — mulberry32 PRNG
 * Given the same seed, produces identical output every run.
 * Essential for multiplayer sync, replay systems, and AI testing.
 */
export class SeededRandom {
    constructor(seed = 42) {
        this.seed = seed >>> 0;
    }

    next() {
        let t = (this.seed += 0x6D2B79F5);
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }

    /** Float in [min, max) */
    range(min, max) {
        return min + this.next() * (max - min);
    }

    /** Integer in [min, max] */
    intRange(min, max) {
        return Math.floor(this.range(min, max + 1));
    }
}