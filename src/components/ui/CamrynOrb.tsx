interface CamrynOrbProps {
  size?: number;
  className?: string;
  as?: 'div' | 'button';
  onClick?: () => void;
}

/*
 * Hyperrealistic glass ball rendered entirely in SVG.
 *
 * Physics modelled:
 *  - Fresnel rim: dark annular band, thickest at the equator silhouette
 *  - Transmitted-light body fill: lensed cool-grey, brightest near centre
 *  - Primary softbox specular: hard-edged rectangular white patch, upper-left
 *  - Secondary fill-bounce specular: soft, lower-right
 *  - Pinpoint mirror specular: pure white, sub-pixel, top of primary
 *  - Subsurface forward scatter: diffuse bright column, centre-upper interior
 *  - Chromatic dispersion band: blue/teal gradient, lower-interior
 *  - Caustic convergence arc: thin bright arc just above dispersion zone
 *  - Absorption lens: deep dark zone at bottom pole
 *  - Drop shadow: elliptical, offset below, desaturated
 *  - Slow float + shadow breathe animation via CSS
 */
export default function CamrynOrb({ size = 36, className = '', as: Tag = 'div', onClick }: CamrynOrbProps) {
  const s = size;
  // All coordinates are in a 100×100 viewBox; rendered at `size` px
  const vb = 100;
  const cr = 46;   // sphere circle radius in viewBox units
  const cx = 50;
  const cy = 48;

  const uid = 'orb'; // stable — only one orb instance per page

  return (
    <Tag
      className={`camryn-orb ${className}`}
      style={{ '--camryn-orb-size': `${s}px`, width: s, height: s + 8, display: 'block', flexShrink: 0 } as React.CSSProperties}
      onClick={onClick}
      aria-hidden="true"
    >
      <svg
        width={s}
        height={s + 8}
        viewBox={`0 0 ${vb} ${vb + 8}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="camryn-orb-svg"
        style={{ display: 'block', overflow: 'visible' }}
      >
        <defs>
          {/* ── Clip: sphere boundary ── */}
          <clipPath id={`${uid}-clip`}>
            <circle cx={cx} cy={cy} r={cr} />
          </clipPath>

          {/* ── Body fill radial gradient ── */}
          {/* Cool near-white grey base; edges slightly darker (rim handled by border) */}
          <radialGradient id={`${uid}-body`} cx="50%" cy="44%" r="58%" gradientUnits="objectBoundingBox">
            <stop offset="0%"   stopColor="#eaecf1" />
            <stop offset="30%"  stopColor="#e0e4ec" />
            <stop offset="58%"  stopColor="#d0d5e1" />
            <stop offset="78%"  stopColor="#bdc4d4" />
            <stop offset="90%"  stopColor="#d0d5e2" />
            <stop offset="100%" stopColor="#dde0e8" />
          </radialGradient>

          {/* ── Upper brightening — studio ceiling bounce ── */}
          <radialGradient id={`${uid}-upper`} cx="44%" cy="30%" r="48%" gradientUnits="objectBoundingBox">
            <stop offset="0%"  stopColor="#ffffff" stopOpacity="0.18" />
            <stop offset="50%" stopColor="#f4f7ff" stopOpacity="0.07" />
            <stop offset="100%" stopColor="white"  stopOpacity="0" />
          </radialGradient>

          {/* ── Fresnel rim: inset radial darkening ── */}
          {/* Paints a dark band around the perimeter by being transparent in the centre */}
          <radialGradient id={`${uid}-rim`} cx="50%" cy="50%" r="50%" gradientUnits="objectBoundingBox">
            <stop offset="0%"   stopColor="transparent" />
            <stop offset="72%"  stopColor="transparent" />
            <stop offset="84%"  stopColor="#1c2030" stopOpacity="0.18" />
            <stop offset="92%"  stopColor="#0e1220" stopOpacity="0.52" />
            <stop offset="97%"  stopColor="#06080f" stopOpacity="0.78" />
            <stop offset="100%" stopColor="#020308" stopOpacity="0.92" />
          </radialGradient>

          {/* ── Primary specular: softbox ── */}
          <radialGradient id={`${uid}-spec-a`} cx="32%" cy="26%" r="50%" gradientUnits="objectBoundingBox">
            <stop offset="0%"   stopColor="#ffffff" stopOpacity="1.0" />
            <stop offset="10%"  stopColor="#ffffff" stopOpacity="0.96" />
            <stop offset="28%"  stopColor="#ffffff" stopOpacity="0.74" />
            <stop offset="55%"  stopColor="#ffffff" stopOpacity="0.28" />
            <stop offset="80%"  stopColor="#ffffff" stopOpacity="0.05" />
            <stop offset="100%" stopColor="white"   stopOpacity="0" />
          </radialGradient>

          {/* ── Secondary specular: fill bounce lower-right ── */}
          <radialGradient id={`${uid}-spec-b`} cx="50%" cy="50%" r="50%" gradientUnits="objectBoundingBox">
            <stop offset="0%"   stopColor="#ffffff" stopOpacity="0.52" />
            <stop offset="45%"  stopColor="#edf0fa" stopOpacity="0.18" />
            <stop offset="100%" stopColor="white"   stopOpacity="0" />
          </radialGradient>

          {/* ── Subsurface forward scatter (centre column) ── */}
          <radialGradient id={`${uid}-sss`} cx="50%" cy="40%" r="45%" gradientUnits="objectBoundingBox">
            <stop offset="0%"   stopColor="#ffffff" stopOpacity="0.22" />
            <stop offset="48%"  stopColor="#e8eef8" stopOpacity="0.08" />
            <stop offset="100%" stopColor="white"   stopOpacity="0" />
          </radialGradient>

          {/* ── Chromatic dispersion: blue-teal band, bottom interior ── */}
          <linearGradient id={`${uid}-chroma`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%"   stopColor="#7894be" stopOpacity="0" />
            <stop offset="20%"  stopColor="#7090bc" stopOpacity="0.14" />
            <stop offset="45%"  stopColor="#5070ac" stopOpacity="0.32" />
            <stop offset="65%"  stopColor="#3858a0" stopOpacity="0.28" />
            <stop offset="85%"  stopColor="#203880" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#102060" stopOpacity="0.08" />
          </linearGradient>

          {/* ── Caustic arc radial: thin bright ring ── */}
          <radialGradient id={`${uid}-caustic`} cx="50%" cy="50%" r="50%" gradientUnits="objectBoundingBox">
            <stop offset="0%"   stopColor="#d8e4f8" stopOpacity="0.36" />
            <stop offset="55%"  stopColor="#c4d8f4" stopOpacity="0.14" />
            <stop offset="100%" stopColor="white"   stopOpacity="0" />
          </radialGradient>

          {/* ── Bottom absorption lens ── */}
          <radialGradient id={`${uid}-lens`} cx="50%" cy="78%" r="55%" gradientUnits="objectBoundingBox">
            <stop offset="0%"   stopColor="#04060c" stopOpacity="0.62" />
            <stop offset="32%"  stopColor="#0c1020" stopOpacity="0.36" />
            <stop offset="62%"  stopColor="#1a2038" stopOpacity="0.14" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>

          {/* ── Drop shadow filter ── */}
          <filter id={`${uid}-shadow`} x="-30%" y="0%" width="160%" height="200%">
            <feGaussianBlur stdDeviation="3.5" />
          </filter>

          {/* ── Specular blur filters ── */}
          <filter id={`${uid}-blur-spec`} x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation="0.5" />
          </filter>
          <filter id={`${uid}-blur-soft`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.0" />
          </filter>
          <filter id={`${uid}-blur-sss`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.8" />
          </filter>
          <filter id={`${uid}-blur-chroma`} x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation="0.7" />
          </filter>
          <filter id={`${uid}-blur-caustic`} x="-15%" y="-30%" width="130%" height="160%">
            <feGaussianBlur stdDeviation="1.2" />
          </filter>
          <filter id={`${uid}-blur-rim`} x="-5%" y="-5%" width="110%" height="110%">
            <feGaussianBlur stdDeviation="0.3" />
          </filter>
        </defs>

        {/* ── 1. Drop shadow (ellipse below sphere) ── */}
        <ellipse
          cx={cx}
          cy={cy + cr + 4}
          rx={cr * 0.70}
          ry={7}
          fill="rgba(50,58,80,0.22)"
          filter={`url(#${uid}-shadow)`}
          className="camryn-orb-shadow-el"
        />

        {/* ── 2. Sphere group (everything clipped to circle) ── */}
        <g clipPath={`url(#${uid}-clip)`} className="camryn-orb-sphere">

          {/* 2a. Body fill — lensed grey base */}
          <circle cx={cx} cy={cy} r={cr} fill={`url(#${uid}-body)`} />

          {/* 2b. Upper brightening */}
          <ellipse
            cx={cx - 2} cy={cy - 12}
            rx={cr * 0.80} ry={cr * 0.62}
            fill={`url(#${uid}-upper)`}
          />

          {/* 2c. Subsurface forward scatter — column of light through the centre */}
          <ellipse
            cx={cx} cy={cy - 5}
            rx={cr * 0.52} ry={cr * 0.50}
            fill={`url(#${uid}-sss)`}
            filter={`url(#${uid}-blur-sss)`}
          />

          {/* 2d. Chromatic dispersion band — lower interior */}
          <rect
            x={cx - cr * 0.72}
            y={cy + cr * 0.26}
            width={cr * 1.44}
            height={cr * 0.52}
            rx={cr * 0.12}
            fill={`url(#${uid}-chroma)`}
            filter={`url(#${uid}-blur-chroma)`}
          />

          {/* 2e. Caustic convergence arc */}
          <ellipse
            cx={cx} cy={cy + cr * 0.35}
            rx={cr * 0.60} ry={cr * 0.10}
            fill={`url(#${uid}-caustic)`}
            filter={`url(#${uid}-blur-caustic)`}
          />

          {/* 2f. Bottom absorption lens */}
          <ellipse
            cx={cx} cy={cy + cr * 0.72}
            rx={cr * 0.76} ry={cr * 0.46}
            fill={`url(#${uid}-lens)`}
          />

          {/* 2g. Primary specular — softbox reflection (upper-left, hard edge) */}
          <ellipse
            cx={cx - cr * 0.16}
            cy={cy - cr * 0.54}
            rx={cr * 0.34}
            ry={cr * 0.25}
            fill={`url(#${uid}-spec-a)`}
            filter={`url(#${uid}-blur-spec)`}
          />

          {/* 2h. Secondary specular — fill bounce (lower-right, soft) */}
          <ellipse
            cx={cx + cr * 0.32}
            cy={cy + cr * 0.10}
            rx={cr * 0.22}
            ry={cr * 0.16}
            fill={`url(#${uid}-spec-b)`}
            filter={`url(#${uid}-blur-soft)`}
          />

          {/* 2i. Fresnel rim darkening — covers the entire disc, transparent in centre */}
          <circle
            cx={cx} cy={cy} r={cr}
            fill={`url(#${uid}-rim)`}
            filter={`url(#${uid}-blur-rim)`}
          />

          {/* 2j. Top inner edge highlight — thin white arc at the very top, inside the rim */}
          <ellipse
            cx={cx - 1} cy={cy - cr * 0.86}
            rx={cr * 0.30} ry={cr * 0.055}
            fill="rgba(255,255,255,0.82)"
          />
        </g>

        {/* ── 3. Specular pinpoint — pure mirror reflection of light source centre ── */}
        {/* Sits outside clipPath so it doesn't blur against the clip edge */}
        <ellipse
          cx={cx - cr * 0.24}
          cy={cy - cr * 0.62}
          rx={cr * 0.040}
          ry={cr * 0.028}
          fill="rgba(255,255,255,0.98)"
          className="camryn-orb-pinpoint"
        />

        {/* ── 4. Outer rim stroke — sharpens the glass-edge silhouette ── */}
        <circle
          cx={cx} cy={cy} r={cr - 0.3}
          fill="none"
          stroke="rgba(8,10,18,0.38)"
          strokeWidth="0.8"
        />

      </svg>
    </Tag>
  );
}
