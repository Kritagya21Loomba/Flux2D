import { getElement } from './elements.js';
import { varyColor, randInt } from './utils.js';

// Helper to place a cell with color variation
function place(grid, x, y, elemId, tempOverride) {
    if (!grid.inBounds(x, y)) return;
    const elem = getElement(elemId);
    if (!elem) return;
    const color = varyColor(elem.baseColor, elem.colorVariance || 10);
    grid.set(x, y, elemId, color);
    if (elem.lifetime && elem.lifetime > 0) {
        grid.lifetime[grid.index(x, y)] = elem.lifetime + randInt(0, 10);
    }
    if (tempOverride !== undefined) {
        grid.temperature[grid.index(x, y)] = tempOverride;
    } else if (elem.temperature) {
        grid.temperature[grid.index(x, y)] = elem.temperature;
    }
}

// Helper to draw a filled rectangle
function fillRect(grid, x, y, w, h, elemId, tempOverride) {
    for (let dy = 0; dy < h; dy++) {
        for (let dx = 0; dx < w; dx++) {
            place(grid, x + dx, y + dy, elemId, tempOverride);
        }
    }
}

// Helper to draw a thick wall (2px wide for leak-proof containment)
function thickWallV(grid, x, y, h, elemId) {
    fillRect(grid, x, y, 2, h, elemId);
}

// Helper to draw a line
function line(grid, x0, y0, x1, y1, elemId) {
    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;
    while (true) {
        place(grid, x0, y0, elemId);
        if (x0 === x1 && y0 === y1) break;
        const e2 = 2 * err;
        if (e2 > -dy) { err -= dy; x0 += sx; }
        if (e2 < dx) { err += dx; y0 += sy; }
    }
}

// Helper to draw a filled circle
function fillCircle(grid, cx, cy, r, elemId, tempOverride) {
    for (let dy = -r; dy <= r; dy++) {
        for (let dx = -r; dx <= r; dx++) {
            if (dx * dx + dy * dy <= r * r) {
                place(grid, cx + dx, cy + dy, elemId, tempOverride);
            }
        }
    }
}

// ── Template 1: Volcano ──────────────────────────────────────────────
// A stone mountain with lava pool at the summit, water lake at the base
function loadVolcano(grid) {
    grid.clearAll();
    const W = grid.width;
    const H = grid.height;
    const midX = Math.floor(W / 2);
    const baseY = H - 1;
    const floorTop = H - 5;

    // Ground floor (thick)
    fillRect(grid, 0, floorTop, W, 5, 3);

    // Build mountain (triangle) — solid stone
    const peakY = Math.floor(H * 0.25);
    const halfBase = Math.floor(W * 0.3);
    for (let y = peakY; y <= floorTop; y++) {
        const progress = (y - peakY) / (floorTop - peakY);
        const halfW = Math.floor(progress * halfBase);
        for (let x = midX - halfW; x <= midX + halfW; x++) {
            place(grid, x, y, 3); // Stone
        }
    }

    // Crater — hollow out the inside but keep thick walls
    const craterInnerW = 5;
    const craterD = 10;
    // Only hollow out the interior, leaving at least 2px of stone on each side
    for (let y = peakY; y < peakY + craterD; y++) {
        for (let x = midX - craterInnerW; x <= midX + craterInnerW; x++) {
            if (grid.inBounds(x, y)) grid.clear(x, y);
        }
    }

    // Re-enforce crater walls (2px thick on each side)
    for (let y = peakY; y < peakY + craterD; y++) {
        place(grid, midX - craterInnerW - 2, y, 3);
        place(grid, midX - craterInnerW - 1, y, 3);
        place(grid, midX + craterInnerW + 1, y, 3);
        place(grid, midX + craterInnerW + 2, y, 3);
    }
    // Crater floor (seal the bottom)
    fillRect(grid, midX - craterInnerW - 2, peakY + craterD, craterInnerW * 2 + 5, 2, 3);

    // Fill crater with lava (inside the sealed crater)
    for (let y = peakY + 1; y < peakY + craterD; y++) {
        for (let x = midX - craterInnerW; x <= midX + craterInnerW; x++) {
            place(grid, x, y, 28, 800); // Lava
        }
    }

    // Water lake on the left — build a fully sealed basin first
    const lakeL = 3;
    const lakeR = midX - Math.floor(W * 0.2);
    const lakeTop = H - 18;
    const lakeBot = floorTop; // sits on top of the stone floor
    // Basin: left wall (2px thick)
    fillRect(grid, lakeL, lakeTop, 2, lakeBot - lakeTop, 3);
    // Basin: right wall (2px thick)
    fillRect(grid, lakeR, lakeTop, 2, lakeBot - lakeTop, 3);
    // Basin: floor (connects left wall to right wall, on top of the stone ground)
    fillRect(grid, lakeL, lakeBot - 1, lakeR - lakeL + 2, 1, 3);
    // Fill with water (inside the sealed basin)
    for (let y = lakeTop + 1; y < lakeBot - 1; y++) {
        for (let x = lakeL + 2; x < lakeR; x++) {
            place(grid, x, y, 2);
        }
    }

    // Some trees on the right slope
    const treeBases = [
        [midX + Math.floor(W * 0.18), floorTop - 4],
        [midX + Math.floor(W * 0.25), floorTop - 3],
        [midX + Math.floor(W * 0.32), floorTop - 2],
    ];
    for (const [tx, ty] of treeBases) {
        // Trunk
        for (let y = ty; y > ty - 8; y--) {
            place(grid, tx, y, 39);
        }
        // Canopy
        fillCircle(grid, tx, ty - 10, 4, 40);
    }
}

