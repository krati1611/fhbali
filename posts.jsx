/* global React */
// Social post designs for FH · Nyang Nyang.
// Each post is built at full platform resolution, then scaled into the
// canvas artboard via transform. Exports window.FHPost helpers.

const CREAM = "#F4ECDF", PAPER = "#FBF6EC", SAND = "#E3D2B6", BRONZE = "#B79165";
const TERRA = "#B5673E", TEAK = "#75502E", ESPRESSO = "#241A12";
const SERIF = '"Cormorant Garamond", Georgia, serif';
const SANS = '"Jost", system-ui, sans-serif';

// Scale a full-res design (dw×dh) into a display box of width = dw*k.
function Frame({ dw, dh, k, children }) {
  return (
    <div style={{ width: dw * k, height: dh * k, overflow: "hidden" }}>
      <div style={{ width: dw, height: dh, transform: `scale(${k})`, transformOrigin: "top left", position: "relative" }}>
        {children}
      </div>
    </div>
  );
}

function cover(src, pos = "50% 50%") {
  return { backgroundImage: `url(${src})`, backgroundSize: "cover", backgroundPosition: pos, backgroundRepeat: "no-repeat" };
}

// ---- Variant: full-bleed image + gradient + overlaid type ----
function Bleed({ dw, dh, img, pos, eyebrow, title, foot, align = "bottom" }) {
  const u = dw / 1000;
  const bottomAnchor = align === "bottom";
  return (
    <div style={{ width: dw, height: dh, position: "relative", overflow: "hidden", fontFamily: SANS, ...cover(img, pos) }}>
      <div style={{ position: "absolute", inset: 0, background:
        "linear-gradient(to top, rgba(20,14,8,0.86) 0%, rgba(20,14,8,0.30) 38%, rgba(20,14,8,0.05) 62%, rgba(20,14,8,0.34) 100%)" }} />
      <div style={{ position: "absolute", top: 54 * u, left: 58 * u, right: 58 * u, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ fontFamily: SERIF, fontSize: 60 * u, lineHeight: 0.9, color: CREAM, fontWeight: 500, letterSpacing: 2 * u }}>FH</div>
        <div style={{ fontSize: 19 * u, letterSpacing: 4 * u, textTransform: "uppercase", color: "rgba(244,236,223,0.85)", marginTop: 14 * u }}>Nyang&nbsp;Nyang</div>
      </div>
      <div style={{ position: "absolute", left: 58 * u, right: 58 * u, bottom: bottomAnchor ? 60 * u : "auto", top: bottomAnchor ? "auto" : "44%", color: CREAM }}>
        {eyebrow && <div style={{ fontSize: 21 * u, letterSpacing: 6 * u, textTransform: "uppercase", color: SAND, marginBottom: 16 * u }}>{eyebrow}</div>}
        <div style={{ fontFamily: SERIF, fontSize: 92 * u, lineHeight: 1.0, fontWeight: 500, textWrap: "balance", maxWidth: 880 * u }}>{title}</div>
        {foot && <div style={{ fontSize: 21 * u, letterSpacing: 2 * u, marginTop: 22 * u, color: "rgba(244,236,223,0.82)" }}>{foot}</div>}
      </div>
    </div>
  );
}

// ---- Variant: image with a solid colour band of type below ----
function Band({ dw, dh, img, pos, eyebrow, title, foot, band = ESPRESSO, imgFrac = 0.66 }) {
  const u = dw / 1000;
  return (
    <div style={{ width: dw, height: dh, position: "relative", overflow: "hidden", fontFamily: SANS, background: band }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: dh * imgFrac, ...cover(img, pos) }} />
      <div style={{ position: "absolute", top: 50 * u, left: 56 * u, fontFamily: SERIF, fontSize: 56 * u, color: CREAM, fontWeight: 500 }}>FH</div>
      <div style={{ position: "absolute", left: 56 * u, right: 56 * u, top: dh * imgFrac + 46 * u, color: CREAM }}>
        {eyebrow && <div style={{ fontSize: 20 * u, letterSpacing: 5 * u, textTransform: "uppercase", color: BRONZE, marginBottom: 14 * u }}>{eyebrow}</div>}
        <div style={{ fontFamily: SERIF, fontSize: 80 * u, lineHeight: 1.02, fontWeight: 500, textWrap: "balance" }}>{title}</div>
        {foot && <div style={{ fontSize: 20 * u, letterSpacing: 2 * u, marginTop: 18 * u, color: "rgba(244,236,223,0.7)" }}>{foot}</div>}
      </div>
    </div>
  );
}

