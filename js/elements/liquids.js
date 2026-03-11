import { registerElement, Behavior, getElement } from '../elements.js';
import { varyColor, randInt } from '../utils.js';

// ID 2: Water
registerElement({
    id: 2, name: 'Water', category: 'Liquids',
    behavior: Behavior.LIQUID,
    baseColor: [30, 100, 200], colorVariance: 15,
    density: 50, dispersion: 5,
    flammable: false,
    conductivity: 0.3,
    boilPoint: 110, boilProduct: 34, // -> Steam
    freezePoint: -5, freezeProduct: 13, // -> Ice
    reactions: {
        20: (x, y, nx, ny, grid) => { // Fire -> extinguish, become steam
            grid.clear(nx, ny);
            const color = varyColor([200, 200, 220], 15);
            grid.setWithLifetime(x, y, 34, color, 80 + randInt(0, 40)); // Steam
        },
        28: (x, y, nx, ny, grid) => { // Lava -> obsidian + steam
            if (Math.random() < 0.3) {
                const steamColor = varyColor([200, 200, 220], 15);
                grid.setWithLifetime(x, y, 34, steamColor, 80); // Steam
                const obsColor = varyColor([20, 10, 30], 8);
                grid.set(nx, ny, 14, obsColor); // Obsidian
                grid.temperature[grid.index(nx, ny)] = 20;
            }
        },
    }
});

// ID 27: Oil
registerElement({
    id: 27, name: 'Oil', category: 'Liquids',
    behavior: Behavior.LIQUID,
    baseColor: [80, 60, 20], colorVariance: 10,
    density: 35, dispersion: 4,
    flammable: true, burnRate: 0.4,
});

// ID 28: Lava
registerElement({
    id: 28, name: 'Lava', category: 'Liquids',
    behavior: Behavior.LIQUID,
    baseColor: [220, 80, 10], colorVariance: 25,
    density: 95, dispersion: 1,
    flammable: false,
    conductivity: 0.8,
    temperature: 800,
    update(x, y, grid, elem, sim) {
        // Lava emits heat
        const i = grid.index(x, y);
        if (grid.temperature[i] < 600) grid.temperature[i] = 600;

        // Animate color based on temperature
        const temp = grid.temperature[i];
        grid.colorR[i] = Math.min(255, 180 + Math.floor(Math.random() * 75));
        grid.colorG[i] = Math.min(255, Math.floor(40 + (temp / 1000) * 80 + Math.random() * 30));
        grid.colorB[i] = Math.floor(Math.random() * 20);

        // Ignite flammable neighbors
        const dirs = [[-1,0],[1,0],[0,-1],[0,1]];
        for (const [dx, dy] of dirs) {
            const nx = x + dx, ny = y + dy;
            if (!grid.inBounds(nx, ny)) continue;
            const nType = grid.get(nx, ny);
            if (nType === 0) continue;
            const nElem = getElement(nType);
            if (nElem && nElem.flammable && Math.random() < 0.1) {
                const fireColor = varyColor([255, 100, 0], 40);
                grid.setWithLifetime(nx, ny, 20, fireColor, 20 + randInt(0, 20));
            }
        }

        // Cool slowly
        if (grid.temperature[i] < 200) {
            const stoneColor = varyColor([128, 128, 128], 15);
            grid.set(x, y, 3, stoneColor); // -> Stone
            grid.temperature[i] = 150;
        }
    }
});

// ID 29: Acid
registerElement({
    id: 29, name: 'Acid', category: 'Liquids',
    behavior: Behavior.LIQUID,
    baseColor: [120, 220, 30], colorVariance: 15,
    density: 55, dispersion: 4,
    flammable: false,
    update(x, y, grid, elem, sim) {
        // Dissolve adjacent dissolvable materials
        const dirs = [[-1,0],[1,0],[0,-1],[0,1]];
        for (const [dx, dy] of dirs) {
            const nx = x + dx, ny = y + dy;
            if (!grid.inBounds(nx, ny)) continue;
            const nType = grid.get(nx, ny);
            if (nType === 0) continue;
            const nElem = getElement(nType);
            if (nElem && nElem.dissolvable && Math.random() < 0.02) {
                grid.clear(nx, ny);
                // Acid also gets consumed
                if (Math.random() < 0.3) {
                    grid.clear(x, y);
                }
                return;
            }
        }
    }
});

// ID 30: Mud
registerElement({
    id: 30, name: 'Mud', category: 'Liquids',
    behavior: Behavior.LIQUID,
    baseColor: [90, 60, 30], colorVariance: 10,
    density: 65, dispersion: 1,
    flammable: false,
});

// ID 31: Honey
registerElement({
    id: 31, name: 'Honey', category: 'Liquids',
    behavior: Behavior.LIQUID,
    baseColor: [220, 170, 40], colorVariance: 10,
    density: 60, dispersion: 1,
    flammable: false,
});

// ID 32: Poison
registerElement({
    id: 32, name: 'Poison', category: 'Liquids',
    behavior: Behavior.LIQUID,
    baseColor: [100, 20, 150], colorVariance: 15,
    density: 52, dispersion: 4,
    flammable: false,
});

// ID 33: Mercury
registerElement({
    id: 33, name: 'Mercury', category: 'Liquids',
    behavior: Behavior.LIQUID,
    baseColor: [190, 190, 200], colorVariance: 5,
    density: 92, dispersion: 3,
    flammable: false,
    conductivity: 0.8,
});
