import { registerElement, Behavior } from '../elements.js';

// ID 21: Smoke
registerElement({
    id: 21, name: 'Smoke', category: 'Gases',
    behavior: Behavior.GAS,
    baseColor: [80, 80, 80], colorVariance: 20,
    density: 3, lifetime: 80,
    flammable: false,
});

// ID 34: Steam
registerElement({
    id: 34, name: 'Steam', category: 'Gases',
    behavior: Behavior.GAS,
    baseColor: [200, 200, 220], colorVariance: 15,
    density: 5, lifetime: 120,
    flammable: false,
    conductivity: 0.2,
    // Condenses back to water when cooled
    freezePoint: -10, freezeProduct: 2, // not really freeze, but reuse mechanism
});

// ID 35: Methane
registerElement({
    id: 35, name: 'Methane', category: 'Gases',
    behavior: Behavior.GAS,
    baseColor: [150, 255, 150], colorVariance: 15,
    density: 4,
    flammable: true, burnRate: 0.9,
});

// ID 36: Toxic Gas
registerElement({
    id: 36, name: 'Toxic', category: 'Gases',
    behavior: Behavior.GAS,
    baseColor: [120, 180, 50], colorVariance: 15,
    density: 6, lifetime: 200,
    flammable: false,
});

// ID 37: Hydrogen
registerElement({
    id: 37, name: 'Hydrogen', category: 'Gases',
    behavior: Behavior.GAS,
    baseColor: [200, 200, 255], colorVariance: 10,
    density: 2,
    flammable: true, burnRate: 0.95,
});

// ID 38: CO2
registerElement({
    id: 38, name: 'CO2', category: 'Gases',
    behavior: Behavior.GAS,
    baseColor: [160, 160, 170], colorVariance: 8,
    density: 8, lifetime: 150,
    flammable: false,
    // CO2 extinguishes fire on contact
    reactions: {
        20: (x, y, nx, ny, grid) => {
            grid.clear(nx, ny); // extinguish fire
        }
    }
});
