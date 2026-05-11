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

        this.engine.on('topologyChanged', () => {
            this.needsCacheRebuild = true;
        });
    }

    getTradeNeighbors(settlement) {
        if (!settlement.tradeCache) {
            settlement.tradeCache = {};
        }
        if (!settlement.tradeCache.validTargets) {
            settlement.tradeCache.validTargets = [];
        }
        return settlement.tradeCache.validTargets;
    }

    rebuildCache() {
        const settlements = Array.from(this.engine.settlements.values());

        for (const source of settlements) {
            if (!source.tradeCache) source.tradeCache = {};
            source.tradeCache.validTargets = [];

            for (const target of settlements) {
                if (source.id === target.id) continue;

                const pathData = this.pathfinder.findCheapestPath(source.id, target.id);

                if (pathData.totalDistance !== Infinity && pathData.totalDistance <= this.engine.maxTradeRange) {
                    source.tradeCache.validTargets.push({
                        targetId: target.id, 
                        distance: pathData.totalDistance
                    });
                }
            }
        }
        this.needsCacheRebuild = false;
        this.engine.emit('tradeCacheRebuilt');
    }

    update() {
        if (this.needsCacheRebuild) {
            this.rebuildCache();
        }

        const registry = this.engine.registry;
        const settlements = Array.from(this.engine.settlements.values());

        for (const source of settlements) {
            const neighbors = this.getTradeNeighbors(source);

            for (const neighborData of neighbors) {
                const target = this.engine.settlements.get(neighborData.targetId);

                if (!target) continue;

                const distance = neighborData.distance;

                registry.commodities.forEach((commodity, commodityId) => {
                    const sourcePrice = source.prices[commodityId] || 0;
                    const targetPrice = target.prices[commodityId] || 0;
                    
                    const priceDiff = targetPrice - sourcePrice;
                    if (priceDiff <= 0) return; 

                    const transportCost = distance * this.engine.caravanCostPerDistance * commodity.weight;
                    const profitMargin = priceDiff - transportCost;

                    if (profitMargin > 0) {
                        const available = source.inventory[commodityId] || 0;
                        const tradeVolume = Math.floor(available * 0.1 * commodity.elasticity); 

                        if (tradeVolume > 0) {
                            source.inventory[commodityId] -= tradeVolume;
                        
                            const caravanId = `cvn_${this.engine.year}_${source.id}_${target.id}_${this.engine.caravanCounter++}`;
                            
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