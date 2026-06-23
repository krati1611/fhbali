# 🏡 FH Nyang Nyang Villa — 3D Model Design Brief for Claude Design

## What This Project Is

This is a **3D interactive architectural model** of a luxury Balinese villa resort called **"FH Nyang Nyang"**, built with **React Three Fiber** (Three.js + React). It runs in the browser as a web app.

The resort consists of **4 identical villa modules** arranged side-by-side in a row, connected by a shared corridor walkway. Each villa has a bedroom, bathroom, entrance hall, outdoor stone terrace, private plunge pool, and a planter garden strip.

---

## Tech Stack

| Tool | Purpose |
|---|---|
| React + TypeScript | UI framework |
| Three.js via `@react-three/fiber` | 3D rendering |
| `@react-three/drei` | Helpers (OrbitControls, textures, shadows) |
| GSAP | Animations (explode, hover, camera fly) |
| Vite | Build tool / dev server |

---

## Project Structure

```
src/
├── App.tsx                      # Canvas, lighting, UI buttons, keyboard shortcuts
├── App.css                      # UI overlay styles
├── index.css                    # Global styles
└── components/
    ├── Materials.ts             # Shared THREE material definitions (legacy)
    ├── BaliEnvironment.tsx      # Trees, bushes, grass plane (scene decoration)
    ├── VillaComplex.tsx         # Arranges 4 villas + corridor + entrance gate
    └── VillaModule.tsx          # THE MAIN FILE — single villa with full interior
public/
├── brick_texture_*.png          # Terracotta / brick texture
├── roof_texture_*.png           # Ironwood roof texture
├── teak_texture_*.png           # Teak wood texture
└── media__*.png                 # Floor plan reference images
```

---

## Architecture of a Single Villa Module

Each `VillaModule` is built at a local coordinate origin `[0, 0, 0]` and positioned by `VillaComplex`. The module footprint is approximately **8.19m × 8.48m**.

### Room Layout (top-down view, Z increases downward)

```
Z=0    ┌─────────────────────────────────────────────────┐
       │              CORRIDOR / WALKWAY                  │
Z=1.45 ├──────────┬────────────────────┬────────┬────────┤
       │          │                    │        │        │
       │ ENTRANCE │    BATHROOM        │  POOL  │PLANTER │
       │  HALL    │  (vanity, toilet,  │  AREA  │  BED   │
       │(wardrobe)│   shower)          │(water) │(green) │
Z=3.22 │          ├────────────────────┤        │        │
Z=3.48 ├──────────┘                    │        │        │
       │                    │          │        │        │
       │    BEDROOM         │ OUTDOOR  │  POOL  │PLANTER │
       │  (king bed,        │ STONE    │(blue   │  BED   │
       │   nightstands,     │ TERRACE  │ water) │(green) │
       │   lamps, chair)    │(pebbles) │        │        │
       │                    │          │        │        │
Z=7.28 └────────────────────┴──────────┴────────┴────────┘
       X=0      X=2.25   X=3.75    X=5.61   X=7.36  X=8.19
```

