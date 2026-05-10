/**
* Production System
* Handles all production logic: resource extraction, manufacturing, and passive wealth generation.
* Workers are allocated dynamically based on potential output value, simulating a rational labor market.
* Climate modifiers affect agricultural yields, introducing variability and strategic depth.
*/
export class ProductionSystem {
    constructor(engine) {
        this.engine = engine;
    }

    update(climateModifier) {
        const registry = this.engine.registry;

        this.engine.settlements.forEach(settlement => {
            const eventData = this.engine.emit('beforeProduce', { settlement, climateModifier });
            if (eventData === false) return; 

            const climateMod = eventData?.climateModifier ?? climateModifier;

            // Passive wealth generation ("the mint")
            const passiveWealth = settlement.demographics.getTotal() * 0.05;
            settlement.wealth += parseFloat(passiveWealth.toFixed(2));

            // Rational labor allocation — workers gravitate toward the highest-value resource
            let totalExtractionValue = 0;
            const resourceValues = {};

            Object.keys(settlement.resourceNodes).forEach(res => {
                const c = registry.getCommodity(res);
                let yieldPerWorker = settlement.resourceNodes[res];
                if (c?.isAgricultural) yieldPerWorker *= climateMod;
                const projectedValue = yieldPerWorker * (settlement.prices[res] || 1);
                resourceValues[res] = projectedValue;
                totalExtractionValue += projectedValue;
            });

            Object.keys(settlement.resourceNodes).forEach(res => {
                const laborShare = totalExtractionValue > 0
                    ? resourceValues[res] / totalExtractionValue
                    : 1 / Object.keys(settlement.resourceNodes).length;
                
                const c = registry.getCommodity(res);
                const workerType = c?.workerType || 'peasants';
                // Dynamic population lookup!
                const ableWorkers = (settlement.demographics[workerType] || 0) * (1 - settlement.devastation / 100);
                const allocatedWorkers = ableWorkers * laborShare;

                let yieldAmt = allocatedWorkers * settlement.resourceNodes[res];
                if (c?.isAgricultural) yieldAmt *= climateMod;
                settlement.inventory[res] = (settlement.inventory[res] || 0) + Math.floor(yieldAmt);
            });

            // Manufacturing — process all registered recipes
            registry.recipes.forEach(recipe => {
                const workerType = recipe.workerType || 'burghers';
                const workerPool = (settlement.demographics[workerType] || 0) * (1 - settlement.devastation / 100);
                const maxOutput = Math.floor(workerPool * recipe.maxPerWorker);

                // Bottleneck: constrained by whichever input is shortest
                let possibleOutput = maxOutput;
                Object.keys(recipe.inputs).forEach(inputItem => {
                    const available = Math.floor((settlement.inventory[inputItem] || 0) / recipe.inputs[inputItem]);
                    if (available < possibleOutput) possibleOutput = available;
                });

                if (possibleOutput > 0) {
                    Object.keys(recipe.inputs).forEach(inputItem => {
                        settlement.inventory[inputItem] -= possibleOutput * recipe.inputs[inputItem];
                    });
                    settlement.inventory[recipe.output] = (settlement.inventory[recipe.output] || 0) + possibleOutput;
                }
            });

            this.engine.emit('afterProduce', { settlement });
        });
    }
}