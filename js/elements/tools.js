import { registerElement, Behavior, getElement } from '../elements.js';
import { varyColor, randInt } from '../utils.js';

// ID 100: Erase (handled specially in input - just a selectable "element")
registerElement({
    id: 100, name: 'Erase', category: 'Tools',
    behavior: Behavior.TOOL,
    baseColor: [40, 40, 40], colorVariance: 0,
    density: 0, isTool: true, overwrite: true,
});

// ID 101: Clone (picks up element under cursor)
registerElement({
    id: 101, name: 'Clone', category: 'Tools',
    behavior: Behavior.TOOL,
    baseColor: [200, 200, 200], colorVariance: 0,
    density: 0, isTool: true,
});

// ID 102: Void - destroys anything it touches
registerElement({
    id: 102, name: 'Void', category: 'Tools',
    behavior: Behavior.STATIC,
    baseColor: [10, 0, 20], colorVariance: 5,
    density: 255, isTool: true, overwrite: true,
    update(x, y, grid, elem, sim) {
        const dirs = [[-1,0],[1,0],[0,-1],[0,1]];
        for (const [dx, dy] of dirs) {
            const nx = x + dx, ny = y + dy;
            if (grid.inBounds(nx, ny)) {
                const nType = grid.get(nx, ny);
                if (nType !== 0 && nType !== 102) {
                    grid.clear(nx, ny);
                }
            }
        }
    }
});

// ID 103: Faucet - spawns water below
registerElement({
    id: 103, name: 'Faucet', category: 'Tools',
    behavior: Behavior.STATIC,
    baseColor: [50, 150, 255], colorVariance: 5,
    density: 255, isTool: true, overwrite: true,
    update(x, y, grid, elem, sim) {
        if (grid.isEmpty(x, y + 1)) {
            const color = varyColor([30, 100, 200], 15);
            grid.set(x, y + 1, 2, color); // Water
        }
    }
});

// ID 104: Heater - raises temperature of neighbors
registerElement({
    id: 104, name: 'Heater', category: 'Tools',
    behavior: Behavior.STATIC,
    baseColor: [255, 80, 30], colorVariance: 10,
    density: 255, isTool: true, overwrite: true,
    update(x, y, grid, elem, sim) {
        grid.temperature[grid.index(x, y)] = 500;
        const dirs = [[-1,0],[1,0],[0,-1],[0,1]];
        for (const [dx, dy] of dirs) {
            const nx = x + dx, ny = y + dy;
            if (grid.inBounds(nx, ny) && grid.get(nx, ny) !== 0) {
                const ni = grid.index(nx, ny);
                grid.temperature[ni] = Math.min(1000, grid.temperature[ni] + 20);
            }
        }
    }
});

// ID 105: Cooler - lowers temperature of neighbors
registerElement({
    id: 105, name: 'Cooler', category: 'Tools',
    behavior: Behavior.STATIC,
    baseColor: [30, 150, 255], colorVariance: 10,
    density: 255, isTool: true, overwrite: true,
    update(x, y, grid, elem, sim) {
        grid.temperature[grid.index(x, y)] = -50;
        const dirs = [[-1,0],[1,0],[0,-1],[0,1]];
        for (const [dx, dy] of dirs) {
            const nx = x + dx, ny = y + dy;
            if (grid.inBounds(nx, ny) && grid.get(nx, ny) !== 0) {
                const ni = grid.index(nx, ny);
                grid.temperature[ni] = Math.max(-100, grid.temperature[ni] - 20);
            }
        }
    }
});

// ID 106: Wall - invisible static barrier
registerElement({
    id: 106, name: 'Wall', category: 'Tools',
    behavior: Behavior.STATIC,
    baseColor: [100, 100, 110], colorVariance: 5,
    density: 255, isTool: true, overwrite: true,
    dissolvable: false,
});
