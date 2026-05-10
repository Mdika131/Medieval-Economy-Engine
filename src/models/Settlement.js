/**
 * Settlement
 * A single node in the trade network. Produces, consumes, stores, and prices goods.
 * Holds a reference to the engine so it reads from the live registry (supports hot-reloading).
 */
import { Demographics } from './Demographics.js';

export class Settlement {
    constructor(id, demographics, resourceNodes, registry) {
        this.id = id;
        this.demographics = new Demographics(demographics);
        
        this.resourceNodes = {};
        if (resourceNodes) {
            Object.keys(resourceNodes).forEach(k => {
                this.resourceNodes[k.toLowerCase()] = resourceNodes[k];
            });
        }

        this.inventory = {};
        this.prices = {};

        if (registry) {
            registry.commodities.forEach((commodity, id) => {
                this.inventory[id] = 0;
                this.prices[id] = commodity.basePrice;
            });
        }

        this.devastation = 0;   
        this.wealth = 1000; 
        this.tradeCache = { validTargets: null };
    }

    collectTaxes(taxRate = 0.1) {
        let revenue = ((this.demographics.peasants || 0) / 1000) * 1;
        const clothPrice = this.prices.cloth || 0;
        if (clothPrice) revenue += ((this.demographics.burghers || 0) / 100) * clothPrice;
        return revenue;
    }

    toJSON() {
        return {
            id: this.id,
            demographics: this.demographics.toJSON(),
            resourceNodes: { ...this.resourceNodes },
            inventory: { ...this.inventory },
            prices: { ...this.prices },
            devastation: this.devastation,
            wealth: this.wealth
        };
    }

    static fromJSON(data, registry) {
        const s = new Settlement(data.id, data.demographics, data.resourceNodes, registry);
        Object.assign(s.inventory, data.inventory);
        Object.assign(s.prices, data.prices);
        s.devastation = data.devastation;
        s.wealth = data.wealth;
        return s;
    }
}

export class TradeRoute {
    constructor(targetId, distance) {
        this.targetId = targetId;
        this.distance = distance;
    }
}