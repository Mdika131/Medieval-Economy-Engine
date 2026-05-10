import { Validator } from './Validator.js';

export class Registry {
    constructor() {
        this.commodities = new Map(); 
        this.recipes = [];        
        this.populationTypes = new Map(); 
    }

    registerCommodity(def) {
        if (!def.id) throw new Error('Commodity must have an id');
        this.commodities.set(def.id, {
            basePrice: def.basePrice ?? 1.0,
            isEssential: def.isEssential ?? false,
            isAgricultural: def.isAgricultural ?? false,
            weight: def.weight ?? 1.0,
            spoilage: def.spoilage ?? 0.0,
            elasticity: def.elasticity ?? 1.0,
            workerType: def.workerType ?? 'peasants' 
        });
        return this;
    }

    registerRecipe(def) {
        this.recipes.push({
            output: def.output,
            inputs: def.inputs,
            workerType: def.workerType ?? 'burghers',
            maxPerWorker: def.maxPerWorker ?? 0.05,
        });
        return this;
    }

    registerPopulationType(id, needs) {
        this.populationTypes.set(id, needs);
        return this;
    }

    getCommodity(id) { return this.commodities.get(id); }

    validate() {
    const issues = Validator.validateRegistry(this);
    if (issues.length > 0) {
        console.group("Economy Engine Registry Validation");
        issues.forEach(issue => console.warn(issue));
        console.groupEnd();
    }
    return issues.length === 0;
    }
}