// ── Template 2: Aquarium ─────────────────────────────────────────────
// A glass tank filled with water, sand floor, algae, bubbles
function loadAquarium(grid) {
    grid.clearAll();
    const W = grid.width;
    const H = grid.height;
    const margin = 15;
    const tankL = margin;
    const tankR = W - margin;
    const tankTop = 15;
    const tankBot = H - 10;

    // Glass walls (2px thick for leak-proof seal)
    for (let y = tankTop; y <= tankBot; y++) {
        place(grid, tankL, y, 12);
        place(grid, tankL + 1, y, 12);
        place(grid, tankR - 1, y, 12);
        place(grid, tankR, y, 12);
    }
    // Glass floor (2px thick, connects both walls)
    fillRect(grid, tankL, tankBot, tankR - tankL + 1, 2, 12);

    // Sand floor inside (100% fill — no gaps)
    for (let y = tankBot - 4; y < tankBot; y++) {
        for (let x = tankL + 2; x < tankR - 1; x++) {
            place(grid, x, y, 1);
        }
    }
    // Sand mound in center
    const midX = Math.floor(W / 2);
    for (let r = 8; r > 0; r--) {
        for (let x = midX - r; x <= midX + r; x++) {
            if (grid.inBounds(x, tankBot - 4 - (8 - r))) {
                place(grid, x, tankBot - 4 - (8 - r), 1);
            }
        }
    }

    // Fill with water (only in the sealed interior)
    for (let y = tankTop + 1; y < tankBot - 4; y++) {
        for (let x = tankL + 2; x < tankR - 1; x++) {
            if (grid.isEmpty(x, y)) place(grid, x, y, 2);
        }
    }

    // Algae patches
    const algaeSpots = [tankL + 12, midX - 15, midX + 15, tankR - 12];
    for (const ax of algaeSpots) {
        for (let i = 0; i < 5; i++) {
            const px = ax + randInt(-2, 2);
            const py = tankBot - 5 - randInt(0, 10);
            if (px > tankL + 2 && px < tankR - 1) {
                place(grid, px, py, 45);
            }
        }
    }

    // Some decorative plants on the sand
    for (let i = 0; i < 6; i++) {
        const px = tankL + 10 + randInt(0, tankR - tankL - 22);
        for (let j = 0; j < randInt(3, 8); j++) {
            place(grid, px, tankBot - 5 - j, 40);
        }
    }
}

