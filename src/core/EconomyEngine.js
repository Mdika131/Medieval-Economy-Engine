/**
* Economy Engine
* A modular, event-driven economic simulation framework for settlement management and trade.
* Features a dynamic registry for goods and recipes, a flexible settlement model, and a clean separation of concerns through systems.
* Designed for extensibility and ease of integration with various game mechanics.
*/
import { EventEmitter } from './EventEmitter.js';
import { Registry } from './Registry.js';
import { SeededRandom } from '../utils/SeededRandom.js';
import { TradeRoute } from '../models/Settlement.js';
import { ProductionSystem } from '../systems/ProductionSystem.js';
import { ConsumptionSystem } from '../systems/ConsumptionSystem.js';
import { PathfindingSystem } from '../systems/PathfindingSystem.js';
import { TradeSystem } from '../systems/TradeSystem.js';
import { CaravanSystem } from '../systems/CaravanSystem.js';
import { MigrationSystem } from '../systems/MigrationSystem.js';

export class EconomyEngine extends EventEmitter {
    constructor({ seed = 42, caravanCostPerDistance = 0.5, maxTradeRange = 500 } = {}) {
        super();
        this.registry = new Registry();
        this.settlements = new Map();
        this.network = new Map();
        this.rng = new SeededRandom(seed);
        this.caravans = new Set();
        
        this.globalClimateModifier = 1.0;
        this.caravanCostPerDistance = caravanCostPerDistance;
        this.maxTradeRange = maxTradeRange; // Stored config
        this.year = 0;
        this._accumulatedTime = 0;

        // The Modular Systems Array
        const pathfinder = new PathfindingSystem(this);
        this.systems = [
            new ProductionSystem(this),
            new TradeSystem(this, pathfinder),
            new CaravanSystem(this),
            new ConsumptionSystem(this),
            new MigrationSystem(this)
        ];
    }

    addSettlement(settlement) {
        this.settlements.set(settlement.id, settlement);
        this.network.set(settlement.id, []);
        this.emit('topologyChanged'); 
        return this;
    }

    addRoad(idA, idB, distance) {
        if (this.network.has(idA) && this.network.has(idB)) {
            this.network.get(idA).push(new TradeRoute(idB, distance));
            this.network.get(idB).push(new TradeRoute(idA, distance));
            this.emit('topologyChanged'); 
        }
        return this;
    }

    tick(deltaTime = 1) {
        this._accumulatedTime += deltaTime;
        while (this._accumulatedTime >= 1) {
            this.year++;
            this.emit('yearStart', { engine: this, year: this.year });
            
            // Loop through systems in defined order
            for (const system of this.systems) {
                system.update(this.globalClimateModifier);
            }
            
            this.emit('yearEnd', { engine: this, year: this.year });
            this._accumulatedTime -= 1;
        }
    }
    
    // Export the current state of the engine for saving or debugging
    exportState() {
        return {
            year: this.year,
            climate: this.globalClimateModifier,
            rngSeed: this.rng.seed,
            settlements: Array.from(this.settlements.values()).map(s => s.toJSON()),
            caravans: Array.from(this.caravans).map(c => c.toJSON())
        };
    }
}