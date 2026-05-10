/**
 * PriorityQueue — min-heap implementation
 *
 * Used for A* pathfinding and any time we need to process items in priority order.
 * Simple API: enqueue(val, priority), dequeue(), isEmpty().
 * Internally uses a binary heap for efficient insertions and removals.
 */
export class PriorityQueue {
    constructor() { this.values = []; }

    enqueue(val, priority) {
        this.values.push({ val, priority });
        this._bubbleUp();
    }

    dequeue() {
        const min = this.values[0];
        const end = this.values.pop();
        if (this.values.length > 0) {
            this.values[0] = end;
            this._sinkDown();
        }
        return min;
    }

    isEmpty() { return this.values.length === 0; }

    _bubbleUp() {
        let idx = this.values.length - 1;
        while (idx > 0) {
            const parent = Math.floor((idx - 1) / 2);
            if (this.values[parent].priority <= this.values[idx].priority) break;
            [this.values[parent], this.values[idx]] = [this.values[idx], this.values[parent]];
            idx = parent;
        }
    }

    _sinkDown() {
        let idx = 0;
        const len = this.values.length;
        while (true) {
            const left  = 2 * idx + 1;
            const right = 2 * idx + 2;
            let swap = null;

            if (left < len && this.values[left].priority < this.values[idx].priority) swap = left;
            if (right < len && this.values[right].priority < (swap === null ? this.values[idx].priority : this.values[left].priority)) swap = right;
            if (swap === null) break;
            [this.values[idx], this.values[swap]] = [this.values[swap], this.values[idx]];
            idx = swap;
        }
    }
}