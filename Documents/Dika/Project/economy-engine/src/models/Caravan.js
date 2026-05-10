/**
* Caravan
* Represents a merchant caravan traveling between two settlements with a specific commodity.
*/
export class Caravan {
    constructor(id, sourceId, targetId, commodityId, amount, expectedProfit, routeDistance) {
        this.id = id;
        this.sourceId = sourceId;
        this.targetId = targetId;
        this.commodityId = commodityId;
        this.amount = amount;
        this.expectedProfit = expectedProfit; 
        this.routeDistance = routeDistance;
        this.progress = 0;
    }

    toJSON() {
        return { ...this };
    }
}