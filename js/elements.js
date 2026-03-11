// Element type IDs
export const EMPTY = 0;

// Behavior categories
export const Behavior = {
    STATIC: 'static',
    POWDER: 'powder',
    LIQUID: 'liquid',
    GAS: 'gas',
    ENERGY: 'energy',
    LIFE: 'life',
    TOOL: 'tool',
};

const registry = new Map();

export function registerElement(def) {
    if (!def.colorVariance) def.colorVariance = 10;
    if (!def.density) def.density = 50;
    if (!def.conductivity) def.conductivity = 0.1;
    registry.set(def.id, def);
}

export function getElement(id) {
    return registry.get(id);
}

export function getAllElements() {
    return Array.from(registry.values());
}

export function getElementsByCategory(category) {
    return getAllElements().filter(e => e.category === category);
}

export function registerAllElements() {
    // These are loaded via their own module side-effects
    // but we call them explicitly for clarity
}

// Re-export registration functions for element files
export { registerElement as register };
