import { getElement, Behavior } from './elements.js';
import { varyColor, randInt } from './utils.js';

export class Simulation {
    constructor(grid) {
        this.grid = grid;
        this.tick = 0;
        this.scanDirection = 1;
        this.paused = false;
    }

    togglePause() {
        this.paused = !this.paused;
    }

    step() {
        const { grid } = this;
        grid.resetUpdated();
        this.tick++;
        this.scanDirection *= -1;

        // Process bottom-to-top so falling elements work correctly
        for (let y = grid.height - 1; y >= 0; y--) {
            const startX = this.scanDirection === 1 ? 0 : grid.width - 1;
            const endX = this.scanDirection === 1 ? grid.width : -1;
            const stepX = this.scanDirection;

            for (let x = startX; x !== endX; x += stepX) {
                const i = grid.index(x, y);
                if (grid.cells[i] === 0) continue;
                if (grid.updated[i] === 1) continue;

                const elem = getElement(grid.cells[i]);
                if (!elem) continue;

                grid.updated[i] = 1;

                // Decrement lifetime
                if (grid.lifetime[i] > 0) {
                    grid.lifetime[i]--;
                    if (grid.lifetime[i] <= 0) {
                        grid.clear(x, y);
                        continue;
                    }
                }

                // Apply behavior-based movement
                switch (elem.behavior) {
                    case Behavior.POWDER: this._updatePowder(x, y, elem); break;
                    case Behavior.LIQUID: this._updateLiquid(x, y, elem); break;
                    case Behavior.GAS:   this._updateGas(x, y, elem); break;
                    case Behavior.ENERGY:
                    case Behavior.LIFE:
                        if (elem.update) elem.update(x, y, grid, elem, this);
                        break;
                    case Behavior.STATIC:
                        if (elem.update) elem.update(x, y, grid, elem, this);
                        break;
                }

                // Custom update for moving types (reactions etc.)
                if (elem.behavior !== Behavior.ENERGY && elem.behavior !== Behavior.LIFE
                    && elem.behavior !== Behavior.STATIC && elem.update) {
                    elem.update(x, y, grid, elem, this);
                }

                // Check reactions with neighbors
                if (elem.reactions) {
                    this._checkReactions(x, y, elem);
                }
            }
        }

        // Update temperature every few ticks (performance)
        if (this.tick % 2 === 0) {
            this._updateTemperature();
        }

        // Check phase transitions
        if (this.tick % 3 === 0) {
            this._checkPhaseTransitions();
        }
    }

    _updatePowder(x, y, elem) {
        // 1. Try straight down
        if (this._canDisplace(x, y, x, y + 1, elem)) {
            this._displace(x, y, x, y + 1);
            return;
        }

        // 2. Try diagonal (random direction first)
        const dir = Math.random() < 0.5 ? -1 : 1;
        if (this._canDisplace(x, y, x + dir, y + 1, elem)) {
            this._displace(x, y, x + dir, y + 1);
            return;
        }
        if (this._canDisplace(x, y, x - dir, y + 1, elem)) {
            this._displace(x, y, x - dir, y + 1);
        }
    }

    _updateLiquid(x, y, elem) {
        // 1. Try straight down
        if (this._canDisplace(x, y, x, y + 1, elem)) {
            this._displace(x, y, x, y + 1);
            return;
        }

        // 2. Try diagonal down
        const dir = Math.random() < 0.5 ? -1 : 1;
        if (this._canDisplace(x, y, x + dir, y + 1, elem)) {
            this._displace(x, y, x + dir, y + 1);
            return;
        }
        if (this._canDisplace(x, y, x - dir, y + 1, elem)) {
            this._displace(x, y, x - dir, y + 1);
            return;
        }

        // 3. Horizontal flow
        const dispersion = elem.dispersion || 3;
        for (let d = 1; d <= dispersion; d++) {
            if (this._canDisplace(x, y, x + dir * d, y, elem)) {
                this._displace(x, y, x + dir * d, y);
                return;
            }
        }
        for (let d = 1; d <= dispersion; d++) {
            if (this._canDisplace(x, y, x - dir * d, y, elem)) {
                this._displace(x, y, x - dir * d, y);
                return;
            }
        }
    }

    _updateGas(x, y, elem) {
        // 1. Try straight up
        if (this._canDisplace(x, y, x, y - 1, elem)) {
            this._displace(x, y, x, y - 1);
            return;
        }

        // 2. Try diagonal up
        const dir = Math.random() < 0.5 ? -1 : 1;
        if (this._canDisplace(x, y, x + dir, y - 1, elem)) {
            this._displace(x, y, x + dir, y - 1);
            return;
        }
        if (this._canDisplace(x, y, x - dir, y - 1, elem)) {
            this._displace(x, y, x - dir, y - 1);
            return;
        }

        // 3. Horizontal drift
        if (this._canDisplace(x, y, x + dir, y, elem)) {
            this._displace(x, y, x + dir, y);
            return;
        }
        if (this._canDisplace(x, y, x - dir, y, elem)) {
            this._displace(x, y, x - dir, y);
        }
    }

