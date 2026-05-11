/** 
* Registry
* Manages the registration and retrieval of commodities, recipes, and population types.
*/

import { Validator } from './Validator.js';

export class Registry {
    constructor() {
        this.commodities = new Map(); 
        
        // Using Map for recipes allows for O(1) lookups and prevents duplicate IDs more efficiently than an array.
        this.recipes = new Map();        
        this.populationTypes = new Map();
        
    }

    /**
     * Normalizes IDs to prevent casing/spacing duplicate issues.
     * @param {string} id - The raw string identifier
     * @returns {string} Normalized string identifier
     */
    _normalizeId(id) {
        if (!id || typeof id !== 'string') {
            throw new Error(`Registry ID must be a valid string. Received: ${typeof id}`);
        }
        return id.trim().toLowerCase();
    }

    /**
     * Registers a new commodity in the economy engine.
     * Supports both (id, data) and ({ id, ...data }) signatures.
     */
    registerCommodity(idOrData, optionalData) {
        // Handle single-object or two-argument signatures
        const isSingleObject = typeof idOrData === 'object' && idOrData !== null;
        const rawId = isSingleObject ? idOrData.id : idOrData;
        const data = isSingleObject ? idOrData : optionalData;

        const normId = this._normalizeId(rawId);

        if (this.commodities.has(normId)) {
            throw new Error(`Commodity registration failed: "${normId}" is already registered.`);
        }

        if (!data || typeof data !== 'object') {
            throw new Error(`Commodity registration failed: "${normId}" is missing definition data.`);
        }

        if (data.weight !== undefined && (!Number.isFinite(data.weight) || data.weight < 0)) {
            throw new Error(`Commodity registration failed: "${normId}" must have a finite, non-negative numeric weight.`);
        }

        const sanitizedData = {
            ...data,
            id: normId
        };

        this.commodities.set(normId, sanitizedData);
        return this;
    }

    /**
     * Registers a new production recipe.
     * Supports both (id, data) and ({ id, ...data }) signatures.
     * Auto-generates a deterministic ID if none is explicitly provided.
     */
    registerRecipe(idOrData, optionalData) {
        if (!idOrData) throw new Error("Recipe registration failed: No recipe data provided.");

        // Handle single-object or two-argument signatures
        const isSingleObject = typeof idOrData === 'object' && idOrData !== null;
        const recipeData = isSingleObject ? idOrData : optionalData;

        if (!recipeData || typeof recipeData !== 'object') {
            throw new Error(`Recipe registration failed: Missing definition data.`);
        }

        // Output validation must occur before ID generation to ensure safe string building
        if (!recipeData.output) {
            throw new Error(`Recipe registration failed: Recipe is missing an output commodity.`);
        }

        // Auto-generate a deterministic ID if the developer didn't provide one
        // This ensures backward compatibility for presets that omit recipe IDs
        let rawId = isSingleObject ? idOrData.id : (typeof idOrData === 'string' ? idOrData : undefined);
        if (!rawId) {
            const inputKeys = recipeData.inputs ? Object.keys(recipeData.inputs).sort().join('_') : 'base';
            rawId = `recipe_${recipeData.output}_from_${inputKeys}`;
        }

        const normId = this._normalizeId(rawId);

        if (this.recipes.has(normId)) {
            throw new Error(`Recipe registration failed: Recipe "${normId}" is already registered.`);
        }
        
        const outputId = this._normalizeId(recipeData.output);
        if (!this.commodities.has(outputId)) {
            throw new Error(`Recipe registration failed: Recipe "${normId}" references unknown output commodity "${outputId}".`);
        }

        const sanitizedInputs = {};

        // Input validation
        if (recipeData.inputs) {
            for (const [inputCommodity, quantity] of Object.entries(recipeData.inputs)) {
                const inputId = this._normalizeId(inputCommodity);
                if (!this.commodities.has(inputId)) {
                    throw new Error(`Recipe registration failed: Recipe "${normId}" references unknown input commodity "${inputId}".`);
                }
                
                if (!Number.isFinite(quantity) || quantity <= 0) {
                    throw new Error(`Recipe registration failed: Recipe "${normId}" input "${inputId}" must have a finite numeric quantity > 0.`);
                }
                
                sanitizedInputs[inputId] = quantity;
            }
        }

        // Create a sanitized internal copy to avoid mutating the user-provided object
        const sanitizedRecipe = {
            ...recipeData,
            id: normId,
            output: outputId,
            inputs:
                Object.keys(sanitizedInputs).length > 0
                    ? sanitizedInputs
                    : undefined
        };

        this.recipes.set(normId, sanitizedRecipe);
        return this;
    }

    /**
     * Registers a new population demographic and its consumption needs.
     * Supports both (id, data) and ({ id, ...data }) signatures.
     */
    registerPopulationType(idOrData, optionalData) {
        // Handle single-object or two-argument signatures
        const isSingleObject = typeof idOrData === 'object' && idOrData !== null;
        const rawId = isSingleObject ? idOrData.id : idOrData;
        const data = isSingleObject ? idOrData : optionalData;

        const normId = this._normalizeId(rawId);

        if (this.populationTypes.has(normId)) {
            throw new Error(`Population Type registration failed: "${normId}" is already registered.`);
        }

        if (!data || typeof data !== 'object') {
            throw new Error(`Population Type registration failed: "${normId}" is missing definition data.`);
        }

        const sanitizedNeeds = {};

        if (data.needs) {
            for (const [needId, amount] of Object.entries(data.needs)) {
                const normNeedId = this._normalizeId(needId);
                
                if (!this.commodities.has(normNeedId)) {
                    throw new Error(`Population Type registration failed: Demographic "${normId}" demands unknown commodity "${normNeedId}".`);
                }
                
                if (!Number.isFinite(amount) || amount < 0) {
                    throw new Error(`Population Type registration failed: Demographic "${normId}" demand for "${normNeedId}" must be a finite, non-negative number.`);
                }
                
                sanitizedNeeds[normNeedId] = amount;
            }
        }

        const sanitizedData = {
            ...data,
            id: normId,
            needs:
                Object.keys(sanitizedNeeds).length > 0
                    ? sanitizedNeeds
                    : undefined
        };

        this.populationTypes.set(normId, sanitizedData);
        return this;
    }

    /**
     * Safely retrieves a registered commodity using normalized IDs.
     * Restored for backward compatibility with ProductionSystem.
     * @param {string} id 
     * @returns {Object|undefined}
     */
    getCommodity(id) {
        if (!id || typeof id !== 'string') return undefined;
        return this.commodities.get(this._normalizeId(id));
    }

    /**
     * Safely retrieves a registered recipe using normalized IDs.
     * @param {string} id 
     * @returns {Object|undefined}
     */
    getRecipe(id) {
        if (!id || typeof id !== 'string') return undefined;
        return this.recipes.get(this._normalizeId(id));
    }

    /**
     * Safely retrieves a registered population demographic.
     * @param {string} id 
     * @returns {Object|undefined}
     */
    getPopulationType(id) {
        if (!id || typeof id !== 'string') return undefined;
        return this.populationTypes.get(this._normalizeId(id));
    }

    /**
     * Runs a full diagnostic audit using the static Validator utility.
     * Restored to prevent crashes if external scripts call registry.validate()
     */
    validate() {
        const issues = Validator.validateRegistry(this);
        if (issues.length > 0) {
            console.groupCollapsed("Economy Engine Registry Validation");
            issues.forEach(issue => console.warn(issue));
            console.groupEnd();
        }
        return issues.length === 0;
    }
}