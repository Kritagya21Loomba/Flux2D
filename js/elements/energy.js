import { registerElement, Behavior, getElement } from '../elements.js';
import { varyColor, randInt } from '../utils.js';

// ID 20: Fire
registerElement({
    id: 20, name: 'Fire', category: 'Energy',
    behavior: Behavior.ENERGY,
    baseColor: [255, 100, 0], colorVariance: 40,
    density: 5, lifetime: 35,

    update(x, y, grid, elem, sim) {
        const i = grid.index(x, y);
        const life = grid.lifetime[i];
        const ratio = life > 0 ? life / 35 : 0.5;

        // Animate color: yellow-white -> orange -> red
        grid.colorR[i] = Math.min(255, 200 + Math.floor(Math.random() * 55));
        grid.colorG[i] = Math.floor(ratio * 180 + Math.random() * 40);
        grid.colorB[i] = Math.floor(ratio * ratio * 60);

        // Heat
        grid.temperature[i] = 500;

        // Spread to flammable neighbors
        const dirs = [[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[1,-1],[-1,1],[1,1]];
        for (const [dx, dy] of dirs) {
            const nx = x + dx, ny = y + dy;
            if (!grid.inBounds(nx, ny)) continue;
            const nType = grid.get(nx, ny);
            if (nType === 0) continue;
            const neighbor = getElement(nType);
            if (neighbor && neighbor.flammable && Math.random() < (neighbor.burnRate || 0.05)) {
                const ni = grid.index(nx, ny);
                // Check if it's gunpowder -> explosion
                if (nType === 19) {
                    const expColor = varyColor([255, 200, 50], 30);
                    grid.setWithLifetime(nx, ny, 50, expColor, 4);
                } else {
                    const fireColor = varyColor([255, 100, 0], 40);
                    grid.setWithLifetime(nx, ny, 20, fireColor, 20 + randInt(0, 20));
                }
            }
        }

        // Rise like gas
        if (Math.random() < 0.65) {
            const dir = Math.random() < 0.5 ? -1 : 1;
            if (grid.isEmpty(x, y - 1)) {
                grid.swap(x, y, x, y - 1);
                // Spawn smoke behind
                if (Math.random() < 0.25) {
                    const smokeColor = varyColor([80, 80, 80], 20);
                    grid.setWithLifetime(x, y, 21, smokeColor, 50 + randInt(0, 40));
                }
            } else if (grid.isEmpty(x + dir, y - 1)) {
                grid.swap(x, y, x + dir, y - 1);
            }
        }

        // On death -> smoke or ash
        if (life <= 1 && life > 0) {
            if (Math.random() < 0.4) {
                const smokeColor = varyColor([60, 60, 60], 15);
                grid.setWithLifetime(x, y, 21, smokeColor, 40 + randInt(0, 40));
            } else if (Math.random() < 0.3) {
                const ashColor = varyColor([100, 95, 90], 10);
                grid.set(x, y, 22, ashColor); // Ash
            }
        }
    }
});

// ID 47: Ember
registerElement({
    id: 47, name: 'Ember', category: 'Energy',
    behavior: Behavior.POWDER,
    baseColor: [200, 60, 0], colorVariance: 25,
    density: 70, lifetime: 50,
    flammable: false,
    update(x, y, grid, elem, sim) {
        const i = grid.index(x, y);
        grid.temperature[i] = 300;

        // Animate
        const life = grid.lifetime[i];
        const ratio = life > 0 ? life / 50 : 0.5;
        grid.colorR[i] = Math.min(255, 150 + Math.floor(ratio * 105));
        grid.colorG[i] = Math.floor(ratio * 60);
        grid.colorB[i] = 0;

        // Chance to ignite flammable neighbors
        const dirs = [[-1,0],[1,0],[0,-1],[0,1]];
        for (const [dx, dy] of dirs) {
            const nx = x + dx, ny = y + dy;
            if (!grid.inBounds(nx, ny)) continue;
            const nType = grid.get(nx, ny);
            if (nType === 0) continue;
            const neighbor = getElement(nType);
            if (neighbor && neighbor.flammable && Math.random() < (neighbor.burnRate || 0.03) * 0.5) {
                const fireColor = varyColor([255, 100, 0], 40);
                grid.setWithLifetime(nx, ny, 20, fireColor, 25 + randInt(0, 15));
            }
        }
    }
});

// ID 48: Spark
registerElement({
    id: 48, name: 'Spark', category: 'Energy',
    behavior: Behavior.POWDER,
    baseColor: [255, 255, 200], colorVariance: 20,
    density: 20, lifetime: 8,
    flammable: false,
    update(x, y, grid, elem, sim) {
        grid.temperature[grid.index(x, y)] = 400;
        // Ignite anything flammable on contact
        const dirs = [[-1,0],[1,0],[0,-1],[0,1]];
        for (const [dx, dy] of dirs) {
            const nx = x + dx, ny = y + dy;
            if (!grid.inBounds(nx, ny)) continue;
            const nType = grid.get(nx, ny);
            if (nType === 0) continue;
            const neighbor = getElement(nType);
            if (neighbor && neighbor.flammable) {
                const fireColor = varyColor([255, 100, 0], 40);
                grid.setWithLifetime(nx, ny, 20, fireColor, 25 + randInt(0, 15));
                grid.clear(x, y);
                return;
            }
        }
    }
});

// ID 49: Lightning
registerElement({
    id: 49, name: 'Lightning', category: 'Energy',
    behavior: Behavior.ENERGY,
    baseColor: [180, 180, 255], colorVariance: 20,
    density: 1, lifetime: 3,
    update(x, y, grid, elem, sim) {
        const i = grid.index(x, y);
        grid.temperature[i] = 1000;

        // Animate bright white-blue
        grid.colorR[i] = 180 + Math.floor(Math.random() * 75);
        grid.colorG[i] = 180 + Math.floor(Math.random() * 75);
        grid.colorB[i] = 255;

        // Travel downward fast, branching
        for (let step = 0; step < 3; step++) {
            const dx = randInt(-1, 1);
            const ny = y + 1 + step;
            const nx = x + dx;
            if (!grid.inBounds(nx, ny)) continue;

            if (grid.isEmpty(nx, ny)) {
                const color = varyColor([180, 180, 255], 20);
                grid.setWithLifetime(nx, ny, 49, color, 2);
            } else {
                // Hit something -> heat it
                grid.temperature[grid.index(nx, ny)] = 800;
                const nType = grid.get(nx, ny);
                const nElem = getElement(nType);
                if (nElem && nElem.flammable) {
                    const fireColor = varyColor([255, 100, 0], 40);
                    grid.setWithLifetime(nx, ny, 20, fireColor, 30);
                }
                break;
            }
        }
    }
});

// ID 50: Explosion
registerElement({
    id: 50, name: 'Explosion', category: 'Energy',
    behavior: Behavior.ENERGY,
    baseColor: [255, 200, 50], colorVariance: 30,
    density: 1, lifetime: 4,
    update(x, y, grid, elem, sim) {
        const i = grid.index(x, y);
        grid.temperature[i] = 600;

        // Animate
        const life = grid.lifetime[i];
        grid.colorR[i] = 255;
        grid.colorG[i] = Math.floor(100 + Math.random() * 155);
        grid.colorB[i] = Math.floor(Math.random() * 80);

        // Destroy/propagate to all 8 neighbors
        const dirs = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
        for (const [dx, dy] of dirs) {
            const nx = x + dx, ny = y + dy;
            if (!grid.inBounds(nx, ny)) continue;
            const nType = grid.get(nx, ny);
            if (nType === 0) continue;
            const nElem = getElement(nType);
            if (nElem && (nElem.name === 'Bedrock' || nElem.name === 'Titanium')) continue;

            if (nType === 50) continue; // don't re-explode

            if (Math.random() < 0.45) {
                const expColor = varyColor([255, 200, 50], 30);
                grid.setWithLifetime(nx, ny, 50, expColor, 3 + randInt(0, 2));
            } else if (Math.random() < 0.3) {
                // Spawn fire
                const fireColor = varyColor([255, 100, 0], 40);
                grid.setWithLifetime(nx, ny, 20, fireColor, 15 + randInt(0, 20));
            } else {
                grid.clear(nx, ny);
            }

            grid.temperature[grid.index(nx, ny)] = 600;
        }
    }
});