    _canDisplace(x, y, nx, ny, elem) {
        if (!this.grid.inBounds(nx, ny)) return false;
        const targetType = this.grid.get(nx, ny);
        if (targetType === 0) return true;

        const targetElem = getElement(targetType);
        if (!targetElem) return false;

        // Heavier displaces lighter (only non-static)
        if (targetElem.behavior !== Behavior.STATIC &&
            targetElem.behavior !== Behavior.TOOL &&
            elem.density > targetElem.density) {
            return true;
        }
        return false;
    }

    _displace(x, y, nx, ny) {
        const targetType = this.grid.get(nx, ny);
        if (targetType === 0) {
            this._moveCell(x, y, nx, ny);
        } else {
            this.grid.swap(x, y, nx, ny);
        }
        this.grid.updated[this.grid.index(nx, ny)] = 1;
    }

    _moveCell(fromX, fromY, toX, toY) {
        const g = this.grid;
        const fi = g.index(fromX, fromY);
        const ti = g.index(toX, toY);
        g.cells[ti] = g.cells[fi];
        g.colorR[ti] = g.colorR[fi];
        g.colorG[ti] = g.colorG[fi];
        g.colorB[ti] = g.colorB[fi];
        g.lifetime[ti] = g.lifetime[fi];
        g.temperature[ti] = g.temperature[fi];
        g.cells[fi] = 0;
        g.colorR[fi] = 0;
        g.colorG[fi] = 0;
        g.colorB[fi] = 0;
        g.lifetime[fi] = 0;
        g.temperature[fi] = 20;
    }

    _checkReactions(x, y, elem) {
        const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
        for (const [dx, dy] of dirs) {
            const nx = x + dx, ny = y + dy;
            if (!this.grid.inBounds(nx, ny)) continue;
            const neighborType = this.grid.get(nx, ny);
            if (neighborType === 0) continue;
            if (elem.reactions[neighborType]) {
                elem.reactions[neighborType](x, y, nx, ny, this.grid, this);
                return;
            }
        }
    }

    _updateTemperature() {
        const g = this.grid;
        const { width, height, temperature, cells } = g;
        // Simple temperature diffusion
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const i = g.index(x, y);
                if (cells[i] === 0) continue;

                const elem = getElement(cells[i]);
                const cond = elem ? (elem.conductivity || 0.1) : 0.1;

                let sum = 0, count = 0;
                const neighbors = [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]];
                for (const [nx, ny] of neighbors) {
                    if (!g.inBounds(nx, ny)) continue;
                    const ni = g.index(nx, ny);
                    if (cells[ni] === 0) continue;
                    sum += temperature[ni];
                    count++;
                }

                if (count > 0) {
                    const avg = sum / count;
                    temperature[i] += Math.round((avg - temperature[i]) * cond * 0.5);
                }

                // Ambient cooling
                if (temperature[i] > 22) temperature[i]--;
                else if (temperature[i] < 18) temperature[i]++;
            }
        }
    }

    _checkPhaseTransitions() {
        const g = this.grid;
        for (let y = 0; y < g.height; y++) {
            for (let x = 0; x < g.width; x++) {
                const i = g.index(x, y);
                if (g.cells[i] === 0) continue;
                const temp = g.temperature[i];
                const elem = getElement(g.cells[i]);
                if (!elem) continue;

                if (elem.meltPoint !== undefined && temp >= elem.meltPoint && elem.meltProduct !== undefined) {
                    this._transform(x, y, elem.meltProduct);
                }
                if (elem.freezePoint !== undefined && temp <= elem.freezePoint && elem.freezeProduct !== undefined) {
                    this._transform(x, y, elem.freezeProduct);
                }
                if (elem.boilPoint !== undefined && temp >= elem.boilPoint && elem.boilProduct !== undefined) {
                    this._transform(x, y, elem.boilProduct);
                }
            }
        }
    }

    _transform(x, y, newTypeId) {
        const newElem = getElement(newTypeId);
        if (!newElem) return;
        const color = varyColor(newElem.baseColor, newElem.colorVariance || 10);
        const i = this.grid.index(x, y);
        this.grid.cells[i] = newTypeId;
        this.grid.colorR[i] = color[0];
        this.grid.colorG[i] = color[1];
        this.grid.colorB[i] = color[2];
        if (newElem.lifetime && newElem.lifetime > 0) {
            this.grid.lifetime[i] = newElem.lifetime + randInt(0, 10);
        }
    }
}
