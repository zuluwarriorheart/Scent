import { useState } from "react";

// ─── PALETTE ──────────────────────────────────────────────────────────────────
const T = {
  black:"#0A0A0A", white:"#FFFFFF", bg:"#F8F8F6", ink:"#1A1A1A",
  mid:"#888888", faint:"#C8C8C8", rule:"#E4E4E0", lift:"#F2F2EF", press:"#EBEBEA",
};
const serif = "Georgia,'Times New Roman',serif";
const sans  = "'Helvetica Neue',Helvetica,Arial,sans-serif";

// ─── SVG ICONS ────────────────────────────────────────────────────────────────
function Icon({ name, size=18, color=T.mid }) {
  const s = { width:size, height:size, display:"inline-flex", alignItems:"center", justifyContent:"center", flexShrink:0 };
  const icons = {
    bottle: <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 3h6M8 3v2.5c0 .5-.5 1-1 1.5L6 8.5C5.5 9 5 9.5 5 10v10a1 1 0 001 1h12a1 1 0 001-1V10c0-.5-.5-1-1-1.5l-1-1.5c-.5-.5-1-1-1-1.5V3"/><path d="M5 13h14"/></svg>,
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
    droplet: <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z"/></svg>,
    lotion: <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="8" y="4" width="8" height="16" rx="2"/><path d="M10 4V2h4v2"/><line x1="8" y1="9" x2="16" y2="9"/></svg>,
    spray: <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="9" width="10" height="12" rx="2"/><path d="M14 13h2a2 2 0 002-2V9h-4"/><path d="M18 5v2"/><path d="M16 3h4"/><circle cx="18" cy="3" r="0.5" fill={color}/></svg>,
  };
  return <span style={s}>{icons[name] || null}</span>;
}

