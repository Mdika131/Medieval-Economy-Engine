export const MedievalPreset = {
    apply(engine) {
        // 1. COMMODITIES
        engine.registry
            // Agricultural & Base Resources
            .registerCommodity({ id: 'grain',   basePrice: 1.0,  isEssential: true,  isAgricultural: true,  weight: 2.0, spoilage: 0.15, elasticity: 1.5 })
            .registerCommodity({ id: 'fish',    basePrice: 2.0,  isEssential: true,  isAgricultural: false, weight: 1.0, spoilage: 0.02, elasticity: 1.2 })
            .registerCommodity({ id: 'meat',    basePrice: 4.0,  isEssential: false, isAgricultural: true,  weight: 1.0, spoilage: 0.40, elasticity: 1.5 })
            .registerCommodity({ id: 'salt',    basePrice: 5.0,  isEssential: true,  isAgricultural: false, weight: 1.0, spoilage: 0.00, elasticity: 0.5 }) // Highly traded, needed for leather/preservation
            .registerCommodity({ id: 'timber',  basePrice: 2.0,  isEssential: false, isAgricultural: false, weight: 5.0, spoilage: 0.00, elasticity: 0.8 })
            .registerCommodity({ id: 'iron',    basePrice: 4.0,  isEssential: false, isAgricultural: false, weight: 4.0, spoilage: 0.00, elasticity: 0.8 })
            .registerCommodity({ id: 'wool',    basePrice: 3.0,  isEssential: false, isAgricultural: true,  weight: 1.0, spoilage: 0.01, elasticity: 1.0 })
            .registerCommodity({ id: 'hides',   basePrice: 2.0,  isEssential: false, isAgricultural: true,  weight: 1.5, spoilage: 0.10, elasticity: 1.0 })
            
            // Intermediate & Manufactured Goods
            .registerCommodity({ id: 'ale',     basePrice: 3.5,  isEssential: false, isAgricultural: false, weight: 2.0, spoilage: 0.10, elasticity: 1.2 })
            .registerCommodity({ id: 'leather', basePrice: 8.0,  isEssential: false, isAgricultural: false, weight: 1.0, spoilage: 0.02, elasticity: 1.0 })
            .registerCommodity({ id: 'cloth',   basePrice: 12.0, isEssential: false, isAgricultural: false, weight: 0.5, spoilage: 0.02, elasticity: 1.2 })
            .registerCommodity({ id: 'tools',   basePrice: 15.0, isEssential: false, isAgricultural: false, weight: 2.0, spoilage: 0.00, elasticity: 0.8 })
            .registerCommodity({ id: 'weapons', basePrice: 30.0, isEssential: false, isAgricultural: false, weight: 3.0, spoilage: 0.00, elasticity: 0.5 })
            .registerCommodity({ id: 'armor',   basePrice: 50.0, isEssential: false, isAgricultural: false, weight: 8.0, spoilage: 0.00, elasticity: 0.4 })
            
            // Luxuries
            .registerCommodity({ id: 'wine',    basePrice: 20.0, isEssential: false, isAgricultural: true,  weight: 1.0, spoilage: 0.05, elasticity: 2.0 })
            .registerCommodity({ id: 'spice',   basePrice: 60.0, isEssential: false, isAgricultural: false, weight: 0.1, spoilage: 0.00, elasticity: 2.5 });

        // 2. RECIPES 
        engine.registry
            // Peasant/Common Manufacturing
            .registerRecipe({ id: 'brew_ale',    output: 'ale',     inputs: { grain: 2 },           workerType: 'burghers', maxPerWorker: 0.20 })
            .registerRecipe({ id: 'weave_cloth', output: 'cloth',   inputs: { wool: 2 },            workerType: 'burghers', maxPerWorker: 0.10 })
            .registerRecipe({ id: 'tan_leather', output: 'leather', inputs: { hides: 2, salt: 1 },  workerType: 'burghers', maxPerWorker: 0.10 })
            
            // Heavy Industry / Blacksmithing
            .registerRecipe({ id: 'forge_tools',   output: 'tools',   inputs: { iron: 1, timber: 1 }, workerType: 'burghers', maxPerWorker: 0.08 })
            .registerRecipe({ id: 'forge_weapons', output: 'weapons', inputs: { iron: 2 },            workerType: 'burghers', maxPerWorker: 0.05 })
            .registerRecipe({ id: 'forge_armor',   output: 'armor',   inputs: { iron: 3, leather: 1 },workerType: 'burghers', maxPerWorker: 0.02 });

        // 3. POPULATION DEMOGRAPHICS & NEEDS
        engine.registry
            // Subsistence Class
            .registerPopulationType('peasants', { 
                grain: 1.0, 
                ale: 0.2, 
                cloth: 0.05,
                salt: 0.1 // Needed to preserve their own meager foods
            })
            
            // Middle Class / Artisans
            .registerPopulationType('burghers', { 
                grain: 1.0, 
                fish: 0.2, 
                meat: 0.2, 
                ale: 0.5, 
                cloth: 0.2, 
                tools: 0.1 
            })
            
            // The State/Military Apparatus (Industrial Sinks)
            .registerPopulationType('soldiers', {
                grain: 1.2,
                meat: 0.5,
                ale: 0.5,
                weapons: 0.1, 
                armor: 0.05
            })

            // Elite Class
            .registerPopulationType('nobles', { 
                grain: 1.0, 
                meat: 1.0, 
                fish: 0.5, 
                cloth: 1.0, 
                weapons: 0.5, 
                armor: 0.2, 
                wine: 1.0, 
                spice: 0.5 
            });

        return engine;
    }
};