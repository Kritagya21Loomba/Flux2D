import { getElementsByCategory, getAllElements } from './elements.js';

export class UI {
    constructor(input, simulation, grid) {
        this.input = input;
        this.simulation = simulation;
        this.grid = grid;
    }

    build() {
        this._buildToolbar();
        this._buildElementPicker();
        this._buildBrushControls();
        this._bindKeyboardShortcuts();
    }

    _buildToolbar() {
        const pauseBtn = document.getElementById('btn-pause');
        const stepBtn = document.getElementById('btn-step');
        const clearBtn = document.getElementById('btn-clear');
        const speedSlider = document.getElementById('speed-slider');
        const speedLabel = document.getElementById('speed-label');

        pauseBtn.addEventListener('click', () => {
            this.simulation.paused = !this.simulation.paused;
            pauseBtn.textContent = this.simulation.paused ? '▶ Play' : '⏸ Pause';
            pauseBtn.classList.toggle('active', this.simulation.paused);
        });

        stepBtn.addEventListener('click', () => {
            if (this.simulation.paused) {
                this.simulation.step();
            }
        });

        clearBtn.addEventListener('click', () => {
            this.grid.clearAll();
        });

        speedSlider.addEventListener('input', () => {
            speedLabel.textContent = speedSlider.value + 'x';
        });
    }

    _buildElementPicker() {
        const picker = document.getElementById('element-picker');
        picker.innerHTML = '';
        const categories = ['Solids', 'Powders', 'Liquids', 'Gases', 'Life', 'Energy', 'Tools'];

        for (const cat of categories) {
            const elements = getElementsByCategory(cat);
            if (elements.length === 0) continue;

            const header = document.createElement('div');
            header.className = 'category-header';
            header.textContent = cat;
            header.addEventListener('click', () => {
                header.classList.toggle('collapsed');
                section.classList.toggle('collapsed');
            });
            picker.appendChild(header);

            const section = document.createElement('div');
            section.className = 'category-section';

            for (const elem of elements) {
                const btn = document.createElement('button');
                btn.className = 'element-btn';
                btn.textContent = elem.name;
                const [r, g, b] = elem.baseColor;
                btn.style.backgroundColor = `rgb(${r},${g},${b})`;
                // Contrast text
                const lum = 0.299 * r + 0.587 * g + 0.114 * b;
                btn.style.color = lum > 128 ? '#000' : '#fff';

                if (elem.id === this.input.selectedElement) {
                    btn.classList.add('selected');
                }

                btn.addEventListener('click', () => {
                    this.input.selectedElement = elem.id;
                    document.querySelectorAll('.element-btn').forEach(b => b.classList.remove('selected'));
                    btn.classList.add('selected');
                });

                section.appendChild(btn);
            }

            picker.appendChild(section);
        }
    }

    _buildBrushControls() {
        const slider = document.getElementById('brush-slider');
        const label = document.getElementById('brush-label');
        slider.value = this.input.brushSize;
        label.textContent = this.input.brushSize;

        slider.addEventListener('input', () => {
            this.input.brushSize = parseInt(slider.value);
            label.textContent = slider.value;
        });
    }

    _bindKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Don't capture shortcuts when typing in inputs
            if (e.target.tagName === 'INPUT') return;

            switch (e.key) {
                case ' ':
                    e.preventDefault();
                    this.simulation.paused = !this.simulation.paused;
                    document.getElementById('btn-pause').textContent =
                        this.simulation.paused ? '▶ Play' : '⏸ Pause';
                    document.getElementById('btn-pause').classList.toggle('active', this.simulation.paused);
                    break;
                case 'c':
                    this.grid.clearAll();
                    break;
                case '[':
                    this.input.brushSize = Math.max(1, this.input.brushSize - 1);
                    document.getElementById('brush-slider').value = this.input.brushSize;
                    document.getElementById('brush-label').textContent = this.input.brushSize;
                    break;
                case ']':
                    this.input.brushSize = Math.min(20, this.input.brushSize + 1);
                    document.getElementById('brush-slider').value = this.input.brushSize;
                    document.getElementById('brush-label').textContent = this.input.brushSize;
                    break;
            }
        });
    }
}
