// Random integer in [min, max] inclusive
export function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Clamp value to range
export function clamp(val, min, max) {
    return val < min ? min : val > max ? max : val;
}

// Color variation: given base [r,g,b], return slightly varied color
export function varyColor(baseColor, variance = 10) {
    return [
        clamp(baseColor[0] + randInt(-variance, variance), 0, 255),
        clamp(baseColor[1] + randInt(-variance, variance), 0, 255),
        clamp(baseColor[2] + randInt(-variance, variance), 0, 255),
    ];
}
