import { registerElement, Behavior } from '../elements.js';

// ID 1: Sand
registerElement({
    id: 1, name: 'Sand', category: 'Powders',
    behavior: Behavior.POWDER,
    baseColor: [220, 190, 100], colorVariance: 20,
    density: 80, flammable: false,
});

// ID 4: Dirt
registerElement({
    id: 4, name: 'Dirt', category: 'Powders',
    behavior: Behavior.POWDER,
    baseColor: [139, 90, 43], colorVariance: 15,
    density: 75, flammable: false,
    reactions: {
        2: (x, y, nx, ny, grid) => { // Water -> Mud
            if (Math.random() < 0.02) {
                const { varyColor } = { varyColor: (c, v) => [
                    Math.min(255, Math.max(0, c[0] + Math.floor(Math.random() * v * 2 - v))),
                    Math.min(255, Math.max(0, c[1] + Math.floor(Math.random() * v * 2 - v))),
                    Math.min(255, Math.max(0, c[2] + Math.floor(Math.random() * v * 2 - v))),
                ]};
                const color = varyColor([90, 60, 30], 10);
                const i = grid.index(x, y);
                grid.cells[i] = 30; // Mud
                grid.colorR[i] = color[0];
                grid.colorG[i] = color[1];
                grid.colorB[i] = color[2];
            }
        }
    }
});

// ID 17: Snow
registerElement({
    id: 17, name: 'Snow', category: 'Powders',
    behavior: Behavior.POWDER,
    baseColor: [240, 240, 255], colorVariance: 8,
    density: 30, flammable: false,
    meltPoint: 30, meltProduct: 2, // -> Water when warmed
    conductivity: 0.05,
    temperature: -15,
});

// ID 18: Gravel
registerElement({
    id: 18, name: 'Gravel', category: 'Powders',
    behavior: Behavior.POWDER,
    baseColor: [120, 110, 100], colorVariance: 15,
    density: 85, flammable: false,
});

// ID 19: Gunpowder
registerElement({
    id: 19, name: 'Gunpowder', category: 'Powders',
    behavior: Behavior.POWDER,
    baseColor: [50, 50, 50], colorVariance: 8,
    density: 70, flammable: true, burnRate: 0.8,
});

// ID 22: Ash
registerElement({
    id: 22, name: 'Ash', category: 'Powders',
    behavior: Behavior.POWDER,
    baseColor: [100, 95, 90], colorVariance: 10,
    density: 40, flammable: false,
});

// ID 23: Salt
registerElement({
    id: 23, name: 'Salt', category: 'Powders',
    behavior: Behavior.POWDER,
    baseColor: [240, 235, 230], colorVariance: 5,
    density: 70, flammable: false,
    reactions: {
        2: (x, y, nx, ny, grid) => { // Water dissolves salt
            if (Math.random() < 0.03) {
                grid.clear(x, y);
            }
        }
    }
});

// ID 24: Rust
registerElement({
    id: 24, name: 'Rust', category: 'Powders',
    behavior: Behavior.POWDER,
    baseColor: [160, 70, 30], colorVariance: 12,
    density: 78, flammable: false,
});

// ID 25: Coal
registerElement({
    id: 25, name: 'Coal', category: 'Powders',
    behavior: Behavior.POWDER,
    baseColor: [30, 30, 30], colorVariance: 8,
    density: 82, flammable: true, burnRate: 0.03,
});

// ID 26: Thermite
registerElement({
    id: 26, name: 'Thermite', category: 'Powders',
    behavior: Behavior.POWDER,
    baseColor: [140, 50, 40], colorVariance: 10,
    density: 90, flammable: true, burnRate: 0.5,
});
