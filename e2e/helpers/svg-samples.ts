export const SIMPLE_CIRCLE = `<svg viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg">
  <circle id="main-circle" cx="400" cy="300" r="100" fill="red"/>
</svg>`;

export const TWO_RECTS = `<svg viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg">
  <rect id="rect-left" x="100" y="200" width="200" height="150" fill="blue"/>
  <rect id="rect-right" x="500" y="200" width="200" height="150" fill="green"/>
</svg>`;

export const COMPLEX_SCENE = `<svg viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg">
  <rect id="background" x="0" y="0" width="800" height="600" fill="#f0f0f0"/>
  <circle id="sun" cx="650" cy="100" r="60" fill="gold"/>
  <rect id="house-body" x="250" y="300" width="300" height="250" fill="brown"/>
  <polygon id="roof" points="250,300 400,150 550,300" fill="darkred"/>
  <rect id="door" x="370" y="400" width="60" height="150" fill="darkbrown"/>
  <circle id="eye-left" cx="330" cy="370" r="15" fill="white"/>
  <circle id="eye-right" cx="470" cy="370" r="15" fill="white"/>
</svg>`;

export const LAYERED_SCENE = `<svg viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="sky-gradient">
      <stop offset="0%" stop-color="#87CEEB"/>
      <stop offset="100%" stop-color="#4682B4"/>
    </linearGradient>
  </defs>
  <g id="layer-bg" data-name="背景">
    <rect width="800" height="600" fill="url(#sky-gradient)"/>
  </g>
  <g id="layer-mountains" data-name="山脉">
    <g id="layer-mountain-left" data-name="左侧山">
      <polygon points="0,600 200,200 400,600" fill="#2d5016"/>
    </g>
    <g id="layer-mountain-right" data-name="右侧山">
      <polygon points="300,600 500,150 700,600" fill="#1a3a0a"/>
    </g>
  </g>
  <g id="layer-sun" data-name="太阳">
    <circle cx="650" cy="100" r="60" fill="#FFD700"/>
  </g>
</svg>`;
