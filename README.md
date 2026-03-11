# Flux2D Sandbox

A Sandboxels-style falling-sand particle simulation built with vanilla JavaScript and HTML5 Canvas. Zero dependencies, zero build tools, zero frameworks — just pure web tech delivering a full-featured physics sandbox at 60fps.

---

## Table of Contents

- [Demo](#demo)
- [Getting Started](#getting-started)
- [Controls](#controls)
- [Elements](#elements-52)
- [Templates](#templates)
- [Features](#features)
- [Architecture](#architecture)
- [File Structure](#file-structure)
- [How It Works](#how-it-works)
- [Deployment](#deployment)
- [License](#license)

---

## Demo

Open `index.html` in any modern browser to start simulating. Paint elements onto the canvas and watch physics, chemistry, and biology unfold in real time.

---

## Getting Started

### Option 1: Direct open

Just double-click `index.html` in your file explorer. Works in Chrome, Firefox, Edge, and Safari.

> **Note:** If elements don't load, your browser may block ES modules over `file://`. Use Option 2 instead.

### Option 2: Local server

```bash
# Python
python -m http.server 8000

# Node.js
npx serve .

# PHP
php -S localhost:8000
```

Then open `http://localhost:8000` in your browser.

---

## Controls

| Action | Control |
|--------|---------|
| Paint element | Left-click / drag |
| Erase | Right-click / drag |
| Brush size up | `]` key |
| Brush size down | `[` key |
| Brush size | Slider in toolbar |
| Pause / Play | `Space` key or toolbar button |
| Single step | Step button (while paused) |
| Clear canvas | `C` key or toolbar button |
| Simulation speed | Speed slider (1x – 8x) |
| Load template | Template dropdown in toolbar |

The brush preview circle is displayed around your cursor while hovering over the canvas.

---

## Elements (52)

### Solids (8)
Static elements that don't move. They form structures, walls, and containers.

| Element | Description |
|---------|-------------|
| **Stone** | Basic building block, doesn't burn or melt easily |
| **Brick** | Decorative solid, similar to stone |
| **Metal** | Conductive solid, high melting point |
| **Glass** | Transparent solid, shatters under extreme heat |
| **Ice** | Frozen solid, melts at high temperatures into water |
| **Obsidian** | Formed when water meets lava, extremely durable |
| **Titanium** | Strongest solid, virtually indestructible |
| **Bedrock** | Immovable, indestructible foundation block |

### Powders (10)
Granular elements that fall and pile up. They obey gravity and stack on surfaces.

| Element | Description |
|---------|-------------|
| **Sand** | Classic falling sand, piles naturally |
| **Dirt** | Heavier than sand, supports plant growth |
| **Snow** | Cold powder, melts at warm temperatures into water |
| **Gravel** | Heavy aggregate, falls faster than sand |
| **Gunpowder** | Explosive powder, ignites near fire or sparks |
| **Ash** | Lightweight residue left by burned materials |
| **Salt** | Dissolves in water, denser than sand |
| **Rust** | Corroded metal particles |
| **Coal** | Combustible fuel, burns slowly |
| **Thermite** | Extremely reactive, burns at very high temperatures |

### Liquids (8)
Fluid elements that flow, fill containers, and interact with other elements.

| Element | Description |
|---------|-------------|
| **Water** | Flows and fills spaces, extinguishes fire, reacts with lava to form obsidian + steam |
| **Oil** | Flammable liquid, floats on water (lower density) |
| **Lava** | Extremely hot liquid, ignites flammable materials, cools into stone |
| **Acid** | Corrosive liquid, dissolves most materials it touches |
| **Mud** | Thick liquid, formed from water + dirt interactions |
| **Honey** | Very viscous liquid, flows slowly |
| **Poison** | Toxic liquid, kills living elements |
| **Mercury** | Dense metallic liquid, sinks below everything |

### Gases (6)
Lightweight elements that rise and drift. They disperse over time.

| Element | Description |
|---------|-------------|
| **Smoke** | Produced by fire, rises and fades away |
| **Steam** | Produced by boiling water or water meeting lava, rises and dissipates |
| **Methane** | Flammable gas, explosive when ignited |
| **Toxic Gas** | Poisonous, kills living elements |
| **Hydrogen** | Lightest gas, rises fastest, highly flammable |
| **CO2** | Heavy gas, sinks below other gases |

### Life (8)
Organic elements that grow, spread, and interact with their environment.

| Element | Description |
|---------|-------------|
| **Wood** | Solid organic material, flammable, used for structures |
| **Plant** | Grows slowly, needs space, flammable |
| **Seed** | Falls like a powder, sprouts into plants on contact with dirt/sand |
| **Moss** | Spreads slowly across stone and solid surfaces |
| **Vine** | Grows downward, hangs from surfaces |
| **Flower** | Decorative plant element |
| **Algae** | Aquatic plant, grows and spreads in water |
| **Fungus** | Spreads in dark, damp conditions |

### Energy (5)
Dynamic elements that produce heat, light, and destruction.

| Element | Description |
|---------|-------------|
| **Fire** | Burns flammable materials, rises like gas, produces smoke and ash |
| **Ember** | Smoldering hot particle, can ignite nearby flammables |
| **Spark** | Fast-moving energy particle, ignites on contact |
| **Lightning** | Powerful electrical discharge |
| **Explosion** | Rapid expanding force, destroys nearby elements |

### Tools (7)
Special utility elements that modify the simulation.

| Element | Description |
|---------|-------------|
| **Erase** | Removes any element (same as right-click) |
| **Clone** | Duplicates whatever element is below it |
| **Void** | Permanently destroys any element that touches it |
| **Faucet** | Continuously spawns water (or the element above it) |
| **Heater** | Raises temperature of nearby elements |
| **Cooler** | Lowers temperature of nearby elements |
| **Wall** | Invisible barrier, blocks all movement |

---

## Templates

Five pre-built sandbox environments accessible from the toolbar dropdown. Templates pause the simulation on load so you can inspect them before pressing Play.

| Template | Description |
|----------|-------------|
| **Volcano** | A stone mountain with a lava-filled crater at the summit, a sealed water lake at the base, and trees on the slope |
| **Aquarium** | A glass tank filled with water over a sandy floor, decorated with algae and aquatic plants |
| **Explosion Lab** | Three sealed chambers containing gunpowder, oil, and methane — ready for chain reactions |
| **Zen Garden** | A tranquil sand garden with stone formations, a flowing water stream with faucet, and trees with flowers |
| **Winterscape** | Snowy rolling hills, an ice-capped mountain, a frozen lake, falling snow, and a wooden cabin |

---

## Features

### Physics Simulation
- **Cellular automaton** grid running at up to 60fps
- **Powder physics** — granular elements fall, pile, and slide at angles
- **Liquid physics** — fluids flow horizontally with configurable dispersion rates
- **Gas physics** — gases rise, drift, and disperse naturally
- **Density displacement** — heavier elements sink through lighter ones (sand sinks through water, mercury sinks through everything)
- **Temperature system** — heat conducts between neighboring cells, ambient cooling pulls toward equilibrium
- **Phase transitions** — ice melts into water, water boils into steam, lava cools into stone

### Chemistry & Reactions
- **Element reactions** — water + lava = obsidian + steam, acid dissolves solids, fire spreads to flammables
- **Per-element reaction maps** — each element defines what happens when it contacts specific neighbors
- **Chain reactions** — gunpowder explosions can trigger methane ignition, thermite chains, etc.

### Biology
- **Plant growth** — seeds sprout, plants spread, vines grow downward
- **Moss colonization** — slowly covers stone surfaces
- **Algae blooms** — spreads through water bodies
- **Fungal growth** — expands in suitable conditions

### Rendering
- **ImageData pixel rendering** — writes directly to pixel buffer, single `putImageData()` per frame
- **Color variation** — each placed cell gets slight color randomization for a natural look
- **Brush preview** — circular outline shows brush size and position
- **FPS counter** — real-time performance monitoring
- **Particle counter** — displays total active elements on screen

### Input
- **Mouse painting** with Bresenham line interpolation (no gaps when dragging fast)
- **Circular brush** with adjustable size (1–20)
- **Right-click erase** for quick removal
- **Touch support** for mobile and tablet devices
- **Keyboard shortcuts** for common actions

### UI
- **Element picker** — categorized, collapsible sidebar with color-coded buttons
- **Toolbar** — pause, step, clear, speed slider, brush slider, template selector
- **Dark theme** — easy on the eyes, looks great in screenshots

---

## Architecture

The simulation uses a **parallel typed array** architecture for maximum performance. Instead of an array of cell objects, cell properties are stored in separate `Uint8Array` and `Int16Array` buffers indexed by grid position. This is cache-friendly and avoids garbage collection overhead.

### Core Loop

```
requestAnimationFrame
  → simulation.step()        // Update all cells bottom-to-top
    → process powders         // Try: down, diagonal-down
    → process liquids         // Try: down, diagonal-down, horizontal
    → process gases           // Try: up, diagonal-up, horizontal
    → density displacement    // Heavy sinks through light
    → temperature conduction  // Every 2 ticks
    → phase transitions       // Every 3 ticks
    → reaction checks         // Per-element neighbor reactions
  → renderer.render()         // Write grid to ImageData pixels
    → putImageData()          // Single draw call to canvas
```

### Scan Direction

To prevent directional bias (elements always falling left or right), the simulation **alternates horizontal scan direction** each tick — left-to-right on odd ticks, right-to-left on even ticks.

---

## File Structure

```
Flux2D/
├── index.html              Entry point — HTML shell with toolbar, canvas, and sidebar
├── css/
│   └── style.css           All styling (flexbox layout, dark theme, element picker)
├── js/
│   ├── main.js             Game loop, canvas setup, event wiring, template loader
│   ├── grid.js             Grid data structure — parallel typed arrays for cells,
│   │                       color, lifetime, temperature, and update flags
│   ├── simulation.js       Core update loop — powder/liquid/gas movement,
│   │                       density displacement, temperature, reactions
│   ├── renderer.js         Canvas rendering with ImageData pixel buffer
│   ├── elements.js         Element registry, behavior categories (STATIC, POWDER,
│   │                       LIQUID, GAS, ENERGY, LIFE, TOOL), register/get helpers
│   ├── elements/
│   │   ├── solids.js       Stone, Brick, Metal, Glass, Ice, Obsidian, Titanium, Bedrock
│   │   ├── powders.js      Sand, Dirt, Snow, Gravel, Gunpowder, Ash, Salt, Rust, Coal, Thermite
│   │   ├── liquids.js      Water, Oil, Lava, Acid, Mud, Honey, Poison, Mercury
│   │   ├── gases.js        Smoke, Steam, Methane, Toxic Gas, Hydrogen, CO2
│   │   ├── life.js         Wood, Plant, Seed, Moss, Vine, Flower, Algae, Fungus
│   │   ├── energy.js       Fire, Ember, Spark, Lightning, Explosion
│   │   └── tools.js        Erase, Clone, Void, Faucet, Heater, Cooler, Wall
│   ├── templates.js        5 pre-built sandbox environments with sealed containers
│   ├── ui.js               Element picker, toolbar, brush controls, keyboard shortcuts
│   ├── input.js            Mouse/touch painting with Bresenham line, circular brush
│   └── utils.js            Color variation, random int, clamp helpers
└── README.md
```

---

## How It Works

### Grid Storage

Each cell on the grid is represented by an index `i = y * width + x`. Properties are stored in parallel arrays:

| Array | Type | Purpose |
|-------|------|---------|
| `cells` | `Uint8Array` | Element ID (0 = empty) |
| `colorR` | `Uint8Array` | Red channel |
| `colorG` | `Uint8Array` | Green channel |
| `colorB` | `Uint8Array` | Blue channel |
| `updated` | `Uint8Array` | Already processed this tick? |
| `lifetime` | `Int16Array` | Remaining ticks before death (fire, smoke, etc.) |
| `temperature` | `Int16Array` | Cell temperature (default 20, affects phase transitions) |

### Element Behaviors

Each element has a `behavior` category that determines its base movement:

- **STATIC** — Never moves
- **POWDER** — Falls down, slides diagonally when blocked
- **LIQUID** — Falls down, slides diagonally, flows horizontally (dispersion rate varies)
- **GAS** — Rises up, drifts diagonally, spreads horizontally
- **ENERGY** — Custom update function (fire rises + spreads, lightning arcs, etc.)
- **LIFE** — Custom update function (plants grow, vines extend, etc.)
- **TOOL** — Custom update function (faucet spawns, void destroys, etc.)

### Element IDs

| Range | Category |
|-------|----------|
| 0 | Empty |
| 1–9 | Common elements (sand, water, stone, dirt) |
| 10–19 | Solids and powders |
| 20–29 | Energy and reactive elements |
| 30–50 | Additional liquids, gases, life, and energy |
| 100+ | Tools |

---

## Deployment

This is a pure static site — no server, no build step, no dependencies. Deploy anywhere that serves static files for free:

### GitHub Pages
1. Push to a GitHub repository
2. Go to **Settings → Pages → Source: main branch**
3. Site is live at `https://yourusername.github.io/Flux2D/`

### Netlify
1. Go to [netlify.com](https://netlify.com) and sign up
2. Drag and drop the `Flux2D` folder onto the dashboard
3. Site is live instantly with a `.netlify.app` URL

### Vercel
1. Connect your GitHub repo at [vercel.com](https://vercel.com)
2. Auto-detects static site and deploys

### Cloudflare Pages
1. Connect your GitHub repo at [pages.cloudflare.com](https://pages.cloudflare.com)
2. Deploys to a global edge network

---

## License

MIT