// ─── SEASON ILLUSTRATIONS — colored SVG drawings, no emoji ───────────────────
function SeasonIllustration({ season, size = 32 }) {
  const illustrations = {
    spring: (
      // Blooming flower — pink petals, green stem
      <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Stem */}
        <line x1="20" y1="32" x2="20" y2="20" stroke="#5A9A3A" strokeWidth="1.8" strokeLinecap="round"/>
        {/* Leaf */}
        <path d="M20 27 C17 24 13 24 13 27 C13 30 17 29 20 27Z" fill="#7BC55A" stroke="#5A9A3A" strokeWidth="0.8"/>
        {/* Petals */}
        {[0,60,120,180,240,300].map((deg,i) => {
          const rad = deg * Math.PI / 180;
          const cx = 20 + 7 * Math.cos(rad);
          const cy = 16 + 7 * Math.sin(rad);
          return <ellipse key={i} cx={cx.toFixed(1)} cy={cy.toFixed(1)} rx="3.5" ry="5" fill="#F7A8C4" stroke="#E07090" strokeWidth="0.7" transform={`rotate(${deg} ${cx.toFixed(1)} ${cy.toFixed(1)})`}/>;
        })}
        {/* Center */}
        <circle cx="20" cy="16" r="4" fill="#FFD93D" stroke="#C8A000" strokeWidth="0.8"/>
        {/* Pollen dots */}
        <circle cx="20" cy="14.5" r="0.8" fill="#A07800"/>
        <circle cx="18.8" cy="16.8" r="0.8" fill="#A07800"/>
        <circle cx="21.2" cy="16.8" r="0.8" fill="#A07800"/>
        {/* Ground line */}
        <path d="M14 33 Q17 31 20 32 Q23 33 26 31" stroke="#7BC55A" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
      </svg>
    ),
    summer: (
      // Blazing sun with heat waves
      <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Sun rays */}
        {[0,45,90,135,180,225,270,315].map((deg,i) => {
          const rad = deg * Math.PI / 180;
          const x1 = 20 + 10 * Math.cos(rad);
          const y1 = 19 + 10 * Math.sin(rad);
          const x2 = 20 + 14 * Math.cos(rad);
          const y2 = 19 + 14 * Math.sin(rad);
          return <line key={i} x1={x1.toFixed(1)} y1={y1.toFixed(1)} x2={x2.toFixed(1)} y2={y2.toFixed(1)} stroke="#F5A623" strokeWidth="2" strokeLinecap="round"/>;
        })}
        {/* Sun body */}
        <circle cx="20" cy="19" r="8" fill="#FFD93D" stroke="#F5A623" strokeWidth="1.2"/>
        <circle cx="20" cy="19" r="5.5" fill="#FFE566"/>
        {/* Heat waves at bottom */}
        <path d="M13 32 Q16 29 19 32 Q22 35 25 32" stroke="#F5A623" strokeWidth="1.3" strokeLinecap="round" fill="none" opacity="0.7"/>
        <path d="M15 36 Q17.5 33.5 20 36 Q22.5 38.5 25 36" stroke="#F5A623" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.4"/>
      </svg>
    ),
    fall: (
      // Falling leaves — warm oranges and reds
      <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Branch */}
        <path d="M8 8 C12 12 16 10 22 14" stroke="#8B5A2B" strokeWidth="1.5" strokeLinecap="round"/>
        {/* Leaf 1 — large orange */}
        <path d="M22 14 C24 10 30 9 32 13 C34 17 30 21 26 20 C22 19 20 18 22 14Z" fill="#E8732A" stroke="#C85A18" strokeWidth="0.9"/>
        <line x1="22" y1="14" x2="30" y2="17" stroke="#C85A18" strokeWidth="0.6"/>
        {/* Leaf 2 — red falling */}
        <path d="M16 22 C17 18 22 17 24 20 C26 23 23 27 20 26 C17 25 15 25 16 22Z" fill="#D94020" stroke="#A83010" strokeWidth="0.9" transform="rotate(-20 20 22)"/>
        {/* Leaf 3 — golden small */}
        <path d="M10 28 C11 25 15 24 16 27 C17 30 14 32 12 31 C10 30 9 30 10 28Z" fill="#F5C518" stroke="#C8960A" strokeWidth="0.9" transform="rotate(15 13 28)"/>
        {/* Wind curve */}
        <path d="M6 20 Q14 16 22 20 Q30 24 36 20" stroke="#C85A18" strokeWidth="0.8" strokeLinecap="round" fill="none" opacity="0.4" strokeDasharray="2 2"/>
      </svg>
    ),
    winter: (
      // Snowflake — clean geometric blue/white
      <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Main axes */}
        {[0,60,120].map((deg,i) => {
          const rad = deg * Math.PI / 180;
          const x1 = 20 + 15 * Math.cos(rad);
          const y1 = 20 + 15 * Math.sin(rad);
          const x2 = 20 - 15 * Math.cos(rad);
          const y2 = 20 - 15 * Math.sin(rad);
          return <line key={i} x1={x1.toFixed(1)} y1={y1.toFixed(1)} x2={x2.toFixed(1)} y2={y2.toFixed(1)} stroke="#4A90D9" strokeWidth="2" strokeLinecap="round"/>;
        })}
        {/* Branch ticks on each arm */}
        {[0,60,120,180,240,300].map((deg,i) => {
          const rad = deg * Math.PI / 180;
          const midX = 20 + 8 * Math.cos(rad);
          const midY = 20 + 8 * Math.sin(rad);
          const perpRad = (deg + 90) * Math.PI / 180;
          const bx1 = midX + 3 * Math.cos(perpRad);
          const by1 = midY + 3 * Math.sin(perpRad);
          const bx2 = midX - 3 * Math.cos(perpRad);
          const by2 = midY - 3 * Math.sin(perpRad);
          return <line key={i} x1={bx1.toFixed(1)} y1={by1.toFixed(1)} x2={bx2.toFixed(1)} y2={by2.toFixed(1)} stroke="#4A90D9" strokeWidth="1.5" strokeLinecap="round"/>;
        })}
        {/* Center */}
        <circle cx="20" cy="20" r="3" fill="#4A90D9"/>
        <circle cx="20" cy="20" r="1.5" fill="#FFFFFF"/>
        {/* Tip dots */}
        {[0,60,120,180,240,300].map((deg,i) => {
          const rad = deg * Math.PI / 180;
          const cx = 20 + 15 * Math.cos(rad);
          const cy = 20 + 15 * Math.sin(rad);
          return <circle key={i} cx={cx.toFixed(1)} cy={cy.toFixed(1)} r="1.5" fill="#4A90D9"/>;
        })}
      </svg>
    ),
  };
  return (
    <div style={{ width: size, height: size, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      {illustrations[season]}
    </div>
  );
}

// ─── BOTTLE ILLUSTRATION — for status badge & layering ───────────────────────
function BottleDrawing({ size = 36, color = T.black, bg = T.black, isWhite = false }) {
  const stroke = isWhite ? T.white : color;
  return (
    <svg width={size * 0.55} height={size * 0.75} viewBox="0 0 22 30" fill="none">
      {/* Cap */}
      <rect x="7" y="0" width="8" height="4" rx="1.5" fill={stroke} opacity="0.9"/>
      {/* Neck */}
      <path d="M9 4 L8 8 L14 8 L13 4Z" fill={stroke} opacity="0.7"/>
      {/* Body */}
      <rect x="5" y="8" width="12" height="19" rx="3" fill={stroke} opacity="0.15"/>
      <rect x="5" y="8" width="12" height="19" rx="3" stroke={stroke} strokeWidth="1.4"/>
      {/* Shoulder line */}
      <line x1="5" y1="13" x2="17" y2="13" stroke={stroke} strokeWidth="0.8" opacity="0.5"/>
      {/* Label area */}
      <rect x="7" y="15" width="8" height="8" rx="1" stroke={stroke} strokeWidth="0.7" opacity="0.4"/>
    </svg>
  );
}

function SampleDrawing({ size = 36, isWhite = false }) {
  const stroke = isWhite ? T.white : T.mid;
  return (
    <svg width={size * 0.4} height={size * 0.75} viewBox="0 0 14 30" fill="none">
      {/* Cap */}
      <rect x="4" y="0" width="6" height="3.5" rx="1" fill={stroke} opacity="0.85"/>
      {/* Neck */}
      <path d="M5 3.5 L4.5 7 L9.5 7 L9 3.5Z" fill={stroke} opacity="0.6"/>
      {/* Vial body */}
      <rect x="3" y="7" width="8" height="20" rx="2" stroke={stroke} strokeWidth="1.3"/>
      <rect x="3" y="7" width="8" height="20" rx="2" fill={stroke} opacity="0.1"/>
      {/* Liquid level */}
      <rect x="3" y="17" width="8" height="10" rx="2" fill={stroke} opacity="0.25"/>
      {/* Measurement lines */}
      <line x1="3" y1="17" x2="11" y2="17" stroke={stroke} strokeWidth="0.7" opacity="0.5"/>
      <line x1="3" y1="21" x2="7" y2="21" stroke={stroke} strokeWidth="0.5" opacity="0.4"/>
    </svg>
  );
}

// ─── RADAR CHART ─────────────────────────────────────────────────────────────
function RadarChart({ accords }) {
  const N = accords.length;
  const cx = 110, cy = 110, R = 80;
  const levels = [0.25, 0.5, 0.75, 1.0];
  function pt(i, frac) {
    const angle = (Math.PI * 2 * i) / N - Math.PI / 2;
    return { x: cx + R * frac * Math.cos(angle), y: cy + R * frac * Math.sin(angle) };
  }
  const gridPoints = levels.map(l => accords.map((_, i) => pt(i, l)));
  const dataPoints = accords.map((a, i) => pt(i, a.v / 100));
  const dataPath = dataPoints.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ") + " Z";
  const gridPath = level => gridPoints[level].map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ") + " Z";
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
      <svg width={220} height={220} viewBox="0 0 220 220">
        {levels.map((_, li) => <path key={li} d={gridPath(li)} fill="none" stroke={T.rule} strokeWidth={li === 3 ? 1 : 0.7}/>)}
        {accords.map((_, i) => { const outer = pt(i, 1); return <line key={i} x1={cx} y1={cy} x2={outer.x.toFixed(1)} y2={outer.y.toFixed(1)} stroke={T.rule} strokeWidth={0.8}/>; })}
        <path d={dataPath} fill={T.black} fillOpacity={0.07} stroke={T.black} strokeWidth={1.5} strokeLinejoin="round"/>
        {dataPoints.map((p, i) => <circle key={i} cx={p.x.toFixed(1)} cy={p.y.toFixed(1)} r={3} fill={T.black}/>)}
        {accords.map((a, i) => { const labelPt = pt(i, 1.22); return <text key={i} x={labelPt.x.toFixed(1)} y={labelPt.y.toFixed(1)} textAnchor="middle" dominantBaseline="middle" style={{ fontFamily: sans, fontSize: 10, fill: T.mid }}>{a.n}</text>; })}
        {dataPoints.map((p, i) => { const lp = pt(i, (accords[i].v / 100) * 0.65); return <text key={i} x={lp.x.toFixed(1)} y={lp.y.toFixed(1)} textAnchor="middle" dominantBaseline="middle" style={{ fontFamily: sans, fontSize: 8, fill: T.mid }}>{accords[i].v}</text>; })}
      </svg>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 6 }}>
        {accords.map(a => (
          <div key={a.n} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: Math.round(2 + (a.v / 100) * 6), height: Math.round(2 + (a.v / 100) * 6), borderRadius: "50%", background: T.black, opacity: 0.4 + (a.v / 100) * 0.6 }}/>
            <span style={{ fontFamily: sans, fontSize: 11, color: T.mid }}>{a.n}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── SEASON HEAT MAP — colored per season with season illustrations ───────────
function SeasonHeat({ seasons }) {
  const order = ["spring", "summer", "fall", "winter"];
  const labels = { spring: "Spring", summer: "Summer", fall: "Fall", winter: "Winter" };
  // Season-specific color palettes for the bars
  const seasonColors = {
    spring: { filled: (i) => `hsl(${130 + i * 5}, ${55 + i * 3}%, ${65 - i * 4}%)`, empty: "#EEF5EA" },
    summer: { filled: (i) => `hsl(${38 + i * 2}, ${85 + i * 1}%, ${68 - i * 5}%)`, empty: "#FFF8EC" },
    fall:   { filled: (i) => `hsl(${22 - i * 2}, ${80 + i * 2}%, ${68 - i * 7}%)`, empty: "#FBF0EA" },
    winter: { filled: (i) => `hsl(${210 + i * 2}, ${60 + i * 3}%, ${70 - i * 5}%)`, empty: "#EDF3FB" },
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
            {/* Season illustration */}
            <div style={{ width: 70, display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
              <SeasonIllustration season={s} size={28}/>
              <span style={{ fontFamily: sans, fontSize: 11, color: T.mid }}>{labels[s]}</span>
            </div>
            {/* Colored bars */}
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
function NoteIllustration({ name, size = 72 }) {
  const c = getNoteColor(name);
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
  const art = arts[name] || <svg viewBox="0 0 60 60" fill="none"><circle cx="30" cy="30" r="16" fill={c.fill} stroke={c.stroke} strokeWidth="1.2"/><circle cx="30" cy="30" r="3" fill={c.accent}/></svg>;
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
function HouseStrip({ currentFrag, onOpenFrag }) {
  const siblings = FRAGRANCES.filter(f => f.house === currentFrag.house && f.id !== currentFrag.id);
  if (!siblings.length) return null;
  return (
    <div style={{ background: T.lift, borderRadius: 16, border: `1px solid ${T.rule}`, overflow: "hidden", marginTop: 4 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px 10px", borderBottom: `1px solid ${T.rule}` }}>
        <div>
          <p style={{ fontFamily: sans, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.12em", color: T.mid, margin: "0 0 2px" }}>From the same house</p>
          <p style={{ fontFamily: serif, fontSize: 16, color: T.black, margin: 0 }}>{currentFrag.house}</p>
        </div>
        <span style={{ fontFamily: sans, fontSize: 10, color: T.mid, cursor: "pointer" }}>View all →</span>
      </div>
      {/* Cards side by side — exactly like screenshot */}
      <div style={{ display: "flex", gap: 0, overflowX: "auto" }}>
        {siblings.map((f, i) => (
          <div key={f.id} onClick={() => onOpenFrag(f.id)}
            style={{ flexShrink: 0, width: 160, cursor: "pointer", padding: "14px 16px", borderRight: i < siblings.length - 1 ? `1px solid ${T.rule}` : "none", transition: "background 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.background = T.white}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              {/* Monogram tile matching screenshot */}
              <div style={{ width: 36, height: 36, borderRadius: 8, background: T.white, border: `1px solid ${T.rule}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ fontFamily: serif, fontSize: 11, color: T.ink }}>{f.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}</span>
              </div>
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

// ─── STATUS BADGE WITH DRAWING — pill style matching screenshot ───────────────
function StatusBadge({ statusKey }) {
  const st = STATUSES.find(s => s.key === statusKey);
  if (!st) return null;
  const isBottle = st.group === "bottle";
  const bgColor = isBottle ? T.black : T.white;
  const borderColor = isBottle ? T.black : T.rule;

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 6,
      padding: "5px 12px 5px 8px",
      borderRadius: 20, flexShrink: 0,
      border: `1px solid ${borderColor}`,
      background: bgColor,
    }}>
      {/* Drawing instead of icon */}
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
      <span style={{ fontFamily: sans, fontSize: 10, fontWeight: 500, color: isBottle ? T.white : T.mid }}>
        {st.label.split("—")[0].trim()}
      </span>
    </div>
  );
}

// ─── REACTION BAR ─────────────────────────────────────────────────────────────
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
        const iconColor = active ? T.white : T.mid;
        return (
          <button key={key} onClick={e=>{e.stopPropagation();onChange(active?null:key);}}
            style={{ display:"flex", alignItems:"center", gap: compact?3:5, padding: compact?"4px 9px":"7px 13px", borderRadius:20, cursor:"pointer", border:`1px solid ${active?T.black:T.rule}`, background:active?T.black:T.white, transition:"all 0.15s" }}>
            <Icon name={r.iconName} size={compact?13:15} color={iconColor}/>
            {!compact && <span style={{ fontFamily:sans, fontSize:11, fontWeight:500, color:active?T.white:T.mid }}>{r.label}</span>}
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
const STATUSES = [
  { key:"bottle_owned",    label:"Bottle — Owned",    iconName:"bottle",   group:"bottle" },
  { key:"bottle_wishlist", label:"Bottle — Wishlist", iconName:"wishstar", group:"bottle" },
  { key:"sample_have",     label:"Sample — In hand",  iconName:"sample",   group:"sample" },
  { key:"sample_wishlist", label:"Sample — Wishlist", iconName:"bookmark", group:"sample" },
  { key:"smelled",         label:"Smelled",           iconName:"nose",     group:"tried"  },
  { key:"tried_skin",      label:"Tried on skin",     iconName:"skin",     group:"tried"  },
];
function StatusSelector({ value, onChange }) {
  const groups = [
    { title:"Bottle", items:STATUSES.filter(s=>s.group==="bottle") },
    { title:"Sample", items:STATUSES.filter(s=>s.group==="sample") },
    { title:"Smelled",items:STATUSES.filter(s=>s.group==="tried")  },
  ];
  return (
    <div>
      {groups.map((g,gi) => (
        <div key={g.title} style={{ marginBottom:gi<2?16:0 }}>
          <p style={{ fontFamily:sans, fontSize:9, textTransform:"uppercase", letterSpacing:"0.12em", color:T.mid, margin:"0 0 7px" }}>{g.title}</p>
          <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
            {g.items.map(s => (
              <button key={s.key} onClick={()=>onChange(s.key===value?null:s.key)}
                style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 14px", borderRadius:10, border:`1px solid ${value===s.key?T.black:T.rule}`, background:value===s.key?T.black:T.white, cursor:"pointer" }}>
                <Icon name={s.iconName} size={18} color={value===s.key?T.white:T.mid}/>
                <span style={{ fontFamily:sans, fontSize:12, fontWeight:500, color:value===s.key?T.white:T.ink }}>{s.label}</span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── PRIVATE NOTE EDITOR ──────────────────────────────────────────────────────
function PrivateNoteEditor({ note, onSave }) {
  const [text,setText]=useState(note?.text||"");
  const [where,setWhere]=useState(note?.where||"");
  const [date,setDate]=useState(note?.date||new Date().toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}));
  const [saved,setSaved]=useState(false);
  function save(){onSave({text,where,date});setSaved(true);setTimeout(()=>setSaved(false),1800);}
  const inp={width:"100%",background:T.lift,border:`1px solid ${T.rule}`,borderRadius:8,padding:"9px 12px",fontSize:13,color:T.ink,outline:"none",fontFamily:sans,boxSizing:"border-box"};
  return (
    <div style={{ background:T.lift, borderRadius:14, border:`1px solid ${T.rule}`, padding:16 }}>
      <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:14 }}>
        <Icon name="lock" size={12} color={T.mid}/>
        <span style={{ fontFamily:sans, fontSize:9, textTransform:"uppercase", letterSpacing:"0.1em", color:T.mid }}>Private — only visible to you</span>
      </div>
      <p style={{ fontFamily:sans, fontSize:9, textTransform:"uppercase", letterSpacing:"0.12em", color:T.mid, margin:"0 0 6px" }}>What did you think?</p>
      <textarea value={text} onChange={e=>setText(e.target.value)} placeholder="First impression, dry-down, projection…" rows={4} style={{...inp,resize:"vertical",lineHeight:1.6,marginBottom:10}}/>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:14 }}>
        <div><p style={{ fontFamily:sans, fontSize:9, textTransform:"uppercase", letterSpacing:"0.12em", color:T.mid, margin:"0 0 6px" }}>Where smelled</p><input value={where} onChange={e=>setWhere(e.target.value)} placeholder="e.g. Saks, blind buy…" style={inp}/></div>
        <div><p style={{ fontFamily:sans, fontSize:9, textTransform:"uppercase", letterSpacing:"0.12em", color:T.mid, margin:"0 0 6px" }}>Date</p><input value={date} onChange={e=>setDate(e.target.value)} style={inp}/></div>
      </div>
      <button onClick={save} style={{ width:"100%", padding:"10px 0", borderRadius:8, background:saved?T.mid:T.black, border:"none", color:T.white, fontSize:12, fontFamily:sans, cursor:"pointer", transition:"background 0.2s" }}>{saved?"Saved ✓":"Save note"}</button>
    </div>
  );
}

// ─── SUGGEST MODAL ────────────────────────────────────────────────────────────
function SuggestModal({ onClose }) {
  const [form,setForm]=useState({name:"",house:"",houseUrl:"",year:"",family:"",concentration:"",notes:"",why:"",firstReview:""});
  const [submitted,setSubmitted]=useState(false);
  const [imageFile,setImageFile]=useState(null);
  const [imagePreview,setImagePreview]=useState(null);
  const inp={width:"100%",background:T.lift,border:`1px solid ${T.rule}`,borderRadius:8,padding:"9px 12px",fontSize:13,color:T.ink,outline:"none",fontFamily:sans,boxSizing:"border-box"};
  function set(k,v){setForm(f=>({...f,[k]:v}));}
  function handleImage(e){const file=e.target.files[0];if(file){setImageFile(file);const reader=new FileReader();reader.onload=ev=>setImagePreview(ev.target.result);reader.readAsDataURL(file);}}
  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, zIndex:60, background:"rgba(248,248,246,0.92)", backdropFilter:"blur(16px)", display:"flex", flexDirection:"column", justifyContent:"flex-end", alignItems:"center" }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:T.white, borderRadius:"24px 24px 0 0", border:`1px solid ${T.rule}`, borderBottom:"none", width:"100%", maxWidth:460, maxHeight:"90vh", overflowY:"auto" }}>
        <div style={{ padding:"24px 24px 0" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:6 }}>
            <div>
              <p style={{ fontFamily:sans, fontSize:9, textTransform:"uppercase", letterSpacing:"0.12em", color:T.mid, margin:"0 0 4px" }}>Community</p>
              <h2 style={{ fontFamily:serif, fontSize:24, color:T.black, margin:0 }}>Suggest a Fragrance</h2>
            </div>
            <button onClick={onClose} style={{ width:30, height:30, borderRadius:"50%", border:`1px solid ${T.rule}`, background:T.white, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, color:T.mid }}>✕</button>
          </div>
          <p style={{ fontFamily:sans, fontSize:13, color:T.mid, lineHeight:1.65, margin:"8px 0 20px" }}>Help us build the most complete fragrance database. Every suggestion is reviewed and typically added within 48 hours.</p>
        </div>
        {submitted ? (
          <div style={{ padding:"40px 24px", textAlign:"center" }}>
            <div style={{ width:56, height:56, borderRadius:"50%", background:T.black, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px", fontSize:24, color:T.white }}>✓</div>
            <h3 style={{ fontFamily:serif, fontSize:22, color:T.black, margin:"0 0 8px" }}>Thank you</h3>
            <p style={{ fontFamily:sans, fontSize:13, color:T.mid, lineHeight:1.65, margin:"0 0 24px" }}><strong style={{ color:T.ink }}>{form.name}</strong> by {form.house} has been submitted.</p>
            <button onClick={onClose} style={{ padding:"11px 24px", borderRadius:10, background:T.black, border:"none", color:T.white, fontSize:13, fontFamily:sans, cursor:"pointer" }}>Done</button>
          </div>
        ) : (
          <div style={{ padding:"0 24px 32px" }}>
            <div style={{ marginBottom:16 }}>
              <p style={{ fontFamily:sans, fontSize:9, textTransform:"uppercase", letterSpacing:"0.12em", color:T.mid, margin:"0 0 8px" }}>Fragrance Image</p>
              <label style={{ display:"block", cursor:"pointer" }}>
                <input type="file" accept="image/*" onChange={handleImage} style={{ display:"none" }}/>
                {imagePreview ? (
                  <div style={{ position:"relative", height:120, borderRadius:12, overflow:"hidden", border:`1px solid ${T.rule}` }}>
                    <img src={imagePreview} style={{ width:"100%", height:"100%", objectFit:"cover" }} alt="preview"/>
                    <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.3)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                      <span style={{ fontFamily:sans, fontSize:11, color:T.white }}>Change image</span>
                    </div>
                  </div>
                ) : (
                  <div style={{ height:80, borderRadius:12, border:`1.5px dashed ${T.rule}`, background:T.lift, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:6 }}>
                    <span style={{ fontFamily:sans, fontSize:11, color:T.mid }}>Upload bottle photo</span>
                  </div>
                )}
              </label>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:12 }}>
              <div style={{ gridColumn:"1/-1" }}><p style={{ fontFamily:sans, fontSize:9, textTransform:"uppercase", letterSpacing:"0.12em", color:T.mid, margin:"0 0 6px" }}>Fragrance name *</p><input value={form.name} onChange={e=>set("name",e.target.value)} placeholder="e.g. Tobacco Oud" style={inp}/></div>
              <div><p style={{ fontFamily:sans, fontSize:9, textTransform:"uppercase", letterSpacing:"0.12em", color:T.mid, margin:"0 0 6px" }}>House *</p><input value={form.house} onChange={e=>set("house",e.target.value)} placeholder="e.g. Tom Ford" style={inp}/></div>
              <div><p style={{ fontFamily:sans, fontSize:9, textTransform:"uppercase", letterSpacing:"0.12em", color:T.mid, margin:"0 0 6px" }}>House Website</p><input value={form.houseUrl} onChange={e=>set("houseUrl",e.target.value)} placeholder="tomford.com" style={inp}/></div>
              <div><p style={{ fontFamily:sans, fontSize:9, textTransform:"uppercase", letterSpacing:"0.12em", color:T.mid, margin:"0 0 6px" }}>Year</p><input value={form.year} onChange={e=>set("year",e.target.value)} placeholder="e.g. 2018" style={inp}/></div>
              <div><p style={{ fontFamily:sans, fontSize:9, textTransform:"uppercase", letterSpacing:"0.12em", color:T.mid, margin:"0 0 6px" }}>Family</p><input value={form.family} onChange={e=>set("family",e.target.value)} placeholder="e.g. Woody Oriental" style={inp}/></div>
              <div style={{ gridColumn:"1/-1" }}><p style={{ fontFamily:sans, fontSize:9, textTransform:"uppercase", letterSpacing:"0.12em", color:T.mid, margin:"0 0 6px" }}>Concentration</p>
                <select value={form.concentration} onChange={e=>set("concentration",e.target.value)} style={{...inp,appearance:"none"}}>
                  <option value="">Select…</option>
                  {["Eau de Parfum","Eau de Toilette","Parfum","Eau de Cologne","Eau Fraîche"].map(c=><option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div style={{ marginBottom:12 }}><p style={{ fontFamily:sans, fontSize:9, textTransform:"uppercase", letterSpacing:"0.12em", color:T.mid, margin:"0 0 6px" }}>Key notes (if known)</p><input value={form.notes} onChange={e=>set("notes",e.target.value)} placeholder="e.g. Tobacco, Oud, Vanilla…" style={inp}/></div>
            <div style={{ marginBottom:12 }}><p style={{ fontFamily:sans, fontSize:9, textTransform:"uppercase", letterSpacing:"0.12em", color:T.mid, margin:"0 0 6px" }}>Why should we add this?</p><textarea value={form.why} onChange={e=>set("why",e.target.value)} placeholder="Tell us why this fragrance deserves a place…" rows={2} style={{...inp,resize:"vertical",lineHeight:1.6}}/></div>
            <div style={{ marginBottom:20, background:T.lift, borderRadius:12, padding:14, border:`1px solid ${T.rule}` }}>
              <p style={{ fontFamily:sans, fontSize:9, textTransform:"uppercase", letterSpacing:"0.12em", color:T.mid, margin:"0 0 6px" }}>Your First Review (optional)</p>
              <textarea value={form.firstReview} onChange={e=>set("firstReview",e.target.value)} placeholder="How does it open? What does the dry-down smell like? Who is this for?" rows={3} style={{...inp,resize:"vertical",lineHeight:1.6}}/>
            </div>
            <button onClick={()=>{if(form.name&&form.house)setSubmitted(true);}} style={{ width:"100%", padding:"13px 0", borderRadius:10, background:form.name&&form.house?T.black:T.faint, border:"none", color:T.white, fontSize:13, fontFamily:sans, cursor:form.name&&form.house?"pointer":"not-allowed" }}>Submit suggestion</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── DATA ─────────────────────────────────────────────────────────────────────
const FRAGRANCES = [
  { id:1, name:"Aventus", house:"Creed", year:2010, perfumer:"Olivier Creed & Erwin Creed", family:"Chypre Fruity", concentration:"Eau de Parfum",
    description:"Opens with explosive pineapple and blackcurrant before evolving into a smoky, mossy heart. Simultaneously powerful and quietly refined.",
    story:"Inspired by the legend of Napoleon — the smoke of battle, cool northern forests, the sweet spoils of victory.",
    prices:[{size:"100ml",price:"$495",perMl:"$4.95"},{size:"50ml",price:"$310",perMl:"$6.20"},{size:"10ml Travel",price:"$98",perMl:"$9.80"},{size:"2ml Sample",price:"$12",perMl:"$6.00",sample:true}],
    notes:{top:[{n:"Pineapple"},{n:"Blackcurrant"},{n:"Apple"},{n:"Bergamot"}],mid:[{n:"Birch"},{n:"Patchouli"},{n:"Jasmine"},{n:"Rose"}],base:[{n:"Musk"},{n:"Oakmoss"},{n:"Ambergris"},{n:"Vanilla"}]},
    accords:[{n:"Fruity",v:85},{n:"Smoky",v:72},{n:"Woody",v:68},{n:"Fresh",v:55},{n:"Mossy",v:48}],
    longevity:4.2, sillage:3.8, seasons:{spring:70,summer:55,fall:85,winter:60}, occasions:["Work","Evening","Formal"], rating:4.6, votes:14823 },
  { id:2, name:"Black Orchid", house:"Tom Ford", year:2006, perfumer:"David Apel", family:"Floral Oriental", concentration:"Eau de Parfum",
    description:"Darkly luxurious — rare black truffle and ylang ylang bloom over orchid petals and lotus wood. Opulent, mysterious, unforgettable.",
    story:"Tom Ford's debut set the tone for everything that followed — maximalist, dark, unapologetically seductive.",
    prices:[{size:"100ml",price:"$235",perMl:"$2.35"},{size:"50ml",price:"$160",perMl:"$3.20"},{size:"10ml Travel",price:"$55",perMl:"$5.50"},{size:"2ml Sample",price:"$8",perMl:"$4.00",sample:true}],
    notes:{top:[{n:"Black Truffle"},{n:"Ylang-Ylang"},{n:"Bergamot"},{n:"Blackcurrant"}],mid:[{n:"Black Orchid"},{n:"Jasmine"},{n:"Gardenia"},{n:"Lotus"}],base:[{n:"Patchouli"},{n:"Vanilla"},{n:"Sandalwood"},{n:"Incense"}]},
    accords:[{n:"Floral",v:90},{n:"Dark",v:82},{n:"Oriental",v:75},{n:"Earthy",v:60},{n:"Sweet",v:45}],
    longevity:4.7, sillage:4.5, seasons:{spring:40,summer:25,fall:80,winter:95}, occasions:["Evening","Date Night"], rating:4.3, votes:9241 },
  { id:3, name:"Oud Wood", house:"Tom Ford", year:2007, perfumer:"Pierre Negrin", family:"Woody Oriental", concentration:"Eau de Parfum",
    description:"Rare agarwood blends with rosewood, cardamom, and sandalwood — ancient and modern simultaneously.",
    story:"Ford's distillation of the souk — incense smoke in hot air, rare woods in shadows, the smell of somewhere else.",
    prices:[{size:"100ml",price:"$280",perMl:"$2.80"},{size:"50ml",price:"$195",perMl:"$3.90"},{size:"10ml Travel",price:"$65",perMl:"$6.50"},{size:"2ml Sample",price:"$9",perMl:"$4.50",sample:true}],
    notes:{top:[{n:"Oud"},{n:"Rosewood"},{n:"Cardamom"}],mid:[{n:"Sandalwood"},{n:"Vetiver"},{n:"Papyrus"}],base:[{n:"Tonka Bean"},{n:"Amber"},{n:"Musk"}]},
    accords:[{n:"Woody",v:95},{n:"Oriental",v:78},{n:"Smoky",v:70},{n:"Spicy",v:65},{n:"Earthy",v:55}],
    longevity:4.5, sillage:3.9, seasons:{spring:50,summer:30,fall:85,winter:90}, occasions:["Evening","Formal"], rating:4.4, votes:11059 },
  { id:4, name:"Baccarat Rouge 540", house:"Maison Francis Kurkdjian", year:2015, perfumer:"Francis Kurkdjian", family:"Floral Woody Musk", concentration:"Eau de Parfum",
    description:"Saffron and jasmine float above amberwood and fir resin — an almost synesthetic experience of warmth without weight.",
    story:"Created for Baccarat crystal's 250th anniversary — light refracting through crystal, prismatic and pure.",
    prices:[{size:"200ml",price:"$830",perMl:"$4.15"},{size:"70ml",price:"$345",perMl:"$4.93"},{size:"35ml",price:"$215",perMl:"$6.14"},{size:"2ml Sample",price:"$14",perMl:"$7.00",sample:true}],
    notes:{top:[{n:"Saffron"},{n:"Jasmine"}],mid:[{n:"Amberwood"},{n:"Ambergris"}],base:[{n:"Fir Resin"},{n:"Cedar"}]},
    accords:[{n:"Warm Spicy",v:88},{n:"Amber",v:80},{n:"Woody",v:78},{n:"Floral",v:65},{n:"Sweet",v:62}],
    longevity:4.8, sillage:4.6, seasons:{spring:75,summer:65,fall:90,winter:85}, occasions:["Work","Evening","Casual"], rating:4.5, votes:18302 },
  { id:5, name:"Santal 33", house:"Le Labo", year:2011, perfumer:"Frank Voelkl", family:"Woody", concentration:"Eau de Parfum",
    description:"Papyrus, cedarwood, and cardamom over sandalwood and violet. The scent of the American West imagined by a New Yorker.",
    story:"An ode to the campfire — leather, wood smoke, and the open plains rendered in a quietly iconic bottle.",
    prices:[{size:"100ml",price:"$310",perMl:"$3.10"},{size:"50ml",price:"$200",perMl:"$4.00"},{size:"15ml Travel",price:"$78",perMl:"$5.20"},{size:"2ml Sample",price:"$10",perMl:"$5.00",sample:true}],
    notes:{top:[{n:"Cardamom"},{n:"Iris"},{n:"Violet"}],mid:[{n:"Amberwood"},{n:"Cedarwood"},{n:"Sandalwood"}],base:[{n:"Papyrus"},{n:"Leather"},{n:"Musk"}]},
    accords:[{n:"Woody",v:92},{n:"Smoky",v:68},{n:"Creamy",v:60},{n:"Floral",v:45},{n:"Spicy",v:40}],
    longevity:4.0, sillage:3.5, seasons:{spring:60,summer:45,fall:88,winter:75}, occasions:["Casual","Work","Weekend"], rating:4.2, votes:7834 },
  { id:6, name:"Tobacco Vanille", house:"Tom Ford", year:2007, perfumer:"Unknown", family:"Oriental Spicy", concentration:"Eau de Parfum",
    description:"Rich tobacco leaf and aromatic spices blend into vanilla and tonka bean — warm, heady, and unapologetically indulgent.",
    story:"An English gentlemen's club filtered through Ford's unerring sense for luxury.",
    prices:[{size:"100ml",price:"$295",perMl:"$2.95"},{size:"50ml",price:"$195",perMl:"$3.90"},{size:"10ml Travel",price:"$68",perMl:"$6.80"},{size:"2ml Sample",price:"$9",perMl:"$4.50",sample:true}],
    notes:{top:[{n:"Cardamom"},{n:"Tobacco"}],mid:[{n:"Vanilla"},{n:"Cocoa"}],base:[{n:"Tonka Bean"},{n:"Amber"},{n:"Musk"}]},
    accords:[{n:"Tobacco",v:90},{n:"Sweet",v:82},{n:"Warm Spicy",v:74},{n:"Amber",v:68},{n:"Woody",v:55}],
    longevity:4.6, sillage:4.2, seasons:{spring:30,summer:15,fall:88,winter:95}, occasions:["Evening","Formal","Date Night"], rating:4.5, votes:12400 },
];

const GLOSSARY = [
  {term:"Sillage",  def:"The trail a fragrance leaves in the air behind you — from the French word for 'wake.'"},
  {term:"Dry Down", def:"The final phase after top and middle notes evaporate, revealing the true character of the base."},
  {term:"Chypre",   def:"Built on bergamot, labdanum, and oakmoss. Named after the island of Cyprus."},
  {term:"Oud",      def:"Agarwood resin from infected Aquilaria trees. One of the rarest materials in perfumery."},
  {term:"Accord",   def:"A blend of notes that creates a unified impression — like a chord in music."},
  {term:"Fougère",  def:"From the French for 'fern.' Classic structure of lavender, coumarin, and oakmoss."},
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function Stars({ rating, size=11 }) {
  return <div style={{display:"flex",gap:1}}>{[1,2,3,4,5].map(i=><span key={i} style={{fontSize:size,color:i<=Math.round(rating)?T.black:T.faint}}>★</span>)}</div>;
}
function Lbl({ children, mb=10 }) {
  return <p style={{fontFamily:sans,fontSize:9,textTransform:"uppercase",letterSpacing:"0.12em",color:T.mid,margin:`0 0 ${mb}px`}}>{children}</p>;
}
function Mono({ name, year, size=52 }) {
  const ini=name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();
  return (
    <div style={{width:size,height:size,borderRadius:Math.round(size*0.2),background:T.lift,border:`1px solid ${T.rule}`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",flexShrink:0}}>
      <span style={{fontFamily:serif,fontSize:size*0.22,color:T.ink,lineHeight:1}}>{ini}</span>
      {year&&<span style={{fontFamily:sans,fontSize:size*0.14,color:T.faint,marginTop:2,letterSpacing:"0.04em"}}>{year}</span>}
    </div>
  );
}

// ─── FRAG CARD ────────────────────────────────────────────────────────────────
function FragCard({ frag, onClick, userStatus, reaction, onReaction, onOpenFrag }) {
  const [hov,setHov]=useState(false);
  const [showHouse,setShowHouse]=useState(false);
  const siblings=FRAGRANCES.filter(f=>f.house===frag.house&&f.id!==frag.id);
  return (
    <div style={{background:T.white,borderRadius:16,border:`1px solid ${hov?T.black:T.rule}`,transition:"border-color 0.15s",overflow:"hidden"}}>
      <div onClick={()=>onClick(frag.id)} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)} style={{padding:"14px 16px",display:"flex",alignItems:"center",gap:14,cursor:"pointer"}}>
        <Mono name={frag.name} year={frag.year} size={52}/>
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:8}}>
            <div>
              <p style={{fontFamily:serif,fontSize:15,color:T.black,margin:0,lineHeight:1.2}}>{frag.name}</p>
              <p style={{fontFamily:sans,fontSize:11,color:T.mid,margin:"2px 0 0"}}>{frag.house}</p>
            </div>
            {userStatus && <StatusBadge statusKey={userStatus}/>}
          </div>
          <div style={{display:"flex",alignItems:"center",gap:6,marginTop:5}}><Stars rating={frag.rating}/><span style={{fontFamily:sans,fontSize:10,color:T.faint}}>{frag.votes.toLocaleString()}</span></div>
          <div style={{display:"flex",gap:5,flexWrap:"wrap",marginTop:6}}>
            {frag.occasions.slice(0,2).map(o=><span key={o} style={{fontFamily:sans,fontSize:10,padding:"2px 8px",borderRadius:20,background:T.lift,color:T.mid,border:`1px solid ${T.rule}`}}>{o}</span>)}
          </div>
        </div>
      </div>
      <div style={{padding:"10px 16px 12px",borderTop:`1px solid ${T.lift}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <ReactionBar value={reaction} onChange={onReaction} compact/>
        <span style={{fontFamily:sans,fontSize:10,color:T.mid,cursor:"pointer"}} onClick={()=>onClick(frag.id)}>Details →</span>
      </div>
      {siblings.length>0&&(
        <div style={{borderTop:`1px solid ${T.lift}`}}>
          <button onClick={()=>setShowHouse(!showHouse)} style={{width:"100%",padding:"9px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",background:"none",border:"none",cursor:"pointer"}}>
            <span style={{fontFamily:sans,fontSize:10,color:T.mid}}>More from {frag.house}</span>
            <span style={{fontFamily:sans,fontSize:10,color:T.faint,transition:"transform 0.2s",display:"inline-block",transform:showHouse?"rotate(180deg)":"none"}}>▾</span>
          </button>
          {showHouse&&(
            <div style={{display:"flex",overflowX:"auto",gap:0,borderTop:`1px solid ${T.lift}`}}>
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
function DetailModal({ frag, onClose, userStatus, setUserStatus, privateNote, setPrivateNote, reaction, setReaction, onOpenFrag }) {
  const [tab,setTab]=useState("overview");
  const [replyText,setReplyText]=useState("");
  const [replyTo,setReplyTo]=useState(null);
  const [replies,setReplies]=useState({});
  const REVIEWS=[
    {id:0,user:"scentcollector_jw",rating:5,text:"Give it 20 minutes past the opening — the smoky birch dry-down is masterful.",date:"2 days ago",helpful:34},
    {id:1,user:"niche_nomad",rating:4,text:"Overpriced? Yes. Masterpiece of construction? Undeniably.",date:"1 week ago",helpful:28},
    {id:2,user:"basenotebrigade",rating:5,text:"Had three people ask what I was wearing at a conference. Projection is serious.",date:"2 weeks ago",helpful:19},
  ];

  function submitReply(reviewId){
    if(!replyText.trim())return;
    setReplies(r=>({...r,[reviewId]:[...(r[reviewId]||[]),{user:"You",text:replyText,date:"Just now"}]}));
    setReplyText("");setReplyTo(null);
  }

  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,zIndex:50,background:"rgba(248,248,246,0.9)",backdropFilter:"blur(16px)",display:"flex",flexDirection:"column",justifyContent:"flex-end",alignItems:"center"}}>
      <div onClick={e=>e.stopPropagation()} style={{background:T.white,borderRadius:"24px 24px 0 0",border:`1px solid ${T.rule}`,borderBottom:"none",width:"100%",maxWidth:460,maxHeight:"93vh",overflowY:"auto"}}>

        {/* Hero */}
        <div style={{position:"relative",padding:"26px 24px 20px",borderBottom:`1px solid ${T.rule}`,overflow:"hidden"}}>
          <button onClick={onClose} style={{position:"absolute",top:16,right:16,width:30,height:30,borderRadius:"50%",border:`1px solid ${T.rule}`,background:T.white,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,color:T.mid,zIndex:2}}>✕</button>
          <div style={{display:"flex",alignItems:"flex-start",gap:16}}>
            <div style={{flex:1}}>
              <div style={{marginBottom:8}}><span style={{fontFamily:sans,fontSize:9,textTransform:"uppercase",letterSpacing:"0.12em",color:T.mid}}>{frag.house} · {frag.family}</span></div>
              <h2 style={{fontFamily:serif,fontSize:28,color:T.black,margin:"0 0 4px",letterSpacing:-0.5,lineHeight:1.1}}>{frag.name}</h2>
              <p style={{fontFamily:sans,fontSize:13,color:T.mid,margin:"0 0 14px"}}>{frag.year} · {frag.concentration}</p>
              <ReactionBar value={reaction} onChange={setReaction}/>
            </div>
            <div style={{width:80,height:100,borderRadius:12,background:`linear-gradient(160deg,${T.lift},${T.press})`,border:`1px solid ${T.rule}`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:4}}>
              <span style={{fontFamily:serif,fontSize:22,color:T.ink,opacity:0.3,lineHeight:1}}>{frag.name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase()}</span>
              <span style={{fontFamily:sans,fontSize:8,color:T.faint,marginTop:4,textAlign:"center",lineHeight:1.3,padding:"0 4px"}}>No image yet</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{display:"flex",borderBottom:`1px solid ${T.rule}`,padding:"0 24px",overflowX:"auto"}}>
          {["overview","notes","pricing","my notes","status","community"].map(t=>(
            <button key={t} onClick={()=>setTab(t)} style={{marginRight:16,padding:"11px 0",whiteSpace:"nowrap",fontSize:10,textTransform:"uppercase",letterSpacing:"0.08em",color:tab===t?T.black:T.mid,background:"none",border:"none",borderBottom:tab===t?`2px solid ${T.black}`:"2px solid transparent",marginBottom:-1,cursor:"pointer",fontFamily:sans}}>{t}</button>
          ))}
        </div>

        {/* Stats */}
        {(tab==="overview"||tab==="community"||tab==="pricing")&&(
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",borderBottom:`1px solid ${T.rule}`}}>
          {[{label:"Rating",value:frag.rating},{label:"Longevity",value:`${frag.longevity}/5`},{label:"Sillage",value:`${frag.sillage}/5`}].map((s,i)=>(
            <div key={s.label} style={{padding:"12px 6px",textAlign:"center",borderRight:i<2?`1px solid ${T.rule}`:"none"}}>
              <p style={{fontFamily:serif,fontSize:16,color:T.black,margin:0}}>{s.value}</p>
              <p style={{fontFamily:sans,fontSize:9,color:T.mid,textTransform:"uppercase",letterSpacing:"0.09em",margin:"3px 0 0"}}>{s.label}</p>
            </div>
          ))}
        </div>
        )}

        <div style={{padding:24}}>
          {/* OVERVIEW */}
          {tab==="overview"&&(
            <div>
              <p style={{fontFamily:sans,fontSize:14,color:T.mid,lineHeight:1.75,margin:"0 0 20px"}}>{frag.description}</p>
              <div style={{background:T.lift,borderRadius:12,padding:16,marginBottom:24,border:`1px solid ${T.rule}`}}>
                <Lbl>The Story</Lbl>
                <p style={{fontFamily:sans,fontSize:13,color:T.mid,lineHeight:1.75,fontStyle:"italic",margin:0}}>{frag.story}</p>
              </div>
              <Lbl>Scent Accords</Lbl>
              <RadarChart accords={frag.accords}/>
              <div style={{borderTop:`1px solid ${T.rule}`,margin:"24px 0"}}/>
              <Lbl>Seasons</Lbl>
              <SeasonHeat seasons={frag.seasons}/>
              <div style={{borderTop:`1px solid ${T.rule}`,margin:"24px 0"}}/>
              <Lbl>Occasions</Lbl>
              <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:24}}>
                {frag.occasions.map(o=><span key={o} style={{fontFamily:sans,fontSize:12,padding:"5px 12px",borderRadius:20,border:`1px solid ${T.rule}`,color:T.mid}}>{o}</span>)}
              </div>
              {/* House strip — directly below occasions, always visible, exactly like screenshot */}
              <HouseStrip currentFrag={frag} onOpenFrag={id=>{onClose();setTimeout(()=>onOpenFrag(id),50);}}/>
            </div>
          )}

          {/* NOTES */}
          {tab==="notes"&&(
            <div>
              {[
                {tier:"top", label:"Top Notes",   time:"0 – 30 min",     notes:frag.notes.top,  desc:"Vivid but fleeting."},
                {tier:"mid", label:"Heart Notes", time:"30 min – 4 hrs", notes:frag.notes.mid,  desc:"The true character."},
                {tier:"base",label:"Base Notes",  time:"4+ hours",       notes:frag.notes.base, desc:"The foundation that lingers."},
              ].map(({tier,label,time,notes:ns,desc},si)=>(
                <div key={tier} style={{marginBottom:si<2?28:0}}>
                  <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14,padding:"10px 14px",borderRadius:10,background:T.lift,border:`1px solid ${T.rule}`}}>
                    <div style={{width:22,height:22,borderRadius:6,fontSize:10,fontWeight:700,fontFamily:sans,display:"flex",alignItems:"center",justifyContent:"center",background:T.black,color:T.white}}>
                      {tier==="top"?"T":tier==="mid"?"H":"B"}
                    </div>
                    <div style={{flex:1}}>
                      <span style={{fontFamily:sans,fontSize:12,fontWeight:600,color:T.ink}}>{label}</span>
                      <span style={{fontFamily:sans,fontSize:11,color:T.mid,marginLeft:8}}>{desc}</span>
                    </div>
                    <span style={{fontFamily:sans,fontSize:9,color:T.faint}}>{time}</span>
                  </div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:10}}>
                    {ns.map(note=><NoteIllustration key={note.n} name={note.n} size={72}/>)}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* PRICING */}
          {tab==="pricing"&&(
            <div>
              <p style={{fontFamily:sans,fontSize:13,color:T.mid,lineHeight:1.65,margin:"0 0 16px"}}>Official retail pricing across all available sizes.</p>
              <PriceTable prices={frag.prices}/>
              <div style={{background:T.lift,borderRadius:10,padding:12,border:`1px solid ${T.rule}`,marginTop:14}}>
                <div style={{display:"flex",alignItems:"flex-start",gap:8}}>
                  <Icon name="tip" size={14} color={T.mid}/>
                  <p style={{fontFamily:sans,fontSize:11,color:T.mid,lineHeight:1.55,margin:0}}><strong style={{color:T.ink}}>Always try a sample first.</strong> A 2ml sample gives you 2–3 full wears — enough to know the dry-down.</p>
                </div>
              </div>
            </div>
          )}

          {/* MY NOTES */}
          {tab==="my notes"&&(
            <div>
              {privateNote?.text&&(
                <div style={{background:T.white,border:`1px solid ${T.rule}`,borderRadius:14,padding:16,marginBottom:16}}>
                  <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:10}}>
                    <Icon name="lock" size={11} color={T.mid}/>
                    <span style={{fontFamily:sans,fontSize:9,textTransform:"uppercase",letterSpacing:"0.1em",color:T.mid}}>Your note</span>
                    {privateNote.date&&<span style={{fontFamily:sans,fontSize:10,color:T.faint,marginLeft:"auto"}}>{privateNote.date}</span>}
                  </div>
                  {privateNote.where&&<div style={{display:"flex",alignItems:"center",gap:5,marginBottom:8}}><Icon name="pin" size={12} color={T.mid}/><p style={{fontFamily:sans,fontSize:11,color:T.mid,margin:0}}>{privateNote.where}</p></div>}
                  <p style={{fontFamily:sans,fontSize:13,color:T.ink,lineHeight:1.7,margin:0,fontStyle:"italic"}}>"{privateNote.text}"</p>
                </div>
              )}
              <PrivateNoteEditor note={privateNote} onSave={setPrivateNote}/>
            </div>
          )}

          {/* STATUS */}
          {tab==="status"&&(
            <div>
              <p style={{fontFamily:sans,fontSize:13,color:T.mid,lineHeight:1.65,margin:"0 0 18px"}}>Track exactly where this fragrance lives in your life.</p>
              <StatusSelector value={userStatus} onChange={setUserStatus}/>
            </div>
          )}

          {/* COMMUNITY */}
          {tab==="community"&&(
            <div>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
                <div>
                  <span style={{fontFamily:serif,fontSize:44,color:T.black,lineHeight:1}}>{frag.rating}</span>
                  <span style={{fontFamily:sans,fontSize:14,color:T.mid}}> / 5</span>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginTop:5}}><Stars rating={frag.rating} size={12}/><span style={{fontFamily:sans,fontSize:11,color:T.mid}}>{frag.votes.toLocaleString()} ratings</span></div>
                </div>
                <button style={{padding:"9px 16px",borderRadius:10,background:T.black,border:"none",color:T.white,fontSize:12,fontFamily:sans,cursor:"pointer"}}>Write Review</button>
              </div>
              {REVIEWS.map((r,ri)=>(
                <div key={r.id} style={{border:`1px solid ${T.rule}`,borderRadius:12,padding:16,marginBottom:10,background:T.white}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <div style={{width:28,height:28,borderRadius:"50%",background:T.lift,border:`1px solid ${T.rule}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:500,color:T.mid,fontFamily:sans}}>{r.user[0].toUpperCase()}</div>
                      <span style={{fontFamily:sans,fontSize:12,color:T.mid}}>{r.user}</span>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:8}}><Stars rating={r.rating} size={10}/><span style={{fontFamily:sans,fontSize:10,color:T.faint}}>{r.date}</span></div>
                  </div>
                  <p style={{fontFamily:sans,fontSize:13,color:T.mid,lineHeight:1.65,margin:"0 0 10px"}}>{r.text}</p>
                  <div style={{display:"flex",alignItems:"center",gap:12}}>
                    <span style={{display:"flex",alignItems:"center",gap:4,fontFamily:sans,fontSize:11,color:T.faint,cursor:"pointer"}}><Icon name="thumbsup" size={12} color={T.faint}/> Helpful ({r.helpful})</span>
                    <button onClick={()=>setReplyTo(replyTo===r.id?null:r.id)} style={{fontFamily:sans,fontSize:11,color:T.mid,background:"none",border:"none",cursor:"pointer",padding:0}}>Reply</button>
                  </div>
                  {(replies[r.id]||[]).map((rep,i)=>(
                    <div key={i} style={{marginTop:10,paddingTop:10,paddingLeft:14,borderTop:`1px solid ${T.lift}`,borderLeft:`2px solid ${T.rule}`,marginLeft:8}}>
                      <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
                        <div style={{width:20,height:20,borderRadius:"50%",background:T.black,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:T.white,fontFamily:sans}}>Y</div>
                        <span style={{fontFamily:sans,fontSize:11,color:T.mid}}>{rep.user}</span>
                        <span style={{fontFamily:sans,fontSize:10,color:T.faint,marginLeft:"auto"}}>{rep.date}</span>
                      </div>
                      <p style={{fontFamily:sans,fontSize:12,color:T.mid,lineHeight:1.6,margin:0}}>{rep.text}</p>
                    </div>
                  ))}
                  {replyTo===r.id&&(
                    <div style={{marginTop:10,paddingTop:10,borderTop:`1px solid ${T.lift}`,display:"flex",gap:8}}>
                      <input value={replyText} onChange={e=>setReplyText(e.target.value)} placeholder="Add a reply…" onKeyDown={e=>e.key==="Enter"&&submitReply(r.id)} style={{flex:1,background:T.lift,border:`1px solid ${T.rule}`,borderRadius:8,padding:"8px 12px",fontSize:12,color:T.ink,outline:"none",fontFamily:sans}}/>
                      <button onClick={()=>submitReply(r.id)} style={{padding:"8px 14px",borderRadius:8,background:T.black,border:"none",color:T.white,fontSize:11,fontFamily:sans,cursor:"pointer"}}>Post</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── DISCOVER ─────────────────────────────────────────────────────────────────
const CHAT_RESP={
  library:{text:"A library in autumn — paper, ink, a whisper of smoke. Oud Wood by Tom Ford is uncannily bookish.",fragId:3},
  quiet:{text:"Quiet luxury that announces itself only when someone leans close. Baccarat Rouge 540 is the archetype.",fragId:4},
  winter:{text:"Cold weather makes fragrances bloom differently. Black Orchid is built for exactly this.",fragId:2},
  default:{text:"Based on what you're describing, I'd start with Aventus. The pineapple opening fades to something smoky and quietly powerful.",fragId:1},
};
function getResp(msg){const l=msg.toLowerCase();if(l.includes("library")||l.includes("book")||l.includes("paper")||l.includes("autumn"))return CHAT_RESP.library;if(l.includes("quiet")||l.includes("expensive")||l.includes("luxury"))return CHAT_RESP.quiet;if(l.includes("winter")||l.includes("cold")||l.includes("fire"))return CHAT_RESP.winter;return CHAT_RESP.default;}

function DiscoverTab({ onOpenFrag, userStatuses, reactions, onReaction, onSuggest }) {
  const [messages,setMessages]=useState([{role:"ai",text:"Tell me what you're in the mood for — a memory, a mood, an aesthetic. I'll find your next fragrance."}]);
  const [input,setInput]=useState("");
  const [typing,setTyping]=useState(false);
  const [search,setSearch]=useState("");
  const CHIPS=[{label:"Library in autumn",query:"something that smells like a library in autumn"},{label:"Quiet luxury",query:"expensive but quiet, not loud"},{label:"Cold winter nights",query:"cold winter nights by a fire"},{label:"Office fresh",query:"fresh and clean for the office"}];

  const searchResults = search.trim().length > 0 ? FRAGRANCES.filter(f => {
    const q = search.toLowerCase();
    return f.name.toLowerCase().includes(q) || f.house.toLowerCase().includes(q) || f.family.toLowerCase().includes(q) ||
      f.notes.top.concat(f.notes.mid, f.notes.base).some(n => n.n.toLowerCase().includes(q)) ||
      f.occasions.some(o => o.toLowerCase().includes(q));
  }) : [];

  function send(text){const msg=text||input;if(!msg.trim())return;setMessages(m=>[...m,{role:"user",text:msg}]);setInput("");setTyping(true);setTimeout(()=>{const r=getResp(msg);const frag=FRAGRANCES.find(f=>f.id===r.fragId);setTyping(false);setMessages(m=>[...m,{role:"ai",text:r.text,frag}]);},1300);}

  return (
    <div>
      <div style={{borderBottom:`2px solid ${T.black}`,paddingBottom:14,marginBottom:22}}>
        <p style={{fontFamily:sans,fontSize:9,textTransform:"uppercase",letterSpacing:"0.18em",color:T.mid,margin:"0 0 4px"}}>Discover</p>
        <h2 style={{fontFamily:serif,fontSize:30,color:T.black,letterSpacing:-0.5,margin:0}}>Find Your Scent</h2>
        <p style={{fontFamily:sans,fontSize:13,color:T.mid,margin:"6px 0 0"}}>Search by name, or let the Nose guide you.</p>
      </div>

      <div style={{marginBottom:search?10:28}}>
        <div style={{position:"relative"}}>
          <span style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",pointerEvents:"none"}}><Icon name="search" size={15} color={T.faint}/></span>
          <input
            value={search}
            onChange={e=>setSearch(e.target.value)}
            placeholder="Search by name, house, note, family…"
            style={{width:"100%",background:T.white,border:`1.5px solid ${search?T.black:T.rule}`,borderRadius:14,padding:"14px 44px 14px 44px",fontSize:14,color:T.black,outline:"none",boxSizing:"border-box",fontFamily:serif,letterSpacing:"0.01em",transition:"border-color 0.15s,box-shadow 0.15s",boxShadow:search?"0 2px 12px rgba(0,0,0,0.07)":"none"}}
          />
          {search&&<button onClick={()=>setSearch("")} style={{position:"absolute",right:14,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",fontSize:14,color:T.mid,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",width:24,height:24}}>✕</button>}
        </div>
        {search&&(
          <div style={{marginTop:6}}>
            {searchResults.length>0 ? (
              <>
                <p style={{fontFamily:sans,fontSize:11,color:T.mid,margin:"0 0 10px"}}>{searchResults.length} result{searchResults.length!==1?"s":""} for "<strong style={{color:T.ink}}>{search}</strong>"</p>
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  {searchResults.map(f=><FragCard key={f.id} frag={f} onClick={onOpenFrag} userStatus={userStatuses[f.id]} reaction={reactions[f.id]} onReaction={v=>onReaction(f.id,v)} onOpenFrag={onOpenFrag}/>)}
                </div>
              </>
            ) : (
              <div style={{textAlign:"center",padding:"32px 0",color:T.faint}}>
                <p style={{fontSize:24,marginBottom:6}}>○</p>
                <p style={{fontFamily:sans,fontSize:13,color:T.mid,margin:"0 0 12px"}}>No results for "{search}"</p>
                <button onClick={()=>setSearch("")} style={{fontFamily:sans,fontSize:11,padding:"7px 16px",borderRadius:20,border:`1px solid ${T.rule}`,background:T.white,color:T.mid,cursor:"pointer"}}>Clear</button>
              </div>
            )}
          </div>
        )}
      </div>

      {!search&&<div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
        <div style={{flex:1,height:1,background:T.rule}}/>
        <span style={{fontFamily:sans,fontSize:9,textTransform:"uppercase",letterSpacing:"0.14em",color:T.faint}}>or</span>
        <div style={{flex:1,height:1,background:T.rule}}/>
      </div>}

      {!search&&(
        <>
          <div style={{background:T.white,border:`1px solid ${T.rule}`,borderRadius:18,overflow:"hidden",marginBottom:14}}>
            <div style={{display:"flex",alignItems:"center",gap:8,padding:"11px 16px",borderBottom:`1px solid ${T.lift}`}}>
              <div style={{width:7,height:7,borderRadius:"50%",background:T.black}}/>
              <span style={{fontFamily:sans,fontSize:10,textTransform:"uppercase",letterSpacing:"0.1em",color:T.mid}}>Ask the Nose</span>
              <span style={{fontFamily:sans,fontSize:10,color:T.faint,marginLeft:"auto"}}>Describe a mood or feeling</span>
            </div>
            <div style={{padding:16,minHeight:160,maxHeight:210,overflowY:"auto",display:"flex",flexDirection:"column",gap:12}}>
              {messages.map((m,i)=>(
                <div key={i} style={{display:"flex",flexDirection:"column",alignItems:m.role==="user"?"flex-end":"flex-start"}}>
                  <div style={{maxWidth:"82%",padding:"10px 14px",borderRadius:16,borderTopRightRadius:m.role==="user"?4:16,borderTopLeftRadius:m.role==="ai"?4:16,background:m.role==="user"?T.black:T.lift,color:m.role==="user"?T.white:T.ink,fontSize:13,lineHeight:1.65,fontFamily:sans}}>{m.text}</div>
                  {m.frag&&<div onClick={()=>onOpenFrag(m.frag.id)} style={{marginTop:8,maxWidth:"82%",background:T.white,border:`1px solid ${T.rule}`,borderRadius:12,padding:"10px 12px",display:"flex",alignItems:"center",gap:10,cursor:"pointer"}}><Mono name={m.frag.name} size={36}/><div><p style={{fontFamily:serif,fontSize:13,color:T.black,margin:0}}>{m.frag.name}</p><p style={{fontFamily:sans,fontSize:10,color:T.mid,margin:"2px 0 0"}}>{m.frag.house} · {m.frag.family}</p></div></div>}
                </div>
              ))}
              {typing&&<div style={{display:"flex"}}><div style={{background:T.lift,borderRadius:16,borderTopLeftRadius:4,padding:"12px 14px",display:"flex",gap:4}}>{[0,1,2].map(i=><div key={i} style={{width:5,height:5,borderRadius:"50%",background:T.mid,animation:"bounce 1.2s infinite",animationDelay:`${i*150}ms`}}/>)}</div></div>}
            </div>
            <div style={{display:"flex",gap:8,padding:"11px 16px",borderTop:`1px solid ${T.lift}`}}>
              <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder="A library in autumn…" style={{flex:1,background:T.lift,border:`1px solid ${T.rule}`,borderRadius:10,padding:"9px 14px",fontSize:13,color:T.black,outline:"none",fontFamily:sans}}/>
              <button onClick={()=>send()} style={{width:38,height:38,borderRadius:10,background:T.black,border:"none",color:T.white,fontSize:16,cursor:"pointer",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>↑</button>
            </div>
          </div>
          <div style={{display:"flex",flexWrap:"wrap",gap:7,marginBottom:28}}>{CHIPS.map(c=><button key={c.label} onClick={()=>send(c.query)} style={{fontFamily:sans,fontSize:11,padding:"6px 13px",borderRadius:20,background:T.white,border:`1px solid ${T.rule}`,color:T.mid,cursor:"pointer"}}>{c.label}</button>)}</div>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}><div style={{flex:1,height:1,background:T.rule}}/><span style={{fontFamily:sans,fontSize:9,textTransform:"uppercase",letterSpacing:"0.14em",color:T.mid}}>Trending</span><div style={{flex:1,height:1,background:T.rule}}/></div>
          <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:24}}>{FRAGRANCES.slice(0,3).map(f=><FragCard key={f.id} frag={f} onClick={onOpenFrag} userStatus={userStatuses[f.id]} reaction={reactions[f.id]} onReaction={v=>onReaction(f.id,v)} onOpenFrag={onOpenFrag}/>)}</div>
          <button onClick={onSuggest} style={{width:"100%",padding:"13px 0",borderRadius:12,border:`1px solid ${T.rule}`,background:T.white,color:T.mid,fontSize:12,fontFamily:sans,cursor:"pointer"}}>+ Can't find a fragrance? Suggest it →</button>
        </>
      )}
      <style>{`@keyframes bounce{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-4px)}}`}</style>
    </div>
  );
}

// ─── COLLECTION ───────────────────────────────────────────────────────────────
function CollectionTab({ onOpenFrag, statuses:userStatuses, reactions, onReaction, onSuggest }) {
  const [activeFilter,setActiveFilter]=useState("all");
  const [search,setSearch]=useState("");
  const filters=[
    {key:"all",label:"All",iconName:null},
    {key:"bottle_owned",label:"Bottles",iconName:"bottle"},
    {key:"sample_have",label:"Samples",iconName:"sample"},
    {key:"tried_skin",label:"Tried",iconName:"skin"},
    {key:"smelled",label:"Smelled",iconName:"nose"},
    {key:"bottle_wishlist",label:"Bottle WL",iconName:"wishstar"},
    {key:"sample_wishlist",label:"Sample WL",iconName:"bookmark"},
    {key:"love",label:"Love",iconName:"flame"},
    {key:"like",label:"Like",iconName:"thumbsup"},
    {key:"dislike",label:"Dislike",iconName:"thumbsdown"},
  ];
  const counts={};STATUSES.forEach(s=>{counts[s.key]=FRAGRANCES.filter(f=>userStatuses[f.id]===s.key).length;});
  const rCounts={love:0,like:0,dislike:0};Object.values(reactions).forEach(r=>{if(r)rCounts[r]++;});
  const filtered=FRAGRANCES.filter(f=>{const rf=["love","like","dislike"];const ms=activeFilter==="all"||(rf.includes(activeFilter)?reactions[f.id]===activeFilter:userStatuses[f.id]===activeFilter);const mq=!search||f.name.toLowerCase().includes(search.toLowerCase())||f.house.toLowerCase().includes(search.toLowerCase())||f.family.toLowerCase().includes(search.toLowerCase())||f.notes.top.concat(f.notes.mid,f.notes.base).some(n=>n.n.toLowerCase().includes(search.toLowerCase()));return ms&&mq;});
  return (
    <div>
      <div style={{borderBottom:`2px solid ${T.black}`,paddingBottom:14,marginBottom:22}}>
        <h2 style={{fontFamily:serif,fontSize:30,color:T.black,letterSpacing:-0.5,margin:0}}>My Collection</h2>
        <p style={{fontFamily:sans,fontSize:13,color:T.mid,margin:"6px 0 0"}}>Bottles, samples, and everything in between.</p>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:6}}>
        <div style={{background:T.black,borderRadius:14,padding:"16px 14px"}}>
          <p style={{fontFamily:serif,fontSize:32,color:T.white,margin:0}}>{counts["bottle_owned"]||0}</p>
          <div style={{display:"flex",alignItems:"center",gap:5,marginTop:5}}><Icon name="bottle" size={13} color="#888"/><p style={{fontFamily:sans,fontSize:9,textTransform:"uppercase",letterSpacing:"0.1em",color:"#888",margin:0}}>Bottles owned</p></div>
        </div>
        <div style={{background:T.white,border:`1px solid ${T.rule}`,borderRadius:14,padding:"16px 14px"}}>
          <p style={{fontFamily:serif,fontSize:32,color:T.black,margin:0}}>{counts["sample_have"]||0}</p>
          <div style={{display:"flex",alignItems:"center",gap:5,marginTop:5}}><Icon name="sample" size={13} color={T.mid}/><p style={{fontFamily:sans,fontSize:9,textTransform:"uppercase",letterSpacing:"0.1em",color:T.mid,margin:0}}>Samples in hand</p></div>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:8}}>
        {[{k:"love",iconName:"flame",label:"Love"},{k:"like",iconName:"thumbsup",label:"Like"},{k:"dislike",iconName:"thumbsdown",label:"Dislike"}].map(r=>(
          <div key={r.k} onClick={()=>setActiveFilter(activeFilter===r.k?"all":r.k)} style={{background:activeFilter===r.k?T.black:T.white,border:`1px solid ${activeFilter===r.k?T.black:T.rule}`,borderRadius:12,padding:"12px 8px",textAlign:"center",cursor:"pointer",transition:"all 0.15s"}}>
            <p style={{fontFamily:serif,fontSize:22,color:activeFilter===r.k?T.white:T.black,margin:0}}>{rCounts[r.k]}</p>
            <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:4,marginTop:4}}>
              <Icon name={r.iconName} size={12} color={activeFilter===r.k?"#888":T.mid}/>
              <p style={{fontFamily:sans,fontSize:8,textTransform:"uppercase",letterSpacing:"0.07em",color:activeFilter===r.k?"#888":T.mid,margin:0}}>{r.label}</p>
            </div>
          </div>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:20}}>
        {[{key:"tried_skin",iconName:"skin",label:"Tried"},{key:"smelled",iconName:"nose",label:"Smelled"},{key:"bottle_wishlist",iconName:"wishstar",label:"WL"},{key:"sample_wishlist",iconName:"bookmark",label:"Samples"}].map(s=>(
          <div key={s.key} style={{background:T.white,border:`1px solid ${T.rule}`,borderRadius:12,padding:"12px 8px",textAlign:"center"}}>
            <p style={{fontFamily:serif,fontSize:22,color:T.black,margin:0}}>{counts[s.key]||0}</p>
            <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:3,marginTop:4}}>
              <Icon name={s.iconName} size={11} color={T.mid}/>
              <p style={{fontFamily:sans,fontSize:8,textTransform:"uppercase",letterSpacing:"0.07em",color:T.mid,margin:0}}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>
      <div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:4,marginBottom:14}}>{filters.map(f=>(
        <button key={f.key} onClick={()=>setActiveFilter(f.key)} style={{fontFamily:sans,fontSize:10,padding:"5px 12px",borderRadius:20,whiteSpace:"nowrap",border:`1px solid ${activeFilter===f.key?T.black:T.rule}`,background:activeFilter===f.key?T.black:T.white,color:activeFilter===f.key?T.white:T.mid,cursor:"pointer",display:"flex",alignItems:"center",gap:5}}>
          {f.iconName&&<Icon name={f.iconName} size={11} color={activeFilter===f.key?T.white:T.mid}/>}
          {f.label}
        </button>
      ))}</div>
      <div style={{position:"relative",marginBottom:12}}>
        <span style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)"}}><Icon name="search" size={14} color={T.faint}/></span>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by name, house, note…" style={{width:"100%",background:T.white,border:`1px solid ${search?T.black:T.rule}`,borderRadius:12,padding:"12px 14px 12px 40px",fontSize:13,color:T.black,outline:"none",boxSizing:"border-box",fontFamily:sans,transition:"border-color 0.15s"}}/>
        {search&&<button onClick={()=>setSearch("")} style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",fontSize:14,color:T.mid,cursor:"pointer"}}>✕</button>}
      </div>
      {search&&<p style={{fontFamily:sans,fontSize:11,color:T.mid,margin:"0 0 12px"}}>{filtered.length} result{filtered.length!==1?"s":""} for "{search}"</p>}
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {filtered.map(f=><FragCard key={f.id} frag={f} onClick={onOpenFrag} userStatus={userStatuses[f.id]} reaction={reactions[f.id]} onReaction={v=>onReaction(f.id,v)} onOpenFrag={onOpenFrag}/>)}
        {filtered.length===0&&<div style={{textAlign:"center",padding:"48px 0",color:T.faint}}><p style={{fontSize:28,marginBottom:8}}>○</p><p style={{fontSize:13,marginBottom:16}}>Nothing found</p></div>}
      </div>
      <div style={{marginTop:20}}><button onClick={onSuggest} style={{width:"100%",padding:"13px 0",borderRadius:12,border:`1px solid ${T.rule}`,background:T.white,color:T.mid,fontSize:12,fontFamily:sans,cursor:"pointer"}}>+ Missing a fragrance? Suggest it →</button></div>
    </div>
  );
}

// ─── JOURNAL ──────────────────────────────────────────────────────────────────
function JournalTab() {
  const entries=[
    {frag:"Aventus",house:"Creed",note:"Wore to the client meeting. The smoky birch felt authoritative without trying.",date:"Today",where:"Own bottle",active:true},
    {frag:"Oud Wood",house:"Tom Ford",note:"Evening wear. The papyrus note is mesmerizing in the cold. Long dry-down.",date:"3 days ago",where:"Sample — fragrance split",active:false},
    {frag:"Baccarat Rouge 540",house:"MFK",note:"The saffron-amberwood accord is unlike anything I own. Need a decant.",date:"1 week ago",where:"Saks Fifth Avenue counter",active:false},
    {frag:"Santal 33",house:"Le Labo",note:"Blind bought a sample. Smokier than I expected. Needs more skin time.",date:"2 weeks ago",where:"Blind buy — Decantery",active:false},
  ];
  return (
    <div>
      <div style={{borderBottom:`2px solid ${T.black}`,paddingBottom:14,marginBottom:22}}>
        <p style={{fontFamily:sans,fontSize:9,textTransform:"uppercase",letterSpacing:"0.18em",color:T.mid,margin:"0 0 4px"}}>Personal record</p>
        <h2 style={{fontFamily:serif,fontSize:30,color:T.black,letterSpacing:-0.5,margin:0}}>Scent Journal</h2>
        <p style={{fontFamily:sans,fontSize:13,color:T.mid,margin:"6px 0 0"}}>Every wear. Every first impression. Every place.</p>
      </div>
      <div style={{background:T.lift,border:`1px solid ${T.rule}`,borderRadius:16,padding:18,marginBottom:24}}>
        <Lbl>Taste Evolution</Lbl>
        <p style={{fontFamily:sans,fontSize:13,color:T.mid,lineHeight:1.7,margin:"0 0 14px"}}>Your sampling is moving from <span style={{color:T.black,fontWeight:500}}>fresh aquatics</span> toward <span style={{color:T.black,fontWeight:500}}>woody orientals</span>.</p>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{flex:1,textAlign:"center",padding:"8px 0",borderRadius:8,background:T.white,border:`1px solid ${T.rule}`}}><p style={{fontFamily:sans,fontSize:11,color:T.mid,margin:0}}>2023 · Fresh & Clean</p></div>
          <span style={{color:T.faint}}>→</span>
          <div style={{flex:1,textAlign:"center",padding:"8px 0",borderRadius:8,background:T.black}}><p style={{fontFamily:sans,fontSize:11,color:T.white,margin:0}}>Now · Woody Orientals</p></div>
        </div>
      </div>
      <Lbl>Wear Log</Lbl>
      <div style={{position:"relative"}}>
        <div style={{position:"absolute",left:9,top:10,bottom:24,width:1,background:T.rule}}/>
        {entries.map((e,i)=>(
          <div key={i} style={{display:"flex",gap:16,paddingBottom:22,position:"relative"}}>
            <div style={{width:19,height:19,borderRadius:"50%",flexShrink:0,zIndex:1,marginTop:2,background:e.active?T.black:T.white,border:`1px solid ${e.active?T.black:T.rule}`,display:"flex",alignItems:"center",justifyContent:"center"}}>{e.active&&<div style={{width:5,height:5,borderRadius:"50%",background:T.white}}/>}</div>
            <div style={{flex:1}}>
              <div style={{display:"flex",alignItems:"baseline",justifyContent:"space-between"}}><span style={{fontFamily:serif,fontSize:14,color:T.black}}>{e.frag}</span><span style={{fontFamily:sans,fontSize:10,color:T.mid}}>{e.date}</span></div>
              <p style={{fontFamily:sans,fontSize:11,color:T.mid,margin:"2px 0 3px"}}>{e.house}</p>
              {e.where&&<div style={{display:"flex",alignItems:"center",gap:4,margin:"0 0 5px"}}><Icon name="pin" size={11} color={T.faint}/><p style={{fontFamily:sans,fontSize:10,color:T.faint,margin:0}}>{e.where}</p></div>}
              <p style={{fontFamily:sans,fontSize:12,color:T.mid,lineHeight:1.65,fontStyle:"italic",margin:0}}>"{e.note}"</p>
            </div>
          </div>
        ))}
      </div>
      <button style={{width:"100%",padding:"13px 0",borderRadius:10,border:`1.5px dashed ${T.rule}`,background:"transparent",color:T.mid,fontSize:12,fontFamily:sans,cursor:"pointer"}}>+ Log a wear</button>
    </div>
  );
}

// ─── LAYERING — with open/closed lock SVG for public/private ─────────────────
function LayeringTab() {
  const [layers,setLayers]=useState([
    {id:1,name:"The Library",frags:["Oud Wood","Santal 33"],ratio:"60 / 40",layerWith:"fragrance",note:"Spray Oud Wood first, let it settle 2 min, then Santal 33. The papyrus locks with Santal's cedar perfectly.",date:"Nov 3, 2024",rating:5,isPublic:true},
    {id:2,name:"Winter Evening",frags:["Aventus","Black Orchid"],ratio:"70 / 30",layerWith:"fragrance",note:"Aventus base + a light mist of Black Orchid on the chest. The birch smoke lifts the orchid.",date:"Oct 28, 2024",rating:4,isPublic:false},
  ]);
  const [open,setOpen]=useState(false);
  const [name,setName]=useState("");const [f1,setF1]=useState("");const [f2,setF2]=useState("");
  const [ratio,setRatio]=useState("50 / 50");const [note,setNote]=useState("");
  const [layerWith,setLayerWith]=useState("fragrance");const [isPublic,setIsPublic]=useState(false);
  const inp={width:"100%",background:T.lift,border:`1px solid ${T.rule}`,borderRadius:8,padding:"9px 12px",fontSize:13,color:T.ink,outline:"none",fontFamily:sans,boxSizing:"border-box"};

  const BASE_LAYERS=[
    {id:"unscented_lotion",name:"Unscented Lotion",type:"lotion",iconName:"lotion"},
    {id:"body_oil",name:"Body Oil",type:"oil",iconName:"droplet"},
    {id:"scented_lotion",name:"Scented Lotion",type:"lotion",iconName:"lotion"},
  ];

  // Open lock SVG — public
  const OpenLockSVG = ({ size=14, color=T.mid }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
      {/* Shackle open on right side */}
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
      <div style={{borderBottom:`2px solid ${T.black}`,paddingBottom:14,marginBottom:22}}>
        <h2 style={{fontFamily:serif,fontSize:30,color:T.black,letterSpacing:-0.5,margin:0}}>Layering</h2>
        <p style={{fontFamily:sans,fontSize:13,color:T.mid,margin:"6px 0 0"}}>Track what works together — and why.</p>
      </div>
      <div style={{borderTop:`2px solid ${T.black}`,borderBottom:`1px solid ${T.rule}`,padding:"16px 0",marginBottom:24}}>
        <p style={{fontFamily:serif,fontSize:18,color:T.ink,margin:0,lineHeight:1.5,fontStyle:"italic"}}>"The most interesting thing in fragrance isn't a single bottle. It's two bottles, combined."</p>
      </div>
      {!open ? (
        <button onClick={()=>setOpen(true)} style={{width:"100%",padding:"13px 0",borderRadius:12,border:`1.5px dashed ${T.rule}`,background:"transparent",color:T.mid,fontSize:12,fontFamily:sans,cursor:"pointer",marginBottom:16}}>+ Log a layering combination</button>
      ) : (
        <div style={{background:T.lift,border:`1px solid ${T.rule}`,borderRadius:14,padding:16,marginBottom:16}}>
          <Lbl>Name</Lbl>
          <input value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Rainy Sunday" style={{...inp,marginBottom:12}}/>
          <Lbl>Layer with</Lbl>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,marginBottom:12}}>
            {[{key:"fragrance",label:"Fragrance",iconName:"spray"},{key:"lotion",label:"Lotion",iconName:"lotion"},{key:"oil",label:"Body Oil",iconName:"droplet"}].map(lt=>(
              <button key={lt.key} onClick={()=>setLayerWith(lt.key)} style={{padding:"8px 0",borderRadius:8,border:`1px solid ${layerWith===lt.key?T.black:T.rule}`,background:layerWith===lt.key?T.black:T.white,color:layerWith===lt.key?T.white:T.mid,cursor:"pointer",fontFamily:sans,fontSize:11,display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
                <Icon name={lt.iconName} size={16} color={layerWith===lt.key?T.white:T.mid}/><span>{lt.label}</span>
              </button>
            ))}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
            <div><Lbl>First fragrance</Lbl><select value={f1} onChange={e=>setF1(e.target.value)} style={{...inp,appearance:"none"}}><option value="">Select…</option>{FRAGRANCES.map(f=><option key={f.id} value={f.name}>{f.name}</option>)}</select></div>
            <div><Lbl>{layerWith==="fragrance"?"Second":"Base layer"}</Lbl>
              {layerWith==="fragrance" ? (
                <select value={f2} onChange={e=>setF2(e.target.value)} style={{...inp,appearance:"none"}}><option value="">Select…</option>{FRAGRANCES.map(f=><option key={f.id} value={f.name}>{f.name}</option>)}</select>
              ) : (
                <select value={f2} onChange={e=>setF2(e.target.value)} style={{...inp,appearance:"none"}}><option value="">Select…</option>{BASE_LAYERS.map(b=><option key={b.id} value={b.name}>{b.name}</option>)}</select>
              )}
            </div>
          </div>
          <div style={{marginBottom:12}}><Lbl>Ratio</Lbl><select value={ratio} onChange={e=>setRatio(e.target.value)} style={{...inp,appearance:"none"}}>{["50 / 50","60 / 40","70 / 30","80 / 20","30 / 70","40 / 60"].map(r=><option key={r}>{r}</option>)}</select></div>
          <div style={{marginBottom:12}}><Lbl>Notes</Lbl><textarea value={note} onChange={e=>setNote(e.target.value)} placeholder="How to apply, what it smells like…" rows={3} style={{...inp,resize:"vertical",lineHeight:1.6}}/></div>

          {/* Public/private toggle — with open/closed lock drawings */}
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14,padding:"10px 12px",background:T.white,borderRadius:8,border:`1px solid ${T.rule}`}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              {/* Lock drawing */}
              {isPublic ? <OpenLockSVG size={18} color={T.mid}/> : <ClosedLockSVG size={18} color={T.ink}/>}
              <div>
                <p style={{fontFamily:sans,fontSize:12,fontWeight:500,color:T.ink,margin:0}}>{isPublic?"Public":"Private"}</p>
                <p style={{fontFamily:sans,fontSize:11,color:T.mid,margin:"2px 0 0"}}>{isPublic?"Visible to the community":"Only you can see this"}</p>
              </div>
            </div>
            <button onClick={()=>setIsPublic(!isPublic)} style={{width:44,height:24,borderRadius:12,background:isPublic?T.black:T.press,border:"none",cursor:"pointer",position:"relative",transition:"background 0.2s"}}>
              <div style={{width:18,height:18,borderRadius:"50%",background:T.white,position:"absolute",top:3,left:isPublic?23:3,transition:"left 0.2s"}}/>
            </button>
          </div>

          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>setOpen(false)} style={{flex:1,padding:"10px 0",borderRadius:8,border:`1px solid ${T.rule}`,background:T.white,color:T.mid,fontSize:12,fontFamily:sans,cursor:"pointer"}}>Cancel</button>
            <button onClick={()=>{if(f1&&f2&&name){setLayers([{name,frags:[f1,f2],ratio,note,layerWith,isPublic,date:new Date().toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}),rating:4,id:Date.now()},...layers]);setOpen(false);setName("");setF1("");setF2("");setNote("");}}} style={{flex:2,padding:"10px 0",borderRadius:8,border:"none",background:T.black,color:T.white,fontSize:12,fontFamily:sans,cursor:"pointer"}}>Save combination</button>
          </div>
        </div>
      )}

      {layers.map(l=>(
        <div key={l.id} style={{background:T.white,border:`1px solid ${T.rule}`,borderRadius:14,padding:16,marginBottom:10}}>
          <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:10}}>
            <div><p style={{fontFamily:serif,fontSize:16,color:T.ink,margin:0}}>{l.name}</p><p style={{fontFamily:sans,fontSize:11,color:T.mid,margin:"3px 0 0"}}>{l.date}</p></div>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              {/* Public/private with lock drawing */}
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
                      <div style={{width:36,height:44,borderRadius:8,background:`linear-gradient(160deg,${T.lift},${T.press})`,border:`1px solid ${T.rule}`,display:"flex",alignItems:"center",justifyContent:"center"}}>
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
            <span style={{fontFamily:sans,fontSize:10,color:T.mid,marginLeft:"auto"}}>{l.ratio}</span>
          </div>
          <p style={{fontFamily:sans,fontSize:12,color:T.mid,lineHeight:1.65,fontStyle:"italic",margin:0}}>"{l.note}"</p>
        </div>
      ))}
    </div>
  );
}

// ─── FRAGRANCE EXPOS DATA ─────────────────────────────────────────────────────
const FRAGRANCE_EXPOS = [
  { name:"Esxence", city:"Milan, Italy", month:"March", description:"The world's premier niche fragrance fair. Over 300 exhibitors from 40+ countries presenting artistic perfumery." },
  { name:"Fragrance Foundation Awards", city:"New York, USA", month:"June", description:"The fragrance industry's most prestigious awards — the 'Oscars' of perfumery." },
  { name:"World Perfumery Congress", city:"Rotating cities", month:"June", description:"Biennial gathering of the fragrance industry's scientists, perfumers, and technologists." },
  { name:"Beautyworld Middle East", city:"Dubai, UAE", month:"May", description:"Largest beauty trade fair in the Middle East — major fragrance component." },
  { name:"Luxe Pack Monaco", city:"Monte Carlo, Monaco", month:"October", description:"High-end packaging and luxury goods fair with significant fragrance presence." },
  { name:"ScentXplore", city:"Rotating cities", month:"Varies", description:"Community-driven fragrance discovery event. More accessible than trade fairs, focused on enthusiasts." },
  { name:"The Scent Event", city:"Various European cities", month:"Varies", description:"Boutique fragrance events connecting niche houses directly with consumers." },
  { name:"Sniffapalooza", city:"New York, USA", month:"April / Fall", description:"Legendary enthusiast-led fragrance tours through department stores and boutiques in NYC." },
  { name:"Pitti Fragranze", city:"Florence, Italy", month:"September", description:"Elegant sister event to Esxence — focused on artistic perfumery against Florence's backdrop." },
  { name:"Beautyworld Japan", city:"Tokyo, Japan", month:"May", description:"Asia's largest beauty and fragrance industry expo with strong niche presence." },
];

// ─── LEARN ────────────────────────────────────────────────────────────────────
function LearnTab() {
  const [openTerm,setOpenTerm]=useState(null);
  const [openExpo,setOpenExpo]=useState(null);
  return (
    <div>
      <div style={{borderBottom:`2px solid ${T.black}`,paddingBottom:14,marginBottom:22}}>
        <p style={{fontFamily:sans,fontSize:9,textTransform:"uppercase",letterSpacing:"0.18em",color:T.mid,margin:"0 0 4px"}}>Education</p>
        <h2 style={{fontFamily:serif,fontSize:30,color:T.black,letterSpacing:-0.5,margin:0}}>Learn</h2>
        <p style={{fontFamily:sans,fontSize:13,color:T.mid,margin:"6px 0 0"}}>From beginner to connoisseur — at your pace.</p>
      </div>
      <div style={{border:`1px solid ${T.black}`,borderRadius:16,padding:22,marginBottom:24,position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",right:-8,top:-18,fontFamily:serif,fontSize:120,color:T.lift,lineHeight:1,userSelect:"none"}}>S</div>
        <Lbl>Term of the Day</Lbl>
        <h3 style={{fontFamily:serif,fontSize:32,color:T.black,margin:"0 0 10px",fontWeight:"normal"}}>Sillage</h3>
        <p style={{fontFamily:sans,fontSize:13,color:T.mid,lineHeight:1.7,margin:"0 0 14px"}}>The invisible trail a fragrance leaves in the air behind you — from the French word for "wake." High sillage announces your presence before you enter the room.</p>
        <p style={{fontFamily:sans,fontSize:10,color:T.mid,margin:0}}>Found in → <span style={{color:T.black,cursor:"pointer"}}>Aventus</span>, <span style={{color:T.black,cursor:"pointer"}}>Black Orchid</span></p>
      </div>
      <Lbl>Note Encyclopedia</Lbl>
      <p style={{fontFamily:sans,fontSize:12,color:T.mid,lineHeight:1.6,margin:"0 0 14px"}}>Learn to identify every ingredient by sight.</p>
      <div style={{display:"flex",flexWrap:"wrap",gap:10,marginBottom:24}}>
        {["Rose","Jasmine","Saffron","Oud","Vanilla","Amber","Bergamot","Patchouli","Vetiver","Incense","Musk","Cardamom"].map(n=><NoteIllustration key={n} name={n} size={72}/>)}
      </div>
      <Lbl>Glossary</Lbl>
      <div style={{background:T.white,border:`1px solid ${T.rule}`,borderRadius:14,overflow:"hidden",marginBottom:24}}>
        {GLOSSARY.map((g,i)=>(
          <div key={g.term} style={{borderBottom:i<GLOSSARY.length-1?`1px solid ${T.lift}`:"none"}}>
            <button onClick={()=>setOpenTerm(openTerm===g.term?null:g.term)} style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 16px",background:"none",border:"none",cursor:"pointer"}}>
              <span style={{fontFamily:sans,fontSize:13,fontWeight:500,color:T.ink}}>{g.term}</span>
              <span style={{fontSize:11,color:T.faint,display:"inline-block",transition:"transform 0.2s",transform:openTerm===g.term?"rotate(180deg)":"none"}}>▾</span>
            </button>
            {openTerm===g.term&&<p style={{fontFamily:sans,fontSize:13,color:T.mid,lineHeight:1.65,padding:"0 16px 14px",margin:0}}>{g.def}</p>}
          </div>
        ))}
      </div>
      <Lbl>Learning Paths</Lbl>
      {[{icon:"△",name:"The Fragrance Pyramid",sub:"How scents evolve on skin over time",progress:0},{icon:"◈",name:"The 7 Fragrance Families",sub:"From florals to orientals — the full map",progress:33},{icon:"◇",name:"Niche vs. Designer",sub:"What separates a $50 from a $500 bottle",progress:0},{icon:"◎",name:"The Art of Sampling",sub:"How to get the most from a 2ml vial",progress:0}].map(p=>(
        <div key={p.name} style={{background:T.white,border:`1px solid ${T.rule}`,borderRadius:12,padding:14,display:"flex",alignItems:"center",gap:12,cursor:"pointer",marginBottom:8}}>
          <div style={{width:40,height:40,borderRadius:10,background:T.lift,border:`1px solid ${T.rule}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,color:T.mid,flexShrink:0}}>{p.icon}</div>
          <div style={{flex:1}}><p style={{fontFamily:sans,fontSize:13,fontWeight:500,color:T.ink,margin:0}}>{p.name}</p><p style={{fontFamily:sans,fontSize:11,color:T.mid,margin:"2px 0 0"}}>{p.sub}</p>{p.progress>0&&<div style={{marginTop:8,height:2,background:T.press,borderRadius:2,overflow:"hidden"}}><div style={{height:"100%",width:`${p.progress}%`,background:T.black,borderRadius:2}}/></div>}</div>
          <span style={{fontFamily:sans,fontSize:11,color:T.mid}}>{p.progress>0?`${p.progress}%`:"Start →"}</span>
        </div>
      ))}
      <div style={{borderTop:`2px solid ${T.black}`,marginTop:28,paddingTop:22}}>
        <Lbl>Fragrance Expos & Events</Lbl>
        <p style={{fontFamily:sans,fontSize:13,color:T.mid,lineHeight:1.65,margin:"0 0 18px"}}>Every major fragrance exhibition worldwide — from trade fairs to community events.</p>
        <div style={{background:T.white,border:`1px solid ${T.rule}`,borderRadius:14,overflow:"hidden"}}>
          {FRAGRANCE_EXPOS.map((expo,i)=>(
            <div key={expo.name} style={{borderBottom:i<FRAGRANCE_EXPOS.length-1?`1px solid ${T.lift}`:"none"}}>
              <button onClick={()=>setOpenExpo(openExpo===expo.name?null:expo.name)} style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 16px",background:"none",border:"none",cursor:"pointer",textAlign:"left"}}>
                <div style={{flex:1}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <span style={{fontFamily:serif,fontSize:14,color:T.ink}}>{expo.name}</span>
                    <span style={{fontFamily:sans,fontSize:9,padding:"2px 7px",borderRadius:10,background:T.lift,color:T.mid,border:`1px solid ${T.rule}`}}>{expo.month}</span>
                  </div>
                  <p style={{fontFamily:sans,fontSize:11,color:T.mid,margin:"2px 0 0"}}>{expo.city}</p>
                </div>
                <span style={{fontSize:11,color:T.faint,display:"inline-block",transition:"transform 0.2s",transform:openExpo===expo.name?"rotate(180deg)":"none",flexShrink:0,marginLeft:8}}>▾</span>
              </button>
              {openExpo===expo.name&&(
                <div style={{padding:"0 16px 14px"}}>
                  <p style={{fontFamily:sans,fontSize:13,color:T.mid,lineHeight:1.65,margin:0}}>{expo.description}</p>
                </div>
              )}
            </div>
          ))}
        </div>
        <p style={{fontFamily:sans,fontSize:10,color:T.faint,margin:"12px 0 0",lineHeight:1.5}}>Dates vary year to year. Always check official websites for current scheduling.</p>
      </div>
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function SillageApp() {
  const [activeTab,setActiveTab]=useState("Discover");
  const [modalFragId,setModalFragId]=useState(null);
  const [showSuggest,setShowSuggest]=useState(false);
  const [userStatuses,setUserStatuses]=useState({1:"bottle_owned",2:"sample_wishlist",3:"sample_have",4:"tried_skin",5:"smelled",6:"bottle_wishlist"});
  const [privateNotes,setPrivateNotes]=useState({});
  const [reactions,setReactions]=useState({1:"love",3:"like"});

  const NAV=[{tab:"Discover",icon:"◈"},{tab:"Collection",icon:"◇"},{tab:"Layering",icon:"◎"},{tab:"Journal",icon:"▣"},{tab:"Learn",icon:"△"}];
  const modalFrag=FRAGRANCES.find(f=>f.id===modalFragId);
  function openFrag(id){setModalFragId(id);}
  function onReaction(fragId,val){setReactions(p=>({...p,[fragId]:val}));}

  return (
    <div style={{minHeight:"100vh",background:T.bg,fontFamily:sans}}>
      <div style={{maxWidth:460,margin:"0 auto",position:"relative"}}>
        <div style={{position:"sticky",top:0,zIndex:40,background:"rgba(248,248,246,0.97)",backdropFilter:"blur(14px)",borderBottom:`1px solid ${T.rule}`,padding:"0 20px"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",paddingTop:14}}>
            <div>
              <h1 style={{fontFamily:serif,fontSize:21,letterSpacing:-0.5,color:T.black,margin:0}}>sillage<span style={{color:T.mid}}>.</span></h1>
              <p style={{fontFamily:sans,fontSize:8,color:T.faint,textTransform:"uppercase",letterSpacing:"0.14em",margin:"2px 0 0"}}>Fragrance Journal</p>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <button onClick={()=>setShowSuggest(true)} style={{fontFamily:sans,fontSize:10,padding:"6px 12px",borderRadius:20,border:`1px solid ${T.rule}`,background:T.white,color:T.mid,cursor:"pointer",whiteSpace:"nowrap"}}>+ Suggest</button>
              <div style={{width:30,height:30,borderRadius:"50%",background:T.black,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:600,color:T.white,fontFamily:sans}}>JW</div>
            </div>
          </div>
          <div style={{display:"flex",marginTop:12,overflowX:"auto"}}>
            {NAV.map(({tab})=>(
              <button key={tab} onClick={()=>setActiveTab(tab)} style={{marginRight:16,paddingBottom:11,fontSize:10,textTransform:"uppercase",letterSpacing:"0.08em",color:activeTab===tab?T.black:T.faint,background:"none",border:"none",borderBottom:activeTab===tab?`2px solid ${T.black}`:"2px solid transparent",marginBottom:-1,cursor:"pointer",whiteSpace:"nowrap",fontFamily:sans}}>{tab}</button>
            ))}
          </div>
        </div>

        <div style={{padding:"28px 20px 130px"}}>
          {activeTab==="Discover"   &&<DiscoverTab   onOpenFrag={openFrag} userStatuses={userStatuses} reactions={reactions} onReaction={onReaction} onSuggest={()=>setShowSuggest(true)}/>}
          {activeTab==="Collection" &&<CollectionTab onOpenFrag={openFrag} statuses={userStatuses} reactions={reactions} onReaction={onReaction} onSuggest={()=>setShowSuggest(true)}/>}
          {activeTab==="Layering"   &&<LayeringTab/>}
          {activeTab==="Journal"    &&<JournalTab/>}
          {activeTab==="Learn"      &&<LearnTab/>}
        </div>

        <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:460,background:"rgba(248,248,246,0.97)",backdropFilter:"blur(12px)",borderTop:`1px solid ${T.rule}`,display:"flex"}}>
          {NAV.map(({tab,icon})=>(
            <button key={tab} onClick={()=>setActiveTab(tab)} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3,padding:"11px 0 15px",background:"none",border:"none",cursor:"pointer"}}>
              <span style={{fontSize:15,color:activeTab===tab?T.black:T.faint}}>{icon}</span>
              <span style={{fontFamily:sans,fontSize:8,textTransform:"uppercase",letterSpacing:"0.07em",color:activeTab===tab?T.black:T.faint}}>{tab}</span>
            </button>
          ))}
        </div>
      </div>

      {modalFrag&&(
        <DetailModal
          frag={modalFrag}
          onClose={()=>setModalFragId(null)}
          userStatus={userStatuses[modalFrag.id]}
          setUserStatus={s=>setUserStatuses(p=>({...p,[modalFrag.id]:s}))}
          privateNote={privateNotes[modalFrag.id]}
          setPrivateNote={n=>setPrivateNotes(p=>({...p,[modalFrag.id]:n}))}
          reaction={reactions[modalFrag.id]}
          setReaction={v=>onReaction(modalFrag.id,v)}
          onOpenFrag={openFrag}
        />
      )}
      {showSuggest&&<SuggestModal onClose={()=>setShowSuggest(false)}/>}
    </div>
  );
}
