export class Renderer {
    constructor(canvas, grid, cellSize) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d', { alpha: false });
        this.grid = grid;
        this.cellSize = cellSize;
        this.imageData = this.ctx.createImageData(canvas.width, canvas.height);
        this.pixels = this.imageData.data;
        // Background color
        this.bgR = 26;
        this.bgG = 26;
        this.bgB = 46;
    }

    render() {
        const { width, height, cells, colorR, colorG, colorB } = this.grid;
        const { pixels, cellSize, bgR, bgG, bgB } = this;
        const canvasW = this.canvas.width;

        // Clear to background
        for (let i = 0; i < pixels.length; i += 4) {
            pixels[i] = bgR;
            pixels[i + 1] = bgG;
            pixels[i + 2] = bgB;
            pixels[i + 3] = 255;
        }

        // Draw each non-empty cell
        for (let gy = 0; gy < height; gy++) {
            for (let gx = 0; gx < width; gx++) {
                const gi = gy * width + gx;
                if (cells[gi] === 0) continue;

                const r = colorR[gi], g = colorG[gi], b = colorB[gi];
                const px = gx * cellSize;
                const py = gy * cellSize;

                for (let dy = 0; dy < cellSize; dy++) {
                    const rowStart = ((py + dy) * canvasW + px) * 4;
                    for (let dx = 0; dx < cellSize; dx++) {
                        const pi = rowStart + dx * 4;
                        pixels[pi] = r;
                        pixels[pi + 1] = g;
                        pixels[pi + 2] = b;
                        pixels[pi + 3] = 255;
                    }
                }
            }
        }

        this.ctx.putImageData(this.imageData, 0, 0);
    }

    renderBrushPreview(gridX, gridY, brushSize) {
        const cs = this.cellSize;
        const ctx = this.ctx;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(
            gridX * cs + cs / 2,
            gridY * cs + cs / 2,
            brushSize * cs,
            0, Math.PI * 2
        );
        ctx.stroke();
    }

    resize(canvasWidth, canvasHeight) {
        this.canvas.width = canvasWidth;
        this.canvas.height = canvasHeight;
        this.imageData = this.ctx.createImageData(canvasWidth, canvasHeight);
        this.pixels = this.imageData.data;
    }
}
