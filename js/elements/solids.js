import { registerElement, Behavior } from '../elements.js';

// ID 3: Stone
registerElement({
    id: 3, name: 'Stone', category: 'Solids',
    behavior: Behavior.STATIC,
    baseColor: [128, 128, 128], colorVariance: 15,
    density: 100, flammable: false, dissolvable: true,
    conductivity: 0.3,
});

// ID 10: Brick
registerElement({
    id: 10, name: 'Brick', category: 'Solids',
    behavior: Behavior.STATIC,
    baseColor: [178, 80, 50], colorVariance: 12,
    density: 100, flammable: false, dissolvable: true,
    conductivity: 0.2,
});

// ID 11: Metal
registerElement({
    id: 11, name: 'Metal', category: 'Solids',
    behavior: Behavior.STATIC,
    baseColor: [180, 190, 200], colorVariance: 8,
    density: 120, flammable: false, dissolvable: true,
    conductivity: 0.9,
});

// ID 12: Glass
registerElement({
    id: 12, name: 'Glass', category: 'Solids',
    behavior: Behavior.STATIC,
    baseColor: [200, 220, 240], colorVariance: 5,
    density: 90, flammable: false, dissolvable: true,
    conductivity: 0.15,
});

// ID 13: Ice
registerElement({
    id: 13, name: 'Ice', category: 'Solids',
    behavior: Behavior.STATIC,
    baseColor: [170, 210, 240], colorVariance: 10,
    density: 50, flammable: false,
    conductivity: 0.4,
    temperature: -20,
    meltPoint: 35, meltProduct: 2, // -> Water when heated above ambient
});

// ID 14: Obsidian
registerElement({
    id: 14, name: 'Obsidian', category: 'Solids',
    behavior: Behavior.STATIC,
    baseColor: [20, 10, 30], colorVariance: 8,
    density: 130, flammable: false, dissolvable: false,
    conductivity: 0.05,
});

// ID 15: Titanium
registerElement({
    id: 15, name: 'Titanium', category: 'Solids',
    behavior: Behavior.STATIC,
    baseColor: [210, 210, 220], colorVariance: 5,
    density: 140, flammable: false, dissolvable: false,
    conductivity: 0.7,
});

// ID 16: Bedrock
registerElement({
    id: 16, name: 'Bedrock', category: 'Solids',
    behavior: Behavior.STATIC,
    baseColor: [60, 60, 60], colorVariance: 5,
    density: 255, flammable: false, dissolvable: false,
    conductivity: 0.01,
});
