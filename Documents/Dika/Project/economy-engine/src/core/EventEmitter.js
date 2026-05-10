/**
 * EventEmitter
 * The backbone of the plugin/event architecture.
 * Game layers subscribe to lifecycle hooks without modifying engine source.
 *
 * @example
 * engine.on('populationStarved', ({ settlement, starvationRate }) => {
 *     if (starvationRate > 0.5) spawnUndead(settlement.id);
 * });
 */
export class EventEmitter {
    constructor() {
        this._listeners = new Map();
    }

    on(event, callback, priority = 0) {
        if (!this._listeners.has(event)) this._listeners.set(event, []);
        this._listeners.get(event).push({ callback, priority });
        this._listeners.get(event).sort((a, b) => b.priority - a.priority);
        return this; 
    }

    off(event, callback) {
        if (!this._listeners.has(event)) return this;
        this._listeners.set(event, this._listeners.get(event).filter(cb => cb.callback !== callback));
        return this;
    }

    emit(event, data) {
        if (!this._listeners.has(event)) return data;
        let result = data;
        for (const { callback } of this._listeners.get(event)) {
            const returned = callback(result);
            if (returned === false) return false; // Cancel event pipeline
            if (returned !== undefined) result = returned; // State mutated
        }
        return result;
    }
}