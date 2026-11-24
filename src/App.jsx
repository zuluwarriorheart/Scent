import { useState, useEffect, useId, useRef, useMemo, useSyncExternalStore, Fragment } from "react";
import { createPortal } from "react-dom";
import { createClient } from "@supabase/supabase-js";
import MORE_INGREDIENTS from "./ingredients/index.js";
import MORE_PERFUMERS from "./perfumers-more.js";

// ─── SUPABASE CLIENT ──────────────────────────────────────────────────────────
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// ─── PALETTE ──────────────────────────────────────────────────────────────────
// Every colour is a CSS variable (defined in THEME_CSS just below), so the whole
// app switches between light and dark by changing one attribute on <html>.
// T.black = "strong ink" and T.white = "surface": they swap places in dark mode,
// which is why a T.black button with T.white text works in both themes.
const T = {
  black:"var(--ink-strong)", white:"var(--surface)", bg:"var(--bg)", ink:"var(--ink)",
  mid:"var(--mid)", faint:"var(--faint)", rule:"var(--rule)", lift:"var(--lift)", press:"var(--press)",
  scrim:"var(--scrim)", glass:"var(--glass)",
  onInkDim:"var(--on-ink-dim)", track:"var(--track)", trackOn:"var(--track-on)",
  accent:"var(--accent)", accentSoft:"var(--accent-soft)", cta:"var(--cta)", trail:"var(--trail)",
  good:"var(--good)", bad:"var(--bad)",
  violet:"var(--violet)", teal:"var(--teal)", tangerine:"var(--tangerine)",
};
const ACCENT_FILL = "#C9206B";   // solid brand pink, always carries white text
const ON_ACCENT   = "#FFFFFF";
const serif = "'Fraunces Variable',Georgia,'Times New Roman',serif";
const sans  = "'DM Sans Variable','Helvetica Neue',Helvetica,Arial,sans-serif";

// The six hues from the brand photography. Used for monograms and other small colour moments.
const HUES = ["tangerine","coral","pink","orchid","violet","teal"];
function hueFor(text) {
  let h = 0;
  for (const c of String(text)) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return HUES[h % HUES.length];
}

// ─── THEME: CSS VARIABLES + LIGHT / DARK ──────────────────────────────────────
const THEME_CSS = `
:root, html[data-theme="light"] {
  color-scheme: light;
  --bg:#FAF7F5; --surface:#FFFFFF; --lift:#F4EFEC; --press:#EDE6E2; --rule:#E8E0DB;
  --ink-strong:#17101C; --ink:#2B2231; --mid:#6F657A; --faint:#B3A9BA;
  --scrim:rgba(250,247,245,0.93); --glass:rgba(250,247,245,0.86);
  --on-ink-dim:rgba(255,255,255,0.62); --track:rgba(23,16,28,0.10); --track-on:rgba(255,255,255,0.30);
  --accent:#C9206B; --accent-soft:rgba(201,32,107,0.10);
  --tangerine:#E85D12; --on-tang:#FFFFFF; --tang-soft:#FDE6D6; --tang-line:#F6CBAE; --tang-ink:#4A2208; --tang-chip:rgba(255,255,255,0.6); --coral:#E24A3D; --pink:#D42A74; --orchid:#9A3F8E; --violet:#6A3FC4; --teal:#17788F;
  --tint-tangerine:rgba(232,93,18,0.12); --tint-coral:rgba(226,74,61,0.12); --tint-pink:rgba(212,42,116,0.11);
  --tint-orchid:rgba(154,63,142,0.12); --tint-violet:rgba(106,63,196,0.11); --tint-teal:rgba(23,120,143,0.12);
  --good:#2E7D32; --bad:#C0392B;
  --cta:linear-gradient(100deg,#C94010 0%,#C9206B 52%,#6A3FC4 100%);
  --trail:linear-gradient(90deg,#F2661C 0%,#F0476A 28%,#E6397F 50%,#8E52D6 78%,#1E9CC4 100%);
  --glow:radial-gradient(70% 42% at 6% 0%,rgba(242,102,28,0.11),transparent 70%),radial-gradient(55% 40% at 100% 4%,rgba(230,57,127,0.08),transparent 70%),radial-gradient(70% 45% at 100% 100%,rgba(106,63,196,0.10),transparent 70%);
  --blob-o:0.55;
}
html[data-theme="dark"] .note-photo { mix-blend-mode:normal !important; filter:none !important; border-radius:10px; }
html[data-theme="dark"] {
  color-scheme: dark;
  --bg:#0F0B14; --surface:#181220; --lift:#211A2B; --press:#2A2236; --rule:#2E2539;
  --ink-strong:#F6F0F7; --ink:#E6DDEA; --mid:#A99EB5; --faint:#645A70;
  --scrim:rgba(15,11,20,0.90); --glass:rgba(15,11,20,0.84);
  --on-ink-dim:rgba(15,11,20,0.62); --track:rgba(255,255,255,0.14); --track-on:rgba(15,11,20,0.28);
  --accent:#FF5C9D; --accent-soft:rgba(255,92,157,0.14);
  --tangerine:#FF8040; --on-tang:#2A1306; --tang-soft:#3B2417; --tang-line:#5A3822; --tang-ink:#FFE8D8; --tang-chip:rgba(255,255,255,0.08); --coral:#FF6B5E; --pink:#FF5C9D; --orchid:#D07FC4; --violet:#A68BFF; --teal:#4CC3E3;
  --tint-tangerine:rgba(255,128,64,0.17); --tint-coral:rgba(255,107,94,0.17); --tint-pink:rgba(255,92,157,0.17);
  --tint-orchid:rgba(208,127,196,0.17); --tint-violet:rgba(166,139,255,0.17); --tint-teal:rgba(76,195,227,0.16);
  --good:#5BC27C; --bad:#FF7A6B;
  --glow:radial-gradient(70% 42% at 6% 0%,rgba(242,102,28,0.20),transparent 70%),radial-gradient(55% 40% at 100% 4%,rgba(230,57,127,0.14),transparent 70%),radial-gradient(70% 45% at 100% 100%,rgba(106,63,196,0.22),transparent 70%);
  --blob-o:0.36;
}
html { background:var(--bg); }
body { background:transparent; color:var(--ink); font-family:${sans}; }
h1, h2, h3 { font-weight:500; }
::selection { background:#C9206B; color:#fff; }
button:focus-visible, [role="button"]:focus-visible { outline:2px solid var(--accent); outline-offset:2px; }
input:focus-visible, textarea:focus-visible, select:focus-visible { outline:2px solid var(--accent) !important; outline-offset:1px; }

.mos-pagehead { position:relative; padding-bottom:18px; margin-bottom:24px; border-bottom:1px solid var(--rule); }
.mos-pagehead::after { content:""; position:absolute; left:0; bottom:-1px; width:40px; height:2px; background:var(--ink-strong); }

.mos-tabs-top { display:flex; gap:var(--nav-gap); overflow-x:auto; }
@media (max-width:639px) { .mos-hide-sm { display:none !important; } }
@media (max-width:480px) { .mos-suggest { width:var(--ctl); padding:0 !important; border-radius:50% !important; font-size:20px !important; } .mos-suggest-label { display:none; } }
.mos-tabbar { display:none; }
:root { --page-w:1240px; --gutter:20px; --cover-w:156px; --thumb-w:128px; --logo-fs:23px; --ctl:34px; --ctl-fs:12px; --nav-fs:12px; --nav-gap:26px; }
@media (min-width:640px) { :root { --gutter:28px; --cover-w:184px; --thumb-w:184px; --logo-fs:28px; --ctl:38px; --ctl-fs:13px; --nav-fs:13px; --nav-gap:32px; } }
@media (min-width:1100px) { :root { --gutter:40px; --cover-w:206px; --thumb-w:206px; --logo-fs:34px; --ctl:42px; --ctl-fs:14px; --nav-fs:14px; --nav-gap:40px; } }
body { overflow-x:clip; }
.mos-wrap { width:100%; max-width:var(--page-w); margin-left:auto; margin-right:auto; padding-left:var(--gutter); padding-right:var(--gutter); }
.mos-bleed { margin-left:calc(50% - 50vw); margin-right:calc(50% - 50vw); }
.mos-bleed-pad { padding-left:max(var(--gutter), calc((100vw - var(--page-w)) / 2 + var(--gutter))); padding-right:max(var(--gutter), calc((100vw - var(--page-w)) / 2 + var(--gutter))); }
.mos-shelf { scroll-padding-left:max(var(--gutter), calc((100vw - var(--page-w)) / 2 + var(--gutter))); }
.mos-prose { max-width:1040px; }
.mos-grid { display:grid; grid-template-columns:1fr; gap:10px; }
@media (max-width:520px) { .mos-spot-third { display:none !important; } }
.mos-tiles { display:grid; grid-template-columns:repeat(2, minmax(0,1fr)); gap:20px 14px; }
@media (min-width:640px) { .mos-tiles { grid-template-columns:repeat(3, minmax(0,1fr)); } }
@media (min-width:1100px) { .mos-tiles { grid-template-columns:repeat(5, minmax(0,1fr)); } }
@media (min-width:900px) { .mos-grid { grid-template-columns:repeat(2, minmax(0,1fr)); gap:12px; } }
@media (min-width:1280px) { .mos-grid { grid-template-columns:repeat(3, minmax(0,1fr)); } }
.mos-two { display:grid; grid-template-columns:minmax(0,1fr); gap:0; }
@media (min-width:760px) { .mos-two { grid-template-columns:minmax(0,1fr) minmax(0,1fr); gap:40px; } }
.mos-sheet-wrap { justify-content:flex-start !important; align-items:stretch !important; padding:0 !important; background:var(--surface) !important; }
.mos-sheet { max-width:none !important; width:100% !important; height:100vh !important; height:100dvh !important; max-height:100vh !important; max-height:100dvh !important; border-radius:0 !important; border:none !important; overscroll-behavior:contain; -webkit-overflow-scrolling:touch; }
button, a, summary, [role="tab"] { touch-action:manipulation; }
@media (max-width:900px) { input, select, textarea { font-size:16px !important; } }
@media (min-width:760px) {
  .mos-pad { padding-left:max(32px, calc((100% - 1120px) / 2)) !important; padding-right:max(32px, calc((100% - 1120px) / 2)) !important; }
  .mos-dtabs { overflow-x:visible !important; }
  .mos-zoom { zoom:1.3; --zoom:1.3; }
  .mos-dtabs > button { letter-spacing:0.1em !important; }
  .mos-dtabs > button { flex:1 1 0 !important; margin-right:0 !important; text-align:center !important; font-size:15px !important; padding-top:20px !important; padding-bottom:18px !important; }
  .mos-close { right:max(28px, calc((100% - 1120px) / 2)) !important; }
}
.mos-guide { display:grid; grid-template-columns:minmax(0,1fr); gap:44px; }
@media (min-width:900px) { .mos-guide { grid-template-columns:minmax(0,1fr) minmax(0,1fr); gap:72px; } }
.mos-spec { display:grid; grid-template-columns:minmax(0,1fr); gap:20px; }
@media (min-width:600px) { .mos-spec { grid-template-columns:180px minmax(0,1fr); gap:28px; } }
.mos-map { overflow-x:auto; }
.mos-formgrid { display:grid; grid-template-columns:minmax(0,1fr); gap:34px; }
@media (min-width:900px) { .mos-formgrid { grid-template-columns:repeat(2,minmax(0,1fr)); gap:40px 64px; } }
.mos-in { width:100%; box-sizing:border-box; min-height:46px; padding:11px 14px; border-radius:10px; border:1px solid var(--rule); background:var(--lift); color:var(--ink); font-family:'DM Sans Variable','Helvetica Neue',Helvetica,Arial,sans-serif; font-size:16px; outline:none; }
.mos-in:focus { border-color:var(--ink-strong); }
@media (min-width:760px) { .mos-in { font-size:14px; } }
.mos-country-sel{display:block}.mos-country-chips{display:none !important}@media(min-width:900px){.mos-country-sel{display:none}.mos-country-chips{display:flex !important}}
.mos-brandgrid { display:grid; grid-template-columns:repeat(2,1fr); gap:20px 14px; }
@media (min-width:600px){ .mos-brandgrid { grid-template-columns:repeat(auto-fill,minmax(180px,1fr)); gap:26px 18px; } }
.mos-country-sel { display:block; }
.mos-country-chips { display:none !important; }
@media (min-width:900px){ .mos-country-sel { display:none !important; } .mos-country-chips { display:flex !important; } }
@media (max-width:520px){ .mos-portrait span, .mos-portrait img { width:84px !important; height:84px !important; font-size:28px !important; } }
.mos-samples { display:grid; grid-template-columns:repeat(auto-fit,minmax(230px,1fr)); gap:10px; }
.mos-cover { transition:transform .18s ease, box-shadow .18s ease; }
.mos-cover:hover { transform:translateY(-3px); }
.mos-cover:focus-visible { outline:2px solid var(--accent); outline-offset:4px; border-radius:12px; }
.mos-shelf::-webkit-scrollbar { display:none; }
@media (min-width:760px) { .mos-shelf { padding-left:0 !important; padding-right:0 !important; width:min(calc(100vw - 2 * var(--gutter)), calc(var(--page-w) - 2 * var(--gutter))); margin-left:auto; margin-right:auto; scroll-padding-left:0; } }
.mos-band { background:var(--lift); }
.mos-fab { position:fixed; right:16px; bottom:28px; z-index:44; }
@media (max-width:639px) { .mos-fab { bottom:calc(84px + env(safe-area-inset-bottom)); } }
@media (max-width:639px) {
  .mos-tabs-top { display:none; }
  .mos-tabbar { display:flex; }
  .mos-main { padding-bottom:112px !important; }
}

.mos-blobs { position:absolute; inset:0; overflow:hidden; pointer-events:none; z-index:0; }
.mos-blobs i { position:absolute; border-radius:50%; filter:blur(64px); opacity:var(--blob-o); }
.mos-blobs i:nth-child(1) { width:300px; height:300px; left:-90px; top:-70px; background:#F2661C; }
.mos-blobs i:nth-child(2) { width:250px; height:250px; right:-80px; top:90px; background:#E6397F; }
.mos-blobs i:nth-child(3) { width:280px; height:280px; left:-70px; bottom:-90px; background:#8E52D6; }
.mos-blobs i:nth-child(4) { width:220px; height:220px; right:-50px; bottom:-40px; background:#1E9CC4; }

@keyframes mosSpin { to { transform:rotate(360deg); } }
.mos-spin { animation:mosSpin 3.2s linear infinite; }
@media (prefers-reduced-motion:reduce) { .mos-spin { animation:none; } * { transition-duration:0.01ms !important; } }
`;

const THEME_KEY = "mos-theme";
const THEME_COLORS = { light:"#FAF7F5", dark:"#0F0B14" };
function readThemePref() {
  // RULE: people always land on the dark page. It only turns light when they choose Light (or Auto) themselves.
  try { const v = window.localStorage.getItem(THEME_KEY); return v === "light" || v === "dark" || v === "system" ? v : "dark"; }
  catch (e) { return "dark"; }
}
function systemTheme() {
  return typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}
function resolveTheme(pref) { return pref === "system" ? systemTheme() : pref; }
function paintTheme(pref) {
  const r = resolveTheme(pref);
  document.documentElement.setAttribute("data-theme", r);
  const m = document.querySelector('meta[name="theme-color"]');
  if (m) m.setAttribute("content", THEME_COLORS[r]);
}
const themeStore = { pref:"dark", subs:new Set() };
function setThemePref(p) {
  themeStore.pref = p;
  try { window.localStorage.setItem(THEME_KEY, p); } catch (e) { /* storage unavailable */ }
  paintTheme(p);
  themeStore.subs.forEach(f => f());
}
if (typeof document !== "undefined") {
  if (!document.getElementById("mos-theme-css")) {
    const s = document.createElement("style");
    s.id = "mos-theme-css";
    s.textContent = THEME_CSS;
    document.head.appendChild(s);
  }
  themeStore.pref = readThemePref();
  paintTheme(themeStore.pref);
  if (window.matchMedia) {
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
      if (themeStore.pref === "system") { paintTheme("system"); themeStore.subs.forEach(f => f()); }
    });
  }
}
function useTheme() {
  const snap = useSyncExternalStore(
    cb => { themeStore.subs.add(cb); return () => themeStore.subs.delete(cb); },
    () => themeStore.pref + "|" + resolveTheme(themeStore.pref),
    () => "dark|dark"
  );
  const [pref, resolved] = snap.split("|");
  return { pref, resolved, setPref: setThemePref };
}

// ─── LOGO: a typographic wordmark, nothing else ──────────────────────────────
function Wordmark({ size = 22 }) {
  return (
    <span aria-hidden="true" style={{ fontFamily:serif, fontSize:size, lineHeight:1, letterSpacing:"-0.02em", color:T.black, fontWeight:500, display:"inline-flex", alignItems:"baseline", gap:"0.24em", whiteSpace:"nowrap" }}>
      <span>memoir</span>
      <span style={{ fontStyle:"italic", fontWeight:400, color:T.accent }}>on skin</span>
    </span>
  );
}
function Logo({ size = 20, stacked = false, align = "left", fluid = false }) {
  if (stacked) {
    return (
      <div role="img" aria-label="Memoir on Skin" style={{ display:"flex", justifyContent:align === "center" ? "center" : "flex-start" }}>
        <Wordmark size={size * 1.9}/>
      </div>
    );
  }
  return (
    <div role="img" aria-label="Memoir on Skin" style={{ display:"inline-flex", alignItems:"center" }}>
      <Wordmark size={fluid ? "var(--logo-fs)" : size}/>
    </div>
  );
}

// ─── THEME CONTROLS ───────────────────────────────────────────────────────────
function ThemeToggle({ size = 32 }) {
  const { resolved, setPref } = useTheme();
  const dark = resolved === "dark";
  return (
    <button onClick={() => setPref(dark ? "light" : "dark")} aria-label={dark ? "Switch to light mode" : "Switch to dark mode"} title={dark ? "Light mode" : "Dark mode"}
      style={{ width:size, height:size, borderRadius:"50%", border:`1px solid ${T.rule}`, background:T.white, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", flexShrink:0, padding:0 }}>
      <Icon name={dark ? "sun" : "moon"} size={15} color={T.mid}/>
    </button>
  );
}
function AppearancePicker() {
  const { pref, setPref } = useTheme();
  const opts = [["light","Light","sun"], ["dark","Dark","moon"], ["system","Auto","contrast"]];
  return (
    <div role="radiogroup" aria-label="Appearance" style={{ display:"flex", gap:4, padding:4, borderRadius:12, background:T.lift, border:`1px solid ${T.rule}` }}>
      {opts.map(([key, label, icon]) => {
        const on = pref === key;
        return (
          <button key={key} role="radio" aria-checked={on} onClick={() => setPref(key)}
            style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:6, padding:"8px 0", borderRadius:9, border:on ? `1px solid ${T.rule}` : "1px solid transparent", background:on ? T.white : "transparent", color:on ? T.black : T.mid, fontSize:12, fontWeight:on ? 600 : 400, fontFamily:sans, cursor:"pointer", transition:"all 0.15s" }}>
            <Icon name={icon} size={14} color={on ? T.accent : T.mid}/>{label}
          </button>
        );
      })}
    </div>
  );
}

// ─── SVG ICONS ────────────────────────────────────────────────────────────────
function Icon({ name, size=18, color=T.mid }) {
  const s = { width:size, height:size, display:"inline-flex", alignItems:"center", justifyContent:"center", flexShrink:0 };
  const icons = {
    finished: <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M8 12.5l2.7 2.7L16 9.5"/></svg>,
    bottle: <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 3h6M8 3v2.5c0 .5-.5 1-1 1.5L6 8.5C5.5 9 5 9.5 5 10v10a1 1 0 001 1h12a1 1 0 001-1V10c0-.5-.5-1-1-1.5l-1-1.5c-.5-.5-1-1-1-1.5V3"/><path d="M5 13h14"/></svg>,
    travel: <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 3h4v3h-4z"/><rect x="7" y="6" width="10" height="15" rx="2.5"/><path d="M7 12h10"/></svg>,
    sample: <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 3h4M9 3v1.5a1 1 0 01-.3.7L7 7v12a1 1 0 001 1h8a1 1 0 001-1V7l-1.7-1.8a1 1 0 01-.3-.7V3"/><path d="M7 11h10"/><circle cx="12" cy="15" r="1" fill={color} stroke="none"/></svg>,
    flame: <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2c0 0-5 4-5 9a5 5 0 0010 0c0-2-1.5-4-2.5-5 0 2-1.5 3-2.5 3-1 0-1.5-1-1.5-2 0-1.5 1.5-5 1.5-5z"/></svg>,
    thumbsup: <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14z"/><path d="M7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3"/></svg>,
    thumbsdown: <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 15v4a3 3 0 003 3l4-9V2H5.72a2 2 0 00-2 1.7l-1.38 9a2 2 0 002 2.3H10z"/><path d="M17 2h2.67A2.31 2.31 0 0122 4v7a2.31 2.31 0 01-2.33 2H17"/></svg>,
    nose: <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3c0 0 2 2 2 5v7c0 2 1.5 3 3 3s3-1.5 3-3"/><path d="M12 3c0 0-2 2-2 5v7c0 2-1.5 3-3 3s-3-1.5-3-3"/><path d="M9 20h6"/></svg>,
    skin: <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 11V6a2 2 0 00-2-2 2 2 0 00-2 2"/><path d="M14 10V4a2 2 0 00-2-2 2 2 0 00-2 2v2"/><path d="M10 10.5V6a2 2 0 00-2-2 2 2 0 00-2 2v8"/><path d="M18 8a2 2 0 014 0v6a8 8 0 01-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 012.83-2.82L7 15"/></svg>,
    wishstar: <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
    bookmark: <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>,
    // Closed lock — private
    lock: <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>,
    // Open lock — public
    lockopen: <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0"/></svg>,
    pin: <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>,
    globe: <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>,
    tip: <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="9" y1="18" x2="15" y2="18"/><line x1="10" y1="22" x2="14" y2="22"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0018 8 6 6 0 006 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 018.91 14"/></svg>,
    search: <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
    people: <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.6 2.9-6 6.5-6 1.5 0 2.8.4 3.9 1.1"/><circle cx="17" cy="16.5" r="3"/><path d="M19.2 18.7L21.5 21"/></svg>,
    droplet: <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z"/></svg>,
    lotion: <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="8" y="4" width="8" height="16" rx="2"/><path d="M10 4V2h4v2"/><line x1="8" y1="9" x2="16" y2="9"/></svg>,
    sun: <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4.5"/><line x1="12" y1="1.5" x2="12" y2="3.5"/><line x1="12" y1="20.5" x2="12" y2="22.5"/><line x1="4.2" y1="4.2" x2="5.6" y2="5.6"/><line x1="18.4" y1="18.4" x2="19.8" y2="19.8"/><line x1="1.5" y1="12" x2="3.5" y2="12"/><line x1="20.5" y1="12" x2="22.5" y2="12"/><line x1="4.2" y1="19.8" x2="5.6" y2="18.4"/><line x1="18.4" y1="5.6" x2="19.8" y2="4.2"/></svg>,
    moon: <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z"/></svg>,
    contrast: <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9.5"/><path d="M12 2.5a9.5 9.5 0 010 19z" fill={color} stroke="none"/></svg>,
    compass: <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9.5"/><polygon points="16.2 7.8 14.1 14.1 7.8 16.2 9.9 9.9 16.2 7.8"/></svg>,
    layers: <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="12" r="6.2"/><circle cx="15" cy="12" r="6.2"/></svg>,
    book: <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 4h6a3.5 3.5 0 013.5 3.5V21a2.5 2.5 0 00-2.5-2.5h-7z"/><path d="M21.5 4h-6A3.5 3.5 0 0012 7.5V21a2.5 2.5 0 012.5-2.5h7z"/></svg>,
    spray: <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="9" width="10" height="12" rx="2"/><path d="M14 13h2a2 2 0 002-2V9h-4"/><path d="M18 5v2"/><path d="M16 3h4"/><circle cx="18" cy="3" r="0.5" fill={color}/></svg>,
  };
  return <span style={s}>{icons[name] || null}</span>;
}

function SeasonIllustration({ season, size = 32 }) {
  const svgs = {
    spring: (
      <svg viewBox="0 0 40 40" fill="none">
        <line x1="20" y1="32" x2="20" y2="20" stroke="#5A9A3A" strokeWidth="1.8" strokeLinecap="round"/>
        <path d="M20 27 C17 24 13 24 13 27 C13 30 17 29 20 27Z" fill="#7BC55A" stroke="#5A9A3A" strokeWidth="0.8"/>
        <ellipse cx="20" cy="9" rx="3.5" ry="5" fill="#F7A8C4" stroke="#E07090" strokeWidth="0.7" transform="rotate(0 20 9)"/>
        <ellipse cx="26.1" cy="11" rx="3.5" ry="5" fill="#F7A8C4" stroke="#E07090" strokeWidth="0.7" transform="rotate(60 26.1 11)"/>
        <ellipse cx="26.1" cy="21" rx="3.5" ry="5" fill="#F7A8C4" stroke="#E07090" strokeWidth="0.7" transform="rotate(120 26.1 21)"/>
        <ellipse cx="20" cy="23" rx="3.5" ry="5" fill="#F7A8C4" stroke="#E07090" strokeWidth="0.7" transform="rotate(180 20 23)"/>
        <ellipse cx="13.9" cy="21" rx="3.5" ry="5" fill="#F7A8C4" stroke="#E07090" strokeWidth="0.7" transform="rotate(240 13.9 21)"/>
        <ellipse cx="13.9" cy="11" rx="3.5" ry="5" fill="#F7A8C4" stroke="#E07090" strokeWidth="0.7" transform="rotate(300 13.9 11)"/>
        <circle cx="20" cy="16" r="4" fill="#FFD93D" stroke="#C8A000" strokeWidth="0.8"/>
        <circle cx="20" cy="14.5" r="0.8" fill="#A07800"/>
        <circle cx="18.8" cy="16.8" r="0.8" fill="#A07800"/>
        <circle cx="21.2" cy="16.8" r="0.8" fill="#A07800"/>
        <path d="M14 33 Q17 31 20 32 Q23 33 26 31" stroke="#7BC55A" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
      </svg>
    ),
    summer: (
      <svg viewBox="0 0 40 40" fill="none">
        <line x1="20" y1="5" x2="20" y2="1" stroke="#F5A623" strokeWidth="2" strokeLinecap="round"/>
        <line x1="20" y1="37" x2="20" y2="33" stroke="#F5A623" strokeWidth="2" strokeLinecap="round"/>
        <line x1="5" y1="19" x2="1" y2="19" stroke="#F5A623" strokeWidth="2" strokeLinecap="round"/>
        <line x1="39" y1="19" x2="35" y2="19" stroke="#F5A623" strokeWidth="2" strokeLinecap="round"/>
        <line x1="9.4" y1="9.4" x2="6.6" y2="6.6" stroke="#F5A623" strokeWidth="2" strokeLinecap="round"/>
        <line x1="33.4" y1="33.4" x2="30.6" y2="30.6" stroke="#F5A623" strokeWidth="2" strokeLinecap="round"/>
        <line x1="30.6" y1="9.4" x2="33.4" y2="6.6" stroke="#F5A623" strokeWidth="2" strokeLinecap="round"/>
        <line x1="6.6" y1="33.4" x2="9.4" y2="30.6" stroke="#F5A623" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="20" cy="19" r="8" fill="#FFD93D" stroke="#F5A623" strokeWidth="1.2"/>
        <circle cx="20" cy="19" r="5.5" fill="#FFE566"/>
        <path d="M13 32 Q16 29 19 32 Q22 35 25 32" stroke="#F5A623" strokeWidth="1.3" strokeLinecap="round" fill="none" opacity="0.7"/>
        <path d="M15 37 Q17.5 34 20 37 Q22.5 40 25 37" stroke="#F5A623" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.35"/>
      </svg>
    ),
    fall: (
      <svg viewBox="0 0 40 40" fill="none">
        <path d="M8 8 C12 12 16 10 22 14" stroke="#8B5A2B" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M22 14 C24 10 30 9 32 13 C34 17 30 21 26 20 C22 19 20 18 22 14Z" fill="#E8732A" stroke="#C85A18" strokeWidth="0.9"/>
        <line x1="22" y1="14" x2="30" y2="17" stroke="#C85A18" strokeWidth="0.6"/>
        <path d="M16 22 C17 18 22 17 24 20 C26 23 23 27 20 26 C17 25 15 25 16 22Z" fill="#D94020" stroke="#A83010" strokeWidth="0.9" transform="rotate(-20 20 22)"/>
        <path d="M10 28 C11 25 15 24 16 27 C17 30 14 32 12 31 C10 30 9 30 10 28Z" fill="#F5C518" stroke="#C8960A" strokeWidth="0.9" transform="rotate(15 13 28)"/>
        <path d="M6 20 Q14 16 22 20 Q30 24 36 20" stroke="#C85A18" strokeWidth="0.8" strokeLinecap="round" fill="none" opacity="0.4" strokeDasharray="2 2"/>
      </svg>
    ),
    winter: (
      <svg viewBox="0 0 40 40" fill="none">
        <line x1="20" y1="5" x2="20" y2="35" stroke="#4A90D9" strokeWidth="2" strokeLinecap="round"/>
        <line x1="7" y1="12.5" x2="33" y2="27.5" stroke="#4A90D9" strokeWidth="2" strokeLinecap="round"/>
        <line x1="33" y1="12.5" x2="7" y2="27.5" stroke="#4A90D9" strokeWidth="2" strokeLinecap="round"/>
        <line x1="17" y1="10" x2="23" y2="10" stroke="#4A90D9" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="17" y1="30" x2="23" y2="30" stroke="#4A90D9" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="9.5" y1="17" x2="12" y2="14" stroke="#4A90D9" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="9.5" y1="23" x2="12" y2="26" stroke="#4A90D9" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="30.5" y1="17" x2="28" y2="14" stroke="#4A90D9" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="30.5" y1="23" x2="28" y2="26" stroke="#4A90D9" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="20" cy="20" r="3.5" fill="#4A90D9"/>
        <circle cx="20" cy="20" r="2" fill="#FFFFFF"/>
        <circle cx="20" cy="5" r="1.5" fill="#4A90D9"/>
        <circle cx="20" cy="35" r="1.5" fill="#4A90D9"/>
        <circle cx="7" cy="12.5" r="1.5" fill="#4A90D9"/>
        <circle cx="33" cy="27.5" r="1.5" fill="#4A90D9"/>
        <circle cx="33" cy="12.5" r="1.5" fill="#4A90D9"/>
        <circle cx="7" cy="27.5" r="1.5" fill="#4A90D9"/>
      </svg>
    ),
  };
  return (
    <div style={{ width: size, height: size, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      {svgs[season] || null}
    </div>
  );
}

// ─── BOTTLE ILLUSTRATION — for status badge & layering ───────────────────────
function BottleDrawing({ size = 36, isWhite = false }) {
  const stroke = isWhite ? T.white : T.black;
  return (
    <svg width={size * 0.55} height={size * 0.75} viewBox="0 0 22 30" fill="none">
      <rect x="7" y="0" width="8" height="4" rx="1.5" fill={stroke} opacity="0.9"/>
      <path d="M9 4 L8 8 L14 8 L13 4Z" fill={stroke} opacity="0.7"/>
      <rect x="5" y="8" width="12" height="19" rx="3" fill={stroke} opacity="0.15"/>
      <rect x="5" y="8" width="12" height="19" rx="3" stroke={stroke} strokeWidth="1.4"/>
      <line x1="5" y1="13" x2="17" y2="13" stroke={stroke} strokeWidth="0.8" opacity="0.5"/>
      <rect x="7" y="15" width="8" height="7" rx="1" stroke={stroke} strokeWidth="0.7" opacity="0.4"/>
    </svg>
  );
}

function SampleDrawing({ size = 36, isWhite = false }) {
  const stroke = isWhite ? T.white : T.mid;
  return (
    <svg width={size * 0.4} height={size * 0.75} viewBox="0 0 14 30" fill="none">
      <rect x="4" y="0" width="6" height="3.5" rx="1" fill={stroke} opacity="0.85"/>
      <path d="M5 3.5 L4.5 7 L9.5 7 L9 3.5Z" fill={stroke} opacity="0.6"/>
      <rect x="3" y="7" width="8" height="20" rx="2" stroke={stroke} strokeWidth="1.3"/>
      <rect x="3" y="7" width="8" height="20" rx="2" fill={stroke} opacity="0.1"/>
      <rect x="3" y="17" width="8" height="10" rx="2" fill={stroke} opacity="0.25"/>
      <line x1="3" y1="17" x2="11" y2="17" stroke={stroke} strokeWidth="0.7" opacity="0.5"/>
      <line x1="3" y1="21" x2="7" y2="21" stroke={stroke} strokeWidth="0.5" opacity="0.4"/>
    </svg>
  );
}

// ─── ACCORD BARS — ranked, one colour per accord ─────────────────────────────
const ACCORD_COLORS = {
  woody:"#A9744B", floral:"#E2639B", "white floral":"#F28CB8", fresh:"#34B3C6", citrus:"#EFC12C", fruity:"#F2883A",
  sweet:"#D9568A", amber:"#D98A2B", musky:"#C9A6B8", powdery:"#E9A87C", green:"#5DAE5E", leather:"#8A4B3A",
  smoky:"#7A6A8C", "warm spicy":"#D2552E", spicy:"#D2552E", aromatic:"#6FA58A", oud:"#6B3F36", vanilla:"#E8C58A",
  gourmand:"#B5703E", mossy:"#6E8F52", patchouli:"#8D6E4C", aquatic:"#4AA3D8", earthy:"#8C7B5A", balsamic:"#B9824F",
  animalic:"#9C6B5A", tobacco:"#9A6A3A", rose:"#E2639B", iris:"#A58BD6", lavender:"#A58BD6", coconut:"#E9D9BF",
  honey:"#EBB13C", tropical:"#F0A63A", metallic:"#9AA7B0", ozonic:"#7CC3E0", cherry:"#C93255", almond:"#D6B08A",
  caramel:"#C98A3C", coffee:"#7A5238", chocolate:"#6A4030", cacao:"#6A4030", incense:"#8F7AA8", resinous:"#B9824F",
};
const ACCORD_FALLBACK = ["#F2661C", "#E6397F", "#8E52D6", "#1E9CC4", "#E24A3D", "#9A3F8E"];
function accordColor(name) {
  const k = String(name).toLowerCase().trim();
  if (ACCORD_COLORS[k]) return ACCORD_COLORS[k];
  let h = 0;
  for (const c of k) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return ACCORD_FALLBACK[h % ACCORD_FALLBACK.length];
}
function onColor(hex) {
  const n = parseInt(hex.slice(1), 16);
  const lum = 0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255);
  return lum > 150 ? "#2A1F2E" : "#FFFFFF";
}
function AccordBars({ accords }) {
  const list = [...(accords || [])].sort((a, b) => b.v - a.v);
  if (!list.length) return null;
  const max = Math.max(...list.map(a => a.v)) || 1;
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
      {list.map(a => {
        const c = accordColor(a.n);
        const w = Math.max(28, Math.round((a.v / max) * 100));
        return (
          <div key={a.n} style={{ width:`${w}%`, minWidth:110, height:34, borderRadius:9, padding:"0 14px", display:"flex", alignItems:"center", background:c, color:onColor(c), fontFamily:sans, fontSize:13, fontWeight:600, textTransform:"capitalize", letterSpacing:"0.01em" }}>{a.n}</div>
        );
      })}
    </div>
  );
}

// Thin one-line summary of a fragrance's accords, sized by strength (used under cover tiles)
function AccordRibbon({ accords, height = 6, style }) {
  const list = [...(accords || [])].sort((a, b) => b.v - a.v).slice(0, 6);
  if (!list.length) return null;
  return (
    <span role="img" aria-label={"Main accords: " + list.map(a => a.n).join(", ")} style={{ display:"flex", height, borderRadius:height/2, overflow:"hidden", gap:1, ...style }}>
      {list.map(a => <span key={a.n} style={{ flex:Math.max(1, a.v), background:accordColor(a.n) }}/>)}
    </span>
  );
}
// Flower view: one petal per accord, longer petal = stronger accord
function AccordBloom({ accords }) {
  const list = [...(accords || [])].sort((a, b) => b.v - a.v).slice(0, 8);
  const n = list.length;
  if (n < 3) return <AccordBars accords={accords}/>;
  const W = 380, H = 300, cx = 190, cy = 150, maxLen = 104, lab = maxLen + 16;
  const max = Math.max(...list.map(a => a.v)) || 1;
  const rx = n <= 4 ? 30 : n <= 6 ? 25 : 20;
  return (
    <div style={{ width:"100%", maxWidth:420, margin:"0 auto" }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label={"Accord bloom: " + list.map(a => a.n).join(", ")} style={{ display:"block" }}>
        {[0.34, 0.67, 1].map(r => <circle key={r} cx={cx} cy={cy} r={maxLen * r} fill="none" stroke={T.rule}/>)}
        {list.map((a, i) => {
          const L = Math.max(26, (a.v / max) * maxLen);
          const deg = (360 / n) * i;
          return <g key={a.n} transform={`translate(${cx} ${cy}) rotate(${deg})`}><ellipse cx="0" cy={-L/2} rx={rx} ry={L/2} fill={accordColor(a.n)} fillOpacity="0.92"/></g>;
        })}
        <circle cx={cx} cy={cy} r="5" fill={T.bg || "#fff"}/>
        {list.map((a, i) => {
          const rad = ((360 / n) * i) * Math.PI / 180;
          const x = cx + Math.sin(rad) * lab, y = cy - Math.cos(rad) * lab;
          const anchor = Math.abs(Math.sin(rad)) < 0.25 ? "middle" : Math.sin(rad) > 0 ? "start" : "end";
          return <text key={a.n} x={x} y={y + (Math.cos(rad) > 0.25 ? 12 : Math.cos(rad) < -0.25 ? -2 : 4)} textAnchor={anchor} fontFamily={sans} fontSize="13" fontWeight="600" fill={T.ink} style={{ textTransform:"capitalize" }}>{a.n}</text>;
        })}
      </svg>
    </div>
  );
}

// ─── SEASON HEAT MAP — colored per season with season illustrations ───────────
function SeasonHeat({ seasons }) {
  const order = ["spring", "summer", "fall", "winter"];
  const labels = { spring: "Spring", summer: "Summer", fall: "Fall", winter: "Winter" };
  // Season-specific color palettes for the bars
  const seasonColors = {
    spring: { filled: (i) => `hsl(${130 + i * 5}, ${55 + i * 3}%, ${65 - i * 4}%)`, empty: T.lift },
    summer: { filled: (i) => `hsl(${38 + i * 2}, ${85 + i * 1}%, ${68 - i * 5}%)`, empty: T.lift },
    fall:   { filled: (i) => `hsl(${22 - i * 2}, ${80 + i * 2}%, ${68 - i * 7}%)`, empty: T.lift },
    winter: { filled: (i) => `hsl(${210 + i * 2}, ${60 + i * 3}%, ${70 - i * 5}%)`, empty: T.lift },
  };
  const max = Math.max(...Object.values(seasons));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {order.map(s => {
        const v = seasons[s];
        const relPct = v / max;
        const sc = seasonColors[s];
        return (
          <div key={s} style={{ display: "flex", alignItems: "center", gap: 12 }}>
            
            <div style={{ width: 70, display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
              <SeasonIllustration season={s} size={28}/>
              <span style={{ fontFamily: sans, fontSize: 11, color: T.mid }}>{labels[s]}</span>
            </div>
            
            <div style={{ flex: 1, display: "flex", gap: 3 }}>
              {Array.from({ length: 10 }).map((_, i) => {
                const filled = i < Math.round(relPct * 10);
                return (
                  <div key={i} style={{
                    flex: 1, height: 22, borderRadius: 4,
                    background: filled ? sc.filled(i) : sc.empty,
                    transition: "all 0.2s"
                  }}/>
                );
              })}
            </div>
            <span style={{ fontFamily: sans, fontSize: 11, color: T.mid, width: 24, textAlign: "right", flexShrink: 0 }}>{v}</span>
          </div>
        );
      })}
      <p style={{ fontFamily: sans, fontSize: 10, color: T.faint, margin: "4px 0 0" }}>Strength relative to best season</p>
    </div>
  );
}

// ─── NOTE COLORS ─────────────────────────────────────────────────────────────
const NOTE_COLORS = {
  "Pineapple":    { bg:"#FFF3C4", stroke:"#C8860A", fill:"#FFD93D", accent:"#A86800" },
  "Blackcurrant": { bg:"#EDE0F5", stroke:"#6B3A8A", fill:"#9B59C8", accent:"#4A1F6B" },
  "Apple":        { bg:"#E8F5E0", stroke:"#3D7A2A", fill:"#6ABF45", accent:"#2A5C1A" },
  "Bergamot":     { bg:"#FFF8E0", stroke:"#B89A00", fill:"#FFE566", accent:"#8A7200" },
  "Saffron":      { bg:"#FFF0D0", stroke:"#C86A00", fill:"#FF9B1A", accent:"#A05000" },
  "Jasmine":      { bg:"#FFFFF0", stroke:"#A8A800", fill:"#F0F0A0", accent:"#787800" },
  "Rose":         { bg:"#FDEEF0", stroke:"#C03050", fill:"#E8809A", accent:"#8B1A30" },
  "Gardenia":     { bg:"#F8F8F0", stroke:"#888870", fill:"#E8E8D0", accent:"#606050" },
  "Lotus":        { bg:"#F5E8F5", stroke:"#9060A0", fill:"#D4A8D8", accent:"#603870" },
  "Ylang-Ylang":  { bg:"#FFFCE0", stroke:"#A09000", fill:"#F0E060", accent:"#787000" },
  "Violet":       { bg:"#EEE8F8", stroke:"#6040A0", fill:"#A888D8", accent:"#402878" },
  "Iris":         { bg:"#EEF0FA", stroke:"#4858A8", fill:"#9AAAE0", accent:"#283878" },
  "Birch":        { bg:"#F0EEE5", stroke:"#6B6030", fill:"#B8A870", accent:"#4A4020" },
  "Oud":          { bg:"#F0E8D8", stroke:"#7A4010", fill:"#C08040", accent:"#5A2800" },
  "Sandalwood":   { bg:"#F5EEE0", stroke:"#9A6820", fill:"#D4A860", accent:"#704800" },
  "Cedarwood":    { bg:"#EEF0E8", stroke:"#5A7830", fill:"#98C060", accent:"#385018" },
  "Vetiver":      { bg:"#ECF0E5", stroke:"#506828", fill:"#88A858", accent:"#304818" },
  "Papyrus":      { bg:"#F8F4E0", stroke:"#A09040", fill:"#D8C870", accent:"#786820" },
  "Patchouli":    { bg:"#EAE8D8", stroke:"#706030", fill:"#A89870", accent:"#504020" },
  "Rosewood":     { bg:"#F5E8E8", stroke:"#A03840", fill:"#D88080", accent:"#701820" },
  "Amberwood":    { bg:"#F5EAD5", stroke:"#9A6010", fill:"#D4A040", accent:"#704000" },
  "Cedar":        { bg:"#EDF0E6", stroke:"#4A6828", fill:"#8AAA58", accent:"#304018" },
  "Fir Resin":    { bg:"#E8F0E8", stroke:"#306830", fill:"#68A868", accent:"#185018" },
  "Cardamom":     { bg:"#EDF5EA", stroke:"#408040", fill:"#80C080", accent:"#206020" },
  "Incense":      { bg:"#EEE8F0", stroke:"#706080", fill:"#B0A0C0", accent:"#504060" },
  "Leather":      { bg:"#F0EAE0", stroke:"#8A5820", fill:"#C09060", accent:"#603800" },
  "Musk":         { bg:"#F0EEF5", stroke:"#706080", fill:"#B0A8C8", accent:"#503870" },
  "Oakmoss":      { bg:"#E8F0E0", stroke:"#486028", fill:"#88A860", accent:"#284010" },
  "Ambergris":    { bg:"#F0EEE0", stroke:"#888050", fill:"#C8C080", accent:"#606030" },
  "Vanilla":      { bg:"#FFF5E0", stroke:"#B88000", fill:"#F0C840", accent:"#886000" },
  "Tonka Bean":   { bg:"#F5EDE0", stroke:"#8A6020", fill:"#C09050", accent:"#604000" },
  "Amber":        { bg:"#FFF0D8", stroke:"#C07000", fill:"#F0A030", accent:"#905000" },
  "Black Truffle":{ bg:"#E8E0E0", stroke:"#402020", fill:"#806060", accent:"#200808" },
  "Black Orchid": { bg:"#EAE0F0", stroke:"#502878", fill:"#9060B8", accent:"#301050" },
  "Tobacco":      { bg:"#F0E8D0", stroke:"#7A5010", fill:"#C09040", accent:"#503000" },
  "Cocoa":        { bg:"#F0E0D0", stroke:"#6A3010", fill:"#B07040", accent:"#402000" },
  _default:       { bg:"#F0F0F0", stroke:"#666666", fill:"#AAAAAA", accent:"#444444" },
};
function getNoteColor(n) { return NOTE_COLORS[n] || NOTE_COLORS._default; }

// ─── NOTE ILLUSTRATIONS ───────────────────────────────────────────────────────
const NOTE_FALLBACK_PAL = [
  { bg:"#FBEFE6", stroke:"#B5703F", fill:"#EDBF95", accent:"#8A4F25" },
  { bg:"#F3EAF6", stroke:"#8A5BA6", fill:"#D7BDE6", accent:"#5E3578" },
  { bg:"#E8F1EA", stroke:"#4F8A5E", fill:"#B7D9BF", accent:"#2F6A3E" },
  { bg:"#E7F0F4", stroke:"#3F8196", fill:"#B5D8E4", accent:"#1F5C72" },
  { bg:"#FBEDEF", stroke:"#B5465A", fill:"#EFB9C3", accent:"#872B3D" },
  { bg:"#FBF4DD", stroke:"#B08A12", fill:"#F0DC8C", accent:"#7D6208" },
];
function noteFallback(name) {
  let h = 0; for (const ch of String(name).toLowerCase()) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return NOTE_FALLBACK_PAL[h % NOTE_FALLBACK_PAL.length];
}
// Events notebook: live for everyone. ?events=0 switches it off on this device, ?events=1 switches it back on.
const EVENTS_PREVIEW = (() => {
  try {
    const q = new URLSearchParams(window.location.search).get("events");
    if (q === "0") localStorage.setItem("mos-events", "0");
    if (q === "1") localStorage.removeItem("mos-events");
    return localStorage.getItem("mos-events") !== "0";
  } catch { return true; }
})();
// Note photos (Midjourney, white background). Live for everyone.
const NOTE_PHOTO_PREVIEW = (() => {
  // Note photos are live for everyone. ?noteimages=0 switches them off on this device (for checking the drawn fallbacks); ?noteimages=1 switches them back on.
  try {
    const q = new URLSearchParams(window.location.search).get("noteimages");
    if (q === "0") localStorage.setItem("noteimages", "0");
    if (q === "1") localStorage.removeItem("noteimages");
    return localStorage.getItem("noteimages") !== "0";
  } catch { return true; }
})();

const NOTE_PHOTO_ALIASES = {"absinthe":"absinthe", "allspice":"allspice", "almond blossom":"almond-blossom", "almond":"almond", "amber":"amber", "ambergris":"ambergris", "animalic notes":"family-animalic", "animalic":"family-animalic", "apple blossom":"apple-blossom", "apple":"apple", "apricot":"apricot", "bamboo":"bamboo", "banana":"banana", "basil":"basil", "benzoin":"benzoin", "bergamot":"bergamot", "bitter orange blossom":"bitter-orange-blossom", "bitter orange leaf":"bitter-orange-leaf", "black pepper":"black-pepper", "pepper":"black-pepper", "black tea":"black-tea", "tea":"black-tea", "blackcurrant":"blackcurrant", "black currant":"blackcurrant", "cassis":"blackcurrant", "blood orange":"blood-orange", "blueberry":"blueberry", "broom":"broom", "butter":"butter", "cacao pod":"cacao-pod", "cacao":"cacao-pod", "cocoa":"cacao-pod", "cannabis":"cannabis", "cantaloupe":"cantaloupe", "caramel":"caramel", "cardamom":"cardamom", "cardamon":"cardamom", "carnation":"carnation", "carrot seeds":"carrot-seeds", "carrot":"carrot", "cashmere":"cashmere", "cedarwood":"cedarwood", "cedar":"cedarwood", "cedar wood":"cedarwood", "atlas cedar":"cedarwood", "virginia cedar":"cedarwood", "champaca":"champaca", "champagne":"champagne", "cherry blossom":"cherry-blossom", "sakura":"cherry-blossom", "cherry":"cherry", "black cherry":"cherry", "chestnut":"chestnut", "chili":"chili", "cinnamon":"cinnamon", "cistus":"cistus", "citrus":"citrus", "clary sage":"clary-sage", "clove":"clove", "clover":"clover", "coconut":"coconut", "coffee":"coffee", "coffee beans":"coffee", "coriander":"coriander", "cotton candy":"cotton-candy", "cotton flower":"cotton-flower", "cotton":"cotton-flower", "cranberry":"cranberry", "cream glass":"cream-glass", "cream":"cream-glass", "cucumber":"cucumber", "cypress":"cypress", "dark chocolate":"dark-chocolate", "chocolate":"dark-chocolate", "dates":"dates", "dried fruits":"dried-fruits", "ebony":"ebony", "fennel":"fennel", "fenugreek":"fenugreek", "fern":"fern", "fig":"fig", "floral notes":"family-floral", "flowers":"family-floral", "frankincense":"frankincense", "olibanum":"frankincense", "incense":"frankincense", "freesia":"freesia", "fruity notes":"family-fruit", "fruits":"family-fruit", "galbanum":"galbanum", "gardenia":"gardenia", "gin glass":"gin-glass", "gin":"gin-glass", "ginger":"ginger", "golden glass":"golden-glass", "whisky":"golden-glass", "whiskey":"golden-glass", "cognac":"golden-glass", "gourmand notes":"family-gourmand", "gourmand":"family-gourmand", "grapefruit":"grapefruit", "grapes":"grapes", "guaiac":"guaiac", "guava":"guava", "gurjan balsam":"gurjan-balsam", "hawthorn":"hawthorn", "hawthorn blossom":"hawthorn", "hazelnut":"hazelnut", "heliotrope":"heliotrope", "herbal notes":"family-herb", "herbs":"family-herb", "hibiscus":"hibiscus", "honeycomb":"honeycomb", "honey":"honeycomb", "beeswax":"honeycomb", "iris":"iris", "jasmine sambac":"jasmine-sambac", "jasmine":"jasmine", "jasmine sambac absolute":"jasmine", "jasmine grandiflorum":"jasmine", "juniper":"juniper", "kiwi":"kiwi", "kumquat":"kumquat", "labdanum":"labdanum", "lavender":"lavender", "leather":"leather", "leather accord":"leather", "lemon":"lemon", "lemongrass":"lemongrass", "licorice":"licorice", "lily of the valley":"lily-of-the-valley", "muguet":"lily-of-the-valley", "lily":"lily", "lime":"lime", "linden blossom":"linden-blossom", "lychee":"lychee", "litchi":"lychee", "mace":"mace", "magnolia":"magnolia", "mahogany":"mahogany", "mandarin":"mandarin", "mandarin orange":"mandarin", "tangerine":"mandarin", "mango":"mango", "maple":"maple", "marigold":"marigold", "marine notes":"family-marine", "marine":"family-marine", "marshmallow":"marshmallow", "mastic":"mastic", "milk splash":"milk-splash", "milk":"milk-splash", "mimosa":"mimosa", "mineral notes":"family-mineral", "mineral":"family-mineral", "myrrh":"myrrh", "myrtle":"myrtle", "nectarine":"nectarine", "nutmeg":"nutmeg", "oakmoss":"oakmoss", "olive tree":"olive-tree", "orange blossom":"orange-blossom", "neroli":"orange-blossom", "orange flower":"orange-blossom", "orchid":"orchid", "oregano":"oregano", "marjoram":"oregano", "osmanthus":"osmanthus", "oud":"oud", "agarwood":"oud", "oud wood":"oud", "palo santo":"palo-santo", "papaya":"papaya", "paprika":"paprika", "passion flower":"passion-flower", "passionfruit":"passionfruit", "patchouli":"patchouli", "peach blossom":"peach-blossom", "peach":"peach", "pear":"pear", "pineapple":"pineapple", "pink peony":"pink-peony", "peony":"pink-peony", "peonies":"pink-peony", "pink peppercorn":"pink-peppercorn", "pink pepper":"pink-peppercorn", "pink peppercorns":"pink-peppercorn", "pistachio":"pistachio", "pitahaya":"pitahaya", "plum":"plum", "pomelo":"pomelo", "popcorn":"popcorn", "praline":"praline", "quince":"quince", "raspberry":"raspberry", "red currant":"red-currant", "rhubarb":"rhubarb", "rice":"rice", "rice notes":"rice", "rose geranium":"rose-geranium", "rose hip":"rose-hip", "rose":"rose", "rose petals":"rose", "rosemary":"rosemary", "rum tumbler":"rum-tumbler", "rum":"rum-tumbler", "bubbly cola":"rum-tumbler", "cola":"rum-tumbler", "saffron":"saffron", "sage":"sage", "salt":"salt", "sea salt":"salt", "sand":"sand", "sandalwood":"sandalwood", "sandal":"sandalwood", "seaweed":"seaweed", "sesame":"sesame", "shiso":"shiso", "spearmint":"spearmint", "strawberry":"strawberry", "suede":"suede", "sugar":"sugar", "white sugar":"sugar", "sugarcane":"sugarcane", "solar notes":"family-solar", "solar":"family-solar", "sweet orange":"sweet-orange", "orange":"sweet-orange", "sweet pea":"sweet-pea", "teak":"teak", "tobacco":"tobacco", "toffee":"toffee", "tomato leaf":"tomato-leaf", "tomato leaves":"tomato-leaf", "tonka":"tonka", "tonka bean":"tonka", "tonka beans":"tonka", "truffle":"truffle", "black truffle":"truffle", "tuberose":"tuberose", "turmeric":"turmeric", "vanilla":"vanilla", "vetiver":"vetiver", "violet flower":"violet-flower", "violet":"violet-flower", "violet leaf":"violet-leaf", "watermelon":"watermelon", "wheat":"wheat", "grain":"wheat", "wisteria":"wisteria", "glycine":"wisteria", "woody notes":"family-wood", "woods":"family-wood", "wood":"family-wood", "ylang ylang":"ylang-ylang", "yuzu":"yuzu"};
const NOTE_PHOTO_GALLERY = ["absinthe", "allspice", "almond blossom", "almond", "amber", "ambergris", "animalic notes", "apple blossom", "apple", "apricot", "bamboo", "banana", "basil", "benzoin", "bergamot", "bitter orange blossom", "bitter orange leaf", "black pepper", "black tea", "blackcurrant", "blood orange", "blueberry", "broom", "butter", "cacao pod", "cannabis", "cantaloupe", "caramel", "cardamom", "carnation", "carrot seeds", "carrot", "cashmere", "cedarwood", "champaca", "champagne", "cherry blossom", "cherry", "chestnut", "chili", "cinnamon", "cistus", "citrus", "clary sage", "clove", "clover", "coconut", "coffee", "coriander", "cotton candy", "cotton flower", "cranberry", "cream glass", "cucumber", "cypress", "dark chocolate", "dates", "dried fruits", "ebony", "fennel", "fenugreek", "fern", "fig", "floral notes", "frankincense", "freesia", "fruity notes", "galbanum", "gardenia", "gin glass", "ginger", "golden glass", "gourmand notes", "grapefruit", "grapes", "guaiac", "guava", "gurjan balsam", "hawthorn", "hazelnut", "heliotrope", "herbal notes", "hibiscus", "honeycomb", "iris", "jasmine sambac", "jasmine", "juniper", "kiwi", "kumquat", "labdanum", "lavender", "leather", "lemon", "lemongrass", "licorice", "lily of the valley", "lily", "lime", "linden blossom", "lychee", "mace", "magnolia", "mahogany", "mandarin", "mango", "maple", "marigold", "marine notes", "marshmallow", "mastic", "milk splash", "mimosa", "mineral notes", "myrrh", "myrtle", "nectarine", "nutmeg", "oakmoss", "olive tree", "orange blossom", "orchid", "oregano", "osmanthus", "oud", "palo santo", "papaya", "paprika", "passion flower", "passionfruit", "patchouli", "peach blossom", "peach", "pear", "pineapple", "pink peony", "pink peppercorn", "pistachio", "pitahaya", "plum", "pomelo", "popcorn", "praline", "quince", "raspberry", "red currant", "rhubarb", "rice", "rose geranium", "rose hip", "rose", "rosemary", "rum tumbler", "saffron", "sage", "salt", "sand", "sandalwood", "seaweed", "sesame", "shiso", "spearmint", "strawberry", "suede", "sugar", "sugarcane", "solar notes", "sweet orange", "sweet pea", "teak", "tobacco", "toffee", "tomato leaf", "tonka", "truffle", "tuberose", "turmeric", "vanilla", "vetiver", "violet flower", "violet leaf", "watermelon", "wheat", "wisteria", "woody notes", "ylang ylang", "yuzu"];
// Extra names that share an existing card (regional / variant spellings)
Object.assign(NOTE_PHOTO_ALIASES, {"ylang-ylang":"ylang-ylang", "lily-of-the-valley":"lily-of-the-valley", "agarwood (oud)":"oud", "agarwood":"oud", "cambodian oud":"oud", "laotian oud":"oud", "thai oud":"oud", "orris":"iris", "orris butter":"iris", "geranium":"rose-geranium", "bourbon geranium":"rose-geranium", "guaiac wood":"guaiac", "guaiacwood":"guaiac", "virginian cedar":"cedarwood", "white cedar extract":"cedarwood", "cedar":"cedarwood", "mint":"spearmint", "peppermint":"spearmint", "moss":"oakmoss", "bulgarian rose":"rose", "turkish rose":"rose", "damask rose":"rose", "may rose":"rose", "taif rose":"rose", "moroccan rose":"rose", "grasse rose":"rose", "rose de mai":"rose", "rose water":"rose", "white rose":"rose", "red rose":"rose", "rose absolute":"rose", "rose oil":"rose", "tincture of rose":"rose", "amalfi lemon":"lemon", "sicilian lemon":"lemon", "italian lemon":"lemon", "lemon zest":"lemon", "calabrian bergamot":"bergamot", "sicilian bergamot":"bergamot", "italian bergamot":"bergamot", "green mandarin":"mandarin", "sicilian mandarin":"mandarin", "italian mandarin":"mandarin", "clementine":"mandarin", "bitter orange":"sweet-orange", "brazilian orange":"sweet-orange", "african orange flower":"orange-blossom", "tunisian neroli":"orange-blossom", "madagascar vanilla":"vanilla", "bourbon vanilla":"vanilla", "vanilla absolute":"vanilla", "vanilla bean":"vanilla", "tahitian vanilla":"vanilla", "vanilla orchid":"vanilla", "haitian vetiver":"vetiver", "pink grapefruit":"grapefruit", "white peach":"peach", "green apple":"apple", "red apple":"apple", "granny smith apple":"apple", "sour cherry":"cherry", "passion fruit":"passionfruit", "egyptian jasmine":"jasmine", "indian jasmine":"jasmine", "jasmine absolute":"jasmine", "indian tuberose":"tuberose", "green tea":"black-tea", "white tea":"black-tea", "white honey":"honeycomb", "fig leaf":"fig", "teak wood":"teak", "australian sandalwood":"sandalwood", "mysore sandalwood":"sandalwood", "sandalowood":"sandalwood", "patchouli leaf":"patchouli", "indonesian patchouli":"patchouli", "indonesian patchouli leaf":"patchouli", "carrot seed":"carrot-seeds", "sea notes":"family-marine", "sea water":"family-marine", "water notes":"family-marine", "dry wood":"family-wood", "dry woods":"family-wood", "white woods":"family-wood", "white wood":"family-wood", "precious woods":"family-wood", "green notes":"family-herb", "green leaves":"family-herb", "sweet notes":"family-gourmand", "white flowers":"family-floral", "red berries":"family-fruit", "red fruits":"family-fruit", "wild berries":"family-fruit", "animal notes":"family-animalic", "white pepper":"black-pepper", "sichuan pepper":"black-pepper", "ceylon cinnamon":"cinnamon", "cassia":"cinnamon", "guatemalan cardamom":"cardamom", "juniper berry":"juniper", "lime (linden) blossom":"linden-blossom", "coconut milk":"coconut", "coconut water":"coconut", "almond milk":"milk-splash", "whipped cream":"cream-glass", "brown sugar":"sugar", "sugar cane":"sugarcane", "bitter almond":"almond", "melon":"cantaloupe", "tobacco leaf":"tobacco", "ylang ylang":"ylang-ylang", "tangerine":"mandarin", "musk":"cashmere", "white musk":"cashmere", "white musks":"cashmere", "musks":"cashmere", "black musk":"cashmere", "musk accord":"cashmere", "siberian musk":"cashmere", "deer musk accord":"cashmere", "vanila":"vanilla", "vanilla pod":"vanilla", "rhuburb":"rhubarb", "wild strawberry":"strawberry", "iris flower":"iris", "white iris":"iris", "tuscan iris":"iris", "orange peel":"sweet-orange", "pelargonium":"rose-geranium", "tobacco blossom":"tobacco", "black currant leaf":"blackcurrant", "raspberry leaf":"raspberry", "fig tree":"fig", "brandy":"golden-glass", "barley":"wheat", "copahu balm":"gurjan-balsam", "vodka":"gin-glass", "roasted coffee beans":"coffee", "white lily":"lily", "black orchid":"orchid", "water lily":"lily", "pink lotus":"lily", "chocolate":"dark-chocolate", "white chocolate":"dark-chocolate", "milk chocolate":"dark-chocolate", "mint leaf":"spearmint", "spearmint leaf":"spearmint", "cacao absolute":"cacao-pod", "cocoa bean":"cacao-pod"});
function noteImageKey(rawName) {
  let n = String(rawName || "").trim().toLowerCase().replace(/\s+/g, " ");
  let key = NOTE_PHOTO_ALIASES[n];
  if (!key) {
    // Variant fallback: drop trailing form words (absolute, oil, zest...) then up to 3 leading qualifiers (tunisian, white, italian...)
    const t = n.replace(/\s+(absolute|oil|essence|extract|accord|zest|peel|resinoid|tincture|co2|note|notes)$/, "");
    const w = t.split(" ");
    for (let i = 0; i < Math.min(4, w.length) && !key; i++) key = NOTE_PHOTO_ALIASES[w.slice(i).join(" ")];
  }
  return key || null;
}
function notePhotoFor(rawName) {
  if (!NOTE_PHOTO_PREVIEW) return null;
  const key = noteImageKey(rawName);
  return key ? `/note-images/${key}.webp` : null;
}
const TILE_W = "calc(var(--cover-w) / var(--zoom, 1))"; // same on-screen width as a Discover cover, even inside the zoomed fragrance page
function NoteIllustration({ name: rawName, size = 72, big = false, tile = false, noLabel = false }) {
  const photo = notePhotoFor(rawName);
  if (photo) {
    const label = String(rawName || "").replace(/(^|[\s-])([a-z])/g, (m, p, ch) => p + ch.toUpperCase());
    const img = <img className="note-photo" src={photo} alt={label} loading="lazy" draggable={false} style={{ width:"100%", height:"100%", objectFit:"contain", mixBlendMode:"multiply", filter:"drop-shadow(0 4px 6px rgba(0,0,0,0.12))", display:"block" }}/>;
    if (tile) return (
      <div style={{ width:TILE_W, flex:"none", boxSizing:"border-box", textAlign:"left" }}>
        <div style={{ position:"relative", width:"100%", aspectRatio:"0.8", borderRadius:12, overflow:"hidden", background:"#FFFFFF", border:`1px solid ${T.rule}`, padding:"8%", boxSizing:"border-box" }}>{img}</div>
        {!noLabel&&<span style={{ display:"block", marginTop:10, minHeight:"2.4em", fontFamily:serif, fontSize:16, lineHeight:1.2, letterSpacing:-0.2, color:T.black }}>{label}</span>}
      </div>
    );
    if (big) return (
      <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-start", gap:10, width:"100%" }}>
        <div style={{ width:"100%", aspectRatio:"1", borderRadius:16, background:T.lift, border:`1px solid ${T.rule}`, overflow:"hidden", padding:"6%", boxSizing:"border-box" }}>{img}</div>
        <span style={{ fontFamily:serif, fontSize:20, color:T.black, lineHeight:1.15 }}>{label}</span>
      </div>
    );
    return (
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:5 }}>
        <div style={{ width:size, height:size, borderRadius:12, background:T.lift, border:`1px solid ${T.rule}`, overflow:"hidden", flexShrink:0, padding:4, boxSizing:"border-box" }}>{img}</div>
        <span style={{ fontFamily:sans, fontSize:10, color:T.mid, textAlign:"center", lineHeight:1.3, maxWidth:size }}>{label}</span>
      </div>
    );
  }
  const name = String(rawName || "").replace(/(^|[\s-])([a-z])/g, (m, p, ch) => p + ch.toUpperCase());
  const c = NOTE_COLORS[name] || noteFallback(name);
  const arts = {
    "Pineapple": <svg viewBox="0 0 60 60" fill="none"><ellipse cx="30" cy="38" rx="13" ry="15" fill={c.fill} stroke={c.stroke} strokeWidth="1.3"/>{[30,34,38,42].map((y,i)=><path key={i} d={`M18 ${y} Q30 ${y-5} 42 ${y}`} stroke={c.accent} strokeWidth="0.8" fill="none"/>)}{[-8,0,8].map((dx,i)=><path key={i} d={`M${30+dx} 23 C${28+dx} 14 ${30+dx} 10 ${32+dx} 8`} stroke={c.stroke} strokeWidth="1.2" fill={c.fill}/>)}<path d="M30 23 L30 15" stroke={c.accent} strokeWidth="0.7"/></svg>,
    "Blackcurrant": <svg viewBox="0 0 60 60" fill="none">{[[22,28,7],[35,25,6],[28,38,7.5],[18,38,5],[38,34,5.5]].map(([cx,cy,r],i)=><circle key={i} cx={cx} cy={cy} r={r} fill={c.fill} stroke={c.stroke} strokeWidth="1.1"/>)}{[[22,28],[35,25],[28,38],[18,38],[38,34]].map(([cx,cy],i)=><circle key={i} cx={cx} cy={cy} r="1.8" fill={c.accent}/>)}<path d="M24 21 C26 15 30 12 32 10 C34 12 36 15 35 20" stroke={c.stroke} strokeWidth="0.9" fill="none"/></svg>,
    "Bergamot": <svg viewBox="0 0 60 60" fill="none"><circle cx="30" cy="33" r="16" fill={c.fill} stroke={c.stroke} strokeWidth="1.3"/><circle cx="30" cy="33" r="10" stroke={c.stroke} strokeWidth="0.5" strokeDasharray="2 2" fill="none"/><ellipse cx="30" cy="33" rx="5" ry="3" fill={c.accent} opacity="0.4"/><path d="M29 17 C29 13 31 10 30 8" stroke={c.stroke} strokeWidth="1.1" strokeLinecap="round"/><path d="M30 8 C33 9 35 12 33 14" stroke={c.stroke} strokeWidth="0.9" fill="none"/></svg>,
    "Saffron": <svg viewBox="0 0 60 60" fill="none">{[[20,42,-40],[30,44,0],[40,42,40]].map(([cx,cy,rot],i)=><ellipse key={i} cx={cx} cy={cy} rx="4" ry="7" fill={c.fill} stroke={c.stroke} strokeWidth="1" transform={`rotate(${rot} ${cx} ${cy})`}/>)}{[[20,18,26,38],[30,18,30,38],[40,18,34,38]].map(([x1,y1,x2,y2],i)=><line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={c.stroke} strokeWidth="1.2" strokeLinecap="round"/>)}{[[20,18],[30,18],[40,18]].map(([cx,cy],i)=><ellipse key={i} cx={cx} cy={cy} rx="3" ry="6" fill={c.accent} stroke={c.stroke} strokeWidth="0.8"/>)}</svg>,
    "Jasmine": <svg viewBox="0 0 60 60" fill="none"><circle cx="30" cy="30" r="4" fill={c.accent} stroke={c.stroke} strokeWidth="0.8"/>{[0,45,90,135,180,225,270,315].map((deg,i)=>{const rad=deg*Math.PI/180;const cx=30+9*Math.cos(rad),cy=30+9*Math.sin(rad);return<ellipse key={i} cx={cx} cy={cy} rx="3.5" ry="5.5" fill={c.fill} stroke={c.stroke} strokeWidth="0.9" transform={`rotate(${deg} ${cx} ${cy})`}/>;})}</svg>,
    "Rose": <svg viewBox="0 0 60 60" fill="none"><circle cx="30" cy="26" r="5" fill={c.accent} stroke={c.stroke} strokeWidth="0.9"/><path d="M30 21 C27 16 19 17 17 23 C15 30 20 34 26 34 C21 34 16 39 19 44 C22 48 28 47 30 43" fill={c.fill} stroke={c.stroke} strokeWidth="1.1"/><path d="M30 21 C33 16 41 17 43 23 C45 30 40 34 34 34 C39 34 44 39 41 44 C38 48 32 47 30 43" fill={c.fill} stroke={c.stroke} strokeWidth="1.1"/><line x1="30" y1="43" x2="30" y2="54" stroke={c.stroke} strokeWidth="1.2"/><path d="M30 48 C26 46 21 46 19 48" stroke={c.stroke} strokeWidth="0.9" fill="none"/></svg>,
    "Birch": <svg viewBox="0 0 60 60" fill="none"><rect x="26" y="6" width="8" height="48" rx="4" fill={c.fill} stroke={c.stroke} strokeWidth="1.2"/>{[14,22,30,38].map((y,i)=><rect key={i} x="25" y={y} width="10" height="2.5" rx="1" fill={c.accent} opacity="0.5"/>)}<path d="M26 12 C20 10 14 13 12 17" stroke={c.stroke} strokeWidth="1" fill="none"/><path d="M26 22 C20 18 14 20 12 25" stroke={c.stroke} strokeWidth="0.9" fill="none"/><path d="M34 14 C40 10 46 13 48 17" stroke={c.stroke} strokeWidth="1" fill="none"/><path d="M34 24 C40 20 46 22 48 26" stroke={c.stroke} strokeWidth="0.9" fill="none"/></svg>,
    "Oud": <svg viewBox="0 0 60 60" fill="none"><rect x="16" y="22" width="28" height="30" rx="2" fill={c.fill} stroke={c.stroke} strokeWidth="1.2"/>{[24,30,36].map(x=><line key={x} x1={x} y1={22} x2={x} y2={52} stroke={c.stroke} strokeWidth="0.6" opacity="0.5"/>)}{[30,38,46].map(y=><line key={y} x1={16} y1={y} x2={44} y2={y} stroke={c.stroke} strokeWidth="0.6" opacity="0.5"/>)}<path d="M20 22 C20 14 26 9 30 8 C34 9 40 14 40 22" fill={c.accent} stroke={c.stroke} strokeWidth="1.2"/></svg>,
    "Sandalwood": <svg viewBox="0 0 60 60" fill="none"><path d="M30 50 C30 50 14 38 14 26 C14 18 22 12 30 12 C38 12 46 18 46 26 C46 38 30 50 30 50Z" fill={c.fill} stroke={c.stroke} strokeWidth="1.2"/><path d="M30 50 C30 50 20 36 22 24 C24 18 27 14 30 12" stroke={c.stroke} strokeWidth="0.7" fill="none" opacity="0.7"/><path d="M30 50 C30 50 40 36 38 24 C36 18 33 14 30 12" stroke={c.stroke} strokeWidth="0.7" fill="none" opacity="0.7"/><ellipse cx="30" cy="28" rx="8" ry="6" fill={c.accent} opacity="0.3" stroke={c.stroke} strokeWidth="0.5" strokeDasharray="2 1.5"/></svg>,
    "Patchouli": <svg viewBox="0 0 60 60" fill="none"><line x1="30" y1="52" x2="30" y2="22" stroke={c.stroke} strokeWidth="1.2"/>{[[20,26,-20],[40,30,20],[22,38,-15],[38,42,15]].map(([cx,cy,rot],i)=><ellipse key={i} cx={cx} cy={cy} rx="9" ry="6" fill={c.fill} stroke={c.stroke} strokeWidth="1" transform={`rotate(${rot} ${cx} ${cy})`}/>)}</svg>,
    "Vanilla": <svg viewBox="0 0 60 60" fill="none"><path d="M23 52 C21 44 19 32 21 20 C22 14 26 9 30 8 C34 9 38 14 39 20 C41 32 39 44 37 52" fill={c.fill} stroke={c.stroke} strokeWidth="1.2"/><path d="M26 52 C25 44 24 32 25 20" stroke={c.stroke} strokeWidth="0.6" fill="none" opacity="0.6"/><path d="M34 52 C35 44 36 32 35 20" stroke={c.stroke} strokeWidth="0.6" fill="none" opacity="0.6"/>{[28,38].map(y=><line key={y} x1={22} y1={y} x2={38} y2={y} stroke={c.accent} strokeWidth="0.8" strokeDasharray="2 2"/>)}<ellipse cx="30" cy="9" rx="3" ry="5" fill={c.accent} stroke={c.stroke} strokeWidth="0.8"/></svg>,
    "Incense": <svg viewBox="0 0 60 60" fill="none"><rect x="27" y="40" width="6" height="12" rx="3" fill={c.fill} stroke={c.stroke} strokeWidth="1"/><circle cx="30" cy="39" r="3.5" fill={c.accent} stroke={c.stroke} strokeWidth="0.8"/><path d="M30 36 C28 30 32 24 30 18" stroke={c.stroke} strokeWidth="1.1" fill="none" strokeLinecap="round"/><path d="M30 34 C26 28 32 22 28 16" stroke={c.fill} strokeWidth="0.8" fill="none" opacity="0.7"/><path d="M30 32 C34 26 28 20 32 14" stroke={c.fill} strokeWidth="0.8" fill="none" opacity="0.4"/></svg>,
    "Musk": <svg viewBox="0 0 60 60" fill="none"><circle cx="30" cy="30" r="14" fill={c.fill} stroke={c.stroke} strokeWidth="1.2"/><circle cx="30" cy="30" r="8" stroke={c.stroke} strokeWidth="0.7" strokeDasharray="3 2" fill="none"/><circle cx="30" cy="30" r="3" fill={c.accent}/>{[0,60,120,180,240,300].map((deg,i)=>{const rad=deg*Math.PI/180;return<line key={i} x1={(30+9*Math.cos(rad)).toFixed(1)} y1={(30+9*Math.sin(rad)).toFixed(1)} x2={(30+13*Math.cos(rad)).toFixed(1)} y2={(30+13*Math.sin(rad)).toFixed(1)} stroke={c.stroke} strokeWidth="1.1"/>;})}</svg>,
    "Oakmoss": <svg viewBox="0 0 60 60" fill="none"><path d="M15 44 C15 44 18 34 25 29 C29 27 32 29 32 29 C32 29 35 27 39 29 C46 34 48 44 48 44" fill={c.fill} stroke={c.stroke} strokeWidth="1.1"/><ellipse cx="30" cy="26" rx="5" ry="4" fill={c.accent} stroke={c.stroke} strokeWidth="0.8"/><path d="M26 26 C26 20 28 15 30 12 C32 15 34 20 34 26" fill={c.fill} stroke={c.stroke} strokeWidth="0.9"/><circle cx="30" cy="11" r="2.5" fill={c.accent} stroke={c.stroke} strokeWidth="0.7"/></svg>,
    "Ambergris": <svg viewBox="0 0 60 60" fill="none"><path d="M16 38 C16 28 22 18 30 16 C38 18 44 28 44 38 C44 46 38 52 30 52 C22 52 16 46 16 38Z" fill={c.fill} stroke={c.stroke} strokeWidth="1.2"/><ellipse cx="30" cy="36" rx="7" ry="5" fill={c.accent} opacity="0.3" stroke={c.stroke} strokeWidth="0.5" strokeDasharray="2 1.5"/>{[[24,28],[34,24],[26,40],[36,38]].map(([cx,cy],i)=><circle key={i} cx={cx} cy={cy} r="1.5" fill={c.accent} opacity="0.5"/>)}</svg>,
    "Tonka Bean": <svg viewBox="0 0 60 60" fill="none"><ellipse cx="30" cy="36" rx="14" ry="10" fill={c.fill} stroke={c.stroke} strokeWidth="1.2"/>{[30,36,42].map(y=><line key={y} x1={17} y1={y} x2={43} y2={y} stroke={c.stroke} strokeWidth="0.6" opacity="0.5"/>)}<path d="M28 26 C28 19 30 14 30 10" stroke={c.stroke} strokeWidth="1.1" strokeLinecap="round"/><path d="M30 10 C27 9 24 10 23 12" stroke={c.stroke} strokeWidth="0.8" fill="none"/><path d="M30 10 C33 9 36 10 37 12" stroke={c.stroke} strokeWidth="0.8" fill="none"/></svg>,
    "Amber": <svg viewBox="0 0 60 60" fill="none"><polygon points="30,10 46,24 40,44 20,44 14,24" fill={c.fill} stroke={c.stroke} strokeWidth="1.2"/><polygon points="30,16 42,27 37,41 23,41 18,27" fill={c.accent} stroke={c.stroke} strokeWidth="0.5" opacity="0.4"/><line x1="30" y1="10" x2="30" y2="44" stroke={c.stroke} strokeWidth="0.4" opacity="0.5"/><line x1="14" y1="24" x2="46" y2="24" stroke={c.stroke} strokeWidth="0.4" opacity="0.5"/></svg>,
    "Cardamom": <svg viewBox="0 0 60 60" fill="none"><ellipse cx="30" cy="31" rx="10" ry="16" fill={c.fill} stroke={c.stroke} strokeWidth="1.2"/><line x1="30" y1="15" x2="30" y2="47" stroke={c.stroke} strokeWidth="0.7" opacity="0.6"/>{[23,29,35,41].map(y=><line key={y} x1={21} y1={y} x2={39} y2={y} stroke={c.stroke} strokeWidth="0.6" opacity="0.5"/>)}<ellipse cx="30" cy="31" rx="5" ry="8" fill={c.accent} opacity="0.25"/><path d="M29 15 C29 11 30 8 30 6" stroke={c.stroke} strokeWidth="0.9" strokeLinecap="round"/></svg>,
    "Leather": <svg viewBox="0 0 60 60" fill="none"><path d="M14 20 C14 16 18 14 22 14 L38 14 C42 14 46 16 46 20 L46 40 C46 44 42 46 38 46 L22 46 C18 46 14 44 14 40 Z" fill={c.fill} stroke={c.stroke} strokeWidth="1.2"/>{[28,34,40].map(y=><line key={y} x1={18} y1={y} x2={42} y2={y} stroke={c.stroke} strokeWidth="0.6" opacity="0.5"/>)}<circle cx="30" cy="14" r="3" fill={c.accent} stroke={c.stroke} strokeWidth="0.8"/></svg>,
    "Vetiver": <svg viewBox="0 0 60 60" fill="none"><path d="M30 52 C30 52 20 40 18 28 C16 18 20 10 30 8 C40 10 44 18 42 28 C40 40 30 52 30 52Z" fill={c.fill} stroke={c.stroke} strokeWidth="1.1"/><path d="M30 52 C28 44 22 34 20 24" stroke={c.stroke} strokeWidth="0.6" fill="none" opacity="0.7"/><path d="M30 52 C32 44 38 34 40 24" stroke={c.stroke} strokeWidth="0.6" fill="none" opacity="0.7"/><ellipse cx="30" cy="28" rx="8" ry="6" fill={c.accent} opacity="0.25"/></svg>,
    "Papyrus": <svg viewBox="0 0 60 60" fill="none"><rect x="16" y="14" width="28" height="36" rx="1.5" fill={c.fill} stroke={c.stroke} strokeWidth="1.2"/>{[22,27,32,37,42].map(y=><line key={y} x1={22} y1={y} x2={38} y2={y} stroke={c.stroke} strokeWidth="0.8" opacity="0.6"/>)}<rect x="16" y="14" width="28" height="8" rx="1" fill={c.accent} opacity="0.2"/></svg>,
    "Black Truffle": <svg viewBox="0 0 60 60" fill="none"><circle cx="30" cy="32" r="16" fill={c.fill} stroke={c.stroke} strokeWidth="1.2"/>{[[24,28,1.5],[32,24,1.2],[28,34,1.8],[36,30,1.3],[22,36,1.4]].map(([cx,cy,r],i)=><circle key={i} cx={cx} cy={cy} r={r} fill={c.accent}/>)}</svg>,
    "Black Orchid": <svg viewBox="0 0 60 60" fill="none"><circle cx="30" cy="28" r="5" fill={c.accent} stroke={c.stroke} strokeWidth="0.9"/>{[0,51,102,153,204,255,306].map((deg,i)=>{const r=deg*Math.PI/180;const cx=30+10*Math.cos(r),cy=28+10*Math.sin(r);return<ellipse key={i} cx={cx} cy={cy} rx="5" ry="8" fill={c.fill} stroke={c.stroke} strokeWidth="0.9" transform={`rotate(${deg} ${cx} ${cy})`}/>;})}<line x1="30" y1="38" x2="30" y2="52" stroke={c.stroke} strokeWidth="1.2"/></svg>,
    "Ylang-Ylang": <svg viewBox="0 0 60 60" fill="none"><line x1="30" y1="52" x2="30" y2="20" stroke={c.stroke} strokeWidth="1"/>{[44,36,28,20].map((y,i)=><g key={i}><path d={`M30 ${y} C18 ${y-8} 16 ${y-16} 22 ${y-18}`} stroke={c.stroke} strokeWidth="0.9" fill={c.fill}/><path d={`M30 ${y} C42 ${y-8} 44 ${y-16} 38 ${y-18}`} stroke={c.stroke} strokeWidth="0.9" fill={c.fill}/></g>)}<circle cx="30" cy="20" r="3" fill={c.accent} stroke={c.stroke} strokeWidth="0.8"/></svg>,
    "Gardenia": <svg viewBox="0 0 60 60" fill="none"><circle cx="30" cy="30" r="4" fill={c.accent} stroke={c.stroke} strokeWidth="0.8"/>{[0,51,102,153,204,255,306].map((deg,i)=>{const r=deg*Math.PI/180;const cx=30+10*Math.cos(r),cy=30+10*Math.sin(r);return<ellipse key={i} cx={cx} cy={cy} rx="5" ry="8" fill={c.fill} stroke={c.stroke} strokeWidth="0.9" transform={`rotate(${deg} ${cx} ${cy})`}/>;})}</svg>,
    "Lotus": <svg viewBox="0 0 60 60" fill="none"><path d="M30 46 C30 46 16 38 16 28 C16 20 22 16 30 18 C38 16 44 20 44 28 C44 38 30 46 30 46Z" fill={c.fill} stroke={c.stroke} strokeWidth="1.1"/><path d="M18 34 C12 30 10 22 14 16" fill={c.fill} stroke={c.stroke} strokeWidth="0.9"/><path d="M42 34 C48 30 50 22 46 16" fill={c.fill} stroke={c.stroke} strokeWidth="0.9"/><ellipse cx="30" cy="30" rx="6" ry="4" fill={c.accent} opacity="0.3"/><line x1="30" y1="46" x2="30" y2="54" stroke={c.stroke} strokeWidth="1.2"/></svg>,
    "Iris": <svg viewBox="0 0 60 60" fill="none"><line x1="30" y1="52" x2="30" y2="24" stroke={c.stroke} strokeWidth="1.2"/><path d="M30 24 C26 18 20 16 18 20 C16 24 20 28 26 28" fill={c.fill} stroke={c.stroke} strokeWidth="1"/><path d="M30 24 C34 18 40 16 42 20 C44 24 40 28 34 28" fill={c.fill} stroke={c.stroke} strokeWidth="1"/><path d="M26 28 C22 30 18 34 20 38 C22 42 28 42 30 38" fill={c.fill} stroke={c.stroke} strokeWidth="1"/><path d="M34 28 C38 30 42 34 40 38 C38 42 32 42 30 38" fill={c.fill} stroke={c.stroke} strokeWidth="1"/></svg>,
    "Violet": <svg viewBox="0 0 60 60" fill="none">{[0,72,144,216,288].map((deg,i)=>{const r=(deg-90)*Math.PI/180;const cx=30+11*Math.cos(r),cy=30+11*Math.sin(r);return<ellipse key={i} cx={cx} cy={cy} rx="6" ry="9" fill={c.fill} stroke={c.stroke} strokeWidth="1" transform={`rotate(${deg} ${cx} ${cy})`}/>;})}<circle cx="30" cy="30" r="4" fill={c.accent} stroke={c.stroke} strokeWidth="0.8"/><line x1="30" y1="41" x2="30" y2="52" stroke={c.stroke} strokeWidth="1.2"/></svg>,
    "Rosewood": <svg viewBox="0 0 60 60" fill="none"><line x1="30" y1="52" x2="30" y2="18" stroke={c.stroke} strokeWidth="1.8"/><path d="M30 28 C24 24 18 24 16 28 C14 34 18 38 24 38" fill={c.fill} stroke={c.stroke} strokeWidth="1"/><path d="M30 20 C36 16 42 16 44 20 C46 26 42 30 36 30" fill={c.fill} stroke={c.stroke} strokeWidth="1"/><circle cx="24" cy="33" r="4" fill={c.accent} opacity="0.5"/><circle cx="36" cy="25" r="4" fill={c.accent} opacity="0.5"/></svg>,
    "Cedarwood": <svg viewBox="0 0 60 60" fill="none"><line x1="30" y1="54" x2="30" y2="44" stroke={c.stroke} strokeWidth="2.5"/><polygon points="30,8 14,28 46,28" fill={c.fill} stroke={c.stroke} strokeWidth="1.2"/><polygon points="30,18 13,36 47,36" fill={c.fill} stroke={c.stroke} strokeWidth="1.2"/><polygon points="30,28 12,46 48,46" fill={c.fill} stroke={c.stroke} strokeWidth="1.2"/></svg>,
    "Fir Resin": <svg viewBox="0 0 60 60" fill="none"><line x1="30" y1="54" x2="30" y2="44" stroke={c.stroke} strokeWidth="2"/><polygon points="30,6 14,24 46,24" fill={c.fill} stroke={c.stroke} strokeWidth="1"/><polygon points="30,16 12,36 48,36" fill={c.fill} stroke={c.stroke} strokeWidth="1"/><polygon points="30,26 12,46 48,46" fill={c.fill} stroke={c.stroke} strokeWidth="1"/></svg>,
    "Amberwood": <svg viewBox="0 0 60 60" fill="none"><rect x="16" y="20" width="28" height="30" rx="2" fill={c.fill} stroke={c.stroke} strokeWidth="1.2"/>{[24,36].map(x=><line key={x} x1={x} y1={20} x2={x} y2={50} stroke={c.stroke} strokeWidth="0.6" opacity="0.5"/>)}{[30,40].map(y=><line key={y} x1={16} y1={y} x2={44} y2={y} stroke={c.stroke} strokeWidth="0.6" opacity="0.5"/>)}<polygon points="30,8 22,18 38,18" fill={c.accent} stroke={c.stroke} strokeWidth="1"/></svg>,
    "Cedar": <svg viewBox="0 0 60 60" fill="none"><line x1="30" y1="54" x2="30" y2="38" stroke={c.stroke} strokeWidth="2.5"/><polygon points="30,8 15,28 45,28" fill={c.fill} stroke={c.stroke} strokeWidth="1.2"/><polygon points="30,20 14,38 46,38" fill={c.fill} stroke={c.stroke} strokeWidth="1.2"/></svg>,
    "Tobacco": <svg viewBox="0 0 60 60" fill="none"><ellipse cx="30" cy="34" rx="13" ry="16" fill={c.fill} stroke={c.stroke} strokeWidth="1.2"/><ellipse cx="30" cy="34" rx="6" ry="7" fill={c.accent} opacity="0.3"/><path d="M29 18 C29 14 30 10 30 8" stroke={c.stroke} strokeWidth="0.9" strokeLinecap="round"/></svg>,
    "Cocoa": <svg viewBox="0 0 60 60" fill="none"><path d="M16 26 C16 18 22 14 30 14 C38 14 44 18 44 26 C44 38 36 48 30 50 C24 48 16 38 16 26Z" fill={c.fill} stroke={c.stroke} strokeWidth="1.2"/><ellipse cx="30" cy="30" rx="8" ry="6" fill={c.accent} opacity="0.3"/></svg>,
  };
  const art = arts[name] || <svg viewBox="0 0 60 60" fill="none"><circle cx="30" cy="30" r="20" fill={c.fill} stroke={c.stroke} strokeWidth="1.2"/><text x="30" y="38.5" textAnchor="middle" fontFamily={serif} fontSize="24" fill={c.accent}>{String(name).charAt(0).toUpperCase()}</text></svg>;
  if (tile) return (
    <div style={{ width:TILE_W, flex:"none", boxSizing:"border-box", textAlign:"left" }}>
      <div style={{ position:"relative", width:"100%", aspectRatio:"0.8", borderRadius:12, overflow:"hidden", background:c.bg, border:`1px solid ${T.rule}`, boxSizing:"border-box", display:"flex", alignItems:"center", justifyContent:"center" }}>
        <div style={{ width:"66%", aspectRatio:"1" }}>{art}</div>
      </div>
      {!noLabel&&<span style={{ display:"block", marginTop:10, minHeight:"2.4em", fontFamily:serif, fontSize:16, lineHeight:1.2, letterSpacing:-0.2, color:T.black }}>{name}</span>}
    </div>
  );
  if (big) return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-start", gap:10, width:"100%" }}>
      <div style={{ width:"100%", aspectRatio:"1", borderRadius:16, background:c.bg, border:`1px solid ${c.stroke}22`, overflow:"hidden", display:"flex", alignItems:"center", justifyContent:"center" }}>
        <div style={{ width:"62%", height:"62%" }}>{art}</div>
      </div>
      <span style={{ fontFamily:serif, fontSize:20, color:T.black, lineHeight:1.15 }}>{name}</span>
    </div>
  );
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:5 }}>
      <div style={{ width:size, height:size, borderRadius:12, background:c.bg, border:`1px solid ${c.stroke}22`, overflow:"hidden", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
        <div style={{ width:size-10, height:size-10 }}>{art}</div>
      </div>
      <span style={{ fontFamily:sans, fontSize:10, color:T.mid, textAlign:"center", lineHeight:1.3, maxWidth:size }}>{name}</span>
    </div>
  );
}

// ─── HOUSE STRIP — EXACT layout as screenshot: cards side by side below occasions ─
// ─── STATUS BADGE WITH DRAWING — pill style matching screenshot ───────────────
function StatusBadge({ statusKey }) {
  const st = STATUSES.find(s => s.key === statusKey);
  if (!st) return null;
  const isBottle = st.group === "bottle";
  const bgColor = isBottle ? ACCENT_FILL : T.white;
  const borderColor = isBottle ? ACCENT_FILL : T.rule;

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 6,
      padding: "5px 12px 5px 8px",
      borderRadius: 20, flexShrink: 0,
      border: `1px solid ${borderColor}`,
      background: bgColor,
    }}>
      
      {st.group === "bottle" && (
        <svg width="14" height="18" viewBox="0 0 22 30" fill="none">
          <rect x="7" y="0" width="8" height="4" rx="1.5" fill="white" opacity="0.9"/>
          <path d="M9 4 L8 8 L14 8 L13 4Z" fill="white" opacity="0.7"/>
          <rect x="5" y="8" width="12" height="19" rx="3" fill="white" opacity="0.2"/>
          <rect x="5" y="8" width="12" height="19" rx="3" stroke="white" strokeWidth="1.4"/>
          <line x1="5" y1="13" x2="17" y2="13" stroke="white" strokeWidth="0.8" opacity="0.5"/>
          <rect x="7" y="15" width="8" height="7" rx="1" stroke="white" strokeWidth="0.7" opacity="0.4"/>
        </svg>
      )}
      {st.group === "sample" && (
        <svg width="10" height="18" viewBox="0 0 14 30" fill="none">
          <rect x="4" y="0" width="6" height="3.5" rx="1" fill={T.mid} opacity="0.85"/>
          <path d="M5 3.5 L4.5 7 L9.5 7 L9 3.5Z" fill={T.mid} opacity="0.6"/>
          <rect x="3" y="7" width="8" height="20" rx="2" stroke={T.mid} strokeWidth="1.3"/>
          <rect x="3" y="17" width="8" height="10" rx="2" fill={T.mid} opacity="0.25"/>
          <line x1="3" y1="17" x2="11" y2="17" stroke={T.mid} strokeWidth="0.7" opacity="0.5"/>
        </svg>
      )}
      {st.group === "tried" && <Icon name={st.iconName} size={13} color={T.mid}/>}
      <span style={{ fontFamily: sans, fontSize: 10, fontWeight: 500, color: isBottle ? ON_ACCENT : T.mid }}>
        {st.label.split("—")[0].trim()}
      </span>
    </div>
  );
}

// ─── REACTION BAR ─────────────────────────────────────────────────────────────
const REACTION_FILL = { dislike:"#6A3FC4", like:"#17788F", love:"#C9206B" };
const REACTIONS = {
  dislike:{ iconName:"thumbsdown", label:"Dislike" },
  like:   { iconName:"thumbsup",   label:"Like"    },
  love:   { iconName:"flame",      label:"Love"    },
};
function ReactionBar({ value, onChange, compact }) {
  return (
    <div style={{ display:"flex", gap: compact ? 6 : 8 }}>
      {Object.entries(REACTIONS).map(([key,r]) => {
        const active = value === key;
        const iconColor = active ? ON_ACCENT : T.mid;
        return (
          <button key={key} onClick={e=>{e.stopPropagation();onChange(active?null:key);}}
            style={{ display:"flex", alignItems:"center", gap: compact?3:5, padding: compact?"4px 9px":"7px 13px", borderRadius:20, cursor:"pointer", border:`1px solid ${active?REACTION_FILL[key]:T.rule}`, background:active?REACTION_FILL[key]:T.white, transition:"all 0.15s" }}>
            <Icon name={r.iconName} size={compact?13:15} color={iconColor}/>
            {!compact && <span style={{ fontFamily:sans, fontSize:11, fontWeight:500, color:active?ON_ACCENT:T.mid }}>{r.label}</span>}
          </button>
        );
      })}
    </div>
  );
}

// ─── PRICE TABLE ──────────────────────────────────────────────────────────────
function PriceTable({ prices }) {
  if (!prices) return null;
  return (
    <div style={{ background:T.lift, borderRadius:12, overflow:"hidden", border:`1px solid ${T.rule}` }}>
      {prices.map((p,i) => (
        <div key={p.size} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"11px 14px", borderBottom: i<prices.length-1?`1px solid ${T.rule}`:"none" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:8, height:8, borderRadius:"50%", background: p.sample?T.mid:T.black }}/>
            <span style={{ fontFamily:sans, fontSize:13, color:T.ink }}>{p.size}</span>
            {p.sample && <span style={{ fontFamily:sans, fontSize:9, padding:"1px 6px", borderRadius:10, background:T.press, color:T.mid, textTransform:"uppercase", letterSpacing:"0.06em" }}>sample</span>}
          </div>
          <div style={{ textAlign:"right" }}>
            <span style={{ fontFamily:serif, fontSize:15, color:T.black }}>{p.price}</span>
            {p.perMl && <span style={{ fontFamily:sans, fontSize:10, color:T.mid, marginLeft:6 }}>{p.perMl}/ml</span>}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── STATUS SELECTOR ─────────────────────────────────────────────────────────
const FIELD = { width:"100%", background:T.white, border:`1px solid ${T.rule}`, borderRadius:12, padding:"0 14px", minHeight:48, fontSize:16, color:T.ink, outline:"none", fontFamily:sans, boxSizing:"border-box" };
const FLABEL = { fontFamily:sans, fontSize:11, textTransform:"uppercase", letterSpacing:"0.14em", color:T.mid, margin:"0 0 8px" };
const selBtn = on => ({ minHeight:52, padding:"10px 12px", borderRadius:14, border:`1px solid ${on?"transparent":T.rule}`, background:on?"var(--accent)":T.white, color:on?"#fff":T.ink, fontFamily:sans, fontSize:15, fontWeight:on?600:500, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8, textAlign:"center" });
const ctaBtn = enabled => ({ width:"100%", minHeight:52, borderRadius:14, border:"none", background:enabled?"var(--accent)":T.lift, color:enabled?"#fff":T.faint, fontSize:16, fontWeight:600, fontFamily:sans, cursor:enabled?"pointer":"not-allowed" });
const communityCta = enabled => ({ ...ctaBtn(enabled), background:enabled?"var(--tangerine)":T.lift, color:enabled?"var(--on-tang)":T.faint });
const ghostBtn = { minHeight:52, padding:"0 22px", borderRadius:14, border:`1px solid ${T.rule}`, background:T.white, color:T.mid, fontSize:15, fontFamily:sans, cursor:"pointer" };
const STATUSES = [
  { key:"bottle_owned",    label:"Bottle, owned",    iconName:"bottle",   group:"bottle" },
  { key:"bottle_wishlist", label:"Bottle, wishlist", iconName:"wishstar", group:"bottle" },
  { key:"bottle_finished", label:"Bottle, finished", iconName:"finished", group:"bottle" },
  { key:"travel_have",     label:"Travel size, own", iconName:"travel",   group:"travel" },
  { key:"travel_wishlist", label:"Travel size, wishlist", iconName:"wishstar", group:"travel" },
  { key:"travel_finished", label:"Travel size, finished", iconName:"finished", group:"travel" },
  { key:"sample_have",     label:"Sample, in hand",  iconName:"sample",   group:"sample" },
  { key:"sample_wishlist", label:"Sample, wishlist", iconName:"bookmark", group:"sample" },
  { key:"sample_finished", label:"Sample, finished", iconName:"finished", group:"sample" },
  { key:"smelled",         label:"Smelled",           iconName:"nose",     group:"tried"  },
  { key:"tried_skin",      label:"Tried on skin",     iconName:"skin",     group:"tried"  },
];
// A fragrance can hold several statuses at once (e.g. own the sample, wishlist the bottle, smelled on a blotter).
// Bottle and Sample each hold one status at a time; Smelled can hold both. `primaryStatus` is the single status the cards and badges show.
const STATUS_PRIORITY = ["bottle_owned","bottle_finished","travel_have","travel_finished","sample_have","sample_finished","bottle_wishlist","travel_wishlist","sample_wishlist","tried_skin","smelled"];
const primaryStatus = arr => STATUS_PRIORITY.find(k => (arr || []).includes(k)) || null;
const isFinishedSet = arr => (arr || []).some(k => k === "bottle_finished" || k === "travel_finished" || k === "sample_finished");
function toggleStatus(arr, key) {
  const cur = arr || [], def = STATUSES.find(x => x.key === key);
  if (!def) return cur;
  if (cur.includes(key)) return cur.filter(k => k !== key);
  const keep = def.group === "tried" ? cur : cur.filter(k => ((STATUSES.find(x => x.key === k) || {}).group) !== def.group);
  return [...keep, key];
}
const SIZES_ML = [2,5,10,15,30,50,75,100];
function StatusSelector({ value, onChange, size, onSize }) {
  const groups = [
    { title:"Bottle", items:STATUSES.filter(s=>s.group==="bottle") },
    { title:"Travel size", items:STATUSES.filter(s=>s.group==="travel") },
    { title:"Sample", items:STATUSES.filter(s=>s.group==="sample") },
    { title:"Smelled",items:STATUSES.filter(s=>s.group==="tried")  },
  ];
  const SHORT = { bottle_owned:"Own", bottle_wishlist:"Wishlist", sample_have:"Own", sample_wishlist:"Wishlist", travel_have:"Own", travel_wishlist:"Wishlist", travel_finished:"Finished", bottle_finished:"Finished", sample_finished:"Finished", smelled:"On blotter", tried_skin:"Tried on skin" };
  return (
    <div>
      {groups.map((g,gi) => (
        <div key={g.title} style={{ marginBottom:gi<groups.length-1?22:0 }}>
          <p style={{ fontFamily:sans, fontSize:11, textTransform:"uppercase", letterSpacing:"0.14em", color:T.mid, margin:"0 0 10px" }}>{g.title}</p>
          <div style={{ display:"grid", gridTemplateColumns:`repeat(${g.items.length >= 3 ? 3 : 2}, minmax(0, 1fr))`, gap:10 }}>
            {g.items.map(s => {
              const on = (value || []).includes(s.key);
              return (
                <button key={s.key} onClick={()=>onChange(s.key)} aria-pressed={on}
                  style={{ minHeight:58, padding:g.items.length >= 3 ? "10px 6px" : "10px 12px", borderRadius:14, border:`1px solid ${on?"transparent":T.rule}`, background:on?"var(--accent)":T.white, color:on?"#fff":T.ink, fontFamily:sans, fontSize:15, fontWeight:on?600:500, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8, textAlign:"center" }}>
                  <Icon name={s.iconName} size={18} color={on?"#fff":T.mid}/>
                  {SHORT[s.key] || s.label}
                </button>
              );
            })}
          </div>
          {g.title === "Sample" && onSize && (
            <div style={{ marginTop:14 }}>
              <p style={{ fontFamily:sans, fontSize:12, color:T.faint, margin:"0 0 8px" }}>Size you own or wishlist (optional)</p>
              <div style={{ display:"flex", flexWrap:"wrap", gap:7 }}>
                {SIZES_ML.map(n => { const on = size === n; return <button key={n} onClick={() => onSize(on ? null : n)} aria-pressed={on} style={{ minHeight:38, padding:"0 14px", borderRadius:20, border:`1px solid ${on ? "transparent" : T.rule}`, background:on ? "var(--accent)" : T.white, color:on ? "#fff" : T.ink, fontFamily:sans, fontSize:14, fontWeight:on ? 600 : 400, cursor:"pointer" }}>{n} ml</button>; })}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// Shown under the status buttons once a bottle or sample is marked Finished.
function FinishedPanel({ status: statusSet, finish, onChange }) {
  const status = (statusSet || []).includes("bottle_finished") ? "bottle_finished" : (statusSet || []).includes("travel_finished") ? "travel_finished" : (statusSet || []).includes("sample_finished") ? "sample_finished" : null;
  if (!status) return null;
  const what = status === "bottle_finished" ? "bottle" : status === "travel_finished" ? "travel size" : "sample";
  const f = finish || {};
  const opts = [["yes", "Yes"], ["maybe", "Maybe"], ["no", "No"]];
  return (
    <div style={{ marginTop:18, padding:"16px 16px 18px", borderRadius:16, background:T.lift, border:`1px solid ${T.rule}` }}>
      <p style={{ ...FLABEL, margin:"0 0 8px" }}>Finished on</p>
      <input type="date" value={f.on || ""} max={todayISO()} onChange={e => onChange({ on: e.target.value || null })} style={{ ...FIELD, maxWidth:220, marginBottom:18 }}/>
      <p style={{ ...FLABEL, margin:"0 0 4px" }}>Would you buy this {what} again?</p>
      <p style={{ fontFamily:sans, fontSize:12, color:T.faint, margin:"0 0 10px", lineHeight:1.5 }}>Optional. Only you see this.</p>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3, minmax(0, 1fr))", gap:10 }}>
        {opts.map(([k, l]) => <button key={k} aria-pressed={f.rebuy === k} onClick={() => onChange({ rebuy: f.rebuy === k ? null : k })} style={selBtn(f.rebuy === k)}>{l}</button>)}
      </div>
    </div>
  );
}

// ─── GUIDED JOURNAL ───────────────────────────────────────────────────────────
const JPROMPTS = [
  { key:"where", q:"Where it takes me", sub:"A place, a season, a time of day", chips:["seaside","a garden","a city street","a quiet room","a market","a forest","a kitchen","a bedroom","morning","evening","night","summer","autumn","winter","spring"] },
  { key:"fabric", q:"If it were a fabric or texture", sub:"How it would feel under your hand", chips:["silk","cashmere","linen","velvet","denim","leather","cotton","suede","lace","wool","satin","powder","sand","glass"] },
  { key:"colour", q:"If it had a colour", sub:"The first one that comes to mind", chips:["amber","gold","rose","cream","ivory","green","moss","burgundy","plum","midnight","smoke","white","terracotta","honey"] },
  { key:"sound", q:"If it had a sound", sub:"What would you hear?", chips:["a hum","rain","jazz","a whisper","a cello","waves","a crackling fire","silence","laughter","a city at night","bells","wind"] },
  { key:"feel", q:"How it makes me feel", sub:"Choose as many as fit", chips:["calm","confident","nostalgic","cosy","bold","tender","playful","mysterious","grounded","radiant","romantic","wistful","fresh","sensual","safe","energised"] },
  { key:"reminds", q:"What it reminds me of", sub:"A person, a memory, a moment", text:true, ph:"A grandmother's kitchen, a trip, a song…" },
  { key:"other", q:"Other notes", sub:"Anything else you want to remember", text:true, ph:"Dry-down, projection, anything at all…" },
];
const VOCAB = {
  nostalgic:"A tender longing for a time or place from the past.",
  wistful:"Gently sad, with a quiet longing.",
  tender:"Soft, caring and gentle.",
  grounded:"Steady and rooted, with both feet on the earth.",
  radiant:"Glowing, bright and warm.",
  mysterious:"Hard to read, with something held back.",
  cosy:"Warm, snug and comforting.",
  sensual:"Pleasing to the senses, warm and close to the skin.",
  playful:"Light-hearted, a little mischievous.",
  bold:"Strong, confident and hard to miss.",
  calm:"Quiet and settled, with no rush.",
  safe:"Familiar and protective, like being held.",
  energised:"Awake, bright and ready to move.",
  confident:"Sure of yourself, comfortable taking space.",
  romantic:"Dreamy, affectionate, a little theatrical.",
  fresh:"Clean, bright and airy.",
  powder:"Soft and dry, like cosmetic powder or talc.",
  suede:"Soft, velvety leather with a matte finish.",
  velvet:"Dense, plush and smooth with a deep pile.",
  cashmere:"Very fine, soft, warm wool; in scent, a gentle warm musk.",
  linen:"Crisp, airy, natural cloth.",
  silk:"Smooth, fine and slightly cool.",
  amber:"Warm golden resin: sweet, glowing and a little smoky.",
  terracotta:"Baked earth, a dry warm orange-brown.",
  midnight:"Deep blue-black, still and nocturnal.",
  burgundy:"Deep red wine, rich and dark.",
  moss:"Damp, green and woodland-soft.",
  smoke:"A dry, grey, drifting, slightly burnt quality.",
  honey:"Golden, sweet and slightly animalic.",
};
const JKEYS = JPROMPTS.map(p => p.key);
function jDate() { return new Date().toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric" }); }
function entryWords(e) { const a = (e && e.answers) || {}; return ["where","fabric","colour","sound","feel"].flatMap(k => Array.isArray(a[k]) ? a[k] : []).map(w => String(w).trim().toLowerCase()).filter(Boolean); }
function AnswerChips({ answers }) {
  const a = answers || {};
  const rows = JPROMPTS.filter(p => !p.text && Array.isArray(a[p.key]) && a[p.key].length);
  const reminds = Array.isArray(a.reminds) && a.reminds[0];
  if (!rows.length && !reminds) return null;
  return (
    <div style={{ margin:"4px 0 8px" }}>
      {rows.map(p => (
        <div key={p.key} style={{ marginBottom:8 }}>
          <p style={{ fontFamily:sans, fontSize:10, textTransform:"uppercase", letterSpacing:"0.12em", color:T.faint, margin:"0 0 4px" }}>{p.q}</p>
          <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>{a[p.key].map(w => <span key={w} style={{ fontFamily:sans, fontSize:12, padding:"3px 10px", borderRadius:20, background:T.lift, border:`1px solid ${T.rule}`, color:T.ink }}>{w}</span>)}</div>
        </div>
      ))}
      {reminds && <div style={{ marginBottom:4 }}>
        <p style={{ fontFamily:sans, fontSize:10, textTransform:"uppercase", letterSpacing:"0.12em", color:T.faint, margin:"0 0 4px" }}>Reminds me of</p>
        <p style={{ fontFamily:sans, fontSize:13, color:T.ink, lineHeight:1.6, margin:0 }}>{reminds}</p>
      </div>}
    </div>
  );
}
function JournalComposer({ frag, entries, legacyNote, onAddJournalEntry, picker }) {
  const [ans, setAns] = useState({});
  const [mine, setMine] = useState({});
  const [saved, setSaved] = useState(false);
  const date = jDate();
  const known = new Set((entries || []).flatMap(entryWords));
  const has = k => Array.isArray(ans[k]) && ans[k].length > 0;
  const any = JKEYS.some(has);
  const toggle = (k, w) => setAns(p => { const cur = p[k] || []; return { ...p, [k]: cur.includes(w) ? cur.filter(x => x !== w) : [...cur, w] }; });
  const addOwn = k => { const w = (mine[k] || "").trim().toLowerCase(); if (!w) return; setAns(p => { const cur = p[k] || []; return cur.includes(w) ? p : { ...p, [k]: [...cur, w] }; }); setMine(p => ({ ...p, [k]: "" })); };
  const picked = ["where","fabric","colour","sound","feel"].flatMap(k => ans[k] || []);
  const fresh = [...new Set(picked)].filter(w => VOCAB[w] && !known.has(w));
  function save() {
    if (!any || !frag || !onAddJournalEntry) return;
    const clean = {}; JKEYS.forEach(k => { if (has(k)) clean[k] = ans[k]; });
    onAddJournalEntry({ fragId:frag.id, fragName:frag.name, house:frag.house, family:frag.family, text:(clean.other && clean.other[0]) || "", prompt:null, where:(clean.where || []).join(", "), date, answers:clean, publishedAsReview:false, reviewRating:null, shared:false, id:Date.now() });
    setAns({}); setMine({}); setSaved(true); setTimeout(() => setSaved(false), 2200);
  }
  return (
    <div style={{ background:T.lift, borderRadius:16, border:`1px solid ${T.rule}`, padding:18 }}>
      <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:6 }}>
        <Icon name="lock" size={12} color={T.mid}/>
        <span style={{ fontFamily:sans, fontSize:11, textTransform:"uppercase", letterSpacing:"0.12em", color:T.mid }}>Private, only visible to you</span>
        <span style={{ fontFamily:sans, fontSize:11, color:T.faint, marginLeft:"auto" }}>{date}</span>
      </div>
      {picker && <div style={{ margin:"10px 0 16px" }}>{picker}</div>}
      <p style={{ fontFamily:sans, fontSize:13, color:T.mid, lineHeight:1.6, margin:"0 0 18px" }}>Answer one or all. Tap a word or add your own. There are no wrong answers, and the words you choose build your scent vocabulary.</p>
      {JPROMPTS.map(pr => (
        <div key={pr.key} style={{ marginBottom:20 }}>
          <p style={{ fontFamily:serif, fontSize:18, color:T.black, margin:"0 0 2px" }}>{pr.q}</p>
          <p style={{ fontFamily:sans, fontSize:12, color:T.faint, margin:"0 0 10px" }}>{pr.sub}</p>
          {pr.text ? (
            <textarea value={(ans[pr.key] && ans[pr.key][0]) || ""} onChange={e => { const v = e.target.value; setAns(p => ({ ...p, [pr.key]: v.trim() ? [v] : [] })); }} placeholder={pr.ph} rows={pr.key === "other" ? 3 : 2} style={{ ...FIELD, resize:"vertical", lineHeight:1.6, padding:"12px 14px" }}/>
          ) : (<>
            <div style={{ display:"flex", flexWrap:"wrap", gap:7, marginBottom:8 }}>
              {[...pr.chips, ...(ans[pr.key] || []).filter(w => !pr.chips.includes(w))].map(w => {
                const on = (ans[pr.key] || []).includes(w);
                return <button key={w} onClick={() => toggle(pr.key, w)} aria-pressed={on} style={{ minHeight:38, padding:"0 14px", borderRadius:20, border:`1px solid ${on ? "transparent" : T.rule}`, background:on ? "var(--accent)" : T.white, color:on ? "#fff" : T.ink, fontFamily:sans, fontSize:14, fontWeight:on ? 600 : 400, cursor:"pointer" }}>{w}</button>;
              })}
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <input value={mine[pr.key] || ""} onChange={e => setMine(p => ({ ...p, [pr.key]: e.target.value }))} onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addOwn(pr.key); } }} placeholder="Add your own word" style={{ ...FIELD, minHeight:42 }}/>
              <button onClick={() => addOwn(pr.key)} disabled={!(mine[pr.key] || "").trim()} style={{ ...ghostBtn, minHeight:42, padding:"0 16px" }}>Add</button>
            </div>
          </>)}
        </div>
      ))}
      {fresh.length > 0 && (
        <div style={{ background:T.white, border:`1px solid ${T.rule}`, borderRadius:14, padding:"12px 14px", marginBottom:16 }}>
          {fresh.map(w => <p key={w} style={{ fontFamily:sans, fontSize:13, color:T.ink, lineHeight:1.55, margin:"0 0 6px" }}><span style={{ fontSize:10, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.1em", color:"var(--accent)", marginRight:8 }}>New word</span><strong style={{ fontWeight:600 }}>{w}</strong>: {VOCAB[w]}</p>)}
        </div>
      )}
      <button onClick={save} disabled={!any || !frag} style={ctaBtn(any && !!frag)}>{saved ? "Saved to your journal ✓" : (any && !frag ? "Choose a fragrance to save" : "Save to journal")}</button>
    </div>
  );
}

// ─── LEGAL MODAL ──────────────────────────────────────────────────────────────
const LEGAL_CONTENT = {
  terms: {
    title: "Terms of Service",
    updated: "Last updated: June 2026",
    sections: [
      { heading: "Acceptance", body: "By accessing or using Memoir on Skin you agree to be bound by these terms. If you do not agree, please do not use the platform." },
      { heading: "Your account", body: "You are responsible for maintaining the confidentiality of your account credentials. You must notify us immediately at team@memoironskin.com if you suspect unauthorised access to your account." },
      { heading: "Our library", body: "The Memoir on Skin library, including its text, fragrance and brand data, selection, arrangement and images, is protected by copyright and database rights. It is provided for your personal use only. You may not scrape, crawl, harvest, copy, republish, sell or use it to train or feed any AI or machine learning system, whether by automated means or by hand, without our written permission. We may suspend accounts and take legal action if you do." },
      { heading: "Your content", body: "You retain ownership of notes, reviews, and journal entries you create. By publishing a review you grant Memoir on Skin a non-exclusive licence to display that content on the platform. Private notes are never shared." },
      { heading: "Community standards", body: "Reviews and community content must be honest and based on personal experience. Spam, harassment, and fraudulent reviews are grounds for account suspension." },
      { heading: "Samples and purchases", body: "Memoir on Skin facilitates discovery and may link to third-party sample services. We are not responsible for third-party transactions, shipping, or product quality. Some links may earn us a commission; see How we earn." },
      { heading: "Limitation of liability", body: "Memoir on Skin is provided as-is. We are not liable for any indirect or consequential damages arising from your use of the platform." },
      { heading: "Changes", body: "We may update these terms from time to time. Continued use of Memoir on Skin after changes constitutes acceptance of the revised terms." },
      { heading: "Contact", body: "Questions about these terms? Write to us at team@memoironskin.com." },
    ],
  },
  privacy: {
    title: "Privacy Policy",
    updated: "Last updated: November 2026",
    sections: [
      { heading: "What we collect", body: "We collect your name, email address, username, and country when you register. We collect fragrance interactions, statuses, reactions, journal entries, and reviews, to power your personal experience." },
      { heading: "Profiles and following", body: "Other signed-in members can see your username, country flag, bio, and how many people follow you and how many you follow. Only you can see the lists of who you follow and who follows you. People can find you by username only: your name and email are never searchable or shown to other members. You can switch off search, and edit your bio and country, at any time under Edit profile. Your collection, wears, journal and private notes stay private unless you choose to share them. Other members can also see one taste-match percentage between you and them, worked out from your collection and ratings. It never reveals what is in them, and you can switch it off in Edit profile." },
      { heading: "What we never do", body: "We do not sell your data. We do not share your personal information with advertisers. Private notes are encrypted and never accessible to the Memoir on Skin team." },
      { heading: "How we use your data", body: "Your data is used to provide the Memoir on Skin service, personalise your discovery experience, and improve the platform. Aggregate, anonymised data may be used to identify fragrance trends." },
      { heading: "Journal entries and private notes", body: "Private notes and journal entries marked as private are stored securely and are visible only to you. Publishing a journal entry or review makes that content visible to the community." },
      { heading: "Cookies", body: "We use essential cookies to keep you signed in. We do not use advertising or tracking cookies." },
      { heading: "Data retention", body: "You may delete your account at any time. Upon deletion, your personal data is removed within 30 days. Anonymised, published review content may be retained." },
      { heading: "Your rights", body: "You have the right to access, correct, or delete your personal data. To exercise these rights, contact us at team@memoironskin.com." },
      { heading: "Contact", body: "Privacy questions or requests: team@memoironskin.com." },
    ],
  },
  affiliate: {
    title: "How we earn",
    updated: "Last updated: November 2026",
    sections: [
      { heading: "Free to use", body: "Memoir on Skin is free to use. We may pay for it in part with affiliate links: if you click a link and buy something, the shop may pay us a small commission. It costs you nothing extra." },
      { heading: "It never changes what we feature", body: "We are not here to influence you. Houses, fragrances and shelves are chosen by what is in the library and what members save and wear, not by who pays us. We do not take payment to feature a fragrance or a house." },
      { heading: "How we order Try it links", body: "First the house's own website and its samples or discovery set, where it sells them. Then retailers. Then independent decant sellers, labeled as independent sellers. A link being an affiliate link does not move it up the list." },
      { heading: "Decants and independent sellers", body: "Decant sellers are separate businesses. They are not affiliated with the houses whose fragrances they sell, and their samples are re-bottled. We say so wherever they appear." },
      { heading: "What we see when you click", body: "We log that a link was clicked, without your name, email, account or IP address, so we can tell which links are useful. The shop may set its own cookies once you arrive; see its privacy policy." },
      { heading: "Questions", body: "Write to us at team@memoironskin.com." },
    ],
  },
};

function LegalModal({ type, onClose }) {
  const content = LEGAL_CONTENT[type];
  if (!content) return null;
  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, zIndex:80, background:T.scrim, backdropFilter:"blur(16px)", display:"flex", flexDirection:"column", justifyContent:"flex-end", alignItems:"center" }}>
      <div onClick={e => e.stopPropagation()} style={{ background:T.white, borderRadius:"24px 24px 0 0", border:`1px solid ${T.rule}`, borderBottom:"none", width:"100%", maxWidth:460, maxHeight:"88vh", overflowY:"auto" }}>
        <div style={{ position:"sticky", top:0, background:T.white, borderBottom:`1px solid ${T.rule}`, padding:"20px 24px 16px", display:"flex", alignItems:"flex-start", justifyContent:"space-between" }}>
          <div>
            <p style={{ fontFamily:sans, fontSize:9, textTransform:"uppercase", letterSpacing:"0.12em", color:T.mid, margin:"0 0 3px" }}>Memoir on Skin</p>
            <h2 style={{ fontFamily:serif, fontSize:22, color:T.black, margin:0 }}>{content.title}</h2>
            <p style={{ fontFamily:sans, fontSize:11, color:T.faint, margin:"3px 0 0" }}>{content.updated}</p>
          </div>
          <button onClick={onClose} style={{ width:30, height:30, borderRadius:"50%", border:`1px solid ${T.rule}`, background:T.white, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, color:T.mid, flexShrink:0 }}>✕</button>
        </div>
        <div style={{ padding:"20px 24px 40px" }}>
          {content.sections.map((s, i) => (
            <div key={i} style={{ marginBottom:20 }}>
              <p style={{ fontFamily:sans, fontSize:11, fontWeight:600, color:T.ink, textTransform:"uppercase", letterSpacing:"0.08em", margin:"0 0 5px" }}>{s.heading}</p>
              <p style={{ fontFamily:sans, fontSize:13, color:T.mid, lineHeight:1.75, margin:0 }}>{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── FOOTER LINKS ─────────────────────────────────────────────────────────────
function FooterLinks({ dark = false }) {
  const [legal, setLegal] = useState(null);
  const col = T.mid;
  const colHov = T.black;
  const sep = T.rule;
  const links = [
    { label:"Contact", action:() => window.open("mailto:team@memoironskin.com") },
    { label:"Terms of Service", action:() => setLegal("terms") },
    { label:"Privacy Policy", action:() => setLegal("privacy") },
    { label:"How we earn", action:() => setLegal("affiliate") },
    { label:"For brands", action:() => { window.location.href = "/brands"; } },
  ];
  return (
    <>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:0, marginTop:32, flexWrap:"wrap" }}>
        {links.map((l, i) => (
          <span key={l.label} style={{ display:"inline-flex", alignItems:"center" }}>
            <span onClick={l.action} style={{ fontFamily:sans, fontSize:11, color:col, cursor:"pointer", padding:"4px 10px" }}
              onMouseEnter={e => e.currentTarget.style.color = colHov}
              onMouseLeave={e => e.currentTarget.style.color = col}>
              {l.label}
            </span>
            {i < links.length - 1 && <span style={{ width:1, height:10, background:sep, display:"inline-block" }}/>}
          </span>
        ))}
      </div>
      {legal && <LegalModal type={legal} onClose={() => setLegal(null)}/>}
    </>
  );
}

// Form building blocks. Kept at module level so inputs keep focus while typing.
function FormField({ label, req, hint, children }) {
  return (
    <label style={{ display:"block", marginBottom:16 }}>
      <span style={{ display:"block", fontFamily:sans, fontSize:11, textTransform:"uppercase", letterSpacing:"0.12em", color:T.mid, margin:"0 0 7px" }}>{label}{req && <span style={{ color:T.accent }}> *</span>}</span>
      {children}
      {hint && <span style={{ display:"block", fontFamily:sans, fontSize:12, color:T.faint, margin:"6px 0 0", lineHeight:1.5 }}>{hint}</span>}
    </label>
  );
}
function FormSec({ title, sub, children, gap = 40 }) {
  return (
    <section style={{ marginBottom:gap }}>
      <h3 style={{ fontFamily:serif, fontSize:"clamp(22px, 2vw, 28px)", fontWeight:400, letterSpacing:-0.3, color:T.black, margin:"0 0 4px" }}>{title}</h3>
      {sub ? <p style={{ fontFamily:sans, fontSize:13, color:T.mid, lineHeight:1.6, margin:"0 0 18px" }}>{sub}</p> : <div style={{ height:14 }}/>}
      {children}
    </section>
  );
}

// ─── SUGGEST: stores, events and businesses ───────────────────────────────────
const STORE_KINDS = ["Multi-brand store", "House boutique", "Department store counter", "Online only", "Other"];
const STORE_BRAND_TYPES = ["Niche", "Indie", "Heritage", "Artisan & natural", "Middle Eastern & oud", "Vintage & discontinued"];
const STORE_EXTRAS = ["Samples or decants", "Discovery sets", "Travel sizes", "Ships internationally"];
const EVENT_TYPES = ["Fair or expo", "Launch or release party", "Scent walk or store tour", "Workshop or class", "Pop-up or market", "Talk or panel", "Other event"];
const BIZ_TYPES = ["Perfume school or studio", "Custom or bespoke perfumer", "Sample or discovery service", "Decant seller", "Refillery", "Blog, podcast or creator", "Supplies or materials", "Other business"];
// Chips for one choice (string value) or several (array value).
function ChipChoice({ value, onChange, options, multi }) {
  const on = o => multi ? (value || []).includes(o) : value === o;
  const click = o => multi ? onChange(on(o) ? value.filter(x => x !== o) : [...(value || []), o]) : onChange(on(o) ? "" : o);
  return (
    <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
      {options.map(o => (
        <button type="button" key={o} onClick={() => click(o)} aria-pressed={on(o)} style={{ flex:"1 1 auto", minHeight:46, padding:"0 16px", borderRadius:10, border:`1px solid ${on(o) ? T.black : T.rule}`, background:on(o) ? T.black : T.white, color:on(o) ? T.white : T.ink, fontFamily:sans, fontSize:14, fontWeight:on(o) ? 600 : 400, cursor:"pointer" }}>{o}</button>
      ))}
    </div>
  );
}
const SUG_SEND_BTN = busy => ({ width:"100%", minHeight:52, borderRadius:12, background:T.black, border:"none", color:T.white, fontSize:15, fontWeight:500, fontFamily:sans, cursor:busy ? "default" : "pointer", opacity:busy ? 0.6 : 1 });
async function sendSuggestion(currentUser, kind, payload) {
  const uid = (currentUser && currentUser.id) || null;
  if (!uid) throw new Error("not signed in");
  const { error } = await supabase.from("suggestions").insert({ user_id:uid, kind, payload });
  if (error) throw error;
}
function SuggestStoreForm({ currentUser, onSent }) {
  const [f, setF] = useState({ name:"", kind:"", house:"", website:"", country:"", city:"", address:"", brandTypes:[], brands:"", extras:[], notes:"", relation:"", email:"" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const set = (k, v) => setF(x => ({ ...x, [k]:v }));
  const input = (k, ph, props = {}) => <input className="mos-in" value={f[k]} onChange={e => set(k, e.target.value)} placeholder={ph} {...props}/>;
  const online = f.kind === "Online only";
  async function submit() {
    const miss = [];
    if (!f.name.trim()) miss.push("store name");
    if (!f.kind) miss.push("the kind of store");
    if (!/\S+\.\S+/.test(f.website.trim())) miss.push("website");
    if (!f.country.trim()) miss.push("country");
    if (!online && !f.city.trim()) miss.push("city");
    if (!online && !f.address.trim()) miss.push("street address");
    if (!f.brandTypes.length && !f.brands.trim()) miss.push("the types of brands they sell");
    if (f.email.trim() && !/^\S+@\S+\.\S+$/.test(f.email.trim())) miss.push("a valid email, or leave it blank");
    if (miss.length) { setErr("Still needed: " + miss.join(", ") + "."); return; }
    setBusy(true); setErr("");
    try { await sendSuggestion(currentUser, "store", { ...f, name:f.name.trim() }); onSent(f.name.trim()); }
    catch (e) { console.error("Store suggestion failed:", e); setErr("That did not send. Please try again, or email team@memoironskin.com."); }
    setBusy(false);
  }
  return (
    <div className="mos-pad" style={{ padding:"28px 24px 56px" }}>
      <div className="mos-formgrid">
        <div>
          <FormSec gap={0} title="The store" sub="How it will appear on the stores list.">
            <FormField label="Store name" req>{input("name", "e.g. Maison Example Paris")}</FormField>
            <FormField label="Kind of store" req><ChipChoice value={f.kind} onChange={v => set("kind", v)} options={STORE_KINDS}/></FormField>
            {f.kind === "House boutique" && <FormField label="Which house?" hint="The brand this boutique belongs to.">{input("house", "e.g. Maison Example")}</FormField>}
            <FormField label="Website" req>{input("website", "maisonexample.com", { inputMode:"url", autoCapitalize:"none" })}</FormField>
          </FormSec>
          <div style={{ height:34 }}/>
          <FormSec gap={0} title="Where it is" sub={online ? "Where the business is based." : "Please give the full street address so people can find it."}>
            <FormField label="Country" req>{input("country", "e.g. France")}</FormField>
            {!online && <FormField label="City" req>{input("city", "e.g. Paris")}</FormField>}
            {!online && <FormField label="Street address" req>{input("address", "Street, number, postal code")}</FormField>}
          </FormSec>
        </div>
        <div>
          <FormSec gap={0} title="What they sell" sub="Pick every type that fits, then list a few brands if you can.">
            <FormField label="Types of brands" req hint="Choose at least one, or list brands below."><ChipChoice multi value={f.brandTypes} onChange={v => set("brandTypes", v)} options={STORE_BRAND_TYPES}/></FormField>
            <FormField label="Brands they carry" hint="Separate with commas. A few is plenty."><textarea className="mos-in" rows={3} value={f.brands} onChange={e => set("brands", e.target.value)} placeholder="e.g. Maison Example, Atelier Sample, House of Test" style={{ resize:"vertical", lineHeight:1.6 }}/></FormField>
            <FormField label="Also offers"><ChipChoice multi value={f.extras} onChange={v => set("extras", v)} options={STORE_EXTRAS}/></FormField>
            <FormField label="Anything else we should know?"><textarea className="mos-in" rows={2} value={f.notes} onChange={e => set("notes", e.target.value)} placeholder="Optional. Opening hours, appointment only, languages spoken" style={{ resize:"vertical", lineHeight:1.6 }}/></FormField>
          </FormSec>
          <div style={{ height:34 }}/>
          <FormSec gap={0} title="About you" sub="Optional. It helps us check the details.">
            <FormField label="Your connection"><ChipChoice value={f.relation} onChange={v => set("relation", v)} options={["I own or work here", "I'm a customer"]}/></FormField>
            <FormField label="Email" hint="Only used if we need to confirm something. It is never shown.">{input("email", "you@example.com", { inputMode:"email", autoCapitalize:"none" })}</FormField>
          </FormSec>
        </div>
      </div>
      <div style={{ marginTop:36, maxWidth:420 }}>
        {err && <p role="alert" style={{ fontFamily:sans, fontSize:13, color:T.bad, margin:"0 0 12px", lineHeight:1.5 }}>{err}</p>}
        <button onClick={submit} disabled={busy} style={SUG_SEND_BTN(busy)}>{busy ? "Sending" : "Send store"}</button>
      </div>
    </div>
  );
}
function SuggestEventForm({ currentUser, onSent }) {
  const [f, setF] = useState({ entry:"", type:"", name:"", website:"", description:"", mode:"", country:"", city:"", venue:"", when:"", price:"", relation:"", email:"" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const set = (k, v) => setF(x => ({ ...x, [k]:v }));
  const input = (k, ph, props = {}) => <input className="mos-in" value={f[k]} onChange={e => set(k, e.target.value)} placeholder={ph} {...props}/>;
  const isEvent = f.entry === "Event";
  const inPerson = f.mode && f.mode !== "Online";
  async function submit() {
    const miss = [];
    if (!f.entry) miss.push("whether it is an event or a business");
    if (f.entry && !f.type) miss.push("what kind it is");
    if (!f.name.trim()) miss.push("name");
    if (!/\S+\.\S+/.test(f.website.trim())) miss.push("website or link");
    if (f.description.trim().length < 10) miss.push("a short description");
    if (!f.mode) miss.push("in person or online");
    if (inPerson && !f.country.trim()) miss.push("country");
    if (inPerson && !f.city.trim()) miss.push("city");
    if (isEvent && !f.when.trim()) miss.push("the date or dates");
    if (f.email.trim() && !/^\S+@\S+\.\S+$/.test(f.email.trim())) miss.push("a valid email, or leave it blank");
    if (miss.length) { setErr("Still needed: " + miss.join(", ") + "."); return; }
    setBusy(true); setErr("");
    try { await sendSuggestion(currentUser, "event", { ...f, name:f.name.trim() }); onSent(f.name.trim()); }
    catch (e) { console.error("Event suggestion failed:", e); setErr("That did not send. Please try again, or email team@memoironskin.com."); }
    setBusy(false);
  }
  return (
    <div className="mos-pad" style={{ padding:"28px 24px 56px" }}>
      <div className="mos-formgrid">
        <div>
          <FormSec gap={0} title="What is it?" sub="An event happens on a date. A business is something people can use any time.">
            <FormField label="Event or business" req><ChipChoice value={f.entry} onChange={v => setF(x => ({ ...x, entry:v, type:"" }))} options={["Event", "Business"]}/></FormField>
            {f.entry && <FormField label="Kind" req><ChipChoice value={f.type} onChange={v => set("type", v)} options={isEvent ? EVENT_TYPES : BIZ_TYPES}/></FormField>}
            <FormField label="Name" req>{input("name", isEvent ? "e.g. Perfume Market Lyon" : "e.g. Atelier Example")}</FormField>
            <FormField label="Website or link" req hint={isEvent ? "Tickets, programme or the organiser's page." : "The business's own site or page."}>{input("website", "example.com", { inputMode:"url", autoCapitalize:"none" })}</FormField>
            <FormField label="What is it, and who is it for?" req><textarea className="mos-in" rows={3} value={f.description} onChange={e => set("description", e.target.value)} placeholder="A line or two in your own words" style={{ resize:"vertical", lineHeight:1.6 }}/></FormField>
          </FormSec>
        </div>
        <div>
          <FormSec gap={0} title="Where and when" sub="So people nearby can find it.">
            <FormField label="Where" req><ChipChoice value={f.mode} onChange={v => set("mode", v)} options={["In person", "Online", "Both"]}/></FormField>
            {inPerson && <FormField label="Country" req>{input("country", "e.g. Italy")}</FormField>}
            {inPerson && <FormField label="City" req>{input("city", "e.g. Florence")}</FormField>}
            {inPerson && <FormField label="Venue or address">{input("venue", "Optional")}</FormField>}
            {isEvent && <FormField label="Date or dates" req hint="e.g. 14 to 16 March 2027, or every first Saturday.">{input("when", "When does it happen?")}</FormField>}
            <FormField label="Price or booking">{input("price", "Optional. Free, from 25 EUR, booking link")}</FormField>
          </FormSec>
          <div style={{ height:34 }}/>
          <FormSec gap={0} title="About you" sub="Optional. It helps us check the details.">
            <FormField label="Your connection"><ChipChoice value={f.relation} onChange={v => set("relation", v)} options={["I run it", "I've been", "I'd like to go"]}/></FormField>
            <FormField label="Email" hint="Only used if we need to confirm something. It is never shown.">{input("email", "you@example.com", { inputMode:"email", autoCapitalize:"none" })}</FormField>
          </FormSec>
        </div>
      </div>
      <div style={{ marginTop:36, maxWidth:420 }}>
        {err && <p role="alert" style={{ fontFamily:sans, fontSize:13, color:T.bad, margin:"0 0 12px", lineHeight:1.5 }}>{err}</p>}
        <button onClick={submit} disabled={busy} style={SUG_SEND_BTN(busy)}>{busy ? "Sending" : isEvent ? "Send event" : f.entry === "Business" ? "Send business" : "Send"}</button>
      </div>
    </div>
  );
}

// ─── SUGGEST MODAL ────────────────────────────────────────────────────────────
function SuggestModal({ onClose, currentUser }) {
  const blank={name:"",house:"",year:"",concentration:"",perfumer:"",family:"",priceTier:"",website:"",country:"",ownershipStatus:"",ownershipParent:"",ownershipYear:"",top:"",heart:"",base:"",accords:"",story:"",why:"",sampleWhere:"",imagePath:"",sourceUrl:"",firstReview:""};
  const [photo,setPhoto]=useState(null); // {blob, url}
  const [ownPhoto,setOwnPhoto]=useState(false);
  const [form,setForm]=useState(blank);
  const [submitted,setSubmitted]=useState(false);
  const [busy,setBusy]=useState(false);
  const [err,setErr]=useState("");
  const [kind,setKind]=useState("fragrance"); // fragrance | store | event
  const [sentName,setSentName]=useState("");
  const [formKey,setFormKey]=useState(0);
  function set(k,v){setForm(f=>({...f,[k]:v}));}
  // Resize and re-encode as JPEG: keeps uploads small and strips location data from the photo.
  async function pickPhoto(file){
    if(!file)return;
    setErr("");
    try{
      const url=URL.createObjectURL(file);
      const img=await new Promise((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=rej;i.src=url;});
      const max=1600,sc=Math.min(1,max/Math.max(img.width,img.height));
      const c=document.createElement("canvas");c.width=Math.round(img.width*sc);c.height=Math.round(img.height*sc);
      const x=c.getContext("2d");x.fillStyle="#fff";x.fillRect(0,0,c.width,c.height);x.drawImage(img,0,0,c.width,c.height);
      URL.revokeObjectURL(url);
      const blob=await new Promise(r=>c.toBlob(r,"image/jpeg",0.85));
      if(!blob)throw new Error("encode");
      if(photo&&photo.url)URL.revokeObjectURL(photo.url);
      setPhoto({blob,url:URL.createObjectURL(blob)});
    }catch(e){setErr("We couldn't read that photo. Try a JPG or PNG.");}
  }
  async function submit(){
    const miss=[];
    if(!form.name.trim())miss.push("fragrance name");
    if(!form.house.trim())miss.push("house");
    if(!/\S+\.\S+/.test(form.website.trim()))miss.push("house website");
    if(!form.country.trim())miss.push("country");
    if(!(form.top.trim()||form.heart.trim()||form.base.trim()))miss.push("at least one note");
    if(!photo)miss.push("a bottle photo");
    else if(!ownPhoto)miss.push("confirmation that the photo is your own");
    if(miss.length){setErr("Still needed: "+miss.join(", ")+".");return;}
    setBusy(true);setErr("");
    try{
      const uid=(currentUser&&currentUser.id)||null;
      if(!uid) throw new Error("not signed in");
      const path=`${uid}/${Date.now()}.jpg`;
      const up=await supabase.storage.from("suggestion-images").upload(path,photo.blob,{contentType:"image/jpeg",upsert:false});
      if(up.error) throw up.error;
      const { error } = await supabase.from("suggestions").insert({ user_id:uid, payload:{...form,imagePath:path,ownPhotoConfirmed:true} });
      if(error) throw error;
      setSubmitted(true);
    }catch(e){
      console.error("Suggestion failed:",e);
      setErr("That did not send. Please try again, or email team@memoironskin.com.");
    }
    setBusy(false);
  }
  const input=(k,ph,props={})=><input className="mos-in" value={form[k]} onChange={e=>set(k,e.target.value)} placeholder={ph} {...props}/>;
  const choice=(k,opts)=>(
    <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
      {opts.map(o=>{const on=form[k]===o.val;return (
        <button type="button" key={o.val} onClick={()=>set(k,on?"":o.val)} aria-pressed={on} style={{flex:"1 1 auto",minHeight:46,padding:"0 16px",borderRadius:10,border:`1px solid ${on?T.black:T.rule}`,background:on?T.black:T.white,color:on?T.white:T.ink,fontFamily:sans,fontSize:14,fontWeight:on?600:400,cursor:"pointer"}}>{o.label}</button>
      );})}
    </div>
  );
  return (
    <div className="mos-sheet-wrap" onClick={onClose} style={{ position:"fixed", inset:0, zIndex:60, background:T.scrim, backdropFilter:"blur(16px)", display:"flex", flexDirection:"column", justifyContent:"flex-end", alignItems:"center" }}>
      <div className="mos-sheet" onClick={e=>e.stopPropagation()} style={{ background:T.white, borderRadius:"24px 24px 0 0", border:`1px solid ${T.rule}`, borderBottom:"none", width:"100%", maxWidth:460, maxHeight:"93vh", overflowY:"auto" }}>
        <div className="mos-pad" style={{ position:"relative", padding:"26px 24px 22px", borderBottom:`1px solid ${T.rule}` }}>
          <button className="mos-close" onClick={onClose} aria-label="Close" style={{ position:"absolute", top:16, right:16, width:34, height:34, borderRadius:"50%", border:`1px solid ${T.rule}`, background:T.white, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, color:T.mid }}>✕</button>
          <BackBtn onBack={onClose}/>
          <p style={{ fontFamily:sans, fontSize:11, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.18em", color:T.accent, margin:"0 0 6px" }}>Community</p>
          <h2 style={{ fontFamily:serif, fontSize:"clamp(30px, 3vw, 46px)", fontWeight:400, letterSpacing:-0.6, color:T.black, margin:0, paddingRight:40 }}>{kind==="store"?"Add a store":kind==="event"?"Add an event or business":"Suggest a fragrance"}</h2>
          <div style={{display:"flex",gap:8,flexWrap:"wrap",margin:"16px 0 0"}}>
            {[["fragrance","A fragrance"],["store","A store"],["event","An event or business"]].map(([k,l])=>(
              <button key={k} onClick={()=>{setKind(k);setSubmitted(false);setErr("");}} aria-pressed={kind===k} style={{fontFamily:sans,fontSize:14,fontWeight:kind===k?600:500,padding:"0 18px",minHeight:40,borderRadius:20,whiteSpace:"nowrap",border:`1px solid ${kind===k?T.black:T.rule}`,background:kind===k?T.black:T.white,color:kind===k?T.white:T.ink,cursor:"pointer"}}>{l}</button>
            ))}
          </div>
          {kind==="store"&&<p style={{ fontFamily:sans, fontSize:"clamp(14px, 1.1vw, 16px)", color:T.mid, lineHeight:1.65, margin:"12px 0 0", maxWidth:640 }}>Run a fragrance store, or know a good one? Tell us where it is and what it sells. A person checks each store before it goes on the stores list.</p>}
          {kind==="event"&&<p style={{ fontFamily:sans, fontSize:"clamp(14px, 1.1vw, 16px)", color:T.mid, lineHeight:1.65, margin:"12px 0 0", maxWidth:640 }}>Know a fragrance event, class, workshop or small business that people should find? Tell us about it. A person checks each one before it is shared.</p>}
          {kind==="fragrance"&&<p style={{ fontFamily:sans, fontSize:"clamp(14px, 1.1vw, 16px)", color:T.mid, lineHeight:1.65, margin:"12px 0 0", maxWidth:640 }}>Can't find it? Tell us what you know. The name, house, house website, country, at least one note and a bottle photo are required, and every extra detail saves us a search. A person reviews each suggestion before it goes in. <a href="/brands" style={{ color:T.ink }}>Are you a brand? Submit your whole house here.</a></p>}
        </div>
        {submitted ? (
          <div className="mos-pad" style={{ padding:"56px 24px 72px", textAlign:"center" }}>
            <h3 style={{ fontFamily:serif, fontSize:"clamp(26px, 2.4vw, 36px)", fontWeight:400, color:T.black, margin:"0 0 10px" }}>Thank you</h3>
            <p style={{ fontFamily:sans, fontSize:15, color:T.mid, lineHeight:1.65, margin:"0 auto 28px", maxWidth:440 }}>{kind==="fragrance"?<><strong style={{ color:T.ink }}>{form.name}</strong> by {form.house}</>:<strong style={{ color:T.ink }}>{sentName}</strong>} is in the queue for review.</p>
            <div style={{ display:"flex", gap:10, justifyContent:"center", flexWrap:"wrap" }}>
              <button onClick={()=>{setForm(blank);setPhoto(null);setOwnPhoto(false);setSubmitted(false);setFormKey(k=>k+1);}} style={{ minHeight:48, padding:"0 24px", borderRadius:10, background:T.white, border:`1px solid ${T.rule}`, color:T.ink, fontSize:14, fontFamily:sans, cursor:"pointer" }}>{kind==="fragrance"?"Suggest another":"Add another"}</button>
              <button onClick={onClose} style={{ minHeight:48, padding:"0 28px", borderRadius:10, background:T.black, border:"none", color:T.white, fontSize:14, fontFamily:sans, cursor:"pointer" }}>Done</button>
            </div>
          </div>
        ) : kind==="store" ? (
          <SuggestStoreForm key={formKey} currentUser={currentUser} onSent={n=>{setSentName(n);setSubmitted(true);}}/>
        ) : kind==="event" ? (
          <SuggestEventForm key={formKey} currentUser={currentUser} onSent={n=>{setSentName(n);setSubmitted(true);}}/>
        ) : (
          <div className="mos-pad" style={{ padding:"28px 24px 56px" }}>
            <div className="mos-formgrid">
              <div>
                <FormSec gap={0} title="The fragrance" sub="What goes at the top of the card.">
                  <FormField label="Fragrance name" req>{input("name","e.g. Tobacco Oud")}</FormField>
                  <FormField label="House" req>{input("house","e.g. Maison Example")}</FormField>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                    <FormField label="Year">{input("year","e.g. 2018",{inputMode:"numeric"})}</FormField>
                    <FormField label="Concentration">
                      <select className="mos-in" value={form.concentration} onChange={e=>set("concentration",e.target.value)}>
                        <option value="">Select</option>
                        {["Eau de Parfum","Eau de Toilette","Parfum","Extrait","Eau de Cologne","Eau Fraîche"].map(c=><option key={c}>{c}</option>)}
                      </select>
                    </FormField>
                  </div>
                  <FormField label="Perfumer">{input("perfumer","Nose or creator, if known")}</FormField>
                  <FormField label="Family">{input("family","e.g. Woody, Floral, Amber")}</FormField>
                  <FormField label="Price tier">{choice("priceTier",[{val:"Mass-market",label:"Mass-market"},{val:"Prestige",label:"Prestige"},{val:"Luxury",label:"Luxury"}])}</FormField>
                </FormSec>
                <div style={{height:34}}/>
                <FormSec gap={0} title="Notes and accords" sub="Separate each with a comma. At least one note is required; leave blank what you don't know.">
                  <FormField label="Top notes" req hint="Add at least one note in top, heart or base.">{input("top","e.g. Bergamot, Saffron")}</FormField>
                  <FormField label="Heart notes">{input("heart","e.g. Rose, Iris")}</FormField>
                  <FormField label="Base notes">{input("base","e.g. Sandalwood, Musk")}</FormField>
                  <FormField label="Main accords" hint="Up to five, strongest first. e.g. Woody, Floral, Powdery.">{input("accords","Woody, Floral, Powdery")}</FormField>
                </FormSec>
              </div>
              <div>
                <FormSec gap={0} title="The house" sub="Shown next to the house name on the card.">
                  <FormField label="House website" req>{input("website","maisonexample.com",{inputMode:"url",autoCapitalize:"none"})}</FormField>
                  <FormField label="Country" req>{input("country","Where the house is based")}</FormField>
                  <FormField label="Ownership">{choice("ownershipStatus",[{val:"independent",label:"Independent"},{val:"conglomerate",label:"Conglomerate-owned"}])}</FormField>
                  {form.ownershipStatus==="conglomerate"&&(
                    <div style={{display:"grid",gridTemplateColumns:"1.6fr 1fr",gap:12}}>
                      <FormField label="Parent company">{input("ownershipParent","e.g. LVMH, Puig")}</FormField>
                      <FormField label="Year acquired">{input("ownershipYear","If known",{inputMode:"numeric"})}</FormField>
                    </div>
                  )}
                </FormSec>
                <div style={{height:34}}/>
                <FormSec gap={0} title="The story" sub="A line or two in your own words.">
                  <FormField label="What is it about?"><textarea className="mos-in" rows={3} value={form.story} onChange={e=>set("story",e.target.value)} placeholder="The idea, the inspiration, how it wears" style={{resize:"vertical",lineHeight:1.6}}/></FormField>
                  <FormField label="Why should we add it?"><textarea className="mos-in" rows={2} value={form.why} onChange={e=>set("why",e.target.value)} placeholder="Optional" style={{resize:"vertical",lineHeight:1.6}}/></FormField>
                </FormSec>
                <div style={{height:34}}/>
                <FormSec gap={0} title="Samples and sources" sub="Helps us fill in the rest of the card.">
                  <FormField label="Where can people get a sample?" hint="A retailer or the house's own shop, if you know one.">{input("sampleWhere","Retailer name or link")}</FormField>
                  <FormField label="Link to the fragrance">{input("sourceUrl","Brand page or reference link",{inputMode:"url",autoCapitalize:"none"})}</FormField>
                  <FormField label="Bottle photo" req hint="Upload your own photo of the bottle. Please don't use images from the brand's website or anywhere else online: they're protected by copyright. Brands can send us approved images directly.">
                    <input type="file" accept="image/*" onChange={e=>pickPhoto(e.target.files&&e.target.files[0])} style={{fontFamily:sans,fontSize:14,color:T.ink,maxWidth:"100%"}}/>
                  </FormField>
                  {photo&&<img src={photo.url} alt="Your bottle photo" style={{width:"100%",maxWidth:240,borderRadius:12,border:`1px solid ${T.rule}`,display:"block",margin:"0 0 12px"}}/>}
                  <label style={{display:"flex",gap:10,alignItems:"flex-start",margin:"0 0 18px",fontFamily:sans,fontSize:13,color:T.mid,lineHeight:1.5,cursor:"pointer"}}>
                    <input type="checkbox" checked={ownPhoto} onChange={e=>setOwnPhoto(e.target.checked)} style={{marginTop:3,width:18,height:18,flex:"none"}}/>
                    <span>This is my own photo. It isn't copied from the brand's website or anywhere else.</span>
                  </label>
                  <FormField label="Your first review"><textarea className="mos-in" rows={3} value={form.firstReview} onChange={e=>set("firstReview",e.target.value)} placeholder="Optional. How does it open and dry down?" style={{resize:"vertical",lineHeight:1.6}}/></FormField>
                </FormSec>
              </div>
            </div>
            <div style={{ marginTop:36, maxWidth:420 }}>
              {err&&<p role="alert" style={{ fontFamily:sans, fontSize:13, color:T.bad, margin:"0 0 12px", lineHeight:1.5 }}>{err}</p>}
              <button onClick={submit} disabled={busy} style={{ width:"100%", minHeight:52, borderRadius:12, background:T.black, border:"none", color:T.white, fontSize:15, fontWeight:500, fontFamily:sans, cursor:busy?"default":"pointer", opacity:busy?0.6:1 }}>{busy?"Sending":"Send suggestion"}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── DATA ─────────────────────────────────────────────────────────────────────
const FRAGRANCES = [
  { id:1, name:"Aventus", house:"Creed", year:2010, perfumer:"Olivier Creed & Erwin Creed", family:"Chypre Fruity", concentration:"Eau de Parfum",
    ownership:{ status:"conglomerate", parent:"LVMH", acquiredYear:2020, note:"Acquired by LVMH in 2020. The Creed family retained creative involvement post-acquisition." },
    description:"Opens with explosive pineapple and blackcurrant before evolving into a smoky, mossy heart. Simultaneously powerful and quietly refined.",
    story:"Inspired by the legend of Napoleon, the smoke of battle, cool northern forests, the sweet spoils of victory.",
    prices:[{size:"100ml",price:"$495",perMl:"$4.95"},{size:"50ml",price:"$310",perMl:"$6.20"},{size:"10ml Travel",price:"$98",perMl:"$9.80"},{size:"2ml Sample",price:"$12",perMl:"$6.00",sample:true}],
    notes:{top:[{n:"Pineapple"},{n:"Blackcurrant"},{n:"Apple"},{n:"Bergamot"}],mid:[{n:"Birch"},{n:"Patchouli"},{n:"Jasmine"},{n:"Rose"}],base:[{n:"Musk"},{n:"Oakmoss"},{n:"Ambergris"},{n:"Vanilla"}]},
    accords:[{n:"Fruity",v:85},{n:"Smoky",v:72},{n:"Woody",v:68},{n:"Fresh",v:55},{n:"Mossy",v:48}],
    longevity:4.2, sillage:3.8, seasons:{spring:70,summer:55,fall:85,winter:60}, occasions:["Work","Evening","Formal"], rating:4.6, votes:14823 },
  { id:2, name:"Black Orchid", house:"Tom Ford", year:2006, perfumer:"David Apel", family:"Floral Oriental", concentration:"Eau de Parfum",
    ownership:{ status:"conglomerate", parent:"Estée Lauder Companies", acquiredYear:2005, note:"Tom Ford Beauty has been under Estée Lauder Companies since 2005. Tom Ford sold the remaining brand to Ermenegildo Zegna in 2023." },
    description:"Darkly luxurious, rare black truffle and ylang ylang bloom over orchid petals and lotus wood. Opulent, mysterious, unforgettable.",
    story:"Tom Ford's debut set the tone for everything that followed, maximalist, dark, unapologetically seductive.",
    prices:[{size:"100ml",price:"$235",perMl:"$2.35"},{size:"50ml",price:"$160",perMl:"$3.20"},{size:"10ml Travel",price:"$55",perMl:"$5.50"},{size:"2ml Sample",price:"$8",perMl:"$4.00",sample:true}],
    notes:{top:[{n:"Black Truffle"},{n:"Ylang-Ylang"},{n:"Bergamot"},{n:"Blackcurrant"}],mid:[{n:"Black Orchid"},{n:"Jasmine"},{n:"Gardenia"},{n:"Lotus"}],base:[{n:"Patchouli"},{n:"Vanilla"},{n:"Sandalwood"},{n:"Incense"}]},
    accords:[{n:"Floral",v:90},{n:"Dark",v:82},{n:"Oriental",v:75},{n:"Earthy",v:60},{n:"Gourmand",v:45}],
    longevity:4.7, sillage:4.5, seasons:{spring:40,summer:25,fall:80,winter:95}, occasions:["Evening","Date Night"], rating:4.3, votes:9241 },
  { id:3, name:"Oud Wood", house:"Tom Ford", year:2007, perfumer:"Pierre Negrin", family:"Woody Oriental", concentration:"Eau de Parfum",
    ownership:{ status:"conglomerate", parent:"Estée Lauder Companies", acquiredYear:2005, note:"Tom Ford Beauty has been under Estée Lauder Companies since 2005. Tom Ford sold the remaining brand to Ermenegildo Zegna in 2023." },
    description:"Rare agarwood blends with rosewood, cardamom, and sandalwood, ancient and modern simultaneously.",
    story:"Ford's distillation of the souk, incense smoke in hot air, rare woods in shadows, the smell of somewhere else.",
    prices:[{size:"100ml",price:"$280",perMl:"$2.80"},{size:"50ml",price:"$195",perMl:"$3.90"},{size:"10ml Travel",price:"$65",perMl:"$6.50"},{size:"2ml Sample",price:"$9",perMl:"$4.50",sample:true}],
    notes:{top:[{n:"Oud"},{n:"Rosewood"},{n:"Cardamom"}],mid:[{n:"Sandalwood"},{n:"Vetiver"},{n:"Papyrus"}],base:[{n:"Tonka Bean"},{n:"Amber"},{n:"Musk"}]},
    accords:[{n:"Woody",v:95},{n:"Oriental",v:78},{n:"Smoky",v:70},{n:"Spicy",v:65},{n:"Earthy",v:55}],
    longevity:4.5, sillage:3.9, seasons:{spring:50,summer:30,fall:85,winter:90}, occasions:["Evening","Formal"], rating:4.4, votes:11059 },
  { id:4, name:"Baccarat Rouge 540", house:"Maison Francis Kurkdjian", year:2015, perfumer:"Francis Kurkdjian", family:"Floral Woody Musk", concentration:"Eau de Parfum",
    ownership:{ status:"conglomerate", parent:"LVMH", acquiredYear:2017, note:"Acquired by LVMH in 2017. Francis Kurkdjian remained as creative director and continues to lead the house." },
    description:"Saffron and jasmine float above amberwood and fir resin, an almost synesthetic experience of warmth without weight.",
    story:"Created for Baccarat crystal's 250th anniversary, light refracting through crystal, prismatic and pure.",
    prices:[{size:"200ml",price:"$830",perMl:"$4.15"},{size:"70ml",price:"$345",perMl:"$4.93"},{size:"35ml",price:"$215",perMl:"$6.14"},{size:"2ml Sample",price:"$14",perMl:"$7.00",sample:true}],
    notes:{top:[{n:"Saffron"},{n:"Jasmine"}],mid:[{n:"Amberwood"},{n:"Ambergris"}],base:[{n:"Fir Resin"},{n:"Cedar"}]},
    accords:[{n:"Warm Spicy",v:88},{n:"Amber",v:80},{n:"Woody",v:78},{n:"Floral",v:65},{n:"Gourmand",v:62}],
    longevity:4.8, sillage:4.6, seasons:{spring:75,summer:65,fall:90,winter:85}, occasions:["Work","Evening","Casual"], rating:4.5, votes:18302 },
  { id:5, name:"Santal 33", house:"Le Labo", year:2011, perfumer:"Frank Voelkl", family:"Woody", concentration:"Eau de Parfum",
    ownership:{ status:"conglomerate", parent:"Estée Lauder Companies", acquiredYear:2014, note:"Acquired by Estée Lauder Companies in 2014. The founders Fabrice Penot and Edouard Roschi stayed on after acquisition." },
    description:"Papyrus, cedarwood, and cardamom over sandalwood and violet. The scent of the American West imagined by a New Yorker.",
    story:"An ode to the campfire, leather, wood smoke, and the open plains rendered in a quietly iconic bottle.",
    prices:[{size:"100ml",price:"$310",perMl:"$3.10"},{size:"50ml",price:"$200",perMl:"$4.00"},{size:"15ml Travel",price:"$78",perMl:"$5.20"},{size:"2ml Sample",price:"$10",perMl:"$5.00",sample:true}],
    notes:{top:[{n:"Cardamom"},{n:"Iris"},{n:"Violet"}],mid:[{n:"Amberwood"},{n:"Cedarwood"},{n:"Sandalwood"}],base:[{n:"Papyrus"},{n:"Leather"},{n:"Musk"}]},
    accords:[{n:"Woody",v:92},{n:"Smoky",v:68},{n:"Creamy",v:60},{n:"Floral",v:45},{n:"Spicy",v:40}],
    longevity:4.0, sillage:3.5, seasons:{spring:60,summer:45,fall:88,winter:75}, occasions:["Casual","Work","Weekend"], rating:4.2, votes:7834 },
  { id:6, name:"Tobacco Vanille", house:"Tom Ford", year:2007, perfumer:"Unknown", family:"Oriental Spicy", concentration:"Eau de Parfum",
    ownership:{ status:"conglomerate", parent:"Estée Lauder Companies", acquiredYear:2005, note:"Tom Ford Beauty has been under Estée Lauder Companies since 2005. Tom Ford sold the remaining brand to Ermenegildo Zegna in 2023." },
    description:"Rich tobacco leaf and aromatic spices blend into vanilla and tonka bean, warm, heady, and unapologetically indulgent.",
    story:"An English gentlemen's club filtered through Ford's unerring sense for luxury.",
    prices:[{size:"100ml",price:"$295",perMl:"$2.95"},{size:"50ml",price:"$195",perMl:"$3.90"},{size:"10ml Travel",price:"$68",perMl:"$6.80"},{size:"2ml Sample",price:"$9",perMl:"$4.50",sample:true}],
    notes:{top:[{n:"Cardamom"},{n:"Tobacco"}],mid:[{n:"Vanilla"},{n:"Cocoa"}],base:[{n:"Tonka Bean"},{n:"Amber"},{n:"Musk"}]},
    accords:[{n:"Tobacco",v:90},{n:"Gourmand",v:82},{n:"Warm Spicy",v:74},{n:"Amber",v:68},{n:"Woody",v:55}],
    longevity:4.6, sillage:4.2, seasons:{spring:30,summer:15,fall:88,winter:95}, occasions:["Evening","Formal","Date Night"], rating:4.5, votes:12400 },
  { id:7, name:"Violet and Amber", house:"Imaginary Authors", year:2013, perfumer:"Josh Meyer", family:"Floral Woody", concentration:"Eau de Parfum",
    ownership:{ status:"independent", note:"Imaginary Authors is independently owned and operated by perfumer Josh Meyer from Portland, Oregon. Each fragrance is inspired by a fictional book." },
    description:"Wet violet leaf and cedar open into a warm amber drydown, literary, wistful, and deeply personal.",
    story:"Each Imaginary Authors fragrance is inspired by a fictional book. This one smells like the margins of something you never finished.",
    prices:[{size:"100ml",price:"$115",perMl:"$1.15"},{size:"50ml",price:"$75",perMl:"$1.50"},{size:"5ml Sample",price:"$12",perMl:"$2.40",sample:true}],
    notes:{top:[{n:"Violet Leaf"},{n:"Bergamot"}],mid:[{n:"Iris"},{n:"Cedar"}],base:[{n:"Amber"},{n:"Musk"},{n:"Sandalwood"}]},
    accords:[{n:"Floral",v:78},{n:"Woody",v:70},{n:"Amber",v:65},{n:"Powdery",v:55},{n:"Fresh",v:42}],
    longevity:3.8, sillage:3.2, seasons:{spring:75,summer:55,fall:70,winter:60}, occasions:["Casual","Work","Weekend"], rating:4.3, votes:3210 },
];

const GLOSSARY = [
  {term:"Sillage",  def:"The trail a fragrance leaves in the air behind you, from the French word for 'wake.'"},
  {term:"Dry Down", def:"The final phase after top and middle notes evaporate, revealing the true character of the base."},
  {term:"Chypre",   def:"Built on bergamot, labdanum, and oakmoss. Named after the island of Cyprus."},
  {term:"Oud",      def:"Agarwood resin from infected Aquilaria trees. One of the rarest materials in perfumery."},
  {term:"Accord",   def:"A blend of notes that creates a unified impression, like a chord in music."},
  {term:"Fougère",  def:"From the French for 'fern.' Classic structure of lavender, coumarin, and oakmoss."},
  {term:"Top Notes", def:"The first impression. Bright, light molecules like citrus that fade within the first half hour."},
  {term:"Heart Notes", def:"Also called middle notes. The core of the fragrance, which emerges as the top notes fade and lasts a few hours."},
  {term:"Base Notes", def:"The foundation. Heavy materials like woods, resins and musks that anchor the scent and linger for hours."},
  {term:"Longevity", def:"How long a fragrance lasts on skin before it disappears."},
  {term:"Projection", def:"How far a fragrance radiates from the skin in the first hours. Sillage is the trail it leaves as you move."},
  {term:"Eau de Parfum", def:"A concentration of roughly 15 to 20 percent fragrance oil. Longer lasting and richer than eau de toilette."},
  {term:"Eau de Toilette", def:"A lighter concentration, roughly 5 to 15 percent oil. Brighter and shorter lived than eau de parfum."},
  {term:"Extrait de Parfum", def:"The most concentrated form, often 20 to 40 percent oil. Sits close to the skin and lasts the longest."},
  {term:"Parfum", def:"In practice another word for extrait: the strongest concentration a house sells."},
  {term:"Cologne", def:"Originally a light citrus water from Cologne, Germany. Today it often means a fresh, low concentration scent."},
  {term:"Niche", def:"Houses that focus on fragrance itself rather than fashion, usually small and with a distinctive point of view."},
  {term:"Flanker", def:"A new version of an existing fragrance, sharing its name but changing the formula or mood."},
  {term:"Reformulation", def:"A change to a fragrance's recipe, often because an ingredient is restricted, scarce or too costly."},
  {term:"Batch Code", def:"A code printed on a bottle that tells you when it was made. Useful for checking age and authenticity."},
  {term:"Decant", def:"A small amount of fragrance poured from a full bottle into a travel atomizer, so you can try before you commit."},
  {term:"Blind Buy", def:"Buying a full bottle without having smelled it first."},
  {term:"Gourmand", def:"A fragrance built on edible notes such as vanilla, caramel, chocolate or coffee."},
  {term:"Aldehydes", def:"Synthetic molecules that add a sparkling, soapy, champagne-like lift. Chanel No. 5 made them famous."},
  {term:"Musk", def:"Once taken from deer, now almost always synthetic. A soft, skin-like warmth used as a base."},
  {term:"Ambergris", def:"A waxy substance produced by sperm whales and found floating at sea. Smells salty, sweet and animalic. Now mostly recreated in the lab."},
  {term:"Labdanum", def:"A sticky resin from the rock rose. Warm, leathery and amber-like."},
  {term:"Absolute", def:"A highly concentrated aromatic extracted from flowers with solvents, such as jasmine absolute."},
  {term:"Essential Oil", def:"An aromatic oil obtained by steam distillation or pressing of plants."},
  {term:"Maceration", def:"The resting period after blending, where the fragrance matures before filtering and bottling."},
  {term:"Perfumer", def:"The person who composes the formula. Also called a nose."},
  {term:"Skin Scent", def:"A quiet fragrance that stays close and smells like a cleaner, softer version of your own skin."},
  {term:"Signature Scent", def:"The one fragrance a person wears so often that people link it to them."},
  {term:"Layering", def:"Wearing two or more fragrances together to make something new."},
  {term:"Olfactory Fatigue", def:"When your nose stops registering a smell after prolonged exposure. Smell coffee beans between samples to reset."},
  {term:"Anosmia", def:"The loss of the sense of smell, whether temporary or lasting."},
  {term:"Orientale", def:"A family of warm, rich fragrances built on amber, spices and resins. Now often called amber."},
  {term:"Aquatic", def:"Fresh, marine or watery fragrances that suggest sea air, rain or cool water."},
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function Stars({ rating, size=11 }) {
  return <div style={{display:"flex",gap:1}}>{[1,2,3,4,5].map(i=><span key={i} style={{fontSize:size,color:i<=Math.round(rating)?T.black:T.faint}}>★</span>)}</div>;
}
function BackBtn({ onBack, label = "Back" }) {
  return (
    <button onClick={onBack} aria-label={label === "Back" ? "Go back" : label} style={{ display:"inline-flex", alignItems:"center", gap:4, minHeight:44, padding:"0 14px 0 6px", margin:"-8px 0 10px -6px", background:"none", border:"none", cursor:"pointer", fontFamily:sans, fontSize:15, fontWeight:500, color:T.ink }}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>{label}
    </button>
  );
}
function brandTypeLabel(bo) {
  const b = String(bo || "").toLowerCase();
  if (b === "indie" || b === "independent") return "Indie";
  if (b === "niche") return "Niche";
  if (b === "designer") return "Heritage";
  if (b === "celebrity") return "Heritage · Celebrity";
  return "";
}
function BrandTypePill({ type, size = "normal" }) {
  const label = brandTypeLabel(type);
  if (!label) return null;
  const sm = size === "small";
  return <span title="Brand type" style={{ display:"inline-flex", alignItems:"center", fontFamily:sans, fontSize:sm?10:12, fontWeight:600, letterSpacing:"0.04em", padding:sm?"2px 9px":"4px 12px", borderRadius:20, background:T.black, color:T.white, whiteSpace:"nowrap" }}>{label}</span>;
}
function Lbl({ children, mb=10 }) {
  return <p style={{fontFamily:sans,fontSize:9,textTransform:"uppercase",letterSpacing:"0.12em",color:T.mid,margin:`0 0 ${mb}px`}}>{children}</p>;
}
function Thumb({ frag, w="var(--thumb-w)" }) {
  const ini = frag.name.split(" ").map(x => x[0]).join("").slice(0, 2).toUpperCase();
  const hue = hueFor(frag.name);
  return (
    <span style={{ display:"block", position:"relative", width:w, aspectRatio:"0.8", flexShrink:0, borderRadius:12, overflow:"hidden", background:frag.image?T.white:`var(--tint-${hue})`, border:`1px solid ${T.rule}` }}>
      {frag.image
        ? <img src={frag.image} alt="" loading="lazy" style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"contain", padding:"8%" }}/>
        : <span style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", fontFamily:serif, fontSize:40, fontWeight:400, letterSpacing:-1, color:`var(--${hue})` }}>{ini}{frag.year&&<span style={{ fontFamily:sans, fontSize:12, letterSpacing:"0.04em", opacity:0.7, marginTop:4 }}>{frag.year}</span>}</span>}
    </span>
  );
}
// ─── MEMBER FEELINGS (one tap per impression; no public star score) ─────────
const FEELINGS = [
  { key:"loved", label:"Loved it", color:"var(--accent)" },
  { key:"artistry", label:"Appreciate the artistry", color:"var(--orchid)" },
  { key:"notforme", label:"Not for me", color:"var(--violet)" },
];
const MIN_FEELINGS = 5;
function FeelingChip({ feeling, size="normal" }) {
  const f = FEELINGS.find(x => x.key === feeling);
  if (!f) return null;
  return <span style={{ display:"inline-flex", alignItems:"center", gap:6, fontFamily:sans, fontSize:size==="small"?11:13, fontWeight:600, color:f.color, border:`1px solid ${f.color}`, borderRadius:20, padding:size==="small"?"2px 10px":"4px 12px" }}><span style={{ width:7, height:7, borderRadius:"50%", background:f.color }}/>{f.label}</span>;
}
function FeelingBar({ items }) {
  const total = items.length;
  if (total < MIN_FEELINGS) return null;
  return (
    <div style={{ flex:1, minWidth:0, marginRight:16 }}>
      <p style={{ fontFamily:serif, fontSize:22, color:T.black, margin:"0 0 10px", lineHeight:1.1 }}>How members felt</p>
      <div style={{ display:"flex", height:12, borderRadius:6, overflow:"hidden", gap:2 }} role="img" aria-label={FEELINGS.map(f => `${items.filter(i => i.feeling === f.key).length} ${f.label}`).join(", ")}>
        {FEELINGS.map(f => { const c = items.filter(i => i.feeling === f.key).length; return c ? <div key={f.key} style={{ flex:c, background:f.color }}/> : null; })}
      </div>
      <div style={{ display:"flex", flexWrap:"wrap", gap:"4px 14px", marginTop:8 }}>
        {FEELINGS.map(f => { const c = items.filter(i => i.feeling === f.key).length; return <span key={f.key} style={{ fontFamily:sans, fontSize:12, color:T.mid, display:"inline-flex", alignItems:"center", gap:5 }}><span style={{ width:8, height:8, borderRadius:"50%", background:f.color }}/>{f.label} {Math.round(c / total * 100)}%</span>; })}
      </div>
      <p style={{ fontFamily:sans, fontSize:12, color:T.faint, margin:"8px 0 0" }}>Some scents aren't for everyone. Let your skin tell you.</p>
    </div>
  );
}
function ReviewCard({ hueKey, who, whoLabel, badges, date, feeling, text, fragName, house, image, helpful, replyCount, onWho, onFrag, onReply, children }) {
  const [liked, setLiked] = useState(false);
  const RH = ["violet","teal","orchid","pink"]; // cool brand colours only: orange and coral tints read as brown on dark
  let hh = 0; for (const c of String(fragName || hueKey || who || "x")) hh = (hh * 31 + c.charCodeAt(0)) >>> 0;
  const hue = RH[hh % RH.length];
  const initial = String(whoLabel || who || "?").replace(/^@/, "")[0].toUpperCase();
  return (
    <div style={{ padding:"18px 0", borderBottom:`1px solid ${T.rule}` }}>
      <div style={{ display:"flex", alignItems:"center", gap:12 }}>
        <div style={{ width:46, height:46, borderRadius:"50%", background:`var(--tint-${hue})`, color:`var(--${hue})`, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:serif, fontSize:20, flexShrink:0 }}>{initial}</div>
        <div style={{ minWidth:0, flex:1 }}>
          <div style={{ display:"flex", alignItems:"baseline", gap:8, flexWrap:"wrap" }}>
            <span onClick={onWho} style={{ fontFamily:serif, fontSize:18, color:T.black, cursor:onWho?"pointer":"default" }}>{whoLabel || who}</span>
            {badges}
            <span style={{ fontFamily:sans, fontSize:12, color:T.faint }}>{date}</span>
          </div>
          {fragName && <p style={{ fontFamily:sans, fontSize:13, color:T.mid, margin:"2px 0 0", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>Reviewed <span onClick={onFrag} style={{ color:T.violet, cursor:onFrag?"pointer":"default" }}>{fragName}</span></p>}
        </div>
      </div>
      <div style={{ marginTop:14, background:`var(--tint-${hue})`, borderRadius:18, padding:"18px 18px 16px" }}>
        {feeling && <FeelingChip feeling={feeling}/>}
        {text && <p style={{ fontFamily:sans, fontSize:15, color:T.ink, lineHeight:1.65, margin:feeling?"14px 0 0":0 }}>{text}</p>}
        {fragName && (
          <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", gap:12, marginTop:text?18:34 }}>
            <div style={{ minWidth:0 }}>
              <p onClick={onFrag} style={{ fontFamily:serif, fontSize:22, lineHeight:1.15, color:T.black, margin:0, cursor:onFrag?"pointer":"default" }}>{fragName}</p>
              {house && <p style={{ fontFamily:sans, fontSize:13, color:T.mid, margin:"4px 0 0" }}>By {house}</p>}
            </div>
            <Thumb frag={{ name:fragName, image }} w={64}/>
          </div>
        )}
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:20, marginTop:12 }}>
        <button onClick={() => setLiked(l => !l)} aria-pressed={liked} aria-label="Helpful" style={{ display:"flex", alignItems:"center", gap:6, background:"none", border:"none", cursor:"pointer", padding:0, fontFamily:sans, fontSize:14, color:liked?"var(--accent)":T.mid }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill={liked?"currentColor":"none"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z"/></svg>
          {(helpful || 0) + (liked ? 1 : 0)}
        </button>
        <button onClick={onReply} aria-label="Reply" style={{ display:"flex", alignItems:"center", gap:6, background:"none", border:"none", cursor:onReply?"pointer":"default", padding:0, fontFamily:sans, fontSize:14, color:T.mid }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/></svg>
          {replyCount || 0}
        </button>
      </div>
      {children}
    </div>
  );
}
function Mono({ name, year, size=52 }) {
  const ini=name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();
  const hue=hueFor(name);
  return (
    <div style={{width:size,height:size,borderRadius:Math.round(size*0.2),background:`var(--tint-${hue})`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",flexShrink:0}}>
      <span style={{fontFamily:serif,fontSize:size*0.26,fontWeight:500,color:`var(--${hue})`,lineHeight:1}}>{ini}</span>
      {year&&<span style={{fontFamily:sans,fontSize:size*0.14,color:`var(--${hue})`,opacity:0.7,marginTop:2,letterSpacing:"0.04em"}}>{year}</span>}
    </div>
  );
}

// ─── HOUSE STRIP — always visible below Occasions ────────────────────────────
// ─── LIVE CATALOGUE HELPERS ───────────────────────────────────────────────────
const FRAG_SELECT_DIV = `
  id, slug, display_name, url, gender, year, perfumer, story, barcode, concentration, ownership, brand_origin, price_tier, line, image_url, image_credit,
  house:houses ( name, slug, country, ownership, brand_origin, price_tier, website, diversity ),
  notes ( note_name, position ),
  accords ( accord_name, rank )
`;
const FRAG_SELECT_NEO = FRAG_SELECT_DIV.replace("image_credit,", "image_credit, neo_gourmand,");
const FRAG_SELECT_KIT = FRAG_SELECT_NEO.replace(", website, diversity", ", website, diversity, has_discovery_kit, kit_name, kit_price, kit_url, has_samples, has_travel_size, travel_size_url");
const FRAG_SELECT_FULL = FRAG_SELECT_DIV.replace(", website, diversity", ", website");
const FRAG_SELECT_BASE = FRAG_SELECT_FULL.replace(", ownership, brand_origin, price_tier, line, image_url, image_credit,", ",").replace(", website", "");
// Runs a query with the full column list, and again without the newer columns if they are not in the database yet.
async function fetchFragRows(build) {
  let r = await build(FRAG_SELECT_KIT);
  if (r.error && /display_name/i.test(r.error.message || "")) { const nd = q => build(q.replace("display_name, ", "")); r = await nd(FRAG_SELECT_KIT); if (r.error && /has_discovery_kit|kit_name|kit_price|kit_url|has_samples|has_travel_size|travel_size_url/i.test(r.error.message || "")) r = await nd(FRAG_SELECT_NEO); if (r.error && /neo_gourmand/i.test(r.error.message || "")) r = await nd(FRAG_SELECT_DIV); return r; }
  if (r.error && /has_discovery_kit|kit_name|kit_price|kit_url|has_samples|has_travel_size|travel_size_url/i.test(r.error.message || "")) r = await build(FRAG_SELECT_NEO);
  if (r.error && /neo_gourmand/i.test(r.error.message || "")) r = await build(FRAG_SELECT_DIV);
  if (r.error && /diversity/i.test(r.error.message || "")) r = await build(FRAG_SELECT_FULL);
  if (r.error && /website|line|ownership|brand_origin|price_tier|image_url|image_credit/i.test(r.error.message || "")) r = await build(FRAG_SELECT_BASE);
  return r;
}
function cleanDiversity(v) {
  const t = String(v == null ? "" : v).trim();
  if (!t || /^(false|no|n\/a|none|null)$/i.test(t)) return "";
  if (/^true$/i.test(t)) return "Yes";
  // Show the ethnic background only: drop founder names and gender notes (e.g. "founder Anjali Vandemark", "woman-owned").
  const NAMEY = /founder|founded|co-founded|perfumer|woman|female/i;
  const noParen = t.replace(/\s*\(([^)]*)\)/g, (m, inner) => NAMEY.test(inner) ? "" : m);
  const kept = noParen.split(",").map(s => s.trim()).filter(s => s && !NAMEY.test(s));
  return kept.join(", ") || (isWomanOwned(t) ? "" : t);
}
// Woman-owned is its own diversity category (separate from ethnic background).
function isWomanOwned(v) { return /woman|women|female/i.test(String(v == null ? "" : v)); }
// Some notes arrive joined with a bar ("Mandarin|Raspberry"): show each one on its own.
function splitNotes(notes, pos) {
  const seen = new Set(), out = [];
  notes.filter(n => n.position === pos).forEach(n => String(n.note_name || "").split(/\s*[|\/]\s*/).forEach(part => {
    const t = part.trim(), k = t.toLowerCase();
    if (t && !seen.has(k)) { seen.add(k); out.push({ n: t }); }
  }));
  return out;
}
const allNoteList = n => [].concat((n && n.top) || [], (n && n.mid) || [], (n && n.base) || [], (n && n.all) || []);
// The database mostly leaves "concentration" empty, but most variants carry it in the slug (black-orchid-eau-de-toilette).
function concFromSlug(slug) {
  const m = String(slug || "").match(/-(eau-de-parfum|eau-de-toilette|eau-de-cologne|edp|edt|extrait|parfum|cologne)$/);
  if (!m) return "";
  return { "eau-de-parfum":"Eau de Parfum", edp:"Eau de Parfum", "eau-de-toilette":"Eau de Toilette", edt:"Eau de Toilette", "eau-de-cologne":"Eau de Cologne", cologne:"Cologne", extrait:"Extrait", parfum:"Parfum" }[m[1]] || "";
}
function mapFrag(f) {
  const own = f.ownership || (f.house && f.house.ownership) || "";
  const notes = f.notes || [];
  const accords = f.accords || [];
  return {
    id: f.id,
    slug: f.slug,
    name: f.display_name || ((f.house && f.house.slug === "a-n-other" && /^[a-z]{2}-\d{2,4}$/.test(f.slug)) ? f.slug.replace("-", " ").toUpperCase() : f.slug.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase()).replace(/\bEdp\b/g, "EDP").replace(/\bEdt\b/g, "EDT")),
    house: (f.house && f.house.name) || "",
    houseSlug: (f.house && f.house.slug) || "",
    country: (f.house && f.house.country) || "",
    ownership: own ? { status: own === "Independent" ? "independent" : "conglomerate", parent: own } : null,
    line: f.line || "",
    brand_origin: f.brand_origin || (f.house && f.house.brand_origin) || "",
    website: (f.house && f.house.website) || "",
    brandOffer: f.house ? { kit: f.house.has_discovery_kit === true, kitName: f.house.kit_name || "", kitPrice: f.house.kit_price || "", kitUrl: f.house.kit_url || "", samples: f.house.has_samples === true, travel: f.house.has_travel_size === true, travelUrl: f.house.travel_size_url || "" } : null,
    diversity: cleanDiversity(f.house && f.house.diversity),
    womanOwned: isWomanOwned(f.house && f.house.diversity),
    price_tier: f.price_tier || (f.house && f.house.price_tier) || "",
    year: f.year,
    perfumer: titleCaseName(f.perfumer),
    story: f.story || "",
    concentration: f.concentration || concFromSlug(f.slug),
    gender: f.gender,
    url: f.url || "",
    neoGourmand: !!f.neo_gourmand,
    image: f.image_url || "",
    imageCredit: f.image_credit || "",
    notes: {
      top: splitNotes(notes, "top"),
      mid: splitNotes(notes, "mid"),
      base: splitNotes(notes, "base"),
      all: splitNotes(notes, "all"),   // notes the house does not break into top / heart / base
    },
    accords: [...accords].sort((x, y) => x.rank - y.rank).map(x => ({ n: /^sweet$/i.test(String(x.accord_name).trim()) ? "Gourmand" : x.accord_name, v: 80 - (x.rank - 1) * 10 })).filter((a, i, arr) => arr.findIndex(b => String(b.n).toLowerCase() === String(a.n).toLowerCase()) === i),
    longevity: null, sillage: null, seasons: {}, occasions: [], rating: null, votes: 0,
    prices: [],
  };
}
// The app registers its catalogue cache here so any component can add fragrances it loads.
const fragSink = { fn: null };

// ─── EVENT TRACKING ───────────────────────────────────────────────────────────
// Anonymous usage events for members (views, saves, sample and brand-site clicks, searches).
// Stored without name, email or IP: only a random per-browser id, the fragrance or house, where in
// the app it came from, and a coarse region. Sent through the log_event function (20+ members per
// cut before anything is reported). Never blocks the app: every failure is swallowed.
const trackState = { region: null, source: null, seen: {}, searchTimer: null };
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function trackVisitorId() {
  try {
    let v = localStorage.getItem("mos_vid");
    if (!v || !UUID_RE.test(v)) {
      v = (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : null;
      if (v) localStorage.setItem("mos_vid", v);
    }
    return v;
  } catch (e) { return null; }
}
function trackEvent(type, o = {}) {
  try {
    const frag = o.fragrance && UUID_RE.test(String(o.fragrance)) ? String(o.fragrance) : null;
    if (o.fragrance && !frag) return; // demo data has no real id
    const key = [type, frag || "", o.houseSlug || "", o.detail || ""].join("|");
    const now = Date.now();
    const wait = o.dedupeMs != null ? o.dedupeMs : 3000;
    if (trackState.seen[key] && now - trackState.seen[key] < wait) return;
    trackState.seen[key] = now;
    const p = supabase.rpc("log_event", {
      p_type: type,
      p_fragrance: frag,
      p_house_slug: o.houseSlug || null,
      p_source: o.source || null,
      p_detail: o.detail || null,
      p_region: trackState.region,
      p_visitor: trackVisitorId(),
    });
    if (p && p.then) p.then(() => {}, () => {});
  } catch (e) {}
}
// Searches are logged once typing pauses, and only for 3+ characters.
function trackSearch(q) {
  try {
    const t = String(q || "").trim().toLowerCase().replace(/\s+/g, " ").slice(0, 60);
    if (trackState.searchTimer) clearTimeout(trackState.searchTimer);
    if (t.length < 3) return;
    trackState.searchTimer = setTimeout(() => trackEvent("search", { detail: t, source: "discover", dedupeMs: 300000 }), 1500);
  } catch (e) {}
}
// Other fragrances from the same house, loaded on demand.
function useHouseSiblings(frag, enabled) {
  const [list, setList] = useState(null);
  useEffect(() => {
    if (!enabled || !frag.houseSlug) return;
    let off = false;
    (async () => {
      try {
        const { data: h } = await supabase.from("houses").select("id").eq("slug", frag.houseSlug).maybeSingle();
        if (!h) { if (!off) setList([]); return; }
        const { data, error } = await fetchFragRows(sel => supabase.from("fragrances").select(sel).eq("house_id", h.id).neq("id", frag.id).order("slug", { ascending: true }).limit(12));
        if (off) return;
        if (error || !data) { setList([]); return; }
        const m = data.map(mapFrag);
        if (fragSink.fn) fragSink.fn(m);
        setList(m);
      } catch (e) { if (!off) setList([]); }
    })();
    return () => { off = true; };
  }, [enabled, frag.id, frag.houseSlug]);
  return list;
}

// Similar scents: precomputed matches by shared notes (fragrance_similar, built by 20_similar_fragrances.sql).
// Renders nothing if the table is missing, empty, or the fragrance has no matches yet.
function SimilarScents({ frag, onOpenFrag }) {
  const [rows, setRows] = useState(null);
  useEffect(() => {
    let off = false;
    setRows(null);
    (async () => {
      try {
        const { data: sim, error } = await supabase.from("fragrance_similar")
          .select("similar_id, score, shared_count, shared_notes")
          .eq("fragrance_id", frag.id).order("score", { ascending: false }).limit(8);
        if (off) return;
        if (error || !sim || !sim.length) { setRows([]); return; }
        const ids = sim.map(s => s.similar_id);
        const { data, error: e2 } = await fetchFragRows(sel => supabase.from("fragrances").select(sel).in("id", ids));
        if (off) return;
        if (e2 || !data) { setRows([]); return; }
        const byId = {};
        data.map(mapFrag).forEach(m => { byId[m.id] = m; });
        if (fragSink.fn) fragSink.fn(Object.values(byId));
        setRows(sim.filter(s => byId[s.similar_id]).map(s => ({ f: byId[s.similar_id], count: s.shared_count, notes: s.shared_notes || [] })));
      } catch (e) { if (!off) setRows([]); }
    })();
    return () => { off = true; };
  }, [frag.id]);
  if (!rows || !rows.length) return null;
  const cap = s => String(s).replace(/\b\w/g, c => c.toUpperCase());
  return (
    <div style={{ marginBottom: 36 }}>
      <Lbl mb={6}>Similar scents</Lbl>
      <p style={{ fontFamily: sans, fontSize: 12, color: T.mid, lineHeight: 1.6, margin: "0 0 12px" }}>Matched on shared notes, with rarer notes counting for more.</p>
      <div className="mos-shelf" style={{ display: "flex", alignItems: "flex-start", gap: 14, overflowX: "auto", paddingTop: 4, paddingBottom: 10, scrollSnapType: "x proximity", WebkitOverflowScrolling: "touch" }}>
        {rows.map(r => (
          <div key={r.f.id} style={{ flex: "0 0 auto", width: TILE_W }}>
            <CoverTile frag={r.f} fit onClick={id => onOpenFrag(id, "similar")} userStatus={null}/>
            <p style={{ fontFamily: sans, fontSize: 12, color: T.ink, margin: "6px 0 0", lineHeight: 1.45 }}>
              Shares {r.count} note{r.count === 1 ? "" : "s"}: {r.notes.slice(0, 3).map(cap).join(", ")}{r.count > 3 ? ` and ${r.count - 3} more` : ""}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// Versions of one fragrance (EDT, EDP, Parfum...) are separate entries with their own notes. This links them.
const CONC_SUFFIX = /-(eau-de-parfum|eau-de-toilette|eau-de-cologne|edp|edt|extrait|parfum|cologne)$/;
function OtherVersions({ frag, onOpenFrag }) {
  const [list, setList] = useState([]);
  const base = String(frag.slug || "").replace(CONC_SUFFIX, "");
  useEffect(() => {
    if (!frag.houseSlug || !base) { setList([]); return; }
    let off = false;
    (async () => {
      try {
        const { data: h } = await supabase.from("houses").select("id").eq("slug", frag.houseSlug).maybeSingle();
        if (!h || off) return;
        const { data } = await fetchFragRows(sel => supabase.from("fragrances").select(sel).eq("house_id", h.id).like("slug", base + "%").order("slug").limit(12));
        if (off || !data) return;
        const m = data.map(mapFrag).filter(x => String(x.slug || "").replace(CONC_SUFFIX, "") === base);
        if (fragSink.fn) fragSink.fn(m);
        setList(m);
      } catch (e) {}
    })();
    return () => { off = true; };
  }, [frag.id, frag.houseSlug, base]);
  if (list.length < 2) return null;
  return (
    <div style={{ margin:"12px 0 0" }}>
      <p style={{ fontFamily:sans, fontSize:11, textTransform:"uppercase", letterSpacing:"0.12em", color:T.mid, margin:"0 0 8px" }}>Versions · each has its own notes</p>
      <div style={{ display:"flex", flexWrap:"wrap", gap:7 }}>
        {list.map(v => { const on = v.id === frag.id; const lab = v.concentration || "Standard";
          return <button key={v.id} onClick={() => !on && onOpenFrag(v.id, "version")} aria-pressed={on} style={{ minHeight:38, padding:"0 14px", borderRadius:20, border:`1px solid ${on ? "transparent" : T.rule}`, background:on ? "var(--accent)" : T.white, color:on ? "#fff" : T.ink, fontFamily:sans, fontSize:14, fontWeight:on ? 600 : 400, cursor:on ? "default" : "pointer" }}>{lab}</button>; })}
      </div>
    </div>
  );
}
function HouseStrip({ currentFrag, onOpenFrag, onOpenBrand }) {
  const siblings = useHouseSiblings(currentFrag, true) || [];
  if (!siblings.length) return null;
  return (
    <div style={{ background: T.lift, borderRadius: 16, border: `1px solid ${T.rule}`, overflow: "hidden", marginTop: 4 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px 10px", borderBottom: `1px solid ${T.rule}` }}>
        <div>
          <p style={{ fontFamily: sans, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.12em", color: T.mid, margin: "0 0 2px" }}>From the same house</p>
          <p style={{ fontFamily: serif, fontSize: 16, color: T.black, margin: 0 }}>{currentFrag.house}</p>
        </div>
        {onOpenBrand && <button onClick={() => onOpenBrand({ slug: currentFrag.houseSlug, name: currentFrag.house })} style={{ fontFamily: sans, fontSize: 12, color: T.ink, background: "none", border: "none", cursor: "pointer", minHeight: 32 }}>View brand →</button>}
      </div>
      <div style={{ display: "flex", gap: 0, overflowX: "auto" }}>
        {siblings.map((f, i) => (
          <div key={f.id} onClick={() => onOpenFrag(f.id, "house")}
            style={{ flexShrink: 0, width: 160, cursor: "pointer", padding: "14px 16px", borderRight: i < siblings.length - 1 ? `1px solid ${T.rule}` : "none", transition: "background 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.background = T.white}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <Thumb frag={f} w={72}/>
              <div>
                <p style={{ fontFamily: serif, fontSize: 13, color: T.black, margin: 0, lineHeight: 1.2 }}>{f.name}</p>
                <p style={{ fontFamily: sans, fontSize: 10, color: T.mid, margin: "1px 0 0" }}>{f.year}</p>
              </div>
            </div>
            <p style={{ fontFamily: sans, fontSize: 10, color: T.mid, margin: "0 0 5px" }}>{f.family}</p>
            <div style={{ display: "flex", gap: 1 }}>{[1,2,3,4,5].map(i => <span key={i} style={{ fontSize: 9, color: i <= Math.round(f.rating) ? T.black : T.faint }}>★</span>)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}


// ─── BRANDS: directory + full-page brand card ────────────────────────────────
function brandGroup(h) {
  const bo = String(h.brand_origin || "").toLowerCase();
  if (bo === "indie" || bo === "independent") return "independent";
  if (bo === "niche") return "niche";
  if (bo === "designer" || bo === "celebrity") return "designer";
  return "";
}
function brandOriginLabel(h) {
  return brandTypeLabel(h.brand_origin);
}
function ownershipOf(h) {
  const o = h && h.ownership;
  return o ? { status: o === "Independent" ? "independent" : "conglomerate", parent: o } : null;
}
// The database returns at most 100 rows per request, so long lists are fetched a page at a time.
async function rpcAll(name, args) {
  const out = [];
  for (let from = 0; from < 10000; from += 100) {
    const r = await supabase.rpc(name, args || {}).range(from, from + 99);
    if (r.error) return { data: null, error: r.error };
    const rows = r.data || [];
    out.push(...rows);
    if (rows.length < 100) break;
  }
  return { data: out, error: null };
}
// Same for a table query: build(from, to) returns the query for one page (give it a stable .order()).
async function pageAll(build) {
  const out = [];
  for (let from = 0; from < 20000; from += 100) {
    const r = await build(from, from + 99);
    if (r.error) return { data: null, error: r.error };
    const rows = r.data || [];
    out.push(...rows);
    if (rows.length < 100) break;
  }
  return { data: out, error: null };
}
async function loadBrands() {
  const r = await rpcAll("brands_list");
  if (!r.error && r.data) return r.data;
  const f = await pageAll((a, b) => supabase.from("houses").select("*").order("name").order("id").range(a, b));
  if (f.error) throw f.error;
  return (f.data || []).map(h => ({ ...h, frag_count: null }));
}

function BrandsDirectory({ onOpenBrand }) {
  const [rows, setRows] = useState(null);
  const [failed, setFailed] = useState(false);
  const [q, setQ] = useState("");
  const [group, setGroup] = useState("all");
  useEffect(() => {
    let off = false;
    loadBrands().then(d => { if (!off) setRows(d); }).catch(() => { if (!off) { setFailed(true); setRows([]); } });
    return () => { off = true; };
  }, []);
  const needle = q.trim().toLowerCase();
  const list = (rows || []).filter(h =>
    (group === "all" || brandGroup(h) === group) &&
    (!needle || [h.name, h.country].some(v => String(v || "").toLowerCase().includes(needle))));
  const letters = {};
  list.forEach(h => { const L = (String(h.name || "#")[0] || "#").toUpperCase(); const k = /[A-Z]/.test(L) ? L : "#"; (letters[k] = letters[k] || []).push(h); });
  const keys = Object.keys(letters).sort((a, b) => a === "#" ? 1 : b === "#" ? -1 : a.localeCompare(b));
  // Brand spotlight: one house a day, picked from houses with at least 5 fragrances in the library
  const pool = (rows || []).filter(h => Number(h.frag_count) >= 5 && h.slug).sort((a, b) => String(a.slug).localeCompare(String(b.slug)));
  const spot = pool.length ? pool[Math.floor((Date.now() - new Date().getTimezoneOffset() * 60000) / 86400000) % pool.length] : null;
  const [spotFrags, setSpotFrags] = useState([]);
  useEffect(() => {
    if (!spot || !spot.id) { setSpotFrags([]); return; }
    let off = false;
    (async () => {
      try {
        const r = await fetchFragRows(sel => supabase.from("fragrances").select(sel).eq("house_id", spot.id).not("image_url", "is", null).order("year", { ascending: false, nullsFirst: false }).order("slug", { ascending: true }).limit(3));
        if (!off && !r.error && r.data) setSpotFrags(r.data.map(mapFrag));
      } catch (e) {}
    })();
    return () => { off = true; };
  }, [spot && spot.id]);
  return (
    <div>
      <div style={{ position:"relative", marginBottom:10, maxWidth:760 }}>
        <span style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }}><Icon name="search" size={15} color={T.faint}/></span>
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search brands by name or country" style={{ width:"100%", background:T.white, border:`1.5px solid ${q?T.accent:T.rule}`, borderRadius:14, padding:"14px 16px 14px 44px", fontSize:14, color:T.black, outline:"none", boxSizing:"border-box", fontFamily:serif }}/>
      </div>
      <div role="group" aria-label="Brand type" style={{ display:"flex", gap:8, overflowX:"auto", padding:"6px 0 12px" }}>
        {HOUSE_GROUPS.map(g => { const on = group === g.key; return (
          <button key={g.key} onClick={() => setGroup(g.key)} aria-pressed={on} style={{ fontFamily:sans, fontSize:14, fontWeight:on?600:500, padding:"0 20px", minHeight:42, borderRadius:22, whiteSpace:"nowrap", border:`1px solid ${on?T.black:T.rule}`, background:on?T.black:T.white, color:on?T.white:T.ink, cursor:"pointer", flexShrink:0 }}>{g.label}</button>
        ); })}
      </div>
      {spot && !needle && group === "all" && (
        <button onClick={() => onOpenBrand({ slug: spot.slug, name: spot.name })} aria-label={`Brand spotlight: ${spot.name}`} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:20, width:"100%", textAlign:"left", cursor:"pointer", background:T.lift, border:`1px solid ${T.rule}`, borderRadius:18, padding:"22px 22px", margin:"4px 0 22px", fontFamily:sans }}>
          <span style={{ minWidth:0 }}>
            <span style={{ display:"block", fontSize:10, fontWeight:600, letterSpacing:"0.18em", textTransform:"uppercase", color:T.accent, marginBottom:10 }}>Brand spotlight</span>
            <span style={{ display:"block", fontFamily:serif, fontSize:"clamp(32px, 4.4vw, 60px)", letterSpacing:-1, lineHeight:1, color:T.black, overflowWrap:"anywhere" }}>{String(spot.name).replace(/\s*\(now .*\)$/, "")}</span>
            <span style={{ display:"block", fontSize:13, color:T.mid, margin:"12px 0 0" }}>{[spot.country, brandOriginLabel(spot)].filter(Boolean).join(" · ")}{spot.country || brandOriginLabel(spot) ? " · " : ""}{spot.frag_count} fragrances &rsaquo;</span>
          </span>
          {spotFrags.length > 0 && <span style={{ display:"flex", gap:8, flexShrink:0 }}>{spotFrags.slice(0, 3).map((f, i) => <span key={f.id} className={i === 2 ? "mos-spot-third" : ""} style={{ display:"block" }}><Thumb frag={f} w="clamp(64px, 9vw, 120px)"/></span>)}</span>}
        </button>
      )}
      {rows === null && <p style={{ fontFamily:sans, fontSize:13, color:T.mid }}>Loading</p>}
      {rows !== null && failed && <p style={{ fontFamily:sans, fontSize:14, color:T.mid }}>The brand list is not available right now.</p>}
      {rows !== null && !failed && <p style={{ fontFamily:sans, fontSize:12, color:T.mid, margin:"0 0 6px" }}>{list.length} {list.length === 1 ? "brand" : "brands"}</p>}
      {rows !== null && !failed && (() => {
        const bcard = SH => (h => (
              <button key={h.id || h.slug} onClick={() => onOpenBrand({ slug: h.slug, name: h.name })} style={{ textAlign:"left", cursor:"pointer", border:`1px solid ${T.rule}`, borderRadius:12, padding:"14px 16px", background:T.white, fontFamily:sans, ...(SH ? { flex:"0 0 220px", width:220, boxSizing:"border-box", scrollSnapAlign:"start" } : null) }}>
                <span style={{ display:"block", fontFamily:serif, fontSize:17, color:T.black, lineHeight:1.25 }}>{h.name}</span>
                <span style={{ display:"block", fontSize:12, color:T.mid, margin:"4px 0 0" }}>{[h.country, brandOriginLabel(h)].filter(Boolean).join(" · ")}</span>
                {h.frag_count != null && <span style={{ display:"block", fontSize:11, color:T.accent, margin:"6px 0 0" }}>{h.frag_count} {Number(h.frag_count) === 1 ? "fragrance" : "fragrances"}</span>}
              </button>
            ));
        if (needle) return keys.map(k => (
          <section key={k} style={{ borderTop:`1px solid ${T.rule}`, padding:"18px 0 8px" }}>
            <h3 style={{ fontFamily:serif, fontSize:26, fontWeight:400, color:T.black, margin:"0 0 12px" }}>{k}</h3>
            <div className="mos-samples">{letters[k].map(bcard(false))}</div>
          </section>
        ));
        const top = [...list].filter(h => Number(h.frag_count) > 0).sort((a, b) => (Number(b.frag_count) || 0) - (Number(a.frag_count) || 0) || String(a.name).localeCompare(String(b.name))).slice(0, 24);
        const secs = [["Most fragrances", "The houses with the biggest catalogues in the library.", top], ...keys.map(k => ["Brands " + k, null, letters[k]])];
        return secs.map(([title, blurb, items], i) => items.length > 0 && (
          <section key={title} className={"mos-bleed" + (i % 2 === 0 ? " mos-band" : "")} style={{ padding:"26px 0 22px" }}>
            <div className="mos-bleed-pad" style={{ marginBottom:16 }}>
              <h3 style={{ fontFamily:serif, fontSize:"clamp(26px, 2.3vw, 38px)", fontWeight:400, letterSpacing:-0.6, color:T.black, margin:0, lineHeight:1.1 }}>{title}</h3>
              {blurb && <p style={{ fontFamily:sans, fontSize:"clamp(14px, 1.1vw, 17px)", color:T.mid, margin:"6px 0 0", lineHeight:1.5 }}>{blurb}</p>}
            </div>
            <div className="mos-shelf mos-bleed-pad" style={{ display:"flex", alignItems:"stretch", gap:12, overflowX:"auto", paddingTop:2, paddingBottom:14, scrollSnapType:"x proximity", WebkitOverflowScrolling:"touch" }}>{items.map(bcard(true))}</div>
          </section>
        ));
      })()}
      {rows !== null && !failed && list.length === 0 && <p style={{ fontFamily:sans, fontSize:14, color:T.mid, margin:"20px 0" }}>No brands match that search.</p>}
    </div>
  );
}

// ─── BRANDS TO TRY: houses you have never smelled or sampled and want to ─────
function BrandsToTry({ onOpenBrand }) {
  const [rows, setRows] = useState(null);
  const [q, setQ] = useState("");
  const [res, setRes] = useState([]);
  const [err, setErr] = useState("");
  const load = async () => {
    try { const r = await supabase.from("brand_wishlist").select("id, house_id, name, created_at, houses(slug)").order("created_at", { ascending:false }).limit(500); setRows(r.error ? [] : (r.data || [])); } catch (e) { setRows([]); }
  };
  useEffect(() => { load(); }, []);
  useEffect(() => {
    const t = q.trim();
    if (t.length < 2) { setRes([]); return; }
    let off = false;
    const h = setTimeout(async () => {
      try { const { data } = await supabase.from("houses").select("id, name, slug").ilike("name", "%" + t + "%").order("name").limit(6); if (!off) setRes(data || []); } catch (e) { if (!off) setRes([]); }
    }, 220);
    return () => { off = true; clearTimeout(h); };
  }, [q]);
  async function add(name, houseId) {
    const nm = String(name || "").trim(); if (!nm) return;
    setErr("");
    if ((rows || []).some(r => r.name.toLowerCase() === nm.toLowerCase())) { setQ(""); setRes([]); return; }
    const { error } = await supabase.from("brand_wishlist").insert({ name:nm, house_id:houseId || null });
    if (error) { setErr("That didn't save. Try again in a moment."); return; }
    setQ(""); setRes([]); load();
  }
  async function remove(id) {
    setRows(p => (p || []).filter(r => r.id !== id));
    const { error } = await supabase.from("brand_wishlist").delete().eq("id", id);
    if (error) { setErr("That didn't go through. Try again."); load(); }
  }
  const list = rows || [];
  const typed = q.trim();
  const exact = res.some(h => h.name.toLowerCase() === typed.toLowerCase());
  return (
    <div style={{ background:T.lift, borderRadius:16, border:`1px solid ${T.rule}`, padding:18, margin:"0 0 18px" }}>
      <span style={{ display:"block", fontFamily:serif, fontSize:20, color:T.black }}>Brands to try</span>
      <span style={{ display:"block", fontFamily:sans, fontSize:12, color:T.faint, margin:"2px 0 0" }}>Houses you have never smelled or sampled{list.length ? ` · ${list.length}` : ""}</span>
      {<div style={{ marginTop:14 }}>
        <div style={{ position:"relative" }}>
          <div style={{ display:"flex", gap:8 }}>
          <input value={q} onChange={e => setQ(e.target.value)} onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); const m = res.find(h => h.name.toLowerCase() === typed.toLowerCase()); add(m ? m.name : typed, m && m.id); } }} placeholder="Search for a brand, or type a new one" style={{ ...FIELD, minHeight:44 }}/>
          <button onClick={() => { const m = res.find(h => h.name.toLowerCase() === typed.toLowerCase()); add(m ? m.name : typed, m && m.id); }} disabled={typed.length < 1} aria-label="Add brand" style={{ flexShrink:0, width:48, minHeight:44, borderRadius:12, border:"none", background:typed ? "var(--accent)" : T.white, color:typed ? "#fff" : T.faint, fontSize:24, lineHeight:1, cursor:typed ? "pointer" : "default", ...(typed ? null : { border:`1px solid ${T.rule}` }) }}>+</button>
          </div>
          {typed.length >= 2 && (res.length > 0 || !exact) && <div style={{ marginTop:8, background:T.white, border:`1px solid ${T.rule}`, borderRadius:12, overflow:"hidden" }}>
            {res.map(h => <button key={h.id} onClick={() => add(h.name, h.id)} style={{ display:"block", width:"100%", textAlign:"left", padding:"12px 14px", minHeight:44, background:"none", border:"none", borderBottom:`1px solid ${T.lift}`, fontFamily:sans, fontSize:14, color:T.ink, cursor:"pointer" }}>{h.name}</button>)}
            {!exact && <button onClick={() => add(typed, null)} style={{ display:"block", width:"100%", textAlign:"left", padding:"12px 14px", minHeight:44, background:"none", border:"none", fontFamily:sans, fontSize:14, color:T.mid, cursor:"pointer" }}>Add "{typed}" to my list</button>}
          </div>}
        </div>
        {err && <p role="alert" style={{ fontFamily:sans, fontSize:12, color:T.mid, margin:"8px 0 0" }}>{err}</p>}
        <div style={{ display:"flex", flexWrap:"wrap", gap:7, marginTop:14 }}>
          {rows === null && <span style={{ fontFamily:sans, fontSize:12, color:T.faint }}>Loading</span>}
          {rows !== null && list.length === 0 && <span style={{ fontFamily:sans, fontSize:13, color:T.faint, lineHeight:1.6 }}>Nothing here yet. Add a house you are curious about and come back when you find a sample.</span>}
          {list.map(r => { const slug = r.houses && r.houses.slug; return (
            <span key={r.id} style={{ display:"inline-flex", alignItems:"center", minHeight:38, borderRadius:20, border:`1px solid ${T.rule}`, background:T.white, overflow:"hidden" }}>
              <button onClick={() => slug && onOpenBrand && onOpenBrand({ slug, name:r.name })} style={{ background:"none", border:"none", padding:"0 6px 0 14px", minHeight:38, fontFamily:sans, fontSize:14, color:T.ink, cursor:slug ? "pointer" : "default" }}>{r.name}</button>
              <button onClick={() => remove(r.id)} aria-label={"Remove " + r.name} style={{ background:"none", border:"none", padding:"0 12px 0 6px", minHeight:38, fontSize:14, color:T.faint, cursor:"pointer" }}>✕</button>
            </span>); })}
        </div>
      </div>}
    </div>
  );
}
function BrandWishButton({ house }) {
  const [id, setId] = useState(undefined);
  useEffect(() => {
    let off = false; setId(undefined);
    (async () => { try { const r = await supabase.from("brand_wishlist").select("id").eq("house_id", house.id).limit(1); if (!off) setId(r.error ? null : ((r.data && r.data[0] && r.data[0].id) || null)); } catch (e) { if (!off) setId(null); } })();
    return () => { off = true; };
  }, [house.id]);
  if (id === undefined) return null;
  async function toggle() {
    if (id) { const old = id; setId(null); const { error } = await supabase.from("brand_wishlist").delete().eq("id", old); if (error) setId(old); }
    else { const { data, error } = await supabase.from("brand_wishlist").insert({ name:house.name, house_id:house.id }).select("id").single(); if (!error && data) setId(data.id); }
  }
  return <button onClick={toggle} aria-pressed={!!id} style={{ marginTop:12, minHeight:40, padding:"0 18px", borderRadius:20, border:`1px solid ${id ? "transparent" : T.rule}`, background:id ? "var(--accent)" : T.white, color:id ? "#fff" : T.ink, fontFamily:sans, fontSize:14, fontWeight:id ? 600 : 500, cursor:"pointer" }}>{id ? "On your brands to try ✓" : "Want to try this brand"}</button>;
}

function BrandModal({ brand, onClose, onBack, onOpenFrag }) {
  const PAGE = 24;
  const [house, setHouse] = useState(undefined);
  const [frags, setFrags] = useState([]);
  const [total, setTotal] = useState(0);
  const [busy, setBusy] = useState(false);
  const [stores, setStores] = useState([]);
  useEffect(() => {
    let off = false;
    setHouse(undefined); setFrags([]); setTotal(0); setStores([]);
    (async () => {
      try {
        let h = null;
        if (brand.slug) { const r = await supabase.from("houses").select("*").eq("slug", brand.slug).maybeSingle(); h = r.data; }
        if (!h && brand.name) { const r = await supabase.from("houses").select("*").ilike("name", brand.name).limit(1); h = r.data && r.data[0]; }
        if (off) return;
        if (!h) { setHouse(null); return; }
        setHouse(h);
        trackEvent("brand_view", { houseSlug: h.slug, source: "brand", dedupeMs: 1800000 });
        const r = await fetchFragRows(sel => supabase.from("fragrances").select(sel, { count: "exact" }).eq("house_id", h.id).order("sort_order", { ascending: true, nullsFirst: false }).order("slug", { ascending: true }).range(0, PAGE - 1));
        if (off) return;
        if (!r.error && r.data) { const m = r.data.map(mapFrag); if (fragSink.fn) fragSink.fn(m); setFrags(m); setTotal(r.count != null ? r.count : m.length); }
        const s = await supabase.from("stores").select("id, name, city, country, address, website, category").ilike("house", h.name).limit(30);
        if (!off && !s.error && s.data) setStores(s.data);
      } catch (e) { if (!off) setHouse(null); }
    })();
    return () => { off = true; };
  }, [brand.slug, brand.name]);
  async function more() {
    if (!house) return;
    setBusy(true);
    try {
      const from = frags.length;
      const r = await fetchFragRows(sel => supabase.from("fragrances").select(sel).eq("house_id", house.id).order("sort_order", { ascending: true, nullsFirst: false }).order("slug", { ascending: true }).range(from, from + PAGE - 1));
      if (!r.error && r.data) { const m = r.data.map(mapFrag); if (fragSink.fn) fragSink.fn(m); setFrags(p => [...p, ...m]); }
    } catch (e) {}
    setBusy(false);
  }
  const h = house || {};
  const own = ownershipOf(h);
  const site = safeUrl(h.website);
  const facts = [
    ["Country", h.country],
    ["Ownership", h.ownership ? (h.ownership === "Independent" ? "Independent" : `Owned by ${h.ownership}`) : ""],
    ["Brand type", brandOriginLabel(h)],
    ["Price tier", h.price_tier],
    ["Diversity", cleanDiversity(h.diversity)],
    ["Woman-owned", isWomanOwned(h.diversity) ? "Yes" : ""],
  ].filter(f => f[1]);
  const lines = [...new Set(frags.map(f => f.line).filter(Boolean))];
  const mapsUrl = s => "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent([s.name, s.address].filter(Boolean).join(" "));
  return (
    <div className="mos-sheet-wrap" onClick={onClose} style={{ position:"fixed", inset:0, zIndex:48, background:T.scrim, backdropFilter:"blur(16px)", display:"flex", flexDirection:"column", justifyContent:"flex-end", alignItems:"center" }}>
      <div className="mos-sheet" onClick={e => e.stopPropagation()} style={{ background:T.white, borderRadius:"24px 24px 0 0", border:`1px solid ${T.rule}`, borderBottom:"none", width:"100%", maxWidth:460, maxHeight:"93vh", overflowY:"auto" }}>
        <div className="mos-pad" style={{ position:"relative", padding:"34px 24px 30px", borderBottom:`1px solid ${T.rule}`, background:T.lift }}>
          <button className="mos-close" onClick={onClose} aria-label="Close" style={{ position:"absolute", top:16, right:16, width:34, height:34, borderRadius:"50%", border:`1px solid ${T.rule}`, background:T.white, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, color:T.mid, zIndex:2 }}>✕</button>
          <BackBtn onBack={onBack||onClose}/>
          <p style={{ fontFamily:sans, fontSize:10, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.18em", color:T.accent, margin:"0 0 8px" }}>Brand</p>
          <h2 style={{ fontFamily:serif, fontSize:"clamp(36px, 4.4vw, 64px)", color:T.black, margin:"0 0 10px", letterSpacing:-1, fontWeight:400, lineHeight:1.05, paddingRight:44 }}>{house === undefined ? (brand.name || "Loading") : (h.name || brand.name || "Brand")}</h2>
          {house && (
            <>
              <div style={{ display:"flex", alignItems:"center", flexWrap:"wrap", gap:"6px 12px" }}><BrandTypePill type={h.brand_origin}/><span style={{ fontFamily:sans, fontSize:"clamp(14px, 1.1vw, 17px)", color:T.mid }}>{[h.country, h.price_tier].filter(Boolean).join(" · ")}</span></div>
              <div style={{ margin:"6px 0 0" }}>{own && <OwnershipBadge ownership={own} size="large"/>}</div>
              <BrandWishButton house={h}/>
              {(cleanDiversity(h.diversity) || isWomanOwned(h.diversity)) && <p style={{ fontFamily:sans, fontSize:"clamp(14px, 1.1vw, 17px)", color:T.mid, margin:"8px 0 0", display:"flex", flexWrap:"wrap", alignItems:"baseline", gap:"2px 12px" }}>{cleanDiversity(h.diversity) && <span>Diversity <strong style={{ color:T.tangerine, fontWeight:600 }}>{cleanDiversity(h.diversity)}</strong></span>}{isWomanOwned(h.diversity) && <strong style={{ color:"var(--orchid)", fontWeight:600 }}>Woman-owned</strong>}</p>}
              {site && <a href={site} target="_blank" rel="noopener noreferrer" onClick={() => trackEvent("brand_site_click", { houseSlug: h.slug, source: "brand" })} style={{ display:"inline-flex", alignItems:"center", gap:6, margin:"12px 0 0", padding:"6px 14px", minHeight:34, boxSizing:"border-box", borderRadius:20, border:`1px solid ${T.rule}`, background:T.white, fontFamily:sans, fontSize:13, color:T.ink, textDecoration:"none" }}>Brand website<ExtArrow size={11}/></a>}
            </>
          )}
        </div>
        <div className="mos-pad" style={{ padding:"24px 24px 64px" }}>
          {house === undefined && <p style={{ fontFamily:sans, fontSize:13, color:T.mid }}>Loading</p>}
          {house === null && <p style={{ fontFamily:sans, fontSize:14, color:T.mid, lineHeight:1.6 }}>We could not find this brand. If something is missing, use Suggest to tell us.</p>}
          {house && (
            <>
              {facts.length > 0 && (
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(150px, 1fr))", gap:"22px 28px", paddingBottom:30, marginBottom:30, borderBottom:`1px solid ${T.rule}` }}>
                  {facts.map(f => (
                    <div key={f[0]}>
                      <p style={{ fontFamily:sans, fontSize:10, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.16em", color:T.mid, margin:"0 0 6px" }}>{f[0]}</p>
                      <p style={{ fontFamily:serif, fontSize:"clamp(20px, 1.8vw, 26px)", color:T.black, margin:0, lineHeight:1.2, letterSpacing:-0.3 }}>{f[1]}</p>
                    </div>
                  ))}
                </div>
              )}
              {h.about && String(h.about).trim() && (
                <div style={{ marginBottom:30 }}>
                  <h3 style={{ fontFamily:serif, fontSize:"clamp(26px, 2.3vw, 38px)", fontWeight:400, letterSpacing:-0.6, color:T.black, margin:"0 0 16px", lineHeight:1.1 }}>About</h3>
                  {String(h.about).split(/\n\s*\n/).map((p, i) => <p key={i} style={{ fontFamily:sans, fontSize:"clamp(15px, 1.15vw, 17px)", color:T.mid, lineHeight:1.7, margin:"0 0 14px" }}>{p}</p>)}
                </div>
              )}
              {lines.length > 0 && (
                <div style={{ marginBottom:30 }}>
                  <h3 style={{ fontFamily:serif, fontSize:"clamp(26px, 2.3vw, 38px)", fontWeight:400, letterSpacing:-0.6, color:T.black, margin:"0 0 16px", lineHeight:1.1 }}>Lines</h3>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:10 }}>{lines.map(l => <span key={l} style={{ fontFamily:sans, fontSize:14, padding:"0 18px", minHeight:40, display:"inline-flex", alignItems:"center", borderRadius:20, background:T.white, border:`1px solid ${T.rule}`, color:T.ink }}>{l}</span>)}</div>
                </div>
              )}
              <h3 style={{ fontFamily:serif, fontSize:"clamp(26px, 2.3vw, 38px)", fontWeight:400, letterSpacing:-0.6, color:T.black, margin:"0 0 16px", lineHeight:1.1 }}>{"Fragrances"}{total ? <span style={{ fontFamily:sans, fontSize:15, color:T.mid, letterSpacing:0, marginLeft:10 }}>{total}</span> : null}</h3>
                            {frags.length === 0 && <p style={{ fontFamily:sans, fontSize:13, color:T.mid, margin:"0 0 24px" }}>No fragrances from this house are listed yet.</p>}
              <div className="mos-brandgrid" style={{ marginBottom:20 }}>
                {frags.map(f => {
                  const ini = f.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
                  return (
                    <button key={f.id} onClick={() => onOpenFrag(f.id)} aria-label={`${f.name} by ${f.house}`} style={{ padding:0, border:"none", background:"none", cursor:"pointer", textAlign:"left", fontFamily:sans }}>
                      <span style={{ display:"block", position:"relative", width:"100%", aspectRatio:"0.8", borderRadius:12, overflow:"hidden", background:T.white, border:`1px solid ${T.rule}` }}>
                        {f.image ? <img src={f.image} alt="" loading="lazy" style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"contain", padding:"8%" }}/> : <span style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:serif, fontSize:46, letterSpacing:-1, color:T.faint }}>{ini}</span>}
                      </span>
                      <span style={{ display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden", marginTop:10, fontFamily:serif, fontSize:17, lineHeight:1.2, letterSpacing:-0.2, color:T.black }}>{f.name}</span>
                      <span style={{ display:"block", marginTop:3, fontSize:12, color:T.mid }}>{[f.year, f.concentration].filter(Boolean).join(" · ")}</span>
                    </button>
                  );
                })}
              </div>
              {frags.length < total && <div style={{ textAlign:"center", margin:"6px 0 28px" }}><button onClick={more} disabled={busy} style={{ fontFamily:sans, fontSize:14, minHeight:46, padding:"0 28px", borderRadius:23, border:`1px solid ${T.rule}`, background:T.white, color:T.ink, cursor:"pointer", opacity:busy?0.6:1 }}>{busy ? "Loading" : `Show more (${total - frags.length} left)`}</button></div>}
              {stores.length > 0 && (
                <div style={{ marginTop:44 }}>
                  <h3 style={{ fontFamily:serif, fontSize:"clamp(26px, 2.3vw, 38px)", fontWeight:400, letterSpacing:-0.6, color:T.black, margin:"0 0 16px", lineHeight:1.1 }}>Where to smell it in person</h3>
                  <div className="mos-samples">
                    {stores.map(s => { const w = safeUrl(s.website); return (
                      <div key={s.id} style={{ border:`1px solid ${T.rule}`, borderRadius:12, padding:"14px 16px", background:T.white }}>
                        <p style={{ fontFamily:serif, fontSize:16, color:T.black, margin:0, lineHeight:1.25 }}>{s.name}</p>
                        <p style={{ fontFamily:sans, fontSize:12, color:T.mid, margin:"4px 0 0" }}>{[s.city, s.country].filter(Boolean).join(", ")}</p>
                        <div style={{ display:"flex", gap:16, marginTop:10 }}>
                          {w && <a href={w} target="_blank" rel="noopener noreferrer" style={{ fontFamily:sans, fontSize:13, color:T.ink, textDecoration:"none", display:"inline-flex", alignItems:"center", gap:5, minHeight:32 }}>Website<ExtArrow size={11}/></a>}
                          <a href={mapsUrl(s)} target="_blank" rel="noopener noreferrer" style={{ fontFamily:sans, fontSize:13, color:T.ink, textDecoration:"none", display:"inline-flex", alignItems:"center", gap:5, minHeight:32 }}>Map<ExtArrow size={11}/></a>
                        </div>
                      </div>
                    ); })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── PERFUMERS ────────────────────────────────────────────────────────────────
const PERFUMERS = {
  ...MORE_PERFUMERS,
  "Olivier Creed & Erwin Creed": { bio: "Olivier Creed built the house's modern reputation across five decades of bespoke commissions before handing creative leadership to his son Erwin. Aventus, created together in 2010, remains one of the most studied and imitated fragrances of the century. The Creeds have always worked with a deliberately closed process, raw materials sourced personally, formulas held privately.", nationality: "French / British", active: "1969 – present" },
  "David Apel": { bio: "David Apel is an American perfumer at Symrise whose work spans commercial and niche commissions. Black Orchid remains his most discussed creation, a fragrance built around an accord that doesn't exist in nature. He has spoken about the brief asking for something 'opulent and dark without being heavy.'", nationality: "American", active: "1990s – present" },
  "Pierre Negrin": { bio: "Pierre Negrin is a French perfumer who spent much of his career at Givaudan before moving to independent work. Oud Wood was an early commission that helped define what a Western interpretation of oud could be, restrained, papyrus-tinged, and accessible without being diluted.", nationality: "French", active: "1990s – present" },
  "Francis Kurkdjian": { bio: "Francis Kurkdjian graduated from ISIPCA in 1992 and spent his early career creating some of the most commercially successful fragrances of the era, including Jean Paul Gaultier's Le Mâle. He founded Maison Francis Kurkdjian in 2009 with business partner Marc Chaya. His work is characterised by technical precision and an unusual ability to make complex accords smell simple. LVMH acquired the house in 2017.", nationality: "French / Armenian", active: "1992 – present" },
  "Frank Voelkl": { bio: "Frank Voelkl is a German perfumer at Firmenich known for a restrained, materials-focused approach. Santal 33 was created for Le Labo's New York-specific city exclusive before being added to the permanent line. The papyrus and cardamom accord he built around the sandalwood has become one of the most recognised in contemporary perfumery, and one of the most debated.", nationality: "German", active: "1990s – present" },
  "Josh Meyer": { bio: "Josh Meyer is a self-taught perfumer and founder of Imaginary Authors based in Portland, Oregon. Every fragrance in the line is named after a fictional book and accompanied by a back-cover blurb. His approach is literary and instinctive, materials chosen for narrative resonance rather than technical convention. He built the brand entirely independently and continues to run it without outside investment.", nationality: "American", active: "2011 – present" },
};


// ─── PERFUMERS: directory + full-page perfumer card ──────────────────────────
const NAME_SMALL = new Set(["de","del","della","di","da","du","la","le","van","von","der","den","dos","el","al","bin","ibn"]);
function titleCaseName(s) {
  return String(s || "").toLowerCase().replace(/(^|[\s(\-'\u2019\/&,])([a-z\u00e0-\u00ff])([a-z\u00e0-\u00ff]*)/g, (m, pre, a, rest, off) => {
    const w = a + rest;
    if (pre !== "" && /\s/.test(pre) && NAME_SMALL.has(w) && off > 0) return pre + w;
    return pre + a.toUpperCase() + rest;
  }).replace(/\bMc([a-z])/g, (m, c) => "Mc" + c.toUpperCase());
}
function splitPerfumers(s) {
  return String(s || "").split(/\s*(?:,|&|\/|;|\sand\s|\swith\s)\s*/i).map(x => x.trim()).filter(x => x.length > 2 && !/^(unknown|n\/a|na|various|none|anonymous)$/i.test(x));
}
async function loadPerfumers() {
  const r = await rpcAll("perfumers_list");
  if (!r.error && r.data) {
    // Capitalise names and merge rows that differ only by case ("david apel" + "David Apel")
    const m = new Map();
    r.data.forEach(x => {
      const name = titleCaseName(x.name), k = name.toLowerCase();
      const o = m.get(k);
      if (!o) m.set(k, { ...x, name });
      else { o.frag_count = (Number(o.frag_count) || 0) + (Number(x.frag_count) || 0); o.house_count = Math.max(Number(o.house_count) || 0, Number(x.house_count) || 0); }
    });
    return [...m.values()];
  }
  return Object.keys(PERFUMERS).map(n => ({ name: n, frag_count: null, house_count: null }));
}
let perfumerPhotoMap = null, perfumerPhotoLoad = null;
function loadPerfumerPhotos() {
  if (perfumerPhotoMap) return Promise.resolve(perfumerPhotoMap);
  if (!perfumerPhotoLoad) perfumerPhotoLoad = Promise.resolve(supabase.from("perfumer_photos").select("name, image_url")).then(r => {
    const m = {};
    if (!r.error && r.data) r.data.forEach(x => { m[String(x.name).toLowerCase()] = x.image_url; });
    perfumerPhotoMap = m; return m;
  }).catch(() => { perfumerPhotoLoad = null; return {}; });
  return perfumerPhotoLoad;
}
function PerfumerPortrait({ name, photo: photoProp, size = 150 }) {
  const [pm, setPm] = useState(perfumerPhotoMap);
  useEffect(() => { if (!photoProp && !pm) { let off = false; loadPerfumerPhotos().then(m => { if (!off) setPm(m); }); return () => { off = true; }; } }, [photoProp, pm]);
  const photo = photoProp || (pm && pm[String(name).toLowerCase()]) || "";
  const ini = String(name).split(/\s+/).map(w => w[0]).join("").slice(0, 2).toUpperCase();
  const hue = hueFor(name);
  return photo
    ? <img src={photo} alt={name} style={{ width:size, height:size, borderRadius:"50%", objectFit:"cover", objectPosition:"50% 22%", flexShrink:0 }}/>
    : <span style={{ width:size, height:size, borderRadius:"50%", flexShrink:0, background:`var(--tint-${hue})`, color:`var(--${hue})`, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:serif, fontSize:size*0.34, letterSpacing:-1 }}>{ini}</span>;
}
function lastWord(n) { const w = String(n).trim().split(/\s+/); return w[w.length - 1] || n; }

function PerfumerShelf({ onOpenPerfumer, tinted }) {
  const [pm, setPm] = useState(perfumerPhotoMap);
  useEffect(() => { if (!pm) { let off = false; loadPerfumerPhotos().then(m => { if (!off) setPm(m); }); return () => { off = true; }; } }, [pm]);
  const list = Object.keys(pm || {}).sort((a, b) => lastWord(a).localeCompare(lastWord(b)));
  if (list.length < 2) return null;
  return (
    <section className={"mos-bleed" + (tinted ? " mos-band" : "")} style={{ padding:"26px 0 22px" }}>
      <div className="mos-bleed-pad" style={{ marginBottom:16 }}>
        <h3 style={{ fontFamily:serif, fontSize:"clamp(26px, 2.3vw, 38px)", fontWeight:400, letterSpacing:-0.6, color:T.black, margin:0, lineHeight:1.1 }}>Meet the perfumers</h3>
        <p style={{ fontFamily:sans, fontSize:"clamp(14px, 1.1vw, 17px)", color:T.mid, margin:"6px 0 0", lineHeight:1.5 }}>The noses behind the bottles. Tap one to see everything they have made.</p>
      </div>
      <div className="mos-shelf mos-bleed-pad" style={{ display:"flex", alignItems:"flex-start", gap:22, overflowX:"auto", paddingTop:2, paddingBottom:14, WebkitOverflowScrolling:"touch" }}>
        {list.map(k => {
          const nm = titleCaseName(k);
          return (
            <button key={k} onClick={() => onOpenPerfumer && onOpenPerfumer(nm)} style={{ flexShrink:0, width:132, background:"none", border:"none", padding:0, cursor:"pointer", textAlign:"center", fontFamily:sans }}>
              <PerfumerPortrait name={nm} photo={pm[k]} size={132}/>
              <span style={{ display:"block", marginTop:10, fontFamily:serif, fontSize:16, lineHeight:1.2, color:T.black }}>{nm}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function PerfumersDirectory({ onOpenPerfumer }) {
  const [rows, setRows] = useState(null);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("az");
  useEffect(() => {
    let off = false;
    loadPerfumers().then(d => { if (!off) setRows(d); }).catch(() => { if (!off) setRows([]); });
    return () => { off = true; };
  }, []);
  const needle = q.trim().toLowerCase();
  const pool = (rows || []).filter(r => Number(r.frag_count) >= 3).sort((a, b) => a.name.localeCompare(b.name));
  const spot = pool.length ? pool[Math.floor((Date.now() - new Date().getTimezoneOffset() * 60000) / 86400000) % pool.length] : null;
  let list = (rows || []).filter(r => !needle || String(r.name).toLowerCase().includes(needle));
  list = [...list].sort(sort === "most" ? (a, b) => (Number(b.frag_count) || 0) - (Number(a.frag_count) || 0) || a.name.localeCompare(b.name) : (a, b) => lastWord(a.name).localeCompare(lastWord(b.name)) || a.name.localeCompare(b.name));
  const groups = {};
  if (sort === "az") list.forEach(r => { const L = (lastWord(r.name)[0] || "#").toUpperCase(); const k = /[A-Z]/.test(L) ? L : "#"; (groups[k] = groups[k] || []).push(r); });
  const keys = sort === "az" ? Object.keys(groups).sort((a, b) => a === "#" ? 1 : b === "#" ? -1 : a.localeCompare(b)) : ["all"];
  if (sort !== "az") groups.all = list.slice(0, 200);
  const chip = (on, label, fn) => (
    <button key={label} onClick={fn} aria-pressed={on} style={{ fontFamily:sans, fontSize:14, fontWeight:on?600:500, padding:"0 20px", minHeight:42, borderRadius:22, whiteSpace:"nowrap", border:`1px solid ${on?T.black:T.rule}`, background:on?T.black:T.white, color:on?T.white:T.ink, cursor:"pointer", flexShrink:0 }}>{label}</button>
  );
  const card = r => (
    <button key={r.name} onClick={() => onOpenPerfumer(r.name)} style={{ flex:"0 0 132px", width:132, background:"none", border:"none", padding:0, cursor:"pointer", textAlign:"center", fontFamily:sans, scrollSnapAlign:"start" }}>
      <PerfumerPortrait name={r.name} photo={PERFUMERS[r.name] && PERFUMERS[r.name].photo} size={132}/>
      <span style={{ display:"block", marginTop:10, fontFamily:serif, fontSize:16, lineHeight:1.2, color:T.black }}>{r.name}</span>
      {r.frag_count != null && <span style={{ display:"block", fontSize:12, color:T.mid, margin:"4px 0 0" }}>{r.frag_count} {Number(r.frag_count) === 1 ? "fragrance" : "fragrances"}</span>}
    </button>
  );
  return (
    <div>
      <div style={{ position:"relative", marginBottom:10, maxWidth:760 }}>
        <span style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }}><Icon name="search" size={15} color={T.faint}/></span>
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search perfumers by name" style={{ width:"100%", background:T.white, border:`1.5px solid ${q?T.accent:T.rule}`, borderRadius:14, padding:"14px 16px 14px 44px", fontSize:14, color:T.black, outline:"none", boxSizing:"border-box", fontFamily:serif }}/>
      </div>
      {rows === null && <p style={{ fontFamily:sans, fontSize:13, color:T.mid }}>Loading</p>}
      {spot && !needle && (
        <button onClick={() => onOpenPerfumer(spot.name)} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:20, width:"100%", textAlign:"left", cursor:"pointer", background:T.lift, border:`1px solid ${T.rule}`, borderRadius:18, padding:"22px 22px", margin:"4px 0 22px", fontFamily:sans }}>
          <span style={{ minWidth:0 }}>
            <span style={{ display:"block", fontSize:10, fontWeight:600, letterSpacing:"0.18em", textTransform:"uppercase", color:T.accent, marginBottom:10 }}>Perfumer spotlight</span>
            <span style={{ display:"block", fontFamily:serif, fontSize:"clamp(32px, 4.4vw, 60px)", letterSpacing:-1, lineHeight:1, color:T.black }}>{spot.name}</span>
            <span style={{ display:"block", fontSize:13, color:T.mid, margin:"12px 0 0" }}>{spot.frag_count} fragrances{spot.house_count != null ? ` across ${spot.house_count} ${Number(spot.house_count) === 1 ? "house" : "houses"}` : ""} &rsaquo;</span>
          </span>
          <PerfumerPortrait name={spot.name} photo={PERFUMERS[spot.name] && PERFUMERS[spot.name].photo} size={110}/>
        </button>
      )}
      {rows !== null && !needle && (
        <div>
          {[["Most fragrances", "The noses with the biggest bodies of work in the library.", [...(rows || [])].filter(r => Number(r.frag_count) > 0).sort((a, b) => (Number(b.frag_count) || 0) - (Number(a.frag_count) || 0) || a.name.localeCompare(b.name)).slice(0, 24)],
            ...keys.map(k => ["Perfumers " + k, null, groups[k] || []])].map(([title, blurb, items], i) => items.length > 0 && (
            <section key={title} className={"mos-bleed" + (i % 2 === 0 ? " mos-band" : "")} style={{ padding:"26px 0 22px" }}>
              <div className="mos-bleed-pad" style={{ marginBottom:16 }}>
                <h3 style={{ fontFamily:serif, fontSize:"clamp(26px, 2.3vw, 38px)", fontWeight:400, letterSpacing:-0.6, color:T.black, margin:0, lineHeight:1.1 }}>{title}</h3>
                {blurb && <p style={{ fontFamily:sans, fontSize:"clamp(14px, 1.1vw, 17px)", color:T.mid, margin:"6px 0 0", lineHeight:1.5 }}>{blurb}</p>}
              </div>
              <div className="mos-shelf mos-bleed-pad" style={{ display:"flex", alignItems:"flex-start", gap:22, overflowX:"auto", paddingTop:2, paddingBottom:14, scrollSnapType:"x proximity", WebkitOverflowScrolling:"touch" }}>{items.map(card)}</div>
            </section>
          ))}
        </div>
      )}
      {rows !== null && needle && <p style={{ fontFamily:sans, fontSize:12, color:T.mid, margin:"0 0 6px" }}>{list.length} {list.length === 1 ? "perfumer" : "perfumers"}</p>}
      {needle && keys.map(k => (
        <section key={k} style={{ borderTop:`1px solid ${T.rule}`, padding:"18px 0 8px" }}>
          {k !== "all" && <h3 style={{ fontFamily:serif, fontSize:26, fontWeight:400, color:T.black, margin:"0 0 12px" }}>{k}</h3>}
          <div style={{ display:"flex", flexWrap:"wrap", gap:"22px 22px" }}>{(groups[k] || []).map(card)}</div>
        </section>
      ))}
      {rows !== null && list.length === 0 && <p style={{ fontFamily:sans, fontSize:14, color:T.mid, margin:"20px 0" }}>No perfumers match that search. Run 08_perfumers.sql if the list is empty.</p>}
    </div>
  );
}

function PerfumerPage({ name, onClose, onBack, onOpenFrag, onOpenBrand }) {
  const PAGE = 24;
  const info = PERFUMERS[name];
  const [frags, setFrags] = useState(null);
  const [total, setTotal] = useState(0);
  const [houses, setHouses] = useState([]);
  const [busy, setBusy] = useState(false);
  const pat = "%" + String(name).replace(/[%_]/g, " ") + "%";
  const exact = f => splitPerfumers(f.perfumer).some(n => n.toLowerCase() === String(name).toLowerCase());
  useEffect(() => {
    let off = false;
    setFrags(null); setTotal(0); setHouses([]);
    (async () => {
      try {
        const r = await fetchFragRows(sel => supabase.from("fragrances").select(sel, { count: "exact" }).ilike("perfumer", pat).order("year", { ascending: false, nullsFirst: false }).order("slug", { ascending: true }).range(0, PAGE - 1));
        if (off) return;
        if (r.error || !r.data) { setFrags([]); return; }
        const m = r.data.map(mapFrag).filter(exact);
        if (fragSink.fn) fragSink.fn(m);
        setFrags(m); setTotal(r.count != null ? r.count : m.length);
        const h = await supabase.from("fragrances").select("perfumer, house:houses ( name, slug )").ilike("perfumer", pat).limit(2000);
        if (!off && !h.error && h.data) {
          const seen = new Map();
          h.data.filter(exact).forEach(x => { if (x.house && x.house.slug && !seen.has(x.house.slug)) seen.set(x.house.slug, x.house.name); });
          setHouses([...seen].map(([slug, n]) => ({ slug, name: n })).sort((a, b) => a.name.localeCompare(b.name)));
        }
      } catch (e) { if (!off) setFrags([]); }
    })();
    return () => { off = true; };
  }, [name]);
  async function more() {
    setBusy(true);
    try {
      const from = (frags || []).length;
      const r = await fetchFragRows(sel => supabase.from("fragrances").select(sel).ilike("perfumer", pat).order("year", { ascending: false, nullsFirst: false }).order("slug", { ascending: true }).range(from, from + PAGE - 1));
      if (!r.error && r.data) { const m = r.data.map(mapFrag).filter(exact); if (fragSink.fn) fragSink.fn(m); setFrags(p => [...(p || []), ...m]); }
    } catch (e) {}
    setBusy(false);
  }
  const list = frags || [];
  const years = list.map(f => Number(f.year)).filter(y => y > 0);
  const facts = [
    ["Fragrances", total || (frags ? list.length : "")],
    ["Houses", houses.length || ""],
    ["Nationality", info && info.nationality],
    ["Active", info && info.active],
    ["Latest release", years.length ? Math.max(...years) : ""],
  ].filter(f => f[1] !== "" && f[1] != null);
  const h2 = { fontFamily:serif, fontSize:"clamp(26px, 2.3vw, 38px)", fontWeight:400, letterSpacing:-0.6, color:T.black, margin:"0 0 16px", lineHeight:1.1 };
  return (
    <div className="mos-sheet-wrap" onClick={onClose} style={{ position:"fixed", inset:0, zIndex:48, background:T.scrim, backdropFilter:"blur(16px)", display:"flex", flexDirection:"column", justifyContent:"flex-end", alignItems:"center" }}>
      <div className="mos-sheet" onClick={e => e.stopPropagation()} style={{ background:T.white, borderRadius:"24px 24px 0 0", border:`1px solid ${T.rule}`, borderBottom:"none", width:"100%", maxWidth:460, maxHeight:"93vh", overflowY:"auto" }}>
        <div className="mos-pad" style={{ position:"relative", padding:"26px 24px 22px", borderBottom:`1px solid ${T.rule}`, background:T.lift }}>
          <button className="mos-close" onClick={onClose} aria-label="Close" style={{ position:"absolute", top:16, right:16, width:34, height:34, borderRadius:"50%", border:`1px solid ${T.rule}`, background:T.white, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, color:T.mid, zIndex:2 }}>✕</button>
          <BackBtn onBack={onBack||onClose}/>
          <p style={{ fontFamily:sans, fontSize:10, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.18em", color:T.accent, margin:"0 0 14px" }}>Perfumer</p>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:20, paddingRight:44 }}>
            <h2 style={{ fontFamily:serif, fontSize:"clamp(40px, 6vw, 84px)", color:T.black, margin:0, letterSpacing:-1.5, fontWeight:400, lineHeight:0.98, minWidth:0, overflowWrap:"anywhere" }}>{name}</h2>
            <span className="mos-portrait"><PerfumerPortrait name={name} photo={info && info.photo} size={150}/></span>
          </div>
          {info && info.nationality && <p style={{ fontFamily:sans, fontSize:"clamp(14px, 1.1vw, 17px)", color:T.mid, margin:"16px 0 0" }}>{[info.nationality, info.active].filter(Boolean).join(" · ")}</p>}
        </div>
        <div className="mos-pad" style={{ padding:"24px 24px 64px" }}>
          {info && info.bio && <p style={{ fontFamily:sans, fontSize:"clamp(14px, 1.1vw, 17px)", color:T.mid, lineHeight:1.75, margin:"0 0 30px", maxWidth:760 }}>{info.bio}</p>}
          {!(info && info.bio) && <p style={{ fontFamily:sans, fontSize:14, color:T.faint, lineHeight:1.7, margin:"0 0 30px", maxWidth:620 }}>No biography on file for this perfumer yet. If you know their work well, use Suggest to contribute.</p>}
          {facts.length > 0 && (
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(150px, 1fr))", gap:"22px 28px", paddingBottom:30, marginBottom:30, borderBottom:`1px solid ${T.rule}` }}>
              {facts.map(f => (
                <div key={f[0]}>
                  <p style={{ fontFamily:sans, fontSize:10, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.16em", color:T.mid, margin:"0 0 6px" }}>{f[0]}</p>
                  <p style={{ fontFamily:serif, fontSize:"clamp(20px, 1.8vw, 26px)", color:T.black, margin:0, lineHeight:1.2, letterSpacing:-0.3 }}>{f[1]}</p>
                </div>
              ))}
            </div>
          )}
          {houses.length > 0 && (
            <div style={{ marginBottom:34 }}>
              <h3 style={h2}>Houses worked with</h3>
              <div style={{ display:"flex", flexWrap:"wrap", gap:10 }}>
                {houses.map(h => <button key={h.slug} onClick={() => onOpenBrand({ slug: h.slug, name: h.name })} style={{ fontFamily:sans, fontSize:14, padding:"0 18px", minHeight:40, borderRadius:20, background:T.white, border:`1px solid ${T.rule}`, color:T.ink, cursor:"pointer" }}>{h.name}</button>)}
              </div>
            </div>
          )}
          <h3 style={h2}>Fragrances{total ? <span style={{ fontFamily:sans, fontSize:15, color:T.mid, letterSpacing:0, marginLeft:10 }}>{total}</span> : null}</h3>
          {frags === null && <p style={{ fontFamily:sans, fontSize:13, color:T.mid }}>Loading</p>}
          {frags !== null && list.length === 0 && <p style={{ fontFamily:sans, fontSize:14, color:T.mid }}>No fragrances by this perfumer are in the library yet.</p>}
          <div className="mos-brandgrid" style={{ marginBottom:20 }}>
            {list.map(f => {
              const ini = f.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
              return (
                <button key={f.id} onClick={() => onOpenFrag(f.id)} aria-label={`${f.name} by ${f.house}`} style={{ padding:0, border:"none", background:"none", cursor:"pointer", textAlign:"left", fontFamily:sans }}>
                  <span style={{ display:"block", position:"relative", width:"100%", aspectRatio:"0.8", borderRadius:12, overflow:"hidden", background:T.white, border:`1px solid ${T.rule}` }}>
                    {f.image ? <img src={f.image} alt="" loading="lazy" style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"contain", padding:"8%" }}/> : <span style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:serif, fontSize:46, letterSpacing:-1, color:T.faint }}>{ini}</span>}
                  </span>
                  <span style={{ display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden", marginTop:10, fontFamily:serif, fontSize:17, lineHeight:1.2, letterSpacing:-0.2, color:T.black }}>{f.name}</span>
                  <span style={{ display:"block", marginTop:3, fontSize:12, color:T.mid, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{[f.house, f.year].filter(Boolean).join(" · ")}</span>
                </button>
              );
            })}
          </div>
          {list.length < total && <div style={{ textAlign:"center", margin:"6px 0 28px" }}><button onClick={more} disabled={busy} style={{ fontFamily:sans, fontSize:14, minHeight:46, padding:"0 28px", borderRadius:23, border:`1px solid ${T.rule}`, background:T.white, color:T.ink, cursor:"pointer", opacity:busy?0.6:1 }}>{busy ? "Loading" : `Show more (${total - list.length} left)`}</button></div>}
        </div>
      </div>
    </div>
  );
}

function PerfumerModal({ name, onClose }) {
  const info = PERFUMERS[name];
  const fragrances = FRAGRANCES.filter(f => f.perfumer === name);
  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, zIndex:70, background:"rgba(10,10,10,0.5)", backdropFilter:"blur(12px)", display:"flex", flexDirection:"column", justifyContent:"flex-end", alignItems:"center" }}>
      <div onClick={e => e.stopPropagation()} style={{ background:T.white, borderRadius:"24px 24px 0 0", border:`1px solid ${T.rule}`, borderBottom:"none", width:"100%", maxWidth:460, maxHeight:"88vh", overflowY:"auto" }}>
        <div style={{ position:"sticky", top:0, background:T.white, borderBottom:`1px solid ${T.rule}`, padding:"20px 24px 16px", display:"flex", alignItems:"flex-start", justifyContent:"space-between" }}>
          <div>
            <p style={{ fontFamily:sans, fontSize:9, textTransform:"uppercase", letterSpacing:"0.12em", color:T.faint, margin:"0 0 3px" }}>Perfumer</p>
            <h2 style={{ fontFamily:serif, fontSize:24, color:T.black, margin:0, letterSpacing:-0.3 }}>{name}</h2>
            {info && <p style={{ fontFamily:sans, fontSize:11, color:T.faint, margin:"4px 0 0" }}>{info.nationality} · {info.active}</p>}
          </div>
          <button onClick={onClose} style={{ width:30, height:30, borderRadius:"50%", border:`1px solid ${T.rule}`, background:T.white, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, color:T.mid, flexShrink:0 }}>✕</button>
        </div>
        <div style={{ padding:"20px 24px 48px" }}>
          {info?.bio
            ? <p style={{ fontFamily:sans, fontSize:13, color:T.mid, lineHeight:1.8, margin:"0 0 28px" }}>{info.bio}</p>
            : <p style={{ fontFamily:sans, fontSize:13, color:T.faint, lineHeight:1.7, margin:"0 0 28px" }}>No biography on file for this perfumer yet. If you know this work well, use the Suggest feature to contribute.</p>
          }
          {fragrances.length > 0 && (
            <>
              <p style={{ fontFamily:sans, fontSize:9, textTransform:"uppercase", letterSpacing:"0.12em", color:T.mid, margin:"0 0 12px" }}>In the Memoir on Skin database, {fragrances.length}</p>
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {fragrances.map(f => (
                  <div key={f.id} style={{ display:"flex", alignItems:"center", gap:14, padding:"12px 14px", background:T.lift, borderRadius:12, border:`1px solid ${T.rule}` }}>
                    <Thumb frag={f} w={72}/>
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{ fontFamily:serif, fontSize:14, color:T.black, margin:0 }}>{f.name}</p>
                      <p style={{ fontFamily:sans, fontSize:11, color:T.mid, margin:"2px 0 0" }}>{f.house} · {f.year}</p>
                    </div>
                    <span style={{ fontFamily:sans, fontSize:10, color:T.faint }}>{f.family}</span>
                  </div>
                ))}
              </div>
            </>
          )}
          {fragrances.length === 0 && <p style={{ fontFamily:sans, fontSize:12, color:T.faint, lineHeight:1.6 }}>No fragrances by this perfumer are currently in the database.</p>}
        </div>
      </div>
    </div>
  );
}

// ─── OWNERSHIP BADGE ──────────────────────────────────────────────────────────
function OwnershipBadge({ ownership, size = "normal", showTooltip = false }) {
  const [open, setOpen] = useState(false);
  if (!ownership) return null;
  const isIndependent = ownership.status === "independent";
  const isSmall = size === "small";
  const isLarge = size === "large";
  const label = isIndependent ? "Independent" : ownership.parent;
  const color = T.violet;
  const textStyle = {
    fontFamily: sans,
    fontSize: isLarge ? "clamp(14px, 1.1vw, 17px)" : isSmall ? 9 : 11,
    fontWeight: isLarge ? 600 : 500,
    color,
    letterSpacing: "0.01em",
    cursor: showTooltip ? "pointer" : "default",
    userSelect: "none",
    background: "none",
    border: "none",
    padding: 0,
    display: "inline",
  };
  if (!showTooltip) {
    return <span style={textStyle}>{label}</span>;
  }
  return (
    <div style={{ position: "relative", display: "inline" }}>
      <span style={textStyle} onClick={() => setOpen(o => !o)}>{label}</span>
      {open && (
        <div onClick={e => e.stopPropagation()} style={{
          position: "absolute", bottom: "calc(100% + 8px)", left: 0, zIndex: 100,
          background: T.white, border: `1px solid ${T.rule}`, borderRadius: 12,
          padding: "12px 14px", width: 240, boxShadow: "0 4px 20px rgba(0,0,0,0.10)",
        }}>
          <p style={{ fontFamily: sans, fontSize: 11, fontWeight: 600, color: T.ink, margin: "0 0 6px" }}>
            {isIndependent ? "Independently owned" : `Owned by ${ownership.parent}`}
            {ownership.acquiredYear && !isIndependent ? ` since ${ownership.acquiredYear}` : ""}
          </p>
          {ownership.note && (
            <p style={{ fontFamily: sans, fontSize: 11, color: T.mid, lineHeight: 1.6, margin: 0 }}>{ownership.note}</p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── FRAG CARD ────────────────────────────────────────────────────────────────
function FragCard({ frag, onClick, userStatus, reaction, onReaction, onOpenFrag, onOpenBrand }) {
  const [hov,setHov]=useState(false);
  const [showHouse,setShowHouse]=useState(false);
  const sibList=useHouseSiblings(frag,showHouse);
  const siblings=sibList||[];
  return (
    <div style={{background:T.white,borderRadius:16,border:`1px solid ${hov?T.black:T.rule}`,transition:"border-color 0.15s",overflow:"hidden"}}>
      <div onClick={()=>onClick(frag.id)} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)} style={{padding:"14px 16px",display:"flex",alignItems:"center",gap:16,cursor:"pointer"}}>
        <Thumb frag={frag}/>
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:8}}>
            <div>
              <div style={{fontFamily:serif,fontSize:15,color:T.black,margin:0,lineHeight:1.2}}>{frag.name}</div>
              <div onClick={onOpenBrand&&frag.houseSlug?e=>{e.stopPropagation();onOpenBrand({slug:frag.houseSlug,name:frag.house});}:undefined} style={{fontFamily:sans,fontSize:11,color:T.mid,margin:0,lineHeight:1.4,cursor:onOpenBrand&&frag.houseSlug?"pointer":"inherit",textDecoration:onOpenBrand&&frag.houseSlug?"underline":"none",textDecorationColor:T.rule,textUnderlineOffset:3,display:"inline-block"}}>{frag.house}</div>
              <div style={{display:"flex",alignItems:"center",flexWrap:"wrap",gap:"4px 8px",marginTop:3}}>
                <BrandTypePill type={frag.brand_origin} size="small"/>
                {frag.ownership && <span style={{fontFamily:sans,fontSize:11,lineHeight:1.4}}><OwnershipBadge ownership={frag.ownership} size="small"/></span>}
              </div>
            </div>
            {userStatus && <StatusBadge statusKey={userStatus}/>}
          </div>
          <div style={{display:"flex",gap:5,flexWrap:"wrap",marginTop:6}}>
            {frag.occasions.slice(0,2).map(o=><span key={o} style={{fontFamily:sans,fontSize:10,padding:"2px 8px",borderRadius:20,background:T.lift,color:T.mid,border:`1px solid ${T.rule}`}}>{o}</span>)}
          </div>
        </div>
      </div>
      <div style={{padding:"10px 16px 12px",borderTop:`1px solid ${T.lift}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <ReactionBar value={reaction} onChange={onReaction} compact/>
        <span style={{fontFamily:sans,fontSize:10,color:T.mid,cursor:"pointer"}} onClick={()=>onClick(frag.id)}>Details →</span>
      </div>
      {!!frag.houseSlug&&(
        <div style={{borderTop:`1px solid ${T.lift}`}}>
          <button onClick={()=>setShowHouse(!showHouse)} style={{width:"100%",padding:"9px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",background:"none",border:"none",cursor:"pointer"}}>
            <span style={{fontFamily:sans,fontSize:10,color:T.mid}}>More from {frag.house}</span>
            <span style={{fontFamily:sans,fontSize:10,color:T.faint,transition:"transform 0.2s",display:"inline-block",transform:showHouse?"rotate(180deg)":"none"}}>▾</span>
          </button>
          {showHouse&&(
            <div style={{display:"flex",overflowX:"auto",gap:0,borderTop:`1px solid ${T.lift}`}}>
              {sibList===null&&<p style={{fontFamily:sans,fontSize:11,color:T.mid,margin:0,padding:"10px 14px"}}>Loading</p>}
              {sibList&&sibList.length===0&&<p style={{fontFamily:sans,fontSize:11,color:T.mid,margin:0,padding:"10px 14px"}}>Nothing else from this house yet.</p>}
              {siblings.map((s,i)=>(
                <div key={s.id} onClick={()=>onOpenFrag&&onOpenFrag(s.id)} style={{flexShrink:0,padding:"10px 14px",borderRight:i<siblings.length-1?`1px solid ${T.lift}`:"none",cursor:"pointer",minWidth:120}} onMouseEnter={e=>e.currentTarget.style.background=T.lift} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <p style={{fontFamily:serif,fontSize:12,color:T.black,margin:0}}>{s.name}</p>
                  <p style={{fontFamily:sans,fontSize:10,color:T.mid,margin:"2px 0 0"}}>{s.year}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── DETAIL MODAL ─────────────────────────────────────────────────────────────
// ─── SAMPLE RETAILERS ─────────────────────────────────────────────────────────
// One place to fix a broken link or add a retailer. Homepages only, never product pages.
// TODO confirm: every URL below, especially Jovoy Mayfair.
const SAMPLE_RETAILERS = {
  US: [
    { name:"Scent Split",      url:"https://scentsplit.com" },
    { name:"Ministry of Scent", url:"https://ministryofscent.com" },
    { name:"ZGO Perfumery",    url:"https://zgoperfumery.com" },
    { name:"Luckyscent",       url:"https://www.luckyscent.com" },
  ],
  CA: [
    { name:"Scent Split",      url:"https://scentsplit.com" },
  ],
  EU: [
    { name:"Jovoy Paris",      url:"https://www.jovoyparis.com" },
    { name:"Nose Paris",       url:"https://www.nose.fr" },
    { name:"Luckyscent",       url:"https://www.luckyscent.com" },
  ],
  UK: [
    { name:"Jovoy Mayfair",    url:"https://www.jovoyparis.com" },
    { name:"Bloom Perfumery",  url:"https://www.bloomperfumery.com" },
    { name:"Luckyscent",       url:"https://www.luckyscent.com" },
  ],
};
const REGION_ORDER = ["US", "CA", "EU", "UK"];
const EU_COUNTRIES = ["AT","BE","BG","HR","CY","CZ","DK","EE","FI","FR","DE","GR","HU","IE","IT","LV","LT","LU","MT","NL","PL","PT","RO","SK","SI","ES","SE","CH","NO","MC"];
function regionFor(user) {
  const o = user && String(user.regionOverride || "").toUpperCase();
  if (o && SAMPLE_RETAILERS[o]) return o;
  const c = user && String(user.country || "").toUpperCase();
  if (c === "US" || c === "CA") return c;
  if (c === "GB" || c === "UK") return "UK";
  if (EU_COUNTRIES.includes(c)) return "EU";
  return "US";
}
function safeUrl(u) {
  const s = String(u || "").trim();
  if (!s) return "";
  const full = /^https?:\/\//i.test(s) ? s : "https://" + s;
  try { const p = new URL(full); return /^https?:$/.test(p.protocol) ? p.href : ""; } catch (e) { return ""; }
}
function ExtArrow({ size = 12, color = "currentColor" }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M7 17L17 7"/><path d="M8 7h9v9"/></svg>;
}
function SamplesSection({ defaultRegion, onVisit, frag }) {
  const [region, setRegion] = useState(defaultRegion);
  const [showEarn, setShowEarn] = useState(false);
  const list = SAMPLE_RETAILERS[region] || [];
  const site = safeUrl(frag && frag.website);
  const o = (frag && frag.brandOffer) || {};
  const offers = [];
  if (o.kit) offers.push({ k:"kit", label: o.kitName || "Discovery set", sub: o.kitPrice || "", url: safeUrl(o.kitUrl) || site });
  if (o.samples) offers.push({ k:"samples", label:"Sample vials", sub:"", url: site });
  if (o.travel) offers.push({ k:"travel", label:"Travel sizes", sub:"", url: safeUrl(o.travelUrl) || site });
  const houseName = (frag && frag.house) || "the house";
  return (
    <div>
      <Lbl>Where to find samples</Lbl>
      {site ? (
        <div style={{ background:T.white, border:`1px solid ${T.rule}`, borderRadius:18, padding:"18px 18px 16px", marginBottom:26 }}>
          <p style={{ fontFamily:sans, fontSize:11, fontWeight:600, letterSpacing:"0.16em", textTransform:"uppercase", color:"var(--accent)", margin:"0 0 6px" }}>Start with the brand</p>
          <p style={{ fontFamily:serif, fontSize:24, lineHeight:1.15, color:T.black, margin:"0 0 6px" }}>{houseName}</p>
          <p style={{ fontFamily:sans, fontSize:13, color:T.mid, lineHeight:1.65, margin:"0 0 14px" }}>Buying direct builds a relationship with the people who make it. Look for a discovery set, samples or travel sizes before you consider a full bottle.</p>
          {offers.length > 0 ? (
            <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:14 }}>
              {offers.map(of => (
                <a key={of.k} href={of.url} target="_blank" rel="noopener noreferrer" onClick={() => trackEvent("brand_site_click", { fragrance: frag.id, houseSlug: frag.houseSlug, source:"samples_" + of.k })}
                  style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:12, padding:"12px 14px", borderRadius:12, background:T.lift, border:`1px solid ${T.rule}`, textDecoration:"none", color:T.black, minHeight:48, boxSizing:"border-box" }}>
                  <span style={{ display:"flex", alignItems:"center", gap:10, minWidth:0 }}>
                    <span style={{ fontFamily:sans, fontSize:10, fontWeight:600, letterSpacing:"0.1em", textTransform:"uppercase", color:"#fff", background:"var(--teal)", borderRadius:20, padding:"3px 9px", flexShrink:0 }}>Available</span>
                    <span style={{ fontFamily:sans, fontSize:14, fontWeight:500 }}>{of.label}{of.sub ? <span style={{ color:T.mid, fontWeight:400 }}> · {of.sub}</span> : null}</span>
                  </span>
                  <ExtArrow size={13} color={T.mid}/>
                </a>
              ))}
            </div>
          ) : (
            <p style={{ fontFamily:sans, fontSize:12, color:T.faint, lineHeight:1.6, margin:"0 0 14px" }}>We haven't confirmed what {houseName} sells directly yet. Check their site for a discovery set, samples or travel sizes.</p>
          )}
          <a href={site} target="_blank" rel="noopener noreferrer" onClick={() => trackEvent("brand_site_click", { fragrance: frag.id, houseSlug: frag.houseSlug, source:"samples_site" })}
            style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, minHeight:52, borderRadius:14, background:"var(--accent)", color:"#fff", fontFamily:sans, fontSize:16, fontWeight:600, textDecoration:"none" }}>Visit {houseName}<ExtArrow size={14} color="#fff"/></a>
        </div>
      ) : null}
      <p style={{ fontFamily:sans, fontSize:11, fontWeight:600, letterSpacing:"0.16em", textTransform:"uppercase", color:T.mid, margin:"0 0 6px" }}>{site ? "If the brand can't help" : "Retailers and decanters"}</p>
      <p style={{ fontFamily:sans, fontSize:13, color:T.mid, lineHeight:1.6, margin:"0 0 14px" }}>Sold out, won't ship to you, or no samples? These decanters and retailers can fill the gap. Not every one carries every house.</p>
      <div role="tablist" aria-label="Region" style={{ display:"flex", border:`1px solid ${T.rule}`, borderRadius:10, overflow:"hidden", marginBottom:12 }}>
        {REGION_ORDER.map((r, i) => {
          const on = r === region;
          return (
            <button key={r} role="tab" aria-selected={on} onClick={() => setRegion(r)}
              style={{ flex:1, padding:"11px 0", fontFamily:sans, fontSize:13, fontWeight:on?600:500, letterSpacing:"0.06em", border:"none", borderLeft:i?`1px solid ${T.rule}`:"none", background:on?T.black:T.white, color:on?T.white:T.mid, cursor:"pointer" }}>{r}</button>
          );
        })}
      </div>
      <div className="mos-samples">
        {list.map((r, i) => (
          <a key={r.name} href={r.url} target="_blank" rel="noopener noreferrer" onClick={() => onVisit && onVisit(r.name, region)}
            style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:12, padding:"15px 16px", border:`1px solid ${T.rule}`, borderRadius:12, textDecoration:"none", color:T.black, background:T.white, minHeight:52, boxSizing:"border-box" }}>
            <span style={{ fontFamily:serif, fontSize:17 }}>{r.name}</span>
            <span style={{ display:"inline-flex", alignItems:"center", gap:6, fontFamily:sans, fontSize:12, color:T.mid }}>Visit<ExtArrow/></span>
          </a>
        ))}
      </div>
      <p style={{ fontFamily:sans, fontSize:12, color:T.mid, lineHeight:1.6, margin:"12px 0 0" }}>
        Some of these may be affiliate links. We may earn a commission if you buy through them. It never changes what we feature.{" "}
        <button onClick={() => setShowEarn(true)} style={{ background:"none", border:"none", padding:0, font:"inherit", color:T.black, textDecoration:"underline", cursor:"pointer" }}>How we earn</button>
      </p>
      {showEarn && <LegalModal type="affiliate" onClose={() => setShowEarn(false)}/>}
    </div>
  );
}


const SHARE_FORMATS = [
  { id:"square", label:"Square", sub:"1080 × 1080 · posts", w:1080, h:1080 },
  { id:"portrait", label:"Portrait", sub:"1080 × 1350 · feed", w:1080, h:1350 },
  { id:"story", label:"Story", sub:"1080 × 1920 · stories", w:1080, h:1920 },
];
const SHARE_BG = [ ["cream","Cream","#FAF7F5","#1A1420"], ["white","White","#FFFFFF","#1A1420"], ["mist","Mist","#E8EDF1","#1A1420"], ["sage","Sage","#E6ECE3","#1A1420"], ["lavender","Lavender","#ECE8F3","#1A1420"], ["butter","Butter","#F7F0DC","#1A1420"], ["auto","Auto","",""] ];
const AUTO_TINTS = { pink:"mist", peony:"mist", peach:"mist", blossom:"mist", rose:"mist", lychee:"mist", litchi:"mist", papaya:"butter", turmeric:"butter", sesame:"butter", maple:"butter", lemongrass:"sage", oregano:"sage", shiso:"sage", olive:"sage", fern:"sage", wisteria:"lavender", passion:"lavender", lavender:"lavender", iris:"lavender", violet:"lavender" };
function loadShareImg(src) { return new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; }); }
async function renderNotesCard(frag, fmt, bg) {
  const names = [];
  [allNoteList(frag.notes)].forEach(a => (a || []).forEach(x => { const u = notePhotoFor(x.n); if (u && !names.find(m => m.u === u)) names.push({ n:x.n, u }); }));
  const list = names.slice(0, 6);
  try { await document.fonts.load("600 64px 'Fraunces Variable'"); await document.fonts.load("500 28px 'DM Sans Variable'"); } catch {}
  const imgs = await Promise.all(list.map(m => loadShareImg(m.u)));
  const c = document.createElement("canvas"); c.width = fmt.w; c.height = fmt.h;
  const g = c.getContext("2d");
  g.fillStyle = bg[2]; g.fillRect(0, 0, fmt.w, fmt.h);
  const ink = bg[3], dark = bg[0] === "night", pad = 80, tall = fmt.h > fmt.w;
  g.textAlign = "left"; g.fillStyle = ink;
  const top = tall ? (fmt.h > 1500 ? 200 : 110) : 90;
  g.globalAlpha = 0.6; g.font = "500 26px 'DM Sans Variable', sans-serif";
  g.fillText(String(frag.house || "").toUpperCase().split("").join(String.fromCharCode(8202)), pad, top); g.globalAlpha = 1;
  g.font = "600 66px 'Fraunces Variable', Georgia, serif";
  let title = frag.name; while (g.measureText(title).width > fmt.w - pad*2 && title.length > 4) title = title.slice(0, -2);
  if (title !== frag.name) title += "…";
  g.fillText(title, pad, top + 78);
  const n = imgs.length, cols = n <= 1 ? 1 : n <= 4 ? 2 : (tall ? 2 : 3), rows = Math.ceil(n / cols);
  const areaTop = top + 140, areaBot = fmt.h - (fmt.h > 1500 ? 320 : 170), areaH = areaBot - areaTop, areaW = fmt.w - pad*2;
  const gap = 24, labelH = 54;
  const cell = Math.min((areaW - gap*(cols-1)) / cols, (areaH - gap*(rows-1)) / rows - labelH, 430);
  const gridW = cols*cell + gap*(cols-1), gridH = rows*(cell+labelH) + gap*(rows-1);
  const x0 = (fmt.w - gridW)/2, y0 = areaTop + Math.max(0, (areaH - gridH)/2);
  imgs.forEach((im, i) => {
    const r = Math.floor(i/cols), k = i % cols;
    const inRow = r === rows-1 ? n - r*cols : cols;
    const rowW = inRow*cell + gap*(inRow-1);
    const x = (fmt.w - rowW)/2 + k*(cell+gap), y = y0 + r*(cell+labelH+gap);
    const oc = document.createElement("canvas"); oc.width = oc.height = Math.round(cell);
    const o = oc.getContext("2d");
    o.filter = "brightness(1.05)"; o.drawImage(im, 0, 0, oc.width, oc.height); o.filter = "none";
    o.globalCompositeOperation = "destination-in"; o.filter = "blur(" + Math.round(cell*0.035) + "px)";
    const ins = cell*0.035; o.fillStyle = "#000"; o.beginPath(); o.roundRect(ins, ins, cell-ins*2, cell-ins*2, cell*0.2); o.fill();
    g.save(); g.globalCompositeOperation = dark ? "source-over" : "multiply"; g.drawImage(oc, x, y); g.restore();
    g.fillStyle = ink; g.font = "500 30px 'Fraunces Variable', Georgia, serif"; g.textAlign = "center";
    g.fillText(list[i].n, x + cell/2, y + cell + 40);
  });
  const fy = fmt.h - (fmt.h > 1500 ? 230 : 84);
  g.fillStyle = ink; g.textAlign = "left";
  g.font = "500 28px 'Fraunces Variable', Georgia, serif"; const w1 = g.measureText("memoir").width, sp = 8;
  g.font = "italic 400 28px 'Fraunces Variable', Georgia, serif"; const w2 = g.measureText("on skin").width;
  const wx = pad;
  g.font = "500 28px 'Fraunces Variable', Georgia, serif"; g.fillText("memoir", wx, fy);
  g.font = "italic 400 28px 'Fraunces Variable', Georgia, serif"; g.fillStyle = dark ? "#FF5C9D" : "#C9206B"; g.fillText("on skin", wx + w1 + sp, fy);
  const blob = await new Promise(r => c.toBlob(r, "image/png"));
  return blob;
}
function ShareNotesButton({ frag }) {
  const [open, setOpen] = useState(false);
  const [fmtId, setFmtId] = useState("square");
  const [bgId, setBgId] = useState("cream");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const has = [allNoteList(frag.notes)].some(a => (a || []).some(x => notePhotoFor(x.n)));
  if (!has) return null;
  const fmt = SHARE_FORMATS.find(f => f.id === fmtId);
  const autoId = (() => { const c = {}; [allNoteList(frag.notes)].forEach(a => (a || []).forEach(x => { if (!notePhotoFor(x.n)) return; const w = String(x.n).toLowerCase().split(/\s+/).find(t => AUTO_TINTS[t]); if (w) c[AUTO_TINTS[w]] = (c[AUTO_TINTS[w]] || 0) + 1; })); return Object.keys(c).sort((a, b) => c[b] - c[a])[0] || "cream"; })();
  const bg = SHARE_BG.find(b => b[0] === (bgId === "auto" ? autoId : bgId));
  const fname = `${String(frag.name).toLowerCase().replace(/[^a-z0-9]+/g, "-")}-notes-${fmt.id}.png`;
  async function go(mode) {
    setBusy(true); setErr("");
    try {
      const blob = await renderNotesCard(frag, fmt, bg);
      const file = new File([blob], fname, { type:"image/png" });
      if (mode === "share" && navigator.canShare && navigator.canShare({ files:[file] })) { await navigator.share({ files:[file], title:`${frag.name} notes` }); }
      else { const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = fname; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); }
    } catch (e) { if (e && e.name !== "AbortError") setErr("Could not make the image. Try again."); }
    setBusy(false);
  }
  const canShare = typeof navigator !== "undefined" && !!navigator.canShare;
  return (
    <div style={{ marginTop:18 }}>
      <button onClick={() => setOpen(o => !o)} style={{ minHeight:46, padding:"10px 18px", borderRadius:14, border:`1px solid ${T.rule}`, background:T.white, color:T.ink, fontFamily:sans, fontSize:14, fontWeight:600, cursor:"pointer" }}>Share these notes</button>
      {open && (
        <div style={{ marginTop:12, padding:16, borderRadius:14, background:T.lift, border:`1px solid ${T.rule}` }}>
          <Lbl mb={8}>Size</Lbl>
          <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:14 }}>
            {SHARE_FORMATS.map(f => <button key={f.id} onClick={() => setFmtId(f.id)} style={{ ...selBtn(fmtId === f.id), minHeight:52, flexDirection:"column", gap:2, padding:"8px 14px" }}><span>{f.label}</span><span style={{ fontSize:11, fontWeight:400, opacity:0.8 }}>{f.sub}</span></button>)}
          </div>
          <Lbl mb={8}>Background</Lbl>
          <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:16 }}>
            {SHARE_BG.map(b => <button key={b[0]} onClick={() => setBgId(b[0])} style={{ ...selBtn(bgId === b[0]), minHeight:44 }}><span style={{ width:14, height:14, borderRadius:7, background:b[0]==="auto"?"conic-gradient(#F6E6EA,#E6ECE3,#ECE8F3,#F7F0DC,#F6E6EA)":b[2], border:"1px solid #bbb", display:"inline-block" }}/>{b[1]}</button>)}
          </div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
            <button disabled={busy} onClick={() => go("download")} style={{ ...selBtn(true), minHeight:48, padding:"10px 20px" }}>{busy ? "Making…" : "Download image"}</button>
            {canShare && <button disabled={busy} onClick={() => go("share")} style={{ ...selBtn(false), minHeight:48, padding:"10px 20px" }}>Share…</button>}
          </div>
          {err && <p style={{ fontFamily:sans, fontSize:12, color:T.mid, margin:"10px 0 0" }}>{err}</p>}
        </div>
      )}
    </div>
  );
}

function NotesPyramid({ notes, onOpenNote }) {
  return (
    <div>
              {(((notes.all||[]).length && !(notes.top||[]).length && !(notes.mid||[]).length && !(notes.base||[]).length)
                ? [{tier:"all", label:"Notes", time:"", notes:notes.all, desc:"As listed by the house."}]
                : [
                {tier:"top", label:"Top Notes",   time:"0 – 30 min",     notes:notes.top,  desc:"Vivid but fleeting."},
                {tier:"mid", label:"Heart Notes", time:"30 min – 4 hrs", notes:notes.mid,  desc:"The true character."},
                {tier:"base",label:"Base Notes",  time:"4+ hours",       notes:notes.base, desc:"The foundation that lingers."},
              ]).map(({tier,label,time,notes:ns,desc},si,arr)=>(
                <div key={tier} style={{marginBottom:si<arr.length-1?28:0}}>
                  <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14,padding:"10px 14px",borderRadius:10,background:T.lift,border:`1px solid ${T.rule}`}}>
                    <div style={{width:22,height:22,borderRadius:6,fontSize:10,fontWeight:700,fontFamily:sans,display:"flex",alignItems:"center",justifyContent:"center",background:tier==="top"?"#F2883A":tier==="mid"?"#E2639B":tier==="all"?"#17788F":"#8E52D6",color:"#FFFFFF"}}>
                      {tier==="top"?"T":tier==="mid"?"H":tier==="all"?"N":"B"}
                    </div>
                    <div style={{flex:1}}>
                      <span style={{fontFamily:sans,fontSize:12,fontWeight:600,color:T.ink}}>{label}</span>
                      <span style={{fontFamily:sans,fontSize:11,color:T.mid,marginLeft:8}}>{desc}</span>
                    </div>
                    <span style={{fontFamily:sans,fontSize:9,color:T.faint}}>{time}</span>
                  </div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:"18px 14px"}}>
                    {ns.map(note=><button key={note.n} onClick={()=>onOpenNote&&onOpenNote(note.n,label)} aria-label={`About ${note.n}`} style={{background:"none",border:"none",padding:0,flex:"none",width:TILE_W,cursor:onOpenNote?"pointer":"default",textAlign:"left",font:"inherit",color:"inherit"}}><NoteIllustration name={note.n} tile/></button>)}
                  </div>
                </div>
              ))}
            </div>
  );
}

const WEAR_OCCASIONS = ["everyday","work","date","night out","event","travel","home","workout"];
const WEAR_MOODS = ["happy","calm","confident","energised","romantic","nostalgic","tired","anxious","stressed","lonely","sad","depressed"];
const WEAR_WEATHER = ["hot","warm","mild","cool","cold","rainy"];
function todayISO() { const d = new Date(); return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10); }
function fmtWearDate(iso) {
  const [y, m, d] = String(iso || "").split("-").map(Number);
  if (!y) return "";
  return new Date(y, m - 1, d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
function WearLog({ frag, wears, onLogWear, onDeleteWear }) {
  const mine = (wears || []).filter(w => w.fragId === frag.id).sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  const [date, setDate] = useState(todayISO());
  const [moods, setMoods] = useState([]);
  const [occasions, setOccasions] = useState([]);
  const [weathers, setWeathers] = useState([]);
  const toggleIn = (set, v) => set(a => a.includes(v) ? a.filter(x => x !== v) : [...a, v]);
  const [rating, setRating] = useState(0);
  const [busy, setBusy] = useState(false);
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-/i.test(String(frag.id))) return null;
  const rated = mine.filter(w => w.rating);
  const avg = rated.length ? (rated.reduce((n, w) => n + w.rating, 0) / rated.length).toFixed(1) : null;
  const chip = on => ({ ...selBtn(on), minHeight:46, fontSize:14, textTransform:"capitalize" });
  async function save() {
    if (busy) return;
    setBusy(true);
    await onLogWear(frag.id, { date: date || todayISO(), occasion: occasions[0] || null, weather: weathers[0] || null, occasions, weathers, rating: rating || null, moods });
    setBusy(false); setOccasions([]); setWeathers([]); setMoods([]); setRating(0); setDate(todayISO());
  }
  return (
    <div style={{ marginTop: 36, paddingTop: 28, borderTop: `1px solid ${T.rule}` }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, margin: "0 0 16px" }}>
        <p style={{ fontFamily: sans, fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.16em", color: T.mid, margin: 0 }}>Wear log</p>
        {mine.length > 0 && <span style={{ fontFamily: sans, fontSize: 11, color: T.faint }}>Worn {mine.length} time{mine.length !== 1 ? "s" : ""}{avg ? ` · avg ${avg} ★` : ""}</span>}
      </div>
      {(
        <div style={{ background: T.lift, border: `1px solid ${T.rule}`, borderRadius: 14, padding: 18 }}>
          <p style={{ fontFamily: sans, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.14em", color: T.mid, margin: "0 0 8px" }}>Date</p>
          <input type="date" value={date} max={todayISO()} onChange={e => setDate(e.target.value)} style={{ ...FIELD, width:"auto", minWidth:180, marginBottom: 18 }}/>
          <p style={{ fontFamily: sans, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.14em", color: T.mid, margin: "0 0 4px" }}>Occasion</p>
          <p style={{ fontFamily: sans, fontSize: 12, color: T.faint, margin: "0 0 8px", lineHeight: 1.5 }}>Pick any that fit.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 8, marginBottom: 18 }}>{WEAR_OCCASIONS.map(o => <button key={o} aria-pressed={occasions.includes(o)} onClick={() => toggleIn(setOccasions, o)} style={chip(occasions.includes(o))}>{o}</button>)}</div>
          <p style={{ fontFamily: sans, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.14em", color: T.mid, margin: "0 0 4px" }}>Weather</p>
          <p style={{ fontFamily: sans, fontSize: 12, color: T.faint, margin: "0 0 8px", lineHeight: 1.5 }}>Pick any that fit.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 8, marginBottom: 18 }}>{WEAR_WEATHER.map(o => <button key={o} aria-pressed={weathers.includes(o)} onClick={() => toggleIn(setWeathers, o)} style={chip(weathers.includes(o))}>{o}</button>)}</div>
          <p style={{ fontFamily: sans, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.14em", color: T.mid, margin: "0 0 4px" }}>How were you feeling?</p>
          <p style={{ fontFamily: sans, fontSize: 12, color: T.faint, margin: "0 0 8px", lineHeight: 1.5 }}>Pick any that fit. Private to you.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 8, marginBottom: 18 }}>{WEAR_MOODS.map(o => { const on = moods.includes(o); return <button key={o} aria-pressed={on} onClick={() => setMoods(on ? moods.filter(x => x !== o) : [...moods, o])} style={chip(on)}>{o}</button>; })}</div>
          <p style={{ fontFamily: sans, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.14em", color: T.mid, margin: "0 0 8px" }}>How did it wear?</p>
          <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>{[1, 2, 3, 4, 5].map(n => <button key={n} onClick={() => setRating(rating === n ? 0 : n)} aria-label={`${n} star${n > 1 ? "s" : ""}`} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 32, padding: 2, color: n <= rating ? "var(--accent)" : T.rule, lineHeight: 1 }}>★</button>)}</div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={save} disabled={busy} style={{ ...ctaBtn(true), flex:1, width:"auto", opacity: busy ? 0.6 : 1 }}>Save wear</button>
          </div>
        </div>
      )}
      {mine.length > 0 && (
        <div style={{ marginTop: 16 }}>
          {mine.slice(0, 8).map(w => (
            <div key={w.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "10px 0", borderBottom: `1px solid ${T.lift}` }}>
              <div style={{ minWidth: 0 }}>
                <span style={{ fontFamily: sans, fontSize: 13, color: T.ink }}>{fmtWearDate(w.date)}</span>
                <span style={{ fontFamily: sans, fontSize: 11, color: T.faint, marginLeft: 8, textTransform: "capitalize" }}>{[...(w.occasions && w.occasions.length ? w.occasions : [w.occasion]), ...(w.weathers && w.weathers.length ? w.weathers : [w.weather]), ...(w.moods || [])].filter(Boolean).join(" · ")}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                {w.rating ? <span style={{ fontFamily: sans, fontSize: 12, color: T.mid }}>{"★".repeat(w.rating)}</span> : null}
                <button onClick={() => onDeleteWear(w.id)} aria-label="Remove this wear" style={{ background: "none", border: "none", color: T.faint, fontSize: 14, cursor: "pointer", padding: 2 }}>✕</button>
              </div>
            </div>
          ))}
          {mine.length > 8 && <p style={{ fontFamily: sans, fontSize: 11, color: T.faint, margin: "10px 0 0" }}>And {mine.length - 8} earlier.</p>}
        </div>
      )}
      {mine.length === 0 && <p style={{ fontFamily: sans, fontSize: 11, color: T.faint, margin: "12px 0 0", lineHeight: 1.6 }}>Log each wear. Over time you will see what you reach for, and when.</p>}
    </div>
  );
}
// Opens from a note on a fragrance page: the ingredient guide when we have one, otherwise a short note card.
function NoteSheet({ name, tier, house, onClose }) {
  const has = !!guideKey(name);
  useEffect(() => { const h = e => { if (e.key === "Escape") onClose(); }; window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h); }, [onClose]);
  return (
    <div onClick={e => { e.stopPropagation(); onClose(); }} style={{ position:"fixed", inset:0, zIndex:70, background:T.scrim, display:"flex", alignItems:"flex-end", justifyContent:"center" }}>
      <div onClick={e => e.stopPropagation()} role="dialog" aria-label={name} style={{ background:T.bg, width:"100%", maxWidth:has?1000:460, maxHeight:"93vh", overflowY:"auto", borderRadius:"24px 24px 0 0", border:`1px solid ${T.rule}`, borderBottom:"none", padding:"22px 24px 34px", boxSizing:"border-box" }}>
        {has ? <IngredientGuide name={name} onBack={onClose} backLabel="Back"/> : (
          <div>
            <BackBtn onBack={onClose}/>
            <div style={{ display:"flex", gap:18, alignItems:"center", margin:"4px 0 18px" }}>
              <div style={{ background:T.lift, borderRadius:14, padding:12, flexShrink:0 }}><NoteIllustration name={name} size={96}/></div>
              <div>
                <p style={{ fontFamily:sans, fontSize:11, letterSpacing:"0.18em", textTransform:"uppercase", color:T.accent, fontWeight:600, margin:"0 0 6px" }}>{tier || "Note"}</p>
                <h3 style={{ fontFamily:serif, fontSize:"clamp(28px, 4vw, 40px)", fontWeight:400, color:T.black, margin:0, lineHeight:1.1 }}>{name}</h3>
              </div>
            </div>
            <p style={{ fontFamily:sans, fontSize:14, color:T.mid, lineHeight:1.7, margin:"0 0 14px" }}>{name} is a {String(tier || "").toLowerCase().replace(" notes", "") ? `${String(tier).toLowerCase().replace(" notes", "")} note` : "note"} in {house ? `${house}'s` : "this"} fragrance. We don't have a full ingredient guide for it yet.</p>
            <p style={{ fontFamily:sans, fontSize:13, color:T.faint, lineHeight:1.6, margin:0 }}>Guides cover where an ingredient grows, how it is made and where you have smelled it. More are on the way.</p>
          </div>
        )}
      </div>
    </div>
  );
}
function DetailModal({ frag, entries, onClose, userStatus, setUserStatus, finish, setFinish, size, setSize, privateNote, setPrivateNote, reaction, setReaction, onOpenFrag, onOpenProfile, onAddJournalEntry, currentUser, onOpenBrand, onOpenPerfumer, wears, onLogWear, onDeleteWear, onBack }) {
  const [tab,setTab]=useState("overview");
  const [showPerfumer, setShowPerfumer]=useState(false);
  const [noteSheet, setNoteSheet]=useState(null);
  const [replyText,setReplyText]=useState("");
  const [replyTo,setReplyTo]=useState(null);
  const [revSort,setRevSort]=useState("recent");
  const [replies,setReplies]=useState({});
  const REVIEWS=[
    {id:0,username:"scentcollector_jw",name:"James W.",feeling:"loved",text:"Give it 20 minutes past the opening, the smoky birch dry-down is masterful.",date:"2 days ago",helpful:34,user:{isFounder:true,memberNumber:12,isTopContributor:true,country:"GB"}},
    {id:1,username:"niche_nomad",name:"Nadia M.",feeling:"artistry",text:"Overpriced? Yes. Masterpiece of construction? Undeniably.",date:"1 week ago",helpful:28,user:{isFounder:true,memberNumber:89,isTopContributor:false,country:"FR"}},
    {id:2,username:"basenotebrigade",name:"Bruno K.",feeling:"loved",text:"Had three people ask what I was wearing at a conference. Projection is serious.",date:"2 weeks ago",helpful:19,user:{isFounder:false,memberNumber:null,isTopContributor:true,country:"DE"}},
    {id:3,username:"demo_member_a",name:"Demo A.",feeling:"notforme",text:"Beautifully made, just not my skin. Too sharp on me.",date:"3 weeks ago",helpful:6,user:null},
    {id:4,username:"demo_member_b",name:"Demo B.",feeling:"artistry",text:"I wouldn't wear it, but I can see exactly what the perfumer was doing.",date:"1 month ago",helpful:9,user:null},
  ];
  const [mine,setMine]=useState([]);
  const [composing,setComposing]=useState(false);
  const [myFeeling,setMyFeeling]=useState(null);
  const [myText,setMyText]=useState("");
  const allReviews=[...mine,...REVIEWS];
  function submitImpression(){
    if(!myFeeling)return;
    setMine(m=>[{id:"mine-"+Date.now(),username:"you",name:"You",feeling:myFeeling,text:myText.trim(),date:"Just now",helpful:0,user:null},...m]);
    setComposing(false);setMyFeeling(null);setMyText("");
  }

  function submitReply(reviewId){
    if(!replyText.trim())return;
    setReplies(r=>({...r,[reviewId]:[...(r[reviewId]||[]),{user:"You",text:replyText,date:"Just now"}]}));
    setReplyText("");setReplyTo(null);
  }

  const sortedAcc = [...(frag.accords || [])].sort((x, y) => y.v - x.v);
  const accA = sortedAcc[0] ? accordColor(sortedAcc[0].n) : null;
  const accB = sortedAcc[1] ? accordColor(sortedAcc[1].n) : accA;
  const hasSeasons = !!frag.seasons && Object.keys(frag.seasons).length > 0;
  const hasOcc = !!frag.occasions && frag.occasions.length > 0;
  const hasLeft = true;
  const stats = [
    { label:"Longevity", value: frag.longevity != null ? `${frag.longevity}/5` : null },
    { label:"Sillage", value: frag.sillage != null ? `${frag.sillage}/5` : null },
  ].filter(s => s.value != null);
  return (
    <div className="mos-sheet-wrap" onClick={onClose} style={{position:"fixed",inset:0,zIndex:50,background:T.scrim,backdropFilter:"blur(16px)",display:"flex",flexDirection:"column",justifyContent:"flex-end",alignItems:"center"}}>
      <div className="mos-sheet" onClick={e=>e.stopPropagation()} style={{background:T.white,borderRadius:"24px 24px 0 0",border:`1px solid ${T.rule}`,borderBottom:"none",width:"100%",maxWidth:460,maxHeight:"93vh",overflowY:"auto"}}>
        {noteSheet && <NoteSheet name={noteSheet.name} tier={noteSheet.tier} house={frag.house} onClose={()=>setNoteSheet(null)}/>}

        
        <div className="mos-pad" style={{position:"relative",padding:"34px 24px 30px",borderBottom:`1px solid ${T.rule}`,overflow:"hidden",background:accA?`${accA}1F`:"transparent"}}>
          <button className="mos-close" onClick={onClose} style={{position:"absolute",top:16,right:16,width:30,height:30,borderRadius:"50%",border:`1px solid ${T.rule}`,background:T.white,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,color:T.mid,zIndex:2}}>✕</button>
          <BackBtn onBack={onBack||onClose}/>
          <div style={{display:"flex",alignItems:"center",gap:"clamp(16px, 3vw, 56px)"}}>
            <div style={{flex:1,minWidth:0}}>
              <div style={{marginBottom:10}}><span style={{fontFamily:sans,fontSize:"clamp(10px, 0.9vw, 12px)",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.18em",color:T.mid}}>{onOpenBrand&&frag.houseSlug?<button onClick={()=>onOpenBrand({slug:frag.houseSlug,name:frag.house})} style={{font:"inherit",letterSpacing:"inherit",textTransform:"inherit",color:T.black,background:"none",border:"none",borderBottom:`1px solid ${T.mid}`,padding:"0 0 1px",cursor:"pointer",minHeight:24}}>{frag.house}</button>:frag.house}{[frag.line, frag.family].filter(Boolean).length?" · "+[frag.line, frag.family].filter(Boolean).join(" · "):""}</span></div>
              <h2 style={{fontFamily:serif,fontSize:"clamp(36px, 4.4vw, 64px)",fontWeight:400,color:T.black,margin:"0 0 10px",letterSpacing:-1,lineHeight:1.05,paddingRight:44}}>{frag.name}</h2>
              <p style={{fontFamily:sans,fontSize:"clamp(14px, 1.1vw, 17px)",color:T.mid,margin:"0 0 0",lineHeight:1.4}}>{[frag.year, frag.concentration].filter(Boolean).join(" · ")}</p>
              <OtherVersions frag={frag} onOpenFrag={onOpenFrag}/>
              <div style={{margin:"10px 0 0",display:"flex",flexDirection:"column",alignItems:"flex-start",gap:8}}>
                {brandTypeLabel(frag.brand_origin) && <span style={{fontFamily:sans,fontSize:"clamp(13px, 1vw, 15px)",color:T.mid}}>Brand type <strong style={{color:"var(--coral)",fontWeight:600}}>{brandTypeLabel(frag.brand_origin)}</strong></span>}
                {frag.ownership && <span style={{display:"inline-flex",alignItems:"baseline",gap:6,fontFamily:sans,fontSize:"clamp(13px, 1vw, 15px)",color:T.mid}}>Ownership <OwnershipBadge ownership={frag.ownership} size="large" showTooltip={true}/></span>}
                {frag.price_tier && <span style={{fontFamily:sans,fontSize:"clamp(13px, 1vw, 15px)",color:T.mid}}>Price tier <strong style={{color:T.teal,fontWeight:600}}>{frag.price_tier}</strong></span>}
                {frag.country && <span style={{fontFamily:sans,fontSize:"clamp(13px, 1vw, 15px)",color:T.mid}}>Country <strong style={{color:"var(--pink)",fontWeight:600}}>{frag.country}</strong></span>}
                {(frag.diversity || frag.womanOwned) && <span style={{fontFamily:sans,fontSize:"clamp(13px, 1vw, 15px)",color:T.mid,display:"inline-flex",flexWrap:"wrap",alignItems:"baseline",gap:"2px 10px"}}>{frag.diversity && <span>Diversity <strong style={{color:T.tangerine,fontWeight:600}}>{frag.diversity}</strong></span>}{frag.womanOwned && <strong style={{color:"var(--orchid)",fontWeight:600}}>Woman-owned</strong>}</span>}
                {frag.neoGourmand && <span style={{fontFamily:sans,fontSize:"clamp(13px, 1vw, 15px)",color:T.mid}}>Style <strong style={{color:T.accent,fontWeight:600}}>Neo gourmand</strong></span>}
              </div>
              {splitPerfumers(frag.perfumer).length>0 && (
                <p style={{fontFamily:sans,fontSize:"clamp(13px, 1vw, 15px)",color:T.mid,margin:"14px 0 0",display:"flex",alignItems:"center",flexWrap:"wrap",gap:"2px 6px"}}>
                  <span style={{color:T.faint,fontSize:12}}>by</span>
                  {splitPerfumers(frag.perfumer).map((n,i,arr)=>(
                    <span key={n} style={{display:"inline-flex",alignItems:"center",gap:6}}>
                      <button onClick={()=>onOpenPerfumer?onOpenPerfumer(n):setShowPerfumer(n)} style={{font:"inherit",color:T.black,background:"none",border:"none",borderBottom:`1px solid ${T.rule}`,padding:0,cursor:"pointer",minHeight:24}}>{n}</button>
                      {i<arr.length-1&&<span style={{color:T.faint}}>&amp;</span>}
                    </span>
                  ))}
                </p>
              )}
              
              {showPerfumer && typeof showPerfumer==="string" && <PerfumerModal name={showPerfumer} onClose={()=>setShowPerfumer(false)}/>}
            </div>
            <div style={{width:"clamp(120px, 26vw, 340px)",aspectRatio:"4 / 5",borderRadius:20,background:frag.image?"#fff":(accA||"#C9206B"),border:`1px solid ${T.rule}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,overflow:"hidden",position:"relative"}}>
              {frag.image
                ? <img src={frag.image} alt={frag.name} style={{width:"100%",height:"100%",objectFit:"contain",padding:"6%"}}/>
                : <span style={{fontFamily:serif,fontSize:"clamp(36px, 6vw, 84px)",color:"#fff",opacity:0.92,lineHeight:1}}>{frag.name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase()}</span>}
            </div>
          </div>
          <div style={{marginTop:22}}><ReactionBar value={reaction} onChange={setReaction}/></div>
          {frag.image&&frag.imageCredit&&<p style={{fontFamily:sans,fontSize:10,color:T.faint,margin:"10px 0 0"}}>{frag.imageCredit}</p>}
        </div>

        
        <div className="mos-pad mos-dtabs" style={{display:"flex",borderBottom:`1px solid ${T.rule}`,padding:"0 24px",overflowX:"auto"}}>
          {["overview","tracker","journal","community"].map(t=>(
            <button key={t} onClick={()=>setTab(t)} style={{marginRight:16,padding:"11px 0",whiteSpace:"nowrap",fontSize:10,textTransform:"uppercase",letterSpacing:"0.08em",color:tab===t?T.black:T.mid,background:"none",border:"none",borderBottom:tab===t?`2px solid ${T.black}`:"2px solid transparent",marginBottom:-1,cursor:"pointer",fontFamily:sans}}>{t}</button>
          ))}
        </div>

        
        {(tab==="overview"||tab==="community")&&stats.length>0&&(
        <div style={{display:"grid",gridTemplateColumns:`repeat(${stats.length},1fr)`,borderBottom:`1px solid ${T.rule}`}}>
          {stats.map((s,i)=>(
            <div key={s.label} style={{padding:"clamp(16px, 2vw, 26px) 6px",textAlign:"center",borderRight:i<stats.length-1?`1px solid ${T.rule}`:"none"}}>
              <p style={{fontFamily:serif,fontSize:"clamp(20px, 2.4vw, 34px)",color:T.black,margin:0}}>{s.value}</p>
              <p style={{fontFamily:sans,fontSize:"clamp(10px, 0.85vw, 12px)",color:T.mid,textTransform:"uppercase",letterSpacing:"0.09em",margin:"3px 0 0"}}>{s.label}</p>
            </div>
          ))}
        </div>
        )}

        <div className="mos-pad" style={{padding:24}}>
          <div className="mos-zoom">
          
          {tab==="overview"&&(
            <div>
              <div style={{background:T.lift,border:`1px solid ${T.rule}`,borderRadius:16,padding:"22px 18px 20px",marginBottom:32}}>
                <SamplesSection frag={frag} defaultRegion={regionFor(currentUser)} onVisit={(name, reg) => trackEvent("sample_click", { fragrance: frag.id, source: "fragrance", detail: `${name} (${reg})` })}/>
              </div>
              {(frag.description||frag.story)&&(
                <div style={{marginBottom:32}}>
                  {frag.description&&<p style={{fontFamily:sans,fontSize:"clamp(15px, 1.2vw, 18px)",color:T.mid,lineHeight:1.75,margin:"0 0 20px"}}>{frag.description}</p>}
                  {frag.story&&(
                    <div style={{background:T.lift,borderRadius:12,padding:16,border:`1px solid ${T.rule}`}}>
                      <Lbl>The Story</Lbl>
                      <p style={{fontFamily:sans,fontSize:"clamp(14px, 1.1vw, 17px)",color:T.mid,lineHeight:1.75,fontStyle:"italic",margin:0}}>{frag.story}</p>
                    </div>
                  )}
                </div>
              )}
              {sortedAcc.length>0&&(<div style={{marginBottom:36}}><Lbl mb={12}>Scent Accords</Lbl><AccordBloom accords={frag.accords}/></div>)}
              <div style={{marginBottom:36}}>
                <Lbl mb={14}>Fragrance Notes</Lbl>
                <NotesPyramid notes={frag.notes} onOpenNote={(n,tier)=>setNoteSheet({name:n,tier})}/>
                <ShareNotesButton frag={frag}/>
              </div>
              <SimilarScents frag={frag} onOpenFrag={onOpenFrag}/>
              {hasSeasons&&(<div style={{marginBottom:36}}><Lbl>Seasons</Lbl><SeasonHeat seasons={frag.seasons}/></div>)}
              {hasOcc&&(
                <div style={{marginBottom:36}}>
                  <Lbl>Occasions</Lbl>
                  <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                    {frag.occasions.map(o=><span key={o} style={{fontFamily:sans,fontSize:12,padding:"5px 12px",borderRadius:20,border:`1px solid ${T.rule}`,color:T.mid}}>{o}</span>)}
                  </div>
                </div>
              )}
              <div style={{marginTop:28}}>
                <HouseStrip currentFrag={frag} onOpenFrag={onOpenFrag} onOpenBrand={onOpenBrand}/>
              </div>
            </div>
          )}

          
          {tab==="tracker"&&(
            <div>
              <p style={{fontFamily:sans,fontSize:13,color:T.mid,lineHeight:1.65,margin:"0 0 18px"}}>The facts: where this fragrance sits in your life, and when you wear it.</p>
              <StatusSelector value={userStatus} onChange={setUserStatus} size={size} onSize={setSize}/>
              <FinishedPanel status={userStatus} finish={finish} onChange={setFinish}/>
              <div style={{marginTop:36}}/>
              <WearLog frag={frag} wears={wears} onLogWear={onLogWear} onDeleteWear={onDeleteWear}/>
            </div>
          )}

          
          {tab==="journal"&&(
            <div>
              <p style={{fontFamily:sans,fontSize:13,color:T.mid,lineHeight:1.65,margin:"0 0 18px"}}>The feelings: how this fragrance moves you, in your own words.</p>
              {privateNote?.text&&(
                <div style={{background:T.white,border:`1px solid ${T.rule}`,borderRadius:14,padding:16,marginBottom:16}}>
                  <p style={{fontFamily:sans,fontSize:10,textTransform:"uppercase",letterSpacing:"0.12em",color:T.faint,margin:"0 0 6px"}}>Earlier note{privateNote.date?` · ${privateNote.date}`:""}</p>
                  {privateNote.where&&<p style={{fontFamily:sans,fontSize:11,color:T.mid,margin:"0 0 6px"}}>{privateNote.where}</p>}
                  <p style={{fontFamily:sans,fontSize:13,color:T.ink,lineHeight:1.7,margin:0}}>{privateNote.text}</p>
                </div>
              )}
              <JournalComposer frag={frag} entries={entries} onAddJournalEntry={onAddJournalEntry}/>
              {(entries||[]).filter(e=>String(e.fragId)===String(frag.id)).length>0&&(
                <div style={{marginTop:28}}>
                  <p style={{fontFamily:sans,fontSize:10,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.16em",color:T.mid,margin:"0 0 14px"}}>Your past entries</p>
                  {(entries||[]).filter(e=>String(e.fragId)===String(frag.id)).map(e=>(
                    <div key={e.id} style={{background:T.white,border:`1px solid ${T.rule}`,borderRadius:14,padding:16,marginBottom:12}}>
                      <p style={{fontFamily:sans,fontSize:11,color:T.faint,margin:"0 0 8px"}}>{e.date}</p>
                      {e.prompt&&<p style={{fontFamily:sans,fontSize:12,color:T.mid,margin:"0 0 6px"}}>{e.prompt}</p>}
                      <AnswerChips answers={e.answers}/>
                      {e.text&&<p style={{fontFamily:sans,fontSize:13,color:T.ink,lineHeight:1.7,margin:0}}>{e.text}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab==="community"&&(
            <div>
              <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:20}}>
                <FeelingBar items={allReviews}/>
                <button onClick={()=>setComposing(c=>!c)} style={{...ctaBtn(true),width:"auto",padding:"0 20px",minHeight:44,fontSize:14,marginLeft:"auto",flexShrink:0}}>Write impression</button>
              </div>
              {composing&&(
                <div style={{border:`1px solid ${T.rule}`,borderRadius:18,padding:16,marginBottom:16}}>
                  <p style={{fontFamily:sans,fontSize:13,color:T.mid,margin:"0 0 10px"}}>How did it feel on your skin?</p>
                  <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:12}}>
                    {FEELINGS.map(f=><button key={f.key} onClick={()=>setMyFeeling(f.key)} aria-pressed={myFeeling===f.key} style={{fontFamily:sans,fontSize:13,fontWeight:600,minHeight:40,padding:"0 14px",borderRadius:20,cursor:"pointer",border:`1px solid ${f.color}`,background:myFeeling===f.key?f.color:"transparent",color:myFeeling===f.key?T.white:f.color}}>{f.label}</button>)}
                  </div>
                  <textarea value={myText} onChange={e=>setMyText(e.target.value)} placeholder="In your own words (optional)" rows={3} style={{...FIELD,width:"100%",height:"auto",padding:12,resize:"vertical"}}/>
                  <button onClick={submitImpression} disabled={!myFeeling} style={{...ctaBtn(true),width:"auto",padding:"0 20px",minHeight:44,marginTop:10,opacity:myFeeling?1:0.5}}>Post</button>
                </div>
              )}
              <div style={{marginBottom:6}}>
                <select value={revSort} onChange={e=>setRevSort(e.target.value)} aria-label="Sort impressions" style={{...FIELD,width:"auto",minHeight:42,borderRadius:21,padding:"0 16px",fontSize:14}}>
                  <option value="recent">Recently added</option>
                  <option value="helpful">Most helpful</option>
                </select>
              </div>
              {(revSort==="helpful"?[...allReviews].sort((x,y)=>y.helpful-x.helpful):allReviews).map(r=>(
                <ReviewCard key={r.id} who={r.username} whoLabel={"@"+r.username} badges={<UserBadges user={r.user} size="small"/>} date={r.date} feeling={r.feeling} text={r.text}
                  hueKey={frag.name} helpful={r.helpful} replyCount={(replies[r.id]||[]).length}
                  onWho={()=>onOpenProfile&&onOpenProfile(r.username)} onReply={()=>setReplyTo(replyTo===r.id?null:r.id)}>
                  {(replies[r.id]||[]).map((rep,i)=>(
                    <div key={i} style={{marginTop:12,paddingLeft:14,borderLeft:`2px solid ${T.rule}`,marginLeft:8}}>
                      <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
                        <span style={{fontFamily:sans,fontSize:13,color:T.ink,fontWeight:500}}>{rep.user}</span>
                        <span style={{fontFamily:sans,fontSize:11,color:T.faint,marginLeft:"auto"}}>{rep.date}</span>
                      </div>
                      <p style={{fontFamily:sans,fontSize:14,color:T.mid,lineHeight:1.6,margin:0}}>{rep.text}</p>
                    </div>
                  ))}
                  {replyTo===r.id&&(
                    <div style={{marginTop:12,display:"flex",gap:8}}>
                      <input value={replyText} onChange={e=>setReplyText(e.target.value)} placeholder="Add a reply…" onKeyDown={e=>e.key==="Enter"&&submitReply(r.id)} style={{...FIELD,flex:1,width:"auto"}}/>
                      <button onClick={()=>submitReply(r.id)} style={{...ctaBtn(true),width:"auto",padding:"0 20px"}}>Post</button>
                    </div>
                  )}
                </ReviewCard>
              ))}
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── TASTE PROFILE ────────────────────────────────────────────────────────────
// ─── JOURNAL INSIGHTS (taste profile, streak calendar, stats) ─────────────────
function dayNumOf(d) { const t = new Date(d); return isNaN(t) ? null : Math.round(new Date(t.getFullYear(), t.getMonth(), t.getDate()).getTime() / 86400000); }
function computeStreak(entries) {
  const days = [...new Set((entries || []).map(e => dayNumOf(e.date)).filter(x => x !== null))].sort((a, b) => a - b);
  let longest = 0, run = 0, prev = null, longestEnd = null;
  days.forEach(d => { run = (prev !== null && d === prev + 1) ? run + 1 : 1; if (run > longest) { longest = run; longestEnd = d; } prev = d; });
  const todayN = dayNumOf(new Date()); let current = 0;
  if (days.length && (days[days.length - 1] === todayN || days[days.length - 1] === todayN - 1)) { current = 1; for (let i = days.length - 2; i >= 0 && days[i] === days[i + 1] - 1; i--) current++; }
  return { days, daySet: new Set(days), current, longest, longestStart: longestEnd === null ? null : longestEnd - longest + 1, longestEnd, total: (entries || []).length };
}
function avgWearRating(wears) {
  const r = (wears || []).map(w => w.rating).filter(Boolean);
  return r.length ? r.reduce((a, b) => a + b, 0) / r.length : null;
}
function InsightCard({ label, headline, sub, hint, more, children }) {
  const [open, setOpen] = useState(!more || more !== "Full calendar");
  const has = !!children && !hint;
  const chip = { minHeight:38, padding:"0 14px", borderRadius:20, fontFamily:sans, fontSize:14, cursor:"pointer", display:"inline-flex", alignItems:"center" };
  return (
    <div style={{ background:T.lift, borderRadius:16, border:`1px solid ${T.rule}`, padding:18, marginBottom:14 }}>
      <p style={{ fontFamily:serif, fontSize:18, color:T.black, margin:"0 0 2px" }}>{label}</p>
      <p style={{ fontFamily:sans, fontSize:12, color:T.faint, margin:"0 0 10px" }}>{sub}</p>
      <div style={{ display:"flex", flexWrap:"wrap", gap:7 }}>
        <span style={{ ...chip, cursor:"default", border:"1px solid transparent", background:"var(--accent)", color:"#fff", fontWeight:600 }}>{typeof headline === "string" ? headline.charAt(0).toUpperCase() + headline.slice(1) : headline}</span>
        {has && <button onClick={() => setOpen(o => !o)} aria-expanded={open} aria-label={(open ? "Hide " : "Show ") + (more || "details")} style={{ ...chip, border:`1px solid ${T.rule}`, background:T.white, color:T.ink, fontWeight:400 }}>{open ? "Hide" : (more || "Details")}&nbsp;<span style={{ display:"inline-block", transform:open ? "rotate(180deg)" : "none", fontSize:10 }}>▾</span></button>}
      </div>
      {has && open && <div style={{ marginTop:16 }}>{children}</div>}
      {hint && <div style={{ marginTop:14, background:T.white, borderRadius:12, padding:"12px 14px" }}>
        <p style={{ fontFamily:sans, fontSize:12, color:"var(--accent)", margin:"0 0 4px", fontWeight:600 }}>✦ How to get started</p>
        <p style={{ fontFamily:sans, fontSize:13, color:T.mid, lineHeight:1.6, margin:0 }}>{hint}</p>
      </div>}
    </div>
  );
}
function StreakCalendar({ entries, yearSel }) {
  const st = computeStreak(entries);
  const now = new Date();
  const year = yearSel === "all" ? now.getFullYear() : yearSel;
  const lastEntry = st.days.length ? new Date(st.days[st.days.length - 1] * 86400000 + 43200000) : null;
  const [month, setMonth] = useState(year === now.getFullYear() ? now.getMonth() : 11);
  useEffect(() => { setMonth(year === now.getFullYear() ? now.getMonth() : 11); }, [year]);
  const MN = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const first = new Date(year, month, 1), dim = new Date(year, month + 1, 0).getDate();
  const cells = []; for (let i = 0; i < first.getDay(); i++) cells.push(null); for (let d = 1; d <= dim; d++) cells.push(d);
  const inYear = !!st.longest && st.longestEnd !== null && (yearSel === "all" || new Date(st.longestEnd * 86400000 + 43200000).getFullYear() === year);
  const fmt = n => new Date(n * 86400000 + 43200000).toLocaleDateString("en-US", { month:"long", day:"numeric" });
  return (
    <InsightCard label="Best journal streak" more="Full calendar" headline={String(st.longest)} sub={`${st.longest === 1 ? "day" : "days"} ${yearSel === "all" ? "all time" : "in " + year}${st.current > 0 ? ` · current streak ${st.current}` : ""}`}
      hint={st.total === 0 ? "Write an entry on the first tab or on a fragrance page and your days light up here. Log on consecutive days to build a streak." : null}>
      <div style={{ display:"flex", gap:8, overflowX:"auto", paddingBottom:6, marginBottom:10 }}>
        {MN.map((m, i) => <button key={m} onClick={() => setMonth(i)} style={{ fontFamily:sans, fontSize:13, fontWeight:month === i ? 600 : 500, padding:"8px 16px", borderRadius:20, border:"none", background:month === i ? "var(--accent)" : T.white, color:month === i ? "#fff" : T.mid, cursor:"pointer", flexShrink:0 }}>{m}</button>)}
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(7, 1fr)", gap:5 }}>
        {["S","M","T","W","T","F","S"].map((d, i) => <span key={i} style={{ fontFamily:sans, fontSize:11, color:T.faint, textAlign:"center", padding:"2px 0 4px" }}>{d}</span>)}
        {cells.map((d, i) => {
          if (d === null) return <span key={i}/>;
          const n = Math.round(new Date(year, month, d).getTime() / 86400000);
          const logged = st.daySet.has(n);
          const best = logged && st.longest > 1 && st.longestStart !== null && n >= st.longestStart && n <= st.longestEnd;
          return <span key={i} style={{ aspectRatio:"1", borderRadius:8, display:"flex", alignItems:"flex-start", padding:"4px 6px", fontFamily:sans, fontSize:11, color:logged ? "#fff" : T.faint, background:logged ? (best ? "var(--accent)" : "color-mix(in srgb, var(--accent) 55%, transparent)") : T.white, boxSizing:"border-box" }}>{d}</span>;
        })}
      </div>
      <div style={{ display:"flex", gap:16, flexWrap:"wrap", marginTop:12, fontFamily:sans, fontSize:11, color:T.mid }}>
        <span><i style={{ display:"inline-block", width:10, height:10, borderRadius:3, background:"var(--accent)", marginRight:6 }}/>Best streak</span>
        <span><i style={{ display:"inline-block", width:10, height:10, borderRadius:3, background:"color-mix(in srgb, var(--accent) 55%, transparent)", marginRight:6 }}/>Day logged</span>
        <span><i style={{ display:"inline-block", width:10, height:10, borderRadius:3, background:T.white, border:`1px solid ${T.rule}`, marginRight:6 }}/>No entry</span>
      </div>
      {inYear && st.longest > 1 && <p style={{ fontFamily:sans, fontSize:13, color:T.mid, lineHeight:1.6, margin:"14px 0 0", background:T.white, borderRadius:12, padding:"12px 14px" }}><span style={{ color:"var(--accent)", fontWeight:600 }}>✦ Insight</span><br/>Your longest streak began on <b style={{ color:T.black, fontWeight:500 }}>{fmt(st.longestStart)}</b> and lasted <b style={{ color:T.black, fontWeight:500 }}>{st.longest} days</b>.</p>}
    </InsightCard>
  );
}
function JournalInsights({ entries, userStatuses, reactions, fragrances, wears, onOpenFrag }) {
  const FR = (fragrances && fragrances.length) ? fragrances : FRAGRANCES;
  const nowY = new Date().getFullYear();
  const [yearSel, setYearSel] = useState("all");
  const inSel = d => { if (yearSel === "all") return true; const t = new Date(d); return !isNaN(t) && t.getFullYear() === yearSel; };
  const E = (entries || []).filter(e => inSel(e.date));
  const W = (wears || []).filter(w => inSel(w.date));
  const when = yearSel === "all" ? "all time" : "in " + yearSel;
  const wordTally = {}; E.forEach(e => entryWords(e).forEach(w => { wordTally[w] = (wordTally[w] || 0) + 1; }));
  const words = Object.entries(wordTally).sort((a, b) => b[1] - a[1]).slice(0, 14);

  // accords across what you own, have sampled or love (not dated, so not year-filtered)
  const LIKE = new Set(["bottle_owned","bottle_wishlist","sample_have","tried_skin","bottle_finished","sample_finished","travel_have","travel_finished"]);
  const accTally = {}, loveNotes = {}; let loved = 0;
  FR.forEach(f => {
    const st = userStatuses[f.id], rx = reactions[f.id];
    if (!(LIKE.has(st) || rx === "love" || rx === "like")) return;
    (f.accords || []).forEach(a => { accTally[a.n] = (accTally[a.n] || 0) + 1; });
  });
  FR.forEach(f => {
    if (reactions[f.id] !== "love") return; loved++;
    const seen = new Set();
    allNoteList(f.notes).forEach(x => { const k = String(x.n || "").trim().toLowerCase(); if (k && !seen.has(k)) { seen.add(k); loveNotes[k] = (loveNotes[k] || 0) + 1; } });
  });
  const accs = Object.entries(accTally).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const accTotal = accs.reduce((s, [, c]) => s + c, 0) || 1;
  const notes = loved >= 2 ? Object.entries(loveNotes).filter(([, c]) => c >= 2).sort((a, b) => b[1] - a[1]).slice(0, 8) : [];

  // wears
  const byFrag = {}, ratings = {}, perf = {}, occ = {}, wx = {};
  W.forEach(w => {
    byFrag[w.fragId] = (byFrag[w.fragId] || 0) + 1;
    (w.occasions && w.occasions.length ? w.occasions : [w.occasion]).filter(Boolean).forEach(o => { occ[o] = (occ[o] || 0) + 1; });
    (w.weathers && w.weathers.length ? w.weathers : [w.weather]).filter(Boolean).forEach(o => { wx[o] = (wx[o] || 0) + 1; });
    const f = FR.find(x => x.id === w.fragId);
    String((f && f.perfumer) || "").split(/\s*(?:&|\/|,|\band\b)\s*/i).map(x => x.trim()).filter(Boolean).forEach(n => { perf[n] = (perf[n] || 0) + 1; });
    if (w.rating) ratings[w.rating] = (ratings[w.rating] || 0) + 1;
  });
  const worn = Object.entries(byFrag).map(([id, n]) => ({ f: FR.find(x => x.id === id), n })).filter(x => x.f).sort((a, b) => b.n - a.n).slice(0, 3);
  // most owned perfumer: counted across what you own (bottles, travel sizes, samples), not by date
  const OWN = new Set(["bottle_owned","travel_have","sample_have"]), ownedPerf = {}, ownedFrags = {};
  FR.forEach(f => { if (!OWN.has(userStatuses[f.id])) return; String(f.perfumer || "").split(/\s*(?:&|\/|,|\band\b)\s*/i).map(x => x.trim()).filter(Boolean).forEach(n => { ownedPerf[n] = (ownedPerf[n] || 0) + 1; (ownedFrags[n] = ownedFrags[n] || []).push(f); }); });
  const perfs = Object.entries(ownedPerf).sort((a, b) => b[1] - a[1]).slice(0, 3);
  const avg = avgWearRating(W);
  const rMax = Math.max(1, ...[1,2,3,4,5].map(r => ratings[r] || 0));
  const topOcc = Object.entries(occ).sort((a, b) => b[1] - a[1])[0], topWx = Object.entries(wx).sort((a, b) => b[1] - a[1])[0];

  const years = [...new Set([nowY, ...(entries || []).map(e => { const t = new Date(e.date); return isNaN(t) ? null : t.getFullYear(); }).filter(Boolean), ...(wears || []).map(w => { const t = new Date(w.date); return isNaN(t) ? null : t.getFullYear(); }).filter(Boolean)])].filter(y => y >= 2026).sort((a, b) => b - a).slice(0, 3);
  const pill = (on, label, fn) => <button key={label} onClick={fn} style={{ fontFamily:sans, fontSize:13, fontWeight:on ? 600 : 500, padding:"0 16px", minHeight:38, borderRadius:20, border:`1px solid ${on ? T.black : T.rule}`, background:on ? T.black : T.white, color:on ? T.white : T.ink, cursor:"pointer", flexShrink:0 }}>{label}</button>;

  let off = 0; const R = 54, C = 2 * Math.PI * R;
  return (
    <div>
      <div style={{ display:"flex", gap:8, overflowX:"auto", marginBottom:14 }}>
        {pill(yearSel === "all", "All-time", () => setYearSel("all"))}
        {years.map(y => pill(yearSel === y, String(y), () => setYearSel(y)))}
      </div>

      <StreakCalendar entries={E} yearSel={yearSel}/>

      <InsightCard label="Top accord" more="Accord mix" headline={accs[0] ? accs[0][0] : "None yet"} sub="across what you own, sample and love"
        hint={accs.length === 0 ? "Add fragrances to your collection or mark a few as Love, and your accord mix appears here." : null}>
        {accs.length > 0 && <AccordBloom accords={accs.map(([n, c]) => ({ n, v:c }))}/>}
      </InsightCard>

      <InsightCard label="Most loved notes" more="All notes" headline={notes[0] ? notes[0][0] : "None yet"} sub={notes[0] ? `across the ${loved} fragrances you love` : "from the fragrances you love"}
        hint={notes.length === 0 ? "Mark 2 or more fragrances as Love, and we'll highlight the notes they share." : null}>
        {notes.length > 0 && <div style={{ display:"flex", flexWrap:"wrap", gap:14 }}>
          {notes.map(([n, c]) => <div key={n} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:2 }}><NoteIllustration name={n} size={84}/><span style={{ fontFamily:sans, fontSize:11, color:T.faint }}>{c} fragrance{c !== 1 ? "s" : ""}</span></div>)}
        </div>}
      </InsightCard>

      <InsightCard label="Most owned perfumer" more="Top 3" headline={perfs[0] ? perfs[0][0] : "None yet"} sub={perfs[0] ? `${perfs[0][1]} fragrance${perfs[0][1] !== 1 ? "s" : ""} you own` : "across what you own"}
        hint={perfs.length === 0 ? "Mark a few fragrances as Own on their Tracker tab, and your most owned perfumer shows here." : null}>
        {perfs.length > 0 && <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
          {perfs.map(([n, c]) => <div key={n}>
            <div style={{ display:"flex", alignItems:"center", gap:14 }}><PerfumerPortrait name={titleCaseName(n)} size={64}/><span style={{ fontFamily:serif, fontSize:18, color:T.black, flex:1, minWidth:0 }}>{n}</span><span style={{ fontFamily:sans, fontSize:12, color:T.faint, flexShrink:0 }}>{c} owned</span></div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginTop:10 }}>
              {(ownedFrags[n] || []).slice(0, 12).map(f => <button key={f.id} onClick={() => onOpenFrag && onOpenFrag(f.id)} style={{ fontFamily:sans, fontSize:12, padding:"5px 12px", minHeight:32, borderRadius:20, border:`1px solid ${T.rule}`, background:T.white, color:T.ink, cursor:"pointer", textAlign:"left" }}>{f.name} <span style={{ color:T.faint }}>{f.house}</span></button>)}
            </div>
          </div>)}
        </div>}
      </InsightCard>

      <InsightCard label="Your words" more="All words" headline={words[0] ? words[0][0] : "None yet"} sub={words[0] ? `your most used word ${when}` : when}
        hint={words.length === 0 ? "Open a fragrance, choose its Journal tab and answer a prompt. The words you pick build your scent vocabulary here." : null}>
        {words.length > 0 && <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
          {words.map(([w, c]) => <span key={w} style={{ fontFamily:sans, fontSize:12, padding:"5px 12px", borderRadius:20, border:`1px solid ${T.rule}`, background:T.white, color:T.ink }}>{w} <span style={{ color:T.faint }}>{c}</span></span>)}
        </div>}
      </InsightCard>

      <InsightCard label="Average wear rating" more="Rating spread" headline={avg ? avg.toFixed(1) : "None yet"} sub={avg ? `stars ${when}` : when}
        hint={!avg ? "Rate your wears in the wear log and your rating spread appears here." : null}>
        {avg && <div>
          <div style={{ display:"flex", alignItems:"flex-end", gap:10, height:110 }}>
            {[1,2,3,4,5].map(r => <div key={r} style={{ flex:1, display:"flex", flexDirection:"column", justifyContent:"flex-end", height:"100%" }}><div style={{ height:`${((ratings[r] || 0) / rMax) * 100}%`, minHeight:ratings[r] ? 6 : 0, background:"var(--accent)", borderRadius:8 }}/></div>)}
          </div>
          <div style={{ display:"flex", gap:10, marginTop:6 }}>{[1,2,3,4,5].map(r => <span key={r} style={{ flex:1, textAlign:"center", fontFamily:sans, fontSize:11, color:T.faint }}>{r}★</span>)}</div>
        </div>}
        {worn.length > 0 && <div style={{ marginTop:16, paddingTop:14, borderTop:`1px solid ${T.lift}` }}>
          <p style={{ fontFamily:sans, fontSize:9, textTransform:"uppercase", letterSpacing:"0.1em", color:T.mid, margin:"0 0 10px" }}>Most worn</p>
          {worn.map(({ f, n }) => <div key={f.id} onClick={() => onOpenFrag && onOpenFrag(f.id)} style={{ display:"flex", justifyContent:"space-between", gap:10, marginBottom:8, cursor:"pointer" }}><span style={{ fontFamily:sans, fontSize:13, color:T.ink }}>{f.name} <span style={{ fontSize:11, color:T.faint }}>{f.house}</span></span><span style={{ fontFamily:sans, fontSize:11, color:T.faint, flexShrink:0 }}>{n}×</span></div>)}
          {(topOcc || topWx) && <p style={{ fontFamily:sans, fontSize:11, color:T.faint, margin:"6px 0 0", lineHeight:1.6 }}>You wear most when it is {[topWx && topWx[0], topOcc && topOcc[0] && `for ${topOcc[0]}`].filter(Boolean).join(" ")}.</p>}
        </div>}
      </InsightCard>
    </div>
  );
}

function getResp(msg){const l=msg.toLowerCase();if(l.includes("library")||l.includes("book")||l.includes("paper")||l.includes("autumn"))return CHAT_RESP.library;if(l.includes("quiet")||l.includes("expensive")||l.includes("luxury"))return CHAT_RESP.quiet;if(l.includes("winter")||l.includes("cold")||l.includes("fire"))return CHAT_RESP.winter;return CHAT_RESP.default;}


// ─── SHELVES: large cover tiles, Fable-style ─────────────────────────────────
// Tiles are neutral on purpose: each one holds the bottle photo (frag.image) once images exist.
function CoverTile({ frag, onClick, userStatus, fit }) {
  const owned = userStatus === "bottle_owned";
  const ini = frag.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <button onClick={() => onClick(frag.id)} className="mos-cover" aria-label={`${frag.name} by ${frag.house}`}
      style={{ flex:"0 0 auto", width:fit ? TILE_W : "var(--cover-w)", padding:0, border:"none", background:"none", cursor:"pointer", textAlign:"left", scrollSnapAlign:"start", fontFamily:sans }}>
      <span style={{ display:"block", position:"relative", width:"100%", aspectRatio:"0.8", borderRadius:12, overflow:"hidden", background:T.white, border:`1px solid ${T.rule}` }}>
        {frag.image
          ? <img src={frag.image} alt="" loading="lazy" style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"contain", padding:"8%" }}/>
          : <span style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:serif, fontSize:46, fontWeight:400, letterSpacing:-1, color:T.faint }}>{ini}</span>}
        {userStatus && (
          <span style={{ position:"absolute", top:8, right:8, width:26, height:26, borderRadius:"50%", background:owned?ACCENT_FILL:T.lift, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <Icon name={owned?"bottle":"bookmark"} size={14} color={owned?ON_ACCENT:T.mid}/>
          </span>
        )}
      </span>
      <span style={{ display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden", marginTop:10, minHeight:"2.4em", fontFamily:serif, fontSize:16, lineHeight:1.2, letterSpacing:-0.2, color:T.black }}>{frag.name}</span>
      <span style={{ display:"block", marginTop:3, fontSize:12, color:T.mid, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{frag.house}</span>
      <AccordRibbon accords={frag.accords} style={{ marginTop:8 }}/>
    </button>
  );
}
function Shelf({ title, blurb, items, onOpenFrag, userStatuses, tinted, groups }) {
  const [sel, setSel] = useState("All");
  const names = groups ? Object.keys(groups) : [];
  const shown = groups && sel !== "All" && groups[sel] ? groups[sel] : items;
  const chipBtn = (on, label, fn) => (<button key={label} onClick={fn} aria-pressed={on} style={{ fontFamily:sans, fontSize:14, fontWeight:on?600:500, padding:"0 18px", minHeight:40, borderRadius:20, whiteSpace:"nowrap", border:`1px solid ${on?T.black:T.rule}`, background:on?T.black:T.white, color:on?T.white:T.ink, cursor:"pointer", flexShrink:0 }}>{label}</button>);
  return (
    <section className={"mos-bleed" + (tinted ? " mos-band" : "")} style={{ padding:"26px 0 22px" }}>
      <div className="mos-bleed-pad" style={{ marginBottom:16 }}>
        <h3 style={{ fontFamily:serif, fontSize:"clamp(26px, 2.3vw, 38px)", fontWeight:400, letterSpacing:-0.6, color:T.black, margin:0, lineHeight:1.1 }}>{title}</h3>
        <p style={{ fontFamily:sans, fontSize:"clamp(14px, 1.1vw, 17px)", color:T.mid, margin:"6px 0 0", lineHeight:1.5 }}>{blurb}</p>
        {names.length > 0 && <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginTop:16 }}>{chipBtn(sel === "All", "All", () => setSel("All"))}{names.map(n => chipBtn(sel === n, n, () => setSel(n)))}</div>}
      </div>
      <div className="mos-shelf mos-bleed-pad" style={{ display:"flex", alignItems:"flex-start", gap:14, overflowX:"auto", paddingTop:2, paddingBottom:14, scrollSnapType:"x proximity", WebkitOverflowScrolling:"touch" }}>
        {shown.map(f => <CoverTile key={f.id} frag={f} onClick={onOpenFrag} userStatus={userStatuses[f.id]}/>)}
      </div>
    </section>
  );
}
const ACCORD_BLURBS = {
  woody:"Dry cedar, sandalwood and vetiver. Grounded and quiet.",
  fresh:"Clean, bright and airy. Reaches for the window.",
  floral:"Petals at every stage, from dewy to heady.",
  sweet:"Vanilla, tonka, cocoa and sugar. Soft and edible.",
  smoky:"Incense, tobacco and birch. A room after the fire.",
  fruity:"Juicy tops that turn ripe on skin.",
  citrus:"Peel, zest and sun. Over in a flash, back in a flash.",
  amber:"Resin and warmth that sit close to the skin.",
  musky:"The scent of skin, only better.",
  powdery:"Iris and violet. Soft as a cosmetics drawer.",
  green:"Crushed leaves, stems and rain on grass.",
  leather:"Supple, dark and a little dangerous.",
  "warm spicy":"Cardamom, saffron and pepper with heat to spare.",
  "white floral":"Jasmine, tuberose and gardenia in full bloom.",
  mossy:"Oakmoss and forest floor.",
  aromatic:"Lavender, herbs and sage.",
  oud:"Dark, resinous and deep.",
  gourmand:"Vanilla, tonka, cocoa, caramel and coffee. Soft and edible.",
};
function houseGroups(f) {
  const bo = String(f.brand_origin || "").toLowerCase();
  if (bo === "indie" || bo === "independent") return ["independent"];
  if (bo === "niche") return ["niche"];
  if (bo === "designer") return ["designer"];
  const tier = String(f.price_tier || "").toLowerCase();
  const indie = !!(f.ownership && f.ownership.status === "independent");
  const designer = !indie || tier === "mass-market" || tier === "prestige";
  const g = [];
  if (indie) g.push("independent");
  if (indie && !designer) g.push("niche");
  if (designer) g.push("designer");
  return g;
}
const HOUSE_GROUPS = [
  { key:"all", label:"All" },
  { key:"independent", label:"Indie" },
  { key:"niche", label:"Niche" },
  { key:"designer", label:"Heritage" },
];
// TEMPORARY: show this house under "New to the shelf" so the look can be judged. Set to "" to restore real new releases.
const PREVIEW_NEW_HOUSES = ["conde-parfum", "new-notes", "thoo", "alloy-studio", "rite-of-way", "a-n-other", "jijide"]; // newest uploads first
const PREVIEW_NEW_HOUSE = PREVIEW_NEW_HOUSES[0];
const NEO_BLURB = "Gourmand with an edge. Grain, salt, smoke and savory notes alongside the sweet.";
function buildShelves(list) {
  const shelves = [];
  const add = (key, title, blurb, items, max=12) => { if (items.length >= 2) shelves.push({ key, title, blurb, items: items.slice(0, max) }); };
  const withYear = list.filter(f => Number(f.year) > 0);
  add("new", "New to the shelf", "The most recent releases in the library.", [...withYear].sort((a,b)=>(PREVIEW_NEW_HOUSES.indexOf(a.houseSlug)+1 || 99)-(PREVIEW_NEW_HOUSES.indexOf(b.houseSlug)+1 || 99) || b.year-a.year));
  add("neo", "Neo gourmand", NEO_BLURB, list.filter(f => f.neoGourmand), 12);
  add("indie", "Indie houses", "Made by houses that answer to no conglomerate.", list.filter(f => f.ownership && f.ownership.status === "independent"));
  add("niche", "Niche houses", "Small, independent houses where fragrance is the whole point.", list.filter(f => houseGroups(f).includes("niche")));
  add("designer", "Heritage houses", "The long-established names most people meet first.", list.filter(f => houseGroups(f).includes("designer")));
  const counts = {};
  list.forEach(f => (f.accords||[]).slice(0,3).forEach(a => { const k=String(a.n).toLowerCase(); counts[k]=(counts[k]||0)+1; }));
  Object.entries(counts).filter(([,c])=>c>=3).sort((a,b)=>b[1]-a[1]).slice(0,4).forEach(([k]) => {
    const label = k.replace(/\b\w/g, c => c.toUpperCase());
    add("acc-"+k, label, ACCORD_BLURBS[k] || `Fragrances built around ${k}.`, list.filter(f => (f.accords||[]).slice(0,3).some(a => String(a.n).toLowerCase()===k)));
  });
  return shelves.slice(0, 9);
}

// ─── REQUESTS BOARD ("I want to smell like…", answered by members) ────────────
const REQ_KEYS = ["where","feel","colour","fabric","sound"];
function reqAgo(iso) {
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 3600) return Math.max(1, Math.round(s / 60)) + "m";
  if (s < 86400) return Math.round(s / 3600) + "h";
  return Math.round(s / 86400) + "d";
}
function RequestsBoard({ onOpenFrag, onSearch }) {
  const [rows, setRows] = useState(null);
  const [err, setErr] = useState("");
  const [composing, setComposing] = useState(false);
  const [openId, setOpenId] = useState(null);
  const load = async () => {
    try {
      const { data, error } = await supabase.rpc("list_requests", { p_limit: 40 });
      if (error) throw error;
      setRows(data || []); setErr("");
    } catch (e) { console.error("Requests failed:", e); setRows([]); setErr("That didn't go through. Try again in a moment."); }
  };
  useEffect(() => { load(); }, []);
  return (
    <div style={{ maxWidth:760 }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:12, marginBottom:14 }}>
        <p style={{ fontFamily:sans, fontSize:13, color:T.mid, lineHeight:1.6, margin:0, flex:1 }}>Describe what you want to smell like. Members say what it reminds them of. Every reply is one person's nose.</p>
        {!composing && <button onClick={() => setComposing(true)} style={{ ...ctaBtn(true), width:"auto", padding:"0 20px", minHeight:44, fontSize:14, flexShrink:0 }}>New request</button>}
      </div>
      {composing && <RequestForm onCancel={() => setComposing(false)} onDone={() => { setComposing(false); load(); }}/>}
      {err && <p style={{ fontFamily:sans, fontSize:13, color:T.mid, margin:"12px 0" }}>{err}</p>}
      {rows === null && <p style={{ fontFamily:sans, fontSize:13, color:T.mid, margin:"24px 0" }}>Loading</p>}
      {rows && rows.length === 0 && !err && !composing && (
        <div style={{ background:T.white, border:`1px solid ${T.rule}`, borderRadius:16, padding:"22px 18px", textAlign:"center" }}>
          <p style={{ fontFamily:serif, fontSize:22, color:T.black, margin:"0 0 6px" }}>Start the first request</p>
          <p style={{ fontFamily:sans, fontSize:13, color:T.mid, lineHeight:1.6, margin:"0 0 14px" }}>A place, a fabric, a feeling. Other noses will tell you what it reminds them of.</p>
          <button onClick={() => setComposing(true)} style={{ ...ctaBtn(true), width:"auto", padding:"0 24px", minHeight:44, fontSize:14 }}>New request</button>
        </div>
      )}
      {(rows || []).map(r => (
        <RequestCard key={r.id} r={r} open={openId === r.id} onToggle={() => setOpenId(openId === r.id ? null : r.id)} onChanged={load} onOpenFrag={onOpenFrag} onSearch={onSearch}/>
      ))}
    </div>
  );
}
function RequestForm({ onCancel, onDone }) {
  const [title, setTitle] = useState("");
  const [answers, setAnswers] = useState({});
  const [cons, setCons] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const toggle = (k, w) => setAnswers(a => { const cur = a[k] || []; return { ...a, [k]: cur.includes(w) ? cur.filter(x => x !== w) : [...cur, w] }; });
  const ok = title.trim().length >= 5;
  async function submit() {
    if (!ok) { setMsg("Add a few words about what you want to smell like."); return; }
    setBusy(true); setMsg("");
    const clean = {}; REQ_KEYS.forEach(k => { if ((answers[k] || []).length) clean[k] = answers[k]; });
    const { error } = await supabase.from("requests").insert({ title: title.trim(), answers: clean, constraints_text: cons.trim() || null });
    setBusy(false);
    if (error) { console.error(error); setMsg("That didn't go through. Try again in a moment."); return; }
    onDone();
  }
  return (
    <div style={{ background:T.white, border:`1px solid ${T.rule}`, borderRadius:16, padding:16, marginBottom:16 }}>
      <p style={{ fontFamily:sans, fontSize:12, color:T.mid, margin:"0 0 6px" }}>I want to smell like</p>
      <input value={title} maxLength={160} onChange={e => setTitle(e.target.value)} placeholder="A wet stone courtyard after rain" style={FIELD}/>
      {JPROMPTS.filter(p => REQ_KEYS.includes(p.key)).map(p => (
        <div key={p.key} style={{ marginTop:14 }}>
          <p style={{ fontFamily:sans, fontSize:10, textTransform:"uppercase", letterSpacing:"0.12em", color:T.faint, margin:"0 0 6px" }}>{p.q}</p>
          <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
            {p.chips.map(w => { const on = (answers[p.key] || []).includes(w); return (
              <button key={w} onClick={() => toggle(p.key, w)} aria-pressed={on} style={{ fontFamily:sans, fontSize:13, padding:"0 13px", minHeight:36, borderRadius:18, border:`1px solid ${on ? T.black : T.rule}`, background:on ? T.black : T.white, color:on ? T.white : T.ink, cursor:"pointer" }}>{w}</button>
            ); })}
          </div>
        </div>
      ))}
      <p style={{ fontFamily:sans, fontSize:12, color:T.mid, margin:"14px 0 6px" }}>Anything to avoid, or a budget (optional)</p>
      <input value={cons} maxLength={300} onChange={e => setCons(e.target.value)} placeholder="No florals, under $150" style={FIELD}/>
      {msg && <p style={{ fontFamily:sans, fontSize:13, color:T.mid, margin:"10px 0 0" }}>{msg}</p>}
      <div style={{ display:"flex", gap:8, marginTop:14 }}>
        <button onClick={onCancel} style={{ ...ctaBtn(false), background:T.white, border:`1px solid ${T.rule}`, color:T.ink, cursor:"pointer", width:"auto", padding:"0 20px", minHeight:46, fontSize:14, fontWeight:500 }}>Cancel</button>
        <button onClick={submit} disabled={busy} style={{ ...communityCta(ok), flex:1, minHeight:46, fontSize:14, opacity:busy ? 0.6 : 1, cursor:"pointer" }}>{busy ? "Posting" : "Post request"}</button>
      </div>
    </div>
  );
}
function RequestCard({ r, open, onToggle, onChanged, onOpenFrag, onSearch }) {
  const chips = REQ_KEYS.flatMap(k => Array.isArray(r.answers && r.answers[k]) ? r.answers[k].map(w => k + ": " + w) : []);
  const [replies, setReplies] = useState(null);
  const [frags, setFrags] = useState({});
  const [text, setText] = useState("");
  const [q, setQ] = useState("");
  const [hits, setHits] = useState([]);
  const [pick, setPick] = useState(null);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const loadReplies = async () => {
    try {
      const { data, error } = await supabase.rpc("list_request_replies", { p_request: r.id });
      if (error) throw error;
      setReplies(data || []);
      const ids = [...new Set((data || []).map(x => x.fragrance_id).filter(Boolean))];
      if (ids.length) {
        const fr = await fetchFragRows(sel => supabase.from("fragrances").select(sel).in("id", ids));
        if (!fr.error && fr.data) { const m = {}; fr.data.map(mapFrag).forEach(f => { m[f.id] = f; }); setFrags(m); }
      }
    } catch (e) { console.error(e); setReplies([]); }
  };
  useEffect(() => { if (open && replies === null) loadReplies(); }, [open]);
  useEffect(() => {
    if (!onSearch || q.trim().length < 2) { setHits([]); return; }
    let off = false;
    const t = setTimeout(async () => { try { const x = await onSearch(q.trim(), "all", 0); if (!off) setHits((x.items || []).filter(f => UUID_RE.test(String(f.id))).slice(0, 5)); } catch (e) {} }, 300);
    return () => { off = true; clearTimeout(t); };
  }, [q]);
  async function post() {
    if (text.trim().length < 2) { setNote("Write a few words first."); return; }
    setBusy(true); setNote("");
    const { error } = await supabase.from("request_replies").insert({ request_id: r.id, body: text.trim(), fragrance_id: pick ? pick.id : null });
    setBusy(false);
    if (error) { console.error(error); setNote("That didn't go through. Try again in a moment."); return; }
    setText(""); setQ(""); setPick(null); setHits([]); setReplies(null); await loadReplies(); onChanged();
  }
  async function del(table, id) { const { error } = await supabase.from(table).delete().eq("id", id); if (!error) { if (table === "requests") onChanged(); else { setReplies(null); loadReplies(); onChanged(); } } }
  async function helped(x) { await supabase.rpc("mark_reply_helped", { p_reply: x.id, p_helped: !x.helped }); loadReplies(); }
  async function report(x) { const { error } = await supabase.from("request_reports").insert(x ? { reply_id: x.id } : { request_id: r.id }); setNote(error ? "That didn't go through. Try again in a moment." : "Reported. Thank you."); }
  const small = { fontFamily:sans, fontSize:12, color:T.mid, background:"none", border:"none", cursor:"pointer", padding:"6px 0", minHeight:32 };
  return (
    <div style={{ background:T.white, border:`1px solid ${T.rule}`, borderRadius:16, padding:"14px 16px", marginBottom:12 }}>
      <button onClick={onToggle} aria-expanded={open} style={{ display:"block", width:"100%", textAlign:"left", background:"none", border:"none", padding:0, cursor:"pointer" }}>
        <p style={{ fontFamily:sans, fontSize:12, color:T.mid, margin:"0 0 3px" }}>@{r.username || "member"} · {reqAgo(r.created_at)} ago · I want to smell like</p>
        <p style={{ fontFamily:serif, fontSize:20, lineHeight:1.3, color:T.black, margin:"0 0 8px" }}>{r.title}</p>
        {chips.length > 0 && <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginBottom:8 }}>{chips.map(c => <span key={c} style={{ fontFamily:sans, fontSize:12, padding:"3px 10px", borderRadius:20, background:T.lift, border:`1px solid ${T.rule}`, color:T.ink }}>{c}</span>)}</div>}
        <p style={{ fontFamily:sans, fontSize:12, color:T.faint, margin:0 }}>{r.constraints_text ? r.constraints_text + " · " : ""}{Number(r.reply_count)} {Number(r.reply_count) === 1 ? "reply" : "replies"}</p>
      </button>
      {open && (
        <div style={{ marginTop:14, borderTop:`1px solid ${T.lift}`, paddingTop:12 }}>
          {replies === null && <p style={{ fontFamily:sans, fontSize:13, color:T.mid, margin:"0 0 10px" }}>Loading</p>}
          {replies && replies.length === 0 && <p style={{ fontFamily:sans, fontSize:13, color:T.mid, margin:"0 0 10px" }}>No replies yet. What does it remind you of?</p>}
          {(replies || []).map(x => { const f = x.fragrance_id ? frags[x.fragrance_id] : null; return (
            <div key={x.id} style={{ marginBottom:12, paddingLeft:12, borderLeft:`2px solid ${x.helped ? "var(--accent)" : T.rule}` }}>
              <p style={{ fontFamily:sans, fontSize:12, color:T.mid, margin:"0 0 3px" }}>@{x.username || "member"} · {reqAgo(x.created_at)}{x.helped ? " · helped" : ""}</p>
              <p style={{ fontFamily:sans, fontSize:14, color:T.ink, lineHeight:1.6, margin:0 }}>{x.body}</p>
              {f && <button onClick={() => onOpenFrag(f.id)} style={{ display:"flex", alignItems:"center", gap:10, marginTop:8, padding:"8px 10px", background:T.lift, border:`1px solid ${T.rule}`, borderRadius:10, cursor:"pointer", textAlign:"left", maxWidth:"100%" }}>
                <span><span style={{ display:"block", fontFamily:serif, fontSize:14, color:T.black }}>{f.name}</span><span style={{ display:"block", fontFamily:sans, fontSize:11, color:T.mid }}>{f.house} · Try a sample first</span></span>
              </button>}
              <div style={{ display:"flex", gap:14 }}>
                {r.mine && !x.mine && <button onClick={() => helped(x)} style={small}>{x.helped ? "Undo helped" : "This helped"}</button>}
                {x.mine ? <button onClick={() => del("request_replies", x.id)} style={small}>Delete</button> : <button onClick={() => report(x)} style={small}>Report</button>}
              </div>
            </div>
          ); })}
          <div style={{ marginTop:6 }}>
            <input value={text} maxLength={800} onChange={e => setText(e.target.value)} placeholder="Reminds me of…" style={FIELD}/>
            {pick
              ? <p style={{ fontFamily:sans, fontSize:12, color:T.ink, margin:"8px 0 0" }}>Linking {pick.name} by {pick.house} <button onClick={() => setPick(null)} style={{ ...small, display:"inline", padding:0, minHeight:0, marginLeft:6, textDecoration:"underline" }}>Remove</button></p>
              : onSearch && <input value={q} onChange={e => setQ(e.target.value)} placeholder="Link a fragrance (optional)" style={{ ...FIELD, marginTop:8, minHeight:42, fontSize:16 }}/>}
            {!pick && hits.map(f => <button key={f.id} onClick={() => { setPick(f); setHits([]); setQ(""); }} style={{ display:"block", width:"100%", textAlign:"left", padding:"9px 4px", background:"none", border:"none", borderBottom:`1px solid ${T.lift}`, fontFamily:sans, fontSize:13, color:T.ink, cursor:"pointer" }}>{f.name} <span style={{ color:T.mid }}>· {f.house}</span></button>)}
            {note && <p style={{ fontFamily:sans, fontSize:13, color:T.mid, margin:"8px 0 0" }}>{note}</p>}
            <div style={{ display:"flex", gap:12, alignItems:"center", marginTop:10 }}>
              <button onClick={post} disabled={busy} style={{ ...communityCta(true), width:"auto", padding:"0 22px", minHeight:44, fontSize:14, opacity:busy ? 0.6 : 1, cursor:"pointer" }}>{busy ? "Posting" : "Reply"}</button>
              {r.mine && <button onClick={() => del("requests", r.id)} style={small}>Delete request</button>}
              {!r.mine && <button onClick={() => report(null)} style={small}>Report</button>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── COMMUNITY FEED (shares and thoughts; latest or from people you follow) ───
const POST_BTN = { fontFamily:sans, fontSize:12, color:T.mid, background:"none", border:"none", cursor:"pointer", padding:"6px 0", minHeight:32 };
function postError(error) {
  const m = String((error && error.message) || "");
  return /Slow down|Write between|Pick a fragrance|Finish setting|Sign in/.test(m) ? m : "That didn't go through. Try again in a moment.";
}
function usePostFrags(rows) {
  const [frags, setFrags] = useState({});
  useEffect(() => {
    const ids = [...new Set((rows || []).map(x => x.fragrance_id).filter(Boolean))].filter(id => !frags[id]);
    if (!ids.length) return;
    let live = true;
    fetchFragRows(sel => supabase.from("fragrances").select(sel).in("id", ids)).then(fr => {
      if (!live || fr.error || !fr.data) return;
      setFrags(prev => { const m = { ...prev }; fr.data.map(mapFrag).forEach(f => { m[f.id] = f; }); return m; });
    });
    return () => { live = false; };
  }, [rows]);
  return frags;
}
const AVATAR_COMMUNITY = { borderRadius:"50%", background:"var(--tangerine)", color:"var(--on-tang)", border:"none", fontFamily:sans, fontWeight:600, flexShrink:0 };
function PostCard({ p, frag, onOpenProfile, onOpenFrag, onChanged, inThread }) {
  const [confirm, setConfirm] = useState(false);
  const [note, setNote] = useState("");
  const [thread, setThread] = useState(false);
  async function del() { const { error } = await supabase.rpc("delete_post", { p_id: p.id }); if (error) { setNote(postError(error)); setConfirm(false); return; } onChanged(); }
  async function report() { const { error } = await supabase.rpc("report_post", { p_id: p.id }); setNote(error ? postError(error) : "Reported. Thank you."); }
  const rc = Number(p.reply_count) || 0;
  return (
    <article style={{ background:"var(--tang-soft)", border:"1px solid var(--tang-line)", color:"var(--tang-ink)", borderRadius:16, padding:"14px 16px", marginBottom:12 }}>
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
        <button onClick={() => onOpenProfile(p.username)} aria-label={"Open @" + p.username} style={{ ...AVATAR_COMMUNITY, width:36, height:36, cursor:"pointer", fontSize:13 }}>{String(p.username).slice(0, 2).toUpperCase()}</button>
        <div style={{ minWidth:0, flex:1 }}>
          <button onClick={() => onOpenProfile(p.username)} style={{ background:"none", border:"none", padding:0, cursor:"pointer", fontFamily:serif, fontSize:15, color:"var(--tang-ink)" }}>@{p.username}</button>
          {p.country && <span style={{ marginLeft:6, fontSize:13 }}>{countryFlag(p.country)}</span>}
          <p style={{ fontFamily:sans, fontSize:12, color:"var(--tang-ink)", opacity:0.8, margin:"1px 0 0" }}>{p.kind === "share" ? "Shared a fragrance" : "Shared a thought"} · {reqAgo(p.created_at)}{p.audience === "followers" ? " · Followers" : ""}</p>
        </div>
      </div>
      <p style={{ fontFamily:sans, fontSize:15, lineHeight:1.65, margin:0, color:"var(--tang-ink)", whiteSpace:"pre-wrap", overflowWrap:"anywhere" }}>{p.body}</p>
      {p.fragrance_id && frag && (
        <button onClick={() => onOpenFrag(frag.id)} style={{ display:"flex", alignItems:"center", gap:10, marginTop:10, padding:"10px 12px", background:"var(--tang-chip)", border:"1px solid var(--tang-line)", borderRadius:12, cursor:"pointer", textAlign:"left", maxWidth:"100%" }}>
          <span><span style={{ display:"block", fontFamily:serif, fontSize:15, color:"var(--tang-ink)" }}>{frag.name}</span><span style={{ display:"block", fontFamily:sans, fontSize:12, color:"var(--tang-ink)", opacity:0.85 }}>{frag.house}</span></span>
        </button>
      )}
      <div style={{ display:"flex", gap:14, alignItems:"center", marginTop:6, flexWrap:"wrap" }}>
        {!inThread && <button onClick={() => setThread(true)} style={{ ...POST_BTN, color:"var(--tang-ink)", fontWeight:700, textDecoration:"underline" }}>{rc > 0 ? rc + (rc === 1 ? " reply" : " replies") : "Reply"}</button>}
        {p.can_delete && !confirm && <button onClick={() => setConfirm(true)} style={{ ...POST_BTN, color:"var(--tang-ink)" }}>Delete</button>}
        {p.can_delete && confirm && <span style={{ fontFamily:sans, fontSize:12, color:"var(--tang-ink)" }}>Delete this post? <button onClick={del} style={{ ...POST_BTN, color:"var(--tang-ink)", fontWeight:700, textDecoration:"underline", display:"inline", padding:"0 6px" }}>Yes</button><button onClick={() => setConfirm(false)} style={{ ...POST_BTN, display:"inline", padding:"0 6px" }}>No</button></span>}
        {!p.mine && <button onClick={report} style={{ ...POST_BTN, color:"var(--tang-ink)" }}>Report</button>}
        {Number(p.report_count) > 0 && <span style={{ fontFamily:sans, fontSize:12, color:"var(--tang-ink)", fontWeight:700 }}>Reported by {Number(p.report_count)}</span>}
        {note && <span style={{ fontFamily:sans, fontSize:12, color:"var(--tang-ink)" }}>{note}</span>}
      </div>
      {thread && <PostThread postId={p.id} onClose={() => setThread(false)} onChanged={onChanged} onOpenProfile={onOpenProfile} onOpenFrag={onOpenFrag}/>}
    </article>
  );
}
function ReplyRow({ r, onOpenProfile, onChanged }) {
  const [confirm, setConfirm] = useState(false);
  const [note, setNote] = useState("");
  async function del() { const { error } = await supabase.rpc("delete_reply", { p_id: r.id }); if (error) { setNote(postError(error)); setConfirm(false); return; } onChanged(); }
  async function report() { const { error } = await supabase.rpc("report_reply", { p_id: r.id }); setNote(error ? postError(error) : "Reported. Thank you."); }
  return (
    <div style={{ marginBottom:14, paddingLeft:12, borderLeft:`2px solid var(--tangerine)` }}>
      <p style={{ fontFamily:sans, fontSize:12, color:T.mid, margin:"0 0 3px" }}>
        <button onClick={() => onOpenProfile(r.username)} style={{ background:"none", border:"none", padding:0, cursor:"pointer", fontFamily:sans, fontSize:12, color:T.ink, fontWeight:600 }}>@{r.username}</button>
        {r.country && <span style={{ marginLeft:5 }}>{countryFlag(r.country)}</span>} · {reqAgo(r.created_at)}
      </p>
      <p style={{ fontFamily:sans, fontSize:14, color:T.ink, lineHeight:1.6, margin:0, whiteSpace:"pre-wrap", overflowWrap:"anywhere" }}>{r.body}</p>
      <div style={{ display:"flex", gap:14, alignItems:"center", flexWrap:"wrap" }}>
        {r.can_delete && !confirm && <button onClick={() => setConfirm(true)} style={POST_BTN}>Delete</button>}
        {r.can_delete && confirm && <span style={{ fontFamily:sans, fontSize:12, color:T.mid }}>Delete this reply? <button onClick={del} style={{ ...POST_BTN, color:T.bad, display:"inline", padding:"0 6px" }}>Yes</button><button onClick={() => setConfirm(false)} style={{ ...POST_BTN, display:"inline", padding:"0 6px" }}>No</button></span>}
        {!r.mine && <button onClick={report} style={POST_BTN}>Report</button>}
        {note && <span style={{ fontFamily:sans, fontSize:12, color:T.mid }}>{note}</span>}
      </div>
    </div>
  );
}
// A post with its replies and a reply box. Opens from a post card or from a notification.
function PostThread({ postId, onClose, onChanged, onOpenProfile, onOpenFrag }) {
  const [post, setPost] = useState(undefined);   // undefined = loading, null = not available
  const [replies, setReplies] = useState(null);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const frags = usePostFrags(post ? [post] : []);
  const load = async () => {
    const [a, b] = await Promise.all([supabase.rpc("get_post", { p_id: postId }), supabase.rpc("list_post_replies", { p_post: postId })]);
    setPost(!a.error && a.data && a.data[0] ? a.data[0] : null);
    setReplies(b.error ? [] : (b.data || []));
  };
  useEffect(() => { load(); }, [postId]);
  async function send() {
    if (!text.trim()) { setMsg("Write a few words first."); return; }
    setBusy(true); setMsg("");
    const { error } = await supabase.rpc("create_reply", { p_post: postId, p_body: text.trim() });
    setBusy(false);
    if (error) { console.error(error); setMsg(postError(error)); return; }
    setText(""); await load(); onChanged && onChanged();
  }
  const goProfile = u => { onClose(); onOpenProfile(u); };
  const goFrag = id => { onClose(); onOpenFrag(id); };
  return createPortal(
    <div className="mos-sheet-wrap" onClick={onClose} style={{ position:"fixed", inset:0, zIndex:62, background:"rgba(10,10,10,0.5)", backdropFilter:"blur(12px)", display:"flex", flexDirection:"column", justifyContent:"flex-end", alignItems:"center" }}>
      <div className="mos-sheet" onClick={e => e.stopPropagation()} style={{ background:T.white, borderRadius:"24px 24px 0 0", border:`1px solid ${T.rule}`, borderBottom:"none", width:"100%", maxWidth:460, maxHeight:"92vh", overflowY:"auto" }}>
        <div className="mos-pad" style={{ padding:"20px 24px 32px" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
            <h2 style={{ fontFamily:serif, fontSize:20, fontWeight:400, color:T.black, margin:0 }}>Post</h2>
            <button onClick={onClose} aria-label="Close" style={{ width:30, height:30, borderRadius:"50%", border:`1px solid ${T.rule}`, background:T.white, cursor:"pointer", fontSize:13, color:T.mid }}>✕</button>
          </div>
          {post === undefined && <p style={{ fontFamily:sans, fontSize:13, color:T.mid }}>Loading</p>}
          {post === null && <p style={{ fontFamily:serif, fontSize:18, color:T.faint, margin:"16px 0" }}>This post is no longer available.</p>}
          {post && <PostCard p={post} frag={post.fragrance_id ? frags[post.fragrance_id] : null} inThread onOpenProfile={goProfile} onOpenFrag={goFrag} onChanged={() => { onChanged && onChanged(); onClose(); }}/>}
          {post && (
            <div style={{ marginTop:8 }}>
              <p style={{ ...FLABEL, margin:"0 0 10px" }}>Replies{replies && replies.length ? " (" + replies.length + ")" : ""}</p>
              {replies === null && <p style={{ fontFamily:sans, fontSize:13, color:T.mid }}>Loading</p>}
              {replies && replies.length === 0 && <p style={{ fontFamily:sans, fontSize:13, color:T.mid, margin:"0 0 14px" }}>No replies yet.</p>}
              {(replies || []).map(r => <ReplyRow key={r.id} r={r} onOpenProfile={goProfile} onChanged={() => { load(); onChanged && onChanged(); }}/>)}
              <textarea value={text} onChange={e => setText(e.target.value.slice(0, 500))} rows={3} placeholder="Write a reply" aria-label="Write a reply" style={{ ...FIELD, padding:"12px 14px", lineHeight:1.5, resize:"vertical", marginTop:6 }}/>
              {msg && <p style={{ fontFamily:sans, fontSize:13, color:T.bad, margin:"8px 0 0" }}>{msg}</p>}
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginTop:10 }}>
                <span style={{ fontFamily:sans, fontSize:11, color:T.faint }}>{text.length} / 500</span>
                <button onClick={send} disabled={busy} style={{ ...communityCta(text.trim().length > 0), width:"auto", padding:"0 24px", minHeight:44, fontSize:14, opacity:busy ? 0.6 : 1 }}>{busy ? "Sending" : "Reply"}</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
// The bell: replies to your posts and requests, and new followers.
function NotificationsSheet({ onClose, onOpen, onRead }) {
  const [rows, setRows] = useState(null);
  useEffect(() => {
    let live = true;
    supabase.rpc("list_notifications", { p_limit: 40 }).then(async ({ data, error }) => {
      if (!live) return;
      setRows(error ? [] : (data || []));
      if (!error && (data || []).some(n => !n.is_read)) { await supabase.rpc("mark_notifications_read"); onRead && onRead(); }
    });
    return () => { live = false; };
  }, []);
  const text = n => n.kind === "follow" ? "started following you" : n.kind === "request_reply" ? "replied to your request" : "replied to your post";
  return createPortal(
    <div className="mos-sheet-wrap" onClick={onClose} style={{ position:"fixed", inset:0, zIndex:62, background:"rgba(10,10,10,0.5)", backdropFilter:"blur(12px)", display:"flex", flexDirection:"column", justifyContent:"flex-end", alignItems:"center" }}>
      <div className="mos-sheet" onClick={e => e.stopPropagation()} style={{ background:T.white, borderRadius:"24px 24px 0 0", border:`1px solid ${T.rule}`, borderBottom:"none", width:"100%", maxWidth:460, height:"75vh", display:"flex", flexDirection:"column" }}>
        <div className="mos-pad" style={{ padding:"20px 24px 12px", display:"flex", alignItems:"center", justifyContent:"space-between", borderBottom:`1px solid ${T.rule}` }}>
          <h2 style={{ fontFamily:serif, fontSize:22, fontWeight:400, color:T.black, margin:0 }}>Notifications</h2>
          <button onClick={onClose} aria-label="Close" style={{ width:30, height:30, borderRadius:"50%", border:`1px solid ${T.rule}`, background:T.white, cursor:"pointer", fontSize:13, color:T.mid }}>✕</button>
        </div>
        <div className="mos-pad" style={{ padding:"4px 24px 32px", overflowY:"auto", flex:1 }}>
          {rows === null && <p style={{ fontFamily:sans, fontSize:13, color:T.mid, padding:"16px 0", margin:0 }}>Loading</p>}
          {rows && rows.length === 0 && (
            <div style={{ textAlign:"center", padding:"40px 0" }}>
              <p style={{ fontFamily:serif, fontSize:18, color:T.faint, margin:"0 0 8px" }}>Nothing yet</p>
              <p style={{ fontFamily:sans, fontSize:13, color:T.faint, margin:0, lineHeight:1.6 }}>Replies to your posts and requests, and new followers, show up here.</p>
            </div>
          )}
          {(rows || []).map((n, i) => (
            <button key={n.id} onClick={() => onOpen(n)} style={{ display:"flex", alignItems:"flex-start", gap:12, width:"100%", textAlign:"left", padding:"14px 0", background:"none", border:"none", borderBottom: i < rows.length - 1 ? `1px solid ${T.lift}` : "none", cursor:"pointer" }}>
              <span aria-hidden="true" style={{ width:8, height:8, borderRadius:"50%", background:n.is_read ? "transparent" : "var(--tangerine)", marginTop:7, flexShrink:0 }}/>
              <span style={{ flex:1, minWidth:0 }}>
                <span style={{ display:"block", fontFamily:sans, fontSize:14, color:T.ink, lineHeight:1.5 }}><strong style={{ fontWeight:600 }}>@{n.username || "someone"}</strong> {text(n)}</span>
                {n.preview && <span style={{ display:"block", fontFamily:sans, fontSize:13, color:T.mid, marginTop:2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>“{n.preview}”</span>}
                <span style={{ display:"block", fontFamily:sans, fontSize:11, color:T.faint, marginTop:3 }}>{reqAgo(n.created_at)} ago</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
}
// Opens one request (with its replies) from a notification.
function RequestSheet({ requestId, onClose, onOpenFrag, onSearch }) {
  const [row, setRow] = useState(undefined);
  const load = async () => {
    const { data, error } = await supabase.rpc("list_requests", { p_limit: 100 });
    setRow(error ? null : ((data || []).find(r => r.id === requestId) || null));
  };
  useEffect(() => { load(); }, [requestId]);
  return createPortal(
    <div className="mos-sheet-wrap" onClick={onClose} style={{ position:"fixed", inset:0, zIndex:62, background:"rgba(10,10,10,0.5)", backdropFilter:"blur(12px)", display:"flex", flexDirection:"column", justifyContent:"flex-end", alignItems:"center" }}>
      <div className="mos-sheet" onClick={e => e.stopPropagation()} style={{ background:T.white, borderRadius:"24px 24px 0 0", border:`1px solid ${T.rule}`, borderBottom:"none", width:"100%", maxWidth:460, maxHeight:"92vh", overflowY:"auto" }}>
        <div className="mos-pad" style={{ padding:"20px 24px 32px" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
            <h2 style={{ fontFamily:serif, fontSize:20, fontWeight:400, color:T.black, margin:0 }}>Request</h2>
            <button onClick={onClose} aria-label="Close" style={{ width:30, height:30, borderRadius:"50%", border:`1px solid ${T.rule}`, background:T.white, cursor:"pointer", fontSize:13, color:T.mid }}>✕</button>
          </div>
          {row === undefined && <p style={{ fontFamily:sans, fontSize:13, color:T.mid }}>Loading</p>}
          {row === null && <p style={{ fontFamily:serif, fontSize:18, color:T.faint, margin:"16px 0" }}>This request is no longer available.</p>}
          {row && <RequestCard r={row} open onToggle={() => {}} onChanged={() => { load(); }} onOpenFrag={id => { onClose(); onOpenFrag(id); }} onSearch={onSearch}/>}
        </div>
      </div>
    </div>,
    document.body
  );
}
function PostComposer({ onClose, onPosted, onSearch }) {
  const [kind, setKind] = useState("share");
  const [audience, setAudience] = useState("everyone");
  const [body, setBody] = useState("");
  const [pick, setPick] = useState(null);
  const [q, setQ] = useState("");
  const [hits, setHits] = useState([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  useEffect(() => {
    if (!onSearch || q.trim().length < 2) { setHits([]); return; }
    let off = false;
    const t = setTimeout(async () => { try { const x = await onSearch(q.trim(), "all", 0); if (!off) setHits((x.items || []).filter(f => UUID_RE.test(String(f.id))).slice(0, 5)); } catch (e) {} }, 300);
    return () => { off = true; clearTimeout(t); };
  }, [q]);
  const ok = body.trim().length >= 1 && (kind !== "share" || !!pick);
  async function submit() {
    if (!ok) { setMsg(kind === "share" && !pick ? "Pick a fragrance to share." : "Write something first."); return; }
    setBusy(true); setMsg("");
    const { error } = await supabase.rpc("create_post", { p_kind: kind, p_body: body.trim(), p_fragrance: pick ? pick.id : null, p_audience: audience });
    setBusy(false);
    if (error) { console.error(error); setMsg(postError(error)); return; }
    onPosted();
  }
  const pill = on => ({ flex:1, minHeight:44, borderRadius:12, border:`1px solid ${on ? T.black : T.rule}`, background:on ? T.black : T.white, color:on ? T.white : T.ink, fontFamily:sans, fontSize:14, cursor:"pointer" });
  return createPortal(
    <div className="mos-sheet-wrap" onClick={onClose} style={{ position:"fixed", inset:0, zIndex:62, background:"rgba(10,10,10,0.5)", backdropFilter:"blur(12px)", display:"flex", flexDirection:"column", justifyContent:"flex-end", alignItems:"center" }}>
      <div className="mos-sheet" onClick={e => e.stopPropagation()} style={{ background:T.white, borderRadius:"24px 24px 0 0", border:`1px solid ${T.rule}`, borderBottom:"none", width:"100%", maxWidth:460, maxHeight:"92vh", overflowY:"auto" }}>
        <div className="mos-pad" style={{ padding:"20px 24px 32px" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
            <button onClick={onClose} style={{ ...POST_BTN, fontSize:15 }}>Cancel</button>
            <h2 style={{ fontFamily:serif, fontSize:20, fontWeight:400, color:T.black, margin:0 }}>New post</h2>
            {kind === "request" ? <span style={{ width:64 }}/> : <button onClick={submit} disabled={busy} style={{ ...communityCta(ok), width:"auto", padding:"0 20px", minHeight:40, fontSize:14, opacity:busy ? 0.6 : 1, cursor:"pointer" }}>{busy ? "Posting" : "Share"}</button>}
          </div>
          <p style={{ ...FLABEL, margin:"0 0 6px" }}>Type</p>
          <div style={{ display:"flex", gap:8, marginBottom:14 }}>
            <button onClick={() => setKind("share")} aria-pressed={kind === "share"} style={{ ...pill(kind === "share"), fontSize:13 }}>A fragrance</button>
            <button onClick={() => setKind("thought")} aria-pressed={kind === "thought"} style={{ ...pill(kind === "thought"), fontSize:13 }}>A thought</button>
            <button onClick={() => setKind("request")} aria-pressed={kind === "request"} style={{ ...pill(kind === "request"), fontSize:13 }}>A request</button>
          </div>
          {kind === "request" && <RequestForm onCancel={onClose} onDone={onPosted}/>}
          {kind !== "request" && <>
          <p style={{ ...FLABEL, margin:"0 0 6px" }}>Who can see it</p>
          <div style={{ display:"flex", gap:8, marginBottom:14 }}>
            <button onClick={() => setAudience("everyone")} aria-pressed={audience === "everyone"} style={pill(audience === "everyone")}>Everyone</button>
            <button onClick={() => setAudience("followers")} aria-pressed={audience === "followers"} style={pill(audience === "followers")}>Followers</button>
          </div>
          <textarea value={body} onChange={e => setBody(e.target.value.slice(0, 750))} rows={5} autoFocus placeholder={kind === "share" ? "How does it wear on you?" : "What do you want to say?"} style={{ ...FIELD, padding:"12px 14px", lineHeight:1.5, resize:"vertical" }}/>
          <p style={{ fontFamily:sans, fontSize:11, color:T.faint, margin:"4px 0 12px", textAlign:"right" }}>{body.length} / 750</p>
          {pick
            ? <p style={{ fontFamily:sans, fontSize:13, color:T.ink, margin:"0 0 8px" }}>Attached: <strong style={{ fontWeight:600 }}>{pick.name}</strong> by {pick.house} <button onClick={() => setPick(null)} style={{ ...POST_BTN, display:"inline", padding:0, minHeight:0, marginLeft:6, textDecoration:"underline" }}>Remove</button></p>
            : onSearch && <input value={q} onChange={e => setQ(e.target.value)} placeholder={kind === "share" ? "Find the fragrance to share" : "Attach a fragrance (optional)"} aria-label="Find a fragrance" style={FIELD}/>}
          {!pick && hits.map(f => <button key={f.id} onClick={() => { setPick(f); setHits([]); setQ(""); }} style={{ display:"block", width:"100%", textAlign:"left", padding:"10px 4px", background:"none", border:"none", borderBottom:`1px solid ${T.lift}`, fontFamily:sans, fontSize:14, color:T.ink, cursor:"pointer" }}>{f.name} <span style={{ color:T.mid }}>· {f.house}</span></button>)}
          {msg && <p style={{ fontFamily:sans, fontSize:13, color:T.bad, margin:"10px 0 0" }}>{msg}</p>}
          <p style={{ fontFamily:sans, fontSize:12, color:T.faint, margin:"14px 0 0", lineHeight:1.5 }}>Your collection, wears and journal stay private. Only what you write here is shared.</p>
          </>}
        </div>
      </div>
    </div>,
    document.body
  );
}
function CommunityFeed({ onOpenProfile, onOpenFrag, onSearch, following }) {
  const [feed, setFeed] = useState("latest");
  const [rows, setRows] = useState(null);
  const [err, setErr] = useState("");
  const [composing, setComposing] = useState(false);
  const [openId, setOpenId] = useState(null);
  const frags = usePostFrags(rows);
  // Posts and requests share one feed, newest first. Latest shows both, Following shows people you follow, Requests shows only requests.
  const load = async (f = feed) => {
    const [pr, rr] = await Promise.all([
      f === "requests" ? Promise.resolve({ data: [] }) : supabase.rpc("list_posts", { p_feed: f === "following" ? "following" : "latest", p_limit: 50 }),
      supabase.rpc("list_requests", { p_limit: 50 }),
    ]);
    if (pr.error && rr.error) { console.error("Feed failed:", pr.error, rr.error); setRows([]); setErr("That didn't go through. Try again in a moment."); return; }
    const fol = following || new Set();
    const reqs = (rr.data || []).filter(r => f !== "following" || r.mine || fol.has(String(r.username || "").toLowerCase()));
    const all = [...(pr.data || []).map(x => ({ ...x, _k: "post" })), ...reqs.map(x => ({ ...x, _k: "request" }))]
      .sort((x, y) => new Date(y.created_at) - new Date(x.created_at));
    setRows(all); setErr("");
  };
  useEffect(() => { setRows(null); load(feed); }, [feed]);
  const chip = on => ({ fontFamily:sans, fontSize:13, padding:"0 16px", minHeight:38, borderRadius:20, border:`1px solid ${on ? T.black : T.rule}`, background:on ? T.black : T.white, color:on ? T.white : T.ink, cursor:"pointer" });
  const emptyTitle = feed === "following" ? "Nothing from people you follow yet" : feed === "requests" ? "No requests yet" : "Be the first to post";
  const emptyBody = feed === "following" ? "Follow a few members and their posts and requests will show up here, newest first." : feed === "requests" ? "Describe what you want to smell like. Other noses will tell you what it reminds them of." : "Share a fragrance you are wearing, a thought, or a request for what to smell like.";
  return (
    <div style={{ maxWidth:760 }}>
      <div style={{ display:"flex", gap:8, marginBottom:14, flexWrap:"wrap" }}>
        <button onClick={() => setFeed("latest")} aria-pressed={feed === "latest"} style={chip(feed === "latest")}>Latest</button>
        <button onClick={() => setFeed("following")} aria-pressed={feed === "following"} style={chip(feed === "following")}>Following</button>
        <button onClick={() => setFeed("requests")} aria-pressed={feed === "requests"} style={chip(feed === "requests")}>Requests</button>
      </div>
      <button onClick={() => setComposing(true)} style={{ display:"block", width:"100%", textAlign:"left", background:T.white, border:`1px solid ${T.rule}`, borderRadius:16, padding:"14px 16px", marginBottom:14, cursor:"pointer", fontFamily:sans, fontSize:15, color:T.faint }}>What do you want to say?</button>
      {err && <p style={{ fontFamily:sans, fontSize:13, color:T.mid, margin:"12px 0" }}>{err}</p>}
      {rows === null && <p style={{ fontFamily:sans, fontSize:13, color:T.mid, margin:"24px 0" }}>Loading</p>}
      {rows && rows.length === 0 && !err && (
        <div style={{ background:T.white, border:`1px solid ${T.rule}`, borderRadius:16, padding:"22px 18px", textAlign:"center" }}>
          <p style={{ fontFamily:serif, fontSize:22, color:T.black, margin:"0 0 6px" }}>{emptyTitle}</p>
          <p style={{ fontFamily:sans, fontSize:13, color:T.mid, lineHeight:1.6, margin:"0 0 14px" }}>{emptyBody}</p>
          <button onClick={() => setComposing(true)} style={{ ...communityCta(true), width:"auto", padding:"0 24px", minHeight:44, fontSize:14 }}>Create post</button>
        </div>
      )}
      {(rows || []).map(p => p._k === "request"
        ? <RequestCard key={"r" + p.id} r={p} open={openId === p.id} onToggle={() => setOpenId(openId === p.id ? null : p.id)} onChanged={() => load(feed)} onOpenFrag={onOpenFrag} onSearch={onSearch}/>
        : <PostCard key={"p" + p.id} p={p} frag={p.fragrance_id ? frags[p.fragrance_id] : null} onOpenProfile={onOpenProfile} onOpenFrag={onOpenFrag} onChanged={() => load(feed)}/>)}
      <button className="mos-fab" onClick={() => setComposing(true)} style={{ display:"flex", alignItems:"center", gap:8, height:52, padding:"0 22px", borderRadius:26, border:"none", background:"var(--tangerine)", color:"var(--on-tang)", fontFamily:sans, fontSize:15, fontWeight:600, cursor:"pointer", boxShadow:"0 6px 20px rgba(0,0,0,0.25)" }}><span style={{ fontSize:22, lineHeight:1 }}>+</span>Create post</button>
      {composing && <PostComposer onClose={() => setComposing(false)} onSearch={onSearch} onPosted={() => { setComposing(false); setFeed("latest"); setRows(null); load("latest"); }}/>}
    </div>
  );
}

// Set to true to bring the AI Nose tab back. Requests replaces it for now.
const NOSE_ENABLED = false;
// ─── DISCOVERY KITS SHELF ─────────────────────────────────────────────────────
// Houses whose own site sells a discovery set or samples. Links go to the brand, never through a retailer.
let _kitsCache = null;
async function loadKits() {
  if (_kitsCache) return _kitsCache;
  const out = [];
  for (let from = 0; from < 2000; from += 100) {
    const r = await supabase.from("houses").select("id, name, slug, country, brand_origin, kit_name, kit_price, kit_url, kit_image_url, kit_image_credit, website").eq("has_discovery_kit", true).order("name").range(from, from + 99);
    if (r.error) throw r.error;
    out.push(...(r.data || []));
    if ((r.data || []).length < 100) break;
  }
  let counts = new Map();
  try { (await loadBrands()).forEach(b => counts.set(b.slug, Number(b.frag_count) || 0)); } catch (e) {}
  // Kits with a picture first (stable sort keeps A to Z inside each group)
  _kitsCache = out.map(h => ({ ...h, url: h.kit_url || h.website || "", n: counts.get(h.slug) || 0 })).filter(h => h.url).sort((x, y) => (y.kit_image_url ? 1 : 0) - (x.kit_image_url ? 1 : 0));
  return _kitsCache;
}
const KIT_STATES = [["own","Own"],["wishlist","Wishlist"],["finished","Finished"]];
function KitChips({ status, onSet }) {
  return (
    <div role="group" aria-label="Track this discovery kit" style={{ marginTop:12 }}>
      <p style={{ fontFamily:sans, fontSize:11, textTransform:"uppercase", letterSpacing:"0.12em", color:T.mid, margin:"0 0 6px" }}>Track this kit</p>
      <div style={{ display:"flex", gap:6 }}>
        {KIT_STATES.map(([k, l]) => { const on = status === k; return <button key={k} onClick={() => onSet(on ? null : k)} aria-pressed={on} style={{ flex:1, minHeight:38, padding:"0 6px", borderRadius:20, border:`1px solid ${on ? "transparent" : T.rule}`, background:on ? "var(--accent)" : T.white, color:on ? "#fff" : T.ink, fontFamily:sans, fontSize:13, fontWeight:on ? 600 : 400, cursor:"pointer" }}>{l}</button>; })}
      </div>
    </div>
  );
}
async function setKitStatus(houseId, status, had) {
  if (!status) return supabase.from("user_kits").delete().eq("house_id", houseId);
  const now = new Date().toISOString();
  const patch = { status, updated_at: now, finished_on: status === "finished" ? todayISO() : null };
  return had ? supabase.from("user_kits").update(patch).eq("house_id", houseId) : supabase.from("user_kits").insert({ house_id: houseId, ...patch });
}
function KitsShelf({ onOpenBrand, tinted }) {
  const [rows, setRows] = useState(null);
  const [mine, setMine] = useState({});
  useEffect(() => { let off = false; pageAll((a, b) => supabase.from("user_kits").select("house_id, status").order("house_id").range(a, b)).then(r => { if (off || r.error) return; const m = {}; (r.data || []).forEach(x => { m[x.house_id] = x.status; }); setMine(m); }).catch(() => {}); return () => { off = true; }; }, []);
  const trackKit = async (h, st) => {
    const had = !!mine[h.id], prev = mine[h.id] || null;
    setMine(p => { const n = { ...p }; if (st) n[h.id] = st; else delete n[h.id]; return n; });
    const { error } = await setKitStatus(h.id, st, had);
    if (error) setMine(p => { const n = { ...p }; if (prev) n[h.id] = prev; else delete n[h.id]; return n; });
  };
  const [all, setAll] = useState(false);
  const [q, setQ] = useState("");
  useEffect(() => { let off = false; loadKits().then(d => { if (!off) setRows(d); }).catch(() => { if (!off) setRows([]); }); return () => { off = true; }; }, []);
  const featured = useMemo(() => {
    if (!rows) return [];
    const day = Math.floor(Date.now() / 86400000);
    const seeded = h => { let x = 0; const s = h.slug + day; for (let i = 0; i < s.length; i++) x = (x * 31 + s.charCodeAt(i)) >>> 0; return x; };
    // Kits with a photo come first; within each group the daily shuffle applies.
    return [...rows].sort((a, b) => (!!b.kit_image_url - !!a.kit_image_url) || (seeded(a) - seeded(b))).slice(0, 12);
  }, [rows]);
  if (!rows || rows.length === 0) return null;
  const needle = q.trim().toLowerCase();
  const shown = all ? [...rows].sort((a, b) => (!!b.kit_image_url - !!a.kit_image_url) || String(a.name).localeCompare(String(b.name))).filter(h => !needle || [h.name, h.country].some(v => String(v || "").toLowerCase().includes(needle))) : featured;
  const card = h => (
    <div key={h.id} style={{ flex:all ? "1 1 240px" : "0 0 252px", maxWidth:all ? "none" : 252, boxSizing:"border-box", background:T.white, border:`1px solid ${T.rule}`, borderRadius:16, padding:"16px 16px 14px", display:"flex", flexDirection:"column", scrollSnapAlign:"start" }}>
      {h.kit_image_url && <div style={{ margin:"-4px -4px 12px" }}>
        <img src={h.kit_image_url} alt={(h.kit_name || "Discovery set") + " by " + h.name} loading="lazy" style={{ display:"block", width:"100%", aspectRatio:"1 / 1", objectFit:"contain", background:"#fff", borderRadius:10 }} onError={e => { e.currentTarget.parentNode.style.display = "none"; }}/>
        {h.kit_image_credit && <span style={{ display:"block", fontFamily:sans, fontSize:11, color:T.mid, marginTop:4, textAlign:"center" }}>{h.kit_image_credit}</span>}
      </div>}
      <button onClick={() => onOpenBrand && onOpenBrand({ slug:h.slug, name:h.name })} style={{ textAlign:"left", background:"none", border:"none", padding:0, cursor:"pointer" }}>
        <span style={{ display:"block", fontFamily:serif, fontSize:20, color:T.black, lineHeight:1.2 }}>{String(h.name).replace(/\s*\(now .*\)$/, "")}</span>
        <span style={{ display:"block", fontFamily:sans, fontSize:12, color:T.mid, margin:"4px 0 0" }}>{[h.country, h.brand_origin].filter(Boolean).join(" · ")}{h.n ? (h.country || h.brand_origin ? " · " : "") + h.n + " fragrance" + (h.n === 1 ? "" : "s") : ""}</span>
      </button>
      <p style={{ fontFamily:sans, fontSize:14, color:T.ink, margin:"12px 0 0", lineHeight:1.4, flex:"1 1 auto" }}>{h.kit_name || "Discovery set or samples"}</p>
      <p style={{ fontFamily:sans, fontSize:14, color:T.teal, fontWeight:600, margin:"6px 0 0", lineHeight:1.4, minHeight:20 }}>{h.kit_price || ""}</p>
      <KitChips status={mine[h.id] || null} onSet={st => trackKit(h, st)}/>
      <a href={h.url} target="_blank" rel="noopener noreferrer" onClick={() => trackEvent("brand_site_click", { houseSlug:h.slug, source:"kits", detail:"kit" })} style={{ ...ctaBtn(true), marginTop:"auto", display:"inline-flex", alignItems:"center", justifyContent:"center", textDecoration:"none", minHeight:40, fontSize:13, paddingTop:0, paddingBottom:0, marginBlockStart:14 }}>Get it from the brand ↗</a>
    </div>
  );
  return (
    <section className={"mos-bleed" + (tinted ? " mos-band" : "")} style={{ padding:"26px 0 22px" }}>
      <div className="mos-bleed-pad" style={{ marginBottom:16 }}>
        <h3 style={{ fontFamily:serif, fontSize:"clamp(26px, 2.3vw, 38px)", fontWeight:400, letterSpacing:-0.6, color:T.black, margin:0, lineHeight:1.1 }}>Discovery kits</h3>
        <p style={{ fontFamily:sans, fontSize:"clamp(14px, 1.1vw, 17px)", color:T.mid, margin:"6px 0 0", lineHeight:1.5 }}>Sample first. Houses that sell a discovery set or samples on their own site. Links go straight to the brand, so check the contents and price there.</p>
        {all && <div style={{ position:"relative", marginTop:14, maxWidth:520 }}>
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search kits by brand or country" style={{ ...FIELD, width:"100%", boxSizing:"border-box" }}/>
        </div>}
      </div>
      {all
        ? <div className="mos-bleed-pad" style={{ display:"flex", flexWrap:"wrap", gap:14 }}>{shown.map(card)}{shown.length === 0 && <p style={{ fontFamily:sans, fontSize:14, color:T.mid }}>No kits match that.</p>}</div>
        : <div className="mos-shelf mos-bleed-pad" style={{ display:"flex", alignItems:"stretch", gap:14, overflowX:"auto", paddingTop:2, paddingBottom:14, scrollSnapType:"x proximity", WebkitOverflowScrolling:"touch" }}>{shown.map(card)}</div>}
      <div className="mos-bleed-pad" style={{ marginTop:6 }}>
        <button onClick={() => { setAll(v => !v); setQ(""); }} style={{ ...ghostBtn, minHeight:42, fontSize:14, padding:"0 20px" }}>{all ? "Show fewer" : "See all kits"}</button>
      </div>
    </section>
  );
}

// ─── DISCOVER > NOTES: pick a note, see every fragrance that has it ──────────
function NotesFinder({ fragrances, onOpenFrag, userStatuses, onSearch }) {
  const [guideOpen, setGuideOpen] = useState(null);
  const [q, setQ] = useState("");
  const [fam, setFam] = useState("All");
  const [sel, setSel] = useState(null);
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [busy, setBusy] = useState(false);
  const cap = k => k.replace(/(^|[\s-])([a-z])/g, (m, p, c) => p + c.toUpperCase());
  const all = NOTE_PHOTO_PREVIEW ? NOTE_PHOTO_GALLERY : LEARN_NOTE_FALLBACK;
  const ql = q.trim().toLowerCase();
  const names = all.filter(k => (fam === "All" || (NOTE_FAMILY_OF[k] || "More") === fam) && (!ql || k.includes(ql)));
  const localMatch = n => (fragrances || []).filter(f => f.notes && allNoteList(f.notes).some(x => String(x.n).toLowerCase().includes(n.toLowerCase())));
  async function pick(n) {
    setSel(n); setItems([]); setTotal(0); setBusy(true);
    try {
      if (onSearch) { const r = await onSearch(n, "all", 0); setItems(r.items); setTotal(r.total); }
      else { const r = localMatch(n); setItems(r); setTotal(r.length); }
    } catch (e) { console.error("Note search failed:", e); }
    setBusy(false);
  }
  async function more() {
    setBusy(true);
    try { const r = await onSearch(sel, "all", items.length); setItems(p => [...p, ...r.items]); } catch (e) { console.error(e); }
    setBusy(false);
  }
  const chip = (on, label, fn) => (<button key={label} onClick={fn} aria-pressed={on} style={{ fontFamily:sans, fontSize:14, fontWeight:on?600:500, padding:"0 18px", minHeight:40, borderRadius:20, whiteSpace:"nowrap", border:`1px solid ${on?T.black:T.rule}`, background:on?T.black:T.white, color:on?T.white:T.ink, cursor:"pointer", flexShrink:0 }}>{label}</button>);
  const grid = { display:"grid", gridTemplateColumns:"repeat(auto-fill, var(--cover-w))", gap:"22px 14px", justifyContent:"start" };
  if (guideOpen) return <IngredientGuide name={guideOpen} onBack={() => setGuideOpen(null)} backLabel="Back to notes" fragrances={fragrances} onOpenFrag={onOpenFrag}/>;
  if (sel) {
    const guide = guideKey(sel);
    return (
      <div>
        <BackBtn onBack={() => setSel(null)} label="All notes"/>
        <div style={{ display:"flex", gap:"20px 28px", alignItems:"flex-start", flexWrap:"wrap", marginBottom:24 }}>
          <div style={{ flex:"1 1 240px", minWidth:0 }}>
            <h3 style={{ fontFamily:serif, fontSize:"clamp(28px, 3vw, 44px)", fontWeight:400, letterSpacing:-0.6, color:T.black, margin:0, lineHeight:1.1 }}>{cap(sel)}</h3>
            <p style={{ fontFamily:sans, fontSize:14, color:T.mid, margin:"8px 0 0", lineHeight:1.5 }}>{busy && !items.length ? "Looking…" : `${total} fragrance${total === 1 ? "" : "s"} with this note.`}</p>
            {guide && <button onClick={() => setGuideOpen(guide)} style={{ marginTop:12, fontFamily:sans, fontSize:12, fontWeight:600, letterSpacing:"0.14em", textTransform:"uppercase", color:T.accent, background:"none", border:`1px solid ${T.accent}`, borderRadius:20, padding:"8px 16px", cursor:"pointer" }}>Read the {guide} guide</button>}
          </div>
        </div>
        {items.length > 0 && <div style={grid}>{items.map(f => <CoverTile key={f.id} frag={f} onClick={onOpenFrag} userStatus={userStatuses && userStatuses[f.id]}/>)}</div>}
        {!busy && !items.length && <p style={{ fontFamily:sans, fontSize:14, color:T.mid, lineHeight:1.6, margin:0 }}>No fragrance in the library lists this note yet.</p>}
        {onSearch && items.length < total && <div style={{ marginTop:24 }}><button onClick={more} disabled={busy} style={ghostBtn}>{busy ? "Loading…" : "Show more"}</button></div>}
      </div>
    );
  }
  return (
    <div>
      <div style={{ position:"relative", maxWidth:760, marginBottom:12 }}>
        <span style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }}><Icon name="search" size={15} color={T.faint}/></span>
        <input value={q} onChange={e => setQ(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && ql.length > 1) pick(ql); }} placeholder="Search a note: vetiver, oud, fig…" aria-label="Search notes"
          style={{ width:"100%", background:T.white, border:`1.5px solid ${q ? T.accent : T.rule}`, borderRadius:14, padding:"14px 44px", fontSize:14, color:T.black, outline:"none", boxSizing:"border-box", fontFamily:serif }}/>
        {q && <button onClick={() => setQ("")} aria-label="Clear" style={{ position:"absolute", right:14, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", fontSize:14, color:T.mid, cursor:"pointer" }}>✕</button>}
      </div>
      {ql
        ? <div style={grid}>
            {names.map(k => (
              <button key={k} onClick={() => pick(k)} aria-label={`Fragrances with ${k}`} style={{ flex:"none", width:TILE_W, background:"none", border:"none", padding:0, cursor:"pointer", textAlign:"left", fontFamily:sans }}><NoteIllustration name={k} tile/></button>
            ))}
          </div>
        : <NotesBrowser onTile={pick}/>}
      {ql && !names.length && (
        <div style={{ padding:"8px 0" }}>
          <p style={{ fontFamily:sans, fontSize:14, color:T.mid, margin:"0 0 12px" }}>No picture for that note yet, but you can still search the library for it.</p>
          {ql.length > 1 && <button onClick={() => pick(ql)} style={ctaBtn(true)}>Find fragrances with “{q.trim()}”</button>}
        </div>
      )}
    </div>
  );
}

function DiscoverTab({ onOpenFrag, onOpenBrand, onOpenPerfumer, onOpenProfile, following, userStatuses, reactions, onReaction, onSuggest, fragrances, serverShelves, onSearch }) {
  const [mode,setMode]=useState("browse");
  const [messages,setMessages]=useState([{role:"ai",text:"Tell me what you're in the mood for: a memory, a mood, an aesthetic. I'll find your next fragrance."}]);
  const [input,setInput]=useState("");
  const [typing,setTyping]=useState(false);
  const [search,setSearch]=useState("");
  const [group,setGroup]=useState("all");
  const serverMode=!!(serverShelves&&onSearch);
  const [results,setResults]=useState([]);
  const [total,setTotal]=useState(0);
  const [searching,setSearching]=useState(false);
  const [moreBusy,setMoreBusy]=useState(false);
  useEffect(()=>{
    if(!serverMode) return;
    const q=search.trim();
    if(q.length<2&&group==="all"){setResults([]);setTotal(0);setSearching(false);return;}
    let cancelled=false;setSearching(true);
    const timer=setTimeout(async()=>{
      try{const r=await onSearch(q.length>=2?q:"",group,0);if(!cancelled){setResults(r.items);setTotal(r.total);}}
      catch(e){console.error("Search failed:",e);if(!cancelled){setResults([]);setTotal(0);}}
      finally{if(!cancelled)setSearching(false);}
    },300);
    return ()=>{cancelled=true;clearTimeout(timer);};
  },[search,group,serverMode]);
  async function showMore(){
    setMoreBusy(true);
    try{const q=search.trim();const r=await onSearch(q.length>=2?q:"",group,results.length);setResults(p=>[...p,...r.items]);}
    catch(e){console.error("Search failed:",e);}
    setMoreBusy(false);
  }
  const CHIPS=[{label:"Library in autumn",query:"something that smells like a library in autumn"},{label:"Quiet luxury",query:"expensive but quiet, not loud"},{label:"Cold winter nights",query:"cold winter nights by a fire"},{label:"Office fresh",query:"fresh and clean for the office"}];

  const LIST = (fragrances && fragrances.length) ? fragrances : FRAGRANCES;
  // Hidden for now (code kept): the Woody / Floral / Citrus / Gourmand accord shelves and the Neo gourmand shelf
  const HIDDEN_SHELVES = s => s.key === "neo" || String(s.key).startsWith("acc-");
  const shelves = (serverMode ? serverShelves : buildShelves(LIST)).filter(s => !HIDDEN_SHELVES(s));
  const searchResults = (search.trim().length > 0 || group !== "all") ? LIST.filter(f => {
    if (group !== "all" && !houseGroups(f).includes(group)) return false;
    if (!search.trim()) return true;
    const q = search.trim().toLowerCase();
    return f.name.toLowerCase().includes(q) || f.house.toLowerCase().includes(q) || (f.family||"").toLowerCase().includes(q) ||
      allNoteList(f.notes).some(n => n.n.toLowerCase().includes(q)) ||
      (f.occasions||[]).some(o => o.toLowerCase().includes(q));
  }) : [];

  const isSearching = serverMode ? (search.trim().length>=2||group!=="all") : (!!search||group!=="all");
  const shown = serverMode ? results : searchResults;
  const shownTotal = serverMode ? total : searchResults.length;
  function send(text){const msg=text||input;if(!msg.trim())return;setMessages(m=>[...m,{role:"user",text:msg}]);setInput("");setTyping(true);setTimeout(()=>{const r=getResp(msg);const frag=FRAGRANCES.find(f=>f.id===r.fragId);setTyping(false);setMessages(m=>[...m,{role:"ai",text:r.text,frag}]);},1300);}

  const modeBtn=(key,label)=>(
    <button key={key} role="tab" aria-selected={mode===key} onClick={()=>setMode(mode===key?"browse":key)} style={{position:"relative",padding:"0 2px 13px",marginRight:24,background:"none",border:"none",cursor:"pointer",fontFamily:sans,fontSize:15,fontWeight:600,color:mode===key?T.black:T.mid}}>
      {label}
      {mode===key&&<span style={{position:"absolute",left:0,right:0,bottom:-1,height:2,background:T.black}}/>}
    </button>
  );

  return (
    <div>
      <div style={{marginBottom:20}}>
        <p style={{fontFamily:sans,fontSize:10,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.18em",color:T.accent,margin:"0 0 6px"}}>Discover</p>
        <h2 style={{fontFamily:serif,fontSize:"clamp(32px, 3.2vw, 50px)",color:T.black,letterSpacing:-0.8,margin:0,fontWeight:400}}>{mode==="browse"?"Sample. Wear. Repeat.":mode==="notes"?"Notes":mode==="brands"?"Brands":mode==="perfumers"?"Perfumers":mode==="community"?"Community":mode==="requests"?"Requests":"The Nose"}</h2>
        <p style={{fontFamily:sans,fontSize:"clamp(13px, 1.1vw, 17px)",color:T.mid,margin:"6px 0 0"}}>{mode==="browse"?"Search by name, or browse by category.":mode==="notes"?"Pick a note to see every fragrance that has it.":mode==="brands"?"Every house in the library, with who owns it and what it makes.":mode==="perfumers"?"The noses behind the bottles. Find a perfumer, then everything they have made.":mode==="community"?"Posts, thoughts and requests from members, newest first.":mode==="requests"?"Ask what to smell like. Members answer.":"Describe a memory, a mood or a place."}</p>
      </div>
      <div role="tablist" aria-label="Discover" style={{display:"flex",overflowX:"auto",whiteSpace:"nowrap",borderBottom:`1px solid ${T.rule}`,marginBottom:22}}>
        {modeBtn("notes","Notes")}
        {modeBtn("brands","Brands")}
        {modeBtn("perfumers","Perfumers")}
        {NOSE_ENABLED&&modeBtn("nose","Nose")}
        {modeBtn("community","Community")}
      </div>

      {mode==="browse"&&(
        <>
          <div style={{marginBottom:search?10:6,maxWidth:760}}>
            <div style={{position:"relative"}}>
              <span style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",pointerEvents:"none"}}><Icon name="search" size={15} color={T.faint}/></span>
              <input
                value={search}
                onChange={e=>setSearch(e.target.value)}
                placeholder="Search by name, house, note, family…"
                style={{width:"100%",background:T.white,border:`1.5px solid ${search?T.accent:T.rule}`,borderRadius:14,padding:"14px 44px 14px 44px",fontSize:14,color:T.black,outline:"none",boxSizing:"border-box",fontFamily:serif,letterSpacing:"0.01em",transition:"border-color 0.15s,box-shadow 0.15s"}}
              />
              {search&&<button onClick={()=>setSearch("")} aria-label="Clear search" style={{position:"absolute",right:14,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",fontSize:14,color:T.mid,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",width:24,height:24}}>✕</button>}
            </div>
          </div>
          <div role="group" aria-label="House type" style={{display:"flex",gap:8,overflowX:"auto",padding:"6px 0 10px",marginBottom:6}}>
            {HOUSE_GROUPS.map(g=>{const on=group===g.key;return (
              <button key={g.key} onClick={()=>setGroup(g.key)} aria-pressed={on} style={{fontFamily:sans,fontSize:14,fontWeight:on?600:500,padding:"0 20px",minHeight:42,borderRadius:22,whiteSpace:"nowrap",border:`1px solid ${on?T.black:T.rule}`,background:on?T.black:T.white,color:on?T.white:T.ink,cursor:"pointer",flexShrink:0}}>{g.label}</button>
            );})}
          </div>
          {isSearching&&(
            <div style={{marginTop:6}}>
              {shown.length>0 ? (
                <>
                  <p style={{fontFamily:sans,fontSize:11,color:T.mid,margin:"0 0 10px"}}>{shownTotal} result{shownTotal!==1?"s":""}{search?<> for "<strong style={{color:T.ink}}>{search}</strong>"</>:null}{group!=="all"?` in ${group}`:""}</p>
                  <div className="mos-grid">
                    {shown.map(f=><FragCard key={f.id} frag={f} onClick={onOpenFrag} userStatus={userStatuses[f.id]} reaction={reactions[f.id]} onReaction={v=>onReaction(f.id,v)} onOpenFrag={onOpenFrag} onOpenBrand={onOpenBrand}/>)}
                  </div>
                  {serverMode&&shown.length<shownTotal&&(
                    <div style={{textAlign:"center",margin:"22px 0 8px"}}>
                      <button onClick={showMore} disabled={moreBusy} style={{fontFamily:sans,fontSize:14,minHeight:46,padding:"0 28px",borderRadius:23,border:`1px solid ${T.rule}`,background:T.white,color:T.ink,cursor:"pointer",opacity:moreBusy?0.6:1}}>{moreBusy?"Loading":`Show more (${shownTotal-shown.length} left)`}</button>
                    </div>
                  )}
                </>
              ) : searching ? (
                <p style={{fontFamily:sans,fontSize:13,color:T.mid,margin:"24px 0"}}>Searching</p>
              ) : (
                <div style={{textAlign:"center",padding:"32px 0",color:T.faint}}>
                  <p style={{fontFamily:sans,fontSize:13,color:T.mid,margin:"0 0 12px"}}>Nothing found{search?` for "${search}"`:""}</p>
                  <button onClick={()=>{setSearch("");setGroup("all");}} style={{fontFamily:sans,fontSize:11,padding:"7px 16px",borderRadius:20,border:`1px solid ${T.rule}`,background:T.white,color:T.mid,cursor:"pointer"}}>Clear</button>
                </div>
              )}
            </div>
          )}
          {!isSearching&&(
            <>
              {shelves.map((s,i)=>(
                <Fragment key={s.key}>
                  <Shelf title={s.title} blurb={s.blurb} items={s.items} groups={s.groups} onOpenFrag={onOpenFrag} userStatuses={userStatuses} tinted={i%2===0}/>
                  {s.key==="new"&&<><PerfumerShelf onOpenPerfumer={onOpenPerfumer} tinted={i%2!==0}/><KitsShelf onOpenBrand={onOpenBrand} tinted={i%2===0}/></>}
                </Fragment>
              ))}
            </>
          )}
        </>
      )}

      {mode==="brands"&&<BrandsDirectory onOpenBrand={onOpenBrand}/>}
      {mode==="perfumers"&&<PerfumersDirectory onOpenPerfumer={onOpenPerfumer}/>}

      {mode==="notes"&&<NotesFinder fragrances={LIST} onOpenFrag={onOpenFrag} userStatuses={userStatuses} onSearch={serverMode?onSearch:null}/>}
      {mode==="community"&&<CommunityFeed onOpenProfile={onOpenProfile} onOpenFrag={onOpenFrag} onSearch={serverMode?onSearch:null} following={following}/>}
      {mode==="requests"&&<RequestsBoard onOpenFrag={onOpenFrag} onSearch={serverMode?onSearch:null}/>}

      {NOSE_ENABLED&&mode==="nose"&&(
        <div style={{maxWidth:760}}>
          <div style={{background:T.white,border:`1px solid ${T.rule}`,borderRadius:18,overflow:"hidden",marginBottom:14}}>
            <div style={{padding:16,minHeight:240,maxHeight:"52vh",overflowY:"auto",display:"flex",flexDirection:"column",gap:12}}>
              {messages.map((m,i)=>(
                <div key={i} style={{display:"flex",flexDirection:"column",alignItems:m.role==="user"?"flex-end":"flex-start"}}>
                  <div style={{maxWidth:"82%",padding:"10px 14px",borderRadius:16,borderTopRightRadius:m.role==="user"?4:16,borderTopLeftRadius:m.role==="ai"?4:16,background:m.role==="user"?T.black:T.lift,color:m.role==="user"?T.white:T.ink,fontSize:13,lineHeight:1.65,fontFamily:sans}}>{m.text}</div>
                  {m.frag&&<div onClick={()=>onOpenFrag(m.frag.id)} style={{marginTop:8,maxWidth:"82%",background:T.white,border:`1px solid ${T.rule}`,borderRadius:12,padding:"10px 12px",display:"flex",alignItems:"center",gap:10,cursor:"pointer"}}><Mono name={m.frag.name} size={36}/><div><p style={{fontFamily:serif,fontSize:13,color:T.black,margin:0}}>{m.frag.name}</p><p style={{fontFamily:sans,fontSize:10,color:T.mid,margin:"2px 0 0"}}>{m.frag.house}{m.frag.family?` · ${m.frag.family}`:""}</p></div></div>}
                </div>
              ))}
              {typing&&<div style={{display:"flex"}}><div style={{background:T.lift,borderRadius:16,borderTopLeftRadius:4,padding:"12px 14px",display:"flex",gap:4}}>{[0,1,2].map(i=><div key={i} style={{width:5,height:5,borderRadius:"50%",background:T.mid,animation:"bounce 1.2s infinite",animationDelay:`${i*150}ms`}}/>)}</div></div>}
            </div>
            <div style={{display:"flex",gap:8,padding:"11px 16px",borderTop:`1px solid ${T.lift}`}}>
              <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder="A library in autumn…" style={{flex:1,minWidth:0,background:T.lift,border:`1px solid ${T.rule}`,borderRadius:10,padding:"9px 14px",fontSize:13,color:T.black,outline:"none",fontFamily:sans}}/>
              <button onClick={()=>send()} aria-label="Send" style={{width:38,height:38,borderRadius:10,background:T.black,border:"none",color:T.white,fontSize:16,cursor:"pointer",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>↑</button>
            </div>
          </div>
          <div style={{display:"flex",flexWrap:"wrap",gap:7}}>{CHIPS.map(c=><button key={c.label} onClick={()=>send(c.query)} style={{fontFamily:sans,fontSize:11,padding:"6px 13px",borderRadius:20,background:T.white,border:`1px solid ${T.rule}`,color:T.mid,cursor:"pointer"}}>{c.label}</button>)}</div>
        </div>
      )}
      <style>{`@keyframes bounce{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-4px)}}`}</style>
    </div>
  );
}

// ─── COLLECTION ───────────────────────────────────────────────────────────────
// ─── COLLECTION MAP: bottles placed by decade (across) and leading accord (down) ─
function CollectionMap({ items, onOpenFrag }) {
  const topAccord = f => { const a = [...(f.accords || [])].sort((x, y) => y.v - x.v)[0]; return a ? String(a.n).toLowerCase() : "other"; };
  const placed = items.filter(f => Number(f.year) > 0);
  const counts = {};
  placed.forEach(f => { const k = topAccord(f); counts[k] = (counts[k] || 0) + 1; });
  let rows = Object.entries(counts).sort((x, y) => y[1] - x[1]).map(e => e[0]);
  if (rows.length > 6) rows = [...rows.slice(0, 5), "other"];
  const empty = rows.length === 0;
  const rowList = empty ? ["woody", "amber", "floral", "citrus", "aromatic"] : rows;
  const nowDec = Math.floor(new Date().getFullYear() / 10) * 10;
  const decs = placed.map(f => Math.floor(f.year / 10) * 10);
  let hi = Math.max(nowDec, ...(decs.length ? decs : [nowDec]));
  let lo = decs.length ? Math.min(...decs) : hi - 30;
  if (hi - lo < 20) lo = hi - 20;
  if (hi - lo > 50) lo = hi - 50;
  const cols = [];
  for (let d = lo; d <= hi; d += 10) cols.push(d);
  const rowOf = f => { const k = topAccord(f); return rowList.includes(k) ? k : "other"; };
  const colOf = f => Math.max(lo, Math.floor(f.year / 10) * 10);
  const tile = f => {
    const ini = f.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
    return (
      <button key={f.id} onClick={() => onOpenFrag(f.id)} title={`${f.name}, ${f.house}`} aria-label={`${f.name} by ${f.house}`}
        style={{ position:"relative", width:56, height:72, borderRadius:8, background:T.white, border:`1px solid ${T.rule}`, boxShadow:"0 5px 12px rgba(23,16,28,0.10)", cursor:"pointer", padding:0, overflow:"hidden", display:"flex", alignItems:"center", justifyContent:"center" }}>
        <span style={{ position:"absolute", left:0, right:0, top:0, height:4, background:accordColor(topAccord(f)) }}/>
        {f.image
          ? <img src={f.image} alt="" loading="lazy" style={{ width:"100%", height:"100%", objectFit:"contain", padding:6 }}/>
          : <span style={{ fontFamily:serif, fontSize:19, color:T.mid }}>{ini}</span>}
      </button>
    );
  };
  const labelW = 112;
  return (
    <div style={{ background:T.white, border:`1px solid ${T.rule}`, borderRadius:16, padding:"20px 20px 14px", marginBottom:20 }}>
      <div style={{ display:"flex", alignItems:"baseline", justifyContent:"space-between", gap:12, flexWrap:"wrap", marginBottom:16 }}>
        <h3 style={{ fontFamily:serif, fontSize:"clamp(20px, 1.8vw, 26px)", fontWeight:400, letterSpacing:-0.4, color:T.black, margin:0 }}>Your collection, mapped</h3>
        <span style={{ fontFamily:sans, fontSize:12, color:T.mid }}>{empty ? "Release decade across, leading accord down" : `${placed.length} placed by release decade and leading accord`}</span>
      </div>
      <div className="mos-map">
        <div style={{ minWidth:labelW + cols.length * 104, position:"relative" }}>
          <span aria-hidden="true" style={{ position:"absolute", left:labelW - 5, top:-4, width:0, height:0, borderLeft:"5px solid transparent", borderRight:"5px solid transparent", borderBottom:`8px solid ${T.black}` }}/>
          <div style={{ display:"grid", gridTemplateColumns:`${labelW}px repeat(${cols.length}, minmax(96px, 1fr))` }}>
            {rowList.map(r => (
              <div key={r} style={{ display:"contents" }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 10px 10px 0", borderRight:`2px solid ${T.black}`, borderBottom:`1px solid ${T.rule}`, minHeight:96 }}>
                  <span style={{ width:10, height:10, borderRadius:"50%", background:accordColor(r), flexShrink:0 }}/>
                  <span style={{ fontFamily:sans, fontSize:13, color:T.ink, textTransform:"capitalize" }}>{r}</span>
                </div>
                {cols.map(c => (
                  <div key={r + c} style={{ display:"flex", flexWrap:"wrap", alignContent:"center", gap:6, padding:8, borderBottom:`1px solid ${T.rule}`, borderRight:`1px solid ${T.lift}`, minHeight:96 }}>
                    {placed.filter(f => rowOf(f) === r && colOf(f) === c).map(tile)}
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div style={{ display:"grid", gridTemplateColumns:`${labelW}px repeat(${cols.length}, minmax(96px, 1fr))`, borderTop:`2px solid ${T.black}`, position:"relative" }}>
            <span aria-hidden="true" style={{ position:"absolute", right:-2, top:-6, width:0, height:0, borderTop:"5px solid transparent", borderBottom:"5px solid transparent", borderLeft:`8px solid ${T.black}` }}/>
            <div/>
            {cols.map(c => <div key={c} style={{ fontFamily:sans, fontSize:12, color:T.mid, textAlign:"center", padding:"10px 0 4px" }}>{c}s</div>)}
          </div>
        </div>
      </div>
      {empty && <p style={{ fontFamily:sans, fontSize:13, color:T.mid, margin:"10px 0 4px" }}>Your shelf is empty for now. Add a bottle you own or a sample you're trying.</p>}
    </div>
  );
}

function useShelfCols() {
  const calc = () => (typeof window === "undefined" ? 3 : window.innerWidth >= 1100 ? 6 : window.innerWidth >= 640 ? 5 : 3);
  const [n, setN] = useState(calc);
  useEffect(() => { const f = () => setN(calc()); window.addEventListener("resize", f); return () => window.removeEventListener("resize", f); }, []);
  return n;
}
function ViewIcon({ kind, color }) {
  const p = { width:18, height:18, viewBox:"0 0 24 24", fill:"none", stroke:color, strokeWidth:1.8, strokeLinecap:"round", strokeLinejoin:"round" };
  if (kind === "grid") return <svg {...p}><rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/></svg>;
  if (kind === "shelf") return <svg {...p}><path d="M4 20h16"/><rect x="5" y="6" width="3.5" height="11" rx="0.8"/><rect x="10.2" y="4" width="3.5" height="13" rx="0.8"/><rect x="15.4" y="7" width="3.5" height="10" rx="0.8"/></svg>;
  return <svg {...p}><path d="M4 6h16M4 12h16M4 18h16"/></svg>;
}
function GridTile({ frag, onClick, userStatus, reaction }) {
  const owned = userStatus === "bottle_owned";
  return (
    <button onClick={() => onClick(frag.id)} aria-label={`${frag.name} by ${frag.house}`} style={{ padding:0, border:"none", background:"none", cursor:"pointer", textAlign:"left", fontFamily:sans, minWidth:0 }}>
      <span style={{ display:"block", position:"relative" }}>
        <Thumb frag={frag} w="100%"/>
        {userStatus && <span style={{ position:"absolute", top:8, right:8, width:28, height:28, borderRadius:"50%", background:owned?ACCENT_FILL:T.lift, display:"flex", alignItems:"center", justifyContent:"center" }}><Icon name={owned?"bottle":"bookmark"} size={14} color={owned?ON_ACCENT:T.mid}/></span>}
        {reaction && <span style={{ position:"absolute", left:8, bottom:8, borderRadius:20, background:"rgba(0,0,0,0.72)", color:"#fff", fontSize:12, padding:"3px 9px" }}>{reaction === "love" ? "♥ Love" : reaction === "like" ? "Like" : "Dislike"}</span>}
      </span>
      <span style={{ display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden", marginTop:10, fontFamily:serif, fontSize:18, lineHeight:1.2, letterSpacing:-0.2, color:T.black }}>{frag.name}</span>
      <span style={{ display:"block", marginTop:3, fontSize:13, color:T.mid, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{frag.house}</span>
    </button>
  );
}
function ShelfView({ items, onClick, statuses }) {
  const cols = useShelfCols();
  const rows = []; for (let i = 0; i < items.length; i += cols) rows.push(items.slice(i, i + cols));
  return (
    <div>
      {rows.map((row, ri) => (
        <div key={ri} style={{ marginBottom:26 }}>
          <div style={{ display:"grid", gridTemplateColumns:`repeat(${cols}, minmax(0, 1fr))`, gap:10, padding:"0 6px", alignItems:"end" }}>
            {row.map(f => (
              <button key={f.id} onClick={() => onClick(f.id)} aria-label={`${f.name} by ${f.house}`} style={{ padding:0, border:"none", background:"none", cursor:"pointer", minWidth:0 }}>
                <span style={{ display:"block", position:"relative" }}>
                  <Thumb frag={f} w="100%"/>
                  {statuses[f.id] === "bottle_owned" && <span style={{ position:"absolute", top:6, right:6, width:22, height:22, borderRadius:"50%", background:ACCENT_FILL, display:"flex", alignItems:"center", justifyContent:"center" }}><Icon name="bottle" size={12} color={ON_ACCENT}/></span>}
                </span>
              </button>
            ))}
          </div>
          <div aria-hidden="true" style={{ height:12, marginTop:-1, borderRadius:4, background:T.rule, boxShadow:"0 6px 10px -4px rgba(0,0,0,0.45)" }}/>
        </div>
      ))}
    </div>
  );
}
// ─── COLLECTION IMPORT ────────────────────────────────────────────────────────
// Reads a spreadsheet / CSV / pasted list in the browser, matches rows to our fragrances, and adds them with a status.
// The file itself is never uploaded; only the matched statuses are saved.
const impNorm = s => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/&/g, " and ")
  .replace(/\b(eau de parfum|eau de toilette|eau de cologne|extrait de parfum|extrait|parfum|edp|edt|cologne|intense|the|by|for men|for women|pour homme|pour femme)\b/g, " ")
  .replace(/[^a-z0-9]+/g, "");
function impParseDelimited(text) {
  const first = text.split(/\r?\n/)[0] || "";
  const d = [["\t", (first.match(/\t/g) || []).length], [";", (first.match(/;/g) || []).length], [",", (first.match(/,/g) || []).length]].sort((a, b) => b[1] - a[1])[0];
  const delim = d[1] > 0 ? d[0] : null;
  if (!delim) return text.split(/\r?\n/).map(l => l.trim()).filter(Boolean).map(l => [l]);
  const rows = []; let row = [], cell = "", q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) { if (c === '"') { if (text[i + 1] === '"') { cell += '"'; i++; } else q = false; } else cell += c; }
    else if (c === '"') q = true;
    else if (c === delim) { row.push(cell); cell = ""; }
    else if (c === "\n" || c === "\r") { if (c === "\r" && text[i + 1] === "\n") i++; row.push(cell); cell = ""; if (row.some(x => x.trim())) rows.push(row); row = []; }
    else cell += c;
  }
  row.push(cell); if (row.some(x => x.trim())) rows.push(row);
  return rows;
}
function impStatusFrom(txt) {
  const t = String(txt || "").toLowerCase();
  if (!t.trim()) return null;
  const trv = /travel/.test(t);
  const smp = /sample|decant|vial|mini|split/.test(t);
  if (/wish|want|desire|\bwl\b|to buy|interested|seeking|crave/.test(t)) return trv ? "travel_wishlist" : smp ? "sample_wishlist" : "bottle_wishlist";
  if (/finish|empty|used up|killed|gone|sold|passed/.test(t)) return trv ? "travel_finished" : smp ? "sample_finished" : "bottle_finished";
  if (trv) return "travel_have";
  if (smp) return "sample_have";
  if (/own|have|bottle|collection|full|shelf|keep|current/.test(t)) return "bottle_owned";
  if (/tried|worn|wear|tested|skin/.test(t)) return "tried_skin";
  if (/smell|sniff|blotter/.test(t)) return "smelled";
  return null;
}
function impGuess(header, rows) {
  const h = header.map(x => String(x || "").toLowerCase().trim());
  const find = re => h.findIndex(x => re.test(x));
  let name = find(/^(name|fragrance|perfume|scent|title|product|fragrance name|perfume name)\b/); if (name < 0) name = find(/name|fragrance|perfume|scent/);
  const house = find(/^(house|brand|designer|maker|company|perfume house)\b/);
  const status = find(/status|list|collection|category|type|state|shelf|own|have|wish/);
  return { name: name >= 0 ? name : 0, house: house >= 0 && house !== name ? house : -1, status: status >= 0 && status !== name && status !== house ? status : -1, hasHeader: name >= 0 || house >= 0 };
}
function impMatch(rawName, rawHouse, index) {
  const n = impNorm(rawName), hRaw = impNorm(rawHouse);
  if (!n) return null;
  if (hRaw) {
    const exact = index.byKey.get(hRaw + "|" + n); if (exact) return exact;
    const cands = (index.byName.get(n) || []).filter(f => { const fh = impNorm(f.house); return fh.includes(hRaw) || hRaw.includes(fh); });
    if (cands.length === 1) return cands[0];
  } else {
    const c = index.byName.get(n); if (c && c.length === 1) return c[0];
    // "House Name" in one cell
    for (const f of index.all) { if (index.combined.get(f.id) === n) return f; }
    for (const f of index.all) { const fh = impNorm(f.house); if (fh && n.startsWith(fh) && impNorm(f.name) === n.slice(fh.length)) return f; }
    // "Name - House" or "Name by House"
    for (const f of index.all) { const fn = impNorm(f.name), fh = impNorm(f.house); if (fn && fh && n === fn + fh) return f; }
  }
  return null;
}
function ImportSheet({ fragrances, existing, onApply, onClose }) {
  const [step, setStep] = useState("pick");
  const [rows, setRows] = useState([]);
  const [header, setHeader] = useState([]);
  const [map, setMap] = useState({ name: 0, house: -1, status: -1 });
  const [hasHeader, setHasHeader] = useState(true);
  const [defStatus, setDefStatus] = useState("bottle_owned");
  const [paste, setPaste] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const fileRef = useRef(null);
  const index = useMemo(() => {
    const byKey = new Map(), byName = new Map(), combined = new Map();
    (fragrances || []).forEach(f => { const n = impNorm(f.name), h = impNorm(f.house); byKey.set(h + "|" + n, f); if (!byName.has(n)) byName.set(n, []); byName.get(n).push(f); combined.set(f.id, h + n); });
    return { byKey, byName, combined, all: fragrances || [] };
  }, [fragrances]);
  const bodyRows = hasHeader ? rows.slice(1) : rows;
  const parsed = useMemo(() => {
    if (step !== "map") return { matched: [], unmatched: [] };
    const seen = new Set(), matched = [], unmatched = [];
    bodyRows.forEach(r => {
      const nm = (r[map.name] || "").toString().trim(); if (!nm) return;
      const hs = map.house >= 0 ? (r[map.house] || "").toString().trim() : "";
      const f = impMatch(nm, hs, index);
      if (!f) { unmatched.push((hs ? hs + " " : "") + nm); return; }
      const st = (map.status >= 0 ? impStatusFrom(r[map.status]) : null) || defStatus;
      const k = f.id + "|" + st; if (seen.has(k)) return; seen.add(k);
      matched.push({ frag: f, status: st });
    });
    return { matched, unmatched };
  }, [step, bodyRows, map, defStatus, index]);
  function load(table) {
    if (!table.length) { setErr("We couldn't find any rows in that."); return; }
    const guess = impGuess(table[0].map(String), table);
    setRows(table); setHeader(table[0].map(x => String(x == null ? "" : x))); setHasHeader(guess.hasHeader);
    setMap({ name: guess.name, house: guess.house, status: guess.status }); setErr(""); setStep("map");
  }
  async function onFile(e) {
    const file = e.target.files && e.target.files[0]; if (!file) return;
    setBusy(true); setErr("");
    try {
      const lower = file.name.toLowerCase();
      if (/\.xlsx$/.test(lower)) {
        const mod = await import("read-excel-file");
        const table = await (mod.default || mod)(file);
        load(table.map(r => r.map(c => c == null ? "" : String(c))));
      } else if (/\.json$/.test(lower)) {
        const data = JSON.parse(await file.text());
        const arr = Array.isArray(data) ? data : (data.fragrances || data.items || data.collection || []);
        if (!arr.length || typeof arr[0] !== "object") throw new Error("json");
        const keys = Array.from(new Set(arr.flatMap(o => Object.keys(o))));
        load([keys, ...arr.map(o => keys.map(k => o[k] == null ? "" : typeof o[k] === "object" ? "" : String(o[k])))]);
      } else if (/\.(xls|numbers|ods)$/.test(lower)) {
        setErr("Please save that file as .xlsx or .csv first (File → Download or Export), then drop it here.");
      } else {
        load(impParseDelimited(await file.text()));
      }
    } catch (x) { setErr("We couldn't read that file. Try saving it as a .csv and dropping it in again."); }
    setBusy(false); if (fileRef.current) fileRef.current.value = "";
  }
  async function apply() {
    setBusy(true);
    const r = await onApply(parsed.matched);
    setBusy(false); setResult({ added: r.added, already: r.already, unmatched: parsed.unmatched });
    setStep("done");
  }
  const sel = { ...FIELD, padding:"10px 12px", fontSize:13, minHeight:42 };
  const colOpts = (none) => [none ? <option key="n" value={-1}>None</option> : null, ...header.map((h, i) => <option key={i} value={i}>{hasHeader ? (h || "Column " + (i + 1)) : "Column " + (i + 1) + (rows[0] && rows[0][i] ? " (" + String(rows[0][i]).slice(0, 18) + ")" : "")}</option>)];
  const label = (st) => (STATUSES.find(s => s.key === st) || {}).label || st;
  const sampleRows = bodyRows.slice(0, 3);
  return createPortal(
    <div role="dialog" aria-modal="true" aria-label="Import your collection" style={{ position:"fixed", inset:0, zIndex:3000, background:"rgba(0,0,0,0.5)", display:"flex", alignItems:"flex-end", justifyContent:"center" }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background:T.white, width:"100%", maxWidth:560, maxHeight:"92vh", overflowY:"auto", borderRadius:"20px 20px 0 0", padding:"22px 20px 28px", boxSizing:"border-box" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
          <h3 style={{ fontFamily:serif, fontSize:22, fontWeight:400, color:T.black, margin:0 }}>Bring your collection in</h3>
          <button onClick={onClose} aria-label="Close" style={{ background:"none", border:"none", fontSize:20, color:T.mid, cursor:"pointer" }}>✕</button>
        </div>
        {step === "pick" && <>
          <p style={{ fontFamily:sans, fontSize:14, color:T.mid, lineHeight:1.6, margin:"0 0 14px" }}>Already tracking fragrances in a spreadsheet or on another fragrance site? Drop in what you have, and we'll match it to our fragrances and add it for you. Many sites let you export your list, so it's worth looking in your account settings.</p>
          <input ref={fileRef} type="file" accept=".csv,.tsv,.txt,.xlsx,.json,text/csv,text/plain" onChange={onFile} style={{ display:"none" }}/>
          <button onClick={() => fileRef.current && fileRef.current.click()} disabled={busy} style={{ ...communityCta(true), width:"100%", marginBottom:10 }}>{busy ? "Reading…" : "Choose a file (.xlsx, .csv, .txt)"}</button>
          <p style={{ fontFamily:sans, fontSize:12, color:T.faint, margin:"0 0 16px", lineHeight:1.6 }}>If a site doesn't offer an export, open your list there, select it, copy, and paste it below. One fragrance per line works fine, e.g. “Creed Aventus”.</p>
          <textarea value={paste} onChange={e => setPaste(e.target.value)} rows={5} placeholder={"Paste your list here\nCreed – Aventus\nByredo – Gypsy Water"} style={{ ...FIELD, width:"100%", boxSizing:"border-box", resize:"vertical", fontSize:14 }}/>
          <button onClick={() => paste.trim() ? load(impParseDelimited(paste)) : setErr("Paste your list first, or choose a file.")} style={{ ...ghostBtn, width:"100%", marginTop:10 }}>Use pasted list</button>
          {err && <p style={{ fontFamily:sans, fontSize:13, color:T.bad, margin:"12px 0 0" }}>{err}</p>}
          <p style={{ fontFamily:sans, fontSize:12, color:T.faint, margin:"16px 0 0", lineHeight:1.6 }}>Your file is read on your device. Nothing is uploaded except the fragrances we match, saved to your own collection. You'll see a preview before anything is added.</p>
        </>}
        {step === "map" && <>
          <p style={{ fontFamily:sans, fontSize:14, color:T.mid, lineHeight:1.6, margin:"0 0 14px" }}>We found {bodyRows.length} row{bodyRows.length === 1 ? "" : "s"}. Check we've read the right columns.</p>
          <label style={{ ...FLABEL, display:"block", margin:"0 0 4px" }}>Fragrance name</label>
          <select value={map.name} onChange={e => setMap({ ...map, name:+e.target.value })} style={{ ...sel, width:"100%", marginBottom:10 }}>{colOpts(false)}</select>
          <label style={{ ...FLABEL, display:"block", margin:"0 0 4px" }}>House / brand (if it has its own column)</label>
          <select value={map.house} onChange={e => setMap({ ...map, house:+e.target.value })} style={{ ...sel, width:"100%", marginBottom:10 }}>{colOpts(true)}</select>
          <label style={{ ...FLABEL, display:"block", margin:"0 0 4px" }}>Status (own, wishlist, sample… if it has a column)</label>
          <select value={map.status} onChange={e => setMap({ ...map, status:+e.target.value })} style={{ ...sel, width:"100%", marginBottom:10 }}>{colOpts(true)}</select>
          <label style={{ ...FLABEL, display:"block", margin:"0 0 4px" }}>{map.status >= 0 ? "When a row has no clear status, add it as" : "Add everything as"}</label>
          <select value={defStatus} onChange={e => setDefStatus(e.target.value)} style={{ ...sel, width:"100%", marginBottom:10 }}>{STATUSES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}</select>
          <label style={{ display:"flex", alignItems:"center", gap:8, fontFamily:sans, fontSize:13, color:T.mid, margin:"4px 0 14px" }}><input type="checkbox" checked={hasHeader} onChange={e => setHasHeader(e.target.checked)}/> First row is a heading</label>
          <div style={{ background:T.lift, border:`1px solid ${T.rule}`, borderRadius:12, padding:"12px 14px", marginBottom:14 }}>
            <p style={{ fontFamily:sans, fontSize:14, color:T.black, margin:0 }}><strong>{parsed.matched.length}</strong> matched · <strong>{parsed.unmatched.length}</strong> not found</p>
            {parsed.matched.slice(0, 4).map((m, i) => <p key={i} style={{ fontFamily:sans, fontSize:12, color:T.mid, margin:"6px 0 0" }}>{m.frag.name} · {m.frag.house} → {label(m.status)}</p>)}
            {parsed.matched.length > 4 && <p style={{ fontFamily:sans, fontSize:12, color:T.faint, margin:"6px 0 0" }}>and {parsed.matched.length - 4} more</p>}
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={() => setStep("pick")} style={{ ...ghostBtn, flex:1 }}>Back</button>
            <button onClick={apply} disabled={busy || !parsed.matched.length} style={{ ...communityCta(!busy && parsed.matched.length > 0), flex:2 }}>{busy ? "Adding…" : "Add " + parsed.matched.length + " to my collection"}</button>
          </div>
        </>}
        {step === "done" && result && <>
          <p style={{ fontFamily:sans, fontSize:15, color:T.black, lineHeight:1.6, margin:"6px 0 4px" }}>Added {result.added} to your collection{result.already ? " (" + result.already + " already had that status)" : ""}.</p>
          {result.unmatched.length > 0 && <>
            <p style={{ fontFamily:sans, fontSize:13, color:T.mid, lineHeight:1.6, margin:"10px 0 8px" }}>{result.unmatched.length} weren't in our library yet. You can find the missing ones in Suggest a fragrance, and we'll add them.</p>
            <div style={{ maxHeight:160, overflowY:"auto", background:T.lift, border:`1px solid ${T.rule}`, borderRadius:12, padding:"10px 14px", fontFamily:sans, fontSize:12, color:T.mid, lineHeight:1.7 }}>{result.unmatched.slice(0, 200).map((u, i) => <div key={i}>{u}</div>)}</div>
          </>}
          <button onClick={onClose} style={{ ...communityCta(true), width:"100%", marginTop:16 }}>Done</button>
        </>}
      </div>
    </div>, document.body);
}

// ─── EVENTS: a private notebook for fairs, expos and launch parties ───────────────
// Each member keeps their own events, the brands they visited and the fragrances they tried there.
// Nothing is shared and nothing goes to houses. Rating a library fragrance here also adds it to the
// member's collection as Smelled and sets their reaction (love / like / dislike).
const EVENT_RATINGS = [["love", "Love"], ["like", "Like"], ["dislike", "No"]];
const evClean = s => String(s == null ? "" : s).replace(/[%_,()\\]/g, " ").replace(/\s+/g, " ").trim();
const evSlug = s => evClean(s).toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-");
const evFragName = slug => String(slug || "").replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
async function evAll(build) {
  let out = [];
  for (let from = 0; ; from += 100) {
    const { data, error } = await build().range(from, from + 99);
    if (error) throw error;
    out = out.concat(data || []);
    if ((data || []).length < 100) break;
  }
  return out;
}
const EV_SMALL = { fontFamily:sans, fontSize:12, color:T.mid };
const EV_LINK = { background:"none", border:"none", padding:0, fontFamily:sans, fontSize:12, color:T.mid, cursor:"pointer", textDecoration:"underline", textDecorationColor:T.rule, textUnderlineOffset:3, minHeight:32 };

// A note that saves when you tap away from it.
function EvNote({ value, onSave, placeholder, rows = 4 }) {
  const [v, setV] = useState(value || "");
  useEffect(() => { setV(value || ""); }, [value]);
  return <textarea value={v} rows={rows} onChange={e => setV(e.target.value)} onBlur={() => { if ((v || "") !== (value || "")) onSave(v); }} placeholder={placeholder} maxLength={2000}
    style={{ ...FIELD, padding:"12px 14px", resize:"vertical", lineHeight:1.5, fontSize:16 }}/>;
}

// Type to find a brand in the library, or add the name as you typed it.
function EvBrandAdd({ onAdd }) {
  const [q, setQ] = useState("");
  const [res, setRes] = useState([]);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    const t = evClean(q);
    if (t.length < 2) { setRes([]); return; }
    let off = false; setBusy(true);
    const h = setTimeout(async () => {
      const { data } = await supabase.from("houses").select("id, name").ilike("name", "%" + t + "%").order("name").limit(8);
      if (!off) { setRes(data || []); setBusy(false); }
    }, 250);
    return () => { off = true; clearTimeout(h); };
  }, [q]);
  const t = q.trim();
  const exact = res.some(r => r.name.toLowerCase() === t.toLowerCase());
  async function pick(row) { setQ(""); setRes([]); await onAdd(row); }
  return (
    <div style={{ position:"relative" }}>
      <input value={q} onChange={e => setQ(e.target.value)} placeholder="Add a brand from this event" autoComplete="off" aria-label="Add a brand" maxLength={120} style={FIELD}/>
      {t.length >= 2 && (
        <div style={{ marginTop:6, background:T.white, border:`1px solid ${T.rule}`, borderRadius:14, overflow:"hidden" }}>
          {res.map(r => <button key={r.id} onClick={() => pick({ house_id:r.id, brand_name:r.name })} style={{ display:"block", width:"100%", textAlign:"left", background:"none", border:"none", borderBottom:`1px solid ${T.lift}`, padding:"12px 14px", minHeight:48, fontFamily:serif, fontSize:17, color:T.black, cursor:"pointer" }}>{r.name}</button>)}
          {busy && !res.length && <p style={{ ...EV_SMALL, margin:0, padding:"12px 14px" }}>Searching…</p>}
          {!exact && <button onClick={() => pick({ house_id:null, brand_name:t })} style={{ display:"block", width:"100%", textAlign:"left", background:T.lift, border:"none", padding:"12px 14px", minHeight:48, fontFamily:sans, fontSize:14, color:T.ink, cursor:"pointer" }}>Add “{t}” as typed{!busy && !res.length ? " (not in the library yet)" : ""}</button>}
        </div>
      )}
    </div>
  );
}

// Find a fragrance to rate: this brand's own fragrances when it is in the library, otherwise a search of everything.
function EvFragAdd({ brand, onSearch, onAdd }) {
  const [q, setQ] = useState("");
  const [res, setRes] = useState([]);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    const t = evClean(q);
    if (t.length < 2) { setRes([]); return; }
    let off = false; setBusy(true);
    const h = setTimeout(async () => {
      try {
        let items = [];
        if (brand.house_id) {
          const { data } = await supabase.from("fragrances").select("id, slug").eq("house_id", brand.house_id).ilike("slug", "%" + evSlug(t) + "%").or("hidden.is.null,hidden.eq.false").order("slug").limit(8);
          items = (data || []).map(r => ({ id:r.id, name:evFragName(r.slug), house:brand.brand_name }));
        } else if (onSearch) {
          const r = await onSearch(t, "all", 0);
          items = (r.items || []).slice(0, 8).map(f => ({ id:f.id, name:f.name, house:f.house }));
        }
        if (!off) setRes(items);
      } catch (e) { if (!off) setRes([]); }
      if (!off) setBusy(false);
    }, 250);
    return () => { off = true; clearTimeout(h); };
  }, [q, brand.house_id]);
  const t = q.trim();
  async function pick(row) { setQ(""); setRes([]); await onAdd(row); }
  return (
    <div>
      <input value={q} onChange={e => setQ(e.target.value)} placeholder={brand.house_id ? "Find a fragrance by " + brand.brand_name : "Find a fragrance you smelled"} autoComplete="off" aria-label="Add a fragrance" maxLength={160} style={FIELD}/>
      {t.length >= 2 && (
        <div style={{ marginTop:6, background:T.white, border:`1px solid ${T.rule}`, borderRadius:14, overflow:"hidden" }}>
          {res.map(r => <button key={r.id} onClick={() => pick({ fragrance_id:r.id, frag_name:r.name })} style={{ display:"block", width:"100%", textAlign:"left", background:"none", border:"none", borderBottom:`1px solid ${T.lift}`, padding:"10px 14px", minHeight:48, cursor:"pointer" }}>
            <span style={{ display:"block", fontFamily:serif, fontSize:17, color:T.black }}>{r.name}</span>
            <span style={{ display:"block", fontFamily:sans, fontSize:12, color:T.mid }}>{r.house}</span>
          </button>)}
          {busy && !res.length && <p style={{ ...EV_SMALL, margin:0, padding:"12px 14px" }}>Searching…</p>}
          <button onClick={() => pick({ fragrance_id:null, frag_name:t })} style={{ display:"block", width:"100%", textAlign:"left", background:T.lift, border:"none", padding:"12px 14px", minHeight:48, fontFamily:sans, fontSize:14, color:T.ink, cursor:"pointer" }}>Add “{t}” as typed{!busy && !res.length ? " (not in the library yet)" : ""}</button>
        </div>
      )}
    </div>
  );
}


// ─── OWNER outreach (admin only): met in person, contact, tier, questions to ask ───
const OUTREACH_QUESTIONS = ["Who makes the fragrances, and where?", "Do you sell samples or discovery sets?", "Which fragrance should a newcomer start with?", "Do you ship to the US and EU?", "Can we list your samples on Memoir on Skin?", "Best email for follow-up"];
function OwnerOutreach({ brand, onPatch }) {
  const done = brand.questions_done || [];
  const tiers = ["A", "B", "C"];
  const inp = { ...FIELD, marginBottom:8 };
  return (
    <div style={{ border:`1px solid ${T.line || "#e6dfe0"}`, borderRadius:14, padding:"14px 16px", margin:"0 0 24px" }}>
      <p style={{ ...FLABEL, margin:"0 0 10px" }}>Owner outreach (only you see this)</p>
      <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:12 }}>
        <button onClick={() => onPatch({ met_in_person: !brand.met_in_person })} aria-pressed={!!brand.met_in_person} style={{ ...ghostBtn, ...(brand.met_in_person ? { background:T.black, color:"#fff" } : {}) }}>{brand.met_in_person ? "Met in person" : "Met in person?"}</button>
        {tiers.map(t => <button key={t} onClick={() => onPatch({ tier: brand.tier === t ? null : t })} aria-pressed={brand.tier === t} style={{ ...ghostBtn, ...(brand.tier === t ? { background:T.black, color:"#fff" } : {}) }}>Tier {t}</button>)}
      </div>
      {[["contact_name","Contact name"],["contact_role","Role"],["contact_email","Email"]].map(([k, ph]) => (
        <input key={k} defaultValue={brand[k] || ""} placeholder={ph} aria-label={ph} onBlur={e => { const v = e.target.value.trim() || null; if (v !== (brand[k] || null)) onPatch({ [k]: v }); }} style={inp}/>
      ))}
      <p style={{ ...FLABEL, margin:"8px 0 6px" }}>Questions to ask</p>
      {OUTREACH_QUESTIONS.map(q => (
        <label key={q} style={{ display:"flex", gap:10, alignItems:"center", padding:"6px 0", fontFamily:sans, fontSize:14 }}>
          <input type="checkbox" checked={done.includes(q)} onChange={() => onPatch({ questions_done: done.includes(q) ? done.filter(x => x !== q) : [...done, q] })}/>
          <span>{q}</span>
        </label>
      ))}
    </div>
  );
}
function EventsSheet({ uid, onClose, onSearch, onRate, onSmell }) {
  const [events, setEvents] = useState(null);
  const [evId, setEvId] = useState(null);
  const [brands, setBrands] = useState([]);
  const [frags, setFrags] = useState([]);
  const [loadingEv, setLoadingEv] = useState(false);
  const [brandId, setBrandId] = useState(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name:"", date:"", city:"" });
  const [err, setErr] = useState("");
  const [confirmDel, setConfirmDel] = useState("");
  const [fairs, setFairs] = useState([]);
  const [busyFair, setBusyFair] = useState("");
  const [linkText, setLinkText] = useState("");
  const [linkSent, setLinkSent] = useState(false);
  const [pasteOpen, setPasteOpen] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const [pasteMsg, setPasteMsg] = useState("");
  const [seeding, setSeeding] = useState(false);
  const [tidy, setTidy] = useState(false);
  const [picked, setPicked] = useState([]);
  const errTimer = useRef(null);
  const flag = (e) => { console.error("Events:", e); setErr("That didn't go through. Try again in a moment."); clearTimeout(errTimer.current); errTimer.current = setTimeout(() => setErr(""), 6000); };

  useEffect(() => {
    let off = false;
    (async () => {
      try {
        const rows = await evAll(() => supabase.from("member_events").select("*").eq("user_id", uid).order("created_at", { ascending:false }).order("id"));
        if (off) return; setEvents(rows); if (rows.length) setEvId(rows[0].id); else setCreating(true);
      } catch (e) { if (!off) { setEvents([]); flag(e); } }
    })();
    return () => { off = true; };
  }, [uid]);

  useEffect(() => {
    let off = false;
    (async () => {
      try {
        const { data } = await supabase.from("fair_events").select("id, name, event_date, end_date, city, website").eq("published", true).order("event_date", { ascending:true, nullsFirst:false }).limit(100);
        if (!off) setFairs(data || []);
      } catch (e) { /* the list is optional */ }
    })();
    return () => { off = true; };
  }, []);

  useEffect(() => {
    if (!evId) { setBrands([]); setFrags([]); return; }
    let off = false; setLoadingEv(true); setBrandId(null);
    (async () => {
      try {
        const [b, f] = await Promise.all([
          evAll(() => supabase.from("member_event_brands").select("*").eq("event_id", evId).order("created_at").order("id")),
          evAll(() => supabase.from("member_event_frags").select("*").eq("event_id", evId).order("created_at").order("id")),
        ]);
        if (!off) { setBrands(b); setFrags(f); }
      } catch (e) { if (!off) flag(e); }
      if (!off) setLoadingEv(false);
    })();
    return () => { off = true; };
  }, [evId]);

  const ev = (events || []).find(e => e.id === evId) || null;
  const brand = brands.find(b => b.id === brandId) || null;

  async function createEvent() {
    const name = form.name.trim(); if (!name) return;
    const { data, error } = await supabase.from("member_events").insert({ user_id:uid, name, event_date:form.date || null, city:form.city.trim() || null }).select("*").single();
    if (error) { flag(error); return; }
    setEvents(p => [data, ...(p || [])]); setEvId(data.id); setCreating(false); setForm({ name:"", date:"", city:"" });
  }
  // Fill an event with a list of brand names: match each to a library house, keep the rest as typed.
  async function addBrandNames(eventId, names, existing) {
    const seen = new Set((existing || []).map(b => b.brand_name.toLowerCase()));
    const clean = []; names.forEach(n => { const t = evClean(n).slice(0, 120); if (t && !seen.has(t.toLowerCase())) { seen.add(t.toLowerCase()); clean.push(t); } });
    if (!clean.length) return [];
    const rows = [];
    for (let i = 0; i < clean.length; i += 40) {
      const part = clean.slice(i, i + 40);
      const { data } = await supabase.from("houses").select("id, name").in("name", part);
      const byName = new Map((data || []).map(h => [h.name.toLowerCase(), h]));
      part.forEach(n => { const h = byName.get(n.toLowerCase()); rows.push({ user_id:uid, event_id:eventId, house_id:h ? h.id : null, brand_name:h ? h.name : n }); });
    }
    const out = [];
    for (let i = 0; i < rows.length; i += 100) {
      const { data, error } = await supabase.from("member_event_brands").insert(rows.slice(i, i + 100)).select("*");
      if (error) throw error; out.push(...(data || []));
    }
    return out;
  }
  async function useFair(fair) {
    if (busyFair) return; setBusyFair(fair.id);
    try {
      const { data: ev0, error } = await supabase.from("member_events").insert({ user_id:uid, name:fair.name, event_date:fair.event_date || null, city:fair.city || null, fair_event_id:fair.id }).select("*").single();
      if (error) throw error;
      const ex = await evAll(() => supabase.from("fair_event_exhibitors").select("house_id, brand_name").eq("event_id", fair.id).order("brand_name").order("id"));
      const rows = ex.map(x => ({ user_id:uid, event_id:ev0.id, house_id:x.house_id, brand_name:x.brand_name }));
      for (let i = 0; i < rows.length; i += 100) { const { error: e2 } = await supabase.from("member_event_brands").insert(rows.slice(i, i + 100)); if (e2) throw e2; }
      setEvents(p => [ev0, ...(p || [])]); setEvId(ev0.id); setCreating(false);
    } catch (e) { flag(e); }
    setBusyFair("");
  }
  async function pasteBrands() {
    const names = pasteText.split(/[\n;,\t]+/).map(x => x.trim()).filter(Boolean).slice(0, 400);
    if (!names.length || !evId) return;
    setPasteMsg("Adding…");
    try {
      const added = await addBrandNames(evId, names, brands);
      setBrands(p => [...p, ...added]); setPasteText(""); setPasteOpen(false); setPasteMsg(""); 
      if (!added.length) { setErr("Those brands are already in this event."); clearTimeout(errTimer.current); errTimer.current = setTimeout(() => setErr(""), 5000); }
    } catch (e) { setPasteMsg(""); flag(e); }
  }
  async function sendEventLink() {
    const link = linkText.trim(); if (!link) return;
    try { await sendSuggestion({ id:uid }, "event", { source:"events_notebook", link, note:"Please add this event with its exhibitor list." }); setLinkSent(true); setLinkText(""); }
    catch (e) { flag(e); }
  }
  async function deleteEvent(id) {
    const { error } = await supabase.from("member_events").delete().eq("id", id).eq("user_id", uid);
    if (error) { flag(error); return; }
    const rest = (events || []).filter(e => e.id !== id); setEvents(rest); setConfirmDel("");
    if (evId === id) { setEvId(rest[0] ? rest[0].id : null); if (!rest.length) setCreating(true); }
  }
  async function addBrand(row) {
    const existing = row.house_id ? brands.find(b => b.house_id === row.house_id) : brands.find(b => !b.house_id && b.brand_name.toLowerCase() === row.brand_name.toLowerCase());
    if (existing) { setBrandId(existing.id); return; }
    const { data, error } = await supabase.from("member_event_brands").insert({ user_id:uid, event_id:evId, house_id:row.house_id, brand_name:row.brand_name }).select("*").single();
    if (error) { flag(error); return; }
    setBrands(p => [...p, data]); setBrandId(data.id);
  }
  // First time a library brand is opened, bring in all of its fragrances so the member can rate what they smell and remove the rest.
  useEffect(() => {
    setTidy(false); setPicked([]);
    const b = brands.find(x => x.id === brandId);
    if (!b || !b.house_id || b.frags_loaded) return;
    let off = false; setSeeding(true);
    (async () => {
      try {
        const lib = await evAll(() => supabase.from("fragrances").select("id, slug").eq("house_id", b.house_id).or("hidden.is.null,hidden.eq.false").order("slug").order("id"));
        const { data: have } = await supabase.from("member_event_frags").select("fragrance_id").eq("brand_id", b.id).limit(100);
        const haveIds = new Set((have || []).map(x => x.fragrance_id));
        const rows = lib.filter(r => !haveIds.has(r.id)).map(r => ({ user_id:uid, event_id:b.event_id, brand_id:b.id, fragrance_id:r.id, frag_name:evFragName(r.slug) }));
        let added = [];
        for (let i = 0; i < rows.length; i += 100) {
          const { data, error } = await supabase.from("member_event_frags").insert(rows.slice(i, i + 100)).select("*");
          if (error) throw error; added = added.concat(data || []);
        }
        const { error: e3 } = await supabase.from("member_event_brands").update({ frags_loaded:true }).eq("id", b.id).eq("user_id", uid);
        if (e3) throw e3;
        if (off) return;
        setFrags(p => [...p, ...added.filter(a => !p.some(x => x.id === a.id))]);
        setBrands(p => p.map(x => x.id === b.id ? { ...x, frags_loaded:true } : x));
      } catch (e) { if (!off) flag(e); }
      if (!off) setSeeding(false);
    })();
    return () => { off = true; setSeeding(false); };
  }, [brandId]);
  async function removePicked(ids) {
    if (!ids.length) return;
    const { error } = await supabase.from("member_event_frags").delete().in("id", ids).eq("user_id", uid);
    if (error) { flag(error); return; }
    setFrags(p => p.filter(f => !ids.includes(f.id))); setPicked([]); setTidy(false);
  }
  const [isOwner, setIsOwner] = useState(false);
  useEffect(() => { let on = true; supabase.rpc("is_admin").then(r => { if (on && !r.error && r.data === true) setIsOwner(true); }, () => {}); return () => { on = false; }; }, []);
  async function patchBrand(id, patch) {
    const before = brands.find(b => b.id === id); setBrands(p => p.map(b => b.id === id ? { ...b, ...patch } : b));
    const { error } = await supabase.from("member_event_brands").update(patch).eq("id", id).eq("user_id", uid);
    if (error) { setBrands(p => p.map(b => b.id === id ? before : b)); flag(error); }
  }
  async function deleteBrand(id) {
    const { error } = await supabase.from("member_event_brands").delete().eq("id", id).eq("user_id", uid);
    if (error) { flag(error); return; }
    setBrands(p => p.filter(b => b.id !== id)); setFrags(p => p.filter(f => f.brand_id !== id)); setBrandId(null); setConfirmDel("");
  }
  async function addFrag(b, row) {
    const existing = row.fragrance_id ? frags.find(f => f.brand_id === b.id && f.fragrance_id === row.fragrance_id) : frags.find(f => f.brand_id === b.id && !f.fragrance_id && f.frag_name.toLowerCase() === row.frag_name.toLowerCase());
    if (existing) return;
    const { data, error } = await supabase.from("member_event_frags").insert({ user_id:uid, event_id:evId, brand_id:b.id, fragrance_id:row.fragrance_id, frag_name:row.frag_name }).select("*").single();
    if (error) { flag(error); return; }
    setFrags(p => [...p, data]);
  }
  async function patchFrag(id, patch) {
    const before = frags.find(f => f.id === id); setFrags(p => p.map(f => f.id === id ? { ...f, ...patch } : f));
    const { error } = await supabase.from("member_event_frags").update(patch).eq("id", id).eq("user_id", uid);
    if (error) { setFrags(p => p.map(f => f.id === id ? before : f)); flag(error); return false; }
    return true;
  }
  async function rate(f, value) {
    const next = f.rating === value ? null : value;
    const ok = await patchFrag(f.id, { rating:next });
    if (ok && f.fragrance_id && onRate) onRate(f.fragrance_id, next);
  }
  async function smell(f, how) {
    const next = f.smelled_how === how ? null : how;
    const ok = await patchFrag(f.id, { smelled_how:next });
    if (ok && next && f.fragrance_id && onSmell) onSmell(f.fragrance_id, next);
  }
  async function deleteFrag(id) {
    const { error } = await supabase.from("member_event_frags").delete().eq("id", id).eq("user_id", uid);
    if (error) { flag(error); return; }
    setFrags(p => p.filter(f => f.id !== id));
  }

  const brandFrags = b => frags.filter(f => f.brand_id === b.id);
  const toBuy = frags.filter(f => f.to_buy);
  const ratedCount = frags.filter(f => f.rating).length;
  const lovedCount = frags.filter(f => f.rating === "love").length;
  const sortedBrands = [...brands].sort((a, b) => (b.interested ? 1 : 0) - (a.interested ? 1 : 0));
  const when = e => [e.event_date ? new Date(e.event_date + "T12:00:00").toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric" }) : "", e.city || ""].filter(Boolean).join(" · ");
  const chip = on => ({ flexShrink:0, fontFamily:sans, fontSize:13, padding:"0 14px", minHeight:40, borderRadius:20, whiteSpace:"nowrap", border:`1px solid ${on ? T.black : T.rule}`, background:on ? T.black : T.white, color:on ? T.white : T.mid, cursor:"pointer" });
  const toggle = on => ({ fontFamily:sans, fontSize:13, fontWeight:500, minHeight:44, padding:"0 14px", borderRadius:12, border:`1px solid ${on ? "var(--accent)" : T.rule}`, background:on ? "var(--accent)" : T.white, color:on ? "#fff" : T.mid, cursor:"pointer" });

  return createPortal(
    <div role="dialog" aria-modal="true" aria-label="Events" style={{ position:"fixed", inset:0, zIndex:3000, background:T.white, overflowY:"auto", WebkitOverflowScrolling:"touch" }}>
      <div style={{ maxWidth:640, margin:"0 auto", padding:"18px 18px 60px", boxSizing:"border-box" }}>
        {!brand && <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
          <h2 style={{ fontFamily:serif, fontSize:"clamp(28px, 4vw, 38px)", fontWeight:400, color:T.black, margin:0, letterSpacing:-0.6 }}>Events</h2>
          <button onClick={onClose} aria-label="Close" style={{ background:"none", border:"none", fontSize:22, color:T.mid, cursor:"pointer", minWidth:44, minHeight:44 }}>✕</button>
        </div>}
        {!brand && <p style={{ fontFamily:sans, fontSize:14, color:T.mid, lineHeight:1.6, margin:"0 0 16px" }}>A notebook for fairs, expos and launch parties. Note the brands you visit, rate what you smell, and it lands in your collection. Only you can see it.</p>}
        {err && <p role="status" style={{ fontFamily:sans, fontSize:13, color:T.bad, margin:"0 0 12px" }}>{err}</p>}

        {events === null && <p style={EV_SMALL}>Loading…</p>}

        {events !== null && !brand && <>
          <div style={{ display:"flex", gap:6, overflowX:"auto", paddingBottom:4, marginBottom:14 }}>
            {events.map(e => <button key={e.id} onClick={() => { setEvId(e.id); setCreating(false); setConfirmDel(""); }} style={chip(evId === e.id && !creating)}>{e.name}</button>)}
            <button onClick={() => setCreating(true)} style={chip(creating)}>+ New event</button>
          </div>

          {creating && fairs.length > 0 && <div style={{ marginBottom:18 }}>
            <p style={{ ...FLABEL, margin:"0 0 6px" }}>Upcoming events</p>
            <p style={{ fontFamily:sans, fontSize:13, color:T.mid, lineHeight:1.5, margin:"0 0 6px" }}>Pick one and the exhibitors are filled in for you.</p>
            {fairs.filter(f => !events.some(e => e.fair_event_id === f.id)).map(f => (
              <div key={f.id} style={{ display:"flex", alignItems:"center", gap:10, borderBottom:`1px solid ${T.rule}`, padding:"10px 0" }}>
                <span style={{ flex:1, minWidth:0 }}>
                  <span style={{ display:"block", fontFamily:serif, fontSize:18, color:T.black, overflowWrap:"anywhere" }}>{f.name}</span>
                  <span style={{ display:"block", fontFamily:sans, fontSize:12, color:T.mid }}>{[f.event_date ? new Date(f.event_date + "T12:00:00").toLocaleDateString(undefined, { day:"numeric", month:"short", year:"numeric" }) : "", f.city].filter(Boolean).join(" · ")}</span>
                </span>
                <button onClick={() => useFair(f)} disabled={!!busyFair} style={{ ...communityCta(!busyFair), width:"auto", flex:"0 0 auto", minHeight:44, padding:"0 14px", whiteSpace:"nowrap", fontSize:14 }}>{busyFair === f.id ? "Adding…" : "Use this event"}</button>
              </div>
            ))}
          </div>}

          {creating && <div style={{ background:T.lift, border:`1px solid ${T.rule}`, borderRadius:14, padding:16, marginBottom:18 }}>
            <p style={{ fontFamily:serif, fontSize:20, color:T.black, margin:"0 0 10px" }}>{fairs.length ? "Or start your own" : "Start an event"}</p>
            <input value={form.name} onChange={e => setForm({ ...form, name:e.target.value })} placeholder="Event name, e.g. Esxence 2027" maxLength={120} aria-label="Event name" style={{ ...FIELD, marginBottom:8 }}/>
            <div style={{ display:"flex", gap:8, marginBottom:12 }}>
              <input type="date" value={form.date} onChange={e => setForm({ ...form, date:e.target.value })} aria-label="Date" style={{ ...FIELD, flex:1 }}/>
              <input value={form.city} onChange={e => setForm({ ...form, city:e.target.value })} placeholder="City" maxLength={80} aria-label="City" style={{ ...FIELD, flex:1 }}/>
            </div>
            <div style={{ display:"flex", gap:8 }}>
              {events.length > 0 && <button onClick={() => setCreating(false)} style={{ ...ghostBtn, flex:1 }}>Cancel</button>}
              <button onClick={createEvent} disabled={!form.name.trim()} style={{ ...communityCta(!!form.name.trim()), flex:2 }}>Create event</button>
            </div>
          </div>}

          {creating && <div style={{ marginBottom:18 }}>
            <p style={{ ...FLABEL, margin:"0 0 6px" }}>Don't see your event?</p>
            {linkSent ? <p style={{ fontFamily:sans, fontSize:14, color:T.ink, lineHeight:1.5, margin:0 }}>Thank you. We'll add it with its exhibitors and it will show up in the list above.</p> : <>
              <p style={{ fontFamily:sans, fontSize:13, color:T.mid, lineHeight:1.5, margin:"0 0 8px" }}>Paste a link to the event page and we'll add it with its exhibitors.</p>
              <div style={{ display:"flex", gap:8 }}>
                <input value={linkText} onChange={e => setLinkText(e.target.value)} placeholder="https://" inputMode="url" maxLength={300} aria-label="Link to the event" style={{ ...FIELD, flex:1 }}/>
                <button onClick={sendEventLink} disabled={!linkText.trim()} style={{ ...ghostBtn, minHeight:48, padding:"0 16px" }}>Send</button>
              </div>
            </>}
          </div>}

          {ev && !creating && <>
            <p style={{ fontFamily:sans, fontSize:13, color:T.mid, margin:"0 0 14px" }}>{when(ev) ? when(ev) + " · " : ""}{brands.length} brand{brands.length === 1 ? "" : "s"} · {ratedCount} rated · {lovedCount} loved</p>
            <EvBrandAdd onAdd={addBrand}/>
            <button onClick={() => setPasteOpen(o => !o)} style={{ background:"none", border:"none", padding:"10px 0 0", fontFamily:sans, fontSize:13, color:T.mid, textDecoration:"underline", cursor:"pointer" }}>{pasteOpen ? "Close" : "Paste a list of exhibitors"}</button>
            {pasteOpen && <div style={{ marginTop:8 }}>
              <textarea value={pasteText} onChange={e => setPasteText(e.target.value)} rows={5} placeholder="One brand per line, or separated by commas" aria-label="Exhibitor list" style={{ ...FIELD, height:"auto", padding:12, resize:"vertical" }}/>
              <button onClick={pasteBrands} disabled={!pasteText.trim() || !!pasteMsg} style={{ ...communityCta(!!pasteText.trim()), width:"100%", marginTop:8 }}>{pasteMsg || "Add these brands"}</button>
            </div>}
            {loadingEv && <p style={{ ...EV_SMALL, margin:"14px 0" }}>Loading…</p>}
            {!loadingEv && !brands.length && <p style={{ fontFamily:sans, fontSize:14, color:T.faint, textAlign:"center", margin:"28px 0" }}>No brands yet. Search for the first one you visit.</p>}
            <div style={{ marginTop:8 }}>
              {sortedBrands.map(b => {
                const bf = brandFrags(b), r = bf.filter(f => f.rating).length, l = bf.filter(f => f.rating === "love").length;
                return (
                  <div key={b.id} style={{ display:"flex", alignItems:"stretch", borderBottom:`1px solid ${T.rule}` }}>
                    <button onClick={() => setBrandId(b.id)} style={{ flex:1, minWidth:0, textAlign:"left", background:"none", border:"none", padding:"12px 0", minHeight:60, cursor:"pointer" }}>
                      <span style={{ display:"block", fontFamily:serif, fontSize:19, color:T.black, overflowWrap:"anywhere" }}>{b.brand_name}</span>
                      <span style={{ display:"block", fontFamily:sans, fontSize:12, color:T.mid, marginTop:2 }}>{bf.length ? r + " rated" + (l ? " · " + l + " loved" : "") : "Nothing noted yet"}{b.got_sample ? " · sample or kit" : ""}{!b.house_id ? " · not in the library" : ""}</span>
                    </button>
                    <button onClick={() => patchBrand(b.id, { interested:!b.interested })} aria-pressed={b.interested} aria-label={b.interested ? "Remove from the ones to revisit" : "Mark to revisit"} style={{ background:"none", border:"none", minWidth:48, cursor:"pointer", display:"grid", placeItems:"center" }}>
                      <Icon name="wishstar" size={22} color={b.interested ? "var(--accent)" : T.faint}/>
                    </button>
                  </div>
                );
              })}
            </div>

            {toBuy.length > 0 && <div style={{ marginTop:26 }}>
              <p style={{ ...FLABEL, margin:"0 0 6px" }}>To buy</p>
              {toBuy.map(f => { const b = brands.find(x => x.id === f.brand_id); return (
                <div key={f.id} style={{ display:"flex", justifyContent:"space-between", gap:10, borderBottom:`1px solid ${T.rule}`, padding:"10px 0", fontFamily:sans, fontSize:15, color:T.ink }}>
                  <span style={{ minWidth:0, overflowWrap:"anywhere" }}>{f.frag_name}{b ? <span style={{ color:T.mid }}> · {b.brand_name}</span> : null}</span>
                  {f.price && <span style={{ color:T.mid, flexShrink:0 }}>{f.price}</span>}
                </div>); })}
            </div>}

            <div style={{ marginTop:30 }}>
              {confirmDel === ev.id
                ? <div style={{ display:"flex", gap:8 }}><button onClick={() => setConfirmDel("")} style={{ ...ghostBtn, flex:1 }}>Keep it</button><button onClick={() => deleteEvent(ev.id)} style={{ ...ghostBtn, flex:1, color:T.bad, borderColor:T.bad }}>Delete event and its notes</button></div>
                : <button onClick={() => setConfirmDel(ev.id)} style={EV_LINK}>Delete this event</button>}
              <p style={{ fontFamily:sans, fontSize:12, color:T.faint, lineHeight:1.6, margin:"10px 0 0" }}>Deleting an event removes its notes here. Fragrances already added to your collection stay.</p>
            </div>
          </>}
        </>}

        {brand && <>
          <BackBtn onBack={() => { setBrandId(null); setConfirmDel(""); }} label={ev ? ev.name : "Back"}/>
          <h2 style={{ fontFamily:serif, fontSize:"clamp(28px, 4vw, 36px)", fontWeight:400, color:T.black, margin:"0 0 4px", letterSpacing:-0.6, overflowWrap:"anywhere" }}>{brand.brand_name}</h2>
          {!brand.house_id && <p style={{ ...EV_SMALL, margin:"0 0 6px" }}>Not in the library yet. You can still keep notes, and suggest it from Collection.</p>}
          <div style={{ display:"flex", gap:8, flexWrap:"wrap", margin:"14px 0 20px" }}>
            <button onClick={() => patchBrand(brand.id, { interested:!brand.interested })} aria-pressed={brand.interested} style={toggle(brand.interested)}>{brand.interested ? "Marked to revisit" : "Mark to revisit"}</button>
            <button onClick={() => patchBrand(brand.id, { got_sample:!brand.got_sample })} aria-pressed={brand.got_sample} style={toggle(brand.got_sample)}>{brand.got_sample ? "Got a sample or kit" : "Got a sample or kit?"}</button>
          </div>
          {isOwner && <OwnerOutreach brand={brand} onPatch={p => patchBrand(brand.id, p)}/>}
          <p style={{ ...FLABEL, margin:"0 0 6px" }}>Your notes on the brand</p>
          <EvNote value={brand.note} onSave={v => patchBrand(brand.id, { note:v || null })} placeholder="Who you spoke to, what they said, how the booth felt…"/>

          <p style={{ ...FLABEL, margin:"26px 0 6px" }}>What you smelled</p>
          <EvFragAdd brand={brand} onSearch={onSearch} onAdd={row => addFrag(brand, row)}/>
          {seeding && <p style={{ ...EV_SMALL, margin:"12px 0 0" }}>Bringing in {brand.brand_name}'s fragrances…</p>}
          {!seeding && brand.house_id && brandFrags(brand).length > 1 && <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:10, margin:"14px 0 0" }}>
            <span style={{ ...EV_SMALL }}>{brandFrags(brand).length} fragrances. Rate the ones you try.</span>
            <button onClick={() => { setTidy(t => !t); setPicked([]); }} style={{ ...ghostBtn, minHeight:40, padding:"0 14px", fontSize:13 }}>{tidy ? "Done" : "Select to remove"}</button>
          </div>}
          {tidy && <div style={{ display:"flex", gap:8, flexWrap:"wrap", margin:"12px 0 4px" }}>
            <button onClick={() => setPicked(brandFrags(brand).map(f => f.id))} style={{ ...ghostBtn, minHeight:40, padding:"0 14px", fontSize:13 }}>Select all</button>
            <button onClick={() => setPicked(brandFrags(brand).filter(f => !f.rating && !f.to_buy && !f.note).map(f => f.id))} style={{ ...ghostBtn, minHeight:40, padding:"0 14px", fontSize:13 }}>Select the untouched</button>
            <button onClick={() => removePicked(picked)} disabled={!picked.length} style={{ ...ghostBtn, minHeight:40, padding:"0 14px", fontSize:13, color:picked.length ? T.bad : T.faint, borderColor:picked.length ? T.bad : T.rule }}>Remove {picked.length ? picked.length : ""} selected</button>
          </div>}
          <div style={{ marginTop:8 }}>
            {tidy
              ? brandFrags(brand).map(f => { const on = picked.includes(f.id); return (
                  <button key={f.id} onClick={() => setPicked(p => on ? p.filter(x => x !== f.id) : [...p, f.id])} aria-pressed={on} style={{ display:"flex", alignItems:"center", gap:12, width:"100%", textAlign:"left", background:on ? T.lift : "none", border:"none", borderBottom:`1px solid ${T.rule}`, padding:"12px 4px", minHeight:52, cursor:"pointer" }}>
                    <span aria-hidden="true" style={{ width:22, height:22, borderRadius:6, flexShrink:0, border:`1.5px solid ${on ? T.black : T.rule}`, background:on ? T.black : T.white, color:T.white, display:"grid", placeItems:"center", fontSize:14 }}>{on ? "✓" : ""}</span>
                    <span style={{ flex:1, minWidth:0, fontFamily:serif, fontSize:18, color:T.black, overflowWrap:"anywhere" }}>{f.frag_name}</span>
                    {(f.rating || f.to_buy || f.note) && <span style={EV_SMALL}>{f.rating ? "rated" : "noted"}</span>}
                  </button>); })
              : brandFrags(brand).map(f => <EvFragRow key={f.id} f={f} onRate={v => rate(f, v)} onSmell={h => smell(f, h)} onPatch={p => patchFrag(f.id, p)} onDelete={() => deleteFrag(f.id)}/>)}
            {!seeding && !brandFrags(brand).length && <p style={{ fontFamily:sans, fontSize:14, color:T.faint, margin:"14px 0 0" }}>Add the fragrances you try, then tap Love, Like or No.</p>}
          </div>
          {brandFrags(brand).some(f => f.fragrance_id) && <p style={{ fontFamily:sans, fontSize:12, color:T.faint, lineHeight:1.6, margin:"12px 0 0" }}>Rated fragrances from the library are added to your collection as Smelled.</p>}

          <div style={{ marginTop:30 }}>
            {confirmDel === brand.id
              ? <div style={{ display:"flex", gap:8 }}><button onClick={() => setConfirmDel("")} style={{ ...ghostBtn, flex:1 }}>Keep it</button><button onClick={() => deleteBrand(brand.id)} style={{ ...ghostBtn, flex:1, color:T.bad, borderColor:T.bad }}>Remove brand and its notes</button></div>
              : <button onClick={() => setConfirmDel(brand.id)} style={EV_LINK}>Remove this brand from the event</button>}
          </div>
        </>}
      </div>
    </div>, document.body);
}

function EvFragRow({ f, onRate, onSmell, onPatch, onDelete }) {
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState(false);
  return (
    <div style={{ borderBottom:`1px solid ${T.rule}`, padding:"10px 0" }}>
      <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
        <span style={{ flex:"1 1 150px", minWidth:0, fontFamily:serif, fontSize:18, color:T.black, overflowWrap:"anywhere" }}>{f.frag_name}</span>
        <div style={{ display:"flex", gap:6 }}>
          {EVENT_RATINGS.map(([k, label]) => { const on = f.rating === k; return (
            <button key={k} onClick={() => onRate(k)} aria-pressed={on} style={{ minWidth:52, minHeight:44, borderRadius:12, fontFamily:sans, fontSize:14, fontWeight:500, cursor:"pointer", border:`1px solid ${on ? REACTION_FILL[k] : T.rule}`, background:on ? REACTION_FILL[k] : T.white, color:on ? ON_ACCENT : T.mid }}>{label}</button>); })}
        </div>
      </div>
      <div style={{ display:"flex", gap:6, marginTop:8, flexWrap:"wrap" }}>
        {[["blotter", "Smelled on blotter"], ["skin", "Smelled on skin"]].map(([k, label]) => { const on = f.smelled_how === k; return (
          <button key={k} onClick={() => onSmell(k)} aria-pressed={on} style={{ minHeight:40, padding:"0 14px", borderRadius:20, fontFamily:sans, fontSize:13, fontWeight:on ? 600 : 500, cursor:"pointer", border:`1px solid ${on ? T.black : T.rule}`, background:on ? T.black : T.white, color:on ? T.white : T.mid }}>{label}</button>); })}
      </div>
      <div style={{ display:"flex", gap:14, alignItems:"center", marginTop:4, flexWrap:"wrap" }}>
        <button onClick={() => setOpen(o => !o)} style={EV_LINK}>{f.note ? "Note ●" : "Add a note"}</button>
        <button onClick={() => onPatch({ to_buy:!f.to_buy })} aria-pressed={f.to_buy} style={{ ...EV_LINK, color:f.to_buy ? "var(--accent)" : T.mid, fontWeight:f.to_buy ? 600 : 400 }}>{f.to_buy ? "On my buy list" : "Add to buy list"}</button>
        {f.to_buy && <input defaultValue={f.price || ""} onBlur={e => { const v = e.target.value.trim(); if (v !== (f.price || "")) onPatch({ price:v || null }); }} placeholder="Price" maxLength={40} aria-label="Price" style={{ ...FIELD, width:100, minHeight:36, fontSize:14, padding:"0 10px" }}/>}
        <span style={{ flex:1 }}/>
        {confirm ? <span style={{ display:"flex", gap:12 }}><button onClick={onDelete} style={{ ...EV_LINK, color:T.bad }}>Remove</button><button onClick={() => setConfirm(false)} style={EV_LINK}>Keep</button></span> : <button onClick={() => setConfirm(true)} style={EV_LINK}>Remove</button>}
      </div>
      {open && <div style={{ marginTop:8 }}><EvNote value={f.note} rows={3} onSave={v => onPatch({ note:v || null })} placeholder="What it reminded you of, how it wore on skin…"/></div>}
    </div>
  );
}

function MyKits({ rows, setRows, onOpenBrand }) {
  const [sub, setSub] = useState("");
  if (rows === null) return <p style={{ fontFamily:sans, fontSize:13, color:T.faint }}>Loading</p>;
  const list = rows.filter(r => r.houses && (!sub || r.status === sub));
  const cnt = k => rows.filter(r => r.houses && r.status === k).length;
  const change = async (r, st) => {
    const prev = rows;
    setRows(p => st ? p.map(x => x.house_id === r.house_id ? { ...x, status: st } : x) : p.filter(x => x.house_id !== r.house_id));
    const { error } = await setKitStatus(r.house_id, st, true);
    if (error) setRows(prev);
  };
  return (
    <div>
      <div style={{ display:"flex", flexWrap:"wrap", gap:7, marginBottom:14 }}>
        {KIT_STATES.map(([k, l]) => { const on = sub === k; return <button key={k} onClick={() => setSub(on ? "" : k)} aria-pressed={on} style={{ fontFamily:sans, fontSize:12, padding:"0 14px", minHeight:36, borderRadius:20, border:`1px solid ${on ? T.black : T.rule}`, background:on ? T.black : T.white, color:on ? T.white : T.ink, cursor:"pointer" }}>{l}<span style={{ opacity:0.65, marginLeft:6 }}>{cnt(k)}</span></button>; })}
      </div>
      {list.length === 0
        ? <div style={{ textAlign:"center", padding:"40px 0", color:T.faint }}><p style={{ fontSize:13, lineHeight:1.6, margin:0 }}>{rows.length === 0 ? "No discovery kits yet. Open Discover, find the Discovery kits shelf and tap Own or Wishlist on a kit." : "Nothing in this list."}</p></div>
        : <div style={{ display:"flex", flexWrap:"wrap", gap:14 }}>
          {list.map(r => { const h = r.houses; return (
            <div key={r.house_id} style={{ flex:"1 1 240px", maxWidth:360, boxSizing:"border-box", background:T.white, border:`1px solid ${T.rule}`, borderRadius:16, padding:"16px 16px 14px" }}>
              {h.kit_image_url && <img src={h.kit_image_url} alt={(h.kit_name || "Discovery set") + " by " + h.name} loading="lazy" style={{ display:"block", width:"100%", aspectRatio:"1 / 1", objectFit:"contain", background:"#fff", borderRadius:10, marginBottom:12 }} onError={e => { e.currentTarget.style.display = "none"; }}/>}
              <button onClick={() => onOpenBrand && onOpenBrand({ slug:h.slug, name:h.name })} style={{ textAlign:"left", background:"none", border:"none", padding:0, cursor:"pointer" }}>
                <span style={{ display:"block", fontFamily:serif, fontSize:20, color:T.black, lineHeight:1.2 }}>{String(h.name).replace(/\s*\(now .*\)$/, "")}</span>
                <span style={{ display:"block", fontFamily:sans, fontSize:14, color:T.ink, margin:"6px 0 0" }}>{h.kit_name || "Discovery set"}{h.kit_price && <span style={{ color:T.teal, fontWeight:600 }}> · {h.kit_price}</span>}</span>
              </button>
              <KitChips status={r.status} onSet={st => change(r, st)}/>
            </div>); })}
        </div>}
    </div>
  );
}
function CollectionTab({ onEvents, onImport, onOpenBrand, onOpenFrag, statuses:userStatuses, statusSets:sets, reactions, onReaction, onSuggest, fragrances, wears, onOpenJournal }) {
  const FR = (fragrances && fragrances.length) ? fragrances : FRAGRANCES;
  const [search,setSearch]=useState("");
  const [view,setViewState]=useState(()=>{try{const v=localStorage.getItem("mos_collection_view");return v==="shelf"||v==="list"||v==="grid"?v:"grid";}catch(e){return "grid";}});
  const setView=v=>{setViewState(v);try{localStorage.setItem("mos_collection_view",v);}catch(e){}};
  const [ctab,setCtab]=useState("all");
  const [rxF,setRxF]=useState("");
  const [subF,setSubF]=useState("");
  const TABS=[["all","All"],["bottle","Bottles"],["travel","Travel size"],["sample","Samples"],["kit","Discovery kits"]];
  const PRE={bottle:["bottle_owned","bottle_wishlist","bottle_finished"],travel:["travel_have","travel_wishlist","travel_finished"],sample:["sample_have","sample_wishlist","sample_finished"]};
  const SUBS=ctab==="all"?[["smelled","Smelled on blotter"],["tried_skin","Tried on skin"],["finished","Finished"],["wishlist","Wishlist"]]:[["own","Own"],["wishlist","Wishlist"],["finished","Finished"]];
  const has=(id,k)=>((sets||{})[id]||[]).includes(k);
  const mineSet=f=>(sets||{})[f.id]||[];
  const inTab=f=>ctab==="all"?!!(userStatuses[f.id]||reactions[f.id]):mineSet(f).some(k=>(PRE[ctab]||[]).includes(k));
  const subOk=(f,k)=>{const st=mineSet(f);if(!k)return true;
    if(ctab==="all")return k==="smelled"?st.includes("smelled"):k==="tried_skin"?st.includes("tried_skin"):k==="finished"?isFinishedSet(st):st.some(x=>/_wishlist$/.test(x));
    const P=PRE[ctab]||[];return k==="own"?st.includes(P[0]):k==="wishlist"?st.includes(P[1]):st.includes(P[2]);};
  const rxOk=(f,k)=>!k||reactions[f.id]===k;
  const [kitRows,setKitRows]=useState(null);
  useEffect(()=>{let off=false;pageAll((a,b)=>supabase.from("user_kits").select("house_id, status, houses(name, slug, kit_name, kit_price, kit_url, kit_image_url, country)").order("house_id").range(a,b)).then(r=>{if(!off)setKitRows(r.error?[]:(r.data||[]));}).catch(()=>{if(!off)setKitRows([]);});return()=>{off=true;};},[]);
  const tabCount=t=>t==="kit"?(kitRows||[]).length:t==="all"?FR.filter(x=>userStatuses[x.id]||reactions[x.id]).length:FR.filter(x=>mineSet(x).some(k=>(PRE[t]||[]).includes(k))).length;
  const rxCount=k=>FR.filter(f=>inTab(f)&&reactions[f.id]===k&&subOk(f,subF)).length;
  const subCount=k=>FR.filter(f=>inTab(f)&&rxOk(f,rxF)&&subOk(f,k)).length;
  const filtered=FR.filter(f=>{const ms=inTab(f)&&rxOk(f,rxF)&&subOk(f,subF);const q=search.toLowerCase();const mq=!search||String(f.name||"").toLowerCase().includes(q)||String(f.house||"").toLowerCase().includes(q)||String(f.family||"").toLowerCase().includes(q)||(f.accords||[]).some(a=>String(a.n||"").toLowerCase().includes(q))||(allNoteList(f.notes)).some(n=>String((n&&n.n)||"").toLowerCase().includes(q));return ms&&mq;});
  const pickTab=t=>{setCtab(t);setSubF("");setRxF("");};
  const chipB=(on,label,count,fn,key)=>(<button key={key||label} onClick={fn} aria-pressed={on} style={{fontFamily:sans,fontSize:12,padding:"0 14px",minHeight:36,borderRadius:20,whiteSpace:"nowrap",flexShrink:0,border:`1px solid ${on?T.black:T.rule}`,background:on?T.black:T.white,color:on?T.white:T.ink,cursor:"pointer"}}>{label}<span style={{opacity:0.65,marginLeft:6}}>{count}</span></button>);
  return (
    <div>
      <div className="mos-pagehead">
        <h2 style={{fontFamily:serif,fontSize:"clamp(32px, 3.2vw, 50px)",color:T.black,letterSpacing:-0.8,margin:0,fontWeight:400}}>My collection</h2>
        <p style={{fontFamily:sans,fontSize:"clamp(13px, 1.1vw, 17px)",color:T.mid,margin:"6px 0 0"}}>Bottles, samples, and everything in between.</p>
      </div>
      {(onEvents||onImport)&&<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(240px, 1fr))",gap:10,margin:"0 0 16px"}}>
        {onEvents&&<button onClick={onEvents} style={{textAlign:"left",background:T.lift,border:`1px solid ${T.rule}`,borderRadius:14,padding:"14px 16px",cursor:"pointer"}}>
          <span style={{display:"block",fontFamily:serif,fontSize:20,color:T.black}}>Events</span>
          <span style={{display:"block",fontFamily:sans,fontSize:13,color:T.mid,lineHeight:1.5,marginTop:2}}>Your notebook for fairs and expos. Note brands, rate what you smell.</span>
        </button>}
        {onImport&&<button onClick={onImport} style={{textAlign:"left",background:T.lift,border:`1px solid ${T.rule}`,borderRadius:14,padding:"14px 16px",cursor:"pointer"}}>
          <span style={{display:"flex",alignItems:"center",gap:8,fontFamily:serif,fontSize:20,color:T.black}}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 16V4"/><path d="M7 9l5-5 5 5"/><path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3"/></svg>Upload your list</span>
          <span style={{display:"block",fontFamily:sans,fontSize:13,color:T.mid,lineHeight:1.5,marginTop:2}}>Import a spreadsheet, a list, or a collection from another site.</span>
        </button>}
      </div>}
      <BrandsToTry onOpenBrand={onOpenBrand}/>
      <div role="tablist" style={{display:"flex",overflowX:"auto",borderBottom:`1px solid ${T.rule}`,marginBottom:14}}>
        {TABS.map(([k,l])=>(<button key={k} role="tab" aria-selected={ctab===k} onClick={()=>pickTab(k)} style={{position:"relative",padding:"0 2px 13px",marginRight:24,background:"none",border:"none",cursor:"pointer",fontFamily:sans,fontSize:15,fontWeight:600,whiteSpace:"nowrap",flexShrink:0,color:ctab===k?T.black:T.mid}}>{l}<span style={{fontWeight:400,opacity:0.6,marginLeft:6,fontSize:12}}>{tabCount(k)}</span>{ctab===k&&<span style={{position:"absolute",left:0,right:0,bottom:-1,height:2,background:T.black}}/>}</button>))}
      </div>
      {ctab==="all"&&<div style={{display:"flex",flexWrap:"wrap",gap:7,marginBottom:8}}>
        {[["love","Love"],["like","Like"],["dislike","Dislike"]].map(([k,l])=>chipB(rxF===k,l,rxCount(k),()=>setRxF(rxF===k?"":k),"rx"+k))}
      </div>}
      {ctab!=="kit"&&<div style={{display:"flex",flexWrap:"wrap",gap:7,marginBottom:14}}>
        {SUBS.map(([k,l])=>chipB(subF===k,l,subCount(k),()=>setSubF(subF===k?"":k),"sub"+k))}
      </div>}
      {ctab==="kit"&&<MyKits rows={kitRows} setRows={setKitRows} onOpenBrand={onOpenBrand}/>}
      {ctab!=="kit"&&<>
      <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:12}}>
      <div style={{position:"relative",flex:1,minWidth:0}}>
        <span style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)"}}><Icon name="search" size={14} color={T.faint}/></span>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search…" style={{width:"100%",background:T.white,border:`1px solid ${search?T.black:T.rule}`,borderRadius:12,padding:"12px 14px 12px 40px",fontSize:13,color:T.black,outline:"none",boxSizing:"border-box",fontFamily:sans,transition:"border-color 0.15s"}}/>
        {search&&<button onClick={()=>setSearch("")} style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",fontSize:14,color:T.mid,cursor:"pointer"}}>✕</button>}
      </div>
      <div role="group" aria-label="Collection view" style={{display:"flex",gap:4,flexShrink:0}}>
        {["grid","shelf","list"].map(k=>(
          <button key={k} onClick={()=>setView(k)} aria-pressed={view===k} aria-label={k+" view"} style={{width:42,height:42,borderRadius:12,border:`1px solid ${view===k?T.black:T.rule}`,background:view===k?T.black:T.white,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",padding:0}}>
            <ViewIcon kind={k} color={view===k?T.white:T.mid}/>
          </button>))}
      </div>
      </div>
      {search&&<p style={{fontFamily:sans,fontSize:11,color:T.mid,margin:"0 0 12px"}}>{filtered.length} result{filtered.length!==1?"s":""} for "{search}"</p>}
      {filtered.length===0
        ? <div style={{textAlign:"center",padding:"48px 0",color:T.faint}}><p style={{fontSize:28,marginBottom:8}}>○</p><p style={{fontSize:13,marginBottom:16}}>Nothing found</p></div>
        : view==="list"
          ? <div className="mos-grid">{filtered.map(f=><FragCard key={f.id} frag={f} onClick={onOpenFrag} userStatus={userStatuses[f.id]} reaction={reactions[f.id]} onReaction={v=>onReaction(f.id,v)} onOpenFrag={onOpenFrag}/>)}</div>
          : view==="shelf"
            ? <ShelfView items={filtered} onClick={onOpenFrag} statuses={userStatuses}/>
            : <div className="mos-tiles">{filtered.map(f=><GridTile key={f.id} frag={f} onClick={onOpenFrag} userStatus={userStatuses[f.id]} reaction={reactions[f.id]}/>)}</div>}
      </>}
      <div style={{marginTop:20}}><button onClick={onSuggest} style={{width:"100%",padding:"13px 0",borderRadius:12,border:`1px solid ${T.rule}`,background:T.white,color:T.mid,fontSize:12,fontFamily:sans,cursor:"pointer"}}>+ Missing a fragrance? Suggest it</button></div>
    </div>
  );
}

// ─── JOURNAL ──────────────────────────────────────────────────────────────────
function JournalTab({ entries, userStatuses, reactions, fragrances, wears, onOpenFrag, onSearch, onAddJournalEntry }) {
  const [jtab, setJtab] = useState(() => { try { return sessionStorage.getItem("mos-journal-tab") === "overview" ? "overview" : "write"; } catch (e) { return "write"; } });
  const pickTab = t => { setJtab(t); try { sessionStorage.setItem("mos-journal-tab", t); } catch (e) {} };
  const [wFrag, setWFrag] = useState(null);
  const FR = (fragrances && fragrances.length) ? fragrances : FRAGRANCES;
  const all = [...(entries||[])];

  // Derive taste evolution from families
  const families = all.map(e=>e.family).filter(Boolean);
  const familyCount = families.reduce((acc,f)=>{acc[f]=(acc[f]||0)+1;return acc;},{});
  const topFamilies = Object.entries(familyCount).sort((a,b)=>b[1]-a[1]);
  const dominant = topFamilies[0]?.[0] || "";
  const previous = topFamilies.length > 1 ? topFamilies[topFamilies.length-1]?.[0] : "";

  const MONTHLY_PROMPT = "Has anything surprised you about what you've been reaching for lately?";

  return (
    <div>
      <div className="mos-pagehead">
        <p style={{fontFamily:sans,fontSize:9,textTransform:"uppercase",letterSpacing:"0.18em",color:T.mid,margin:"0 0 4px"}}>Personal record</p>
        <h2 style={{fontFamily:serif,fontSize:"clamp(32px, 3.2vw, 50px)",color:T.black,letterSpacing:-0.8,margin:0,fontWeight:400}}>Scent Journal</h2>
        <p style={{fontFamily:sans,fontSize:"clamp(13px, 1.1vw, 17px)",color:T.mid,margin:"6px 0 0"}}>What you reach for, and why. A record that becomes a mirror.</p>
      </div>

      <div role="tablist" style={{display:"flex",gap:28,borderBottom:`1px solid ${T.rule}`,marginBottom:22,overflowX:"auto"}}>
        {[["write","Write an entry"],["overview","Your taste profile"]].map(([k,l])=>(
          <button key={k} role="tab" aria-selected={jtab===k} onClick={()=>pickTab(k)} style={{padding:"12px 0",whiteSpace:"nowrap",fontFamily:sans,fontSize:"clamp(15px, 1.2vw, 17px)",fontWeight:jtab===k?600:400,color:jtab===k?T.black:T.mid,background:"none",border:"none",borderBottom:jtab===k?`2px solid ${T.black}`:"2px solid transparent",marginBottom:-1,cursor:"pointer"}}>{l}</button>
        ))}
      </div>

      {jtab==="write"&&<div>
        <div style={{marginBottom:20}}>
          <JournalComposer frag={wFrag} entries={entries} onAddJournalEntry={onAddJournalEntry} picker={<><Lbl>Which fragrance is this entry about?</Lbl><FragPicker key="jw" value="" onPick={(t,f)=>setWFrag(f||null)} onSearch={onSearch} placeholder="Search for a fragrance"/></>}/>
        </div>

      <div style={{background:T.white,border:`1px solid ${T.rule}`,borderRadius:12,padding:"13px 16px",marginBottom:22}}>
        <p style={{fontFamily:sans,fontSize:9,textTransform:"uppercase",letterSpacing:"0.1em",color:T.faint,margin:"0 0 4px"}}>This month</p>
        <p style={{fontFamily:serif,fontSize:14,color:T.mid,fontStyle:"italic",margin:0,lineHeight:1.6}}>{MONTHLY_PROMPT}</p>
      </div>

      <Lbl mb={14}>Your entries ({all.length})</Lbl>
      <div style={{position:"relative"}}>
        <div style={{position:"absolute",left:9,top:10,bottom:24,width:1,background:T.rule}}/>
        {all.map((e,i)=>(
          <div key={e.id} style={{display:"flex",gap:16,paddingBottom:24,position:"relative"}}>
            <div style={{width:19,height:19,borderRadius:"50%",flexShrink:0,zIndex:1,marginTop:2,background:i===0?T.black:T.white,border:`1px solid ${i===0?T.black:T.rule}`,display:"flex",alignItems:"center",justifyContent:"center"}}>
              {i===0&&<div style={{width:5,height:5,borderRadius:"50%",background:T.white}}/>}
            </div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{display:"flex",alignItems:"baseline",justifyContent:"space-between",gap:8,marginBottom:2}}>
                <span style={{fontFamily:serif,fontSize:14,color:T.black}}>{e.fragName}</span>
                <span style={{fontFamily:sans,fontSize:10,color:T.faint,flexShrink:0}}>{e.date}</span>
              </div>
              <p style={{fontFamily:sans,fontSize:11,color:T.faint,margin:"0 0 6px"}}>{e.house}{e.family?` · ${e.family}`:""}</p>
              {e.prompt&&<p style={{fontFamily:sans,fontSize:12,color:T.mid,margin:"0 0 5px",lineHeight:1.55}}><span style={{color:T.faint}}>↳ </span>{e.prompt}</p>}
              <AnswerChips answers={e.answers}/>
              {e.text&&<p style={{fontFamily:sans,fontSize:13,color:T.ink,lineHeight:1.7,margin:"0 0 6px"}}>{e.text}</p>}
              <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
                {e.where&&<div style={{display:"flex",alignItems:"center",gap:4}}><Icon name="pin" size={10} color={T.faint}/><span style={{fontFamily:sans,fontSize:10,color:T.faint}}>{e.where}</span></div>}
                {e.publishedAsReview&&<div style={{display:"flex",alignItems:"center",gap:4}}><span style={{fontFamily:sans,fontSize:9,color:T.mid,background:T.lift,padding:"1px 7px",borderRadius:10,border:`1px solid ${T.rule}`}}>Published as review {e.reviewRating?`· ${"★".repeat(e.reviewRating)}`:""}</span></div>}
                {e.shared&&<div style={{display:"flex",alignItems:"center",gap:4}}><Icon name="globe" size={10} color={T.faint}/><span style={{fontFamily:sans,fontSize:10,color:T.faint}}>Shared</span></div>}
              </div>
            </div>
          </div>
        ))}
      </div>
      {all.length===0&&(
        <p style={{fontFamily:sans,fontSize:11,color:T.faint,textAlign:"center",marginTop:4,lineHeight:1.6}}>Nothing here yet. Wear something today and write down how it feels. Open any fragrance, choose its Journal tab and answer one prompt.</p>
      )}
      </div>}

      {jtab==="overview"&&<div>
      <JournalInsights entries={all} userStatuses={userStatuses||{}} reactions={reactions||{}} fragrances={FR} wears={wears} onOpenFrag={onOpenFrag}/>
      {/* Collection map hidden for now (CollectionMap component kept) */}

      {dominant && previous && <div style={{background:T.lift,border:`1px solid ${T.rule}`,borderRadius:16,padding:18,marginBottom:16}}>
        <Lbl>Taste this year</Lbl>
        <p style={{fontFamily:sans,fontSize:13,color:T.mid,lineHeight:1.7,margin:"0 0 14px"}}>Your sampling is moving from <span style={{color:T.black,fontWeight:500}}>{previous}</span> toward <span style={{color:T.black,fontWeight:500}}>{dominant}</span>.</p>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{flex:1,textAlign:"center",padding:"8px 0",borderRadius:8,background:T.white,border:`1px solid ${T.rule}`}}><p style={{fontFamily:sans,fontSize:11,color:T.mid,margin:0}}>{previous}</p></div>
          <span style={{color:T.faint,fontSize:12}}>→</span>
          <div style={{flex:1,textAlign:"center",padding:"8px 0",borderRadius:8,background:T.black}}><p style={{fontFamily:sans,fontSize:11,color:T.white,margin:0}}>{dominant}</p></div>
        </div>
      </div>}
      </div>}
    </div>
  );
}

// ─── LAYERING — with open/closed lock SVG for public/private ─────────────────
function FragPicker({ value, onPick, onSearch, placeholder }) {
  const [q, setQ] = useState(value || "");
  const [res, setRes] = useState([]);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const picked = useRef(!!value);
  useEffect(() => {
    if (picked.current) return;
    const t = q.trim();
    if (t.length < 2 || !onSearch) { setRes([]); return; }
    let off = false; setBusy(true);
    const h = setTimeout(async () => {
      try { const r = await onSearch(t, "all", 0); if (!off) { setRes((r.items || []).slice(0, 8)); setOpen(true); } } catch (e) { if (!off) setRes([]); }
      if (!off) setBusy(false);
    }, 250);
    return () => { off = true; clearTimeout(h); };
  }, [q]);
  return (
    <div style={{ position:"relative" }}>
      <input value={q} onChange={e => { picked.current = false; setQ(e.target.value); onPick(""); setOpen(true); }} onFocus={() => res.length && setOpen(true)} placeholder={placeholder || "Type a name or house…"} autoComplete="off" style={{ ...FIELD, borderColor:value ? "var(--accent)" : T.rule }}/>
      {value && <span aria-hidden="true" style={{ position:"absolute", right:14, top:"50%", transform:"translateY(-50%)", color:"var(--accent)", fontSize:18 }}>✓</span>}
      {open && !value && q.trim().length >= 2 && (
        <div style={{ position:"absolute", left:0, right:0, top:"calc(100% + 6px)", zIndex:20, background:T.white, border:`1px solid ${T.rule}`, borderRadius:14, boxShadow:"0 12px 28px rgba(0,0,0,0.4)", maxHeight:300, overflowY:"auto" }}>
          {res.length === 0 && <p style={{ fontFamily:sans, fontSize:14, color:T.faint, margin:0, padding:"14px 16px" }}>{busy ? "Searching…" : "No match. Keep typing."}</p>}
          {res.map(f => (
            <button key={f.id} onClick={() => { picked.current = true; setQ(f.name + " · " + f.house); setOpen(false); onPick(f.name + " · " + f.house, f); }}
              style={{ display:"flex", alignItems:"center", gap:12, width:"100%", textAlign:"left", background:"none", border:"none", borderBottom:`1px solid ${T.lift}`, padding:"10px 14px", cursor:"pointer", fontFamily:sans }}>
              <Thumb frag={f} w={34}/>
              <span style={{ minWidth:0 }}>
                <span style={{ display:"block", fontFamily:serif, fontSize:16, color:T.black }}>{f.name}</span>
                <span style={{ display:"block", fontSize:12, color:T.mid }}>{f.house}</span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
// ─── LAYERING PLANNER: combos from what a member already owns, plus shareable images ───
const LAYER_VIBE = { citrus:"bright", fresh:"crisp", green:"calm", aquatic:"airy", floral:"romantic", powdery:"soft", gourmand:"cozy", vanilla:"cozy", amber:"warm", spicy:"spicy", woody:"grounded", smoky:"bold", leather:"bold", oud:"deep", musky:"skin-close", fruity:"playful", tobacco:"moody", balsamic:"warm", earthy:"earthy", aromatic:"herbal", coconut:"sunny", tropical:"sunny", rose:"romantic", iris:"quiet" };
const LAYER_CONTRAST = [["citrus","woody"],["citrus","amber"],["citrus","floral"],["fresh","gourmand"],["fresh","musky"],["fruity","vanilla"],["fruity","woody"],["floral","woody"],["floral","gourmand"],["floral","musky"],["floral","leather"],["floral","amber"],["floral","spicy"],["smoky","gourmand"],["green","floral"],["aquatic","woody"],["powdery","woody"],["tobacco","gourmand"],["rose","oud"],["iris","woody"]];
const LAYER_HEAVY = new Set(["gourmand","amber","woody","smoky","leather","oud","tobacco","vanilla","balsamic","spicy","musky","earthy"]);
function layerTraits(f) {
  const acc = new Set(((f.accords || []).map(a => String(a && a.n ? a.n : a).toLowerCase())).flatMap(n => [n, n.split(/\s+/).pop()]));
  const notes = new Set(["top","mid","base"].flatMap(k => ((f.notes && f.notes[k]) || []).map(x => String(x && x.n ? x.n : x).toLowerCase().trim())).filter(Boolean));
  return { acc, notes };
}
function layerRng(str) { let h = 1779033703 ^ str.length; for (let i = 0; i < str.length; i++) { h = Math.imul(h ^ str.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); } return () => { h = Math.imul(h ^ (h >>> 16), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); h ^= h >>> 16; return (h >>> 0) / 4294967296; }; }
function scoreCombo(a, b) {
  const A = layerTraits(a), B = layerTraits(b);
  const shared = [...A.notes].filter(n => B.notes.has(n));
  let contrast = null;
  for (const [x, y] of LAYER_CONTRAST) { if (A.acc.has(x) && B.acc.has(y)) { contrast = { x, y, ofA: x, ofB: y }; break; } if (A.acc.has(y) && B.acc.has(x)) { contrast = { x: y, y: x, ofA: y, ofB: x }; break; } }
  if (!shared.length && !contrast) return null;
  let score = Math.min(shared.length, 3) * 1.2 + (contrast ? 2 : 0);
  if (shared.length >= 4 && !contrast) score *= 0.7;
  const heavy = t => [...t.acc].filter(x => LAYER_HEAVY.has(x)).length;
  const aFirst = heavy(A) >= heavy(B);
  const first = aFirst ? a : b, second = aFirst ? b : a;
  const vibes = [...new Set([...A.acc, ...B.acc].map(x => LAYER_VIBE[x]).filter(Boolean))].slice(0, 2);
  const nm = x => x.charAt(0).toUpperCase() + x.slice(1);
  let kind, why;
  if (shared.length && contrast) { kind = "Bridge"; why = `Both carry ${shared.slice(0, 2).join(" and ")}. ${a.name} brings ${contrast.ofA}, ${b.name} adds ${contrast.ofB}.`; }
  else if (contrast) { kind = "Contrast"; why = `${a.name}'s ${contrast.ofA} meets ${b.name}'s ${contrast.ofB}.`; }
  else { kind = "Deepen"; why = `Both share ${shared.slice(0, 3).join(", ")}, so the pairing stacks and deepens it.`; }
  return { a: first, b: second, kind, why, vibe: vibes.length ? vibes.map(nm).join(" · ") : "Your own blend", score, tip: `Spray ${first.name} first, then one spray of ${second.name} over it. Start light and adjust.` };
}
function planLayering(frags, seed, count = 7) {
  const list = frags.slice(0, 60), pairs = [];
  for (let i = 0; i < list.length; i++) for (let j = i + 1; j < list.length; j++) { const c = scoreCombo(list[i], list[j]); if (c) pairs.push(c); }
  const rnd = layerRng(seed);
  pairs.forEach(p => { p.k = p.score + rnd() * 1.6; });
  pairs.sort((x, y) => y.k - x.k);
  const out = [], used = {};
  for (const cap of [2, 3, 7]) {
    for (const p of pairs) {
      if (out.length >= count) break;
      if (out.includes(p)) continue;
      if ((used[p.a.id] || 0) >= cap || (used[p.b.id] || 0) >= cap) continue;
      out.push(p); used[p.a.id] = (used[p.a.id] || 0) + 1; used[p.b.id] = (used[p.b.id] || 0) + 1;
    }
  }
  return out;
}
const LAYER_DAYS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
function weekStart(offset) { const d = new Date(); d.setHours(12, 0, 0, 0); d.setDate(d.getDate() - ((d.getDay() + 6) % 7) + offset * 7); return d; }
function weekLabel(d) { const e = new Date(d); e.setDate(e.getDate() + 6); const m = x => x.toLocaleDateString("en-US", { month: "short" }); return d.getMonth() === e.getMonth() ? `${m(d)} ${d.getDate()} – ${e.getDate()}` : `${m(d)} ${d.getDate()} – ${m(e)} ${e.getDate()}`; }

async function drawLayeringImage(combos, title, subtitle) {
  try { await Promise.all([document.fonts.load(`40px ${serif}`), document.fonts.load(`italic 40px ${serif}`), document.fonts.load(`22px ${sans}`), document.fonts.load(`600 22px ${sans}`)]); } catch (e) {}
  const single = combos.length === 1, W = 1080, H = single ? 1350 : 300 + combos.length * 176 + 150;
  const c = document.createElement("canvas"); c.width = W; c.height = H; const x = c.getContext("2d");
  const INK = "#0E0B13", CARD = "#181320", LINE = "#2B2435", PINK = "#EC679C", PAPER = "#F5F0F6", MUTED = "#A79EB3";
  const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, "#15101D"); g.addColorStop(1, INK); x.fillStyle = g; x.fillRect(0, 0, W, H);
  const fit = (t, w) => { let s = String(t); if (x.measureText(s).width <= w) return s; while (s.length > 1 && x.measureText(s + "…").width > w) s = s.slice(0, -1); return s.trimEnd() + "…"; };
  const wrap = (t, w, maxLines) => { const words = String(t).split(" "), lines = []; let cur = ""; for (const wd of words) { const tr = cur ? cur + " " + wd : wd; if (x.measureText(tr).width > w && cur) { lines.push(cur); cur = wd; } else cur = tr; } if (cur) lines.push(cur); if (lines.length > maxLines) { lines.length = maxLines; lines[maxLines - 1] = fit(lines[maxLines - 1] + "…", w); } return lines; };
  const rr = (px, py, w, h, r) => { x.beginPath(); x.moveTo(px + r, py); x.arcTo(px + w, py, px + w, py + h, r); x.arcTo(px + w, py + h, px, py + h, r); x.arcTo(px, py + h, px, py, r); x.arcTo(px, py, px + w, py, r); x.closePath(); };
  x.textBaseline = "alphabetic";
  x.font = `500 52px ${serif}`; x.fillStyle = PAPER; x.fillText("memoir", 70, 110);
  const mw = x.measureText("memoir ").width; x.font = `italic 500 52px ${serif}`; x.fillStyle = PINK; x.fillText("on skin", 70 + mw, 110);
  x.font = `400 64px ${serif}`; x.fillStyle = PAPER; x.fillText(title, 70, 220);
  x.font = `500 26px ${sans}`; x.fillStyle = MUTED; x.fillText(subtitle.toUpperCase(), 70, 268);
  if (single) {
    const cb = combos[0];
    x.font = `600 24px ${sans}`; x.fillStyle = PINK; x.fillText(`${cb.kind.toUpperCase()}  ·  ${cb.vibe.toUpperCase()}`, 70, 380);
    x.font = `400 72px ${serif}`; x.fillStyle = PAPER; let yy = 480;
    for (const l of wrap(cb.a.name, 940, 2)) { x.fillText(l, 70, yy); yy += 84; }
    x.font = `italic 400 52px ${serif}`; x.fillStyle = PINK; x.fillText("+", 70, yy + 6); yy += 96;
    x.font = `400 72px ${serif}`; x.fillStyle = PAPER;
    for (const l of wrap(cb.b.name, 940, 2)) { x.fillText(l, 70, yy); yy += 84; }
    x.font = `400 26px ${sans}`; x.fillStyle = MUTED; x.fillText(`${cb.a.house}  +  ${cb.b.house}`.slice(0, 70), 70, yy + 20); yy += 90;
    rr(70, yy, 940, 330, 28); x.fillStyle = CARD; x.fill(); x.strokeStyle = LINE; x.lineWidth = 2; x.stroke();
    x.font = `600 22px ${sans}`; x.fillStyle = PINK; x.fillText("WHY IT WORKS", 110, yy + 62);
    x.font = `400 30px ${sans}`; x.fillStyle = PAPER; wrap(cb.why, 860, 3).forEach((l, i) => x.fillText(l, 110, yy + 112 + i * 44));
    x.font = `600 22px ${sans}`; x.fillStyle = PINK; x.fillText("HOW TO WEAR", 110, yy + 262);
    x.font = `400 28px ${sans}`; x.fillStyle = MUTED; wrap(cb.tip, 860, 2).forEach((l, i) => x.fillText(l, 110, yy + 304 + i * 38));
  } else {
    combos.forEach((cb, i) => {
      const y = 310 + i * 176;
      rr(60, y, 960, 156, 26); x.fillStyle = CARD; x.fill(); x.strokeStyle = LINE; x.lineWidth = 2; x.stroke();
      x.font = `600 26px ${sans}`; x.fillStyle = PINK; x.fillText((LAYER_DAYS[i] || "").toUpperCase(), 92, y + 90);
      x.font = `400 32px ${serif}`; x.fillStyle = PAPER; x.fillText(fit(cb.a.name, 780), 220, y + 52);
      x.fillStyle = PINK; x.font = `italic 400 30px ${serif}`; x.fillText("+", 220, y + 94); x.fillStyle = PAPER; x.font = `400 32px ${serif}`; x.fillText(fit(cb.b.name, 750), 256, y + 96);
      x.font = `500 22px ${sans}`; x.fillStyle = MUTED; x.fillText(fit(`${cb.vibe}  ·  ${cb.kind}`, 780), 220, y + 134);
    });
  }
  x.font = `italic 400 30px ${serif}`; x.fillStyle = PAPER; x.fillText("Sample first. Remember always.", 70, H - 70);
  x.font = `500 24px ${sans}`; x.fillStyle = MUTED; const url = "memoironskin.com"; x.fillText(url, W - 70 - x.measureText(url).width, H - 70);
  return new Promise(res => c.toBlob(b => res(b), "image/png"));
}

function LayeringPlanner({ fragrances, statusSets, onSaveLayer }) {
  const [offset, setOffset] = useState(0);
  const [shuffle, setShuffle] = useState(0);
  const [saved, setSaved] = useState({});
  const [img, setImg] = useState(null); // {url, blob, name}
  const [busy, setBusy] = useState(false);
  const mine = useMemo(() => (fragrances || []).filter(f => { const st = (statusSets && statusSets[f.id]) || []; return st.includes("bottle_owned") || st.includes("sample_have") || st.includes("travel_have"); }), [fragrances, statusSets]);
  const start = weekStart(offset), label = weekLabel(start);
  const key = start.toISOString().slice(0, 10);
  const plan = useMemo(() => mine.length >= 2 ? planLayering(mine, key + ":" + shuffle) : [], [mine, key, shuffle]);
  useEffect(() => () => { if (img && img.url) URL.revokeObjectURL(img.url); }, [img]);
  async function makeImage(combos, title, sub, name) {
    setBusy(true);
    try { const blob = await drawLayeringImage(combos, title, sub); if (blob) setImg({ blob, url: URL.createObjectURL(blob), name }); } catch (e) {}
    setBusy(false);
  }
  async function share() {
    if (!img) return;
    try { const file = new File([img.blob], img.name, { type: "image/png" }); if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], text: "Made with Memoir on Skin" }); return; } } catch (e) { return; }
    const a = document.createElement("a"); a.href = img.url; a.download = img.name; a.click();
  }
  const card = { background:T.lift, border:`1px solid ${T.rule}`, borderRadius:14, padding:18, marginBottom:16 };
  const small = { fontFamily:sans, fontSize:12, minHeight:36, padding:"0 14px", borderRadius:18, border:`1px solid ${T.rule}`, background:T.white, color:T.ink, cursor:"pointer" };
  return (
    <div style={card}>
      <p style={{ ...FLABEL, margin:"0 0 6px" }}>From your collection</p>
      <h3 style={{ fontFamily:serif, fontSize:22, fontWeight:400, color:T.black, margin:"0 0 6px" }}>Your layering week</h3>
      <p style={{ fontFamily:sans, fontSize:13, color:T.mid, lineHeight:1.6, margin:"0 0 14px" }}>Combinations built only from fragrances you own or have samples of. Worked out on your device, nothing is sent anywhere.</p>
      {mine.length < 2 ? (
        <p style={{ fontFamily:sans, fontSize:13, color:T.mid, lineHeight:1.6, margin:0 }}>Mark at least two fragrances as <b>Bottle: Own</b> or <b>Sample: Own</b> in your Collection and we'll suggest your week.</p>
      ) : (
        <>
          <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:14 }}>
            {[[0, "This week"], [1, "Next week"]].map(([o, l]) => <button key={o} aria-pressed={offset === o} onClick={() => { setOffset(o); setShuffle(0); }} style={{ ...small, background:offset === o ? "var(--accent)" : T.white, color:offset === o ? "#fff" : T.ink, border:offset === o ? "1px solid transparent" : small.border }}>{l}</button>)}
            <button onClick={() => setShuffle(s => s + 1)} style={small}>Shuffle</button>
            <span style={{ fontFamily:sans, fontSize:12, color:T.faint, alignSelf:"center" }}>{label}</span>
          </div>
          {plan.length === 0 ? (
            <p style={{ fontFamily:sans, fontSize:13, color:T.mid, lineHeight:1.6, margin:0 }}>We couldn't find a pairing that shares notes or contrasts well yet. Add another fragrance or sample and try again.</p>
          ) : (
            <>
              {plan.map((p, i) => (
                <div key={p.a.id + "-" + p.b.id} style={{ background:T.white, border:`1px solid ${T.rule}`, borderRadius:12, padding:"12px 14px", marginBottom:8 }}>
                  <div style={{ display:"flex", gap:10, alignItems:"baseline" }}>
                    <span style={{ fontFamily:sans, fontSize:11, letterSpacing:"0.14em", color:"var(--accent)", fontWeight:600, minWidth:30 }}>{LAYER_DAYS[i].toUpperCase()}</span>
                    <p style={{ fontFamily:serif, fontSize:16, color:T.ink, margin:0, lineHeight:1.35 }}>{p.a.name} <span style={{ color:"var(--accent)", fontStyle:"italic" }}>+</span> {p.b.name}</p>
                  </div>
                  <p style={{ fontFamily:sans, fontSize:11, letterSpacing:"0.08em", textTransform:"uppercase", color:T.mid, margin:"6px 0 4px 40px" }}>{p.vibe} · {p.kind}</p>
                  <p style={{ fontFamily:sans, fontSize:12.5, color:T.mid, lineHeight:1.55, margin:"0 0 8px 40px" }}>{p.why} {p.tip}</p>
                  <div style={{ display:"flex", gap:8, marginLeft:40 }}>
                    <button disabled={busy} onClick={() => makeImage([p], p.a.name.length + p.b.name.length > 40 ? "Layering combo" : "Layering combo", p.vibe, "memoir-layering-combo.png")} style={small}>Image</button>
                    <button disabled={!!saved[p.a.id + p.b.id]} onClick={() => { onSaveLayer({ name:`${p.a.name} + ${p.b.name}`, frags:[p.a.name, p.b.name], ratio:"", note:`${p.why} ${p.tip}`, layerWith:"fragrance", isPublic:false, date:new Date().toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric" }), rating:4 }); setSaved(s => ({ ...s, [p.a.id + p.b.id]:true })); }} style={small}>{saved[p.a.id + p.b.id] ? "Saved" : "Save to my combos"}</button>
                  </div>
                </div>
              ))}
              {plan.length < 7 && <p style={{ fontFamily:sans, fontSize:12, color:T.faint, margin:"4px 0 10px" }}>Only {plan.length} good pairings so far. Add more fragrances or samples for a full week.</p>}
              <button disabled={busy} onClick={() => makeImage(plan, "Layering week", label, "memoir-layering-week.png")} style={{ ...ctaBtn(!busy), marginTop:6 }}>{busy ? "Making your image…" : "Make my week image"}</button>
            </>
          )}
        </>
      )}
      {img && (
        <div role="dialog" aria-modal="true" onClick={() => setImg(null)} style={{ position:"fixed", inset:0, zIndex:1000, background:"rgba(10,8,14,0.82)", display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
          <div onClick={e => e.stopPropagation()} style={{ background:T.white, borderRadius:18, padding:16, maxWidth:440, width:"100%", maxHeight:"92vh", overflowY:"auto" }}>
            <img src={img.url} alt="Your layering image" style={{ width:"100%", borderRadius:12, display:"block", marginBottom:12 }}/>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={share} style={{ ...ctaBtn(true), flex:1 }}>{typeof navigator !== "undefined" && navigator.canShare ? "Share or save" : "Save image"}</button>
              <button onClick={() => setImg(null)} style={ghostBtn}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function LayeringTab({ layers, onSaveLayer, onSearch, fragrances, statusSets }) {
  const [open,setOpen]=useState(true); // the form is always showing; toggling `open` just resets the pickers
  const [name,setName]=useState("");const [f1,setF1]=useState("");const [f2,setF2]=useState("");
  const [note,setNote]=useState("");const [brand2,setBrand2]=useState("");const [prod2,setProd2]=useState("");
  const [layerWith,setLayerWith]=useState("fragrance");const [isPublic,setIsPublic]=useState(false);
  const inp={...FIELD};
  const second = layerWith==="fragrance" ? f2 : [brand2.trim(), prod2.trim()].filter(Boolean).join(" ");
  const ready = !!(f1 && name.trim() && (layerWith==="fragrance" ? f2 : brand2.trim() && prod2.trim()));

  const BASE_LAYERS=[
    {id:"unscented_lotion",name:"Unscented Lotion",type:"lotion",iconName:"lotion"},
    {id:"body_oil",name:"Body Oil",type:"oil",iconName:"droplet"},
    {id:"scented_lotion",name:"Scented Lotion",type:"lotion",iconName:"lotion"},
  ];

  // Open lock SVG — public
  const OpenLockSVG = ({ size=14, color=T.mid }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
      
      <path d="M7 11V7a5 5 0 0110 0"/>
    </svg>
  );

  // Closed lock SVG — private
  const ClosedLockSVG = ({ size=14, color=T.mid }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
      <path d="M7 11V7a5 5 0 0110 0v4"/>
    </svg>
  );

  return (
    <div>
      <div className="mos-pagehead">
        <h2 style={{fontFamily:serif,fontSize:"clamp(32px, 3.2vw, 50px)",color:T.black,letterSpacing:-0.8,margin:0,fontWeight:400}}>Layering</h2>
        <p style={{fontFamily:sans,fontSize:"clamp(13px, 1.1vw, 17px)",color:T.mid,margin:"6px 0 0"}}>Track what works together, and why.</p>
      </div>
      <LayeringPlanner fragrances={fragrances} statusSets={statusSets} onSaveLayer={onSaveLayer}/>
      {(
        <div style={{background:T.lift,border:`1px solid ${T.rule}`,borderRadius:14,padding:18,marginBottom:16}}>
          <Lbl>Name</Lbl>
          <input value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Rainy Sunday" style={{...inp,marginBottom:16}}/>
          <Lbl>Layer with</Lbl>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:16}}>
            {[{key:"fragrance",label:"Fragrance",iconName:"spray"},{key:"lotion",label:"Lotion",iconName:"lotion"},{key:"oil",label:"Body Oil",iconName:"droplet"}].map(lt=>(
              <button key={lt.key} onClick={()=>setLayerWith(lt.key)} aria-pressed={layerWith===lt.key} style={{...selBtn(layerWith===lt.key),flexDirection:"column",gap:4,fontSize:13,minHeight:64}}>
                <Icon name={lt.iconName} size={18} color={layerWith===lt.key?"#fff":T.mid}/><span>{lt.label}</span>
              </button>
            ))}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr",gap:12,marginBottom:16}}>
            <div><Lbl>{layerWith==="fragrance"?"First fragrance":"Fragrance"}</Lbl><FragPicker key={"a"+open} value={f1} onPick={setF1} onSearch={onSearch}/></div>
            {layerWith==="fragrance" ? (
              <div><Lbl>Second fragrance</Lbl><FragPicker key={"b"+open} value={f2} onPick={setF2} onSearch={onSearch}/></div>
            ) : (
              <div style={{display:"grid",gridTemplateColumns:"1fr",gap:12}}>
                <div><Lbl>{layerWith==="lotion"?"Lotion brand":"Body oil brand"}</Lbl><input value={brand2} onChange={e=>setBrand2(e.target.value)} placeholder="e.g. Vaseline" style={inp}/></div>
                <div><Lbl>{layerWith==="lotion"?"Lotion name":"Body oil name"}</Lbl><input value={prod2} onChange={e=>setProd2(e.target.value)} placeholder={layerWith==="lotion"?"e.g. Cocoa Radiant":"e.g. Dry Oil"} style={inp}/></div>
              </div>
            )}
          </div>
          <div style={{marginBottom:16}}><Lbl>Notes</Lbl><textarea value={note} onChange={e=>setNote(e.target.value)} placeholder="How to apply, what it smells like…" rows={3} style={{...inp,resize:"vertical",lineHeight:1.6,padding:"12px 14px"}}/></div>

          
          <Lbl>Who can see it</Lbl>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:18}}>
            <button onClick={()=>setIsPublic(false)} aria-pressed={!isPublic} style={selBtn(!isPublic)}><ClosedLockSVG size={16} color={!isPublic?"#fff":T.mid}/>Private</button>
            <button onClick={()=>setIsPublic(true)} aria-pressed={isPublic} style={selBtn(isPublic)}><OpenLockSVG size={16} color={isPublic?"#fff":T.mid}/>Public</button>
          </div>

          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>{if(ready){onSaveLayer({name,frags:[f1,second],ratio:"",note,layerWith,isPublic,date:new Date().toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}),rating:4});setOpen(o=>!o);setName("");setF1("");setF2("");setBrand2("");setProd2("");setNote("");}}} style={{...ctaBtn(ready),flex:1,width:"auto"}}>Save combination</button>
          </div>
        </div>
      )}

      {layers.length===0&&<p style={{fontFamily:sans,fontSize:13,color:T.mid,lineHeight:1.6,margin:"4px 0 16px"}}>No combinations logged yet. Fill in the form above to log your first one.</p>}
      {layers.map(l=>(
        <div key={l.id} style={{background:T.white,border:`1px solid ${T.rule}`,borderRadius:14,padding:16,marginBottom:10}}>
          <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:10}}>
            <div><p style={{fontFamily:serif,fontSize:16,color:T.ink,margin:0}}>{l.name}</p><p style={{fontFamily:sans,fontSize:11,color:T.mid,margin:"3px 0 0"}}>{l.date}</p></div>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              
              <span style={{fontFamily:sans,fontSize:9,padding:"2px 8px 2px 6px",borderRadius:10,background:l.isPublic?T.lift:T.press,color:T.mid,border:`1px solid ${T.rule}`,display:"flex",alignItems:"center",gap:4}}>
                {l.isPublic
                  ? <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={T.mid} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0"/></svg>
                  : <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={T.mid} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                }
                {l.isPublic?"Public":"Private"}
              </span>
              <div style={{display:"flex",gap:1}}>{[1,2,3,4,5].map(i=><span key={i} style={{fontSize:11,color:i<=l.rating?T.black:T.faint}}>★</span>)}</div>
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
            {l.frags.map((fragName,i)=>{
              const frag=FRAGRANCES.find(f=>f.name===fragName);
              return (
                <div key={fragName} style={{display:"flex",alignItems:"center",gap:8}}>
                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                    {frag ? (
                      <div style={{width:36,height:44,borderRadius:8,background:T.lift,border:`1px solid ${T.rule}`,display:"flex",alignItems:"center",justifyContent:"center"}}>
                        <span style={{fontFamily:serif,fontSize:10,color:T.ink,opacity:0.6}}>{frag.name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase()}</span>
                      </div>
                    ) : (
                      <div style={{width:36,height:44,borderRadius:8,background:T.lift,border:`1px solid ${T.rule}`,display:"flex",alignItems:"center",justifyContent:"center"}}>
                        <Icon name={l.layerWith==="lotion"?"lotion":l.layerWith==="oil"?"droplet":"spray"} size={16} color={T.mid}/>
                      </div>
                    )}
                    <span style={{fontFamily:sans,fontSize:11,fontWeight:500,padding:"4px 10px",borderRadius:20,background:i===0?T.black:T.lift,color:i===0?T.white:T.ink,border:`1px solid ${i===0?T.black:T.rule}`}}>{fragName}</span>
                  </div>
                  {i<l.frags.length-1&&<span style={{color:T.faint,fontSize:12}}>+</span>}
                </div>
              );
            })}
            {l.ratio&&<span style={{fontFamily:sans,fontSize:10,color:T.mid,marginLeft:"auto"}}>{l.ratio}</span>}
          </div>
          <p style={{fontFamily:sans,fontSize:12,color:T.mid,lineHeight:1.65,margin:0}}>{l.note}</p>
        </div>
      ))}
    </div>
  );
}

// ─── FRAGRANCE EXPOS DATA ─────────────────────────────────────────────────────
const FRAGRANCE_EXPOS = [
  // start/end (YYYY-MM-DD) make an event sortable; events without them sit under "Dates to be announced".
  { name:"The London Niche Show", city:"London", country:"United Kingdom", venue:"Marylebone (The Bomb Factory Art Gallery)", start:"2026-11-20", end:"2026-11-22", url:"https://www.niche.show/", description:"Niche and indie perfume houses showing to the public in London." },
  { name:"Polaris Olfactive Week", city:"Stockholm", country:"Sweden", venue:"Downtown Camper by Scandic", start:"2026-11-28", end:"2026-11-29", url:"https://polarisolfactive.com/", description:"Independent perfumers and niche houses, mostly from the Nordics and across Europe." },
  { name:"Notes Dubai", city:"Dubai", country:"United Arab Emirates", venue:"Dubai Mall Exhibition Center", start:"2027-01-21", end:"2027-01-23", url:"https://notes-dubai.ae.messefrankfurt.com/dubai/en.html", description:"A niche fragrance show for the Gulf, from the Beautyworld organisers." },
  { name:"Scent & Soul", city:"Helsinki", country:"Finland", venue:"Korjaamo", start:"2027-03-20", end:"2027-03-20", url:"https://scentandsoul.fi/", description:"A one-day Nordic fragrance event for people who love niche and indie perfume." },
  { name:"Enhala", city:"Bucharest", country:"Romania", venue:"The Marmorosch", start:"2027-03-26", end:"2027-03-28", url:"https://enhala.com/", description:"An artistic perfumery event in Bucharest." },
  { name:"Paris Perfume Week", city:"Paris", country:"France", venue:"Palais Brongniart", start:"2027-04-15", end:"2027-04-17", url:"https://www.perfume-week.com/paris-perfume-week/", description:"Niche and independent houses together in Paris." },
  { name:"Art Niche Expo", city:"Timișoara", country:"Romania", venue:"Congress Hall, Iulius Town", start:"2027-05-07", end:"2027-05-09", url:"https://artnicheexpo.com/event-details/", description:"A niche perfumery expo in western Romania." },
  { name:"Simppar", city:"Paris", country:"France", venue:"Espace Champeret", start:"2027-06-01", end:"2027-06-03", url:"https://www.simppar.fr/en/", description:"A trade show for perfumery raw materials and the people who make them." },
  { name:"Scent Fest SF", city:"San Francisco", country:"United States", venue:"San Francisco Cruise Terminal, Pier 27", start:"2027-06-04", end:"2027-06-06", url:"https://scentfestsf.com/", description:"A fragrance festival on the San Francisco waterfront." },
  { name:"Fragranze (Pitti)", city:"Florence", country:"Italy", venue:"Stazione Leopolda", start:"2027-09-10", end:"2027-09-12", url:"https://fragranze.pittimmagine.com/", description:"Artistic perfumery in Florence, from the Pitti Immagine team." },
  { name:"TFWA World Exhibition & Conference", city:"Cannes", country:"France", venue:"", start:"2027-10-03", end:"2027-10-07", url:"https://www.tfwa.com/tfwa-world-exhibition-conference-2026", description:"The global travel retail trade show. Fragrance is a large part of it. Trade only." },
  { name:"UAE Perfume Show", city:"Sharjah", country:"United Arab Emirates", venue:"Expo Centre Sharjah", start:"2027-10-08", end:"2027-10-17", url:"https://uaeperfumeshow.ae/en/", description:"A long-running perfume and oud show in the Emirates." },
  { name:"Beautyworld Middle East", city:"Dubai", country:"United Arab Emirates", venue:"Dubai Exhibition Centre, Expo City", start:"2027-10-19", end:"2027-10-21", url:"https://beautyworld-dubai.ae.messefrankfurt.com/dubai/en.html", description:"The region's largest beauty trade fair, with a big fragrance hall." },
  { name:"Toronto Scent Festival", city:"Toronto", country:"Canada", url:"https://www.instagram.com/torontoscentfestival/", description:"A fragrance festival in Toronto. Follow them for the next dates." },
  { name:"Fumed", city:"Check the website", country:"", url:"https://fumedexpo.com/", description:"A fragrance expo. Check the website for place and dates." },
  { name:"Notes Shanghai", city:"Shanghai", country:"China", note:"Held in spring and autumn", url:"https://notesshanghai.com/", description:"A niche and artistic fragrance show for the Chinese market." },
  { name:"Asia Perfume Show", city:"Paris", country:"France", note:"Last held 23 to 25 September 2026", url:"https://www.perfume-week.com/asia-perfume-show/", description:"Perfume brands from Asia, shown in Paris." },
  { name:"Grasse Perfume Week", city:"Grasse", country:"France", url:"https://www.perfume-week.com/grasse-perfume-week/", description:"Perfume week in the town where French perfumery began." },
  { name:"MxScent", city:"Latin America", country:"", url:"https://mxscentpartners.com/", description:"A perfumery event for Latin America." },
  { name:"Luxe Pack Monaco", city:"Monaco", country:"Monaco", note:"Last held 28 to 30 September 2026", url:"https://www.luxepackmonaco.com/", description:"Luxury packaging fair with a strong fragrance crowd." },
  { name:"Esxence", city:"Milan", country:"Italy", note:"Usually March", url:"https://esxence.com/", description:"The art perfumery fair, with hundreds of niche and indie houses." },
  { name:"World Perfumery Congress", city:"Rotating cities", country:"", note:"Every two years", description:"A gathering of perfumers, scientists and fragrance technologists." },
  { name:"Beautyworld Japan", city:"Tokyo", country:"Japan", note:"Usually May", description:"A beauty and fragrance trade expo in Tokyo." },
  { name:"Sniffapalooza", city:"New York", country:"United States", note:"Spring and fall", description:"Enthusiast-led fragrance outings to shops and boutiques." },
  { name:"ScentXplore", city:"New York", country:"United States", note:"Check the dates each year", description:"A niche fragrance event where you can meet the houses and smell what they make." },
  { name:"Fragrance Foundation Awards", city:"New York", country:"United States", note:"Usually June", description:"The industry's awards night." },
];

// ─── LEARN ────────────────────────────────────────────────────────────────────
// ─── INGREDIENT GUIDE ─────────────────────────────────────────────────────────
const INGREDIENTS = {
  ...MORE_INGREDIENTS,
  Vetiver: { latin:"Chrysopogon zizanioides", family:"Grasses (Poaceae)", native:"India", part:"Roots, dried", process:"Steam distillation, around 15 to 18 hours", found:"A large share of modern perfumes, from fresh to woody",
    blurb:"The oil comes from the roots alone. They are dried, then distilled slowly, which is why vetiver smells so earthy and dense.",
    origins:[{p:"Haiti",n:"The largest source. Earthy, smoky, a little roasted."},{p:"Indonesia (Java)",n:"Darker and smokier."},{p:"Réunion",n:"Rare today. Softer, rosier and prized."},{p:"India",n:"Where the plant comes from. Wild ‘khus’ is balsamic and sweeter."},{p:"Brazil",n:"A newer, smaller source."}],
    smelled:[{n:"Encre Noire",h:"Lalique",y:2006},{n:"Vétiver",h:"Guerlain",y:1959},{n:"Terre d’Hermès",h:"Hermès",y:2006},{n:"Sycomore",h:"Chanel",y:2008}] },
  Sandalwood: { latin:"Santalum album", family:"Sandalwood family (Santalaceae)", native:"Southern India", part:"Heartwood of mature trees", process:"Steam distillation of the heartwood", found:"Woody, creamy and amber perfumes",
    blurb:"The oil builds up in the heartwood and only develops as the tree matures, which takes decades. That is why true sandalwood is scarce and costly.",
    origins:[{p:"India (Mysore)",n:"The classic source, now tightly controlled."},{p:"Western Australia",n:"Plantation grown, a main supply today."},{p:"Indonesia",n:"Timor and neighbouring islands."}],
    smelled:[{n:"Santal 33",h:"Le Labo",y:2011},{n:"Samsara",h:"Guerlain",y:1989},{n:"Bois des Îles",h:"Chanel",y:1926}] },
  Patchouli: { latin:"Pogostemon cablin", family:"Mint (Lamiaceae)", native:"Tropical Asia", part:"Leaves, dried", process:"Steam distillation of dried leaves", found:"Chypres, amber and woody perfumes",
    blurb:"Leaves, not flowers. Patchouli oil deepens with age, and well-aged oil is darker and smoother.",
    origins:[{p:"Indonesia",n:"Sumatra, Java and Sulawesi supply most of the world’s oil."},{p:"India",n:"Grown and distilled in smaller volumes."},{p:"Madagascar",n:"A smaller source."}],
    smelled:[{n:"Angel",h:"Mugler",y:1992},{n:"Aromatics Elixir",h:"Clinique",y:1971},{n:"Coco Mademoiselle",h:"Chanel",y:2001}] },
  Oud: { latin:"Aquilaria species", family:"Thymelaeaceae", native:"Southeast Asia and northeast India", part:"Resin-soaked heartwood", process:"Slow distillation of the resinous wood", found:"Middle Eastern perfumery, now Western niche and designer too",
    blurb:"Oud is not the wood itself. It forms when a fungus infects the tree and the heartwood fills with dark resin. Wild trees are protected, so much oud now comes from plantations.",
    origins:[{p:"India (Assam)",n:"A traditional source of fine oud."},{p:"Cambodia and Vietnam",n:"Rare and highly prized."},{p:"Indonesia and Malaysia",n:"Large producers, wild and cultivated."}],
    smelled:[{n:"Oud Wood",h:"Tom Ford",y:2007},{n:"Oud Ispahan",h:"Dior",y:2012}] },
  Rose: { latin:"Rosa damascena, Rosa × centifolia", family:"Rose (Rosaceae)", native:"Western and Central Asia", part:"Petals", process:"Steam distillation for rose otto, solvent extraction for absolute", found:"Florals, chypres and amber perfumes",
    blurb:"Thousands of petals go into a single kilogram of oil, so real rose is among the costliest materials in perfumery.",
    origins:[{p:"Bulgaria",n:"The Valley of the Roses, known for rose otto."},{p:"Turkey",n:"Isparta, a major source of oil and absolute."},{p:"Grasse, France",n:"Rose de mai (centifolia), picked in May."},{p:"Morocco",n:"Damask and centifolia roses from the Dades valley."}],
    smelled:[{n:"No. 5",h:"Chanel",y:1921},{n:"Portrait of a Lady",h:"Frédéric Malle",y:2010},{n:"Rose 31",h:"Le Labo",y:2006}] },
  Jasmine: { latin:"Jasminum grandiflorum, J. sambac", family:"Olive (Oleaceae)", native:"South and Southeast Asia", part:"Flowers, picked by hand", process:"Solvent extraction into an absolute", found:"White florals, chypres and classic floral perfumes",
    blurb:"The flowers are too delicate for distillation. They are picked by hand, usually before sunrise when the scent is strongest, and processed quickly.",
    origins:[{p:"India",n:"A large producer, including sambac."},{p:"Egypt",n:"A major source of grandiflorum absolute."},{p:"Grasse, France",n:"The historic home of jasmine, now in small volumes."}],
    smelled:[{n:"Joy",h:"Jean Patou",y:1930},{n:"No. 5",h:"Chanel",y:1921},{n:"A la Nuit",h:"Serge Lutens",y:2000}] },
  Bergamot: { latin:"Citrus bergamia", family:"Citrus (Rutaceae)", native:"Uncertain, likely a hybrid of Asian origin", part:"Peel of the fruit", process:"Cold pressing of the rind", found:"Colognes and the opening of countless perfumes",
    blurb:"A small citrus with a floral, faintly bitter peel. The oil is pressed from the rind, not distilled, which keeps its freshness.",
    origins:[{p:"Calabria, Italy",n:"Most perfumery bergamot grows along this coast."},{p:"Ivory Coast",n:"A smaller, newer source."}],
    smelled:[{n:"Colonia",h:"Acqua di Parma",y:1916},{n:"Eau Sauvage",h:"Dior",y:1966},{n:"Aventus",h:"Creed",y:2010}] },
  Vanilla: { latin:"Vanilla planifolia", family:"Orchid (Orchidaceae)", native:"Mexico", part:"Seed pods, cured", process:"Pods are picked green, then cured for weeks before extraction", found:"Gourmands and amber accords",
    blurb:"Outside Mexico every flower is pollinated by hand, and the pods take months to ripen and weeks to cure. Real vanilla is slow work.",
    origins:[{p:"Madagascar",n:"The largest source. Rich, creamy and sweet."},{p:"Mexico",n:"Where vanilla began."},{p:"Tahiti",n:"A separate species, more floral and fruity."}],
    smelled:[{n:"Shalimar",h:"Guerlain",y:1925},{n:"Tobacco Vanille",h:"Tom Ford",y:2007}] },
};
// Finds the guide for a note name, following the same aliases the note photos use (neroli opens orange blossom, musk opens the musk guide).
function guideKey(name) {
  if (!name) return null;
  if (INGREDIENTS[name]) return name;
  const capK = k => String(k).replace(/(^|[\s-])([a-z])/g, (m, p, c) => p + c.toUpperCase());
  const direct = capK(String(name).trim().toLowerCase().replace(/\s+/g, " "));
  if (INGREDIENTS[direct]) return direct;
  const img = noteImageKey(name);
  if (img) { const k = capK(img.replace(/-/g, " ")); if (INGREDIENTS[k]) return k; }
  return null;
}
function IngredientGuide({ name, onBack, fragrances, onOpenFrag, backLabel = "Back to Learn" }) {
  const gk = guideKey(name);
  const g = gk && INGREDIENTS[gk];
  if (!g) return null;
  const title = g.title || gk;
  const words = [...new Set([g.match || gk.toLowerCase(), String(name).toLowerCase()].map(w => w.replace(/[^a-z| ]/g, "")).filter(Boolean))].join("|");
  const noteRe = new RegExp("(^|[^a-z])(?:" + words + ")([^a-z]|$)");
  const lib = (fragrances || []).filter(f => f.notes && allNoteList(f.notes).some(n => noteRe.test(String(n.n).toLowerCase()))).slice(0, 12);
  const eyebrow = (num, text) => (
    <p style={{ fontFamily:sans, fontSize:11, letterSpacing:"0.2em", textTransform:"uppercase", color:T.mid, margin:"0 0 14px" }}><span style={{ color:T.accent, fontWeight:600 }}>{num}</span>&nbsp;&nbsp;{text}</p>
  );
  const fact = (label, value, wide) => (
    <div key={label} style={{ gridColumn:wide?"1 / -1":"auto", background:T.white, border:`1px solid ${T.rule}`, borderRadius:12, padding:"14px 16px" }}>
      <p style={{ fontFamily:sans, fontSize:11, letterSpacing:"0.16em", textTransform:"uppercase", color:T.mid, margin:"0 0 5px" }}>{label}</p>
      <p style={{ fontFamily:serif, fontSize:"clamp(17px, 1.4vw, 20px)", color:T.black, margin:0, lineHeight:1.3 }}>{value}</p>
    </div>
  );
  const card = { background:T.white, border:`1px solid ${T.rule}`, borderRadius:12, padding:"14px 16px" };
  const cardTitle = { fontFamily:serif, fontSize:"clamp(18px, 1.5vw, 21px)", color:T.black, margin:0, lineHeight:1.25 };
  const cardSub = { fontFamily:sans, fontSize:13, color:T.mid, margin:"4px 0 0", lineHeight:1.5 };
  return (
    <div>
      <BackBtn onBack={onBack} label={backLabel}/>
      {/* Hero: text on the left, picture on the right, like the fragrance page */}
      <div style={{ display:"flex", gap:"clamp(16px, 3vw, 40px)", alignItems:"flex-start", marginBottom:30 }}>
        <div style={{ flex:1, minWidth:0 }}>
          {eyebrow("01", "The plant")}
          <h3 style={{ fontFamily:serif, fontSize:"clamp(28px, 5vw, 64px)", letterSpacing:"0.02em", textTransform:"uppercase", fontWeight:500, color:T.black, margin:"0 0 6px", lineHeight:1.05, overflowWrap:"anywhere" }}>{title}</h3>
          <p style={{ fontFamily:serif, fontStyle:"italic", fontSize:"clamp(15px, 1.4vw, 20px)", color:T.mid, margin:"0 0 18px" }}>{g.latin}</p>
          <p style={{ fontFamily:sans, fontSize:"clamp(14px, 1.2vw, 17px)", color:T.ink, lineHeight:1.7, margin:0, maxWidth:560 }}>{g.blurb}</p>
        </div>
        <div style={{ flex:"none", "--cover-w":"clamp(120px, 26vw, 340px)" }}><NoteIllustration name={name} tile noLabel/></div>
      </div>
      {/* At a glance */}
      <div style={{ marginBottom:34 }}>
        {eyebrow("02", "At a glance")}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(min(100%, 150px), 1fr))", gap:10 }}>
          {fact("Family", g.family)}{fact("Native to", g.native)}{fact("Part used", g.part)}{fact("Process", g.process)}
          {fact("Found in", g.found, true)}
        </div>
      </div>
      {/* Origins */}
      <div style={{ marginBottom:34 }}>
        {eyebrow("03", "Where it comes from")}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(min(100%, 260px), 1fr))", gap:10 }}>
          {g.origins.map(o => (
            <div key={o.p} style={card}>
              <p style={cardTitle}>{o.p}</p>
              <p style={cardSub}>{o.n}</p>
            </div>
          ))}
        </div>
      </div>
      {/* Only fragrances that are in the library */}
      {Array.isArray(fragrances) && <div>
        {eyebrow("04", "Where have I smelled this?")}
        {lib.length > 0
          ? <div className="mos-shelf" style={{ display:"flex", alignItems:"flex-start", gap:14, overflowX:"auto", paddingBottom:10, scrollSnapType:"x proximity", WebkitOverflowScrolling:"touch" }}>
              {lib.map(f => <CoverTile key={f.id} frag={f} onClick={id => onOpenFrag && onOpenFrag(id)}/>)}
            </div>
          : <p style={{ fontFamily:sans, fontSize:14, color:T.mid, margin:0, lineHeight:1.6 }}>No fragrances in the library list {title.toLowerCase()} yet. As we add more, they will appear here.</p>}
      </div>}
      <p style={{ fontFamily:sans, fontSize:11, color:T.faint, margin:"30px 0 0", lineHeight:1.6 }}>General reference. Sourcing and quality vary by producer and by year.</p>
    </div>
  );
}

// ─── FRAGRANCE STORES DIRECTORY ──────────────────────────────────────────────
function StoreFinder({ onBack, onOpenBrand }) {
  const [rows, setRows] = useState(null);
  const [failed, setFailed] = useState(false);
  const [country, setCountry] = useState("All");
  const [cat, setCat] = useState("all");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState({});
  useEffect(() => {
    let off = false;
    (async () => {
      try {
        const { data, error } = await supabase.from("stores")
          .select("id, continent, country, region, city, name, house, category, address, website, notes, needs_check")
          .order("country").order("city").order("name").limit(3000);
        if (off) return;
        if (error) { setFailed(true); setRows([]); return; }
        setRows(data || []);
      } catch (e) { if (!off) { setFailed(true); setRows([]); } }
    })();
    return () => { off = true; };
  }, []);
  const all = rows || [];
  const countryList = ["All", ...[...new Set(all.map(r => r.country).filter(Boolean))].sort((x, y) => x.localeCompare(y))];
  const needle = q.trim().toLowerCase();
  const list = all.filter(r =>
    (country === "All" || r.country === country) &&
    (cat === "all" || (cat === "multi" ? r.category === "Multi-brand store" : r.category === "House boutique")) &&
    (!needle || [r.name, r.city, r.country, r.house, r.address].some(v => String(v || "").toLowerCase().includes(needle))));
  const byCountry = {};
  list.forEach(r => { (byCountry[r.country] = byCountry[r.country] || []).push(r); });
  const countries = Object.keys(byCountry).sort((x, y) => x.localeCompare(y));
    const chip = (on, label, fn, key) => (
    <button key={key || label} onClick={fn} aria-pressed={on} style={{ fontFamily:sans, fontSize:14, fontWeight:on?600:500, padding:"0 18px", minHeight:40, borderRadius:20, whiteSpace:"nowrap", border:`1px solid ${on?T.black:T.rule}`, background:on?T.black:T.white, color:on?T.white:T.ink, cursor:"pointer", flexShrink:0 }}>{label}</button>
  );
  const tag = r => r.category === "House boutique" ? (r.house ? `${r.house} boutique` : "House boutique") : r.category === "Multi-brand store" ? "Multi-brand" : (r.category || "");
  return (
    <div>
      {onBack && <button onClick={onBack} style={{ fontFamily:sans, fontSize:13, color:T.mid, background:"none", border:"none", padding:0, cursor:"pointer", marginBottom:22 }}>&lsaquo; Back to Learn</button>}
      <h3 style={{ fontFamily:serif, fontSize:"clamp(30px, 3.4vw, 50px)", fontWeight:400, letterSpacing:-0.6, color:T.black, margin:"0 0 10px" }}>Find where to try it.</h3>
      <p style={{ fontFamily:sans, fontSize:"clamp(14px, 1.1vw, 16px)", color:T.mid, lineHeight:1.65, margin:"0 0 22px", maxWidth:680 }}>Niche stores and sample sets, worldwide. Listings come from store pages and public guides, so check hours and ranges on the store's own site before you go.</p>
      <input className="mos-in" value={q} onChange={e => setQ(e.target.value)} placeholder="Search by city, country, store or house" style={{ marginBottom:12, maxWidth:560 }}/>
      <select className="mos-in mos-country-sel" aria-label="Country" value={country} onChange={e => setCountry(e.target.value)} style={{ marginBottom:12, maxWidth:560 }}>{countryList.map(c => <option key={c} value={c}>{c === "All" ? "All countries" : c}</option>)}</select>
      <div className="mos-country-chips" style={{ display:"flex", flexWrap:"wrap", gap:8, padding:"2px 0 12px" }}>{countryList.map(c => chip(country === c, c === "All" ? "All" : c, () => setCountry(c)))}</div>
      <div style={{ display:"flex", flexWrap:"wrap", gap:8, padding:"2px 0 14px" }}>
        {chip(cat === "all", "All kinds", () => setCat("all"), "k-all")}
        {chip(cat === "multi", "Multi-brand stores", () => setCat("multi"), "k-multi")}
        {chip(cat === "boutique", "House boutiques", () => setCat("boutique"), "k-boutique")}
      </div>
      {rows === null && <p style={{ fontFamily:sans, fontSize:13, color:T.mid }}>Loading</p>}
      {rows !== null && failed && <p style={{ fontFamily:sans, fontSize:14, color:T.mid, lineHeight:1.6 }}>The store list is not available yet. Please check back soon.</p>}
      {rows !== null && !failed && (
        <>
          <p style={{ fontFamily:sans, fontSize:12, color:T.mid, margin:"0 0 10px" }}>{list.length} {list.length === 1 ? "store" : "stores"} in {countries.length} {countries.length === 1 ? "country" : "countries"}</p>
          <div style={{ borderTop:`1px solid ${T.rule}` }}>
            {countries.map(c => {
              const isOpen = true;
              const items = byCountry[c];
              const cities = [...new Set(items.map(r => r.city || ""))];
              return (
                <div key={c} style={{ borderBottom:`1px solid ${T.rule}` }}>
                  <div style={{ display:"flex", alignItems:"baseline", justifyContent:"space-between", gap:12, padding:"22px 2px 14px" }}>
                    <span style={{ fontFamily:serif, fontSize:"clamp(22px, 1.9vw, 28px)", color:T.black }}>{c}</span>
                    <span style={{ fontFamily:sans, fontSize:12, color:T.mid }}>{items.length}</span>
                  </div>
                  {isOpen && (
                    <div style={{ padding:"0 2px 18px" }}>
                      {cities.map(city => (
                        <div key={city} style={{ marginBottom:14 }}>
                          {city && <p style={{ fontFamily:sans, fontSize:11, letterSpacing:"0.16em", textTransform:"uppercase", color:T.mid, margin:"6px 0 8px" }}>{city}</p>}
                          <div className="mos-samples">
                            {items.filter(r => (r.city || "") === city).map(r => {
                              const site = safeUrl(r.website);
                              const maps = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent([r.name, r.address].filter(Boolean).join(" "));
                              return (
                                <div key={r.id} style={{ border:`1px solid ${T.rule}`, borderRadius:12, padding:"14px 16px", background:T.white }}>
                                  <p style={{ fontFamily:serif, fontSize:17, color:T.black, margin:0, lineHeight:1.25 }}>{r.name}</p>
                                  <p style={{ fontFamily:sans, fontSize:11, color:T.accent, margin:"4px 0 0", letterSpacing:"0.04em" }}>{onOpenBrand && r.category === "House boutique" && r.house ? <button onClick={() => onOpenBrand({ name: r.house })} style={{ font:"inherit", letterSpacing:"inherit", color:"inherit", background:"none", border:"none", padding:0, cursor:"pointer", textDecoration:"underline", textUnderlineOffset:3 }}>{tag(r)}</button> : tag(r)}</p>
                                  {r.address && <p style={{ fontFamily:sans, fontSize:12, color:T.mid, lineHeight:1.5, margin:"8px 0 0" }}>{r.address}</p>}
                                  {r.notes && <p style={{ fontFamily:sans, fontSize:12, color:T.mid, lineHeight:1.5, margin:"6px 0 0", fontStyle:"italic" }}>{r.notes}</p>}
                                  {r.needs_check && <p style={{ fontFamily:sans, fontSize:11, color:T.faint, margin:"6px 0 0" }}>Details not yet confirmed</p>}
                                  <div style={{ display:"flex", gap:16, marginTop:12 }}>
                                    {site && <a href={site} target="_blank" rel="noopener noreferrer" style={{ fontFamily:sans, fontSize:13, color:T.ink, textDecoration:"none", display:"inline-flex", alignItems:"center", gap:5, minHeight:32 }}>Website<ExtArrow size={11}/></a>}
                                    <a href={maps} target="_blank" rel="noopener noreferrer" style={{ fontFamily:sans, fontSize:13, color:T.ink, textDecoration:"none", display:"inline-flex", alignItems:"center", gap:5, minHeight:32 }}>Map<ExtArrow size={11}/></a>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {list.length === 0 && <p style={{ fontFamily:sans, fontSize:14, color:T.mid, margin:"20px 0" }}>No stores match that search.</p>}
        </>
      )}
    </div>
  );
}

// ─── LEARN: notes browser, grouped by family ─────────────────────────────────
const NOTE_FAMILIES = [
  ["Florals", "almond blossom|apple blossom|bitter orange blossom|broom|carnation|champaca|cherry blossom|clover|cotton flower|floral notes|freesia|gardenia|hawthorn|heliotrope|hibiscus|iris|jasmine|jasmine sambac|lily|lily of the valley|linden blossom|magnolia|marigold|mimosa|orange blossom|orchid|osmanthus|passion flower|peach blossom|pink peony|rose|rose geranium|rose hip|sweet pea|tuberose|violet flower|violet leaf|wisteria|ylang ylang"],
  ["Citrus", "bergamot|bitter orange leaf|blood orange|citrus|grapefruit|kumquat|lemon|lemongrass|lime|mandarin|pomelo|sweet orange|yuzu"],
  ["Fruits", "apple|apricot|banana|blackcurrant|blueberry|cantaloupe|cherry|coconut|cranberry|dates|dried fruits|fig|fruity notes|grapes|guava|kiwi|lychee|mango|nectarine|papaya|passionfruit|peach|pear|pineapple|pitahaya|plum|quince|raspberry|red currant|rhubarb|strawberry|watermelon"],
  ["Spices", "allspice|black pepper|cardamom|chili|cinnamon|clove|coriander|fennel|fenugreek|ginger|mace|nutmeg|paprika|pink peppercorn|saffron|turmeric"],
  ["Woods and moss", "bamboo|cedarwood|cypress|ebony|guaiac|juniper|mahogany|myrtle|oakmoss|olive tree|oud|palo santo|sandalwood|teak|vetiver|woody notes"],
  ["Resins and balsams", "amber|ambergris|benzoin|cistus|frankincense|gurjan balsam|labdanum|mastic|myrrh"],
  ["Gourmand", "almond|butter|cacao pod|caramel|chestnut|cotton candy|cream glass|dark chocolate|gourmand notes|hazelnut|honeycomb|licorice|maple|marshmallow|milk splash|pistachio|popcorn|praline|rice|sesame|sugar|sugarcane|toffee|tonka|vanilla|wheat"],
  ["Drinks", "absinthe|black tea|champagne|coffee|gin glass|golden glass|rum tumbler"],
  ["Herbs and greens", "basil|carrot|carrot seeds|clary sage|fern|galbanum|herbal notes|lavender|oregano|rosemary|sage|shiso|spearmint|tomato leaf|truffle"],
  ["Musk, leather and smoke", "animalic notes|cannabis|cashmere|leather|suede|tobacco"],
  ["Fresh and mineral", "cucumber|marine notes|mineral notes|salt|sand|seaweed|solar notes"],
];
const NOTE_FAMILY_OF = (() => { const m = {}; NOTE_FAMILIES.forEach(([f, ks]) => ks.split("|").forEach(k => { m[k] = f; })); return m; })();
const LEARN_NOTE_FALLBACK = ["rose","jasmine","saffron","oud","vanilla","amber","bergamot","patchouli","vetiver","sandalwood","incense","musk","cardamom"];
const NOTE_FAMILY_BLURBS = {
  "Florals":"Petals at every stage, from dewy to heady.",
  "Citrus":"Bright peel and zest. The opening of countless fragrances.",
  "Fruits":"Juicy, ripe and sometimes jammy.",
  "Spices":"Warm, sharp or sweet. A pinch changes everything.",
  "Woods and moss":"Dry cedar, creamy sandalwood, damp forest floor.",
  "Resins and balsams":"Sticky, glowing and warm. The base of amber.",
  "Gourmand":"Vanilla, cocoa, caramel and sugar. Soft and edible.",
  "Drinks":"Tea, coffee and the contents of a glass.",
  "Herbs and greens":"Fresh-cut leaves, kitchen herbs and lavender.",
  "Musk, leather and smoke":"Skin-close, animal and dark.",
  "Fresh and mineral":"Salt, sand, sea air and clean stone.",
};
function NotesBrowser({ onOpen, onTile }) {
  const cap = k => k.replace(/(^|[\s-])([a-z])/g, (m, p, c) => p + c.toUpperCase());
  const all = NOTE_PHOTO_PREVIEW ? NOTE_PHOTO_GALLERY : LEARN_NOTE_FALLBACK;
  const guides = ["Vetiver","Sandalwood","Patchouli","Oud","Rose","Jasmine","Bergamot","Vanilla","Iris","Tonka","Amber","Cashmere"].filter(k => INGREDIENTS[k]);
  const tile = k => {
    const guide = INGREDIENTS[cap(k)] ? cap(k) : null;
    if (onTile) return <button key={k} onClick={() => onTile(k)} aria-label={`Fragrances with ${k}`} style={{ flex:"none", width:TILE_W, background:"none", border:"none", padding:0, cursor:"pointer", textAlign:"left", fontFamily:sans, scrollSnapAlign:"start" }}><NoteIllustration name={k} tile/></button>;
    const inner = (<><NoteIllustration name={k} tile/><span style={{ display:"block", height:16, fontFamily:sans, fontSize:11, fontWeight:600, letterSpacing:"0.14em", textTransform:"uppercase", color:T.accent }}>{guide ? "Guide" : ""}</span></>);
    const st = { flex:"none", width:TILE_W, textAlign:"left", fontFamily:sans, scrollSnapAlign:"start" };
    return guide
      ? <button key={k} onClick={() => onOpen(guide)} aria-label={`Open the ${guide} guide`} style={{ ...st, background:"none", border:"none", padding:0, cursor:"pointer" }}>{inner}</button>
      : <div key={k} style={st}>{inner}</div>;
  };
  const shelf = (title, blurb, keys, tinted) => (
    <section key={title} className={"mos-bleed" + (tinted ? " mos-band" : "")} style={{ padding:"26px 0 22px" }}>
      <div className="mos-bleed-pad" style={{ marginBottom:16 }}>
        <h3 style={{ fontFamily:serif, fontSize:"clamp(26px, 2.3vw, 38px)", fontWeight:400, letterSpacing:-0.6, color:T.black, margin:0, lineHeight:1.1 }}>{title}</h3>
        <p style={{ fontFamily:sans, fontSize:"clamp(14px, 1.1vw, 17px)", color:T.mid, margin:"6px 0 0", lineHeight:1.5 }}>{blurb}</p>
      </div>
      <div className="mos-shelf mos-bleed-pad" style={{ display:"flex", alignItems:"flex-start", gap:14, overflowX:"auto", paddingTop:2, paddingBottom:14, scrollSnapType:"x proximity", WebkitOverflowScrolling:"touch" }}>{keys.map(tile)}</div>
    </section>
  );
  const sections = onTile ? [] : [shelf("Start with a guide", "Twelve ingredients to begin with. Every one below has a guide too: where it grows, how it is made, and where you have smelled it.", guides.map(g => g.toLowerCase()), true)];
  let n = onTile ? 0 : 1;
  [...NOTE_FAMILIES].sort((a, b) => a[0].localeCompare(b[0])).forEach(([fam]) => {
    const keys = all.filter(k => NOTE_FAMILY_OF[k] === fam).sort((a, b) => a.localeCompare(b));
    if (keys.length) sections.push(shelf(fam, NOTE_FAMILY_BLURBS[fam] || "", keys, n++ % 2 === 1));
  });
  return <div>{sections}</div>;
}

function LearnTab({ fragrances, onOpenFrag, onOpenBrand }) {
  const [openTerm,setOpenTerm]=useState(null);
  const [openExpo,setOpenExpo]=useState(null);
  const [openNote,setOpenNote]=useState(null);
  const bfOn=Date.now()<BF_TAB_UNTIL;
  const [tab,setTab]=useState(bfOn?"blackfriday":"ingredients");
  const todayTerm=GLOSSARY[Math.floor((Date.now()-new Date().getTimezoneOffset()*60000)/86400000)%GLOSSARY.length];
  const LEARN_TABS=[...(bfOn?[["blackfriday","Black Friday"]]:[]),["ingredients","Ingredient guide"],["stores","Fragrance stores"],["expos","Fragrance expos"],["articles","Articles"]];
  if (openNote) return <IngredientGuide name={openNote} onBack={()=>setOpenNote(null)} fragrances={fragrances} onOpenFrag={onOpenFrag}/>;
  return (
    <div>
      <div className="mos-pagehead">
        <p style={{fontFamily:sans,fontSize:9,textTransform:"uppercase",letterSpacing:"0.18em",color:T.mid,margin:"0 0 4px"}}>Education</p>
        <h2 style={{fontFamily:serif,fontSize:"clamp(32px, 3.2vw, 50px)",color:T.black,letterSpacing:-0.8,margin:0,fontWeight:400}}>Learn</h2>
        <p style={{fontFamily:sans,fontSize:"clamp(13px, 1.1vw, 17px)",color:T.mid,margin:"6px 0 0"}}>From beginner to connoisseur, at your pace.</p>
      </div>
      <div style={{border:`1px solid ${T.black}`,borderRadius:16,padding:22,marginBottom:24,position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",right:-8,top:-18,fontFamily:serif,fontSize:120,color:T.lift,lineHeight:1,userSelect:"none"}}>{todayTerm.term[0]}</div>
        <Lbl>Term of the Day</Lbl>
        <h3 style={{fontFamily:serif,fontSize:32,color:T.black,margin:"0 0 10px",fontWeight:"normal"}}>{todayTerm.term}</h3>
        <p style={{fontFamily:sans,fontSize:13,color:T.mid,lineHeight:1.7,margin:0,maxWidth:620}}>{todayTerm.def}</p>
      </div>
      <div role="tablist" style={{display:"flex",gap:4,overflowX:"auto",borderBottom:`1px solid ${T.rule}`,marginBottom:24,WebkitOverflowScrolling:"touch"}}>
        {LEARN_TABS.map(([k,l])=>(
          <button key={k} role="tab" aria-selected={tab===k} onClick={()=>setTab(k)} style={{fontFamily:sans,fontSize:13,fontWeight:tab===k?600:500,letterSpacing:"0.04em",color:tab===k?T.black:T.mid,background:"none",border:"none",borderBottom:`2px solid ${tab===k?T.black:"transparent"}`,padding:"0 16px",minHeight:46,whiteSpace:"nowrap",cursor:"pointer",flexShrink:0,marginBottom:-1}}>{l}</button>
        ))}
      </div>
      {tab==="blackfriday"&&<BlackFridayGuide embedded/>}
      {tab==="stores"&&<StoreFinder onOpenBrand={onOpenBrand}/>}
      {tab==="ingredients"&&<>
      <NotesBrowser onOpen={setOpenNote}/>
      </>}
      {tab==="articles"&&<>
      <Lbl>Learning Paths</Lbl>
      {[{icon:"△",name:"The Fragrance Pyramid",sub:"How scents evolve on skin over time",progress:0},{icon:"◈",name:"The 7 Fragrance Families",sub:"From florals to amber, the full map",progress:33},{icon:"◇",name:"Niche vs. Heritage",sub:"What separates a $50 from a $500 bottle",progress:0},{icon:"◎",name:"The Art of Sampling",sub:"How to get the most from a 2ml vial",progress:0}].map(p=>(
        <div key={p.name} style={{background:T.white,border:`1px solid ${T.rule}`,borderRadius:12,padding:14,display:"flex",alignItems:"center",gap:12,cursor:"pointer",marginBottom:8}}>
          <div style={{width:40,height:40,borderRadius:10,background:T.lift,border:`1px solid ${T.rule}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,color:T.mid,flexShrink:0}}>{p.icon}</div>
          <div style={{flex:1}}><p style={{fontFamily:sans,fontSize:13,fontWeight:500,color:T.ink,margin:0}}>{p.name}</p><p style={{fontFamily:sans,fontSize:11,color:T.mid,margin:"2px 0 0"}}>{p.sub}</p>{p.progress>0&&<div style={{marginTop:8,height:2,background:T.press,borderRadius:2,overflow:"hidden"}}><div style={{height:"100%",width:`${p.progress}%`,background:T.black,borderRadius:2}}/></div>}</div>
          <span style={{fontFamily:sans,fontSize:11,color:T.mid}}>{p.progress>0?`${p.progress}%`:"Start"}</span>
        </div>
      ))}
      </>}
      {tab==="expos"&&(()=>{
        const today=new Date().toISOString().slice(0,10);
        const fmt=d=>new Date(d+"T12:00:00").toLocaleDateString("en-GB",{day:"numeric",month:"short"});
        const range=e=>e.start===e.end?fmt(e.start)+" "+e.start.slice(0,4):fmt(e.start)+" to "+fmt(e.end)+" "+e.end.slice(0,4);
        const dated=FRAGRANCE_EXPOS.filter(e=>e.start&&e.end>=today).sort((a,b)=>a.start.localeCompare(b.start));
        const undated=FRAGRANCE_EXPOS.filter(e=>!e.start||e.end<today).sort((a,b)=>a.name.localeCompare(b.name));
        const card=(expo,i,arr)=>(
          <div key={expo.name} style={{padding:"16px 18px",borderBottom:i<arr.length-1?`1px solid ${T.lift}`:"none"}}>
            <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
              <span style={{fontFamily:serif,fontSize:18,color:T.black}}>{expo.name}</span>
              <span style={{fontFamily:sans,fontSize:11,padding:"2px 9px",borderRadius:10,background:T.lift,color:T.ink,border:`1px solid ${T.rule}`}}>{expo.start&&expo.end>=today?range(expo):(expo.note||"Dates to be announced")}</span>
            </div>
            <p style={{fontFamily:sans,fontSize:13,color:T.ink,margin:"6px 0 0",fontWeight:500}}>{[expo.city,expo.country].filter(Boolean).join(", ")}</p>
            {expo.venue&&<p style={{fontFamily:sans,fontSize:12,color:T.mid,margin:"2px 0 0"}}>{expo.venue}</p>}
            {expo.start&&expo.note&&<p style={{fontFamily:sans,fontSize:12,color:T.mid,margin:"2px 0 0"}}>{expo.note}</p>}
            <p style={{fontFamily:sans,fontSize:13,color:T.mid,lineHeight:1.65,margin:"8px 0 0"}}>{expo.description}</p>
            {expo.url&&<a href={expo.url} target="_blank" rel="noopener noreferrer" style={{display:"inline-block",marginTop:10,fontFamily:sans,fontSize:13,color:"var(--accent)"}}>Visit website ↗</a>}
          </div>
        );
        return <div>
          <Lbl>Fragrance Expos & Events</Lbl>
          <p style={{fontFamily:sans,fontSize:13,color:T.mid,lineHeight:1.65,margin:"0 0 18px"}}>Fairs, shows and festivals around the world, soonest first.</p>
          <p style={{fontFamily:sans,fontSize:11,letterSpacing:"0.12em",textTransform:"uppercase",color:T.mid,margin:"0 0 8px"}}>Coming up</p>
          <div style={{background:T.white,border:`1px solid ${T.rule}`,borderRadius:14,overflow:"hidden",marginBottom:22}}>{dated.map(card)}</div>
          <p style={{fontFamily:sans,fontSize:11,letterSpacing:"0.12em",textTransform:"uppercase",color:T.mid,margin:"0 0 8px"}}>Dates to be announced</p>
          <div style={{background:T.white,border:`1px solid ${T.rule}`,borderRadius:14,overflow:"hidden"}}>{undated.map(card)}</div>
          <p style={{fontFamily:sans,fontSize:10,color:T.faint,margin:"12px 0 0",lineHeight:1.5}}>Dates and places can change. Check each event's website before you plan a trip.</p>
        </div>;
      })()}

      {tab==="articles"&&<div style={{borderTop:`2px solid ${T.black}`,marginTop:28,paddingTop:22}}>
        <Lbl>Who Owns Your Fragrance House?</Lbl>
        <p style={{fontFamily:sans,fontSize:13,color:T.mid,lineHeight:1.7,margin:"0 0 18px"}}>The fragrance industry has consolidated significantly over the past two decades. A handful of large conglomerates now own many of the houses that built their reputations as independent creative enterprises. This matters because ownership changes often bring pressure to reduce costs, which can mean reformulated ingredients, discontinued lines, or a shift in creative direction.</p>
        <div style={{background:T.white,border:`1px solid ${T.rule}`,borderRadius:14,overflow:"hidden",marginBottom:16}}>
          {[
            { label:"Independent", color:T.violet, text:"The house is privately owned, founder-led, or operated without conglomerate backing. Creative decisions are made by people with a direct stake in the house's identity." },
            { label:"Owned by a group", color:T.violet, text:"The house has been acquired by a larger group, most commonly LVMH, Estée Lauder Companies, Puig, or Interparfums. This doesn't mean the quality has changed, but it's worth knowing when it happened and who holds the reins." },
          ].map((item, i, arr) => (
            <div key={item.label} style={{padding:"16px 18px",borderBottom:i<arr.length-1?`1px solid ${T.lift}`:"none"}}>
              <div style={{marginBottom:8}}>
                <span style={{fontFamily:sans,fontSize:12,fontWeight:500,color:item.color}}>{item.label}</span>
              </div>
              <p style={{fontFamily:sans,fontSize:12,color:T.mid,lineHeight:1.65,margin:0}}>{item.text}</p>
            </div>
          ))}
        </div>
        <div style={{background:T.lift,border:`1px solid ${T.rule}`,borderRadius:12,padding:16,marginBottom:16}}>
          <div style={{display:"flex",alignItems:"flex-start",gap:8}}>
            <Icon name="tip" size={14} color={T.mid}/>
            <p style={{fontFamily:sans,fontSize:12,color:T.mid,lineHeight:1.65,margin:0}}>Ownership is one signal, not a verdict. Some conglomerate-owned houses have maintained exceptional quality. Others have drifted. The acquisition date is often the more telling data point, a house acquired recently may not yet show the effects, while one acquired a decade ago has a longer track record to judge.</p>
          </div>
        </div>
        <p style={{fontFamily:sans,fontSize:11,color:T.faint,margin:0,lineHeight:1.6}}>Ownership data is maintained by the Memoir on Skin community and updated when changes occur. If you notice an error, use the Suggest feature to flag it.</p>
      </div>}
    </div>
  );
}

// ─── COUNTRIES — flag via unicode regional indicators (no external deps) ──────
const COUNTRIES = [
  {code:"AU",name:"Australia"},{code:"AT",name:"Austria"},{code:"BE",name:"Belgium"},
  {code:"BR",name:"Brazil"},{code:"CA",name:"Canada"},{code:"CN",name:"China"},
  {code:"DK",name:"Denmark"},{code:"FI",name:"Finland"},{code:"FR",name:"France"},
  {code:"DE",name:"Germany"},{code:"GR",name:"Greece"},{code:"HK",name:"Hong Kong"},
  {code:"IN",name:"India"},{code:"ID",name:"Indonesia"},{code:"IE",name:"Ireland"},
  {code:"IL",name:"Israel"},{code:"IT",name:"Italy"},{code:"JP",name:"Japan"},
  {code:"KR",name:"South Korea"},{code:"LB",name:"Lebanon"},{code:"MY",name:"Malaysia"},
  {code:"MX",name:"Mexico"},{code:"NL",name:"Netherlands"},{code:"NZ",name:"New Zealand"},
  {code:"NO",name:"Norway"},{code:"PK",name:"Pakistan"},{code:"PH",name:"Philippines"},
  {code:"PL",name:"Poland"},{code:"PT",name:"Portugal"},{code:"QA",name:"Qatar"},
  {code:"RU",name:"Russia"},{code:"SA",name:"Saudi Arabia"},{code:"SG",name:"Singapore"},
  {code:"ZA",name:"South Africa"},{code:"ES",name:"Spain"},{code:"SE",name:"Sweden"},
  {code:"CH",name:"Switzerland"},{code:"TW",name:"Taiwan"},{code:"TH",name:"Thailand"},
  {code:"TR",name:"Turkey"},{code:"AE",name:"UAE"},{code:"GB",name:"United Kingdom"},
  {code:"US",name:"United States"},{code:"VN",name:"Vietnam"},
];

function countryFlag(code) {
  if (!code || code.length !== 2) return "";
  const offset = 127397;
  return String.fromCodePoint(code.charCodeAt(0) + offset) + String.fromCodePoint(code.charCodeAt(1) + offset);
}

// ─── USER BADGES ──────────────────────────────────────────────────────────────
function UserBadges({ user, size = "normal" }) {
  if (!user) return null;
  const isSmall = size === "small";
  const badges = [];

  if (user.isFounder) {
    badges.push(
      <span key="founder" title="Founding Member, first 1,000" style={{
        display: "inline-flex", alignItems: "center", gap: isSmall ? 3 : 4,
        padding: isSmall ? "2px 6px" : "3px 8px",
        borderRadius: 20,
        background: "#1A1A1A",
        border: "1px solid #3A3A3A",
        fontFamily: sans, fontSize: isSmall ? 9 : 10, fontWeight: 600,
        color: "#D4AF37",
        letterSpacing: "0.04em",
        flexShrink: 0,
      }}>
        <svg width={isSmall ? 9 : 11} height={isSmall ? 9 : 11} viewBox="0 0 12 12" fill="none">
          <polygon points="6,1 7.5,4.5 11,4.8 8.5,7.2 9.2,11 6,9.2 2.8,11 3.5,7.2 1,4.8 4.5,4.5" fill="#D4AF37"/>
        </svg>
        {!isSmall && "Founding Member"}
        {isSmall && "#" + user.memberNumber}
      </span>
    );
  }

  if (user.isTopContributor) {
    badges.push(
      <span key="contrib" title="Top Contributor" style={{
        display: "inline-flex", alignItems: "center", gap: isSmall ? 3 : 4,
        padding: isSmall ? "2px 6px" : "3px 8px",
        borderRadius: 20,
        background: "#0A1628",
        border: "1px solid #1E3A5F",
        fontFamily: sans, fontSize: isSmall ? 9 : 10, fontWeight: 600,
        color: "#5B9BD5",
        letterSpacing: "0.04em",
        flexShrink: 0,
      }}>
        <svg width={isSmall ? 9 : 11} height={isSmall ? 9 : 11} viewBox="0 0 12 12" fill="none">
          <path d="M2 10 L2 6 L6 2 L10 6 L10 10Z" fill="none" stroke="#5B9BD5" strokeWidth="1.2" strokeLinejoin="round"/>
          <path d="M4 10 L4 7 L6 5 L8 7 L8 10Z" fill="#5B9BD5"/>
        </svg>
        {!isSmall && "Top Contributor"}
      </span>
    );
  }

  if (user.country) {
    badges.push(
      <span key="flag" title={COUNTRIES.find(c => c.code === user.country)?.name || user.country} style={{
        fontSize: isSmall ? 13 : 15,
        lineHeight: 1,
        flexShrink: 0,
      }}>
        {countryFlag(user.country)}
      </span>
    );
  }

  if (badges.length === 0) return null;
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 5, flexWrap: "wrap" }}>
      {badges}
    </div>
  );
}

// ─── COUNTRY PICKER ───────────────────────────────────────────────────────────
function CountryPicker({ value, onChange, style }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const selected = COUNTRIES.find(c => c.code === value);
  const filtered = query.trim()
    ? COUNTRIES.filter(c => c.name.toLowerCase().includes(query.toLowerCase()))
    : COUNTRIES;

  return (
    <div style={{ position: "relative", ...style }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          width: "100%", display: "flex", alignItems: "center", gap: 10,
          padding: "13px 16px", borderRadius: 12, cursor: "pointer",
          background: style && style.background ? style.background : T.lift,
          border: style && style.border ? style.border : `1px solid ${T.rule}`,
          color: selected ? T.ink : T.mid,
          fontSize: 15, fontFamily: sans, textAlign: "left",
          boxSizing: "border-box",
        }}
      >
        {selected ? (
          <>
            <span style={{ fontSize: 18 }}>{countryFlag(selected.code)}</span>
            <span style={{ flex: 1 }}>{selected.name}</span>
          </>
        ) : (
          <span style={{ flex: 1 }}>Country (optional)</span>
        )}
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M2 4 L6 8 L10 4" stroke={T.mid} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, zIndex: 100,
          background: T.white, border: `1px solid ${T.rule}`, borderRadius: 12,
          boxShadow: "0 8px 24px rgba(0,0,0,0.10)", overflow: "hidden",
        }}>
          <div style={{ padding: "10px 12px", borderBottom: `1px solid ${T.rule}` }}>
            <input
              autoFocus
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search countries…"
              style={{
                width: "100%", background: T.lift, border: `1px solid ${T.rule}`,
                borderRadius: 8, padding: "8px 12px", fontSize: 13,
                color: T.ink, outline: "none", fontFamily: sans, boxSizing: "border-box",
              }}
            />
          </div>
          <div style={{ maxHeight: 200, overflowY: "auto" }}>
            {filtered.map(c => (
              <button
                key={c.code}
                type="button"
                onClick={() => { onChange(c.code); setOpen(false); setQuery(""); }}
                style={{
                  width: "100%", display: "flex", alignItems: "center", gap: 10,
                  padding: "10px 14px", background: value === c.code ? T.lift : "transparent",
                  border: "none", cursor: "pointer", fontFamily: sans, fontSize: 13, color: T.ink,
                  textAlign: "left",
                }}
              >
                <span style={{ fontSize: 16 }}>{countryFlag(c.code)}</span>
                <span>{c.name}</span>
              </button>
            ))}
            {filtered.length === 0 && (
              <p style={{ padding: "12px 14px", fontFamily: sans, fontSize: 13, color: T.mid, margin: 0 }}>No results</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── WAITLIST SCREEN ──────────────────────────────────────────────────────────
const loginStart = { mode: "signin" };
const wantsJoinLink = () => { try { return /[?&](join=1|code=)/.test(window.location.search); } catch (e) { return false; } };
function WaitlistScreen({ onJoin, onHaveCode }) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

  async function handleSubmit() {
    if (!name.trim()) { setError("Please enter your name."); return; }
    if (!isValidEmail(email)) { setError("Please enter a valid email address."); return; }
    setError("");
    setLoading(true);
    const r = await supabase.rpc("join_waitlist", { p_email: email.trim(), p_name: name.trim(), p_src: getSrc() || null });
    setLoading(false);
    if (r.error) { setError("Something went wrong. Please try again in a moment."); return; }
    setSubmitted(true);
  }

  const inp = {
    width: "100%", background: T.white, border: `1px solid ${T.rule}`, borderRadius: 14,
    padding: "15px 16px", fontSize: 15, color: T.ink, outline: "none",
    fontFamily: sans, boxSizing: "border-box", WebkitAppearance: "none",
  };

  return (
    <div style={{ minHeight:"100svh", position:"relative", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"64px 28px 40px", boxSizing:"border-box", fontFamily:sans }}>
      <div style={{ position:"absolute", top:16, right:16, zIndex:2 }}><ThemeToggle/></div>
      <div style={{ position:"relative", zIndex:1, width:"100%", maxWidth:400 }}>
        <div style={{ marginBottom:44 }}>
          <Logo stacked size={20}/>
        </div>

        {!submitted ? (
          <>
            <div style={{ marginBottom:32 }}>
              <p style={{ fontFamily:sans, fontSize:10, fontWeight:600, color:T.accent, textTransform:"uppercase", letterSpacing:"0.18em", margin:"0 0 12px" }}>Early access</p>
              <h2 style={{ fontFamily:serif, fontSize:28, color:T.black, margin:"0 0 14px", letterSpacing:-0.6, lineHeight:1.2, fontWeight:400 }}>
                Where scent becomes memory.
              </h2>
              <p style={{ fontFamily:sans, fontSize:14, color:T.mid, lineHeight:1.7, margin:0 }}>
                We are not here to influence you. Trust your own nose. We're letting in members one cohort at a time.
              </p>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:14 }}>
              <input value={name} onChange={e => { setName(e.target.value); setError(""); }} placeholder="Your name" style={inp} onKeyDown={e => e.key==="Enter" && handleSubmit()}/>
              <input value={email} onChange={e => { setEmail(e.target.value); setError(""); }} placeholder="Email address" type="email" style={inp} onKeyDown={e => e.key==="Enter" && handleSubmit()}/>
            </div>
            {error && <p style={{ fontFamily:sans, fontSize:12, color:T.bad, margin:"0 0 12px" }}>{error}</p>}
            <button onClick={handleSubmit} disabled={loading} style={{ width:"100%", padding:"16px 0", borderRadius:14, background:loading?T.faint:T.black, border:"none", color:T.white, fontSize:14, fontFamily:sans, fontWeight:600, cursor:loading?"not-allowed":"pointer", transition:"all 0.2s", boxShadow:loading?"none":"0 8px 24px rgba(201,32,107,0.28)" }}>
              {loading ? "Joining…" : "Request early access"}
            </button>
            <div style={{ display:"flex", alignItems:"center", gap:12, margin:"24px 0" }}>
              <div style={{ flex:1, height:1, background:T.rule }}/>
              <span style={{ fontFamily:sans, fontSize:11, color:T.mid }}>Already have access?</span>
              <div style={{ flex:1, height:1, background:T.rule }}/>
            </div>
            {onHaveCode && <button onClick={onHaveCode} style={{ width:"100%", padding:"15px 0", borderRadius:14, background:T.black, border:"none", color:T.white, fontSize:14, fontFamily:sans, fontWeight:600, cursor:"pointer", marginBottom:10 }}>I have an invite code</button>}
            <button onClick={onJoin} style={{ width:"100%", padding:"15px 0", borderRadius:14, background:T.glass, backdropFilter:"blur(12px)", WebkitBackdropFilter:"blur(12px)", border:`1px solid ${T.rule}`, color:T.black, fontSize:14, fontFamily:sans, fontWeight:500, cursor:"pointer" }}>Sign in</button>
            <p style={{ fontFamily:sans, fontSize:11, color:T.mid, margin:"28px 0 0", lineHeight:1.6 }}>No spam. No sharing. Just a notification when your spot opens up.</p>
            <FooterLinks/>
          </>
        ) : (
          <div style={{ textAlign:"center" }}>
            <div style={{ width:64, height:64, borderRadius:"50%", background:T.black, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 24px" }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={T.white} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <h2 style={{ fontFamily:serif, fontSize:30, color:T.black, margin:"0 0 12px", fontWeight:400 }}>You're on the list.</h2>
            <p style={{ fontFamily:sans, fontSize:14, color:T.mid, lineHeight:1.7, margin:"0 0 32px" }}>
              We'll reach out to <span style={{ color:T.black, fontWeight:500 }}>{email}</span> when your early access opens. We're releasing in small cohorts, expect to hear from us soon.
            </p>
            <div style={{ background:T.glass, backdropFilter:"blur(12px)", WebkitBackdropFilter:"blur(12px)", borderRadius:14, border:`1px solid ${T.rule}`, padding:"16px 20px", marginBottom:32, textAlign:"left" }}>
              <p style={{ fontFamily:sans, fontSize:10, fontWeight:600, color:T.accent, textTransform:"uppercase", letterSpacing:"0.14em", margin:"0 0 6px" }}>While you wait</p>
              <p style={{ fontFamily:sans, fontSize:13, color:T.mid, lineHeight:1.65, margin:0 }}>Start thinking about which fragrances you own, which you've tried, and which you've been meaning to sample. You'll be able to log everything the moment you get in.</p>
            </div>
            <button onClick={onJoin} style={{ width:"100%", padding:"15px 0", borderRadius:14, background:T.glass, backdropFilter:"blur(12px)", WebkitBackdropFilter:"blur(12px)", border:`1px solid ${T.rule}`, color:T.black, fontSize:14, fontFamily:sans, fontWeight:500, cursor:"pointer" }}>I already have access, sign in</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── LANDING SCREEN (signed-out homepage) ─────────────────────────────────────
// Which link brought someone to the beta list (e.g. /beta?src=signature). Kept for the visit, sent with the sign-up.
function getSrc() {
  try {
    const q = new URLSearchParams(window.location.search).get("src");
    const clean = q ? q.toLowerCase().replace(/[^a-z0-9_-]/g, "").slice(0, 30) : "";
    if (clean) sessionStorage.setItem("mos-src", clean);
    return clean || sessionStorage.getItem("mos-src") || "";
  } catch (e) { return ""; }
}
if (typeof window !== "undefined") getSrc();
function LandingScreen({ onSignIn, onHaveCode }) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const formRef = useRef(null);
  // First-time visitors start on the dark page; nothing is saved unless they press the toggle.
  useEffect(() => {
    let forced = false;
    if (readThemePref() === "system") { forced = true; themeStore.pref = "dark"; paintTheme("dark"); themeStore.subs.forEach(f => f()); }
    return () => {
      if (forced && themeStore.pref === "dark" && readThemePref() === "system") { themeStore.pref = "system"; paintTheme("system"); themeStore.subs.forEach(f => f()); }
    };
  }, []);
  const okEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
  async function submit() {
    if (!name.trim()) { setError("Please add your first name."); return; }
    if (!okEmail(email)) { setError("Please enter a valid email address."); return; }
    setError(""); setLoading(true);
    const r = await supabase.rpc("join_waitlist", { p_email: email.trim(), p_name: name.trim(), p_src: getSrc() || null });
    setLoading(false);
    if (r.error) { setError("That didn't go through. Try again in a moment."); return; }
    setDone(true);
  }
  const goForm = () => { try { formRef.current && formRef.current.scrollIntoView({ behavior:"smooth", block:"center" }); } catch (e) {} };
  useEffect(() => { if (window.location.hash === "#beta" || /^\/beta\/?$/.test(window.location.pathname)) { const t = setTimeout(goForm, 400); return () => clearTimeout(t); } }, []);
  const inp = { ...FIELD, minHeight:52 };
  const STEPS = [
    { n:"Sample", h:"Start with the brand.", b:"Buy discovery sets, samples and travel sizes straight from the house, and get to know the people behind the scent. If a brand can't ship to you or has sold out, we point you to decanters.", c:"var(--violet)" },
    { n:"Wear", h:"Log what you wear, and when.", b:"Note the weather, the occasion and how it wore. Your collection grows into a record of your own taste.", c:"var(--teal)" },
    { n:"Keep", h:"A journal that asks how it feels.", b:"Where it takes you, what it reminds you of, the words you reach for. Scent is memory. Keep yours.", c:"var(--accent)" },
    { n:"Together", h:"A community of noses.", b:"Follow other members, read honest reactions and layering ideas, and share your own. Every review is one person's nose, never a verdict.", c:"var(--tangerine)" },
  ];
  return (
    <div style={{ minHeight:"100svh", fontFamily:sans, color:T.ink }}>
      <header style={{ maxWidth:1080, margin:"0 auto", padding:"16px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", gap:12 }}>
        <Logo size={18}/>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <button onClick={onSignIn} style={{ ...ghostBtn, minHeight:40, padding:"0 18px", fontSize:14 }}>Sign in</button>
          <ThemeToggle/>
        </div>
      </header>

      <main>
        <section style={{ maxWidth:640, margin:"0 auto", padding:"36px 20px 56px", textAlign:"center" }}>
          <p style={{ display:"inline-block", fontSize:11, fontWeight:600, letterSpacing:"0.16em", textTransform:"uppercase", color:"var(--accent)", background:T.lift, border:`1px solid ${T.rule}`, borderRadius:20, padding:"6px 14px", margin:"0 0 22px" }}>Beta opening soon</p>
          <h1 style={{ fontFamily:serif, fontWeight:400, fontSize:"clamp(40px, 9vw, 68px)", lineHeight:1.05, letterSpacing:-1.4, color:T.black, margin:"0 0 18px" }}>Where scent becomes memory.</h1>
          <p style={{ fontSize:"clamp(16px, 2.4vw, 19px)", lineHeight:1.65, color:T.mid, margin:"0 auto 30px", maxWidth:480 }}>Sample first. Wear what you love. Keep the record. We are opening the beta to small groups, and we would love you to be one of them.</p>

          <div ref={formRef} style={{ background:T.white, border:`1px solid ${T.rule}`, borderRadius:22, padding:"22px 20px", textAlign:"left", boxShadow:"0 14px 40px rgba(0,0,0,0.08)" }}>
            {!done ? (<>
              <p style={{ fontFamily:serif, fontSize:22, color:T.black, margin:"0 0 4px" }}>Join the beta list</p>
              <p style={{ fontSize:13, color:T.mid, lineHeight:1.6, margin:"0 0 16px" }}>Just your first name and email. No password, no payment.</p>
              <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:12 }}>
                <input value={name} onChange={e => { setName(e.target.value); setError(""); }} placeholder="First name" autoComplete="given-name" style={inp} onKeyDown={e => e.key === "Enter" && submit()}/>
                <input value={email} onChange={e => { setEmail(e.target.value); setError(""); }} placeholder="Email address" type="email" autoComplete="email" style={inp} onKeyDown={e => e.key === "Enter" && submit()}/>
              </div>
              {error && <p role="alert" style={{ fontSize:13, color:T.bad, margin:"0 0 10px" }}>{error}</p>}
              <button onClick={submit} disabled={loading} style={ctaBtn(!loading)}>{loading ? "Joining…" : "Save my spot"}</button>
              <p style={{ fontSize:12, color:T.faint, lineHeight:1.6, margin:"12px 0 0", textAlign:"center" }}>One email when your spot opens. Nothing else, and we never share it.</p>
            </>) : (
              <div style={{ textAlign:"center", padding:"8px 0" }}>
                <div style={{ width:52, height:52, borderRadius:"50%", background:"var(--accent)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 14px" }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <p style={{ fontFamily:serif, fontSize:24, color:T.black, margin:"0 0 6px" }}>You're on the list, {name.trim()}.</p>
                <p style={{ fontSize:14, color:T.mid, lineHeight:1.65, margin:0 }}>We will write to <strong style={{ color:T.black, fontWeight:500 }}>{email.trim()}</strong> when your spot opens. Until then, think about the scents you own, the ones you have sampled and the ones you keep meaning to try.</p>
              </div>
            )}
          </div>
          <div style={{ margin:"26px 0 0" }}>
            <p style={{ fontFamily:serif, fontSize:19, color:T.black, margin:"0 0 6px" }}>Follow along while you wait</p>
            <p style={{ fontSize:13, color:T.mid, lineHeight:1.6, margin:"0 auto 14px", maxWidth:360 }}>New scents, sample finds and beta news land on our socials first.</p>
            <div style={{ display:"flex", gap:10, justifyContent:"center", flexWrap:"wrap" }}>
              {[
                { n:"Instagram", u:"https://www.instagram.com/memoironskin", icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="0.8" fill="currentColor"/></svg> },
                { n:"TikTok", u:"https://www.tiktok.com/@memoironskin", icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5"/><path d="M14 3c.4 2.6 2 4.2 5 4.4"/></svg> },
              ].map(l => (
                <a key={l.n} href={l.u} target="_blank" rel="noopener noreferrer"
                  style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", gap:8, minHeight:46, padding:"0 20px", borderRadius:23, border:`1px solid ${T.rule}`, background:T.white, color:T.ink, fontFamily:sans, fontSize:14, fontWeight:600, textDecoration:"none" }}>{l.icon}{l.n}<span style={{ fontWeight:400, color:T.mid }}>@memoironskin</span></a>
              ))}
            </div>
          </div>
          <p style={{ fontSize:13, color:T.mid, margin:"22px 0 0" }}>Already have an invite code?{" "}<button onClick={onHaveCode} style={{ font:"inherit", color:T.black, fontWeight:600, background:"none", border:"none", borderBottom:`1px solid ${T.rule}`, padding:0, cursor:"pointer" }}>Use it here</button></p>
        </section>

        <section style={{ background:T.lift, borderTop:`1px solid ${T.rule}`, borderBottom:`1px solid ${T.rule}` }}>
          <div style={{ maxWidth:640, margin:"0 auto", padding:"44px 20px", textAlign:"center" }}>
            <p style={{ fontFamily:serif, fontSize:"clamp(24px, 5vw, 34px)", lineHeight:1.3, letterSpacing:-0.5, color:T.black, margin:"0 0 10px" }}>We are not here to influence you.<br/>Trust your own nose.</p>
            <p style={{ fontSize:15, color:T.mid, lineHeight:1.7, margin:0 }}>A review is someone else's nose. We help you find a sample and try it on skin. You make the call.</p>
          </div>
        </section>

        <section style={{ maxWidth:1080, margin:"0 auto", padding:"56px 20px 24px" }}>
          <h2 style={{ fontFamily:serif, fontWeight:400, fontSize:"clamp(28px, 5vw, 40px)", letterSpacing:-0.8, color:T.black, textAlign:"center", margin:"0 0 28px" }}>Sample. Wear. Repeat.</h2>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(230px, 1fr))", gap:14 }}>
            {STEPS.map(st => (
              <div key={st.n} style={{ background:T.white, border:`1px solid ${T.rule}`, borderRadius:20, padding:"22px 20px" }}>
                <p style={{ fontSize:11, fontWeight:600, letterSpacing:"0.16em", textTransform:"uppercase", color:st.c, margin:"0 0 10px" }}>{st.n}</p>
                <p style={{ fontFamily:serif, fontSize:22, lineHeight:1.2, color:T.black, margin:"0 0 8px" }}>{st.h}</p>
                <p style={{ fontSize:14, color:T.mid, lineHeight:1.65, margin:0 }}>{st.b}</p>
              </div>
            ))}
          </div>
        </section>

        <section style={{ maxWidth:640, margin:"0 auto", padding:"40px 20px 56px", textAlign:"center" }}>
          <p style={{ fontFamily:serif, fontSize:"clamp(26px, 5vw, 36px)", letterSpacing:-0.6, color:T.black, margin:"0 0 8px" }}>Be one of the first in.</p>
          <p style={{ fontSize:15, color:T.mid, lineHeight:1.65, margin:"0 0 22px" }}>Early members help shape what Memoir on Skin becomes.</p>
          <button onClick={goForm} style={{ ...ctaBtn(true), maxWidth:320 }}>Join the beta list</button>
        </section>
      </main>
      <div style={{ maxWidth:640, margin:"0 auto", padding:"0 20px 40px" }}><FooterLinks/></div>
    </div>
  );
}

// ─── LOADING SCREEN ───────────────────────────────────────────────────────────
function LoadingScreen() {
  return (
    <div style={{ minHeight:"100svh", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:sans }}>
      <div role="status" aria-label="Loading" style={{ textAlign:"center" }}>
        <div className="mos-spin" style={{ width:34, height:34, borderRadius:"50%", border:`2px solid ${T.rule}`, borderTopColor:T.black, margin:"0 auto", animationDuration:"0.9s" }}/>
        <div style={{ marginTop:18 }}><Wordmark size={22}/></div>
      </div>
    </div>
  );
}

// ─── BLACK FRIDAY GUIDE ───────────────────────────────────────────────────────
// Shown in two places: Learn > Black Friday (members) and the public page memoironskin.com/black-friday (no account).
// Every offer was checked against the brand's own page. To add or change one, edit BF_OFFERS and BF_CHECKED below.
const BF_URL = "https://www.memoironskin.com/black-friday";
const BF_CHECKED = "Nov 23, 2026";
const BF_TAB_UNTIL = new Date("2026-12-04T00:00:00-05:00").getTime();
const BF_OFFERS = [
  {
    id:"xtrait", via:"Their website", name:"Xtrait Perfumery", kind:"Independent boutique, West Hartford, Connecticut",
    deal:"Up to 20% off",
    terms:"10% off anything. 15% off orders over $100. 20% off orders over $200. It applies at checkout and needs no code.",
    sample:"Sells 1.5 mL samples. The discount covers samples, and they count toward your order total.",
    caution:"A few houses are excluded or capped at a lower tier, and their page lists them two different ways. Check before you build a cart.",
    starts:"2026-11-27T00:00:00-05:00", ends:"2026-11-30T23:59:59-05:00", dates:"Nov 27 to Nov 30", startsLabel:"Nov 27", code:"No code needed",
    url:"https://xtraitperfumery.com/pages/black-friday"
  },
  {
    id:"wyldnotes", via:"Their website", name:"Wyld Notes", kind:"Fragrance house",
    deal:"20% off select fragrances",
    terms:"Also 20% off the Discovery Set, and up to $40 off sets and duos.",
    sample:"The Discovery Set holds five 1.5 mL samples, one of each scent.",
    caution:"Select items only. Discovery Sets are not returnable.",
    starts:null, ends:"2026-11-30T23:59:59-05:00", dates:"Through Nov 30", startsLabel:"", code:"See their page",
    url:"https://wyldnotes.com/"
  },
  {
    id:"allyours", via:"Their website", name:"All Yours", kind:"Niche perfume retailer, prices in euros",
    deal:"Sale prices on selected niche perfumes",
    terms:"Their page shows reduced prices rather than a percentage, and lists no code.",
    sample:null,
    caution:"The delivery times on their page are for Spain. Check shipping to your country before you order.",
    starts:"2026-11-24T00:00:00+01:00", ends:"2026-11-30T23:59:59+01:00", dates:"Nov 24 to Nov 30", startsLabel:"Nov 24", code:"No code listed",
    url:"https://www.allyours.com/en/pages/black-friday-perfumes-nicho"
  },
  {
    id:"skylar", via:"Their website", name:"Skylar", kind:"Fragrance house",
    deal:"25% off sitewide",
    terms:"Use the code at checkout.",
    sample:null, caution:null,
    starts:null, ends:null, dates:"End date not listed on their page", startsLabel:"", code:"BFCM26",
    url:"https://skylar.com/"
  },
  {
    id:"bluemercury", via:"Their website", name:"Bluemercury", kind:"Retailer with niche and designer shelves",
    deal:"Up to 30% off almost everything",
    terms:"That is the headline on their site. Tiers, dates and exclusions are on their Black Friday fragrance page.",
    sample:null, caution:null,
    starts:null, ends:null, dates:"Dates not confirmed", startsLabel:"", code:"See their page",
    url:"https://bluemercury.com/pages/shop-black-friday-fragrance"
  },
  {
    id:"thirdeye", via:"Their Instagram post, Nov 23", name:"Third Eye Fragrance Co", kind:"Fragrance house, Orlando, Florida",
    deal:"20% off store wide",
    terms:"Applied automatically at checkout. Their post marks it with an asterisk, so read the terms on their site.",
    sample:null, caution:null,
    starts:null, ends:"2026-11-30T08:00:00-05:00", dates:"Through Nov 30, 8am ET", startsLabel:"", code:"No code needed",
    url:"https://www.thirdeyefragranceco.com/"
  },
  {
    id:"ath", via:"Their Instagram post", name:"Aaron Terence Hughes", kind:"Independent British perfume house",
    deal:"20% off everything",
    terms:"Unicorn Weekend. It covers the UK and the US, all weekend or until sold out.",
    sample:null, caution:"Their post gives no end time. When a scent sells out, it is gone.",
    starts:"2026-11-27T00:00:00-05:00", ends:null, dates:"From Nov 27, all weekend", startsLabel:"Nov 27", code:"Not listed",
    url:"https://aaronterencehughes.co.uk/"
  },
  {
    id:"bgj", via:"Their Instagram post", name:"Brown Girl Jane", kind:"Black-owned fragrance house",
    deal:"Up to 30% off",
    terms:"Their post says up to 30% off during their Black Friday sale. Dates are not in the post.",
    sample:null, caution:null, check:true,
    starts:null, ends:null, dates:"Dates not in their post", startsLabel:"", code:"Not listed",
    url:"https://browngirljane.com/"
  },
  {
    id:"elysian", via:"Their Instagram post", name:"Elysian Parfums", kind:"Indie fragrance house",
    deal:"25% off six fragrances",
    terms:"The Vault: Sucre de Soie, Sombre Douceur, Jalous, Cafe Avellana, Charmante and Black Gardenia at 25% off before they are locked away. Orders of $250 or more get a surprise 10 mL.",
    sample:null, caution:"Early access is through the sign-up link in their Instagram bio.",
    starts:"2026-11-27T00:00:00-05:00", ends:"2026-11-30T23:59:59-05:00", dates:"Nov 27 to Nov 30", startsLabel:"Nov 27", code:"Early access list",
    url:"https://www.instagram.com/elysianparfums/", cta:"Open Elysian on Instagram"
  },
  {
    id:"hiramgreen", via:"His Instagram post", name:"Hiram Green", kind:"Independent natural perfumer, the Netherlands",
    deal:"20% off all 50 mL fragrances",
    terms:"He runs this once a year. Every 50 mL also comes with two complimentary add-ons, listed in his post.",
    sample:null, caution:"The code comes when you sign up for his newsletter at hiramgreen.com.",
    starts:"2026-11-27T00:00:00+01:00", ends:"2026-11-30T23:59:59+01:00", dates:"Nov 27 to Nov 30", startsLabel:"Nov 27", code:"Newsletter sign-up",
    url:"https://hiramgreen.com/"
  },
  {
    id:"anjali", via:"Her Instagram post", name:"Anjali Perfumes", kind:"Woman-owned independent house, Bainbridge Island, Washington",
    deal:"30% off, free shipping",
    terms:"No code needed. She runs one sale a year.",
    sample:"During the sale only the Discovery Set of All Samples is available. The sets of 5, 7 and 9 samples are not.",
    caution:"No complimentary sample comes with a bottle during the sale, and Starlight Sesame is excluded.",
    starts:"2026-11-27T09:00:00-08:00", ends:"2026-11-30T23:59:00-08:00", dates:"Nov 27 to Nov 30", startsLabel:"Nov 27, 9am PT", code:"No code needed",
    url:"https://anjaliperfumes.com/"
  },
  {
    id:"leier", via:"Their Instagram post, Nov 23", name:"LEIƏR", kind:"Black-owned independent fragrance house",
    deal:"20% off sitewide, 15% off bundles",
    terms:"Their Cyber Week sale. No code needed.",
    sample:null, caution:null,
    starts:"2026-11-23T00:00:00-05:00", ends:"2026-11-30T23:59:59-05:00", dates:"Nov 23 to Nov 30", startsLabel:"Nov 23", code:"No code needed",
    url:"https://leierfragrances.com/"
  },
  {
    id:"atwood", via:"Their Instagram story, Nov 23", name:"Atwood Parfum", kind:"Fragrance house, Provincetown, Massachusetts",
    deal:"Buy a 30 mL, get any 10 mL free",
    terms:"Add both to your cart. Their story says it runs now through November 30.",
    sample:"Each 30 mL bottle comes with a sample vial of the same scent, and you can return the unopened bottle within 14 days if the sample is not for you.",
    caution:null,
    starts:null, ends:"2026-11-30T23:59:59-05:00", dates:"Now through Nov 30", startsLabel:"", code:"No code needed",
    url:"https://atwoodparfum.com/"
  },
  {
    id:"zernell", via:"Their Instagram story, Nov 23", name:"Zernell Gillie", kind:"Fragrance house, music-inspired collection",
    deal:"Up to 20% off",
    terms:"Their story says they don't usually run sales. Dates are not in the story.",
    sample:null, caution:null, check:true,
    starts:null, ends:null, dates:"Dates not in their story", startsLabel:"", code:"Not listed",
    url:"https://zernellgillie.com/"
  },
  {
    id:"dedcool", via:"Their website and Instagram ad", name:"DedCool", kind:"Fragrance house, Los Angeles",
    deal:"Up to 30% off",
    terms:"Their site banner says the sale starts now and lists 30% off select items. Dates are not on the page.",
    sample:"Their site also lists 20% off a first full-size fragrance when you buy a sample tin.",
    caution:"Exclusions apply, and the eligible items are not spelled out.",
    check:true,
    starts:null, ends:null, dates:"Dates not listed", startsLabel:"", code:"No code listed",
    url:"https://www.dedcool.com/"
  },
  {
    id:"kismet", via:"Their Instagram story", name:"Kismet Olfactive", kind:"Fragrance house, New York",
    deal:"Up to $90 off",
    terms:"Their story calls it a Black Friday special. The offer details sit behind the See offer link.",
    sample:null, caution:null, check:true,
    starts:null, ends:null, dates:"Dates not in their story", startsLabel:"", code:"Not listed",
    url:"https://www.instagram.com/kismet.olfactive/", cta:"Open Kismet Olfactive on Instagram"
  },
  {
    id:"glossier", via:"Their Instagram story", name:"Glossier", kind:"Beauty brand with a fragrance line",
    deal:"25% off everything, 30% off orders of $100 or more",
    terms:"Their story says terms and exclusions apply. Dates are not in the story.",
    sample:null, caution:"Check whether the fragrance you want is included before you buy.", check:true,
    starts:null, ends:null, dates:"Dates not in their story", startsLabel:"", code:"Not listed",
    url:"https://www.glossier.com/"
  },
  {
    id:"maisonfide", via:"Their Instagram post, Nov 23", name:"Maison Fidé", kind:"Fragrance house",
    deal:"20% off full-size Thé à Casablanca (100 mL)",
    terms:"Their Black Friday Ritual Week. The post also points to the new Vanille de Malagasy coffret set.",
    sample:null, caution:"The code applies to the full-size Thé à Casablanca only.", check:true,
    starts:null, ends:null, dates:"Ritual Week, end date not in their post", startsLabel:"", code:"MF20",
    url:"https://www.instagram.com/maisonfide/", cta:"Open Maison Fidé on Instagram"
  },
  {
    id:"houseofbo", via:"Their Instagram story", name:"House of BO", kind:"Fragrance brand",
    deal:"25% off everything, or 30% off 3 or more items",
    terms:"Their story says it runs while stock lasts. Dates are not in the story.",
    sample:null, caution:null, check:true,
    starts:null, ends:null, dates:"While stock lasts", startsLabel:"", code:"Not listed",
    url:"https://www.instagram.com/houseofbo.co/", cta:"Open House of BO on Instagram"
  },
  {
    id:"influxious", via:"Their holiday calendar post", name:"Influxious", kind:"Fragrance house",
    deal:"20% off full-size bottles",
    terms:"Their Black Friday to Cyber Monday sale, on influxious.co. Their calendar shows it starting Nov 24 and ending Nov 30.",
    sample:null, caution:null,
    starts:"2026-11-24T00:00:00-05:00", ends:"2026-11-30T23:59:59-05:00", dates:"Nov 24 to Nov 30", startsLabel:"Nov 24", code:"No code listed",
    url:"https://influxious.co/"
  },
  {
    id:"kaori", via:"Their Instagram post", name:"Cult of Kaori", kind:"Fragrance house",
    deal:"25% off sitewide",
    terms:"Their one online sale of the year. No code needed, it applies at checkout. Wednesday Nov 25 through Cyber Monday.",
    sample:null, caution:null,
    starts:"2026-11-25T00:00:00-05:00", ends:"2026-11-30T23:59:59-05:00", dates:"Nov 25 to Nov 30", startsLabel:"Nov 25", code:"No code needed",
    url:"https://www.instagram.com/cult_of_kaori/", cta:"Open Cult of Kaori on Instagram"
  },
  {
    id:"harlem", via:"Their Instagram post", name:"Harlem Perfume Co.", kind:"Fragrance house",
    deal:"20% off sitewide",
    terms:"They call it their biggest sale of the year.",
    sample:null, caution:null,
    starts:"2026-11-27T00:00:00-05:00", ends:"2026-11-30T23:59:59-05:00", dates:"Nov 27 to Nov 30", startsLabel:"Nov 27", code:"No code listed",
    url:"https://www.instagram.com/harlemperfumeco/", cta:"Open Harlem Perfume Co. on Instagram"
  },
  {
    id:"maher", via:"Their Instagram story", name:"Maher Olfactive", kind:"Fragrance house",
    deal:"10% off $100, 20% off $200, 30% off $300",
    terms:"Their Holiday Sale, with the discount rising as the order grows. It runs through December 6.",
    sample:null, caution:null,
    starts:null, ends:"2026-12-06T23:59:59-05:00", dates:"Now through Dec 6", startsLabel:"", code:"No code listed",
    url:"https://www.instagram.com/maherolfactive/", cta:"Open Maher Olfactive on Instagram"
  },
  {
    id:"mitti", via:"Their email and Instagram story", name:"Mitti Parfum", kind:"Fragrance house",
    deal:"Sets with free extras, and free shipping",
    terms:"Pick three full-size bottles and they fill the rest of the box. Every set comes with extras, and the bigger the set, the more goes in. No code needed. Their story says it happens once a year.",
    sample:null, caution:null, check:true,
    starts:null, ends:null, dates:"Live since Nov 22, end date not listed", startsLabel:"", code:"No code needed",
    url:"https://mittiparfum.com/"
  },
  {
    id:"neandertal", via:"Their Instagram story", name:"Neandertal", kind:"Fragrance house",
    deal:"15% off",
    terms:"Their Black Friday sale. Dates are not in the story.",
    sample:null, caution:null, check:true,
    starts:null, ends:null, dates:"Dates not in their story", startsLabel:"", code:"NBF15",
    url:"https://www.instagram.com/neandertalperfume/", cta:"Open Neandertal on Instagram"
  },
  {
    id:"liberation", via:"Their Instagram post", name:"Liberation of Flowers", kind:"Fragrance house",
    deal:"Free shipping and burning papers with every 50 mL",
    terms:"Their post says this runs all week. It is a gift with purchase, not a discount.",
    sample:null, caution:null, check:true,
    starts:null, ends:null, dates:"All week, per their post", startsLabel:"", code:"No code listed",
    url:"https://liberationofflowers.com/"
  },
  {
    id:"kioku", via:"Their website and Instagram story", name:"KI-OKU", kind:"Fragrance house, Los Angeles",
    deal:"Holiday Sale, early access list",
    terms:"Their page counts down to 11.27.2026 and invites you to join for early access. The discount and early access details are not posted yet.",
    sample:null, caution:null, check:true,
    starts:"2026-11-27T00:00:00-08:00", ends:null, dates:"Starts Nov 27, end date not listed", startsLabel:"Nov 27", code:"Early access list",
    url:"https://ki-oku.com/pages/black-friday-cyber-monday", cta:"Go to KI-OKU's sale page"
  },
  {
    id:"elorea", via:"Their website and Instagram story", name:"Elorea", kind:"Modern Korean perfumery, stores in New York, Los Angeles and Seoul",
    deal:"20% off sitewide",
    terms:"Their story calls it their biggest sale of the year, in stores and online. Dates are not listed.",
    sample:null, caution:null, check:true,
    starts:null, ends:null, dates:"Dates not listed", startsLabel:"", code:"No code listed",
    url:"https://elorea.com/collections/eau-de-parfum"
  },
  {
    id:"cirrus", via:"Their Instagram reel", name:"Cirrus Parfum", kind:"Fragrance house, San Antonio, Texas",
    deal:"20% off sitewide",
    terms:"Their reel calls it Black Friday coming early. No code is mentioned.",
    sample:"Their site offers a customizable six-piece discovery set where you pick any 6 fragrances. Their site does not say whether the sale applies to it.",
    caution:null,
    starts:"2026-11-23T00:00:00-06:00", ends:"2026-11-30T23:59:59-06:00", dates:"Nov 23 to Nov 30", startsLabel:"Nov 23", code:"No code listed",
    url:"https://cirrusparfum.com/"
  },
  {
    id:"lepoque", via:"Their Instagram post and email", name:"L'Epoque Parfums", kind:"Fragrance house",
    deal:"20% off sitewide, 25% off two or more fragrances",
    terms:"Early access for their email list. Their post says you get the code as soon as you enter your email on their site. Free shipping on orders of $125 or more. The code cannot be combined with other discounts.",
    sample:"Their Discovery Set lets you try before committing to a full-size parfum.",
    caution:"Their email says the early access code is for subscribers until Nov 26. Check their site for what follows.", check:true,
    starts:null, ends:null, dates:"Early access, end date not in their post", startsLabel:"", code:"Enter your email on their site",
    url:"https://www.instagram.com/lepoqueparfums/", cta:"Open L'Epoque on Instagram"
  },
  {
    id:"carner", via:"Their Instagram post", name:"Carner Barcelona", kind:"Fragrance house, Barcelona",
    deal:"Free travel set of 3 x 10 mL with a perfume order",
    terms:"Their Black Week. Order a perfume and choose the three 10 mL fragrances for your set. Their post says it is only this week.",
    sample:"The gift is a set of three 10 mL fragrances you choose, a way to try more of the house.",
    caution:null, check:true,
    starts:null, ends:null, dates:"This week, per their post", startsLabel:"", code:"No code listed",
    url:"https://carnerbarcelona.com/"
  },
  {
    id:"brandt", via:"Their Instagram story", name:"House of Brandt", kind:"Fragrance brand",
    deal:"Black Friday offers by invitation",
    terms:"Their page says they will not announce the offers anywhere else. They go only to people on their list, and you sign up with your name, email and phone number.",
    sample:null, caution:null, check:true,
    starts:null, ends:null, dates:"Dates not listed", startsLabel:"", code:"Join their list",
    url:"https://houseofbrandt.com/"
  },
  {
    id:"dusita", via:"Their Instagram post", name:"Dusita", kind:"Fragrance house, Paris",
    deal:"Free gift-filled holiday box with a 50 mL or a 3 x 15 mL coffret",
    terms:"The box holds a 15 mL eau de parfum of your choice, seven 2.5 mL samples, a Mocha Absolu Discovery Kit, a holiday card and a EUR 35 voucher. Orders of a 50 mL extrait or a 100 mL eau de parfum get two 15 mL instead of one. Valid until Nov 30.",
    sample:"Seven 2.5 mL samples and a Mocha Absolu Discovery Kit come in the box.",
    caution:"The EUR 35 voucher is valid Jan 11 to Mar 15, 2027, on orders of EUR 150 or more.",
    starts:null, ends:"2026-11-30T23:59:59+01:00", dates:"Now through Nov 30", startsLabel:"", code:"No code listed",
    url:"https://www.instagram.com/parfumsdusita/", cta:"Open Dusita on Instagram"
  },
  {
    id:"maisondetto", via:"Their Instagram ad", name:"Maison d'Etto", kind:"Fragrance house",
    deal:"Discovery Set credit doubled, from $50 to $100",
    terms:"Every Discovery Set comes with a credit toward a full-size bottle, and this holiday season they have doubled it. Their post says it is their Black Friday offer. Dates are not listed.",
    sample:"The Discovery Set holds all nine fragrances in 2.5 mL sprays, so you can give each a full day on your skin before you choose one.",
    caution:null, check:true,
    starts:null, ends:null, dates:"Dates not listed", startsLabel:"", code:"No code listed",
    url:"https://www.instagram.com/maisondetto/", cta:"Open Maison d'Etto on Instagram"
  },
  {
    id:"gabar", via:"Their Instagram post and story", name:"Gabar", kind:"Fragrance house",
    deal:"20% off sitewide",
    terms:"They call it their only sitewide sale of the year. Their post says it ends Nov 30 at midnight GMT.",
    sample:null,
    caution:"Limited stock. Their post said 01 Float is US orders only, and 04 Rise and the 02 Ground candle were sold out. They point to their other stockists for what is available now.",
    starts:null, ends:"2026-11-30T23:59:59+00:00", dates:"Now through Nov 30, midnight GMT", startsLabel:"", code:"No code listed",
    url:"https://gabarworld.com/"
  },
  {
    id:"scenttrunk", via:"Their Instagram post", name:"Scent Trunk", kind:"Fragrance house",
    deal:"30% off all fragrances",
    terms:"Their Black Friday post, shared with the Whisper of Melancholy collection. The link to shop is in their bio. Dates are not in the post.",
    sample:null, caution:null, check:true,
    starts:null, ends:null, dates:"Dates not in their post", startsLabel:"", code:"No code listed",
    url:"https://www.instagram.com/scenttrunk/", cta:"Open Scent Trunk on Instagram"
  },
  {
    id:"fyaf", via:"Their Instagram post", name:"Free Yourself and Flourish", kind:"Fragrance brand",
    deal:"Free 15 mL with a full-size bottle",
    terms:"Buy a full-size fragrance from the Elements Collection and get a free 15 mL travel size of the same scent. Buy one from the Mindful Collection and get a free 15 mL refill of the same scent. Black Friday through Cyber Monday, while supplies last.",
    sample:null, caution:null,
    starts:"2026-11-27T00:00:00-05:00", ends:"2026-11-30T23:59:59-05:00", dates:"Nov 27 to Nov 30", startsLabel:"Nov 27", code:"No code listed",
    url:"https://www.instagram.com/freeyourselfandflourish/", cta:"Open Free Yourself and Flourish on Instagram"
  },
  {
    id:"bsb", via:"Their Instagram post", name:"Brown Sugar Babe", kind:"Fragrance brand",
    deal:"35% off Black Friday, 10% off Saturday and Monday",
    terms:"Black Friday (Nov 27) 35% off. Small Business Saturday (Nov 28) 10% off. Cyber Monday (Nov 30) 10% off plus free shipping. Excludes the Advent Calendar. Terms and conditions apply.",
    sample:null, caution:null,
    starts:"2026-11-27T00:00:00-05:00", ends:"2026-11-30T23:59:59-05:00", dates:"Nov 27 to Nov 30", startsLabel:"Nov 27", code:"No code listed",
    url:"https://www.instagram.com/brownsugarbabeofficial/", cta:"Open Brown Sugar Babe on Instagram"
  },
  {
    id:"andreamaack", via:"Their Instagram post", name:"Andrea Maack", kind:"Fragrance house",
    deal:"30% off sitewide",
    terms:"They call it their biggest sale of the year. Dates are not in the post image.",
    sample:null, caution:null, check:true,
    starts:null, ends:null, dates:"Dates not in their post", startsLabel:"", code:"No code listed",
    url:"https://www.instagram.com/andreamaack/", cta:"Open Andrea Maack on Instagram"
  },
  {
    id:"nemat", via:"Their Instagram post", name:"Nemat", kind:"Artisan perfumery",
    deal:"25% off sitewide",
    terms:"Their post says the Black Friday sale is live and calls it their biggest sale of the year. Dates are not in the post image.",
    sample:null, caution:null, check:true,
    starts:null, ends:null, dates:"Dates not in their post", startsLabel:"", code:"No code listed",
    url:"https://www.instagram.com/nematperfumes/", cta:"Open Nemat on Instagram"
  },
  {
    id:"stateofmind", via:"Their Instagram post", name:"State of Mind", kind:"Fragrance house, Versailles",
    deal:"20% off perfumes and the Home Collection",
    terms:"Offers start Nov 24 on their website, and their caption says it runs until Dec 5. They say it is available only once a year.",
    sample:null, caution:null,
    starts:"2026-11-24T00:00:00+01:00", ends:"2026-12-05T23:59:59+01:00", dates:"Nov 24 to Dec 5", startsLabel:"Nov 24", code:"No code listed",
    url:"https://www.instagram.com/stateofmind.fr/", cta:"Open State of Mind on Instagram"
  },
  {
    id:"jscent", via:"Their Instagram post", name:"J-Scent", kind:"Fragrance house",
    deal:"10% off storewide",
    terms:"Their post says Nov 27 to Nov 30.",
    sample:null, caution:"Shipping is within the United States only.",
    starts:"2026-11-27T00:00:00-05:00", ends:"2026-11-30T23:59:59-05:00", dates:"Nov 27 to Nov 30", startsLabel:"Nov 27", code:"No code listed",
    url:"https://www.instagram.com/jscent_fragrance/", cta:"Open J-Scent on Instagram"
  },
  {
    id:"heretic", via:"Their Instagram post", name:"Heretic Parfum", kind:"Fragrance house",
    deal:"30% off sitewide",
    terms:"Their post says limited time only. Dates are not in the post image.",
    sample:null, caution:null, check:true,
    starts:null, ends:null, dates:"Limited time, dates not listed", startsLabel:"", code:"GOTHIC30",
    url:"https://www.instagram.com/hereticparfum/", cta:"Open Heretic on Instagram"
  },
  {
    id:"histoires", via:"Their website and Instagram story", name:"Histoires de Parfums", kind:"Fragrance house",
    deal:"20% off up to $299, 30% off from $300",
    terms:"Early access for their email list. Sign up with your email, and on Thursday Nov 26 at 10am ET you get an email that your access is open. Log in with the same address and the discount applies in your cart. It runs until Monday Nov 30 at midnight ET.",
    sample:null, caution:null,
    starts:"2026-11-26T10:00:00-05:00", ends:"2026-11-30T23:59:59-05:00", dates:"Nov 26 to Nov 30", startsLabel:"Nov 26, 10am ET", code:"Sign up for early access",
    url:"https://usa.histoiresdeparfums.com/"
  },
  {
    id:"mataha", via:"Their Instagram story", name:"Maison Mataha", kind:"Fragrance house, Paris",
    deal:"Free discovery set and free worldwide shipping with every order",
    terms:"Their story calls it an invitation to discover the house. Dates are not in the story.",
    sample:"A complimentary discovery set comes with every order.",
    caution:null, check:true,
    starts:null, ends:null, dates:"Dates not in their story", startsLabel:"", code:"No code listed",
    url:"https://www.instagram.com/maisonmataha/", cta:"Open Maison Mataha on Instagram"
  },
  {
    id:"imaginary", via:"Their Instagram post", name:"Imaginary Authors", kind:"Fragrance house",
    deal:"Free limited fragrance with $100 spend",
    terms:"Spend $100 on their website and receive their newest, exclusive and extremely limited fragrance, Longing For Light. Dates are not in the post.",
    sample:null, caution:null, check:true,
    starts:null, ends:null, dates:"Dates not in their post", startsLabel:"", code:"No code listed",
    url:"https://www.instagram.com/imaginaryauthors/", cta:"Open Imaginary Authors on Instagram"
  },
  {
    id:"granado", via:"Their Instagram post", name:"Granado", kind:"Fragrance house, Rio de Janeiro",
    deal:"50% off",
    terms:"Their Black Friday post, shown with the Rosa Sublime fragrance, says 50% off on the website, app and stores. Dates are not in the post.",
    sample:null, caution:"The post does not say whether the 50% covers the whole range or only the featured fragrance. Check their page.", check:true,
    starts:null, ends:null, dates:"Dates not in their post", startsLabel:"", code:"No code listed",
    url:"https://www.instagram.com/granado/", cta:"Open Granado on Instagram"
  },
  {
    id:"xinu", via:"Their Instagram story", name:"Xinu", kind:"Fragrance and home scent house",
    deal:"Free shipping this week only",
    terms:"Their story says complimentary shipping, this week only. It is shipping, not a discount.",
    sample:null, caution:null, check:true,
    starts:null, ends:null, dates:"This week, per their story", startsLabel:"", code:"No code listed",
    url:"https://xinuperfumes.com/"
  },
  {
    id:"reinvented", via:"Their Instagram story", name:"Reinvented Parfums", kind:"Fragrance house",
    deal:"A limited 48-hour sale, early access for subscribers",
    terms:"Their story says to subscribe for early access, and that terms and conditions apply. The discount and the dates are not in the story.",
    sample:null, caution:null, check:true,
    starts:null, ends:null, dates:"Dates not in their story", startsLabel:"", code:"Subscribe for early access",
    url:"https://www.instagram.com/reinventedparfums/", cta:"Open Reinvented Parfums on Instagram"
  },
];
function bfStatus(o, now) {
  if (o.ends && now > new Date(o.ends).getTime()) return "ended";
  if (o.starts && now < new Date(o.starts).getTime()) return "soon";
  if (o.check) return "check";
  return "live";
}

function BetaSignupCard({ heading = "Join the beta list", note = "Just your first name and email. No password, no payment." }) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const okEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
  async function submit() {
    if (!name.trim()) { setError("Please add your first name."); return; }
    if (!okEmail(email)) { setError("Please enter a valid email address."); return; }
    setError(""); setLoading(true);
    const r = await supabase.rpc("join_waitlist", { p_email: email.trim(), p_name: name.trim(), p_src: getSrc() || "blackfriday" });
    setLoading(false);
    if (r.error) { setError("That didn't go through. Try again in a moment."); return; }
    setDone(true);
  }
  const inp = { ...FIELD, minHeight:52 };
  return (
    <div id="bf-join" style={{ background:T.white, border:`1px solid ${T.rule}`, borderRadius:22, padding:"22px 20px", textAlign:"left" }}>
      {!done ? (<>
        <p style={{ fontFamily:serif, fontSize:22, color:T.black, margin:"0 0 4px" }}>{heading}</p>
        <p style={{ fontSize:13, color:T.mid, lineHeight:1.6, margin:"0 0 16px" }}>{note}</p>
        <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:12 }}>
          <input value={name} onChange={e => { setName(e.target.value); setError(""); }} placeholder="First name" autoComplete="given-name" style={inp} onKeyDown={e => e.key === "Enter" && submit()}/>
          <input value={email} onChange={e => { setEmail(e.target.value); setError(""); }} placeholder="Email address" type="email" autoComplete="email" style={inp} onKeyDown={e => e.key === "Enter" && submit()}/>
        </div>
        {error && <p role="alert" style={{ fontSize:13, color:T.bad, margin:"0 0 10px" }}>{error}</p>}
        <button onClick={submit} disabled={loading} style={ctaBtn(!loading)}>{loading ? "Joining…" : "Save my spot"}</button>
        <p style={{ fontSize:12, color:T.faint, lineHeight:1.6, margin:"12px 0 0", textAlign:"center" }}>One email when your spot opens. Nothing else, and we never share it.</p>
      </>) : (
        <div style={{ textAlign:"center", padding:"8px 0" }}>
          <div style={{ width:52, height:52, borderRadius:"50%", background:"var(--accent)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 14px" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <p style={{ fontFamily:serif, fontSize:24, color:T.black, margin:"0 0 6px" }}>You're on the list, {name.trim()}.</p>
          <p style={{ fontSize:14, color:T.mid, lineHeight:1.65, margin:0 }}>We will write to <strong style={{ color:T.black, fontWeight:500 }}>{email.trim()}</strong> when your spot opens. The sales below are yours to look through in the meantime.</p>
        </div>
      )}
    </div>
  );
}

function BlackFridayGuide({ embedded = false }) {
  const [now] = useState(() => Date.now());
  const [copied, setCopied] = useState(false);
  const rank = { live:0, check:1, soon:2, ended:3 };
  const list = BF_OFFERS.map((o, i) => ({ o, i, st:bfStatus(o, now) })).sort((a, b) => (rank[a.st] - rank[b.st]) || (a.i - b.i));
  async function shareIt() {
    try { if (navigator.share) { await navigator.share({ title:"Black Friday sales, sample first", url:BF_URL }); return; } } catch (e) { if (e && e.name === "AbortError") return; }
    try { await navigator.clipboard.writeText(BF_URL); setCopied(true); setTimeout(() => setCopied(false), 2200); } catch (e) {}
  }
  const chip = st => st === "live"
    ? { label:"On now", color:"var(--teal)", bg:"var(--tint-teal)" }
    : st === "soon" ? { label:"Starts soon", color:"var(--violet)", bg:"var(--tint-violet)" }
    : st === "check" ? { label:"Check dates", color:T.mid, bg:T.lift }
    : { label:"Ended", color:T.faint, bg:T.lift };
  return (
    <div>
      <div style={{ textAlign:embedded ? "left" : "center", margin:embedded ? "0 0 22px" : "0 0 26px" }}>
        <p style={{ display:"inline-block", fontSize:11, fontWeight:600, letterSpacing:"0.16em", textTransform:"uppercase", color:"var(--accent)", background:T.lift, border:`1px solid ${T.rule}`, borderRadius:20, padding:"6px 14px", margin:"0 0 18px" }}>Black Friday 2026</p>
        <h1 style={{ fontFamily:serif, fontWeight:400, fontSize:"clamp(38px, 8vw, 60px)", lineHeight:1.05, letterSpacing:-1.2, color:T.black, margin:"0 0 14px" }}>Black Friday, sample first.</h1>
        <p style={{ fontSize:"clamp(15px, 2.2vw, 18px)", lineHeight:1.65, color:T.mid, margin:embedded ? "0 0 4px" : "0 auto", maxWidth:520 }}>Niche &amp; indie sales worth a look, each with a link straight to the brand. A discount only helps on a scent you like, so we note where you can try a sample first.</p>
      </div>

      {!embedded && <div style={{ margin:"0 0 30px" }}><BetaSignupCard heading="Join the beta list first" note="Memoir on Skin is where you sample, wear and keep your scents. Just your first name and email. No password, no payment."/></div>}

      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:12, flexWrap:"wrap", margin:"0 0 14px" }}>
        <p style={{ fontSize:12, color:T.mid, margin:0 }}>Checked against each brand's own page or post on {BF_CHECKED}.</p>
        <button onClick={shareIt} style={{ ...ghostBtn, minHeight:40, padding:"0 16px", fontSize:13 }}>{copied ? "Link copied" : "Share this page"}</button>
      </div>

      <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
        {list.map(({ o, st }) => {
          const c = chip(st);
          const ended = st === "ended";
          return (
            <article key={o.id} style={{ background:T.white, border:`1px solid ${T.rule}`, borderRadius:20, padding:"20px 18px", opacity:ended ? 0.7 : 1 }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:10, margin:"0 0 10px", flexWrap:"wrap" }}>
                <span style={{ fontSize:11, fontWeight:600, letterSpacing:"0.12em", textTransform:"uppercase", color:c.color, background:c.bg, borderRadius:20, padding:"5px 12px" }}>{st === "soon" && o.startsLabel ? `Starts ${o.startsLabel}` : c.label}</span>
                <span style={{ fontSize:12, color:T.mid }}>{o.dates}</span>
              </div>
              <h2 style={{ fontFamily:serif, fontWeight:400, fontSize:28, letterSpacing:-0.5, color:T.black, margin:"0 0 2px" }}>{o.name}</h2>
              <p style={{ fontSize:13, color:T.mid, margin:"0 0 12px" }}>{o.kind}</p>
              <p style={{ fontFamily:serif, fontSize:22, lineHeight:1.25, color:T.black, margin:"0 0 6px" }}>{o.deal}</p>
              <p style={{ fontSize:14, color:T.mid, lineHeight:1.65, margin:"0 0 12px" }}>{o.terms}</p>
              <p style={{ fontSize:12, color:T.faint, margin:"0 0 12px" }}>Source: {o.via}</p>
              {o.sample && (
                <p style={{ fontSize:14, color:T.ink, lineHeight:1.65, margin:"0 0 12px", paddingLeft:12, borderLeft:"3px solid var(--teal)" }}><strong style={{ fontWeight:600, color:"var(--teal)" }}>Try it first. </strong>{o.sample}</p>
              )}
              {o.caution && <p style={{ fontSize:13, color:T.mid, lineHeight:1.6, margin:"0 0 12px" }}>{o.caution}</p>}
              <div style={{ display:"flex", alignItems:"center", gap:12, flexWrap:"wrap", margin:"14px 0 0" }}>
                <a href={o.url} target="_blank" rel="noopener noreferrer" style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", minHeight:48, padding:"0 22px", borderRadius:14, background:ended ? T.lift : "var(--accent)", color:ended ? T.mid : "#fff", fontFamily:sans, fontSize:15, fontWeight:600, textDecoration:"none" }}>{o.cta || `Go to ${o.name}`}</a>
                <span style={{ fontSize:12, color:T.mid }}>Code: <strong style={{ color:T.black, fontWeight:600 }}>{o.code}</strong></span>
              </div>
            </article>
          );
        })}
      </div>

      <div style={{ margin:"26px 0 0", padding:"20px 18px", background:T.lift, border:`1px solid ${T.rule}`, borderRadius:20 }}>
        <p style={{ fontFamily:serif, fontSize:20, lineHeight:1.3, color:T.black, margin:"0 0 8px" }}>We are not here to influence you. Trust your own nose.</p>
        <p style={{ fontSize:13, color:T.mid, lineHeight:1.7, margin:"0 0 8px" }}>These are plain links to the brands. There are no affiliate codes on this page, and we earn nothing if you click. Sales change fast, so each brand's own page has the final word on dates, prices and exclusions.</p>
        <p style={{ fontSize:13, color:T.mid, lineHeight:1.7, margin:0 }}>Running a sale, or spotted one we missed? Write to <a href="mailto:team@memoironskin.com" style={{ color:T.black, fontWeight:500 }}>team@memoironskin.com</a>.</p>
      </div>

      {!embedded && (
        <div style={{ textAlign:"center", margin:"34px 0 0" }}>
          <p style={{ fontFamily:serif, fontSize:"clamp(24px, 5vw, 32px)", letterSpacing:-0.5, color:T.black, margin:"0 0 8px" }}>Sample first. Remember always.</p>
          <p style={{ fontSize:15, color:T.mid, lineHeight:1.65, margin:"0 0 18px" }}>Early members help shape what Memoir on Skin becomes.</p>
          <button onClick={() => { try { document.getElementById("bf-join").scrollIntoView({ behavior:"smooth", block:"center" }); } catch (e) {} }} style={{ ...ctaBtn(true), maxWidth:320 }}>Join the beta list</button>
        </div>
      )}
    </div>
  );
}

function BlackFridayPage() {
  // Same rule as the beta page: first-time visitors start on the dark page, and nothing is saved unless they press the toggle.
  useEffect(() => {
    let forced = false;
    if (readThemePref() === "system") { forced = true; themeStore.pref = "dark"; paintTheme("dark"); themeStore.subs.forEach(f => f()); }
    const prev = document.title;
    document.title = "Black Friday sales, sample first | Memoir on Skin";
    return () => {
      document.title = prev;
      if (forced && themeStore.pref === "dark" && readThemePref() === "system") { themeStore.pref = "system"; paintTheme("system"); themeStore.subs.forEach(f => f()); }
    };
  }, []);
  return (
    <div style={{ minHeight:"100svh", fontFamily:sans, color:T.ink }}>
      <header style={{ maxWidth:760, margin:"0 auto", padding:"16px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", gap:12 }}>
        <a href="/" style={{ textDecoration:"none" }}><Logo size={18}/></a>
        <ThemeToggle/>
      </header>
      <main style={{ maxWidth:760, margin:"0 auto", padding:"28px 20px 40px" }}>
        <BlackFridayGuide/>
      </main>
      <div style={{ maxWidth:760, margin:"0 auto", padding:"0 20px 40px" }}><FooterLinks/></div>
    </div>
  );
}

// ─── FOR BRANDS: public submission page (memoironskin.com/brands), no account needed ───
const DIVERSITY_OPTS = ["Black-owned","Asian-owned","South Asian-owned","Latino / Hispanic-owned","Middle Eastern-owned","Indigenous-owned","POC-owned","Woman-owned","LGBTQ+-owned","None of these"];
async function compressPhoto(file, max = 2000, q = 0.9) {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = url; });
    const sc = Math.min(1, max / Math.max(img.width, img.height));
    const c = document.createElement("canvas"); c.width = Math.round(img.width * sc); c.height = Math.round(img.height * sc);
    const x = c.getContext("2d"); x.fillStyle = "#fff"; x.fillRect(0, 0, c.width, c.height); x.drawImage(img, 0, 0, c.width, c.height);
    const blob = await new Promise(r => c.toBlob(r, "image/jpeg", q));
    if (!blob) throw new Error("encode");
    return blob;
  } finally { URL.revokeObjectURL(url); }
}
const newBrandFrag = () => ({ k: Math.random().toString(36).slice(2), name:"", year:"", perfumer:"", concentration:"", family:"", top:"", heart:"", base:"", accords:"", story:"", photo:null });

function BrandSubmitPage() {
  const [c, setC] = useState({ name:"", role:"", email:"" });
  const [h, setH] = useState({ name:"", website:"", country:"", founded:"", founders:"", ownershipStatus:"", parent:"", diversity:[], diversityOther:"", brandType:"", priceTier:"", story:"", kitName:"", kitPrice:"", kitUrl:"", samples:"", travel:"", travelUrl:"", affiliateUrl:"", pressEmail:"", instagram:"", pressKitUrl:"" });
  const [fr, setFr] = useState([newBrandFrag()]);
  const [auth1, setAuth1] = useState(false);
  const [auth2, setAuth2] = useState(false);
  const [trap, setTrap] = useState("");
  const [busy, setBusy] = useState("");
  const [err, setErr] = useState("");
  const [done, setDone] = useState(false);
  const setHF = (k, v) => setH(p => ({ ...p, [k]: v }));
  const setCF = (k, v) => setC(p => ({ ...p, [k]: v }));
  const setF = (i, k, v) => setFr(p => p.map((f, j) => j === i ? { ...f, [k]: v } : f));
  const toggleDiv = d => setH(p => { const on = p.diversity.includes(d); let next = on ? p.diversity.filter(x => x !== d) : [...p.diversity, d]; if (!on && d === "None of these") next = ["None of these"]; if (!on && d !== "None of these") next = next.filter(x => x !== "None of these"); return { ...p, diversity: next }; });
  async function pick(i, file) {
    if (!file) return; setErr("");
    try { const blob = await compressPhoto(file); setFr(p => p.map((f, j) => { if (j !== i) return f; if (f.photo) URL.revokeObjectURL(f.photo.url); return { ...f, photo: { blob, url: URL.createObjectURL(blob) } }; })); }
    catch (e) { setErr("We couldn't read one of the photos. Try a JPG or PNG."); }
  }
  async function submit() {
    const miss = [];
    if (!c.name.trim()) miss.push("your name");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email.trim())) miss.push("a valid email");
    if (!h.name.trim()) miss.push("house name");
    if (!/\S+\.\S+/.test(h.website.trim())) miss.push("house website");
    if (!h.country.trim()) miss.push("country");
    if (!h.ownershipStatus) miss.push("ownership");
    if (!h.diversity.length && !h.diversityOther.trim()) miss.push("diversity (choose \"None of these\" if it doesn't apply)");
    fr.forEach((f, i) => {
      const n = f.name.trim() || `fragrance ${i + 1}`, m = [];
      if (!f.name.trim()) m.push("name"); if (!f.year.trim()) m.push("year"); if (!f.perfumer.trim()) m.push("perfumer");
      if (!(f.top.trim() || f.heart.trim() || f.base.trim())) m.push("notes"); if (!f.photo) m.push("bottle photo");
      if (m.length) miss.push(`${n}: ${m.join(", ")}`);
    });
    if (!auth1 || !auth2) miss.push("both permission boxes");
    if (miss.length) { setErr("Still needed: " + miss.join("; ") + "."); return; }
    if (trap) { setDone(true); return; } // spam trap filled in: pretend success
    setErr("");
    try {
      const id = (crypto.randomUUID ? crypto.randomUUID() : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, ch => { const r = Math.random() * 16 | 0; return (ch === "x" ? r : (r & 3 | 8)).toString(16); }));
      const out = [];
      for (let i = 0; i < fr.length; i++) {
        setBusy(`Uploading photo ${i + 1} of ${fr.length}…`);
        const f = fr[i], path = `${id}/f${i + 1}-${Math.random().toString(36).slice(2, 8)}.jpg`;
        const up = await supabase.storage.from("brand-submissions").upload(path, f.photo.blob, { contentType:"image/jpeg" });
        if (up.error) throw up.error;
        const { photo, k, ...rest } = f; out.push({ ...rest, imagePath: path });
      }
      setBusy("Sending…");
      const ins = await supabase.from("brand_submissions").insert({ id, contact: c, house: h, fragrances: out, consent: true });
      if (ins.error) throw ins.error;
      setDone(true);
    } catch (e) { console.error("Brand submission failed:", e); setErr("That did not send. Please try again, or email team@memoironskin.com and we will help."); }
    setBusy("");
  }
  const inp = (get, set, k, ph, props = {}) => <input className="mos-in" value={get[k]} onChange={e => set(k, e.target.value)} placeholder={ph} {...props}/>;
  const two = { display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 };
  const choice = (val, opts, on) => (
    <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
      {opts.map(o => { const sel = val === o.val; return <button type="button" key={o.val} onClick={() => on(sel ? "" : o.val)} aria-pressed={sel} style={{ flex:"1 1 auto", minHeight:46, padding:"0 16px", borderRadius:10, border:`1px solid ${sel ? T.black : T.rule}`, background:sel ? T.black : T.white, color:sel ? T.white : T.ink, fontFamily:sans, fontSize:14, fontWeight:sel ? 600 : 400, cursor:"pointer" }}>{o.label}</button>; })}
    </div>
  );
  const chk = (on, set, children) => (
    <label style={{ display:"flex", gap:10, alignItems:"flex-start", margin:"0 0 14px", fontFamily:sans, fontSize:13.5, color:T.ink, lineHeight:1.55, cursor:"pointer" }}>
      <input type="checkbox" checked={on} onChange={e => set(e.target.checked)} style={{ marginTop:3, width:18, height:18, flex:"none" }}/><span>{children}</span>
    </label>
  );
  const wrap = { maxWidth:720, margin:"0 auto", padding:"28px 20px 72px" };
  if (done) return (
    <div style={{ ...wrap, textAlign:"center", paddingTop:80 }}>
      <Wordmark size={28}/>
      <h2 style={{ fontFamily:serif, fontSize:"clamp(30px, 4vw, 44px)", fontWeight:400, color:T.black, margin:"36px 0 12px" }}>Thank you</h2>
      <p style={{ fontFamily:sans, fontSize:15, color:T.mid, lineHeight:1.7, maxWidth:460, margin:"0 auto 28px" }}><strong style={{ color:T.ink }}>{h.name}</strong> is in our review queue. A person will check everything and write to {c.email} if we need anything. Nothing goes live until we've reviewed it.</p>
      <a href="/" style={{ fontFamily:sans, fontSize:14, color:T.ink }}>Back to Memoir on Skin</a>
    </div>
  );
  return (
    <div style={wrap}>
      <a href="/" aria-label="Memoir on Skin home" style={{ textDecoration:"none" }}><Wordmark size={26}/></a>
      <p style={{ fontFamily:sans, fontSize:11, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.18em", color:T.accent, margin:"34px 0 6px" }}>For brands</p>
      <h1 style={{ fontFamily:serif, fontSize:"clamp(32px, 4.4vw, 52px)", fontWeight:400, letterSpacing:-0.8, color:T.black, margin:"0 0 12px", lineHeight:1.1 }}>Add your house to Memoir on Skin</h1>
      <p style={{ fontFamily:sans, fontSize:15, color:T.mid, lineHeight:1.7, margin:"0 0 10px" }}>Memoir on Skin is a scent journal and sample-first guide to niche and indie fragrance. Members are sent to your website first for discovery sets and samples. Tell us about your house and every fragrance, and upload your own bottle images. No account needed.</p>
      <p style={{ fontFamily:sans, fontSize:13, color:T.faint, lineHeight:1.6, margin:"0 0 36px" }}>A person reviews every submission before anything is published. Some links on our site may be affiliate links; it never affects what we feature.</p>

      <FormSec title="About you" sub="So we can reach you.">
        <FormField label="Your name" req>{inp(c, setCF, "name", "Full name")}</FormField>
        <div style={two}>
          <FormField label="Role">{inp(c, setCF, "role", "e.g. Founder, PR")}</FormField>
          <FormField label="Email" req>{inp(c, setCF, "email", "you@brand.com", { type:"email", inputMode:"email", autoCapitalize:"none" })}</FormField>
        </div>
      </FormSec>

      <FormSec title="The house" sub="Shown on your brand page.">
        <FormField label="House name" req>{inp(h, setHF, "name", "e.g. Maison Example")}</FormField>
        <FormField label="House website" req>{inp(h, setHF, "website", "maisonexample.com", { inputMode:"url", autoCapitalize:"none" })}</FormField>
        <div style={two}>
          <FormField label="Country" req>{inp(h, setHF, "country", "Where the house is based")}</FormField>
          <FormField label="Year founded">{inp(h, setHF, "founded", "e.g. 2016", { inputMode:"numeric" })}</FormField>
        </div>
        <FormField label="Founder(s) and perfumer(s)">{inp(h, setHF, "founders", "Names, if you'd like them shown")}</FormField>
        <FormField label="Ownership" req>{choice(h.ownershipStatus, [{ val:"independent", label:"Independent" }, { val:"conglomerate", label:"Owned by a group" }], v => setHF("ownershipStatus", v))}</FormField>
        {h.ownershipStatus === "conglomerate" && <FormField label="Parent company">{inp(h, setHF, "parent", "e.g. LVMH, Puig")}</FormField>}
        <FormField label="Diversity" req hint="Choose all that apply. We only show what you tell us.">
          <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
            {DIVERSITY_OPTS.map(d => { const on = h.diversity.includes(d); return <button type="button" key={d} onClick={() => toggleDiv(d)} aria-pressed={on} style={{ minHeight:42, padding:"0 14px", borderRadius:21, border:`1px solid ${on ? T.black : T.rule}`, background:on ? T.black : T.white, color:on ? T.white : T.ink, fontFamily:sans, fontSize:13.5, cursor:"pointer" }}>{d}</button>; })}
          </div>
          <input className="mos-in" style={{ marginTop:10 }} value={h.diversityOther} onChange={e => setHF("diversityOther", e.target.value)} placeholder="Other (please describe)"/>
        </FormField>
        <FormField label="Brand type">{choice(h.brandType, [{ val:"Indie", label:"Indie" }, { val:"Niche", label:"Niche" }, { val:"Designer", label:"Heritage" }], v => setHF("brandType", v))}</FormField>
        <FormField label="Price tier">{choice(h.priceTier, [{ val:"Mass-market", label:"Mass-market" }, { val:"Prestige", label:"Prestige" }, { val:"Luxury", label:"Luxury" }], v => setHF("priceTier", v))}</FormField>
        <FormField label="Your story"><textarea className="mos-in" rows={4} value={h.story} onChange={e => setHF("story", e.target.value)} placeholder="A few lines about the house, in your own words" style={{ resize:"vertical", lineHeight:1.6 }}/></FormField>
      </FormSec>

      <FormSec title="Samples and kits" sub="We send members to you first, so tell us what you offer.">
        <div style={two}>
          <FormField label="Discovery set name">{inp(h, setHF, "kitName", "e.g. Discovery Set")}</FormField>
          <FormField label="Price">{inp(h, setHF, "kitPrice", "e.g. $45 or €37")}</FormField>
        </div>
        <FormField label="Discovery set link">{inp(h, setHF, "kitUrl", "Link to the set on your site", { inputMode:"url", autoCapitalize:"none" })}</FormField>
        <FormField label="Individual samples">{choice(h.samples, [{ val:"yes", label:"Yes" }, { val:"no", label:"No" }], v => setHF("samples", v))}</FormField>
        <FormField label="Travel sizes">{choice(h.travel, [{ val:"yes", label:"Yes" }, { val:"no", label:"No" }], v => setHF("travel", v))}</FormField>
        {h.travel === "yes" && <FormField label="Travel size link">{inp(h, setHF, "travelUrl", "Link", { inputMode:"url", autoCapitalize:"none" })}</FormField>}
        <FormField label="Affiliate program link" hint="If you have one. Optional.">{inp(h, setHF, "affiliateUrl", "Link", { inputMode:"url", autoCapitalize:"none" })}</FormField>
        <div style={two}>
          <FormField label="Press contact email">{inp(h, setHF, "pressEmail", "press@brand.com", { type:"email", autoCapitalize:"none" })}</FormField>
          <FormField label="Instagram">{inp(h, setHF, "instagram", "@handle", { autoCapitalize:"none" })}</FormField>
        </div>
        <FormField label="Press kit link" hint="Optional. A link to a folder with extra images or a full catalogue helps us.">{inp(h, setHF, "pressKitUrl", "Link", { inputMode:"url", autoCapitalize:"none" })}</FormField>
      </FormSec>

      <FormSec title="Your fragrances" sub="Add every fragrance you'd like on Memoir on Skin. Each one needs its name, year, perfumer, at least one note and a bottle image.">
        {fr.map((f, i) => (
          <div key={f.k} style={{ background:T.lift, border:`1px solid ${T.rule}`, borderRadius:16, padding:18, marginBottom:16 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
              <span style={{ fontFamily:sans, fontSize:11, letterSpacing:"0.14em", textTransform:"uppercase", color:T.mid, fontWeight:600 }}>Fragrance {i + 1}</span>
              {fr.length > 1 && <button type="button" onClick={() => setFr(p => p.filter((_, j) => j !== i))} style={{ background:"none", border:"none", color:T.mid, fontFamily:sans, fontSize:13, cursor:"pointer", textDecoration:"underline" }}>Remove</button>}
            </div>
            <FormField label="Fragrance name" req>{inp(f, (k, v) => setF(i, k, v), "name", "e.g. Tobacco Oud")}</FormField>
            <div style={two}>
              <FormField label="Year" req>{inp(f, (k, v) => setF(i, k, v), "year", "e.g. 2021", { inputMode:"numeric" })}</FormField>
              <FormField label="Concentration">
                <select className="mos-in" value={f.concentration} onChange={e => setF(i, "concentration", e.target.value)}><option value="">Select</option>{["Eau de Parfum","Eau de Toilette","Parfum","Extrait","Eau de Cologne","Eau Fraîche"].map(x => <option key={x}>{x}</option>)}</select>
              </FormField>
            </div>
            <FormField label="Perfumer" req hint="Write &quot;In-house&quot; if there is no named perfumer.">{inp(f, (k, v) => setF(i, k, v), "perfumer", "Nose or creator")}</FormField>
            <FormField label="Family">{inp(f, (k, v) => setF(i, k, v), "family", "e.g. Woody, Floral, Amber")}</FormField>
            <FormField label="Top notes" req hint="Separate each with a comma. At least one note across top, heart and base.">{inp(f, (k, v) => setF(i, k, v), "top", "e.g. Bergamot, Saffron")}</FormField>
            <FormField label="Heart notes">{inp(f, (k, v) => setF(i, k, v), "heart", "e.g. Rose, Iris")}</FormField>
            <FormField label="Base notes">{inp(f, (k, v) => setF(i, k, v), "base", "e.g. Sandalwood, Musk")}</FormField>
            <FormField label="Main accords" hint="Up to five, strongest first.">{inp(f, (k, v) => setF(i, k, v), "accords", "Woody, Floral, Powdery")}</FormField>
            <FormField label="About this fragrance"><textarea className="mos-in" rows={3} value={f.story} onChange={e => setF(i, "story", e.target.value)} placeholder="The idea, the inspiration, how it wears" style={{ resize:"vertical", lineHeight:1.6 }}/></FormField>
            <FormField label="Bottle image" req hint="White or plain background if you can. JPG, PNG or WebP.">
              <input type="file" accept="image/*" onChange={e => pick(i, e.target.files && e.target.files[0])} style={{ fontFamily:sans, fontSize:14, color:T.ink, maxWidth:"100%" }}/>
            </FormField>
            {f.photo && <img src={f.photo.url} alt={`${f.name || "Fragrance"} bottle`} style={{ width:"100%", maxWidth:200, borderRadius:12, border:`1px solid ${T.rule}`, display:"block" }}/>}
          </div>
        ))}
        {fr.length < 80 && <button type="button" onClick={() => setFr(p => [...p, newBrandFrag()])} style={{ ...ghostBtn, width:"100%" }}>+ Add another fragrance</button>}
      </FormSec>

      <FormSec title="Permission" sub="Please confirm both.">
        {chk(auth1, setAuth1, "I am authorised to represent this house and to submit this information.")}
        {chk(auth2, setAuth2, "I own or hold the rights to the images and text I'm submitting, and I give Memoir on Skin permission to display them on our website and app, credited to the house. I can ask for anything to be changed or removed by emailing team@memoironskin.com.")}
      </FormSec>

      <div aria-hidden="true" style={{ position:"absolute", left:"-9999px", width:1, height:1, overflow:"hidden" }}>
        <label>Leave this empty<input tabIndex={-1} autoComplete="off" value={trap} onChange={e => setTrap(e.target.value)}/></label>
      </div>
      {err && <p role="alert" style={{ fontFamily:sans, fontSize:13, color:T.bad, margin:"0 0 12px", lineHeight:1.55 }}>{err}</p>}
      <button onClick={submit} disabled={!!busy} style={{ width:"100%", maxWidth:420, minHeight:54, borderRadius:12, background:T.black, border:"none", color:T.white, fontSize:15, fontWeight:500, fontFamily:sans, cursor:busy ? "default" : "pointer", opacity:busy ? 0.6 : 1 }}>{busy || "Send to Memoir on Skin"}</button>
      <p style={{ fontFamily:sans, fontSize:12, color:T.faint, margin:"14px 0 0" }}>Questions? team@memoironskin.com</p>
    </div>
  );
}

// ─── OWNER: Admin home (first screen after sign-in for admins) ───
function AdminHome({ onEnterSite }) {
  const [wl, setWl] = useState(null), [subs, setSubs] = useState(null), [sugs, setSugs] = useState(null);
  useEffect(() => {
    let on = true;
    supabase.rpc("admin_list_waitlist").then(r => { if (on) setWl(r.error ? [] : (r.data || [])); }, () => on && setWl([]));
    supabase.rpc("admin_list_brand_submissions").then(r => { if (on) setSubs(r.error ? [] : (r.data || [])); }, () => on && setSubs([]));
    supabase.rpc("admin_list_suggestions").then(r => { if (on) setSugs(r.error ? [] : (r.data || [])); }, () => on && setSugs([]));
    return () => { on = false; };
  }, []);
  const loading = wl === null || subs === null || sugs === null;
  const newSugs = (sugs || []).filter(g => g.status === "new");
  const byKind = k => newSugs.filter(g => g.kind === k).length;
  const waiting = (wl || []).filter(w => w.status === "waiting").length;
  const newSubs = (subs || []).filter(x => x.status === "new").length;
  const cards = [
    ["Beta sign-ups waiting", waiting, "/?admin=invites"],
    ["Events and businesses suggested", byKind("event"), "/?admin=brands"],
    ["Fragrances suggested", byKind("fragrance"), "/?admin=brands"],
    ["Stores suggested", byKind("store"), "/?admin=brands"],
    ["Brand submissions", newSubs, "/?admin=brands"],
  ];
  const total = cards.reduce((a, c) => a + c[1], 0);
  const kindLabel = { fragrance:"Fragrance", store:"Store", event:"Event or business" };
  const title = g => (g.payload && (g.payload.name || g.payload.house || g.payload.link)) || "Untitled";
  const hr = new Date().getHours();
  return (
    <div style={{ maxWidth:760, margin:"0 auto", padding:"28px 20px 72px", fontFamily:sans }}>
      <Wordmark size={24}/>
      <h1 style={{ fontFamily:serif, fontSize:34, fontWeight:400, color:T.black, margin:"26px 0 6px", letterSpacing:-0.6 }}>{hr < 12 ? "Good morning" : hr < 18 ? "Good afternoon" : "Good evening"}, Sisi</h1>
      <p style={{ fontSize:14, color:T.mid, margin:"0 0 18px" }}>{loading ? "Checking what's waiting…" : total ? `${total} thing${total === 1 ? "" : "s"} waiting for you.` : "All clear. Nothing waiting."}</p>
      <button onClick={onEnterSite} style={{ ...ctaBtn(true), marginBottom:26 }}>Go to the site</button>
      <p style={{ ...FLABEL, margin:"0 0 10px" }}>Needs you</p>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(200px, 1fr))", gap:10, marginBottom:28 }}>
        {cards.map(([label, n, href]) => (
          <a key={label} href={href} style={{ textDecoration:"none", background:T.white, border:`1px solid ${n ? "var(--accent)" : T.rule}`, borderRadius:14, padding:"14px 16px", display:"block" }}>
            <span style={{ fontFamily:serif, fontSize:34, color:n ? "var(--accent)" : T.mid, lineHeight:1 }}>{loading ? "–" : n}</span>
            <span style={{ display:"block", fontSize:13, color:T.ink, marginTop:6 }}>{label}</span>
          </a>
        ))}
      </div>
      <p style={{ ...FLABEL, margin:"0 0 10px" }}>Newest suggestions</p>
      {!loading && newSugs.length === 0 && <p style={{ fontSize:13, color:T.mid }}>Nothing new.</p>}
      {newSugs.slice(0, 8).map(g => (
        <a key={g.id} href="/?admin=brands" style={{ textDecoration:"none", display:"block", background:T.white, border:`1px solid ${T.rule}`, borderRadius:14, padding:"12px 16px", marginBottom:8 }}>
          <span style={{ fontFamily:serif, fontSize:17, color:T.ink, overflowWrap:"anywhere" }}>{title(g)}</span>
          <span style={{ display:"block", fontSize:12, color:T.mid, marginTop:3 }}>{kindLabel[g.kind] || g.kind} · {new Date(g.created_at).toLocaleDateString()}{g.username ? " · @" + g.username : ""}</span>
        </a>
      ))}
      <p style={{ ...FLABEL, margin:"26px 0 10px" }}>Tools</p>
      <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
        <a href="/?admin=invites" style={{ ...ghostBtn, textDecoration:"none", display:"inline-flex", alignItems:"center" }}>Invites and launch</a>
        <a href="/?admin=brands" style={{ ...ghostBtn, textDecoration:"none", display:"inline-flex", alignItems:"center" }}>All suggestions and submissions</a>
      </div>
    </div>
  );
}

// ─── OWNER: review brand submissions (?admin=brands, signed in as admin) ───
function BrandSubmissionsAdmin() {
  const [rows, setRows] = useState(null);
  const [open, setOpen] = useState(null);
  const [urls, setUrls] = useState({});
  const [msg, setMsg] = useState("");
  const [sugs, setSugs] = useState([]);
  const [sugOpen, setSugOpen] = useState(null);
  async function load() { const r = await supabase.rpc("admin_list_brand_submissions"); if (r.error) { setMsg("Not available for this account."); setRows([]); return; } setRows(r.data || []); const g = await supabase.rpc("admin_list_suggestions"); if (!g.error) setSugs(g.data || []); }
  useEffect(() => { load(); }, []);
  async function expand(s) {
    setOpen(o => o === s.id ? null : s.id);
    const paths = (s.fragrances || []).map(f => f.imagePath).filter(Boolean).filter(p => !urls[p]);
    if (!paths.length) return;
    const r = await supabase.storage.from("brand-submissions").createSignedUrls(paths, 3600);
    if (r.data) setUrls(u => { const n = { ...u }; r.data.forEach(x => { if (x.signedUrl) n[x.path] = x.signedUrl; }); return n; });
  }
  async function setSugStatus(id, status) { const r = await supabase.rpc("admin_set_suggestion", { p_id: id, p_status: status }); if (r.error) { setMsg(r.error.message); return; } load(); }
  const SUG_LABEL = { fragrance:"Fragrance", store:"Store", event:"Event or business" };
  const SUG_SKIP = ["imagePath", "ownPhotoConfirmed"];
  const sugTitle = g => (g.payload && (g.payload.name || g.payload.house)) || "Untitled";
  async function setStatus(id, status) { const r = await supabase.rpc("admin_set_brand_submission", { p_id: id, p_status: status }); if (r.error) { setMsg(r.error.message); return; } load(); }
  const row = { background:T.white, border:`1px solid ${T.rule}`, borderRadius:14, padding:16, marginBottom:10, fontFamily:sans };
  const kv = (k, v) => v ? <p style={{ fontSize:13, color:T.ink, margin:"3px 0", lineHeight:1.5 }}><span style={{ color:T.mid }}>{k}: </span>{Array.isArray(v) ? v.join(", ") : String(v)}</p> : null;
  return (
    <div style={{ maxWidth:760, margin:"0 auto", padding:"28px 20px 72px" }}>
      <a href="/" style={{ textDecoration:"none" }}><Wordmark size={24}/></a>
      <p style={{ margin:"18px 0 0" }}><a href="/" style={{ fontFamily:sans, fontSize:14, color:T.mid }}>← Back to Admin</a></p>
      <h1 style={{ fontFamily:serif, fontSize:32, fontWeight:400, color:T.black, margin:"14px 0 6px" }}>Brand submissions</h1>
      <p style={{ fontFamily:sans, fontSize:13, color:T.mid, margin:"0 0 20px" }}>Forms sent from memoironskin.com/brands. Photos open via private links that expire after an hour.</p>
      {msg && <p style={{ fontFamily:sans, fontSize:13, color:T.bad }}>{msg}</p>}
      {rows === null && <p style={{ fontFamily:sans, color:T.mid }}>Loading…</p>}
      {rows && rows.length === 0 && !msg && <p style={{ fontFamily:sans, color:T.mid }}>Nothing yet.</p>}
      {(rows || []).map(s => (
        <div key={s.id} style={row}>
          <div style={{ display:"flex", justifyContent:"space-between", gap:10, alignItems:"baseline", flexWrap:"wrap" }}>
            <p style={{ fontFamily:serif, fontSize:18, color:T.ink, margin:0 }}>{s.house.name}</p>
            <span style={{ fontSize:11, letterSpacing:"0.12em", textTransform:"uppercase", color:s.status === "new" ? "var(--accent)" : T.mid, fontWeight:600 }}>{s.status}</span>
          </div>
          <p style={{ fontSize:12, color:T.mid, margin:"4px 0 10px" }}>{new Date(s.created_at).toLocaleString()} · {(s.fragrances || []).length} fragrance{(s.fragrances || []).length === 1 ? "" : "s"} · {s.contact.name} · <a href={`mailto:${s.contact.email}`} style={{ color:T.mid }}>{s.contact.email}</a></p>
          <button onClick={() => expand(s)} style={{ ...ghostBtn, minHeight:38, fontSize:13, padding:"0 16px" }}>{open === s.id ? "Hide details" : "View details"}</button>
          {open === s.id && (
            <div style={{ marginTop:14 }}>
              {kv("Role", s.contact.role)}{kv("Website", s.house.website)}{kv("Country", s.house.country)}{kv("Founded", s.house.founded)}{kv("Founders / perfumers", s.house.founders)}
              {kv("Ownership", s.house.ownershipStatus === "conglomerate" ? `Owned by a group ${s.house.parent || ""}` : s.house.ownershipStatus)}
              {kv("Diversity", [...(s.house.diversity || []), s.house.diversityOther].filter(Boolean))}{kv("Brand type", s.house.brandType)}{kv("Price tier", s.house.priceTier)}{kv("Story", s.house.story)}
              {kv("Discovery set", [s.house.kitName, s.house.kitPrice, s.house.kitUrl].filter(Boolean).join(" · "))}{kv("Individual samples", s.house.samples)}{kv("Travel sizes", [s.house.travel, s.house.travelUrl].filter(Boolean).join(" · "))}
              {kv("Affiliate", s.house.affiliateUrl)}{kv("Press email", s.house.pressEmail)}{kv("Instagram", s.house.instagram)}{kv("Press kit", s.house.pressKitUrl)}
              {(s.fragrances || []).map((f, i) => (
                <div key={i} style={{ display:"flex", gap:12, padding:"12px 0", borderTop:`1px solid ${T.rule}`, marginTop:10 }}>
                  {urls[f.imagePath] ? <a href={urls[f.imagePath]} target="_blank" rel="noopener noreferrer"><img src={urls[f.imagePath]} alt="" style={{ width:84, height:105, objectFit:"cover", borderRadius:8, border:`1px solid ${T.rule}` }}/></a> : <div style={{ width:84, height:105, borderRadius:8, background:T.lift, flex:"none" }}/>}
                  <div style={{ minWidth:0 }}>
                    <p style={{ fontFamily:serif, fontSize:16, color:T.ink, margin:"0 0 4px" }}>{f.name} <span style={{ color:T.mid, fontSize:13 }}>{f.year}</span></p>
                    {kv("Perfumer", f.perfumer)}{kv("Concentration", f.concentration)}{kv("Family", f.family)}{kv("Top", f.top)}{kv("Heart", f.heart)}{kv("Base", f.base)}{kv("Accords", f.accords)}{kv("About", f.story)}
                  </div>
                </div>
              ))}
              <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginTop:12 }}>
                {["reviewing", "accepted", "declined"].map(st => <button key={st} onClick={() => setStatus(s.id, st)} style={{ ...ghostBtn, minHeight:38, fontSize:13, padding:"0 16px" }}>Mark {st}</button>)}
              </div>
            </div>
          )}
        </div>
      ))}
      <h1 style={{ fontFamily:serif, fontSize:32, fontWeight:400, color:T.black, margin:"44px 0 6px" }}>Member suggestions</h1>
      <p style={{ fontFamily:sans, fontSize:13, color:T.mid, margin:"0 0 20px" }}>Fragrances, stores, events and businesses sent from the Suggest button.</p>
      {sugs.length === 0 && <p style={{ fontFamily:sans, color:T.mid }}>Nothing yet.</p>}
      {sugs.map(g => (
        <div key={g.id} style={row}>
          <div style={{ display:"flex", justifyContent:"space-between", gap:10, alignItems:"baseline", flexWrap:"wrap" }}>
            <p style={{ fontFamily:serif, fontSize:18, color:T.ink, margin:0 }}>{sugTitle(g)}</p>
            <span style={{ fontSize:11, letterSpacing:"0.12em", textTransform:"uppercase", color:g.status === "new" ? "var(--accent)" : T.mid, fontWeight:600 }}>{g.status}</span>
          </div>
          <p style={{ fontSize:12, color:T.mid, margin:"4px 0 10px" }}>{SUG_LABEL[g.kind] || g.kind}{g.payload && g.payload.entry ? " · " + g.payload.entry : ""} · {new Date(g.created_at).toLocaleString()}{g.username ? " · @" + g.username : ""}</p>
          <button onClick={() => setSugOpen(o => o === g.id ? null : g.id)} style={{ ...ghostBtn, minHeight:38, fontSize:13, padding:"0 16px" }}>{sugOpen === g.id ? "Hide details" : "View details"}</button>
          {sugOpen === g.id && (
            <div style={{ marginTop:14 }}>
              {Object.entries(g.payload || {}).filter(([k, v]) => !SUG_SKIP.includes(k) && v && !(Array.isArray(v) && !v.length)).map(([k, v]) => <Fragment key={k}>{kv(k.replace(/([A-Z])/g, " $1").replace(/^./, c => c.toUpperCase()), v)}</Fragment>)}
              {g.payload && g.payload.imagePath && <p style={{ fontSize:12, color:T.mid, margin:"6px 0" }}>Bottle photo is in the suggestion-images storage bucket.</p>}
              <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginTop:12 }}>
                {["reviewing", "accepted", "declined"].map(st => <button key={st} onClick={() => setSugStatus(g.id, st)} style={{ ...ghostBtn, minHeight:38, fontSize:13, padding:"0 16px" }}>Mark {st}</button>)}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── INVITE ADMIN (owner only; server checks admin rights) ────────────────────
function InviteAdmin() {
  const [rows, setRows] = useState(null);
  const [note, setNote] = useState("");
  const [uses, setUses] = useState(1);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [fresh, setFresh] = useState("");
  const [wl, setWl] = useState([]);
  const [isOpen, setIsOpen] = useState(null);
  async function loadOpen() { const r = await supabase.rpc("signups_open"); if (!r.error) setIsOpen(!!r.data); }
  async function setOpen(v) {
    if (v && !window.confirm("Open sign-ups? Anyone with a valid code can create an account.")) return;
    const r = await supabase.rpc("admin_set_launch", { p_open: v });
    if (r.error) { setMsg(r.error.message); return; }
    loadOpen();
  }
  async function loadWl() { const r = await supabase.rpc("admin_list_waitlist"); if (!r.error) setWl(r.data || []); }
  async function inviteWl(id, email) {
    const r = await supabase.rpc("admin_invite_waitlist", { p_id: id });
    if (r.error) { setMsg(r.error.message); return; }
    setFresh(r.data); loadWl(); load();
    try { await navigator.clipboard.writeText(r.data); } catch (e) {}
  }
  async function load() {
    const r = await supabase.rpc("admin_list_invites");
    if (r.error) { setMsg("Not available for this account."); setRows([]); return; }
    setRows(r.data || []);
  }
  useEffect(() => { load(); loadWl(); loadOpen(); }, []);
  async function make() {
    setBusy(true); setMsg("");
    const r = await supabase.rpc("admin_create_invite", { p_note: note.trim(), p_max_uses: Math.max(1, Number(uses) || 1) });
    setBusy(false);
    if (r.error) { setMsg(r.error.message); return; }
    setFresh(r.data); setNote(""); load();
    try { await navigator.clipboard.writeText(r.data); } catch (e) {}
  }
  async function toggle(code, active) { await supabase.rpc("admin_set_invite_active", { p_code: code, p_active: active }); load(); }
  async function share(code) {
    const text = "Your invite to Memoir on Skin: " + code + "\n" + window.location.origin;
    try { if (navigator.share) await navigator.share({ text }); else await navigator.clipboard.writeText(text); } catch (e) {}
  }
  const inp = { width:"100%", background:T.lift, border:`1px solid ${T.rule}`, borderRadius:12, padding:"13px 16px", fontSize:15, color:T.ink, outline:"none", fontFamily:sans, boxSizing:"border-box" };
  const btn = { padding:"8px 14px", borderRadius:10, border:`1px solid ${T.rule}`, background:T.white, color:T.ink, fontSize:12, fontFamily:sans, cursor:"pointer" };
  return (
    <div style={{ maxWidth:560, margin:"0 auto", padding:"32px 20px 80px", fontFamily:sans, color:T.ink }}>
      <p style={{ margin:"0 0 14px" }}><a href="/" style={{ fontSize:14, color:T.mid }}>← Back to Admin</a></p>
      <p style={{ fontSize:10, letterSpacing:"0.14em", textTransform:"uppercase", color:T.mid, margin:"0 0 6px" }}>Owner</p>
      <h1 style={{ fontFamily:serif, fontSize:32, fontWeight:400, margin:"0 0 20px", color:T.black }}>Invite codes</h1>
      <div style={{ border:`1px solid ${T.rule}`, borderRadius:12, padding:"14px 16px", marginBottom:18, display:"flex", alignItems:"center", justifyContent:"space-between", gap:12, background:isOpen ? T.lift : "transparent" }}>
        <div>
          <p style={{ fontSize:14, fontWeight:600, margin:0 }}>{isOpen === null ? "Checking…" : isOpen ? "Sign-ups are OPEN" : "Sign-ups are CLOSED"}</p>
          <p style={{ fontSize:12, color:T.mid, margin:"3px 0 0" }}>{isOpen ? "Codes work. New members can join." : "Codes are saved but nobody can join yet."}</p>
        </div>
        {isOpen !== null && <button onClick={() => setOpen(!isOpen)} style={btn}>{isOpen ? "Close" : "Open"}</button>}
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:12 }}>
        <input value={note} onChange={e => setNote(e.target.value)} placeholder="Who is it for? (e.g. Maya, ScentXplore)" style={inp}/>
        <div style={{ display:"flex", gap:10, alignItems:"center" }}>
          <span style={{ fontSize:13, color:T.mid, whiteSpace:"nowrap" }}>People who can use it</span>
          <input value={uses} onChange={e => setUses(e.target.value.replace(/\D/g, ""))} inputMode="numeric" style={{ ...inp, width:90 }}/>
        </div>
        <button onClick={make} disabled={busy} style={{ padding:"14px 0", borderRadius:12, background:busy?T.faint:T.black, color:T.white, border:"none", fontSize:14, fontWeight:600, fontFamily:sans, cursor:"pointer" }}>{busy ? "Making…" : "Make a code"}</button>
      </div>
      {msg && <p style={{ fontSize:12, color:T.bad, margin:"0 0 12px" }}>{msg}</p>}
      {fresh && (
        <div style={{ background:T.lift, border:`1px solid ${T.rule}`, borderRadius:12, padding:16, marginBottom:20, textAlign:"center" }}>
          <p style={{ fontSize:11, color:T.mid, margin:"0 0 6px" }}>New code (copied)</p>
          <p style={{ fontFamily:serif, fontSize:30, letterSpacing:"0.1em", margin:"0 0 10px", color:T.black }}>{fresh}</p>
          <button onClick={() => share(fresh)} style={btn}>Share</button>
        </div>
      )}
      <h2 style={{ fontFamily:serif, fontSize:20, fontWeight:400, margin:"24px 0 10px" }}>Beta waitlist ({wl.filter(w => w.status === "waiting").length} waiting)</h2>
      {wl.length === 0 && <p style={{ fontSize:13, color:T.mid }}>Nobody yet.</p>}
      {wl.map(w => (
        <div key={w.id} style={{ border:`1px solid ${T.rule}`, borderRadius:12, padding:"12px 14px", marginBottom:8, opacity:w.status === "waiting" ? 1 : 0.6 }}>
          <div style={{ display:"flex", justifyContent:"space-between", gap:10 }}>
            <span style={{ fontSize:14 }}>{w.name}</span>
            <span style={{ fontSize:12, color:T.mid }}>{w.status === "waiting" ? "Waiting" : "Invited"}</span>
          </div>
          <p style={{ fontSize:12, color:T.mid, margin:"3px 0 0", wordBreak:"break-all" }}>{w.email}</p>
          {w.src && <p style={{ fontSize:11, color:T.mid, margin:"3px 0 0" }}>From: <strong style={{ fontWeight:600 }}>{w.src}</strong></p>}
          {w.status === "waiting"
            ? <button onClick={() => inviteWl(w.id, w.email)} style={{ ...btn, marginTop:10 }}>Let in: make their code</button>
            : <p style={{ fontSize:12, margin:"8px 0 0" }}>Code: <span style={{ fontFamily:"ui-monospace, monospace" }}>{w.code}</span> <span onClick={() => share(w.code)} style={{ color:T.mid, cursor:"pointer", textDecoration:"underline" }}>Share</span></p>}
        </div>
      ))}
      <h2 style={{ fontFamily:serif, fontSize:20, fontWeight:400, margin:"24px 0 10px" }}>All codes</h2>
      {rows === null && <p style={{ fontSize:13, color:T.mid }}>Loading…</p>}
      {rows && rows.map(r => (
        <div key={r.code} style={{ border:`1px solid ${T.rule}`, borderRadius:12, padding:"12px 14px", marginBottom:8, opacity:r.active ? 1 : 0.5 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:10 }}>
            <span style={{ fontFamily:"ui-monospace, monospace", fontSize:16, letterSpacing:"0.06em" }}>{r.code}</span>
            <span style={{ fontSize:12, color:T.mid }}>{r.uses}/{r.max_uses} used</span>
          </div>
          {r.note && <p style={{ fontSize:12, color:T.mid, margin:"4px 0 0" }}>{r.note}</p>}
          {r.redeemed_by && r.redeemed_by.length > 0 && <p style={{ fontSize:12, color:T.ink, margin:"6px 0 0" }}>Joined: {r.redeemed_by.join(", ")}</p>}
          <div style={{ display:"flex", gap:8, marginTop:10 }}>
            <button onClick={() => share(r.code)} style={btn}>Share</button>
            <button onClick={() => toggle(r.code, !r.active)} style={btn}>{r.active ? "Turn off" : "Turn on"}</button>
          </div>
        </div>
      ))}
      <p style={{ marginTop:24 }}><a href={window.location.pathname} style={{ fontSize:12, color:T.mid }}>Back to the site</a></p>
    </div>
  );
}

// ─── LOGIN / SIGNUP SCREEN — real Supabase Auth (email/password + Google OAuth) ─
const TURNSTILE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || "";
function Turnstile({ onToken, resetKey }) {
  const ref = useRef(null);
  const idRef = useRef(null);
  useEffect(() => {
    if (!TURNSTILE_KEY) return;
    let off = false;
    function draw() {
      if (off || !ref.current || !window.turnstile || idRef.current != null) return;
      idRef.current = window.turnstile.render(ref.current, { sitekey: TURNSTILE_KEY, callback: t => onToken(t), "expired-callback": () => onToken(""), "error-callback": () => onToken("") });
    }
    if (window.turnstile) draw();
    else {
      let sc = document.getElementById("cf-turnstile-js");
      if (!sc) { sc = document.createElement("script"); sc.id = "cf-turnstile-js"; sc.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"; sc.async = true; document.head.appendChild(sc); }
      sc.addEventListener("load", draw);
    }
    return () => { off = true; try { if (idRef.current != null && window.turnstile) window.turnstile.remove(idRef.current); } catch (e) {} idRef.current = null; };
  }, []);
  useEffect(() => { try { if (idRef.current != null && window.turnstile) { window.turnstile.reset(idRef.current); onToken(""); } } catch (e) {} }, [resetKey]);
  if (!TURNSTILE_KEY) return null;
  return <div ref={ref} style={{ display:"flex", justifyContent:"center", margin:"0 0 14px" }}/>;
}
function LoginScreen({ onWaitlist }) {
  const [inviteCode, setInviteCode] = useState(() => { try { const m = /[?&]code=([A-Za-z0-9_-]{3,40})/.exec(window.location.search); return m ? m[1].toUpperCase() : ""; } catch (e) { return ""; } });
  const [captcha, setCaptcha] = useState("");
  const [captchaReset, setCaptchaReset] = useState(0);
  const [mode, setMode] = useState(() => (wantsJoinLink() ? "signup" : loginStart.mode));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [country, setCountry] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmPending, setConfirmPending] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");

  const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
  const isValidUsername = (v) => /^[a-zA-Z0-9_]{3,20}$/.test(v.trim());

  async function handleSubmit() {
    setError("");
    if (TURNSTILE_KEY && !captcha) { setError("Please complete the check below."); return; }
    if (mode === "signup") {
      if (!inviteCode.trim()) { setError("Please enter your invite code."); return; }
      const open = await supabase.rpc("signups_open");
      if (!open.error && open.data === false) { setError("We're not letting new members in yet. Keep your code. We'll email you the day we open."); return; }
      if (!name.trim()) { setError("Please enter your name."); return; }
      if (!isValidUsername(username)) { setError("Username must be 3–20 characters, letters, numbers, or underscores only."); return; }
      if (!isValidEmail(email)) { setError("Please enter a valid email address."); return; }
      if (password.length < 6) { setError("Password must be at least 6 characters."); return; }

      setLoading(true);
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { captchaToken: captcha || undefined, data: { username: username.trim(), display_name: name.trim(), country: country || null, invite_code: inviteCode.trim() } },
      });
      setLoading(false);
      setCaptchaReset(n => n + 1);
      if (signUpError) { setError(/database error|invite/i.test(signUpError.message) ? "That invite code isn't valid, or it has already been used." : signUpError.message); return; }
      if (!data.session) {
        // Email confirmation required before a session exists
        setConfirmPending(true);
        return;
      }
      // Session exists — root SillageApp's onAuthStateChange listener takes over routing.
    } else {
      if (!isValidEmail(email)) { setError("Please enter a valid email address."); return; }
      if (password.length < 6) { setError("Password must be at least 6 characters."); return; }

      setLoading(true);
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
        options: { captchaToken: captcha || undefined },
      });
      setLoading(false);
      setCaptchaReset(n => n + 1);
      if (signInError) { setError(signInError.message); return; }
      // Success — root SillageApp's onAuthStateChange listener takes over routing.
    }
  }

  async function handleGoogle() {
    setError("");
    setLoading(true);
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    // On success this redirects the full page to Google — nothing further runs here.
    if (oauthError) { setLoading(false); setError(oauthError.message); }
  }

  async function handleForgotSubmit() {
    if (!isValidEmail(forgotEmail)) { setError("Please enter a valid email address."); return; }
    setError("");
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(forgotEmail.trim(), {
      redirectTo: window.location.origin,
      captchaToken: captcha || undefined,
    });
    setCaptchaReset(n => n + 1);
    if (resetError) { setError(resetError.message); return; }
    setForgotSent(true);
  }

  const inp = {
    width: "100%", background: T.lift, border: `1px solid ${T.rule}`, borderRadius: 12,
    padding: "13px 16px", fontSize: 15, color: T.ink, outline: "none",
    fontFamily: sans, boxSizing: "border-box", WebkitAppearance: "none",
  };

  if (confirmPending) {
    return (
      <div style={{ minHeight:"100svh", background:"transparent", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"40px 28px", boxSizing:"border-box", fontFamily:sans }}>
        <div style={{ width:"100%", maxWidth:400, textAlign:"center" }}>
          <Logo stacked size={17} align="center"/>
          <div style={{ width:56, height:56, borderRadius:"50%", border:`1px solid ${T.rule}`, display:"flex", alignItems:"center", justifyContent:"center", margin:"32px auto 20px" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={T.black} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16v16H4z"/><path d="M4 6l8 7 8-7"/></svg>
          </div>
          <h2 style={{ fontFamily:serif, fontSize:24, color:T.black, margin:"0 0 10px", fontWeight:"normal" }}>Check your inbox</h2>
          <p style={{ fontFamily:sans, fontSize:13, color:T.mid, lineHeight:1.7, margin:"0 0 28px" }}>
            We sent a confirmation link to <strong style={{ color:T.ink }}>{email}</strong>. Click it to activate your account, then come back and sign in.
          </p>
          <button onClick={() => { setConfirmPending(false); setMode("signin"); }} style={{ width:"100%", padding:"14px 0", borderRadius:12, background:T.black, border:"none", color:T.white, fontSize:14, fontFamily:sans, cursor:"pointer" }}>Back to sign in</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight:"100svh", background:"transparent", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"40px 28px", boxSizing:"border-box", fontFamily:sans }}>
      <div style={{ width:"100%", maxWidth:400 }}>
        <div style={{ textAlign:"center", marginBottom:40 }}>
          <Logo stacked size={17} align="center"/>
          <p style={{ fontFamily:sans, fontSize:9, color:T.faint, textTransform:"uppercase", letterSpacing:"0.18em", margin:0 }}>Fragrance Journal</p>
        </div>

        <div style={{ background:T.lift, borderRadius:12, padding:4, display:"flex", marginBottom:24 }}>
          {[["signin","Sign in"],["signup","Create account"]].map(([m,label]) => (
            <button key={m} onClick={() => { setMode(m); setError(""); }} style={{ flex:1, padding:"9px 0", borderRadius:9, background:mode===m?T.white:"transparent", border:mode===m?`1px solid ${T.rule}`:"none", color:mode===m?T.black:T.mid, fontSize:13, fontFamily:sans, cursor:"pointer", fontWeight:mode===m?500:400, transition:"all 0.15s" }}>{label}</button>
          ))}
        </div>

        {mode === "signin" && (<>
        <button onClick={handleGoogle} disabled={loading} style={{ width:"100%", padding:"14px 0", borderRadius:12, background:T.white, border:`1px solid ${T.rule}`, color:T.ink, fontSize:14, fontFamily:sans, cursor:loading?"not-allowed":"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:10, marginBottom:20, transition:"all 0.15s" }}>
          <svg width="16" height="16" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
          <div style={{ flex:1, height:1, background:T.rule }}/>
          <span style={{ fontFamily:sans, fontSize:11, color:T.faint }}>or</span>
          <div style={{ flex:1, height:1, background:T.rule }}/>
        </div>
        </>)}

        <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:14 }}>
          {mode === "signup" && (
            <>
              <input value={inviteCode} onChange={e => { setInviteCode(e.target.value.toUpperCase()); setError(""); }} placeholder="Invite code" style={{ ...inp, letterSpacing:"0.08em" }} autoCapitalize="characters" onKeyDown={e => e.key==="Enter" && handleSubmit()}/>
              <input value={name} onChange={e => { setName(e.target.value); setError(""); }} placeholder="Your name" style={inp} onKeyDown={e => e.key==="Enter" && handleSubmit()}/>
              <div>
                <input value={username} onChange={e => { setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g,"")); setError(""); }} placeholder="Username (e.g. scenthunter_uk)" style={inp} maxLength={20} onKeyDown={e => e.key==="Enter" && handleSubmit()}/>
                <p style={{ fontFamily:sans, fontSize:11, color:T.faint, margin:"5px 0 0" }}>Letters, numbers, underscores. 3–20 characters. Publicly visible.</p>
              </div>
              <CountryPicker value={country} onChange={setCountry}/>
            </>
          )}
          <input value={email} onChange={e => { setEmail(e.target.value); setError(""); }} placeholder="Email address" type="email" style={inp} onKeyDown={e => e.key==="Enter" && handleSubmit()}/>
          <input value={password} onChange={e => { setPassword(e.target.value); setError(""); }} placeholder="Password" type="password" style={inp} onKeyDown={e => e.key==="Enter" && handleSubmit()}/>
        </div>

        <Turnstile onToken={setCaptcha} resetKey={captchaReset + mode}/>
        {error && <p style={{ fontFamily:sans, fontSize:12, color:T.bad, margin:"0 0 12px" }}>{error}</p>}

        <button onClick={handleSubmit} disabled={loading} style={{ width:"100%", padding:"15px 0", borderRadius:12, background:loading?T.faint:T.black, border:"none", color:T.white, fontSize:14, fontFamily:sans, fontWeight:600, cursor:loading?"not-allowed":"pointer", transition:"background 0.2s", marginBottom:20 }}>
          {loading ? (mode==="signup" ? "Creating account…" : "Signing in…") : (mode==="signup" ? "Create account" : "Sign in")}
        </button>

        {mode === "signin" && !showForgot && (
          <p onClick={() => { setShowForgot(true); setForgotEmail(email); setError(""); }} style={{ fontFamily:sans, fontSize:12, color:T.mid, textAlign:"center", margin:"0 0 8px", cursor:"pointer" }}>
            Forgot your password?
          </p>
        )}

        {showForgot && (
          <div style={{ background:T.lift, border:`1px solid ${T.rule}`, borderRadius:12, padding:16, marginBottom:16 }}>
            {!forgotSent ? (
              <>
                <p style={{ fontFamily:sans, fontSize:12, color:T.ink, margin:"0 0 10px", lineHeight:1.6 }}>Enter the email address on your account and we'll send a reset link.</p>
                <input value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} placeholder="Email address" type="email" style={{ ...inp, marginBottom:10 }}/>
                <div style={{ display:"flex", gap:8 }}>
                  <button onClick={() => setShowForgot(false)} style={{ flex:1, padding:"10px 0", borderRadius:10, border:`1px solid ${T.rule}`, background:T.white, color:T.mid, fontSize:12, fontFamily:sans, cursor:"pointer" }}>Cancel</button>
                  <button onClick={handleForgotSubmit} style={{ flex:2, padding:"10px 0", borderRadius:10, background:T.black, border:"none", color:T.white, fontSize:12, fontFamily:sans, cursor:"pointer" }}>Send reset link</button>
                </div>
              </>
            ) : (
              <div style={{ textAlign:"center", padding:"8px 0" }}>
                <p style={{ fontFamily:sans, fontSize:13, color:T.ink, margin:"0 0 4px", fontWeight:500 }}>Check your inbox</p>
                <p style={{ fontFamily:sans, fontSize:12, color:T.mid, margin:"0 0 12px", lineHeight:1.6 }}>A reset link has been sent to <strong>{forgotEmail}</strong>. If it doesn't arrive, check your spam folder or write to us at <span style={{ color:T.ink }}>team@memoironskin.com</span>.</p>
                <span onClick={() => { setShowForgot(false); setForgotSent(false); }} style={{ fontFamily:sans, fontSize:12, color:T.mid, cursor:"pointer" }}>Back to sign in</span>
              </div>
            )}
          </div>
        )}

        <p style={{ fontFamily:sans, fontSize:12, color:T.mid, textAlign:"center", margin:0 }}>
          Don't have early access?{" "}
          <span onClick={onWaitlist} style={{ color:T.black, fontWeight:500, cursor:"pointer" }}>Join the waitlist →</span>
        </p>
        <FooterLinks/>
      </div>
    </div>
  );
}

// ─── ONBOARDING SCREEN — shown once for Google sign-ups needing a username ────
function OnboardingScreen({ onComplete }) {
  const [username, setUsername] = useState("");
  const [country, setCountry] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [bringList, setBringList] = useState(false);

  const isValidUsername = (v) => /^[a-zA-Z0-9_]{3,20}$/.test(v.trim());

  async function handleDone() {
    if (!isValidUsername(username)) { setError("Username must be 3–20 characters, letters, numbers, or underscores only."); return; }
    setError("");
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ username: username.trim(), country: country || null, needs_setup: false })
      .eq("id", user.id);
    setLoading(false);
    if (updateError) { setError(updateError.message); return; }
    try { if (bringList) localStorage.setItem("mos_open_import", "1"); } catch (e) {}
    onComplete({ username: username.trim(), country: country || null, needs_setup: false });
  }

  const inp = {
    width: "100%", background: T.lift, border: `1px solid ${T.rule}`, borderRadius: 12,
    padding: "13px 16px", fontSize: 15, color: T.ink, outline: "none",
    fontFamily: sans, boxSizing: "border-box", WebkitAppearance: "none",
  };

  return (
    <div style={{ minHeight:"100svh", background:"transparent", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"40px 28px", boxSizing:"border-box", fontFamily:sans }}>
      <div style={{ width:"100%", maxWidth:400 }}>
        <div style={{ textAlign:"center", marginBottom:36 }}>
          <Logo stacked size={17} align="center"/>
          <p style={{ fontFamily:sans, fontSize:9, color:T.faint, textTransform:"uppercase", letterSpacing:"0.18em", margin:0 }}>Fragrance Journal</p>
        </div>
        <p style={{ fontFamily:sans, fontSize:9, color:T.mid, textTransform:"uppercase", letterSpacing:"0.14em", margin:"0 0 10px" }}>One last step</p>
        <h2 style={{ fontFamily:serif, fontSize:24, color:T.black, margin:"0 0 6px", fontWeight:"normal" }}>Set up your profile</h2>
        <p style={{ fontFamily:sans, fontSize:13, color:T.mid, lineHeight:1.65, margin:"0 0 28px" }}>Your username is how the community will know you. Choose carefully, it's how your reviews and layering combos are credited.</p>
        <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:14 }}>
          <div>
            <input value={username} onChange={e => { setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, "")); setError(""); }} placeholder="Username (e.g. scenthunter_uk)" style={inp} maxLength={20}/>
            <p style={{ fontFamily:sans, fontSize:11, color:T.faint, margin:"5px 0 0" }}>Letters, numbers, underscores. 3–20 characters.</p>
          </div>
          <CountryPicker value={country} onChange={setCountry}/>
        </div>
        <label style={{ display:"flex", alignItems:"flex-start", gap:10, fontFamily:sans, fontSize:13, color:T.mid, lineHeight:1.5, margin:"0 0 16px", cursor:"pointer" }}><input type="checkbox" checked={bringList} onChange={e => setBringList(e.target.checked)} style={{ marginTop:3 }}/>I already track fragrances in a spreadsheet or on another site. Help me bring them over.</label>
        {error && <p style={{ fontFamily:sans, fontSize:12, color:T.bad, margin:"0 0 12px" }}>{error}</p>}
        <button onClick={handleDone} disabled={loading} style={{ width:"100%", padding:"15px 0", borderRadius:12, background:loading?T.faint:T.black, border:"none", color:T.white, fontSize:14, fontFamily:sans, fontWeight:600, cursor:loading?"not-allowed":"pointer", marginBottom:12 }}>
          {loading ? "Saving…" : "Complete setup"}
        </button>
        <p style={{ fontFamily:sans, fontSize:11, color:T.faint, textAlign:"center", margin:0 }}>You can update this anytime from your profile.</p>
      </div>
    </div>
  );
}

// ─── MOCK COMMUNITY MEMBERS ───────────────────────────────────────────────────
const SILLAGE_ACCOUNT = {
  username: "memoir", name: "Memoir on Skin",
  country: "—", isFounder: false, memberNumber: 0, isTopContributor: false,
  isSillageOfficial: true,
  bio: "The Memoir on Skin team. New houses, seasonal picks, and things worth your time. Not a brand account, just people who care about this.",
  followers: 0, following: 0,
  statuses: {}, reactions: {},
  reviews: [],
  layers: [],
  posts: [
    { date:"3 days ago", text:"Just added the full Imaginary Authors catalogue. Josh Meyer has been building something quietly remarkable in Portland since 2011. Start with Slow Explosions or The Cobra & The Canary." },
    { date:"1 week ago", text:"A note on reformulations: we flag acquisition dates because they matter. Not every acquisition changes a house, but you deserve to know. Independent until proven otherwise." },
    { date:"2 weeks ago", text:"Sampling is the only honest way to buy fragrance. A bottle is a commitment. A sample is a conversation. We'll always say this." },
  ],
};

const MOCK_MEMBERS = [
  {
    username: "scentcollector_jw", name: "James W.",
    country: "GB", isFounder: true, memberNumber: 12, isTopContributor: true,
    bio: "Chasing the perfect oud since 2019. Niche only. Based in London.",
    followers: 284, following: 91,
    statuses: { 1:"bottle_owned", 2:"bottle_owned", 3:"sample_have", 4:"tried_skin" },
    reactions: { 1:"love", 2:"love", 3:"like" },
    reviews: [
      { fragId:1, fragName:"Aventus", house:"Creed", rating:5, text:"Give it 20 minutes past the opening, the smoky birch dry-down is masterful. Batch variation is real but worth the hunt.", date:"2 days ago" },
      { fragId:2, fragName:"Black Orchid", house:"Tom Ford", rating:5, text:"Divisive for a reason. On the right skin it's untouchable. Evening only.", date:"3 weeks ago" },
    ],
    layers: [
      { name:"The Library", frags:["Oud Wood","Santal 33"], ratio:"60/40", note:"Spray Oud Wood first, let it settle 2 min, then Santal 33.", isPublic:true },
    ],
  },
  {
    username: "niche_nomad", name: "Nadia M.",
    country: "FR", isFounder: true, memberNumber: 89, isTopContributor: false,
    bio: "Perfumer in training. Floral orientals and chypres. Paris.",
    followers: 156, following: 203,
    statuses: { 2:"bottle_owned", 4:"bottle_owned", 5:"sample_have" },
    reactions: { 2:"love", 4:"love", 5:"like" },
    reviews: [
      { fragId:4, fragName:"Baccarat Rouge 540", house:"MFK", rating:5, text:"Overused, yes. A masterpiece of construction? Undeniably. The saffron-amberwood combination is architectural.", date:"1 week ago" },
    ],
    layers: [
      { name:"Paris Evening", frags:["Black Orchid","Baccarat Rouge 540"], ratio:"70/30", note:"One spray each. The dark orchid grounds the luminous amber perfectly.", isPublic:true },
    ],
  },
  {
    username: "basenotebrigade", name: "Bruno K.",
    country: "DE", isFounder: false, memberNumber: null, isTopContributor: true,
    bio: "Woods, resins, leather. The drydown is everything. Berlin.",
    followers: 412, following: 67,
    statuses: { 3:"bottle_owned", 5:"bottle_owned", 6:"bottle_owned", 1:"sample_have" },
    reactions: { 3:"love", 5:"love", 6:"love", 1:"like" },
    reviews: [
      { fragId:3, fragName:"Oud Wood", house:"Tom Ford", rating:5, text:"Had three people ask what I was wearing at a conference. The papyrus note is what makes this special.", date:"2 weeks ago" },
      { fragId:6, fragName:"Tobacco Vanille", house:"Tom Ford", rating:4, text:"Rich and indulgent. Winter only. Incredibly long-lasting.", date:"1 month ago" },
    ],
    layers: [
      { name:"Winter Smoke", frags:["Tobacco Vanille","Oud Wood"], ratio:"50/50", note:"Absolutely decadent. Only for evenings when you mean it.", isPublic:true },
      { name:"Berlin Autumn", frags:["Santal 33","Oud Wood"], ratio:"40/60", note:"Earthy and smoky. Perfect for cold walks.", isPublic:true },
    ],
  },
];

// ─── EDIT PROFILE (bio, country, whether people can find you) ─────────────────
function ProfileEditor({ user, onCancel, onSaved }) {
  const [bio, setBio] = useState(user.bio || "");
  const [country, setCountry] = useState(user.country || "");
  const [disc, setDisc] = useState(user.discoverable !== false);
  const [shareMatch, setShareMatch] = useState(user.shareMatch !== false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  async function save() {
    setBusy(true); setErr("");
    const fields = { bio: bio.trim(), country: country || "", discoverable: disc, shareMatch };
    const { error } = await supabase.from("profiles").update({ bio: fields.bio || null, country: country || null, discoverable: disc, share_match: shareMatch }).eq("id", user.id);
    setBusy(false);
    if (error) { setErr("That didn't go through. Try again in a moment."); return; }
    onSaved(fields);
  }
  return (
    <div>
      <p style={{ ...FLABEL, margin:"0 0 6px" }}>Bio</p>
      <textarea value={bio} onChange={e => setBio(e.target.value.slice(0, 280))} rows={4} placeholder="A line or two about your nose." style={{ ...FIELD, padding:"12px 14px", lineHeight:1.5, resize:"vertical" }}/>
      <p style={{ fontFamily:sans, fontSize:11, color:T.faint, margin:"4px 0 18px", textAlign:"right" }}>{bio.length} / 280</p>
      <p style={{ ...FLABEL, margin:"0 0 6px" }}>Country</p>
      <CountryPicker value={country} onChange={setCountry} style={{ marginBottom:18 }}/>
      <label style={{ display:"flex", alignItems:"flex-start", gap:12, padding:"12px 14px", border:`1px solid ${T.rule}`, borderRadius:12, cursor:"pointer", marginBottom:6 }}>
        <input type="checkbox" checked={disc} onChange={e => setDisc(e.target.checked)} style={{ width:20, height:20, marginTop:1, accentColor:"var(--accent)", flexShrink:0 }}/>
        <span style={{ fontFamily:sans, fontSize:14, color:T.ink, lineHeight:1.5 }}>Let people find me by username
          <span style={{ display:"block", fontSize:12, color:T.mid, marginTop:2 }}>Your name and email are never searchable. Turning this off hides you from People search; anyone you share a post or link with can still open your profile.</span>
        </span>
      </label>
      <label style={{ display:"flex", alignItems:"flex-start", gap:12, padding:"12px 14px", border:`1px solid ${T.rule}`, borderRadius:12, cursor:"pointer", marginBottom:6 }}>
        <input type="checkbox" checked={shareMatch} onChange={e => setShareMatch(e.target.checked)} style={{ width:20, height:20, marginTop:1, accentColor:"var(--accent)", flexShrink:0 }}/>
        <span style={{ fontFamily:sans, fontSize:14, color:T.ink, lineHeight:1.5 }}>Show a taste match on my profile
          <span style={{ display:"block", fontSize:12, color:T.mid, marginTop:2 }}>Other members see one percentage comparing your taste with theirs. Never your collection, ratings, journal or wear log.</span>
        </span>
      </label>
      <p style={{ fontFamily:sans, fontSize:12, color:T.faint, margin:"0 0 16px" }}>Your username is permanent: it is how your posts and combinations are credited.</p>
      {err && <p style={{ fontFamily:sans, fontSize:12, color:T.bad, margin:"0 0 12px" }}>{err}</p>}
      <div style={{ display:"flex", gap:8 }}>
        <button onClick={save} disabled={busy} style={{ ...ctaBtn(true), flex:1, minHeight:46, fontSize:14, opacity:busy?0.6:1 }}>{busy ? "Saving" : "Save"}</button>
        <button onClick={onCancel} style={{ ...ghostBtn, minHeight:46, fontSize:14 }}>Cancel</button>
      </div>
    </div>
  );
}

// ─── FIND PEOPLE (search members by username) ─────────────────────────────────
function PeopleSearch({ initialQ, onQ, onClose, onBack, onOpenProfile, following, onToggleFollow }) {
  const [q, setQ] = useState(initialQ || "");
  const [rows, setRows] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  useEffect(() => {
    onQ && onQ(q);
    const s = q.trim().replace(/^@/, "");
    if (s.length < 2) { setRows(null); setBusy(false); setErr(""); return; }
    let live = true;
    setBusy(true);
    const t = setTimeout(async () => {
      const { data, error } = await supabase.rpc("search_members", { p_q: s, p_limit: 20 });
      if (!live) return;
      setBusy(false);
      if (error) { setErr("That didn't go through. Try again in a moment."); setRows([]); }
      else { setErr(""); setRows(data || []); }
    }, 300);
    return () => { live = false; clearTimeout(t); };
  }, [q]);
  const typed = q.trim().replace(/^@/, "").length;
  return (
    <div className="mos-sheet-wrap" onClick={onClose} style={{ position:"fixed", inset:0, zIndex:58, background:"rgba(10,10,10,0.5)", backdropFilter:"blur(12px)", display:"flex", flexDirection:"column", justifyContent:"flex-end", alignItems:"center" }}>
      <div className="mos-sheet" onClick={e => e.stopPropagation()} style={{ background:T.white, borderRadius:"24px 24px 0 0", border:`1px solid ${T.rule}`, borderBottom:"none", width:"100%", maxWidth:460, height:"85vh", display:"flex", flexDirection:"column" }}>
        <div className="mos-pad" style={{ padding:"20px 24px 14px", borderBottom:`1px solid ${T.rule}` }}>
          <BackBtn onBack={onBack || onClose}/>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", margin:"4px 0 14px" }}>
            <h2 style={{ fontFamily:serif, fontSize:24, fontWeight:400, color:T.black, margin:0, letterSpacing:-0.3 }}>Find people</h2>
            <button onClick={onClose} aria-label="Close" style={{ width:30, height:30, borderRadius:"50%", border:`1px solid ${T.rule}`, background:T.white, cursor:"pointer", fontSize:13, color:T.mid }}>✕</button>
          </div>
          <input value={q} onChange={e => setQ(e.target.value)} autoFocus autoCapitalize="none" autoCorrect="off" spellCheck={false} aria-label="Search members by username" placeholder="Search by username" style={FIELD}/>
          <p style={{ fontFamily:sans, fontSize:12, color:T.faint, margin:"8px 0 0" }}>Usernames only. Names and emails are never searchable.</p>
        </div>
        <div className="mos-pad" style={{ padding:"8px 24px 32px", overflowY:"auto", flex:1 }}>
          {typed < 2 && <p style={{ fontFamily:sans, fontSize:13, color:T.faint, padding:"16px 0", margin:0 }}>Type at least two letters.</p>}
          {typed >= 2 && busy && rows === null && <p style={{ fontFamily:sans, fontSize:13, color:T.faint, padding:"16px 0", margin:0 }}>Searching…</p>}
          {err && <p style={{ fontFamily:sans, fontSize:13, color:T.bad, padding:"16px 0", margin:0 }}>{err}</p>}
          {typed >= 2 && rows !== null && rows.length === 0 && !err && (
            <div style={{ textAlign:"center", padding:"32px 0" }}>
              <p style={{ fontFamily:serif, fontSize:18, color:T.faint, margin:"0 0 6px" }}>No one found</p>
              <p style={{ fontFamily:sans, fontSize:13, color:T.faint, margin:0, lineHeight:1.6 }}>Check the spelling. Some members choose not to appear in search.</p>
            </div>
          )}
          {(rows || []).map((m, i) => {
            const on = following.has(String(m.username).toLowerCase());
            return (
              <div key={m.username} onClick={() => onOpenProfile(m.username)} style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 0", borderBottom: i < rows.length-1 ? `1px solid ${T.lift}` : "none", cursor:"pointer" }}>
                <div style={{ width:42, height:42, borderRadius:"50%", background:T.black, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:600, color:T.white, fontFamily:sans, flexShrink:0 }}>{String(m.username).slice(0,2).toUpperCase()}</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <span style={{ fontFamily:serif, fontSize:15, color:T.black }}>@{m.username}</span>{m.country && <span style={{ marginLeft:6, fontSize:13 }}>{countryFlag(m.country)}</span>}
                  {m.bio && <p style={{ fontFamily:sans, fontSize:12, color:T.faint, margin:"2px 0 0", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{m.bio}</p>}
                </div>
                <button onClick={e => { e.stopPropagation(); onToggleFollow(m.username); }} aria-pressed={on} style={{ padding:"8px 14px", minHeight:36, borderRadius:20, background:on?T.white:T.black, border:`1px solid ${on?T.rule:T.black}`, color:on?T.mid:T.white, fontSize:12, fontFamily:sans, fontWeight:500, cursor:"pointer", flexShrink:0 }}>{on ? "Following" : "Follow"}</button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ProfilePosts({ username, onOpenProfile, onOpenFrag }) {
  const [rows, setRows] = useState(null);
  const frags = usePostFrags(rows);
  const load = async () => {
    const { data, error } = await supabase.rpc("list_posts", { p_feed: "latest", p_username: username, p_limit: 30 });
    setRows(error ? [] : (data || []));
  };
  useEffect(() => { setRows(null); load(); }, [username]);
  if (rows === null) return <p style={{ fontFamily:sans, fontSize:13, color:T.faint, padding:"16px 0", margin:0 }}>Loading…</p>;
  if (rows.length === 0) return (
    <div style={{ textAlign:"center", padding:"40px 0" }}>
      <p style={{ fontFamily:serif, fontSize:18, color:T.faint, margin:"0 0 8px" }}>Nothing shared yet</p>
      <p style={{ fontFamily:sans, fontSize:13, color:T.faint, margin:0 }}>Posts will appear here.</p>
    </div>
  );
  return <div>{rows.map(p => <PostCard key={p.id} p={p} frag={p.fragrance_id ? frags[p.fragrance_id] : null} onOpenProfile={onOpenProfile} onOpenFrag={onOpenFrag} onChanged={load}/>)}</div>;
}

// ─── PROFILE MODAL ────────────────────────────────────────────────────────────
function ProfileModal({ username, onClose, onBack, currentUser, userStatuses, onOpenFrag, isFollowing, onToggleFollow, following, onOpenProfile, onSignOut, myStats, onFindPeople, onProfileSaved }) {
  const isSelf = !!currentUser && String(currentUser.username || "").toLowerCase() === String(username || "").toLowerCase();
  const isSillage = username === "memoir";
  const mock = MOCK_MEMBERS.find(m => m.username === username);
  const [tab, setTab] = useState(mock && !isSelf ? "reviews" : "posts");
  const [real, setReal] = useState(null);   // the member's public row from the database
  const [loaded, setLoaded] = useState(isSillage);
  const [list, setList] = useState(null);   // people shown on the Following / Followers tabs
  const [editing, setEditing] = useState(false);
  const [match, setMatch] = useState(null);
  const [matchInfo, setMatchInfo] = useState(false);

  useEffect(() => {
    setMatch(null); setMatchInfo(false);
    if (isSillage || isSelf) return;
    let live = true;
    supabase.rpc("taste_match", { p_username: username }).then(({ data, error }) => { if (live && !error && data && data[0]) setMatch(data[0]); });
    return () => { live = false; };
  }, [username]);

  useEffect(() => {
    if (isSillage) return;
    let live = true;
    supabase.rpc("get_member", { p_username: username }).then(({ data, error }) => {
      if (!live) return;
      setReal(!error && data && data[0] ? data[0] : null);
      setLoaded(true);
    });
    return () => { live = false; };
  }, [username]);

  useEffect(() => {
    if (!isSelf || (tab !== "following" && tab !== "followers")) return;
    let live = true;
    setList(null);
    supabase.rpc("list_follows", { p_kind: tab }).then(({ data, error }) => { if (live) setList(error ? [] : (data || [])); });
    return () => { live = false; };
  }, [tab, isSelf, following]);

  // Real members are shown by username only. Their name and email are never shown to others.
  const member = isSillage
    ? SILLAGE_ACCOUNT
    : real
      ? { username: real.username, name: null, country: real.country || "", bio: real.bio || "", isFounder: real.member_number != null && real.member_number <= 1000, memberNumber: real.member_number, isTopContributor: !!real.is_top_contributor, followers: Number(real.followers) || 0, following: Number(real.following_count) || 0, statuses: {}, reactions: {}, reviews: [], layers: [] }
      : isSelf
        ? { ...currentUser, name: null, followers: 0, following: 0, statuses: {}, reactions: {}, reviews: [], layers: [] }
        : mock;

  if (!member) {
    if (!loaded) return null;
    return (
      <div className="mos-sheet-wrap" onClick={onClose} style={{ position:"fixed", inset:0, zIndex:60, background:"rgba(10,10,10,0.5)", backdropFilter:"blur(12px)", display:"flex", flexDirection:"column", justifyContent:"flex-end", alignItems:"center" }}>
        <div className="mos-sheet mos-pad" onClick={e => e.stopPropagation()} style={{ background:T.white, borderRadius:"24px 24px 0 0", border:`1px solid ${T.rule}`, borderBottom:"none", width:"100%", maxWidth:460, padding:"20px 24px 40px" }}>
          <BackBtn onBack={onBack||onClose}/>
          <p style={{ fontFamily:serif, fontSize:20, color:T.black, margin:"18px 0 6px" }}>We couldn't find that member</p>
          <p style={{ fontFamily:sans, fontSize:13, color:T.mid, lineHeight:1.65, margin:0 }}>They may have left, or the username may have changed.</p>
        </div>
      </div>
    );
  }

  const stats = [[member.followers || 0, "followers"], [member.following || 0, "following"]];
  if (isSelf) stats.push([Object.keys(userStatuses || {}).length, "fragrances"]);
  else if (mock && !real) stats.push([Object.keys(member.statuses || {}).length, "fragrances"]);
  const tabs = isSillage ? ["posts", "reviews"] : isSelf ? ["posts", "following", "followers"] : real ? ["posts"] : ["reviews", "layering", "collection", "in common"];

  const initials = isSillage ? "m." : (member.username || member.name || "?").slice(0, 2).toUpperCase();

  const myFragIds = new Set(Object.keys(userStatuses || {}).map(Number));
  const theirFragIds = new Set(Object.keys(member.statuses || {}).map(Number));
  const commonIds = [...myFragIds].filter(id => theirFragIds.has(id));
  const commonFrags = FRAGRANCES.filter(f => commonIds.includes(f.id));

  const publicLayers = (member.layers || []).filter(l => l.isPublic);

  return (
    <div className="mos-sheet-wrap" onClick={onClose} style={{ position:"fixed", inset:0, zIndex:60, background:"rgba(10,10,10,0.5)", backdropFilter:"blur(12px)", display:"flex", flexDirection:"column", justifyContent:"flex-end", alignItems:"center" }}>
      <div className="mos-sheet" onClick={e => e.stopPropagation()} style={{ background:T.white, borderRadius:"24px 24px 0 0", border:`1px solid ${T.rule}`, borderBottom:"none", width:"100%", maxWidth:460, maxHeight:"92vh", overflowY:"auto" }}>

        <div className="mos-pad" style={{ position:"sticky", top:0, background:T.white, zIndex:2, borderBottom:`1px solid ${T.rule}`, padding:"20px 24px 0" }}>
          <BackBtn onBack={onBack||onClose}/>
          <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:18 }}>
            <div style={{ display:"flex", alignItems:"center", gap:14 }}>
              <div style={{ width:54, height:54, borderRadius:"50%", background:isSillage?T.black:T.black, display:"flex", alignItems:"center", justifyContent:"center", fontSize:isSillage?15:18, fontWeight:600, color:T.white, fontFamily:isSillage?serif:sans, flexShrink:0, position:"relative" }}>
                {initials}
                {!isSillage && member.country && (
                  <span style={{ position:"absolute", bottom:-2, right:-2, fontSize:16, lineHeight:1 }}>{countryFlag(member.country)}</span>
                )}
              </div>
              <div>
                <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:4, flexWrap:"wrap" }}>
                  <span style={{ fontFamily:serif, fontSize:18, color:T.black, letterSpacing:-0.3 }}>{member.name || "@" + member.username}</span>
                  {isSillage && <span style={{ fontFamily:sans, fontSize:9, textTransform:"uppercase", letterSpacing:"0.1em", color:T.faint, background:T.lift, padding:"2px 7px", borderRadius:10, border:`1px solid ${T.rule}` }}>Official</span>}
                </div>
                {member.name && <span style={{ fontFamily:sans, fontSize:12, color:T.mid }}>@{member.username}</span>}
                {!isSillage && (member.isFounder || member.isTopContributor) && (
                  <div style={{ marginTop:6 }}>
                    <UserBadges user={member} size="small"/>
                  </div>
                )}
              </div>
            </div>
            <button onClick={onClose} style={{ width:30, height:30, borderRadius:"50%", border:`1px solid ${T.rule}`, background:T.white, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, color:T.mid, flexShrink:0 }}>✕</button>
          </div>

          {member.bio && (
            <p style={{ fontFamily:sans, fontSize:13, color:T.mid, lineHeight:1.65, margin:"0 0 16px" }}>{member.bio}</p>
          )}

          <div style={{ display:"flex", gap:24, marginBottom:16 }}>
            {stats.map(([num, label]) => (
              <div key={label}>
                <span style={{ fontFamily:serif, fontSize:18, color:T.black }}>{num}</span>
                <span style={{ fontFamily:sans, fontSize:11, color:T.mid, marginLeft:4 }}>{label}</span>
              </div>
            ))}
          </div>

          {isSelf && myStats && (
            <div style={{ display:"flex", gap:8, marginBottom:16 }}>
              {[["Fragrances", String(myStats.fragrances), ""], ["Best streak", String(myStats.bestStreak), myStats.bestStreak === 1 ? "day" : "days"], ["Avg wear rating", myStats.avgRating ? myStats.avgRating.toFixed(1) : "–", myStats.avgRating ? "stars" : ""]].map(([l, v, u]) => (
                <div key={l} style={{ flex:1, background:T.lift, border:`1px solid ${T.rule}`, borderRadius:14, padding:"12px 8px", textAlign:"center" }}>
                  <p style={{ fontFamily:sans, fontSize:10, color:T.mid, margin:"0 0 4px" }}>{l}</p>
                  <p style={{ fontFamily:serif, fontSize:24, lineHeight:1, color:"var(--accent)", margin:0 }}>{v}</p>
                  <p style={{ fontFamily:sans, fontSize:10, color:T.faint, margin:"3px 0 0", minHeight:12 }}>{u}</p>
                </div>))}
            </div>
          )}

          {!isSelf && (
            <div style={{ display:"flex", gap:8, marginBottom:18 }}>
              <button
                onClick={async () => { if (isSillage || !onToggleFollow) return; const n = await onToggleFollow(username); if (typeof n === "number" && !isNaN(n)) setReal(r => r ? { ...r, followers: n } : r); }}
                style={{ flex:1, padding:"11px 0", borderRadius:12, background:isFollowing?T.white:T.black, border:`1px solid ${isFollowing?T.rule:T.black}`, color:isFollowing?T.mid:T.white, fontSize:13, fontFamily:sans, fontWeight:500, cursor:isSillage?"default":"pointer", transition:"all 0.2s", opacity: isSillage ? 0.7 : 1 }}
              >
                {isSillage ? "Following" : isFollowing ? "Following" : "Follow"}
              </button>
              {!isSelf && commonFrags.length > 0 && (
                <div style={{ display:"flex", alignItems:"center", gap:8, padding:"11px 14px", borderRadius:12, border:`1px solid ${T.rule}`, background:T.lift }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T.mid} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="9" cy="9" r="4"/><circle cx="15" cy="9" r="4"/>
                    <path d="M12 5.5 A4 4 0 0 1 12 12.5 A4 4 0 0 1 12 5.5Z" fill={T.faint} stroke="none"/>
                  </svg>
                  <span style={{ fontFamily:sans, fontSize:12, color:T.mid, whiteSpace:"nowrap" }}>{commonFrags.length} in common</span>
                </div>
              )}
            </div>
          )}

          {!isSelf && !isSillage && real && match && match.reason !== "none" && (
            <div style={{ marginBottom:18 }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
                {match.reason === "ok"
                  ? <span style={{ fontFamily:sans, fontSize:14, fontWeight:700, padding:"7px 14px", borderRadius:20, background:"var(--tang-soft)", border:"1px solid var(--tang-line)", color:"var(--tang-ink)" }}>{match.score}% taste match</span>
                  : <span style={{ fontFamily:sans, fontSize:13, padding:"7px 14px", borderRadius:20, background:T.lift, border:`1px solid ${T.rule}`, color:T.mid }}>Taste match not available</span>}
                <button onClick={() => setMatchInfo(v => !v)} aria-expanded={matchInfo} style={{ background:"none", border:"none", padding:0, fontFamily:sans, fontSize:13, color:T.mid, textDecoration:"underline", cursor:"pointer" }}>Match info</button>
              </div>
              {matchInfo && (
                <p style={{ fontFamily:sans, fontSize:13, color:T.mid, lineHeight:1.65, margin:"10px 0 0" }}>
                  {match.reason === "ok" && "This compares the notes, accords and fragrances in your collections and ratings with theirs. It is one number, never a verdict on anyone's nose. "}
                  {match.reason === "me_few" && "Add at least three fragrances you own, love or like to your collection and you'll see how your taste compares. "}
                  {match.reason === "them_few" && "This could be because they haven't added enough fragrances yet. "}
                  {match.reason === "hidden" && "This member has chosen not to show a taste match. "}
                  {match.reason === "ok" && "Scores update as either of you adds to your collection. "}
                  We never show anyone's collection, ratings, journal or wear log, and you can switch your own match off in Edit profile.
                </p>
              )}
            </div>
          )}

          {isSelf && (
            <div style={{ display:"flex", gap:8, marginBottom:18 }}>
              <button onClick={() => setEditing(e => !e)} aria-expanded={editing} style={{ flex:1, padding:"11px 0", borderRadius:12, border:`1px solid ${editing?T.black:T.rule}`, background:T.white, color:editing?T.black:T.mid, fontSize:13, fontFamily:sans, cursor:"pointer" }}>
                {editing ? "Close editor" : "Edit profile"}
              </button>
              <button onClick={() => onFindPeople && onFindPeople()} style={{ flex:1, padding:"11px 0", borderRadius:12, border:`1px solid ${T.rule}`, background:T.white, color:T.mid, fontSize:13, fontFamily:sans, cursor:"pointer" }}>
                Find people
              </button>
              <button onClick={onSignOut} style={{ padding:"11px 18px", borderRadius:12, border:`1px solid ${T.rule}`, background:T.white, color:T.bad, fontSize:13, fontFamily:sans, cursor:"pointer" }}>
                Sign out
              </button>
            </div>
          )}

          {isSelf && (
            <div style={{ marginBottom:18 }}>
              <Lbl mb={8}>Appearance</Lbl>
              <AppearancePicker/>
            </div>
          )}

          <div className="mos-dtabs" style={{ display:"flex", gap:0, overflowX:"auto" }}>
            {tabs.map(t => (
              (t === "in common" && (isSelf || commonFrags.length === 0)) ? null : (
                <button key={t} onClick={() => { setTab(t); setEditing(false); }} style={{ marginRight:16, paddingBottom:12, fontSize:10, textTransform:"uppercase", letterSpacing:"0.08em", color:tab===t?T.black:T.faint, background:"none", border:"none", borderBottom:tab===t?`2px solid ${T.black}`:"2px solid transparent", marginBottom:-1, cursor:"pointer", whiteSpace:"nowrap", fontFamily:sans }}>
                  {t}{t==="layering"&&publicLayers.length>0?` (${publicLayers.length})`:""}
                </button>
              )
            ))}
          </div>
        </div>

        <div className="mos-pad" style={{ padding:"20px 24px 40px" }}>

          {editing && isSelf && (
            <ProfileEditor user={currentUser} onCancel={() => setEditing(false)} onSaved={fields => { onProfileSaved && onProfileSaved(fields); setReal(r => r ? { ...r, bio: fields.bio, country: fields.country } : r); setEditing(false); }}/>
          )}

          {!editing && tab === "posts" && !isSillage && !mock && (
            <ProfilePosts username={member.username} onOpenProfile={onOpenProfile} onOpenFrag={onOpenFrag}/>
          )}

          {!editing && tab === "posts" && isSillage && (
            <div>
              {(SILLAGE_ACCOUNT.posts || []).map((p, i) => (
                <div key={i} style={{ paddingBottom:20, marginBottom:20, borderBottom:i < SILLAGE_ACCOUNT.posts.length-1 ? `1px solid ${T.lift}` : "none" }}>
                  <p style={{ fontFamily:sans, fontSize:13, color:T.ink, lineHeight:1.75, margin:"0 0 6px" }}>{p.text}</p>
                  <p style={{ fontFamily:sans, fontSize:11, color:T.faint, margin:0 }}>{p.date}</p>
                </div>
              ))}
            </div>
          )}

          {!editing && (tab === "following" || tab === "followers") && isSelf && (
            <div>
              {tab === "following" && (
                <div onClick={() => onOpenProfile && onOpenProfile("memoir")} style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 0", borderBottom:`1px solid ${T.lift}`, cursor:"pointer" }}>
                  <div style={{ width:40, height:40, borderRadius:"50%", background:T.black, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:600, color:T.white, fontFamily:serif, flexShrink:0 }}>m.</div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                      <span style={{ fontFamily:serif, fontSize:14, color:T.black }}>Memoir on Skin</span>
                      <span style={{ fontFamily:sans, fontSize:9, textTransform:"uppercase", letterSpacing:"0.1em", color:T.faint, background:T.lift, padding:"1px 6px", borderRadius:8, border:`1px solid ${T.rule}` }}>Official</span>
                    </div>
                    <span style={{ fontFamily:sans, fontSize:11, color:T.faint }}>@memoir</span>
                  </div>
                  <span style={{ fontFamily:sans, fontSize:10, color:T.faint }}>Always following</span>
                </div>
              )}
              {list === null && <p style={{ fontFamily:sans, fontSize:13, color:T.faint, padding:"16px 0", margin:0 }}>Loading…</p>}
              {list !== null && list.length === 0 && (
                <div style={{ textAlign:"center", padding:"32px 0 8px" }}>
                  <p style={{ fontFamily:serif, fontSize:18, color:T.faint, margin:"0 0 8px" }}>{tab === "following" ? "You aren't following anyone yet" : "No followers yet"}</p>
                  <p style={{ fontFamily:sans, fontSize:13, color:T.faint, margin:"0 0 16px", lineHeight:1.6 }}>{tab === "following" ? "Search by username to find other members." : "Followers show up here when someone follows you."}</p>
                  {tab === "following" && <button onClick={() => onFindPeople && onFindPeople()} style={{ ...ctaBtn(true), width:"auto", padding:"0 24px", minHeight:44, fontSize:14 }}>Find people</button>}
                </div>
              )}
              {(list || []).map((m, i) => (
                <div key={m.username} onClick={() => onOpenProfile && onOpenProfile(m.username)} style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 0", borderBottom: i < list.length-1 ? `1px solid ${T.lift}` : "none", cursor:"pointer" }}>
                  <div style={{ width:40, height:40, borderRadius:"50%", background:T.black, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:600, color:T.white, fontFamily:sans, flexShrink:0 }}>{(m.username||"?").slice(0,2).toUpperCase()}</div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <span style={{ fontFamily:serif, fontSize:14, color:T.black }}>@{m.username}</span>{m.country && <span style={{ marginLeft:6, fontSize:13 }}>{countryFlag(m.country)}</span>}
                    {m.bio && <p style={{ fontFamily:sans, fontSize:11, color:T.faint, margin:"2px 0 0", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{m.bio}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {!editing && tab === "reviews" && (
            <div>
              {(member.reviews || []).length === 0 ? (
                <div style={{ textAlign:"center", padding:"40px 0" }}>
                  <p style={{ fontFamily:serif, fontSize:18, color:T.faint, margin:"0 0 8px" }}>No reviews yet</p>
                  <p style={{ fontFamily:sans, fontSize:13, color:T.faint }}>Reviews will appear here when posted.</p>
                </div>
              ) : (
                (member.reviews || []).map((r, i) => (
                  <ReviewCard key={i} who={member.username} whoLabel={member.name} date={r.date} text={r.text}
                    fragName={r.fragName} house={r.house} helpful={0} replyCount={0} onFrag={() => { onOpenFrag && onOpenFrag(r.fragId); }}/>
                ))
              )}
            </div>
          )}

          {tab === "layering" && (
            <div>
              {publicLayers.length === 0 ? (
                <div style={{ textAlign:"center", padding:"40px 0" }}>
                  <p style={{ fontFamily:serif, fontSize:18, color:T.faint, margin:"0 0 8px" }}>No public combinations</p>
                  <p style={{ fontFamily:sans, fontSize:13, color:T.faint }}>Public layering combos will appear here.</p>
                </div>
              ) : (
                publicLayers.map((l, i) => (
                  <div key={i} style={{ marginBottom:12, padding:16, background:T.lift, borderRadius:14, border:`1px solid ${T.rule}` }}>
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
                      <p style={{ fontFamily:serif, fontSize:16, color:T.black, margin:0 }}>{l.name}</p>
                      <span style={{ fontFamily:sans, fontSize:10, color:T.mid }}>{l.ratio}</span>
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10, flexWrap:"wrap" }}>
                      {l.frags.map((frag, fi) => (
                        <span key={fi} style={{ display:"flex", alignItems:"center", gap:4 }}>
                          <span style={{ fontFamily:sans, fontSize:12, padding:"4px 10px", borderRadius:20, background:fi===0?T.black:T.white, color:fi===0?T.white:T.ink, border:`1px solid ${fi===0?T.black:T.rule}` }}>{frag}</span>
                          {fi < l.frags.length - 1 && <span style={{ color:T.faint, fontSize:11 }}>+</span>}
                        </span>
                      ))}
                    </div>
                    <p style={{ fontFamily:sans, fontSize:12, color:T.mid, lineHeight:1.65, margin:0 }}>{l.note}</p>
                  </div>
                ))
              )}
            </div>
          )}

          {tab === "collection" && (
            <div>
              {Object.keys(member.statuses || {}).length === 0 ? (
                <div style={{ textAlign:"center", padding:"40px 0" }}>
                  <p style={{ fontFamily:serif, fontSize:18, color:T.faint, margin:"0 0 8px" }}>Collection private</p>
                  <p style={{ fontFamily:sans, fontSize:13, color:T.faint }}>This member hasn't shared their collection.</p>
                </div>
              ) : (
                FRAGRANCES.filter(f => member.statuses[f.id]).map(f => {
                  const st = STATUSES.find(s => s.key === member.statuses[f.id]);
                  const isShared = commonIds.includes(f.id);
                  return (
                    <div key={f.id} onClick={() => { onOpenFrag && onOpenFrag(f.id); }} style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 0", borderBottom:`1px solid ${T.rule}`, cursor:"pointer" }}>
                      <div style={{ width:38, height:38, borderRadius:9, background:T.lift, border:`1px solid ${T.rule}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                        <span style={{ fontFamily:serif, fontSize:10, color:T.ink }}>{f.name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase()}</span>
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                          <p style={{ fontFamily:serif, fontSize:14, color:T.black, margin:0 }}>{f.name}</p>
                          {isShared && (
                            <span style={{ fontFamily:sans, fontSize:9, padding:"1px 6px", borderRadius:10, background:T.press, color:T.mid }}>you both</span>
                          )}
                        </div>
                        <p style={{ fontFamily:sans, fontSize:11, color:T.mid, margin:"2px 0 0" }}>{f.house}</p>
                      </div>
                      {st && (
                        <span style={{ fontFamily:sans, fontSize:9, color:T.mid, textAlign:"right", flexShrink:0 }}>{st.label.split("—")[0].trim()}</span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {tab === "in common" && !isSelf && (
            <div>
              {commonFrags.length === 0 ? (
                <div style={{ textAlign:"center", padding:"40px 0" }}>
                  <p style={{ fontFamily:serif, fontSize:18, color:T.faint, margin:"0 0 8px" }}>No overlap yet</p>
                  <p style={{ fontFamily:sans, fontSize:13, color:T.faint }}>You haven't tried any of the same fragrances.</p>
                </div>
              ) : (
                <>
                  <div style={{ background:T.lift, borderRadius:12, padding:"12px 16px", marginBottom:16, border:`1px solid ${T.rule}`, display:"flex", alignItems:"center", gap:12 }}>
                    <div style={{ width:36, height:36, borderRadius:"50%", background:T.black, display:"flex", alignItems:"center", justifyContent:"center" }}>
                      <span style={{ fontFamily:serif, fontSize:14, color:T.white }}>{commonFrags.length}</span>
                    </div>
                    <div>
                      <p style={{ fontFamily:sans, fontSize:12, fontWeight:500, color:T.ink, margin:0 }}>Fragrances in common with @{member.username}</p>
                      <p style={{ fontFamily:sans, fontSize:11, color:T.mid, margin:"2px 0 0" }}>You've both experienced these.</p>
                    </div>
                  </div>
                  {commonFrags.map(f => {
                    const myReaction = (userStatuses || {})[f.id];
                    const theirReaction = (member.reactions || {})[f.id];
                    return (
                      <div key={f.id} onClick={() => { onOpenFrag && onOpenFrag(f.id); }} style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 0", borderBottom:`1px solid ${T.rule}`, cursor:"pointer" }}>
                        <div style={{ width:38, height:38, borderRadius:9, background:T.lift, border:`1px solid ${T.rule}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                          <span style={{ fontFamily:serif, fontSize:10, color:T.ink }}>{f.name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase()}</span>
                        </div>
                        <div style={{ flex:1 }}>
                          <p style={{ fontFamily:serif, fontSize:14, color:T.black, margin:"0 0 2px" }}>{f.name}</p>
                          <p style={{ fontFamily:sans, fontSize:11, color:T.mid, margin:0 }}>{f.house}</p>
                        </div>
                        <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:3 }}>
                          {myReaction && <span style={{ fontFamily:sans, fontSize:9, color:T.mid }}>You: {myReaction}</span>}
                          {theirReaction && <span style={{ fontFamily:sans, fontSize:9, color:T.mid }}>They: {theirReaction}</span>}
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function SillageApp() {
  const [appScreen, setAppScreen] = useState("loading"); // loading | waitlist | login | onboarding | app
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState("Discover");
  const [isOwnerRoot, setIsOwnerRoot] = useState(false);
  const [adminHome, setAdminHome] = useState(true);
  useEffect(() => { if (appScreen !== "app") return; let on = true; supabase.rpc("is_admin").then(r => { if (on && !r.error && r.data === true) setIsOwnerRoot(true); }, () => {}); return () => { on = false; }; }, [appScreen]);
  const [modalFragId, setModalFragId] = useState(null);
  const [showSuggest, setShowSuggest] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [eventsOpen, setEventsOpen] = useState(false);
  const [profileUsername, setProfileUsername] = useState(null);
  const [peopleOpen, setPeopleOpen] = useState(false);
  const [peopleQ, setPeopleQ] = useState("");
  const [bellCount, setBellCount] = useState(0);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifTarget, setNotifTarget] = useState(null);
  const [userStatuses, setUserStatuses] = useState({});
  const [statusSets, setStatusSets] = useState({});
  const [finishes, setFinishes] = useState({});
  const [sizes, setSizes] = useState({});
  const [privateNotes, setPrivateNotes] = useState({});
  const [reactions, setReactions] = useState({});
  const [journalEntries, setJournalEntries] = useState([]);
  const [wears, setWears] = useState([]);
  const [layers, setLayers] = useState([]);
  const [saveIssue, setSaveIssue] = useState("");
  // following: Set of usernames the current user follows. the official account is always included.
  const [following, setFollowing] = useState(new Set(["memoir"]));
  const [fragrances, setFragrances] = useState(FRAGRANCES);
  const [fragLoading, setFragLoading] = useState(false);

  // ─── AUTH: session check + profile routing ────────────────────────────────
  useEffect(() => {
    let active = true;

    async function routeSession(session) {
      if (!session) {
        if (active) { setCurrentUser(null); setAppScreen("waitlist"); }
        return;
      }
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .maybeSingle();

      if (!active) return;
      if (error || !profile) {
        // Session exists but no profile row yet (trigger lag) — treat as needing setup.
        setCurrentUser({ id: session.user.id, email: session.user.email, username: "", needs_setup: true });
        setAppScreen("onboarding");
        return;
      }
      const user = {
        id: profile.id,
        email: session.user.email,
        username: profile.username,
        name: profile.display_name || profile.username,
        country: profile.country || "",
        bio: profile.bio || "",
        discoverable: profile.discoverable !== false,
        shareMatch: profile.share_match !== false,
        regionOverride: profile.region_override || "",
        isFounder: profile.member_number != null && profile.member_number <= 1000,
        memberNumber: profile.member_number,
        isTopContributor: !!profile.is_top_contributor,
      };
      setCurrentUser(user);
      setAppScreen(profile.needs_setup ? "onboarding" : "app");
    }

    supabase.auth.getSession().then(({ data: { session } }) => routeSession(session));

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      routeSession(session);
    });

    return () => { active = false; listener.subscription.unsubscribe(); };
  }, []);

  // ─── FRAGRANCE CATALOGUE: live from Supabase ──────────────────────────────
  // The library is large, so Discover asks the database for shelves and search results
  // instead of loading everything. Anything loaded is kept in `fragrances` so it can be opened later.
  const [serverShelves, setServerShelves] = useState(null);
  const [brandRef, setBrandRef] = useState(null);
  const [perfumerRef, setPerfumerRef] = useState(null);
  function mergeFrags(list) {
    setFragrances(prev => {
      const map = new Map(prev.filter(p => typeof p.id === "string").map(p => [p.id, p]));
      list.forEach(f => map.set(f.id, f));
      return [...map.values()];
    });
  }
  useEffect(() => { fragSink.fn = mergeFrags; return () => { fragSink.fn = null; }; }, []);
  async function searchFrags(q, group, offset) {
    if (!offset) trackSearch(q);
    const { data: hits, error } = await supabase.rpc("search_fragrances", { q, grp: group, lim: 24, off: offset });
    if (error) throw error;
    const ids = (hits || []).map(h => h.id);
    const total = ids.length ? Number(hits[0].total) : 0;
    if (!ids.length) return { items: [], total };
    const { data, error: e2 } = await fetchFragRows(sel => supabase.from("fragrances").select(sel).in("id", ids));
    if (e2) throw e2;
    const mapped = data.map(mapFrag);
    mergeFrags(mapped);
    const byId = new Map(mapped.map(f => [f.id, f]));
    return { items: ids.map(id => byId.get(id)).filter(Boolean), total };
  }
  useEffect(() => {
    const SHELF_META = {
      new: ["New to the shelf", "The most recent releases in the library."],
      indie: ["Indie houses", "Made by houses that answer to no conglomerate."],
      niche: ["Niche houses", "Small houses where fragrance is the whole point."],
      designer: ["Heritage houses", "The long-established names most people meet first."],
      "acc-woody": ["Woody", ACCORD_BLURBS.woody || "Fragrances built around woody."],
      "acc-floral": ["Floral", ACCORD_BLURBS.floral || "Fragrances built around floral."],
      "acc-citrus": ["Citrus", ACCORD_BLURBS.citrus || "Fragrances built around citrus."],
      "acc-sweet": ["Gourmand", ACCORD_BLURBS.gourmand],
    };
    async function loadFragrances() {
      setFragLoading(true);
      try {
        // Preferred path: shelves chosen by the database.
        const { data: rows, error: shErr } = await supabase.rpc("discover_shelves");
        if (!shErr && rows && rows.length) {
          const ids = [...new Set(rows.map(r => r.id))];
          const { data, error } = await fetchFragRows(sel => supabase.from("fragrances").select(sel).in("id", ids));
          if (!error && data) {
            const mapped = data.map(mapFrag);
            mergeFrags(mapped);
            const byId = new Map(mapped.map(f => [f.id, f]));
            const shelves = Object.keys(SHELF_META).map(key => {
              const items = rows.filter(r => r.shelf === key).sort((x, y) => x.pos - y.pos).map(r => byId.get(r.id)).filter(Boolean);
              return { key, title: SHELF_META[key][0], blurb: SHELF_META[key][1], items };
            }).filter(s => s.items.length >= 2);
            if (PREVIEW_NEW_HOUSES.length) {
              try {
                let pm = [];
                for (const hs of PREVIEW_NEW_HOUSES) {
                  const { data: ph } = await supabase.from("houses").select("id, name").eq("slug", hs).maybeSingle();
                  if (!ph) continue;
                  const pr = await fetchFragRows(sel => supabase.from("fragrances").select(sel).eq("house_id", ph.id).not("image_url", "is", null).order("created_at", { ascending: false }).order("slug", { ascending: true }).limit(6));
                  if (!pr.error && pr.data) pm = pm.concat(pr.data.map(mapFrag));
                }
                if (pm.length >= 2) {
                  mergeFrags(pm);
                  const ns = { key: "new", title: "New to the shelf", blurb: "The most recent releases in the library.", items: pm };
                  const ix = shelves.findIndex(x => x.key === "new");
                  if (ix >= 0) shelves[ix] = ns; else shelves.unshift(ns);
                }
              } catch (e) {}
            }
            try {
              const nr = await fetchFragRows(sel => supabase.from("fragrances").select(sel).eq("neo_gourmand", true).order("image_url", { ascending: false, nullsFirst: false }).limit(24));
              if (!nr.error && nr.data && nr.data.length) {
                const nm = nr.data.map(mapFrag); mergeFrags(nm);
                const nix = shelves.findIndex(x => x.key === "new");
                shelves.splice(nix >= 0 ? nix + 1 : 0, 0, { key: "neo", title: "Neo gourmand", blurb: NEO_BLURB, items: nm });
              }
            } catch (e) {}
            try {
              const { data: dh } = await supabase.from("houses").select("id, slug, diversity").not("diversity", "is", null).neq("diversity", "");
              const catOf = d => cleanDiversity(d).replace(/\s*\(.*\)\s*$/, "").trim();
              const divHouses = (dh || []).filter(h => cleanDiversity(h.diversity) || isWomanOwned(h.diversity));
              const slugCat = new Map(divHouses.map(h => [h.slug, [cleanDiversity(h.diversity) ? catOf(h.diversity) : "", isWomanOwned(h.diversity) ? "Woman-owned" : ""].filter(Boolean)]));
              if (divHouses.length) {
                const dr = await fetchFragRows(sel => supabase.from("fragrances").select(sel).in("house_id", divHouses.map(h => h.id)).order("image_url", { ascending: false, nullsFirst: false }).order("slug", { ascending: true }).limit(300));
                if (!dr.error && dr.data && dr.data.length) {
                  const perHouse = {}, byCat = {};
                  // Houses with approved photos come first (A.N. Other, Jijide), the rest keep their order.
                  const DIV_FIRST = ["a-n-other", "jijide"], dprio = row => { const i = DIV_FIRST.indexOf(row.house && row.house.slug); return i < 0 ? 99 : i; };
                  dr.data.sort((a, b) => dprio(a) - dprio(b));
                  dr.data.forEach(row => {
                    const hs = row.house && row.house.slug; const cs = slugCat.get(hs); if (!cs || !cs.length) return;
                    perHouse[hs] = (perHouse[hs] || 0) + 1;
                    if (perHouse[hs] > 4) return;
                    cs.forEach(c => { (byCat[c] = byCat[c] || []).push(row); });
                  });
                  const cats = Object.keys(byCat).filter(c => c !== "Woman-owned" && byCat[c].length >= 2).sort((a, b) => (byCat[b].some(r => dprio(r) < 99) - byCat[a].some(r => dprio(r) < 99)) || (byCat[b].length - byCat[a].length)).slice(0, 6);
                  if (byCat["Woman-owned"] && byCat["Woman-owned"].length >= 2) cats.push("Woman-owned");
                  const groups = {};
                  cats.forEach(c => { const m = byCat[c].slice(0, 12).map(mapFrag); mergeFrags(m); groups[c] = m; });
                  const mixed = [], seenM = new Set(), pushM = f => { if (f && !seenM.has(f.id)) { seenM.add(f.id); mixed.push(f); } };
                  const fc = {}; dr.data.filter(r => dprio(r) < 99 && slugCat.get(r.house && r.house.slug)).forEach(r => { const hs = r.house.slug; fc[hs] = (fc[hs] || 0) + 1; if (fc[hs] > 4) return; const f = mapFrag(r); mergeFrags([f]); pushM(f); });
                  for (let i = 0; i < 12; i++) cats.forEach(c => { if (groups[c][i]) pushM(groups[c][i]); });
                  const divShelves = cats.length ? [{ key: "diversity", title: "Diversity", blurb: "Houses founded and owned by people the big names often overlook. Pick a group to filter.", items: mixed.slice(0, 18), groups }] : [];
                  if (divShelves.length) {
                    const anchor = shelves.findIndex(x => x.key === "neo") >= 0 ? shelves.findIndex(x => x.key === "neo") : shelves.findIndex(x => x.key === "new");
                    shelves.splice(anchor + 1, 0, ...divShelves);
                  }
                }
              }
            } catch (e) {}
            try {
              // "Most shared notes": cross-house pairs with the most notes in common. One pair per house so a single house cannot fill the shelf.
              const { data: sp } = await supabase.from("fragrance_similar").select("fragrance_id, similar_id, shared_count, score").eq("same_house", false).gte("score", 0.5).order("shared_count", { ascending: false }).order("score", { ascending: false }).limit(400);
              if (sp && sp.length) {
                const seen = new Set(), pairs = [];
                for (const r of sp) {
                  if (seen.has(r.fragrance_id) || seen.has(r.similar_id)) continue;
                  seen.add(r.fragrance_id); seen.add(r.similar_id); pairs.push(r);
                  if (pairs.length >= 60) break;
                }
                const pids = [...new Set(pairs.flatMap(r => [r.fragrance_id, r.similar_id]))];
                const pr = await fetchFragRows(sel => supabase.from("fragrances").select(sel).in("id", pids));
                if (!pr.error && pr.data && pr.data.length) {
                  const pm = pr.data.map(mapFrag); mergeFrags(pm);
                  const pby = new Map(pm.map(f => [f.id, f]));
                  const usedHouse = new Set(), items = [];
                  for (const r of pairs) {
                    const a = pby.get(r.fragrance_id), b = pby.get(r.similar_id);
                    if (!a || !b) continue;
                    const ha = a.houseSlug || a.house, hb = b.houseSlug || b.house;
                    if (usedHouse.has(ha) || usedHouse.has(hb)) continue;
                    usedHouse.add(ha); usedHouse.add(hb); items.push(a, b);
                    if (items.length >= 12) break;
                  }
                  // Hidden until after Christmas 2026 (owner decision Nov 19). Set to true on Dec 27 to bring "Most shared notes" back.
                  const SHOW_SHARED_SHELF = false;
                  if (SHOW_SHARED_SHELF && items.length >= 4) {
                    const hix = shelves.findIndex(x => x.key === "designer");
                    const dix = shelves.findIndex(x => x.key === "diversity");
                    const aix = hix >= 0 ? hix : (dix >= 0 ? dix : (shelves.findIndex(x => x.key === "neo") >= 0 ? shelves.findIndex(x => x.key === "neo") : shelves.findIndex(x => x.key === "new")));
                    shelves.splice(aix + 1, 0, { key: "shared", title: "Most shared notes", blurb: "Pairs from different houses that share the most notes. Each pair sits side by side. Open one to see what they have in common.", items });
                  }
                }
              }
            } catch (e) {}
            setServerShelves(shelves);
            return;
          }
        }
        // Fallback while the search functions are not installed: first 200 alphabetically.
        const { data, error } = await fetchFragRows(sel => supabase.from("fragrances").select(sel).order("slug", { ascending: true }).limit(200));
        if (error) { console.error("Supabase error:", error); return; }
        mergeFrags(data.map(mapFrag));
      } catch (err) {
        console.error("Failed to load fragrances:", err);
      } finally {
        setFragLoading(false);
      }
    }
    loadFragrances();
  }, []);

  // ─── MEMBER DATA: saved to Supabase so nothing is lost on refresh or a new device ─
  const uid = currentUser && currentUser.id;
  const isUuid = s => typeof s === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-/i.test(s);
  const issueTimer = useRef(null);
  function flagSave(err) {
    console.error("Save failed:", err);
    setSaveIssue("That didn't go through. Try again in a moment. It is on your screen but may not be kept.");
    clearTimeout(issueTimer.current);
    issueTimer.current = setTimeout(() => setSaveIssue(""), 7000);
  }
  async function saveUserFrag(fragId, patch) {
    if (!uid || !isUuid(fragId)) return;
    const { error } = await supabase.from("user_fragrances").upsert({ user_id: uid, fragrance_id: fragId, ...patch, updated_at: new Date().toISOString() }, { onConflict: "user_id,fragrance_id" });
    if (error) flagSave(error);
  }
  // Members who ticked "I have a list to bring in" at sign-up get the import sheet once, in their collection.
  useEffect(() => {
    if (!uid || appScreen !== "app") return;
    try { if (localStorage.getItem("mos_open_import") === "1") { localStorage.removeItem("mos_open_import"); setActiveTab("Collection"); setImportOpen(true); } } catch (e) {}
  }, [uid, appScreen]);
  async function applyImport(items) {
    let added = 0, already = 0; const rowsOut = []; const nextSets = { ...statusSets }; const nextSt = { ...userStatuses };
    items.forEach(({ frag, status }) => {
      const before = nextSets[frag.id] || [];
      if (before.includes(status)) { already++; return; }
      const after = toggleStatus(before, status), prim = primaryStatus(after);
      nextSets[frag.id] = after; nextSt[frag.id] = prim; added++;
      rowsOut.push({ user_id: uid, fragrance_id: frag.id, status: prim, statuses: after, updated_at: new Date().toISOString() });
    });
    setStatusSets(nextSets); setUserStatuses(nextSt);
    if (uid) for (let i = 0; i < rowsOut.length; i += 200) {
      const { error } = await supabase.from("user_fragrances").upsert(rowsOut.slice(i, i + 200).filter(r => isUuid(r.fragrance_id)), { onConflict: "user_id,fragrance_id" });
      if (error) { flagSave(error); break; }
    }
    trackEvent("collection_import", { source: "import", detail: String(added) });
    return { added, already };
  }
  useEffect(() => {
    setUserStatuses({}); setStatusSets({}); setFinishes({}); setReactions({}); setPrivateNotes({}); setJournalEntries([]); setLayers([]); setWears([]);
    if (!uid) return;
    let off = false;
    (async () => {
      try {
        const [uf, je, ly, wr] = await Promise.all([
          pageAll((a, b) => supabase.from("user_fragrances").select("fragrance_id, status, statuses, reaction, note, finished_on, rebuy, size_ml").eq("user_id", uid).order("fragrance_id").range(a, b)),
          pageAll((a, b) => supabase.from("journal_entries").select("*").eq("user_id", uid).order("created_at", { ascending: false }).order("id").range(a, b)),
          pageAll((a, b) => supabase.from("layerings").select("*").eq("user_id", uid).order("created_at", { ascending: false }).order("id").range(a, b)),
          pageAll((a, b) => supabase.from("wears").select("id, fragrance_id, worn_on, occasion, weather, occasions, weathers, rating, moods").eq("user_id", uid).order("worn_on", { ascending: false }).order("id").range(a, b)),
        ]);
        if (off) return;
        if (uf.error || je.error || ly.error) { console.error("Could not load your saved data:", uf.error || je.error || ly.error); return; }
        const st = {}, sets = {}, rx = {}, nt = {}, fin = {}, szs = {};
        (uf.data || []).forEach(r => { if (r.size_ml) szs[r.fragrance_id] = r.size_ml; if (r.finished_on || r.rebuy) fin[r.fragrance_id] = { on: r.finished_on || null, rebuy: r.rebuy || null }; const set = (r.statuses && r.statuses.length) ? r.statuses : (r.status ? [r.status] : []); if (set.length) { sets[r.fragrance_id] = set; st[r.fragrance_id] = primaryStatus(set) || r.status; } if (r.reaction) rx[r.fragrance_id] = r.reaction; if (r.note) nt[r.fragrance_id] = r.note; });
        setUserStatuses(st); setStatusSets(sets); setFinishes(fin); setSizes(szs); setReactions(rx); setPrivateNotes(nt);
        if (!wr.error) setWears((wr.data || []).map(r => ({ id: r.id, fragId: r.fragrance_id, date: r.worn_on, occasion: r.occasion, weather: r.weather, occasions: (r.occasions && r.occasions.length) ? r.occasions : (r.occasion ? [r.occasion] : []), weathers: (r.weathers && r.weathers.length) ? r.weathers : (r.weather ? [r.weather] : []), rating: r.rating, moods: r.moods || [] })));
        setJournalEntries((je.data || []).map(r => ({ id: r.id, fragId: r.fragrance_id, fragName: r.frag_name, house: r.house, family: r.family, prompt: r.prompt, text: r.body, where: r.where_text, date: r.entry_date, shared: r.shared, publishedAsReview: r.published_as_review, reviewRating: r.review_rating, answers: r.answers || {} })));
        setLayers((ly.data || []).map(r => ({ id: r.id, name: r.name, frags: r.frags || [], ratio: r.ratio, layerWith: r.layer_with, note: r.note, rating: r.rating, isPublic: r.is_public, date: new Date(r.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) })));
        // Make sure every fragrance in the collection is loaded so the Collection tab can show it.
        const ids = [...new Set((uf.data || []).filter(r => r.status || r.reaction).map(r => r.fragrance_id).concat((wr.data || []).map(r => r.fragrance_id)))];
        for (let i = 0; i < ids.length; i += 100) {
          const chunk = ids.slice(i, i + 100);
          const { data } = await fetchFragRows(sel => supabase.from("fragrances").select(sel).in("id", chunk));
          if (off) return;
          if (data) mergeFrags(data.map(mapFrag));
        }
      } catch (e) { console.error("Could not load your saved data:", e); }
    })();
    return () => { off = true; };
  }, [uid]);
  async function addJournalEntry(entry) {
    const tempId = entry.id || Date.now();
    setJournalEntries(p => [{ ...entry, id: tempId }, ...p]);
    if (!uid) return;
    const { data, error } = await supabase.from("journal_entries").insert({
      user_id: uid, fragrance_id: isUuid(entry.fragId) ? entry.fragId : null, frag_name: entry.fragName, house: entry.house, family: entry.family || null,
      prompt: entry.prompt || null, answers: entry.answers || {}, body: entry.text || "", where_text: entry.where || null, entry_date: entry.date || null,
      shared: !!entry.shared, published_as_review: !!entry.publishedAsReview, review_rating: entry.reviewRating || null,
    }).select("id").single();
    if (error) { flagSave(error); return; }
    if (data) setJournalEntries(p => p.map(e => e.id === tempId ? { ...e, id: data.id } : e));
  }
  async function logWear(fragId, w) {
    if (!uid || !isUuid(fragId)) return;
    const tempId = "tmp-" + Date.now();
    setWears(p => [{ id: tempId, fragId, date: w.date, occasion: w.occasion, weather: w.weather, occasions: w.occasions || [], weathers: w.weathers || [], rating: w.rating, moods: w.moods || [] }, ...p]);
    const { data, error } = await supabase.from("wears").insert({ user_id: uid, fragrance_id: fragId, worn_on: w.date, occasion: w.occasion, weather: w.weather, occasions: w.occasions || [], weathers: w.weathers || [], rating: w.rating, moods: w.moods || [] }).select("id").single();
    if (error) { setWears(p => p.filter(x => x.id !== tempId)); flagSave(error); return; }
    setWears(p => p.map(x => x.id === tempId ? { ...x, id: data.id } : x));
  }
  async function deleteWear(id) {
    const prev = wears;
    setWears(p => p.filter(x => x.id !== id));
    if (String(id).startsWith("tmp-")) return;
    const { error } = await supabase.from("wears").delete().eq("id", id).eq("user_id", uid);
    if (error) { setWears(prev); flagSave(error); }
  }
  async function saveLayer(l) {
    const tempId = Date.now();
    setLayers(p => [{ ...l, id: tempId }, ...p]);
    if (!uid) return;
    const { data, error } = await supabase.from("layerings").insert({ user_id: uid, name: l.name, frags: l.frags, ratio: l.ratio, layer_with: l.layerWith, note: l.note || null, rating: l.rating || null, is_public: !!l.isPublic }).select("id").single();
    if (error) { flagSave(error); return; }
    if (data) setLayers(p => p.map(x => x.id === tempId ? { ...x, id: data.id } : x));
  }
  // Who you follow is saved in the database (lowercase usernames). The official account is always included.
  useEffect(() => {
    if (!uid) { setFollowing(new Set(["memoir"])); return; }
    let live = true;
    supabase.rpc("list_follows", { p_kind: "following" }).then(({ data, error }) => {
      if (!live || error) return;
      setFollowing(new Set(["memoir", ...(data || []).map(r => String(r.username).toLowerCase())]));
    });
    return () => { live = false; };
  }, [uid]);
  // The bell: unread count, refreshed every minute and when you come back to the app.
  useEffect(() => {
    if (!uid) { setBellCount(0); return; }
    let live = true;
    const check = () => supabase.rpc("unread_notifications").then(({ data, error }) => { if (live && !error) setBellCount(Number(data) || 0); });
    check();
    const t = setInterval(check, 60000);
    const vis = () => { if (document.visibilityState === "visible") check(); };
    document.addEventListener("visibilitychange", vis);
    return () => { live = false; clearInterval(t); document.removeEventListener("visibilitychange", vis); };
  }, [uid]);
  function openNotification(n) {
    setNotifOpen(false);
    if (n.kind === "follow" && n.username) openProfile(n.username);
    else if (n.kind === "request_reply" && n.request_id) setNotifTarget({ kind: "request", id: n.request_id });
    else if (n.post_id) setNotifTarget({ kind: "post", id: n.post_id });
  }
  async function toggleFollow(username) {
    const key = String(username || "").toLowerCase();
    if (key === "memoir" || !uid) return; // can't unfollow the official account
    const was = following.has(key);
    const flip = on => setFollowing(prev => { const n = new Set(prev); on ? n.add(key) : n.delete(key); return n; });
    flip(!was);
    if (MOCK_MEMBERS.some(m => m.username.toLowerCase() === key)) return; // demo members are not real accounts
    const { data, error } = await supabase.rpc("set_follow", { p_username: username, p_follow: !was });
    if (error) {
      flip(was);
      setSaveIssue("That didn't go through. Try again in a moment.");
      clearTimeout(issueTimer.current);
      issueTimer.current = setTimeout(() => setSaveIssue(""), 7000);
      return;
    }
    return Number(data);
  }

  const NAV = [{ tab:"Discover", icon:"compass" }, { tab:"Collection", icon:"bottle" }, { tab:"Layering", icon:"layers" }, { tab:"Journal", icon:"book" }, { tab:"Learn", icon:"tip" }];
  const modalFrag = fragrances.find(f => f.id === modalFragId);
  trackState.region = regionFor(currentUser);
  // ─── Page navigation: one page at a time, with a real back button and browser/Android back support ───
  const viewStack = useRef([]);
  const ignorePops = useRef(0);
  const histOk = useRef(true);
  function snapshot() {
    if (modalFragId) return { t: "frag", id: modalFragId };
    if (perfumerRef) return { t: "perfumer", name: perfumerRef };
    if (brandRef) return { t: "brand", ref: brandRef };
    if (profileUsername) return { t: "profile", username: profileUsername };
    if (peopleOpen) return { t: "people" };
    return null;
  }
  function applyView(v) {
    setPeopleOpen(!!v && v.t === "people");
    setModalFragId(v && v.t === "frag" ? v.id : null);
    setPerfumerRef(v && v.t === "perfumer" ? v.name : null);
    setBrandRef(v && v.t === "brand" ? v.ref : null);
    setProfileUsername(v && v.t === "profile" ? v.username : null);
  }
  function goto(v) {
    const cur = snapshot();
    if (cur && cur.t === v.t && JSON.stringify(cur) === JSON.stringify(v)) return;
    viewStack.current.push(cur);
    try { window.history.pushState({ mos: 1 }, ""); } catch (e) { histOk.current = false; }
    applyView(v);
  }
  function closeAll() {
    const n = viewStack.current.length;
    viewStack.current = [];
    applyView(null);
    if (n > 0 && histOk.current) { ignorePops.current += 1; try { window.history.go(-n); } catch (e) {} }
  }
  function goBack() {
    if (viewStack.current.length > 0 && histOk.current) { try { window.history.back(); return; } catch (e) {} }
    applyView(viewStack.current.pop() || null);
  }
  useEffect(() => {
    function onPop() {
      if (ignorePops.current > 0) { ignorePops.current -= 1; return; }
      if (viewStack.current.length > 0) applyView(viewStack.current.pop());
    }
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);
  function openFrag(id, source) {
    trackState.source = source || (brandRef ? "brand" : perfumerRef ? "perfumer" : profileUsername ? "profile" : String(activeTab || "").toLowerCase());
    goto({ t: "frag", id });
  }
  useEffect(() => {
    if (modalFragId) trackEvent("fragrance_view", { fragrance: modalFragId, source: trackState.source || "other", dedupeMs: 1800000 });
  }, [modalFragId]);
  function openBrand(ref) { goto({ t: "brand", ref }); }
  function openPerfumer(n) { goto({ t: "perfumer", name: n }); }
  function openProfile(username) { goto({ t: "profile", username }); }
  function openPeople() { goto({ t: "people" }); }
  function onReaction(fragId, val) { setReactions(p => ({ ...p, [fragId]: val })); saveUserFrag(fragId, { reaction: val || null }); }
  // A fragrance rated in the Events notebook: set the reaction, and add it to the collection as Smelled
  // unless the member already has it as smelled or tried on skin. Clearing a rating only clears the reaction.
  async function onEventRate(fragId, val) {
    onReaction(fragId, val || null);
    if (!val || !uid || !isUuid(fragId)) return;
    const before = statusSets[fragId] || [];
    if (!before.includes("smelled") && !before.includes("tried_skin")) {
      const after = toggleStatus(before, "smelled");
      setStatusSets(p => ({ ...p, [fragId]: after })); setUserStatuses(p => ({ ...p, [fragId]: primaryStatus(after) }));
      saveUserFrag(fragId, { status: primaryStatus(after), statuses: after });
    }
    if (!fragrances.some(f => f.id === fragId)) {
      const { data } = await fetchFragRows(sel => supabase.from("fragrances").select(sel).eq("id", fragId));
      if (data) mergeFrags(data.map(mapFrag));
    }
  }

  // Marked in the Events notebook as smelled on a blotter or on skin: add that status to the collection (never removes one).
  async function onEventSmell(fragId, how) {
    if (!how || !uid || !isUuid(fragId)) return;
    const key = how === "skin" ? "tried_skin" : "smelled";
    const before = statusSets[fragId] || [];
    if (!before.includes(key)) {
      const after = toggleStatus(before, key);
      setStatusSets(p => ({ ...p, [fragId]: after })); setUserStatuses(p => ({ ...p, [fragId]: primaryStatus(after) }));
      saveUserFrag(fragId, { status: primaryStatus(after), statuses: after });
    }
    if (!fragrances.some(f => f.id === fragId)) {
      const { data } = await fetchFragRows(sel => supabase.from("fragrances").select(sel).eq("id", fragId));
      if (data) mergeFrags(data.map(mapFrag));
    }
  }

  function handleOnboardingComplete(fields) {
    setCurrentUser(p => ({ ...p, ...fields }));
    setAppScreen("app");
  }
  async function handleSignOut() {
    await supabase.auth.signOut();
    // onAuthStateChange listener routes to "waitlist" once the session clears.
  }

  const userInitials = currentUser
    ? (currentUser.username || currentUser.name || "?").slice(0, 2).toUpperCase()
    : "?";

  // Preview the sign-up page without logging out: add ?preview=signup to the site address.
  if (typeof window !== "undefined" && /[?&]preview=signup\b/.test(window.location.search)) return <LandingScreen onSignIn={() => { window.location.href = window.location.pathname + "?join=1"; }} onHaveCode={() => { window.location.href = window.location.pathname + "?join=1"; }}/>;
  // The short beta link (memoironskin.com/beta) always lands on the beta sign-up page, even in a browser that is already signed in.
  if (typeof window !== "undefined" && (window.location.hash === "#beta" || /^\/beta\/?$/.test(window.location.pathname))) return <LandingScreen onSignIn={() => { window.location.href = "/?join=1"; }} onHaveCode={() => { window.location.href = "/?join=1"; }}/>;
  // Public page for brands to submit their house and fragrances (memoironskin.com/brands). No account needed.
  if (typeof window !== "undefined" && (window.location.hash === "#brands" || /^\/brands\/?$/.test(window.location.pathname))) return <BrandSubmitPage/>;
  // Public Black Friday sales page (memoironskin.com/black-friday). No account needed.
  if (typeof window !== "undefined" && (window.location.hash === "#black-friday" || /^\/black-friday\/?$/.test(window.location.pathname))) return <BlackFridayPage/>;
  if (appScreen === "loading") return <LoadingScreen/>;
  if (appScreen === "waitlist" && wantsJoinLink()) return <LoginScreen onWaitlist={() => { window.location.href = window.location.pathname; }}/>;
  if (appScreen === "waitlist") return <LandingScreen onSignIn={() => { loginStart.mode = "signin"; setAppScreen("login"); }} onHaveCode={() => { loginStart.mode = "signup"; setAppScreen("login"); }}/>;
  if (appScreen === "login") return <LoginScreen onWaitlist={() => setAppScreen("waitlist")}/>;
  if (appScreen === "onboarding") return <OnboardingScreen onComplete={handleOnboardingComplete}/>;
  // Private invite-code page for the owner: add ?admin=invites to the site address (signed in).
  if (appScreen === "app" && isOwnerRoot && adminHome && !/[?&]admin=/.test(window.location.search)) return <AdminHome onEnterSite={() => { setActiveTab("Discover"); setAdminHome(false); }}/>;
  if (appScreen === "app" && typeof window !== "undefined" && /[?&]admin=invites\b/.test(window.location.search)) return <InviteAdmin/>;
  if (appScreen === "app" && typeof window !== "undefined" && /[?&]admin=brands\b/.test(window.location.search)) return <BrandSubmissionsAdmin/>;

  return (
    <div style={{ minHeight:"100svh", background:"transparent", fontFamily:sans, position:"relative" }}>
      <header style={{ position:"sticky", top:0, zIndex:40, background:T.glass, backdropFilter:"blur(16px)", WebkitBackdropFilter:"blur(16px)" }}>
        <div className="mos-wrap">
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 0 12px", gap:10 }}>
            <Logo fluid/>
            <div style={{ display:"flex", alignItems:"center", gap:6, flexShrink:0 }}>
              {isOwnerRoot && <button onClick={() => setAdminHome(true)} style={{ ...ghostBtn, minHeight:"var(--ctl)", padding:"0 14px", fontSize:13 }}>Admin</button>}
              <button className="mos-suggest" onClick={() => setShowSuggest(true)} aria-label="Suggest a fragrance, store or event" title="Suggest a fragrance, store or event" style={{ fontFamily:sans, fontSize:"var(--ctl-fs)", fontWeight:500, height:"var(--ctl)", padding:"0 16px", borderRadius:20, border:`1px solid ${T.rule}`, background:T.white, color:T.mid, cursor:"pointer", whiteSpace:"nowrap" }}>+<span className="mos-suggest-label"> Suggest</span></button>
              <span className="mos-hide-sm" style={{ display:"contents" }}><ThemeToggle size="var(--ctl)"/></span>
              <button onClick={openPeople} title="Find people" aria-label="Find people" style={{ width:"var(--ctl)", height:"var(--ctl)", borderRadius:"50%", padding:0, background:T.white, border:`1px solid ${T.rule}`, cursor:"pointer", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ color:T.ink, display:"block" }}><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.6 2.9-6 6.5-6 1.5 0 2.8.4 3.9 1.1"/><circle cx="17" cy="16.5" r="3"/><path d="M19.2 18.7L21.5 21"/></svg>
              </button>
              <button onClick={() => setNotifOpen(true)} title="Notifications" aria-label={bellCount > 0 ? "Notifications, " + bellCount + " new" : "Notifications"} style={{ position:"relative", width:"var(--ctl)", height:"var(--ctl)", borderRadius:"50%", padding:0, background:T.white, border:`1px solid ${T.rule}`, cursor:"pointer", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ color:T.ink, display:"block" }}><path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
                {bellCount > 0 && <span aria-hidden="true" style={{ position:"absolute", top:-3, right:-3, minWidth:17, height:17, padding:"0 4px", boxSizing:"border-box", borderRadius:9, background:"var(--tangerine)", color:"var(--on-tang)", fontFamily:sans, fontSize:10, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", lineHeight:1 }}>{bellCount > 9 ? "9+" : bellCount}</span>}
              </button>
              <button
                onClick={() => currentUser && openProfile(currentUser.username)}
                title={currentUser ? "@" + currentUser.username : ""}
                aria-label="Your profile"
                style={{ width:"var(--ctl)", height:"var(--ctl)", borderRadius:"50%", padding:0, background:T.black, border:"none", cursor:"pointer", flexShrink:0 }}
              >
                <span style={{ display:"flex", alignItems:"center", justifyContent:"center", width:"100%", height:"100%", borderRadius:"50%", background:T.black, boxSizing:"border-box", fontSize:"var(--ctl-fs)", fontWeight:600, color:T.white, fontFamily:sans }}>{userInitials}</span>
              </button>
            </div>
          </div>
          <nav className="mos-tabs-top" aria-label="Main sections">
            {NAV.map(({ tab }) => {
              const on = activeTab === tab;
              return (
                <button key={tab} onClick={() => setActiveTab(tab)} aria-current={on ? "page" : undefined} style={{ position:"relative", paddingBottom:15, paddingTop:4, fontSize:"var(--nav-fs)", fontWeight:on?600:500, textTransform:"uppercase", letterSpacing:"0.1em", color:on?T.black:T.mid, background:"none", border:"none", cursor:"pointer", whiteSpace:"nowrap", fontFamily:sans }}>
                  {tab}
                  {on && <span style={{ position:"absolute", left:0, right:0, bottom:-1, height:2, background:T.black }}/>}
                </button>
              );
            })}
          </nav>
        </div>
        <div style={{ height:1, background:T.rule }}/>
      </header>

      <main className="mos-main mos-wrap" style={{ position:"relative", zIndex:1, paddingTop:28, paddingBottom:64 }}>
        {activeTab==="Discover"   && <DiscoverTab   onOpenBrand={openBrand} onOpenPerfumer={openPerfumer} onOpenProfile={openProfile} following={following} fragrances={fragrances} serverShelves={serverShelves} onSearch={serverShelves ? searchFrags : null} onOpenFrag={openFrag} userStatuses={userStatuses} reactions={reactions} onReaction={onReaction} onSuggest={() => setShowSuggest(true)} currentUser={currentUser}/>}
        {activeTab==="Collection" && <CollectionTab onOpenBrand={openBrand} onEvents={EVENTS_PREVIEW ? () => setEventsOpen(true) : null} onImport={() => setImportOpen(true)} fragrances={fragrances} onOpenFrag={openFrag} statuses={userStatuses} statusSets={statusSets} reactions={reactions} onReaction={onReaction} onSuggest={() => setShowSuggest(true)} wears={wears} onOpenJournal={() => setActiveTab("Journal")}/>}
        {activeTab==="Layering"   && <div className="mos-prose"><LayeringTab layers={layers} onSaveLayer={saveLayer} onSearch={searchFrags} fragrances={fragrances} statusSets={statusSets}/></div>}
        {activeTab==="Journal"    && <div className="mos-prose"><JournalTab entries={journalEntries} userStatuses={userStatuses} reactions={reactions} fragrances={fragrances} wears={wears} onOpenFrag={openFrag} onSearch={searchFrags} onAddJournalEntry={addJournalEntry}/></div>}
        {activeTab==="Learn"      && <div className="mos-prose"><LearnTab fragrances={fragrances} onOpenFrag={openFrag} onOpenBrand={openBrand}/></div>}
        <FooterLinks/>
      </main>

      <nav className="mos-tabbar" aria-label="Main sections" style={{ position:"fixed", left:0, right:0, bottom:0, zIndex:45, background:T.glass, backdropFilter:"blur(18px)", WebkitBackdropFilter:"blur(18px)", borderTop:`1px solid ${T.rule}`, padding:"8px 6px calc(8px + env(safe-area-inset-bottom))" }}>
        {NAV.map(({ tab, icon }) => {
          const on = activeTab === tab;
          return (
            <button key={tab} onClick={() => setActiveTab(tab)} aria-current={on ? "page" : undefined} style={{ flex:1, position:"relative", display:"flex", flexDirection:"column", alignItems:"center", gap:3, padding:"7px 0 1px", background:"none", border:"none", cursor:"pointer", fontFamily:sans, fontSize:10, fontWeight:on?600:500, color:on?T.accent:T.mid }}>
              {on && <span style={{ position:"absolute", top:-9, width:26, height:2, background:T.black }}/>}
              <Icon name={icon} size={22} color={on?T.accent:T.mid}/>
              <span>{tab}</span>
            </button>
          );
        })}
      </nav>

      {modalFrag && (
        <DetailModal
          frag={modalFrag}
          entries={journalEntries}
          onClose={closeAll}
          onBack={goBack}
          userStatus={statusSets[modalFrag.id] || []}
          finish={finishes[modalFrag.id]}
          size={sizes[modalFrag.id] || null}
          setSize={v => { setSizes(p => ({ ...p, [modalFrag.id]: v })); saveUserFrag(modalFrag.id, { size_ml: v }); }}
          setFinish={patch => { const cur = finishes[modalFrag.id] || {}; const next = { on: cur.on || null, rebuy: cur.rebuy || null, ...patch }; setFinishes(p => ({ ...p, [modalFrag.id]: next })); saveUserFrag(modalFrag.id, { finished_on: next.on, rebuy: next.rebuy }); }}
          setUserStatus={key => {
            const id = modalFrag.id, before = statusSets[id] || [], after = toggleStatus(before, key), prim = primaryStatus(after);
            setStatusSets(p => { const n = { ...p }; if (after.length) n[id] = after; else delete n[id]; return n; });
            setUserStatuses(p => { const n = { ...p }; if (prim) n[id] = prim; else delete n[id]; return n; });
            const isFin = isFinishedSet(after), wasFin = isFinishedSet(before);
            const patch = { status: prim, statuses: after };
            if (isFin && !wasFin) { const on = todayISO(); patch.finished_on = on; setFinishes(p => ({ ...p, [id]: { on, rebuy: (p[id] || {}).rebuy || null } })); }
            if (!isFin && wasFin) { patch.finished_on = null; patch.rebuy = null; setFinishes(p => { const n = { ...p }; delete n[id]; return n; }); }
            saveUserFrag(id, patch); trackEvent("status_set", { fragrance: id, source: "fragrance", detail: after.includes(key) ? String(key) : "removed" }); }}
          privateNote={privateNotes[modalFrag.id]}
          setPrivateNote={n => { setPrivateNotes(p => ({ ...p, [modalFrag.id]: n })); saveUserFrag(modalFrag.id, { note: n }); }}
          reaction={reactions[modalFrag.id]}
          setReaction={v => onReaction(modalFrag.id, v)}
          onOpenFrag={openFrag}
          wears={wears}
          onLogWear={logWear}
          onDeleteWear={deleteWear}
          onOpenBrand={openBrand}
          onOpenPerfumer={openPerfumer}
          onOpenProfile={openProfile}
          onAddJournalEntry={addJournalEntry}
          currentUser={currentUser}
        />
      )}
      {perfumerRef && <PerfumerPage name={perfumerRef} onClose={closeAll} onBack={goBack} onOpenFrag={openFrag} onOpenBrand={openBrand}/>}
      {saveIssue && <div role="status" style={{ position:"fixed", left:16, right:16, bottom:"calc(84px + env(safe-area-inset-bottom))", zIndex:80, maxWidth:520, margin:"0 auto", background:T.black, color:T.white, borderRadius:14, padding:"12px 16px", fontFamily:sans, fontSize:13, lineHeight:1.5 }}>{saveIssue}</div>}
      {brandRef && <BrandModal brand={brandRef} onClose={closeAll} onBack={goBack} onOpenFrag={openFrag}/>}
      {eventsOpen && uid && <EventsSheet uid={uid} onClose={() => setEventsOpen(false)} onSearch={searchFrags} onRate={onEventRate} onSmell={onEventSmell}/>}
      {importOpen && <ImportSheet fragrances={fragrances} existing={statusSets} onApply={applyImport} onClose={() => setImportOpen(false)}/>}
      {showSuggest && <SuggestModal onClose={() => setShowSuggest(false)} currentUser={currentUser}/>}
      {notifOpen && <NotificationsSheet onClose={() => setNotifOpen(false)} onOpen={openNotification} onRead={() => setBellCount(0)}/>}
      {notifTarget && notifTarget.kind === "post" && <PostThread postId={notifTarget.id} onClose={() => setNotifTarget(null)} onOpenProfile={openProfile} onOpenFrag={openFrag}/>}
      {notifTarget && notifTarget.kind === "request" && <RequestSheet requestId={notifTarget.id} onClose={() => setNotifTarget(null)} onOpenFrag={openFrag} onSearch={searchFrags}/>}
      {peopleOpen && <PeopleSearch initialQ={peopleQ} onQ={setPeopleQ} onClose={closeAll} onBack={goBack} onOpenProfile={openProfile} following={following} onToggleFollow={toggleFollow}/>}
      {profileUsername && (
        <ProfileModal
          key={profileUsername}
          username={profileUsername}
          onFindPeople={openPeople}
          onProfileSaved={fields => setCurrentUser(p => ({ ...p, ...fields }))}
          onClose={closeAll}
          onBack={goBack}
          currentUser={currentUser}
          userStatuses={userStatuses}
          onOpenFrag={id => openFrag(id)}
          isFollowing={following.has(String(profileUsername).toLowerCase())}
          onToggleFollow={toggleFollow}
          following={following}
          onOpenProfile={username => openProfile(username)}
          onSignOut={handleSignOut}
          myStats={{ fragrances:Object.keys(userStatuses||{}).length, bestStreak:computeStreak(journalEntries).longest, avgRating:avgWearRating(wears), entries:journalEntries.length }}
        />
      )}
    </div>
  );
}
