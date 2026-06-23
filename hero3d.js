/* ============================================================
   FH Hero — Three.js villa complex, ported faithfully from the
   user's React/R3F source (VillaModule + VillaComplex +
   BaliEnvironment). Four villa modules at the real 8.19m pitch,
   a shared corridor walkway, per-villa entrance gates, and a
   warm-tinted Bali surround (sand ground, foliage-accent trees).

   Scroll choreography (driven by site.js -> setProgress):
     p 0.00  roofless floor-plan seen from above
     p →0.6  roofs descend & seat onto the walls, camera orbits
     p →1.0  3/4 elevated aerial — roofs stepping toward the sea
   Then site.js dissolves the canvas into the real aerial photo.

   API: window.FHHero { init(canvas), setProgress(p), resize(),
        render(), GLB_URL }.  (GLB hook kept for later.)
   ============================================================ */
(function () {
  const FHHero = { GLB_URL: null, _p: 0, ready: false };
  window.FHHero = FHHero;

  let renderer, scene, camera, complex, sun, hemi, ground, fog;
  let raf = null;
  const roofGroups = [];     // per-module + corridor roof groups (descend + fade)
  const envItems = [];       // {obj, base} — trees/bushes that grow in with scroll
  let M;                     // materials

  /* small seeded RNG so the scattered trees are stable */
  let _seed = 1337;
  const rnd = () => { _seed = (_seed * 1664525 + 1013904223) % 4294967296; return _seed / 4294967296; };

  /* ---------- procedural textures ---------- */
  function tex(draw, rx, ry) {
    const c = document.createElement("canvas"); c.width = c.height = 256;
    draw(c.getContext("2d"));
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry);
    if ("colorSpace" in t) t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }
  const brickTex = () => tex((x) => {
    x.fillStyle = "#9c5535"; x.fillRect(0, 0, 256, 256);
    for (let r = 0; r < 26; r++) { const y = r * 10, off = (r % 2) * 12;
      for (let b = -1; b < 12; b++) { const bx = off + b * 22, sh = 150 + Math.floor(Math.random() * 50);
        x.fillStyle = `rgb(${sh},${Math.floor(sh * 0.55)},${Math.floor(sh * 0.4)})`;
        x.fillRect(bx + 1, y + 1, 20, 8); } }
  }, 3, 2);
  const shingleTex = () => tex((x) => {
    x.fillStyle = "#6f5238"; x.fillRect(0, 0, 256, 256);
    for (let r = 0; r < 18; r++) { const y = r * 14;
      for (let s = -1; s < 22; s++) { const sx = (r % 2) * 7 + s * 13, sh = 80 + Math.floor(Math.random() * 55);
        x.fillStyle = `rgb(${sh},${Math.floor(sh * 0.74)},${Math.floor(sh * 0.5)})`;
        x.fillRect(sx, y, 12, 13); x.strokeStyle = "rgba(40,28,16,0.35)"; x.strokeRect(sx, y, 12, 13); } }
  }, 4, 4);
  const teakTex = () => tex((x) => {
    x.fillStyle = "#6b4a2b"; x.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 60; i++) { x.strokeStyle = `rgba(${40 + Math.random() * 40},${24 + Math.random() * 24},10,0.5)`;
      x.lineWidth = 0.5 + Math.random() * 1.5; x.beginPath(); const gx = Math.random() * 256;
      x.moveTo(gx, 0); x.bezierCurveTo(gx + 8, 85, gx - 8, 170, gx + 4, 256); x.stroke(); }
  }, 2, 2);
  // documented 3-colour pool tile: deep green / aqua / off-white checkerboard
  const poolTileTex = () => tex((x) => {
    const N = 8, s = 256 / N;
    for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
      let c = (i + j) % 2 === 0 ? "#EEF0F2" : "#1B4D3E";
      if ((i + j) % 2 !== 0 && (i * 3 + j) % 5 === 0) c = "#2F7E73"; // aqua accents
      x.fillStyle = c; x.fillRect(i * s, j * s, s + 0.6, s + 0.6);
    }
  }, 2, 6);

  function buildMaterials() {
    const std = (o) => new THREE.MeshStandardMaterial(o);
    M = {
      cream:      std({ color: 0xf2ebdd, roughness: 0.95 }),
      terracotta: std({ color: 0xb35d38, roughness: 0.9, map: brickTex() }),
      andesite:   std({ color: 0x6e6a62, roughness: 0.85 }),
      teak:       std({ color: 0x75502e, roughness: 0.6, map: teakTex() }),
      terraceDeck:std({ color: 0xc19a6b, roughness: 0.9 }),
      poolWater:  std({ color: 0x236f64, roughness: 0.06, metalness: 0, transparent: true, opacity: 0.86 }),
      poolShimmer:std({ color: 0x4fb9ac, roughness: 0.02, metalness: 0.1, transparent: true, opacity: 0.5, emissive: 0x123f38, emissiveIntensity: 0.3 }),
      poolTile:   std({ color: 0xffffff, roughness: 0.5, map: poolTileTex() }),
      ceramic:    std({ color: 0xffffff, roughness: 0.15 }),
      glass:      std({ color: 0xdcebf2, roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.28 }),
      bronze:     std({ color: 0x9c7a4e, roughness: 0.35, metalness: 0.9 }),
      foliage:    std({ color: 0x3c5a39, roughness: 1 }),
      lampGlow:   std({ color: 0xffe0b0, emissive: 0xffb060, emissiveIntensity: 1.9, roughness: 0.4 }),
      rug:        std({ color: 0xe6dcc6, roughness: 1 }),
      blanket:    std({ color: 0xb5673e, roughness: 0.92 }),
      linen:      std({ color: 0xded2bb, roughness: 0.9 }),
      // roof materials fade in during the descent
      roof:       std({ color: 0x94714a, roughness: 1.0, map: shingleTex(), transparent: true, opacity: 1 }),
      roofBeam:   std({ color: 0x75502e, roughness: 0.6, map: teakTex(), transparent: true, opacity: 1 }),
    };
  }

  /* ---------- mesh helpers ---------- */
  function box(w, h, d, mat, pos, cast = true, rec = true) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(pos[0], pos[1], pos[2]); m.castShadow = cast; m.receiveShadow = rec; return m;
  }
  function cyl(rt, rb, h, seg, mat, pos) {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat);
    m.position.set(pos[0], pos[1], pos[2]); m.castShadow = true; return m;
  }

  /* ---------- one villa module (local corner-origin coords) ---------- */
  function buildVillaModule(focus) {
    const g = new THREE.Group();

    // floors
    g.add(box(5.0, 0.1, 7.3, M.andesite, [2.5, 0.05, 3.65], false, true));      // interior
    g.add(box(0.75, 0.1, 7.3, M.terraceDeck, [5.37, 0.05, 3.65], false, true)); // terrace walk (glass→pool)
    g.add(box(0.85, 0.1, 7.3, M.terraceDeck, [7.77, 0.05, 3.65], false, true)); // terrace edge (pool→planter)
    g.add(box(1.75, 0.1, 0.9, M.terraceDeck, [6.6, 0.05, 0.55], false, true));  // pool deck head (low z)
    g.add(box(1.75, 0.1, 0.5, M.terraceDeck, [6.6, 0.05, 7.05], false, true));  // pool deck foot (high z)

    // hall + lattice door
    g.add(box(1.8, 2.8, 2.0, M.cream, [0.9, 1.4, 2.45]));
    g.add(box(0.9, 2.6, 0.1, M.teak, [0.9, 1.3, 1.45]));

    // bathroom: vanity, basins, toilet, glass screen
    g.add(box(1.8, 2.8, 3.8, M.cream, [0.9, 1.4, 5.35]));
    g.add(box(1.6, 1.0, 0.6, M.teak, [0.9, 0.5, 6.8]));
    g.add(cyl(0.2, 0.15, 0.1, 16, M.ceramic, [0.5, 1.05, 6.8]));
    g.add(cyl(0.2, 0.15, 0.1, 16, M.ceramic, [1.3, 1.05, 6.8]));
    g.add(box(0.4, 0.8, 0.6, M.ceramic, [0.4, 0.4, 5.5]));
    g.add(box(1.0, 2.2, 0.05, M.glass, [0.9, 1.4, 4.0]));

    // bedroom — HOLLOW room (floor + thin wall panels) so the interior is
    // visible from above once the roof lifts away
    g.add(box(3.2, 0.05, 5.85, M.teak, [3.4, 0.13, 4.375], false, true));  // teak parquet floor
    g.add(box(0.1, 2.8, 5.85, M.cream, [1.8, 1.4, 4.375]));                // back wall (shared w/ hall+bath)
    g.add(box(3.2, 2.8, 0.1, M.cream, [3.4, 1.4, 1.45]));                  // headboard wall (low z)
    g.add(box(3.2, 2.8, 0.1, M.cream, [3.4, 1.4, 7.3]));                   // far wall (high z)
    g.add(box(2.7, 0.03, 2.6, M.rug, [3.25, 0.165, 2.6], false, true));   // woven rug
    g.add(box(0.18, 1.0, 2.05, M.teak, [1.98, 0.9, 2.6]));     // headboard against back (-x) wall
    g.add(box(2.2, 0.6, 1.8, M.teak, [3.1, 0.4, 2.6]));        // bed base, foot toward pool (+x)
    g.add(box(2.0, 0.22, 1.7, M.linen, [3.15, 0.78, 2.6]));    // mattress/duvet
    g.add(box(0.5, 0.2, 0.72, M.linen, [2.4, 0.95, 2.25]));    // pillow L
    g.add(box(0.5, 0.2, 0.72, M.linen, [2.4, 0.95, 2.95]));    // pillow R
    g.add(box(0.8, 0.1, 1.78, M.blanket, [3.8, 0.92, 2.6]));   // blanket at foot
    g.add(box(0.4, 0.6, 0.4, M.teak, [2.25, 0.3, 1.45]));      // bedside L
    g.add(cyl(0.1, 0.1, 0.2, 10, M.lampGlow, [2.25, 0.72, 1.45])); // lamp L (glows)
    g.add(box(0.4, 0.6, 0.4, M.teak, [2.25, 0.3, 3.75]));      // bedside R
    g.add(cyl(0.1, 0.1, 0.2, 10, M.lampGlow, [2.25, 0.72, 3.75])); // lamp R (glows)
    g.add(box(0.7, 0.4, 0.7, M.linen, [4.45, 0.3, 6.1]));      // lounge chair seat
    g.add(box(0.7, 0.7, 0.16, M.linen, [4.45, 0.65, 6.48]));   // chair back
    g.add(box(0.4, 2.6, 1.78, M.teak, [2.0, 1.3, 5.5]));       // wardrobe
    g.add(box(0.4, 0.9, 0.9, M.teak, [4.8, 0.45, 6.5]));       // mini-bar
    g.add(box(0.1, 2.8, 5.85, M.glass, [5.0, 1.4, 4.375]));    // sliding doors

    // warm bedside point-lights — only the villa we dive into (perf)
    if (focus) {
      [[2.25, 1.45], [2.25, 3.75]].forEach(([px, pz]) => {
        const pl = new THREE.PointLight(0xffb866, 1.6, 6, 2);
        pl.position.set(px, 0.85, pz); g.add(pl);
      });
    }

    // terrace & plunge pool
    g.add(box(1.75, 0.06, 5.5, M.poolTile, [6.6, -1.27, 4.35], false, true));        // checkerboard tile bed
    g.add(box(1.75, 1.3, 5.5, M.poolWater, [6.6, -0.62, 4.35], false, true));         // water body
    g.add(box(1.66, 0.05, 5.42, M.poolShimmer, [6.6, 0.02, 4.35], false, false));     // shimmer surface
    g.add(box(0.3, 0.1, 5.5, M.andesite, [5.8, -0.2, 4.35], false, true));      // ledge
    g.add(box(3.2, 2.8, 0.2, M.terracotta, [6.6, 1.4, 1.5]));                    // terracotta head wall
    [6.0, 6.6, 7.2].forEach((px) => g.add(cyl(0.05, 0.05, 0.3, 8, M.bronze, [px, 1.2, 1.65]))); // spouts
    g.add(box(1.5, 2.4, 0.4, M.andesite, [6.6, 1.4, 7.1]));                      // rain-shower niche
    g.add(cyl(0.3, 0.3, 0.4, 16, M.cream, [5.4, 0.2, 2.8]));                     // stool
    g.add(box(2.0, 0.8, 0.5, M.foliage, [6.6, 0.3, 7.0]));                       // planter

    // roof + beams (collected for the descent)
    const roof = new THREE.Group();
    const slab = box(5.2, 0.2, 6.2, M.roof, [2.5, 3.2, 4.375]); slab.rotation.x = -0.12; roof.add(slab);
    for (let i = 0; i < 6; i++) {
      const beam = box(0.1, 0.15, 6.0, M.roofBeam, [0.5 + i * 0.8, 3.1, 4.375]);
      beam.rotation.x = -0.12; roof.add(beam);
    }
    g.add(roof);
    roofGroups.push(roof);
    return g;
  }

  /* ---------- the full complex (absolute coords, then recentred) ---------- */
  const PITCH = 8.19;
  const VILLA_X = [4, 4 + PITCH, 4 + PITCH * 2, 4 + PITCH * 2 + 8.20];
  const CENTER_X = 20.39, CENTER_Z = 3.65;

  function buildComplex() {
    buildMaterials();
    const c = new THREE.Group();

    VILLA_X.forEach((vx, i) => {
      const m = buildVillaModule(i === 1); m.position.x = vx; c.add(m);
      // per-villa entrance gate onto the corridor
      c.add(box(0.2, 3.0, 1.45, M.teak, [vx + 0.9, 1.5, 0.725]));
    });

    // shared corridor walkway + lattice roof (roof descends with the rest)
    c.add(box(32.78, 0.1, 1.45, M.andesite, [20.39, 0.06, 0.725], false, true));
    // entrance access apron + lattice gate (from VillaComplex)
    c.add(box(4, 0.1, 7.3, M.andesite, [0.5, 0.05, 3.65], false, true));
    c.add(box(0.2, 3, 1.45, M.teak, [2.4, 1.5, 0.725]));
    const corrRoof = new THREE.Group();
    corrRoof.add(box(32.78, 0.1, 1.45, M.roofBeam, [20.39, 3.4, 0.725]));
    c.add(corrRoof);
    roofGroups.push(corrRoof);

    c.position.set(-CENTER_X, 0, -CENTER_Z);   // recentre on origin
    return c;
  }

  /* ---------- warm Bali surround (greens only as foliage accents) ---------- */
  function makeTree(x, z, s) {
    const t = new THREE.Group();
    t.add(cyl(0.2, 0.3, 3, 6, new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.9 }), [0, 1.5, 0]));
    const leaf = (r, p, col) => {
      const m = new THREE.Mesh(new THREE.DodecahedronGeometry(r, 0),
        new THREE.MeshStandardMaterial({ color: col, roughness: 0.85 }));
      m.position.set(p[0], p[1], p[2]); m.castShadow = true; return m;
    };
    t.add(leaf(1.5, [0, 3.5, 0], 0x355a30));
    t.add(leaf(1.2, [0.8, 3.2, 0.5], 0x436b38));
    t.add(leaf(1.4, [-0.6, 2.8, -0.6], 0x2c4a26));
    t.position.set(x, 0, z); t.scale.setScalar(s);
    return t;
  }
  function buildEnvironment() {
    const env = new THREE.Group();
    // scatter trees around the footprint (centred coords: building |x|<17, |z|<4)
    for (let i = 0; i < 30; i++) {
      const side = rnd() > 0.5 ? 1 : -1;
      const x = (rnd() * 46) - 23;
      const z = side * (5 + rnd() * 11);
      const s = 0.7 + rnd() * 0.85;
      const tr = makeTree(x, z, s);
      env.add(tr); envItems.push({ obj: tr, base: s });
    }
    // a few bushes hugging the ends
    for (let i = 0; i < 16; i++) {
      const x = (rnd() > 0.5 ? 1 : -1) * (15 + rnd() * 7);
      const z = (rnd() * 9) - 4.5;
      const s = 0.6 + rnd() * 0.7;
      const b = new THREE.Mesh(new THREE.DodecahedronGeometry(0.7, 0),
        new THREE.MeshStandardMaterial({ color: 0x3c5a39, roughness: 0.95 }));
      b.position.set(x, 0.5, z); b.scale.setScalar(s); b.castShadow = true;
      env.add(b); envItems.push({ obj: b, base: s });
    }
    return env;
  }

  // jungle present from the establishing shot through the interior dive
  function updateEnv(p) {
    const g = Math.max(0, Math.min(1, (p + 0.25) / 0.4));
    const e = g * g * (3 - 2 * g);
    for (const it of envItems) {
      const s = it.base * e;
      it.obj.scale.setScalar(s);
      it.obj.visible = e > 0.01;
    }
  }

  function loadGLB(url) {
    return new Promise((res, rej) => {
      new THREE.GLTFLoader().load(url, (g) => {
        const m = g.scene;
        m.traverse((o) => { if (o.isMesh) { o.castShadow = o.receiveShadow = true; } });
        const b = new THREE.Box3().setFromObject(m), s = b.getSize(new THREE.Vector3()), ce = b.getCenter(new THREE.Vector3());
        const sc = 34 / Math.max(s.x, s.z); m.scale.setScalar(sc);
        m.position.sub(ce.multiplyScalar(sc)); m.position.y -= b.min.y * sc;
        res(m);
      }, undefined, rej);
    });
  }

  /* ---------- camera choreography ----------------------------------------
     Dive-in sequence (focus villa = index 1, the front-left house):
       p 0.00  establishing aerial, roofs ON
       p →0.30 roofs lift away; camera descends toward the focus villa
       p →0.62 camera dives through the open roof into the bedroom
       p →0.82 camera rotates from the bed to face the terrace & pool
       p →1.00 settles square on the pool + the three-spout wall
     site.js then dissolves the canvas into the real pool photo.
     ------------------------------------------------------------------------ */
  const KEYS = [
    { p: 0.00, pos: [-1.5, 33, 29],  look: [-3.0, 4.0, -1.0], fov: 42 }, // establishing, roofs on
    { p: 0.26, pos: [-4.7, 17, 5.0], look: [-4.7, 0.6, 0.2],  fov: 46 }, // above the open villa, looking down in
    { p: 0.46, pos: [-6.0, 7.5, 4.6],look: [-4.5, 0.7, -0.6], fov: 52 }, // descending into the room
    { p: 0.62, pos: [-5.7, 2.4, 3.7],look: [-4.2, 0.7, -1.1], fov: 60 }, // low 3/4 across the bed toward the glass
    { p: 0.76, pos: [-3.7, 2.0, 2.1],look: [-1.7, 0.7, -1.3], fov: 56 }, // rotating out toward the pool
    { p: 0.88, pos: [-2.0, 9.0, 13],  look: [-3.0, 1.6, 0.0], fov: 50 }, // rising up & back, clearing the walls
    { p: 1.00, pos: [5.0, 18, 27],    look: [-3.0, 2.6, 0.0], fov: 46 }, // elevated 3/4 aerial of the whole complex among the trees
  ];
  const vA = new THREE.Vector3(), vB = new THREE.Vector3(), look = new THREE.Vector3();

  function applyCamera(p) {
    let i = 0;
    while (i < KEYS.length - 2 && p > KEYS[i + 1].p) i++;
    const a = KEYS[i], b = KEYS[i + 1];
    let t = (p - a.p) / (b.p - a.p); t = Math.max(0, Math.min(1, t)); t = t * t * (3 - 2 * t);
    vA.fromArray(a.pos); vB.fromArray(b.pos); camera.position.lerpVectors(vA, vB, t);
    vA.fromArray(a.look); vB.fromArray(b.look); look.lerpVectors(vA, vB, t);
    camera.lookAt(look);
    camera.fov = a.fov + (b.fov - a.fov) * t; camera.updateProjectionMatrix();

    // roof removal: seated at the top, lift away to dive in, then settle
    // back on during the final pull-out so the closing aerial is the finished villa
    let rl;
    if (p < 0.84) rl = Math.max(0, Math.min(1, (p - 0.08) / 0.22));
    else rl = 1 - Math.max(0, Math.min(1, (p - 0.84) / 0.16));
    const erl = rl * rl * (3 - 2 * rl);
    for (const rg of roofGroups) { rg.position.y = erl * 15; rg.visible = erl < 0.992; }
    if (M) { M.roof.opacity = 1 - erl; M.roofBeam.opacity = 1 - erl; }

    updateEnv(p);

    // light warms + lowers as it becomes "real"
    const w = p;
    sun.intensity = 1.05 + w * 1.7;
    sun.color.setRGB(1, 0.93 - w * 0.13, 0.82 - w * 0.22);
    sun.position.set(-12 + w * 6, 34 - w * 18, -10 - w * 14);
    hemi.intensity = 0.95 - w * 0.25;
    if (fog) fog.density = 0.0035 + w * 0.007;
    renderer.toneMappingExposure = 1.0 + w * 0.16;
  }

  FHHero.setProgress = function (p) {
    FHHero._p = Math.max(0, Math.min(1, p));
    if (camera) applyCamera(FHHero._p);
  };

  /* ---------- init ---------- */
  FHHero.init = function (canvas) {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, window.innerWidth < 760 ? 1.5 : 2));
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;

    scene = new THREE.Scene();
    fog = new THREE.FogExp2(0xe9d8bd, 0.0045);
    scene.fog = fog;

    camera = new THREE.PerspectiveCamera(36, 1, 0.1, 400);

    hemi = new THREE.HemisphereLight(0xfff3e0, 0xb89b74, 0.95);
    scene.add(hemi);
    sun = new THREE.DirectionalLight(0xfff1de, 1.5);
    sun.position.set(-12, 34, -10);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.near = 1; sun.shadow.camera.far = 130;
    sun.shadow.camera.left = -24; sun.shadow.camera.right = 24;
    sun.shadow.camera.top = 16; sun.shadow.camera.bottom = -16;
    sun.shadow.radius = 6; sun.shadow.bias = -0.0004;
    scene.add(sun);

    ground = new THREE.Mesh(
      new THREE.PlaneGeometry(500, 500),
      new THREE.MeshStandardMaterial({ color: 0xcdb88f, roughness: 1 })
    );
    ground.rotation.x = -Math.PI / 2; ground.position.y = -0.06; ground.receiveShadow = true;
    scene.add(ground);

    const start = (m) => {
      complex = m; scene.add(complex);
      scene.add(buildEnvironment());
      FHHero.ready = true; resize(); applyCamera(FHHero._p); loop();
    };

    if (FHHero.GLB_URL && window.THREE && THREE.GLTFLoader) {
      loadGLB(FHHero.GLB_URL).then(start).catch((e) => {
        console.warn("[FHHero] GLB failed, using built complex.", e); start(buildComplex());
      });
    } else {
      start(buildComplex());
    }
  };

  FHHero.render = () => { if (renderer) renderer.render(scene, camera); };

  function loop() {
    cancelAnimationFrame(raf);
    const tick = () => { renderer.render(scene, camera); raf = requestAnimationFrame(tick); };
    tick();
  }
  function resize() {
    if (!renderer) return;
    const w = window.innerWidth, h = window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
  }
  FHHero.resize = resize;
  window.addEventListener("resize", resize);
})();