// ── Template 3: Explosion Lab ────────────────────────────────────────
// Chambers filled with gunpowder, oil, methane, separated by glass/wood
function loadExplosionLab(grid) {
    grid.clearAll();
    const W = grid.width;
    const H = grid.height;
    const floorTop = H - 3;

    // Floor (thick metal)
    fillRect(grid, 0, floorTop, W, 3, 11);

    // Three chambers separated by glass walls
    const chamberW = Math.floor(W / 4);

    // Left chamber: Gunpowder pile + fuse
    const c1x = Math.floor(W * 0.15);
    const c1L = Math.floor(c1x - chamberW / 2);
    const c1R = Math.floor(c1x + chamberW / 2);
    // Glass walls (2px thick, connect to floor)
    fillRect(grid, c1L, 15, 2, floorTop - 15, 12);
    fillRect(grid, c1R, 15, 2, floorTop - 15, 12);
    // Pile of gunpowder
    for (let y = H - 15; y < floorTop; y++) {
        const w = Math.floor((floorTop - y) * 1.5) + 3;
        for (let x = c1x - w; x <= c1x + w; x++) {
            if (x > c1L + 1 && x < c1R) {
                place(grid, x, y, 19);
            }
        }
    }
    // A fuse (wood trail) leading up
    for (let y = H - 15; y > H - 25; y--) {
        place(grid, c1x, y, 39);
    }

    // Middle chamber: Oil pool + wood
    const c2x = Math.floor(W * 0.45);
    const c2L = Math.floor(c2x - chamberW / 2);
    const c2R = Math.floor(c2x + chamberW / 2);
    fillRect(grid, c2L, 15, 2, floorTop - 15, 12);
    fillRect(grid, c2R, 15, 2, floorTop - 15, 12);
    // Oil pool
    for (let y = H - 12; y < floorTop; y++) {
        for (let x = c2L + 2; x < c2R; x++) {
            place(grid, x, y, 27);
        }
    }
    // Wood scaffold above
    for (let i = -8; i <= 8; i += 4) {
        for (let y = H - 20; y < H - 12; y++) {
            place(grid, c2x + i, y, 39);
        }
    }
    fillRect(grid, c2x - 10, H - 20, 21, 1, 39);

    // Right chamber: Methane gas above coal (sealed)
    const c3x = Math.floor(W * 0.75);
    const c3L = Math.floor(c3x - chamberW / 2);
    const c3R = Math.floor(c3x + chamberW / 2);
    fillRect(grid, c3L, 15, 2, floorTop - 15, 12);
    fillRect(grid, c3R, 15, 2, floorTop - 15, 12);
    // Sealed top (connects both walls)
    fillRect(grid, c3L, 14, c3R - c3L + 2, 2, 12);
    // Coal pile at bottom
    for (let y = H - 10; y < floorTop; y++) {
        for (let x = c3L + 2; x < c3R; x++) {
            place(grid, x, y, 25);
        }
    }
    // Fill with methane gas
    for (let y = 17; y < H - 10; y++) {
        for (let x = c3L + 2; x < c3R; x++) {
            if (Math.random() < 0.4) place(grid, x, y, 35);
        }
    }

    // A fire source sitting between chambers (to be triggered by user)
    fillRect(grid, c1R + 3, H - 8, 3, 3, 47);

    // Thermite near the right chamber
    for (let i = 0; i < 15; i++) {
        place(grid, c3L - 3, floorTop - 1 - i, 26);
    }
}

