/**
* Trade System
* Manages the execution of trade operations between settlements based on price differentials and transport costs.
*/
import { Caravan } from '../models/Caravan.js';

export class TradeSystem {
    constructor(engine, pathfindingSystem) {
        this.engine = engine;
        this.pathfinder = pathfindingSystem;
        this.needsCacheRebuild = true;

        // Listen for additions of settlements or roads
        this.engine.on('topologyChanged', () => {
            this.needsCacheRebuild = true;
        });
    }

    rebuildCache() {
        const settlements = Array.from(this.engine.settlements.values());

        for (const source of settlements) {
            source.tradeCache.validTargets = [];

            for (const target of settlements) {
                if (source.id === target.id) continue;

                const pathData = this.pathfinder.findCheapestPath(source.id, target.id);

                // Cull targets that are unreachable or outside the max trade range
                if (pathData.totalDistance !== Infinity && pathData.totalDistance <= this.engine.maxTradeRange) {
                    // Cache the target AND the distance to completely remove pathfinding from the tick loop!
                    source.tradeCache.validTargets.push({
                        target: target,
                        distance: pathData.totalDistance
                    });
                }
            }
        }
        this.needsCacheRebuild = false;
        this.engine.emit('tradeCacheRebuilt');
    }

    update() {
        // Only rebuild if the map topology changed
        if (this.needsCacheRebuild) {
            this.rebuildCache();
        }

        const registry = this.engine.registry;
        const settlements = Array.from(this.engine.settlements.values());

        for (const source of settlements) {
            const neighbors = source.tradeCache.validTargets || [];

            // Iterate over pre-culled neighbors instead of all settlements
            for (const neighborData of neighbors) {
                const target = neighborData.target;
                const distance = neighborData.distance; // Use cached distance!

                registry.commodities.forEach((commodity, commodityId) => {
                    const sourcePrice = source.prices[commodityId] || 0;
                    const targetPrice = target.prices[commodityId] || 0;
                    
                    const priceDiff = targetPrice - sourcePrice;
                    if (priceDiff <= 0) return; 

                    // Transport cost calculated instantly using cached distance
                    const transportCost = distance * this.engine.caravanCostPerDistance * commodity.weight;
                    const profitMargin = priceDiff - transportCost;

                    if (profitMargin > 0) {
                        const available = source.inventory[commodityId] || 0;
                        const tradeVolume = Math.floor(available * 0.1 * commodity.elasticity); 

                        if (tradeVolume > 0) {
                            source.inventory[commodityId] -= tradeVolume;
                            
                            const caravanId = `cvn_${source.id}_${target.id}_${Date.now()}_${Math.floor(this.engine.rng.next() * 1000)}`;
                            
                            const caravan = new Caravan(
                                caravanId, source.id, target.id, commodityId, tradeVolume, profitMargin, distance
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