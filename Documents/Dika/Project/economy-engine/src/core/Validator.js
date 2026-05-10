export class Validator {
    /**
     * Checks the registry for common developer mistakes.
     * @param {Registry} registry - The engine registry to validate.
     * @returns {Array} List of warning/error strings.
     */
    static validateRegistry(registry) {
        const issues = [];

        // 1. Check for missing commodities in recipes
        registry.recipes.forEach(recipe => {
            if (!registry.getCommodity(recipe.output)) {
                issues.push(`Error: Recipe produces "${recipe.output}", but it is not registered!`);
            }
            Object.keys(recipe.inputs).forEach(input => {
                if (!registry.getCommodity(input)) {
                    issues.push(`Error: Recipe requires "${input}", but it is not registered!`);
                }
            });
        });

        // 2. Check for missing commodities in population needs
        registry.populationTypes.forEach((needs, popType) => {
            Object.keys(needs).forEach(item => {
                if (!registry.getCommodity(item)) {
                    issues.push(`Warning: Population "${popType}" needs "${item}", but it is not registered!`);
                }
            });
        });

        return issues;
    }
}