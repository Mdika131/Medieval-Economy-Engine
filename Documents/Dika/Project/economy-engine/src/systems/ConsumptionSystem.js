/**
* Consumption System
* Manages consumption of goods by the population, starvation mechanics, and dynamic price adjustments.
* Implements a more precise demand-supply price algorithm and dynamic starvation penalties.
*/
export class ConsumptionSystem {
    constructor(engine) {
        this.engine = engine;
    }

    // More precise price calculation using actual demand/supply ratios and elasticity
    calculateExactPrice(settlement, itemId, hypotheticalInventory) {
        const registry = this.engine.registry;
        let expectedDemand = 0;

        registry.populationTypes.forEach((needs, popClass) => {
            const popCount = settlement.demographics[popClass] || 0;
            if (needs[itemId]) expectedDemand += popCount * needs[itemId];
        });

        const c = registry.getCommodity(itemId);
        if (!c) return 1;

        const demand = expectedDemand || 1;
        const supply = Math.max(hypotheticalInventory, 0.1);
        const ratio = demand / supply;
        const newPrice = c.basePrice * Math.pow(ratio, c.elasticity);

        return Math.max(c.basePrice * 0.1, Math.min(c.basePrice * 10, newPrice));
    }

    update() {
        const registry = this.engine.registry;

        this.engine.settlements.forEach(settlement => {
            const aggregateDemand = {};
            registry.commodities.forEach((_, k) => { aggregateDemand[k] = 0; });

            registry.populationTypes.forEach((needs, popClass) => {
                const popCount = settlement.demographics[popClass] || 0;
                Object.keys(needs).forEach(item => {
                    aggregateDemand[item] = (aggregateDemand[item] || 0) + popCount * needs[item];
                });
            });

            let essentialDemand = 0;
            let essentialConsumed = 0;

            Object.keys(aggregateDemand).forEach(item => {
                const demand = aggregateDemand[item];
                if (demand <= 0) return;

                const c = registry.getCommodity(item);
                if (!c) return;
                if (c.isEssential) essentialDemand += demand;

                const consumed = Math.min(settlement.inventory[item] || 0, demand);
                settlement.inventory[item] = (settlement.inventory[item] || 0) - consumed;
                if (c.isEssential) essentialConsumed += consumed;
            });

            if (essentialDemand > 0 && essentialConsumed < essentialDemand) {
                const shortfall = essentialDemand - essentialConsumed;
                const starvationRate = shortfall / essentialDemand;

                settlement.starvationRate = starvationRate;

                this.engine.emit('populationStarved', { settlement, starvationRate });

                // Dynamic starvation penalty (True Abstraction)
                Object.keys(settlement.demographics).forEach(key => {
                    settlement.demographics[key] = Math.floor(settlement.demographics[key] * (1 - starvationRate * 0.5));
                });
            } else {
                // Reset it if they are eating well!
                settlement.starvationRate = 0;
                // Surplus food → population growth
                Object.keys(settlement.demographics).forEach(key => {
                    settlement.demographics[key] = Math.floor(settlement.demographics[key] * 1.02);
                });
            }

            // Ambient spoilage on remaining stockpiles
            registry.commodities.forEach((c, item) => {
                if (c.spoilage > 0 && (settlement.inventory[item] || 0) > 0) {
                    const rotAmt = Math.floor(settlement.inventory[item] * c.spoilage);
                    settlement.inventory[item] -= rotAmt;
                }
            });

            // Adjust prices based on precise algorithm
            registry.commodities.forEach((_, item) => {
                settlement.prices[item] = this.calculateExactPrice(settlement, item, settlement.inventory[item] || 0);
            });
            this.engine.emit('priceUpdated', { settlement, prices: { ...settlement.prices } });
        });
    }
}