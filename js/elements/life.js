import { registerElement, Behavior, getElement } from '../elements.js';
import { varyColor, randInt } from '../utils.js';

// ID 39: Wood
registerElement({
    id: 39, name: 'Wood', category: 'Life',
    behavior: Behavior.STATIC,
    baseColor: [120, 80, 30], colorVariance: 15,
    density: 60, flammable: true, burnRate: 0.04,
    dissolvable: true,
});

// ID 40: Plant
registerElement({
    id: 40, name: 'Plant', category: 'Life',
    behavior: Behavior.LIFE,
    baseColor: [40, 160, 30], colorVariance: 25,
    density: 40, flammable: true, burnRate: 0.08,
    dissolvable: true,
    update(x, y, grid, elem, sim) {
        if (sim.tick % 4 !== 0) return;

        // Check for water nearby (below)
        let hasWater = false;
        for (let dy = 1; dy <= 3; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                if (grid.inBounds(x + dx, y + dy) && grid.get(x + dx, y + dy) === 2) {
                    hasWater = true;
                    if (Math.random() < 0.3) grid.clear(x + dx, y + dy); // consume water
                    break;
                }
            }
            if (hasWater) break;
        }

        if (hasWater && Math.random() < 0.12) {
            // Grow upward
            if (grid.isEmpty(x, y - 1)) {
                const color = varyColor([40, 160, 30], 25);
                grid.set(x, y - 1, 40, color);
            }
            // Branch sideways sometimes
            if (Math.random() < 0.25) {
                const dir = Math.random() < 0.5 ? -1 : 1;
                if (grid.isEmpty(x + dir, y - 1)) {
                    const color = varyColor([40, 160, 30], 25);
                    grid.set(x + dir, y - 1, 40, color);
                }
            }
            // Flower at tip
            if (Math.random() < 0.04 && grid.isEmpty(x, y - 1)) {
                const color = varyColor([220, 100, 150], 30);
                grid.set(x, y - 1, 44, color);
            }
        }
    }
});

// ID 41: Seed
registerElement({
    id: 41, name: 'Seed', category: 'Life',
    behavior: Behavior.POWDER,
    baseColor: [100, 140, 50], colorVariance: 15,
    density: 45, flammable: true, burnRate: 0.1,
    reactions: {
        2: (x, y, nx, ny, grid) => { // Water -> sprout into plant
            if (Math.random() < 0.05) {
                const color = varyColor([40, 160, 30], 25);
                const i = grid.index(x, y);
                grid.cells[i] = 40; // Plant
                grid.colorR[i] = color[0];
                grid.colorG[i] = color[1];
                grid.colorB[i] = color[2];
            }
        }
    }
});

// ID 42: Moss
registerElement({
    id: 42, name: 'Moss', category: 'Life',
    behavior: Behavior.LIFE,
    baseColor: [60, 120, 40], colorVariance: 15,
    density: 35, flammable: true, burnRate: 0.06,
    dissolvable: true,
    update(x, y, grid, elem, sim) {
        if (sim.tick % 8 !== 0) return;
        if (Math.random() > 0.1) return;

        // Spread to adjacent surfaces
        const dirs = [[-1,0],[1,0],[0,-1],[0,1]];
        const dir = dirs[randInt(0, 3)];
        const nx = x + dir[0], ny = y + dir[1];
        if (grid.isEmpty(nx, ny)) {
            // Only spread if there's a solid neighbor to cling to
            const checkDirs = [[-1,0],[1,0],[0,-1],[0,1]];
            for (const [cdx, cdy] of checkDirs) {
                const cx = nx + cdx, cy = ny + cdy;
                if (grid.inBounds(cx, cy)) {
                    const nElem = getElement(grid.get(cx, cy));
                    if (nElem && nElem.behavior === Behavior.STATIC) {
                        const color = varyColor([60, 120, 40], 15);
                        grid.set(nx, ny, 42, color);
                        return;
                    }
                }
            }
        }
    }
});

// ID 43: Vine
registerElement({
    id: 43, name: 'Vine', category: 'Life',
    behavior: Behavior.LIFE,
    baseColor: [30, 130, 20], colorVariance: 15,
    density: 35, flammable: true, burnRate: 0.06,
    dissolvable: true,
    update(x, y, grid, elem, sim) {
        if (sim.tick % 6 !== 0) return;
        if (Math.random() > 0.15) return;

        // Grow downward
        if (grid.isEmpty(x, y + 1)) {
            const color = varyColor([30, 130, 20], 15);
            grid.set(x, y + 1, 43, color);
        } else if (Math.random() < 0.3) {
            const dir = Math.random() < 0.5 ? -1 : 1;
            if (grid.isEmpty(x + dir, y + 1)) {
                const color = varyColor([30, 130, 20], 15);
                grid.set(x + dir, y + 1, 43, color);
            }
        }
    }
});

// ID 44: Flower
registerElement({
    id: 44, name: 'Flower', category: 'Life',
    behavior: Behavior.STATIC,
    baseColor: [220, 100, 150], colorVariance: 30,
    density: 30, flammable: true, burnRate: 0.15,
    dissolvable: true,
});

// ID 45: Algae
registerElement({
    id: 45, name: 'Algae', category: 'Life',
    behavior: Behavior.LIFE,
    baseColor: [40, 140, 80], colorVariance: 15,
    density: 48, flammable: false,
    dissolvable: true,
    update(x, y, grid, elem, sim) {
        if (sim.tick % 10 !== 0) return;
        if (Math.random() > 0.08) return;

        // Spread in water
        const dirs = [[-1,0],[1,0],[0,-1],[0,1]];
        const dir = dirs[randInt(0, 3)];
        const nx = x + dir[0], ny = y + dir[1];
        if (grid.inBounds(nx, ny) && grid.get(nx, ny) === 2) { // Water
            const color = varyColor([40, 140, 80], 15);
            grid.set(nx, ny, 45, color);
        }
    }
});

// ID 46: Fungus
registerElement({
    id: 46, name: 'Fungus', category: 'Life',
    behavior: Behavior.LIFE,
    baseColor: [160, 130, 80], colorVariance: 15,
    density: 35, flammable: true, burnRate: 0.05,
    dissolvable: true,
    update(x, y, grid, elem, sim) {
        if (sim.tick % 12 !== 0) return;
        if (Math.random() > 0.06) return;

        // Spread on wood
        const dirs = [[-1,0],[1,0],[0,-1],[0,1]];
        const dir = dirs[randInt(0, 3)];
        const nx = x + dir[0], ny = y + dir[1];
        if (grid.inBounds(nx, ny) && grid.get(nx, ny) === 39) { // Wood
            const color = varyColor([160, 130, 80], 15);
            grid.set(nx, ny, 46, color);
        }
    }
});