// ── Template 4: Zen Garden ───────────────────────────────────────────
// Sandy garden with stone formations, water stream, plants, flowers
function loadZenGarden(grid) {
    grid.clearAll();
    const W = grid.width;
    const H = grid.height;
    const floorTop = H - 3;

    // Stone base
    fillRect(grid, 0, floorTop, W, 3, 3);

    // Sand floor (100% fill — no gaps so water doesn't seep through)
    for (let y = H - 15; y < floorTop; y++) {
        for (let x = 0; x < W; x++) {
            place(grid, x, y, 1);
        }
    }

    // Stone formations (3 rock clusters)
    const rocks = [
        [Math.floor(W * 0.2), H - 18, 6],
        [Math.floor(W * 0.55), H - 20, 8],
        [Math.floor(W * 0.8), H - 17, 5],
    ];
    for (const [rx, ry, rr] of rocks) {
        fillCircle(grid, rx, ry, rr, 3);
        // Moss on top of rocks
        for (let x = rx - rr + 1; x < rx + rr; x++) {
            if (Math.random() < 0.6) place(grid, x, ry - rr, 42);
            if (Math.random() < 0.4) place(grid, x, ry - rr + 1, 42);
        }
    }

    // Water stream — fully contained channel from top to a sealed pond
    const streamX = Math.floor(W * 0.35);

    // Build the pond first (sealed stone basin at the bottom of the stream)
    const pondL = streamX - 10;
    const pondR = streamX + 10;
    const pondTop = H - 17;
    const pondBot = H - 15; // sits on top of the sand floor
    // Pond walls (2px thick, connecting to sand floor)
    fillRect(grid, pondL, pondTop, 2, pondBot - pondTop + 1, 3);
    fillRect(grid, pondR, pondTop, 2, pondBot - pondTop + 1, 3);
    // Pond floor (sealed)
    fillRect(grid, pondL, pondBot, pondR - pondL + 2, 1, 3);

    // Channel walls (2px thick, connecting to pond walls)
    for (let y = 6; y <= pondTop; y++) {
        place(grid, streamX - 3, y, 3);
        place(grid, streamX - 4, y, 3);
        place(grid, streamX + 3, y, 3);
        place(grid, streamX + 4, y, 3);
    }

    // Pre-fill stream with water (inside sealed channel)
    for (let y = 7; y <= pondTop; y++) {
        for (let x = streamX - 2; x <= streamX + 2; x++) {
            if (grid.isEmpty(x, y)) place(grid, x, y, 2);
        }
    }
    // Fill pond with water
    for (let y = pondTop + 1; y < pondBot; y++) {
        for (let x = pondL + 2; x < pondR; x++) {
            if (grid.isEmpty(x, y)) place(grid, x, y, 2);
        }
    }

    // Faucet at top (inside the channel)
    place(grid, streamX, 6, 103);

    // Trees / plants
    const trees = [
        [Math.floor(W * 0.1), H - 16],
        [Math.floor(W * 0.65), H - 16],
        [Math.floor(W * 0.9), H - 16],
    ];
    for (const [tx, ty] of trees) {
        // Trunk
        for (let y = ty; y > ty - 10; y--) { place(grid, tx, y, 39); }
        // Canopy
        fillCircle(grid, tx, ty - 13, 5, 40);
        // Flowers on top
        for (let i = -3; i <= 3; i += 2) {
            place(grid, tx + i, ty - 18, 44);
        }
    }

    // Seeds scattered on sand
    for (let i = 0; i < 20; i++) {
        const sx = randInt(5, W - 5);
        const sy = H - 16;
        if (grid.isEmpty(sx, sy)) place(grid, sx, sy, 41);
    }
}

