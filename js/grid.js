export class Grid {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        const size = width * height;
        this.cells = new Uint8Array(size);       // element type ID (0 = empty)
        this.colorR = new Uint8Array(size);
        this.colorG = new Uint8Array(size);
        this.colorB = new Uint8Array(size);
        this.updated = new Uint8Array(size);     // 1 if processed this frame
        this.lifetime = new Int16Array(size);    // ticks remaining, -1 = infinite
        this.temperature = new Int16Array(size); // degrees, default 20
        this.temperature.fill(20);
    }

    index(x, y) {
        return y * this.width + x;
    }

    inBounds(x, y) {
        return x >= 0 && x < this.width && y >= 0 && y < this.height;
    }

    get(x, y) {
        return this.cells[this.index(x, y)];
    }

    isEmpty(x, y) {
        return this.inBounds(x, y) && this.cells[this.index(x, y)] === 0;
    }

    set(x, y, typeId, color) {
        const i = this.index(x, y);
        this.cells[i] = typeId;
        this.colorR[i] = color[0];
        this.colorG[i] = color[1];
        this.colorB[i] = color[2];
        this.lifetime[i] = -1;
    }

    setWithLifetime(x, y, typeId, color, lifetime) {
        const i = this.index(x, y);
        this.cells[i] = typeId;
        this.colorR[i] = color[0];
        this.colorG[i] = color[1];
        this.colorB[i] = color[2];
        this.lifetime[i] = lifetime;
    }

    clear(x, y) {
        const i = this.index(x, y);
        this.cells[i] = 0;
        this.colorR[i] = 0;
        this.colorG[i] = 0;
        this.colorB[i] = 0;
        this.lifetime[i] = 0;
        this.temperature[i] = 20;
    }

    swap(x1, y1, x2, y2) {
        const i1 = this.index(x1, y1);
        const i2 = this.index(x2, y2);

        let tmp;
        tmp = this.cells[i1]; this.cells[i1] = this.cells[i2]; this.cells[i2] = tmp;
        tmp = this.colorR[i1]; this.colorR[i1] = this.colorR[i2]; this.colorR[i2] = tmp;
        tmp = this.colorG[i1]; this.colorG[i1] = this.colorG[i2]; this.colorG[i2] = tmp;
        tmp = this.colorB[i1]; this.colorB[i1] = this.colorB[i2]; this.colorB[i2] = tmp;
        tmp = this.lifetime[i1]; this.lifetime[i1] = this.lifetime[i2]; this.lifetime[i2] = tmp;
        tmp = this.temperature[i1]; this.temperature[i1] = this.temperature[i2]; this.temperature[i2] = tmp;
    }

    clearAll() {
        this.cells.fill(0);
        this.colorR.fill(0);
        this.colorG.fill(0);
        this.colorB.fill(0);
        this.lifetime.fill(0);
        this.temperature.fill(20);
        this.updated.fill(0);
    }

    resetUpdated() {
        this.updated.fill(0);
    }

    countParticles() {
        let count = 0;
        for (let i = 0; i < this.cells.length; i++) {
            if (this.cells[i] !== 0) count++;
        }
        return count;
    }
}
