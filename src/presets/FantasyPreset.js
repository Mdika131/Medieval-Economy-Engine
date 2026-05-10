export const FantasyPreset = {
    apply(engine) {
        engine.registry
            .registerCommodity({ id: 'grain',            basePrice: 1.0,   isEssential: true,  isAgricultural: true,  weight: 2.0, spoilage: 0.15, elasticity: 1.5 })
            .registerCommodity({ id: 'mana',             basePrice: 50.0,  isEssential: false, isAgricultural: false, weight: 0.0, spoilage: 0.0,  elasticity: 3.0 })
            .registerCommodity({ id: 'dragonore',        basePrice: 100.0, isEssential: false, isAgricultural: false, weight: 6.0, spoilage: 0.0,  elasticity: 0.5 })
            .registerCommodity({ id: 'herbs',            basePrice: 5.0,   isEssential: false, isAgricultural: true,  weight: 0.5, spoilage: 0.1,  elasticity: 1.5 })
            .registerCommodity({ id: 'enchantedweapons', basePrice: 200.0, isEssential: false, isAgricultural: false, weight: 3.0, spoilage: 0.0,  elasticity: 0.4 });

        engine.registry
            .registerRecipe({ output: 'enchantedweapons', inputs: { dragonore: 2, mana: 1 }, workerType: 'mages', maxPerWorker: 0.02 });

        engine.registry
            .registerPopulationType('peasants', { grain: 1.0 })
            .registerPopulationType('mages',    { grain: 0.5, mana: 0.3, herbs: 0.2 })
            .registerPopulationType('nobles',   { grain: 1.0, enchantedweapons: 0.1, mana: 0.5 });

        return engine;
    }
};