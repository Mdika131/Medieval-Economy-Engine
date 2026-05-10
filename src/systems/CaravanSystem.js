/**
* CaravanSystem
* Handles the movement and transactions of caravans between settlements.
* Each caravan has a source, target, commodity, amount, and expected profit.
* The system updates caravan progress each tick and processes arrivals.
*/
export class CaravanSystem {
    constructor(engine) {
        this.engine = engine;
        this.caravanSpeed = 25; // Distance units traveled per tick
    }

    update() {
        const arrivedCaravans = [];

        // 1. Move all caravans
        this.engine.caravans.forEach(caravan => {
            caravan.progress += this.caravanSpeed;

            if (caravan.progress >= caravan.routeDistance) {
                arrivedCaravans.push(caravan);
            }
        });

        // 2. Process arrivals
        arrivedCaravans.forEach(caravan => {
            const target = this.engine.settlements.get(caravan.targetId);
            const source = this.engine.settlements.get(caravan.sourceId);

            if (target && source) {
                // Deliver the goods to the target city
                target.inventory[caravan.commodityId] = (target.inventory[caravan.commodityId] || 0) + caravan.amount;

                // Calculate final payment based on the price AT ARRIVAL (highly realistic!)
                const currentPrice = target.prices[caravan.commodityId] || 0;
                const transactionValue = caravan.amount * currentPrice;

                // Transfer wealth: Target pays the Source
                source.wealth += transactionValue;
                target.wealth -= transactionValue;

                this.engine.emit('caravanArrived', { caravan, target, source, finalValue: transactionValue });
            }

            // Remove caravan from the map
            this.engine.caravans.delete(caravan);
        });
    }
}