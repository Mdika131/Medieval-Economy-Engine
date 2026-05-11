/** * Validator
* Provides static methods to check the integrity of the engine's registry and configuration.
*/ 
export class Validator {
    /**
     * Checks the registry for common developer mistakes.
     * @param {Registry} registry - The engine registry to validate.
     * @returns {Array} List of warning/error strings.
     */
    static validateRegistry(registry) {
        const issues = [];

        // 1. Check for missing commodities in recipes
        for (const recipe of registry.recipes.values()) {
            if (!registry.commodities.has(recipe.output)) {
                issues.push(`Error: Recipe produces "${recipe.output}", but it is not registered!`);
            }
            
            if (recipe.inputs) {
                Object.keys(recipe.inputs).forEach(input => {
                    if (!registry.commodities.has(input)) {
                        issues.push(`Error: Recipe requires "${input}", but it is not registered!`);
                    }
                });
            }
        }

        // 2. Check for missing commodities in population needs
        for (const [popType, data] of registry.populationTypes.entries()) {
            if (data.needs) {
                Object.keys(data.needs).forEach(item => {
                    if (!registry.commodities.has(item)) {
                        issues.push(`Warning: Population "${popType}" needs "${item}", but it is not registered!`);
                    }
                });
            }
        }

        return issues;
    }
}