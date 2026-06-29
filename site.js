/* ============================================================
   FH site — GSAP/ScrollTrigger orchestration, reveals,
   horizontal corridor, liquid reveal, and Tweaks panel.
   ============================================================ */
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const smooth = (t) => t * t * (3 - 2 * t);

  gsap.registerPlugin(ScrollTrigger);

  /* ---------- hero 3D ---------- */
  const nav = $("#nav");

  /* ---------- persisted tweak state ---------- */
  const SAVE_KEY = "fh-tweaks-v1";
  let state = { palette: "terracotta", font: "cormorant", motion: 3 };
  try { Object.assign(state, JSON.parse(localStorage.getItem(SAVE_KEY) || "{}")); } catch (e) {}

  let intensity = state.motion;

  /* ---------- hero scroll choreography ---------- */
  function buildHero() {
    // Hero 3D section removed
  }

  /* ---------- STORY HERO: From Sunrise, To Us (scroll-driven horizontal carousel) ---------- */
  const storyStage = $("#storyStage");
  let storyST = null;
  if (storyStage) {
    const framesTrack = $(".story-frames", storyStage);
    const frames = $$(".story-frame", storyStage);
    const lines = $$("#storyLines p");
    const dot = $("#storyDot");
    const cueEl = $("#storyCue");
    const dotsWrap = $("#storyDots");
    const N = frames.length;
    const dotGlow = ["rgba(127,168,216,0.85)", "rgba(240,200,120,0.85)", "rgba(255,243,210,0.9)",
                     "rgba(255,138,60,0.95)", "rgba(160,90,60,0.85)", "rgba(159,176,232,0.85)"];

    let curIdx = 0;

    // build dot indicators (click to jump to that scene)
    const dotBtns = [];
    if (dotsWrap) {
      for (let i = 0; i < N; i++) {
        const b = document.createElement("button");
        b.className = "story-dot";
        b.setAttribute("aria-label", "Go to scene " + (i + 1));
        b.addEventListener("click", () => jumpTo(i));
        dotsWrap.appendChild(b); dotBtns.push(b);
      }
    }

    function updateStory(p) {
      // slide the filmstrip horizontally across the full scroll of the pin
      gsap.set(framesTrack, { xPercent: -(p * (N - 1) * 100) });

      const pos = p * (N - 1);
      lines.forEach((ln, i) => {
        const d = Math.abs(pos - i);
        const o = Math.max(0, 1 - d * 1.5);
        const grow = i === 3 ? 1 + Math.max(0, 1 - d) * 0.12 : 1;   // sunset beat swells
        ln.style.opacity = o.toFixed(3);
        ln.style.transform = `scale(${grow.toFixed(3)})`;
      });

      curIdx = Math.max(0, Math.min(N - 1, Math.round(pos)));
      dotBtns.forEach((b, i) => b.classList.toggle("on", i === curIdx));
      if (cueEl) cueEl.style.opacity = (1 - clamp(p / 0.06)).toFixed(2);
    }

    const storyLen = () => Math.round(window.innerHeight * (N - 1) * (0.78 + intensity * 0.08));

    function jumpTo(i) {
      if (!storyST) return;
      i = Math.max(0, Math.min(N - 1, i));
      const top = storyST.start + (i / (N - 1)) * (storyST.end - storyST.start);
      window.scrollTo({ top, behavior: "smooth" });
    }

    $("#storyNext") && $("#storyNext").addEventListener("click", () => jumpTo(curIdx + 1));
    $("#storyPrev") && $("#storyPrev").addEventListener("click", () => jumpTo(curIdx - 1));

    function buildStory() {
      if (storyST) storyST.kill();
      storyST = ScrollTrigger.create({
        trigger: ".story-hero",
        start: "top top",
        end: () => "+=" + storyLen(),
        pin: ".story-stage",
        scrub: 0.55,
        anticipatePin: 1,
        refreshPriority: 4,
        invalidateOnRefresh: true,
        onUpdate: (self) => updateStory(self.progress),
      });
      updateStory(storyST.progress || 0);
    }
    buildStory();
    window.__rebuildStory = buildStory;
  }


  /* ---------- nav state ---------- */
  function navState() {
    nav.classList.toggle("solid", window.scrollY > window.innerHeight * 0.7);
  }
  window.addEventListener("scroll", navState, { passive: true });
  navState();

  /* ---------- horizontal corridor (desktop pin; stacks on mobile) ---------- */
  const track = $("#corridorTrack");
  const mm = gsap.matchMedia();
  mm.add("(min-width: 761px)", () => {
    if (!track) return;
    const dist = () => Math.max(0, track.scrollWidth - window.innerWidth);
    ScrollTrigger.create({
      trigger: ".corridor",
      start: "top top",
      end: () => "+=" + (dist() + window.innerHeight * 0.4),
      pin: ".corridor__inner",
      scrub: 0.6,
      refreshPriority: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => gsap.set(track, { x: -dist() * self.progress }),
    });
    return () => { gsap.set(track, { x: 0 }); };   // reset when leaving desktop
  });

  /* ---------- mobile nav menu ---------- */
  const navToggle = $("#navToggle");
  if (navToggle) {
    const setOpen = (open) => {
      document.body.classList.toggle("menu-open", open);
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
      navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    };
    navToggle.addEventListener("click", () => setOpen(!document.body.classList.contains("menu-open")));
    $$("#navLinks a").forEach((a) => a.addEventListener("click", () => setOpen(false)));
  }

  /* ---------- reveal on scroll ---------- */
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }),
    { threshold: 0.18 }
  );
  $$(".reveal").forEach((el) => io.observe(el));

  /* ---------- liquid dividers: gentle drift ---------- */
  const turbs = $$(".lq-turb");
  if (turbs.length) {
    let f = 0;
    const drift = () => {
      f += 0.0009;
      const by = 0.012 + Math.sin(f) * 0.004;
      turbs.forEach((t) => t.setAttribute("baseFrequency", `0.009 ${by.toFixed(4)}`));
      requestAnimationFrame(drift);
    };
    drift();
  }

  /* ---------- enquire form ---------- */
  const form = $("#enquireForm");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const btn = $("#enquireBtn");
      btn.textContent = "Thank you — we'll be in touch";
      btn.disabled = true;
      btn.style.opacity = 0.7;
    });
  }

  /* ============================================================
     TWEAKS
     ============================================================ */
  const PALETTES = {
    terracotta: { "--terracotta": "#B5673E", "--brick": "#9E5232", "--bronze": "#B79165",
      "--paper": "#FBF6EC", "--cream": "#F4ECDF", "--espresso": "#241A12", "--ink": "#2B2117", "--ink-soft": "#5B5247" },
    espresso: { "--terracotta": "#A8542F", "--brick": "#8A4226", "--bronze": "#9C7A4E",
      "--paper": "#EFE4D2", "--cream": "#E8DAC2", "--espresso": "#1B130C", "--ink": "#241A11", "--ink-soft": "#574d40" },
    sand: { "--terracotta": "#C07A4C", "--brick": "#A86238", "--bronze": "#C2A075",
      "--paper": "#FAF5EC", "--cream": "#F2E8D8", "--espresso": "#3A2C1E", "--ink": "#37291B", "--ink-soft": "#6a6053" },
  };
  const FONTS = {
    cormorant: '"Cormorant Garamond", Georgia, serif',
    marcellus: '"Marcellus", Georgia, serif',
    bodoni: '"Bodoni Moda", Georgia, serif',
  };

  function applyPalette(name) {
    const p = PALETTES[name] || PALETTES.terracotta;
    Object.entries(p).forEach(([k, v]) => document.documentElement.style.setProperty(k, v));
    document.documentElement.style.setProperty("--bg", p["--paper"]);
    document.documentElement.style.setProperty("--bg-warm", p["--cream"]);
  }
  function applyFont(name) {
    document.documentElement.style.setProperty("--display", FONTS[name] || FONTS.cormorant);
  }

  applyPalette(state.palette);
  applyFont(state.font);

  function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch (e) {} }
  function setTweak(key, val) {
    state[key] = val; save();
    window.parent.postMessage({ type: "__edit_mode_set_keys", edits: { [key]: val } }, "*");
  }

  // wire segmented + swatch controls
  function seg(group, cur, fn) {
    $$(`[data-seg="${group}"] button`).forEach((b) => {
      b.classList.toggle("on", b.dataset.val === cur);
      b.addEventListener("click", () => {
        $$(`[data-seg="${group}"] button`).forEach((x) => x.classList.remove("on"));
        b.classList.add("on");
        fn(b.dataset.val);
      });
    });
  }
  seg("palette", state.palette, (v) => { applyPalette(v); setTweak("palette", v); });
  seg("font", state.font, (v) => { applyFont(v); setTweak("font", v); });

  const motion = $("#twMotion");
  if (motion) {
    motion.value = intensity;
    motion.addEventListener("input", () => {
      intensity = +motion.value; setTweak("motion", intensity);
      buildHero(); if (window.__rebuildStory) window.__rebuildStory(); ScrollTrigger.refresh();
    });
  }

  /* ---------- tweaks host protocol ---------- */
  const panel = $("#tweaks");
  window.addEventListener("message", (e) => {
    const t = e && e.data && e.data.type;
    if (t === "__activate_edit_mode") panel.classList.add("show");
    else if (t === "__deactivate_edit_mode") panel.classList.remove("show");
  });
  $("#twClose").addEventListener("click", () => {
    panel.classList.remove("show");
    window.parent.postMessage({ type: "__edit_mode_dismissed" }, "*");
  });
  window.parent.postMessage({ type: "__edit_mode_available" }, "*");

  // refresh after fonts/images settle
  window.addEventListener("load", () => setTimeout(() => ScrollTrigger.refresh(), 300));

  /* ============================================================
     THE GROUNDS — film: play + unmute on scroll into view,
     re-mute on leave. Browsers gate unmuted audio behind a user
     gesture, so we arm on the first scroll/pointer/key event.
     ============================================================ */
  (function () {
    const host = $("#groundsVideo");
    if (!host) return;
    let player = null, inView = false, armed = false;

    // load the IFrame API once
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);

    window.onYouTubeIframeAPIReady = function () {
      player = new YT.Player("groundsVideo", {
        events: {
          onReady: () => { apply(); },
        },
      });
    };

    function apply() {
      if (!player || !player.playVideo) return;
      if (inView) {
        player.playVideo();
        if (armed) { try { player.unMute(); player.setVolume(100); } catch (e) {} }
      } else {
        try { player.mute(); } catch (e) {}
      }
    }

    // first real user gesture unlocks audio
    function arm() {
      if (armed) return;
      armed = true;
      apply();
      window.removeEventListener("pointerdown", arm);
      window.removeEventListener("keydown", arm);
      window.removeEventListener("wheel", arm);
      window.removeEventListener("touchstart", arm);
    }
    ["pointerdown", "keydown", "wheel", "touchstart"].forEach((ev) =>
      window.addEventListener(ev, arm, { passive: true })
    );

    new IntersectionObserver(
      (entries) => entries.forEach((e) => { inView = e.isIntersecting; apply(); }),
      { threshold: 0.5 }
    ).observe(host);
  })();
})();