### Vertical Structure
- **Y=0**: Ground / foundation floor (andesite stone, 0.1m thick)
- **Y=0.1**: Floor overlays (teak parquet for bedroom, stone tiles for bathroom, etc.)
- **Y=0 to Y=2.8**: Walls (thin 0.1m panels, cream color #F2EBDD)
- **Y=3.0 to Y=3.2**: Roof (ironwood with slight slope, teak beams underneath)
- **Y=-0.6 to Y=0.46**: Pool (sunken below ground, blue water fills the basin)

---

## What's Already Built (Current State)

### Walls & Structure
- All exterior walls (left, back, front with entrance door opening)
- Interior partitions (entrance/bedroom, entrance/bathroom, bathroom/bedroom, bathroom/terrace)
- Sliding glass doors between bedroom and terrace (transparent, physical material)
- Teak entrance door
- Wall between villa interior and pool area

### Bedroom Interior
- King bed (2.0×1.9m) — teak base, white mattress, teak headboard against left wall
- 2 white pillows (slightly tilted)
- Terracotta folded blanket across foot of bed
- Woven cream rug (2.4×2.4m) under bed
- 2 teak nightstands with bronze bedside lamps (emissive warm glow + point lights)
- Lounge chair (cream linen) in corner, angled
- Teak parquet floor with texture

### Bathroom Interior
- Double teak vanity (1.76m wide) with 2 white ceramic basin sinks
- Backlit mirror (1.6×0.8m, metallic surface) with warm point light
- Toilet (white ceramic) in compartment
- Walk-in shower glass screen + bronze rain showerhead
- White/grey stone tile floor

### Entrance Hall
- Teak wardrobe (full height, 0.8×0.5m) with ironwood door panels
- Console table with decorative ceramic vase
- Grey stone floor

### Outdoor / Pool
- Stone terrace with pebble accents (cylindrical stones)
- Plunge pool — DodgerBlue (#1E90FF) water body + light blue shimmer surface (#4FC3F7)
- Pool coping stones (#E8E2D5) around edges
- Pool seating ledge (andesite)
- Terracotta feature wall with 3 bronze water spouts
- Green planter bed strip alongside pool

### Roof
- Ironwood roof slab with slight forward slope (rotation -0.12 on X)
- 7 teak beams underneath
- Toggleable visibility (R key or button)

### Environment
- Grass plane (120×60m)
- 25 randomly placed low-poly trees (dodecahedron canopies)
- 20 randomly placed bushes

### Interactive Features
- **Hide/Show Roof** — R key or button toggles roof visibility
- **Explode Plan** — E key or button separates roof (Y+8) and walls (Y+3)
- **Click Villa** — Camera animates to focused view
- **Hover Villa** — Lifts up 0.5m, shows name label
- **Download GLB** — Exports entire scene as .glb file
- **Auto-rotate** — Camera slowly orbits (stops on hover)

---

## Color Palette

| Name | Hex | Where Used |
|---|---|---|
| Cream Wall | `#F2EBDD` | All walls |
| Terracotta | `#B35D38` | Feature wall, blanket |
| Andesite | `#6E6A62` | Floors, walkways |
| Teak | `#75502E` | Furniture, doors, beams |
| Ironwood | `#94714A` | Roof, wardrobe panels |
| Glass | `#DCEBF2` | Sliding doors, shower screen |
| Foliage | `#3C5A39` | Planter bed |
| Bronze | `#9C7A4E` | Lamps, faucets, spouts |
| White Ceramic | `#FFFFFF` | Sinks, toilet |
| Pool Water | `#1E90FF` | Main pool body |
| Pool Shimmer | `#4FC3F7` | Water surface layer |
| Pool Coping | `#E8E2D5` | Edge stones |
| Stone Terrace | `#C8BFA9` | Outdoor pebble area |
| Sky Background | `#b5d3e7` | Canvas background |
| Grass | `#82A760` | Ground plane |

---

## Textures (in `/public/`)

| File | Repeats | Applied To |
|---|---|---|
| `brick_texture_*.png` | 3×1 | Terracotta feature wall, folded blanket |
| `roof_texture_*.png` | 4×4 | Ironwood roof surface |
| `teak_texture_*.png` | 2×2 | All teak furniture, doors, beams, bed frame |

All textures use `SRGBColorSpace`, `RepeatWrapping` on both S and T.

---

## Design Aesthetic

The style is **modern tropical Balinese resort**:
- Clean geometric forms (boxes, cylinders) — no complex meshes
- Natural material palette: teak wood, andesite stone, cream plaster, terracotta
- Warm accent lighting from bedside lamps
- Transparent/transmission materials for glass elements
- Sunken pool with vibrant blue water
- Lush green environment surrounding the complex

---

## What You Can Improve / Work On

Here are areas where enhancements would be valuable:

1. **More detailed furniture** — Add ceiling fans, wall art frames, towel racks in bathroom, shower bench, bathrobe hooks
2. **Outdoor furniture** — Sun loungers on terrace, small side table, potted plants
3. **Better pool** — Pool steps/ladder, infinity edge effect, underwater lighting
4. **Entrance area** — Motorbike parking details, signage ("the arborist"), pathway stones
5. **Landscape** — Palm trees (instead of generic dodecahedrons), frangipani plants, stone pathways
6. **Lighting** — More interior lights (ceiling recessed, bathroom spots), exterior path lights
7. **Animation** — Water ripple effect, swaying plants, day/night cycle
8. **UI** — Floor plan overlay toggle, measurement annotations, material selector
9. **Performance** — Instanced meshes for repeated elements, LOD for distant villas

---

## How to Run

```bash
cd villa-model
npm install
npm run dev
# Opens at http://localhost:5173
```

## How to Build
```bash
npm run build
# Output in dist/
```

---

## Important Notes for Claude Design

1. **All geometry is procedural** — no .gltf/.obj files are loaded. Everything is built with `<mesh>`, `<boxGeometry>`, `<cylinderGeometry>`, `<planeGeometry>`, etc.
2. **Each villa is identical** — `VillaModule` is instantiated 4 times at different X positions by `VillaComplex`
3. **Coordinate system** — X goes right (villa width), Y goes up (height), Z goes "down" in the floor plan (villa depth)
4. **Units are meters** — dimensions roughly match real-world scale
5. **Walls are thin panels (0.1m)** — NOT solid blocks. Rooms are hollow so interior is visible when roof is hidden
6. **The roof group has `visible={showRoof}`** — toggling this reveals all interior details
7. **GSAP handles all animations** — spring-like easing for smooth transitions
8. **Textures must be in `/public/`** — loaded via `useTexture()` from drei
