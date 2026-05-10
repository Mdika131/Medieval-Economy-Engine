/**
* Migration System
* Manages population movement between settlements based on desirability scores and migration thresholds.
*/

export class MigrationSystem {
    constructor(engine) {
        this.engine = engine;
        this.migrationThreshold = 1.2; // Destination must be at least 20% better
        this.migrationRate = 0.05;     // Up to 5% of the population moves per tick
    }

    update() {
        const desirability = new Map();

        // 1. Calculate Desirability Scores
        this.engine.settlements.forEach(settlement => {
            let score = 100; // Baseline
            
            // Penalty: Devastation
            score -= settlement.devastation;

            // Penalty: Starvation (Massive push factor)
            const starveRate = settlement.starvationRate || 0;
            score -= (starveRate * 150); 

            // Bonus: Wealth per capita (Pull factor)
            const totalPop = settlement.demographics.getTotal();
            if (totalPop > 0) {
                score += Math.min(50, (settlement.wealth / totalPop) * 0.5);
            }

            // Ensure score doesn't go negative for math purposes
            desirability.set(settlement.id, Math.max(1, score));
        });

        // 2. Process Migration
        this.engine.settlements.forEach(source => {
            const sourceScore = desirability.get(source.id);
            const routes = this.engine.network.get(source.id) || [];

            let bestTarget = null;
            let bestScore = sourceScore;

            // Look at neighboring cities
            for (const route of routes) {
                const targetScore = desirability.get(route.targetId);
                
                // Distance Penalty: People won't walk 1000 miles just for a 5% better life
                const effectiveTargetScore = targetScore - (route.distance * 0.1);

                if (effectiveTargetScore > bestScore * this.migrationThreshold) {
                    bestScore = effectiveTargetScore;
                    bestTarget = this.engine.settlements.get(route.targetId);
                }
            }

            // 3. Move the people
            if (bestTarget) {
                // True abstraction: Loop through whatever classes exist in the registry
                this.engine.registry.populationTypes.forEach((_, popClass) => {
                    const popAmount = source.demographics[popClass] || 0;
                    
                    if (popAmount > 0) {
                        const migrants = Math.floor(popAmount * this.migrationRate);
                        
                        if (migrants > 0) {
                            // Deduct from source
                            source.demographics[popClass] -= migrants;
                            // Add to target
                            bestTarget.demographics[popClass] = (bestTarget.demographics[popClass] || 0) + migrants;

                            this.engine.emit('populationMigrated', {
                                source,
                                target: bestTarget,
                                popClass,
                                amount: migrants,
                                reasonScore: bestScore - sourceScore
                            });
                        }
                    }
                });
            }
        });
    }
}