import { Grid } from './grid.js';
import { Renderer } from './renderer.js';
import { Simulation } from './simulation.js';
import { InputHandler } from './input.js';
import { UI } from './ui.js';
import { getElement } from './elements.js';
import { templates } from './templates.js';

// Import all element registration modules (side-effect imports)
import './elements/solids.js';
import './elements/powders.js';
import './elements/liquids.js';
import './elements/gases.js';
import './elements/life.js';
import './elements/energy.js';
import './elements/tools.js';

const CELL_SIZE = 4;

function init() {
    const canvas = document.getElementById('simCanvas');
    const mainArea = document.getElementById('main');

    // Size canvas to fill available space
    function sizeCanvas() {
        const rect = mainArea.getBoundingClientRect();
        const uiPanel = document.getElementById('ui-panel');
        const uiWidth = uiPanel.getBoundingClientRect().width;
        const availW = rect.width - uiWidth;
        const availH = rect.height;
        canvas.width = Math.floor(availW / CELL_SIZE) * CELL_SIZE;
        canvas.height = Math.floor(availH / CELL_SIZE) * CELL_SIZE;
    }
    sizeCanvas();

    const gridW = canvas.width / CELL_SIZE;
    const gridH = canvas.height / CELL_SIZE;

    const grid = new Grid(gridW, gridH);
    const renderer = new Renderer(canvas, grid, CELL_SIZE);
    const simulation = new Simulation(grid);
    const input = new InputHandler(canvas, grid, CELL_SIZE);
    const ui = new UI(input, simulation, grid);
    ui.build();

    // Populate template selector
    const templateSelect = document.getElementById('template-select');
    for (let i = 0; i < templates.length; i++) {
        const opt = document.createElement('option');
        opt.value = i;
        opt.textContent = templates[i].name;
        opt.title = templates[i].description;
        templateSelect.appendChild(opt);
    }
    templateSelect.addEventListener('change', () => {
        const idx = parseInt(templateSelect.value);
        if (!isNaN(idx) && templates[idx]) {
            simulation.paused = true;
            document.getElementById('btn-pause').textContent = '▶ Play';
            templates[idx].load(grid);
            templateSelect.value = '';
        }
    });

    // Override erase tool behavior: if selectedElement is 100 (Erase), right-click behavior
    const origPaintBrush = input._paintBrush.bind(input);
    input._paintBrush = function(cx, cy) {
        if (this.selectedElement === 100) {
            // Erase mode
            const r = this.brushSize;
            for (let dy = -r; dy <= r; dy++) {
                for (let dx = -r; dx <= r; dx++) {
                    if (dx * dx + dy * dy > r * r) continue;
                    const x = cx + dx, y = cy + dy;
                    if (this.grid.inBounds(x, y)) {
                        this.grid.clear(x, y);
                    }
                }
            }
        } else if (this.selectedElement === 101) {
            // Clone tool: pick up element under cursor
            if (this.grid.inBounds(cx, cy) && !this.grid.isEmpty(cx, cy)) {
                const elemId = this.grid.get(cx, cy);
                if (elemId !== 101) {
                    this.selectedElement = elemId;
                    // Update UI selection
                    const elem = getElement(elemId);
                    if (elem) {
                        document.querySelectorAll('.element-btn').forEach(b => {
                            b.classList.toggle('selected', b.textContent === elem.name);
                        });
                    }
                }
            }
        } else {
            origPaintBrush.call(this, cx, cy);
        }
    };

    // Get speed slider
    const speedSlider = document.getElementById('speed-slider');

    let lastTime = 0;
    let fpsCounter = 0;
    let fpsTimer = 0;
    let particleCountTimer = 0;

    function loop(timestamp) {
        const dt = timestamp - lastTime;
        lastTime = timestamp;

        // FPS tracking
        fpsCounter++;
        fpsTimer += dt;
        particleCountTimer += dt;
        if (fpsTimer >= 1000) {
            document.getElementById('fps').textContent = fpsCounter;
            fpsCounter = 0;
            fpsTimer = 0;
        }

        // Particle count (update less frequently for perf)
        if (particleCountTimer >= 500) {
            document.getElementById('particle-count').textContent = grid.countParticles();
            particleCountTimer = 0;
        }

        // Simulation steps
        if (!simulation.paused) {
            const speed = parseInt(speedSlider.value);
            for (let i = 0; i < speed; i++) {
                simulation.step();
            }
        }

        // Render
        renderer.render();

        // Brush preview
        if (input.gridX >= 0 && input.gridX < grid.width &&
            input.gridY >= 0 && input.gridY < grid.height) {
            renderer.renderBrushPreview(input.gridX, input.gridY, input.brushSize);
        }

        requestAnimationFrame(loop);
    }

    requestAnimationFrame(loop);

    // Handle resize
    window.addEventListener('resize', () => {
        const oldW = grid.width;
        const oldH = grid.height;
        sizeCanvas();
        const newW = canvas.width / CELL_SIZE;
        const newH = canvas.height / CELL_SIZE;

        if (newW !== oldW || newH !== oldH) {
            // Create new grid and copy what fits
            const newGrid = new Grid(newW, newH);
            const copyW = Math.min(oldW, newW);
            const copyH = Math.min(oldH, newH);
            for (let y = 0; y < copyH; y++) {
                for (let x = 0; x < copyW; x++) {
                    const oi = y * oldW + x;
                    const ni = y * newW + x;
                    newGrid.cells[ni] = grid.cells[oi];
                    newGrid.colorR[ni] = grid.colorR[oi];
                    newGrid.colorG[ni] = grid.colorG[oi];
                    newGrid.colorB[ni] = grid.colorB[oi];
                    newGrid.lifetime[ni] = grid.lifetime[oi];
                    newGrid.temperature[ni] = grid.temperature[oi];
                }
            }

            // Replace grid data
            grid.width = newW;
            grid.height = newH;
            grid.cells = newGrid.cells;
            grid.colorR = newGrid.colorR;
            grid.colorG = newGrid.colorG;
            grid.colorB = newGrid.colorB;
            grid.updated = newGrid.updated;
            grid.lifetime = newGrid.lifetime;
            grid.temperature = newGrid.temperature;

            renderer.resize(canvas.width, canvas.height);
        }
    });
}

window.addEventListener('DOMContentLoaded', init);
