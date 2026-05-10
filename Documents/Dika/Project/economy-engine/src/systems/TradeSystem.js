/**
* Trade System
* Manages the execution of trade operations between settlements based on price differentials and transport costs.
*/

import { Caravan } from '../models/Caravan.js';

export class TradeSystem {
    constructor(engine, pathfindingSystem) {
        this.engine = engine;
        this.pathfinder = pathfindingSystem;
    }

    update() {
        const registry = this.engine.registry;
        const settlements = Array.from(this.engine.settlements.values());

        for (const source of settlements) {
            for (const target of settlements) {
                if (source.id === target.id) continue;

                registry.commodities.forEach((commodity, commodityId) => {
                    const sourcePrice = source.prices[commodityId] || 0;
                    const targetPrice = target.prices[commodityId] || 0;
                    
                    const priceDiff = targetPrice - sourcePrice;
                    if (priceDiff <= 0) return; 

                    const pathData = this.pathfinder.findCheapestPath(source.id, target.id);
                    if (pathData.totalDistance === Infinity) return; 

                    const transportCost = pathData.totalDistance * this.engine.caravanCostPerDistance * commodity.weight;
                    const profitMargin = priceDiff - transportCost;

                    if (profitMargin > 0) {
                        const available = source.inventory[commodityId] || 0;
                        const tradeVolume = Math.floor(available * 0.1 * commodity.elasticity); 

                        if (tradeVolume > 0) {
                            source.inventory[commodityId] -= tradeVolume;
                            
                            const caravanId = `cvn_${source.id}_${target.id}_${Date.now()}_${Math.floor(this.engine.rng.next() * 1000)}`;
                            
                            const caravan = new Caravan(
                                caravanId, source.id, target.id, commodityId, tradeVolume, profitMargin, pathData.totalDistance
                            );
                            this.engine.caravans.add(caravan);

                            this.engine.emit('caravanDeparted', { source, target, commodityId, amount: tradeVolume });
                        }
                    }
                });
            }
        }
    }
}