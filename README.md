# Flux2D Sandbox

A Sandboxels-style falling-sand particle simulation built with vanilla JavaScript and HTML5 Canvas. No dependencies, no build tools — just open `index.html`.

## Run

Open `index.html` in any modern browser, or serve it locally:

```bash
# Python
python -m http.server 8000

# Node
npx serve .
```

Then open `http://localhost:8000`.

## Controls

| Action | Control |
|--------|---------|
| Paint element | Left-click / drag |
| Erase | Right-click / drag |
| Brush size | `[` / `]` keys or slider |
| Pause/Play | `Space` or button |
| Clear | `C` key or button |
| Speed | Slider (1x-8x) |

## Elements (52)

**Solids**: Stone, Brick, Metal, Glass, Ice, Obsidian, Titanium, Bedrock
**Powders**: Sand, Dirt, Snow, Gravel, Gunpowder, Ash, Salt, Rust, Coal, Thermite
**Liquids**: Water, Oil, Lava, Acid, Mud, Honey, Poison, Mercury
**Gases**: Smoke, Steam, Methane, Toxic Gas, Hydrogen, CO2
**Life**: Wood, Plant, Seed, Moss, Vine, Flower, Algae, Fungus
**Energy**: Fire, Ember, Spark, Lightning, Explosion
**Tools**: Erase, Clone, Void, Faucet, Heater, Cooler, Wall

## Features

- Cellular automaton grid simulation at 60fps
- Powder, liquid, gas, and energy physics
- Density-based displacement (sand sinks through water)
- Temperature system with phase transitions (ice melts, water boils)
- Fire spreads to flammable materials, produces smoke and ash
- Element reactions (water + lava = obsidian + steam, acid dissolves, etc.)
- Living elements (plants grow, vines spread, algae colonizes water)
- Tool elements (faucet spawns water, void destroys, heater/cooler)
- Touch support for mobile devices
- Keyboard shortcuts

## Architecture

```
js/
  main.js         — Game loop, canvas setup, wiring
  grid.js         — Parallel typed arrays (Uint8Array) for performance
  simulation.js   — Cellular automaton update (powder/liquid/gas algorithms)
  renderer.js     — ImageData pixel rendering (single putImageData per frame)
  elements.js     — Element registry and behavior categories
  elements/       — Element definitions by category
  input.js        — Mouse/touch with Bresenham line interpolation
  ui.js           — Element picker, toolbar, brush controls
  utils.js        — Color variation, random helpers
```

## License

MIT
