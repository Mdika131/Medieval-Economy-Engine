export const MedievalPreset = {
    apply(engine) {
        engine.registry
            .registerCommodity({ id: 'grain',   basePrice: 1.0,  isEssential: true,  isAgricultural: true,  weight: 2.0, spoilage: 0.15, elasticity: 1.5 })
            .registerCommodity({ id: 'fish',    basePrice: 2.0,  isEssential: true,  isAgricultural: false, weight: 1.0, spoilage: 0.02, elasticity: 1.2 })
            .registerCommodity({ id: 'timber',  basePrice: 2.0,  isEssential: false, isAgricultural: false, weight: 5.0, spoilage: 0.0,  elasticity: 0.8 })
            .registerCommodity({ id: 'iron',    basePrice: 4.0,  isEssential: false, isAgricultural: false, weight: 4.0, spoilage: 0.0,  elasticity: 0.8 })
            .registerCommodity({ id: 'wool',    basePrice: 3.0,  isEssential: false, isAgricultural: true,  weight: 1.0, spoilage: 0.01, elasticity: 1.0 })
            .registerCommodity({ id: 'cloth',   basePrice: 12.0, isEssential: false, isAgricultural: false, weight: 0.5, spoilage: 0.02, elasticity: 1.2 })
            .registerCommodity({ id: 'weapons', basePrice: 30.0, isEssential: false, isAgricultural: false, weight: 3.0, spoilage: 0.0,  elasticity: 0.5 })
            .registerCommodity({ id: 'wine',    basePrice: 20.0, isEssential: false, isAgricultural: true,  weight: 1.0, spoilage: 0.05, elasticity: 2.0 })
            .registerCommodity({ id: 'spice',   basePrice: 60.0, isEssential: false, isAgricultural: false, weight: 0.1, spoilage: 0.0,  elasticity: 2.5 });

        engine.registry
            .registerRecipe({ output: 'weapons', inputs: { iron: 2 }, workerType: 'burghers', maxPerWorker: 0.05 })
            .registerRecipe({ output: 'cloth',   inputs: { wool: 2 }, workerType: 'burghers', maxPerWorker: 0.1  });

        engine.registry
            .registerPopulationType('peasants', { grain: 1.0 })
            .registerPopulationType('burghers', { grain: 1.0, fish: 0.2, cloth: 0.1 })
            .registerPopulationType('nobles',   { grain: 1.0, fish: 0.5, cloth: 1.0, weapons: 0.5, wine: 1.0, spice: 0.5 });

        return engine;
    }
};