// ---- Variant: framed editorial card (cream) with inset image + materials ----
function Framed({ dw, dh, img, pos, eyebrow, title, foot, swatches }) {
  const u = dw / 1000;
  const m = 64 * u;
  return (
    <div style={{ width: dw, height: dh, position: "relative", overflow: "hidden", fontFamily: SANS, background: PAPER, color: ESPRESSO, padding: m, boxSizing: "border-box" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <div style={{ fontFamily: SERIF, fontSize: 54 * u, fontWeight: 500, color: ESPRESSO }}>FH</div>
        <div style={{ fontSize: 18 * u, letterSpacing: 4 * u, textTransform: "uppercase", color: TERRA }}>Nyang Nyang · Bali</div>
      </div>
      <div style={{ marginTop: 34 * u, height: dh - m * 2 - 300 * u, borderRadius: 6 * u, ...cover(img, pos) }} />
      {eyebrow && <div style={{ fontSize: 19 * u, letterSpacing: 5 * u, textTransform: "uppercase", color: TERRA, marginTop: 40 * u }}>{eyebrow}</div>}
      <div style={{ fontFamily: SERIF, fontSize: 74 * u, lineHeight: 1.02, fontWeight: 500, marginTop: 14 * u, textWrap: "balance", color: ESPRESSO }}>{title}</div>
      {swatches && (
        <div style={{ display: "flex", gap: 26 * u, marginTop: 36 * u }}>
          {swatches.map((s, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 * u }}>
              <span style={{ width: 64 * u, height: 64 * u, borderRadius: "50%", background: s.c, boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.08)" }} />
              <span style={{ fontSize: 16 * u, letterSpacing: 2 * u, textTransform: "uppercase", color: "#5B5247" }}>{s.t}</span>
            </div>
          ))}
        </div>
      )}
      {foot && <div style={{ fontSize: 19 * u, letterSpacing: 2 * u, marginTop: 30 * u, color: "#5B5247" }}>{foot}</div>}
    </div>
  );
}

// ---- Variant: full-bleed VIDEO + gradient + overlaid type ----
function BleedVideo({ dw, dh, src, poster, pos = "50% 50%", eyebrow, title, foot, badge = "Reel" }) {
  const u = dw / 1000;
  return (
    <div style={{ width: dw, height: dh, position: "relative", overflow: "hidden", fontFamily: SANS, background: ESPRESSO }}>
      <video src={src} poster={poster} autoPlay muted loop playsInline
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: pos }} />
      <div style={{ position: "absolute", inset: 0, background:
        "linear-gradient(to top, rgba(20,14,8,0.86) 0%, rgba(20,14,8,0.28) 38%, rgba(20,14,8,0.04) 60%, rgba(20,14,8,0.40) 100%)" }} />
      <div style={{ position: "absolute", top: 54 * u, left: 58 * u, right: 58 * u, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ fontFamily: SERIF, fontSize: 60 * u, lineHeight: 0.9, color: CREAM, fontWeight: 500, letterSpacing: 2 * u }}>FH</div>
        {badge && <div style={{ display: "flex", alignItems: "center", gap: 9 * u, fontSize: 18 * u, letterSpacing: 3 * u, textTransform: "uppercase", color: CREAM, background: "rgba(20,14,8,0.4)", padding: `${9 * u}px ${16 * u}px`, borderRadius: 999, backdropFilter: "blur(6px)" }}>
          <span style={{ width: 13 * u, height: 13 * u, borderLeft: `${11 * u}px solid ${CREAM}`, borderTop: `${7 * u}px solid transparent`, borderBottom: `${7 * u}px solid transparent` }} />{badge}</div>}
      </div>
      <div style={{ position: "absolute", left: 58 * u, right: 58 * u, bottom: 60 * u, color: CREAM }}>
        {eyebrow && <div style={{ fontSize: 21 * u, letterSpacing: 6 * u, textTransform: "uppercase", color: SAND, marginBottom: 16 * u }}>{eyebrow}</div>}
        <div style={{ fontFamily: SERIF, fontSize: 92 * u, lineHeight: 1.0, fontWeight: 500, textWrap: "balance", maxWidth: 880 * u }}>{title}</div>
        {foot && <div style={{ fontSize: 21 * u, letterSpacing: 2 * u, marginTop: 22 * u, color: "rgba(244,236,223,0.82)" }}>{foot}</div>}
      </div>
    </div>
  );
}

// ---- Variant: VIDEO panel on top, solid colour band of type below (good for vertical) ----
function BandVideo({ dw, dh, src, poster, pos = "50% 50%", eyebrow, title, foot, band = ESPRESSO, imgFrac = 0.62, badge = "Reel" }) {
  const u = dw / 1000;
  return (
    <div style={{ width: dw, height: dh, position: "relative", overflow: "hidden", fontFamily: SANS, background: band }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: dh * imgFrac, overflow: "hidden" }}>
        <video src={src} poster={poster} autoPlay muted loop playsInline
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: pos }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(20,14,8,0.34), rgba(20,14,8,0) 40%)" }} />
      </div>
      <div style={{ position: "absolute", top: 50 * u, left: 56 * u, fontFamily: SERIF, fontSize: 56 * u, color: CREAM, fontWeight: 500 }}>FH</div>
      {badge && <div style={{ position: "absolute", top: 60 * u, right: 56 * u, display: "flex", alignItems: "center", gap: 9 * u, fontSize: 17 * u, letterSpacing: 3 * u, textTransform: "uppercase", color: CREAM, background: "rgba(20,14,8,0.4)", padding: `${8 * u}px ${15 * u}px`, borderRadius: 999, backdropFilter: "blur(6px)" }}>
        <span style={{ width: 12 * u, height: 12 * u, borderLeft: `${10 * u}px solid ${CREAM}`, borderTop: `${6 * u}px solid transparent`, borderBottom: `${6 * u}px solid transparent` }} />{badge}</div>}
      <div style={{ position: "absolute", left: 56 * u, right: 56 * u, top: dh * imgFrac + 46 * u, color: CREAM }}>
        {eyebrow && <div style={{ fontSize: 20 * u, letterSpacing: 5 * u, textTransform: "uppercase", color: BRONZE, marginBottom: 14 * u }}>{eyebrow}</div>}
        <div style={{ fontFamily: SERIF, fontSize: 80 * u, lineHeight: 1.02, fontWeight: 500, textWrap: "balance" }}>{title}</div>
        {foot && <div style={{ fontSize: 20 * u, letterSpacing: 2 * u, marginTop: 18 * u, color: "rgba(244,236,223,0.7)" }}>{foot}</div>}
      </div>
    </div>
  );
}

Object.assign(window, { FHFrame: Frame, FHBleed: Bleed, FHBand: Band, FHFramed: Framed, FHBleedVideo: BleedVideo, FHBandVideo: BandVideo });
