/**
* Pathfinding System
* Implements Dijkstra's algorithm for finding the cheapest path between two nodes in the trade network.
* Caches results for efficiency, with a simple invalidation strategy when the network changes.
*/

import { PriorityQueue } from '../utils/PriorityQueue.js';

export class PathfindingSystem {
    constructor(engine) {
        this.engine = engine;
        this.pathCache = new Map(); 
    }

    clearCache() {
        this.pathCache.clear();
    }

    findCheapestPath(startId, endId) {
        const cacheKey = `${startId}->${endId}`;
        if (this.pathCache.has(cacheKey)) {
            return this.pathCache.get(cacheKey);
        }

        const distances = new Map();
        const previous = new Map();
        const pq = new PriorityQueue();

        this.engine.network.forEach((_, nodeId) => {
            distances.set(nodeId, Infinity);
            previous.set(nodeId, null);
        });

        distances.set(startId, 0);
        pq.enqueue(startId, 0);

        while (!pq.isEmpty()) {
            const { val: currentNode } = pq.dequeue();

            if (currentNode === endId) {
                const path = [];
                let curr = endId;
                while (curr) {
                    path.push(curr);
                    curr = previous.get(curr);
                }
                const result = { 
                    path: path.reverse(), 
                    totalDistance: distances.get(endId) 
                };
                
                this.pathCache.set(cacheKey, result); // Cache exact route
                return result;
            }

            const neighbors = this.engine.network.get(currentNode) || [];
            for (const neighbor of neighbors) {
                const alt = distances.get(currentNode) + neighbor.distance;
                if (alt < distances.get(neighbor.targetId)) {
                    distances.set(neighbor.targetId, alt);
                    previous.set(neighbor.targetId, currentNode);
                    pq.enqueue(neighbor.targetId, alt); // O(log n) enqueue
                }
            }
        }

        const fallback = { path: [], totalDistance: Infinity };
        this.pathCache.set(cacheKey, fallback);
        return fallback;
    }
}