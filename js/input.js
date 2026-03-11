import { getElement } from './elements.js';
import { varyColor } from './utils.js';

export class InputHandler {
    constructor(canvas, grid, cellSize) {
        this.canvas = canvas;
        this.grid = grid;
        this.cellSize = cellSize;
        this.mouseDown = false;
        this.mouseButton = 0;
        this.mouseX = 0;
        this.mouseY = 0;
        this.gridX = 0;
        this.gridY = 0;
        this.prevGridX = -1;
        this.prevGridY = -1;
        this.brushSize = 3;
        this.selectedElement = 1; // Sand by default

        this._bindEvents();
    }

    _bindEvents() {
        this.canvas.addEventListener('mousedown', (e) => {
            this.mouseDown = true;
            this.mouseButton = e.button;
            this._updateMousePos(e);
            this.prevGridX = this.gridX;
            this.prevGridY = this.gridY;
            this._paint();
        });

        this.canvas.addEventListener('mousemove', (e) => {
            this._updateMousePos(e);
            if (this.mouseDown) {
                this._paint();
            }
        });

        window.addEventListener('mouseup', () => {
            this.mouseDown = false;
            this.prevGridX = -1;
            this.prevGridY = -1;
        });

        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());

        // Touch events
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.mouseDown = true;
            this.mouseButton = 0;
            const touch = e.touches[0];
            this._updateTouchPos(touch);
            this.prevGridX = this.gridX;
            this.prevGridY = this.gridY;
            this._paint();
        });

        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            this._updateTouchPos(touch);
            if (this.mouseDown) {
                this._paint();
            }
        });

        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.mouseDown = false;
            this.prevGridX = -1;
            this.prevGridY = -1;
        });
    }

    _updateMousePos(e) {
        const rect = this.canvas.getBoundingClientRect();
        this.mouseX = e.clientX - rect.left;
        this.mouseY = e.clientY - rect.top;
        this.gridX = Math.floor(this.mouseX / this.cellSize);
        this.gridY = Math.floor(this.mouseY / this.cellSize);
    }

    _updateTouchPos(touch) {
        const rect = this.canvas.getBoundingClientRect();
        this.mouseX = touch.clientX - rect.left;
        this.mouseY = touch.clientY - rect.top;
        this.gridX = Math.floor(this.mouseX / this.cellSize);
        this.gridY = Math.floor(this.mouseY / this.cellSize);
    }

    _paint() {
        if (this.prevGridX === -1) {
            this._paintBrush(this.gridX, this.gridY);
        } else {
            this._paintLine(this.prevGridX, this.prevGridY, this.gridX, this.gridY);
        }
        this.prevGridX = this.gridX;
        this.prevGridY = this.gridY;
    }

    _paintLine(x0, y0, x1, y1) {
        // Bresenham line
        const dx = Math.abs(x1 - x0);
        const dy = Math.abs(y1 - y0);
        const sx = x0 < x1 ? 1 : -1;
        const sy = y0 < y1 ? 1 : -1;
        let err = dx - dy;

        while (true) {
            this._paintBrush(x0, y0);
            if (x0 === x1 && y0 === y1) break;
            const e2 = 2 * err;
            if (e2 > -dy) { err -= dy; x0 += sx; }
            if (e2 < dx) { err += dx; y0 += sy; }
        }
    }

    _paintBrush(cx, cy) {
        const r = this.brushSize;
        const erasing = this.mouseButton === 2; // right-click = erase

        for (let dy = -r; dy <= r; dy++) {
            for (let dx = -r; dx <= r; dx++) {
                if (dx * dx + dy * dy > r * r) continue;
                const x = cx + dx;
                const y = cy + dy;
                if (!this.grid.inBounds(x, y)) continue;

                if (erasing) {
                    this.grid.clear(x, y);
                } else {
                    // Tool elements (id >= 100) may overwrite existing cells
                    const elem = getElement(this.selectedElement);
                    if (!elem) continue;

                    if (elem.isTool && elem.overwrite) {
                        const color = varyColor(elem.baseColor, elem.colorVariance || 10);
                        this.grid.set(x, y, this.selectedElement, color);
                    } else if (this.grid.isEmpty(x, y)) {
                        const color = varyColor(elem.baseColor, elem.colorVariance || 10);
                        this.grid.set(x, y, this.selectedElement, color);
                        if (elem.lifetime && elem.lifetime > 0) {
                            this.grid.lifetime[this.grid.index(x, y)] = elem.lifetime;
                        }
                        if (elem.temperature) {
                            this.grid.temperature[this.grid.index(x, y)] = elem.temperature;
                        }
                    }
                }
            }
        }
    }
}
