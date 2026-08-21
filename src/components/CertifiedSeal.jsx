function starPoints(cx, cy, rOuter, rInner, spikes) {
  let pts = ''
  const step = Math.PI / spikes
  for (let i = 0; i < spikes * 2; i++) {
    const r = i % 2 === 0 ? rOuter : rInner
    const a = i * step - Math.PI / 2
    pts += `${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)} `
  }
  return pts.trim()
}
function tinyStar(cx, cy, r) {
  let d = ''
  for (let i = 0; i < 10; i++) {
    const rad = i % 2 === 0 ? r : r * 0.42
    const a = (i * Math.PI) / 5 - Math.PI / 2
    const x = cx + rad * Math.cos(a)
    const y = cy + rad * Math.sin(a)
    d += (i === 0 ? 'M' : 'L') + x.toFixed(2) + ',' + y.toFixed(2) + ' '
  }
  return d + 'Z'
}
function snookIcon(cx, cy, scale) {
  return `
  <g transform="translate(${cx},${cy}) scale(${scale})">
    <path d="M -40,2 L -34,-3 C -30,-9 -23,-12 -13,-13 C -3,-14 6,-13 14,-11 C 20,-9.5 25,-8 29,-6.5 L 29,6.5 C 25,8 20,9.5 14,11 C 6,13 -3,14 -13,13 C -23,12 -30,9 -34,3 L -40,2 Z"
          fill="none" stroke="#FFC93C" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round"/>
    <path d="M -11,-13 L -9,-22 L -6,-14 L -3,-23 L 0,-14 L 3,-22 L 6,-13" fill="none" stroke="#FFC93C" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/>
    <path d="M 15,-11 L 19,-17 L 22,-10 Z" fill="#FFC93C" opacity="0.9"/>
    <path d="M 13,11 L 17,17 L 20,10 Z" fill="#FFC93C" opacity="0.9"/>
    <path d="M -14,5 C -18,10 -20,14 -19,18 C -14,15 -10,11 -8,7 Z" fill="#FFC93C" opacity="0.85"/>
    <path d="M 29,-6.5 L 43,-16 L 35,-2.5 Z" fill="none" stroke="#FFC93C" stroke-width="2.4" stroke-linejoin="round"/>
    <path d="M 29,6.5 L 43,16 L 35,2.5 Z" fill="none" stroke="#FFC93C" stroke-width="2.4" stroke-linejoin="round"/>
    <line x1="-20" y1="0" x2="28" y2="0" stroke="#FFC93C" stroke-width="1.5"/>
    <circle cx="-27" cy="-4" r="2.6" fill="none" stroke="#FFC93C" stroke-width="1.4"/>
    <circle cx="-27" cy="-4" r="0.9" fill="#FFC93C"/>
    <path d="M -21,-8 C -19,-3 -19,3 -21,8" fill="none" stroke="#FFC93C" stroke-width="1.2" opacity="0.8"/>
  </g>`
}
function checkIcon(cx, cy) {
  return `<path d="M ${cx - 14},${cy} L ${cx - 6},${cy + 8} L ${cx + 16},${cy - 14}" fill="none" stroke="#FFC93C" stroke-width="4.2" stroke-linecap="round" stroke-linejoin="round"/>`
}

// Reusable gold "CERTIFIED SNOOK" seal. Pass a unique `uid` per instance
// on a page (gradient/arc-path ids must be unique in the DOM).
export default function CertifiedSeal({ size = 40, uid = 'seal' }) {
  const cx = 60, cy = 60
  const outerPts = starPoints(cx, cy, 58, 49, 26)
  const innerR = 40, textR1 = 45, textR2 = 44

  const svg = `
  <svg width="${size}" height="${size}" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="goldGrad${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FFE58A"/><stop offset="45%" stop-color="#FFC93C"/><stop offset="100%" stop-color="#D98A00"/>
      </linearGradient>
      <path id="topArc${uid}" d="M ${cx - textR1},${cy} A ${textR1},${textR1} 0 1 1 ${cx + textR1},${cy}"/>
      <path id="botArc${uid}" d="M ${cx - textR2},${cy} A ${textR2},${textR2} 0 1 0 ${cx + textR2},${cy}"/>
    </defs>
    <polygon points="${outerPts}" fill="url(#goldGrad${uid})" stroke="#1B1B1B" stroke-width="3" stroke-linejoin="round"/>
    <circle cx="${cx}" cy="${cy}" r="${innerR}" fill="#1B1B1B" stroke="#1B1B1B" stroke-width="2"/>
    <circle cx="${cx}" cy="${cy}" r="${innerR}" fill="none" stroke="#FFC93C" stroke-width="1.5" opacity="0.6"/>
    <g fill="#FFC93C" opacity="0.9">
      <ellipse cx="26" cy="78" rx="4" ry="2.2" transform="rotate(35 26 78)"/><ellipse cx="31" cy="83" rx="4" ry="2.2" transform="rotate(20 31 83)"/>
      <ellipse cx="37" cy="87" rx="4" ry="2.2" transform="rotate(5 37 87)"/><ellipse cx="94" cy="78" rx="4" ry="2.2" transform="rotate(-35 94 78)"/>
      <ellipse cx="89" cy="83" rx="4" ry="2.2" transform="rotate(-20 89 83)"/><ellipse cx="83" cy="87" rx="4" ry="2.2" transform="rotate(-5 83 87)"/>
    </g>
    <path d="${tinyStar(18, 60, 4)}" fill="#FFC93C"/><path d="${tinyStar(102, 60, 4)}" fill="#FFC93C"/>
    <text x="${cx}" y="34" text-anchor="middle" font-family="Baloo 2, sans-serif" font-weight="800" font-size="12" letter-spacing="1.2" fill="#FFC93C">CERTIFIED</text>
    ${snookIcon(60, 57, 0.72)}
    ${checkIcon(60, 85)}
    <text font-family="Baloo 2, sans-serif" font-weight="800" font-size="9.2" letter-spacing="0.5" fill="#FFC93C">
      <textPath href="#topArc${uid}" startOffset="50%" text-anchor="middle">CERTIFIED SNOOK</textPath>
    </text>
    <text font-family="Baloo 2, sans-serif" font-weight="800" font-size="8.6" letter-spacing="0.5" fill="#FFC93C">
      <textPath href="#botArc${uid}" startOffset="50%" text-anchor="middle">VERIFIED ON THE BOARD</textPath>
    </text>
  </svg>`

  return <span className="seal-icon" dangerouslySetInnerHTML={{ __html: svg }} />
}