// ── Template 5: Winter Landscape ─────────────────────────────────────
// Snowy mountain with ice, frozen lake, heater melting one side
function loadWinterscape(grid) {
    grid.clearAll();
    const W = grid.width;
    const H = grid.height;
    const midX = Math.floor(W / 2);
    const floorTop = H - 4;

    // Ground (stone — thick base)
    fillRect(grid, 0, floorTop, W, 4, 3);

    // Rolling hills with stone
    for (let x = 0; x < W; x++) {
        const hillH = Math.floor(8 + 6 * Math.sin(x * 0.03) + 4 * Math.sin(x * 0.07 + 1));
        for (let y = floorTop - hillH; y < floorTop; y++) {
            place(grid, x, y, 3);
        }
    }

    // Snow cover on the hills (placed on top of stone, not overlapping)
    for (let x = 0; x < W; x++) {
        const hillH = Math.floor(8 + 6 * Math.sin(x * 0.03) + 4 * Math.sin(x * 0.07 + 1));
        const topY = floorTop - hillH;
        // Place snow above the stone surface
        for (let d = 0; d < 3; d++) {
            if (Math.random() < 0.9 - d * 0.2) {
                place(grid, x, topY - 1 - d, 17, -15);
            }
        }
    }

    // Frozen lake in the right valley — fully sealed basin
    const lakeL = Math.floor(W * 0.6);
    const lakeR = Math.floor(W * 0.85);
    const lakeY = H - 14;
    // Dig out a basin (clear stone in this area)
    for (let y = lakeY; y < floorTop; y++) {
        for (let x = lakeL + 2; x < lakeR; x++) {
            if (grid.inBounds(x, y)) grid.clear(x, y);
        }
    }
    // Basin walls (2px thick, connecting to the stone ground floor)
    fillRect(grid, lakeL, lakeY, 2, floorTop - lakeY + 1, 3);
    fillRect(grid, lakeR, lakeY, 2, floorTop - lakeY + 1, 3);
    // Basin floor (sealed, sits on stone ground)
    fillRect(grid, lakeL, floorTop - 1, lakeR - lakeL + 2, 2, 3);
    // Fill with water
    for (let y = lakeY + 3; y < floorTop - 1; y++) {
        for (let x = lakeL + 2; x < lakeR; x++) {
            place(grid, x, y, 2);
        }
    }
    // Ice layer on top (2 rows thick)
    for (let x = lakeL + 2; x < lakeR; x++) {
        place(grid, x, lakeY + 1, 13, -20);
        place(grid, x, lakeY + 2, 13, -20);
    }

    // Snowfall (sparse snow particles in the air)
    for (let i = 0; i < 120; i++) {
        const sx = randInt(0, W - 1);
        const sy = randInt(0, Math.floor(H * 0.5));
        if (grid.isEmpty(sx, sy)) place(grid, sx, sy, 17, -15);
    }

    // Ice mountain on the left — solid stone core with ice shell
    const peakX = Math.floor(W * 0.2);
    const peakY = Math.floor(H * 0.2);
    // Build solid stone core first
    for (let y = peakY; y < H - 10; y++) {
        const progress = (y - peakY) / (H - 10 - peakY);
        const halfW = Math.floor(progress * 15);
        for (let x = peakX - halfW; x <= peakX + halfW; x++) {
            place(grid, x, y, 3); // Stone core
        }
    }
    // Ice shell on the outside
    for (let y = peakY; y < H - 10; y++) {
        const progress = (y - peakY) / (H - 10 - peakY);
        const halfW = Math.floor(progress * 15);
        // Only place ice on the outer 3 pixels of each side
        for (let d = 0; d < 3; d++) {
            if (peakX - halfW + d >= 0) place(grid, peakX - halfW + d, y, 13, -20);
            if (peakX + halfW - d < W) place(grid, peakX + halfW - d, y, 13, -20);
        }
    }
    // Snow cap
    for (let y = peakY - 3; y < peakY + 5; y++) {
        for (let x = peakX - 4; x <= peakX + 4; x++) {
            if (Math.random() < 0.7) place(grid, x, y, 17, -15);
        }
    }

    // Heater on the right side (to melt things)
    place(grid, lakeR + 5, lakeY + 1, 104);

    // A wood cabin
    const cabinX = Math.floor(W * 0.45);
    const cabinY = H - 18;
    // Build solid walls and floor
    fillRect(grid, cabinX - 5, cabinY, 11, 6, 39); // Solid wood block
    // Hollow interior
    for (let y = cabinY + 1; y < cabinY + 5; y++) {
        for (let x = cabinX - 4; x <= cabinX + 4; x++) {
            grid.clear(x, y);
        }
    }
    // Roof (snow)
    fillRect(grid, cabinX - 6, cabinY - 1, 13, 1, 17);
}

// ── Template registry ────────────────────────────────────────────────
export const templates = [
    { name: 'Volcano', description: 'Lava-filled volcano with lake and trees', load: loadVolcano },
    { name: 'Aquarium', description: 'Glass tank with water, sand, and algae', load: loadAquarium },
    { name: 'Explosion Lab', description: 'Gunpowder, oil, and methane ready to ignite', load: loadExplosionLab },
    { name: 'Zen Garden', description: 'Sand garden with stream, rocks, and plants', load: loadZenGarden },
    { name: 'Winterscape', description: 'Snowy mountains, frozen lake, and ice', load: loadWinterscape },
];
