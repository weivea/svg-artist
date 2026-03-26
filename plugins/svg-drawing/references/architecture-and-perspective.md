# Architecture & Perspective

Practical reference for constructing buildings, interiors, streets, and perspective systems in SVG.

---

## 1. Perspective Systems

### 1.1 One-Point Perspective

A single vanishing point (VP) sits on the horizon line. All receding lines converge to that point.
Front-facing planes are parallel to the picture plane and show no distortion.

**Best for:** corridors, roads, railroad tracks, looking straight down a street.

**Core formula:**
```
x_at_depth = front_x + (vpx - front_x) * t
y_at_depth = front_y + (vpy - front_y) * t
```
Where `t` is the depth ratio: 0 = front plane, 1 = vanishing point.

**Construction steps:**
1. Place VP at center of horizon: `(vpx, vpy)`
2. Define front rectangle corners
3. Draw converging lines from each corner to VP
4. Clip at desired depth `t` to form the receding planes

```svg
<!-- One-Point Perspective: Corridor / Hallway -->
<svg viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg">
  <!-- VP at (400, 280) on horizon -->
  <rect x="280" y="200" width="240" height="180" fill="#E8D5B7"/>
  <!-- Floor converging to VP -->
  <polygon points="0,600 800,600 520,380 280,380" fill="#8B7355"/>
  <line x1="0" y1="600" x2="400" y2="280" stroke="#6B5B45" stroke-width="0.5" opacity="0.3"/>
  <line x1="800" y1="600" x2="400" y2="280" stroke="#6B5B45" stroke-width="0.5" opacity="0.3"/>
  <!-- Ceiling -->
  <polygon points="0,0 800,0 520,200 280,200" fill="#F5F0E8"/>
  <!-- Left wall -->
  <polygon points="0,0 280,200 280,380 0,600" fill="#D4C4A8"/>
  <!-- Right wall -->
  <polygon points="800,0 520,200 520,380 800,600" fill="#C9B896"/>
  <!-- Floor tile lines -->
  <line x1="200" y1="600" x2="340" y2="380" stroke="#6B5B45" stroke-width="1" opacity="0.4"/>
  <line x1="400" y1="600" x2="400" y2="380" stroke="#6B5B45" stroke-width="1" opacity="0.4"/>
  <line x1="600" y1="600" x2="460" y2="380" stroke="#6B5B45" stroke-width="1" opacity="0.4"/>
  <!-- Door at end of hallway -->
  <rect x="340" y="260" width="120" height="120" fill="#6B4226" rx="2"/>
  <circle cx="445" cy="320" r="4" fill="#C9A84C"/>
</svg>
```

### 1.2 Two-Point Perspective

Two VPs on the horizon line, left and right. Vertical lines remain vertical.

**Key rules:**
- Angle to left VP + angle to right VP = 90°
- Common splits: 30/60 (dramatic corner), 45/45 (equal faces)
- Cone of vision: keep objects within 60° total to avoid distortion
- Closer VP = more foreshortened face

```svg
<!-- Two-Point Perspective: Building Corner -->
<svg viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg">
  <!-- VP_left at (-200, 300), VP_right at (1000, 300), Horizon at y=300 -->
  <rect width="800" height="300" fill="#87CEEB"/>
  <rect y="300" width="800" height="300" fill="#90A868"/>
  <!-- Left face converges to VP_left -->
  <polygon points="350,120 350,450 100,420 100,180" fill="#C4956A"/>
  <!-- Right face converges to VP_right -->
  <polygon points="350,120 350,450 650,410 650,170" fill="#B5845A"/>
  <!-- Roof -->
  <polygon points="350,120 100,180 100,160 350,80" fill="#8B4513"/>
  <polygon points="350,120 650,170 650,150 350,80" fill="#7A3B10"/>
  <!-- Windows on left face -->
  <rect x="150" y="210" width="40" height="50" fill="#A8D8EA" stroke="#8B7355" stroke-width="2"/>
  <rect x="250" y="195" width="45" height="55" fill="#A8D8EA" stroke="#8B7355" stroke-width="2"/>
  <!-- Windows on right face -->
  <rect x="400" y="195" width="50" height="55" fill="#A8D8EA" stroke="#8B7355" stroke-width="2"/>
  <rect x="520" y="205" width="45" height="50" fill="#A8D8EA" stroke="#8B7355" stroke-width="2"/>
  <!-- Door -->
  <rect x="380" y="310" width="55" height="100" fill="#6B4226" rx="2"/>
  <circle cx="425" cy="365" r="3" fill="#C9A84C"/>
</svg>
```

### 1.3 Three-Point Perspective

Two horizontal VPs + one vertical VP (above for worm's eye, below for bird's eye).
Even vertical lines converge — extreme dramatic distortion.

**Best for:** skyscrapers from below, aerial views, dramatic scenes.

```svg
<!-- Three-Point: Looking Up at Tall Building (Worm's Eye) -->
<svg viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
  <!-- VP_vertical at (400, -600) above canvas -->
  <rect width="800" height="800" fill="#4A90D9"/>
  <!-- Left face tapering upward -->
  <polygon points="200,800 380,800 395,100 340,100" fill="#8899AA"/>
  <!-- Right face tapering upward -->
  <polygon points="380,800 580,800 460,100 395,100" fill="#778899"/>
  <!-- Floor bands narrowing with height -->
  <line x1="210" y1="700" x2="570" y2="700" stroke="#667788" stroke-width="2"/>
  <line x1="245" y1="500" x2="535" y2="500" stroke="#667788" stroke-width="2"/>
  <line x1="300" y1="300" x2="485" y2="300" stroke="#667788" stroke-width="2"/>
  <!-- Windows shrink with height -->
  <rect x="240" y="720" width="30" height="40" fill="#D4E6F1" opacity="0.7"/>
  <rect x="480" y="720" width="30" height="40" fill="#D4E6F1" opacity="0.7"/>
  <rect x="275" y="520" width="24" height="35" fill="#D4E6F1" opacity="0.6"/>
  <rect x="470" y="520" width="24" height="35" fill="#D4E6F1" opacity="0.6"/>
  <rect x="320" y="320" width="18" height="28" fill="#D4E6F1" opacity="0.5"/>
  <rect x="448" y="320" width="18" height="28" fill="#D4E6F1" opacity="0.5"/>
  <!-- Antenna -->
  <line x1="397" y1="100" x2="397" y2="30" stroke="#556677" stroke-width="3"/>
  <circle cx="397" cy="25" r="5" fill="#FF4444"/>
</svg>
```

### 1.4 Isometric (No Perspective)

No vanishing points; parallel lines stay parallel. Standard angles: 30° from horizontal.

**Isometric transform:** `matrix(0.866, 0.5, -0.866, 0.5, 400, 100)`

```svg
<!-- Manual Isometric Cube -->
<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
  <polygon points="200,100 300,150 200,200 100,150" fill="#6EA8D7"/>  <!-- Top -->
  <polygon points="100,150 200,200 200,300 100,250" fill="#4A7FA5"/>  <!-- Left -->
  <polygon points="200,200 300,150 300,250 200,300" fill="#3A6A8A"/>  <!-- Right -->
</svg>
```

Cross-reference: `illustration-styles.md` for full isometric scene construction.

---

## 2. Building Construction

### 2.1 Simple House

```svg
<svg viewBox="0 0 400 350" xmlns="http://www.w3.org/2000/svg">
  <rect width="400" height="350" fill="#87CEEB"/>
  <rect y="260" width="400" height="90" fill="#7CCD7C"/>
  <!-- House body -->
  <rect x="80" y="150" width="240" height="120" fill="#E8D5B7" stroke="#8B7355" stroke-width="2"/>
  <!-- Gable roof -->
  <polygon points="60,150 340,150 200,60" fill="#8B4513" stroke="#6B3410" stroke-width="2"/>
  <!-- Door -->
  <rect x="170" y="200" width="60" height="70" fill="#6B4226" rx="2"/>
  <circle cx="220" cy="240" r="4" fill="#C9A84C"/>
  <!-- Windows (frame + mullion cross) -->
  <rect x="105" y="185" width="45" height="40" fill="#A8D8EA" stroke="#8B7355" stroke-width="2"/>
  <line x1="127" y1="185" x2="127" y2="225" stroke="#8B7355" stroke-width="1.5"/>
  <line x1="105" y1="205" x2="150" y2="205" stroke="#8B7355" stroke-width="1.5"/>
  <rect x="250" y="185" width="45" height="40" fill="#A8D8EA" stroke="#8B7355" stroke-width="2"/>
  <line x1="272" y1="185" x2="272" y2="225" stroke="#8B7355" stroke-width="1.5"/>
  <line x1="250" y1="205" x2="295" y2="205" stroke="#8B7355" stroke-width="1.5"/>
  <!-- Chimney -->
  <rect x="260" y="75" width="30" height="55" fill="#A0522D"/>
  <rect x="255" y="72" width="40" height="8" fill="#8B4513" rx="1"/>
  <!-- Attic window -->
  <circle cx="200" cy="115" r="15" fill="#A8D8EA" stroke="#8B7355" stroke-width="2"/>
</svg>
```

### 2.2 Multi-Story Building

Stack modular floors with a repeating window `<pattern>`.

```svg
<svg viewBox="0 0 500 600" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <pattern id="windowGrid" width="60" height="80" patternUnits="userSpaceOnUse">
      <rect width="60" height="80" fill="#C4956A"/>
      <rect x="10" y="10" width="40" height="50" fill="#6B8FAD" rx="1"/>
      <line x1="30" y1="10" x2="30" y2="60" stroke="#5A7A90" stroke-width="1"/>
      <line x1="10" y1="35" x2="50" y2="35" stroke="#5A7A90" stroke-width="1"/>
    </pattern>
  </defs>
  <rect x="50" y="80" width="400" height="480" fill="#C4956A" stroke="#8B6F50" stroke-width="2"/>
  <!-- Upper floors with window pattern -->
  <rect x="60" y="90" width="380" height="280" fill="url(#windowGrid)"/>
  <!-- Ground floor (taller, storefront) -->
  <rect x="60" y="380" width="380" height="170" fill="#A07850"/>
  <rect x="80" y="400" width="140" height="120" fill="#8FBCD4" rx="2" stroke="#6B5B45" stroke-width="2"/>
  <rect x="280" y="400" width="140" height="120" fill="#8FBCD4" rx="2" stroke="#6B5B45" stroke-width="2"/>
  <!-- Entrance -->
  <rect x="230" y="430" width="40" height="90" fill="#5A3520" rx="1"/>
  <circle cx="260" cy="475" r="3" fill="#C9A84C"/>
  <!-- Cornice -->
  <rect x="40" y="74" width="420" height="12" fill="#A07850" rx="2"/>
</svg>
```

### 2.3 Skyscraper / Tower

**Design:** tapered/setback profile, glass curtain wall gradient, fine window pattern.

```svg
<svg viewBox="0 0 400 700" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <pattern id="towerWin" width="16" height="20" patternUnits="userSpaceOnUse">
      <rect width="16" height="20" fill="#4A7A98"/>
      <rect x="2" y="2" width="12" height="14" fill="#8CBAD4" opacity="0.6"/>
    </pattern>
  </defs>
  <!-- Base (widest) -->
  <rect x="80" y="450" width="240" height="220" fill="url(#towerWin)" stroke="#3A6A88"/>
  <!-- Middle (setback) -->
  <rect x="110" y="250" width="180" height="200" fill="url(#towerWin)" stroke="#3A6A88"/>
  <!-- Upper (narrower) -->
  <rect x="140" y="100" width="120" height="150" fill="url(#towerWin)" stroke="#3A6A88"/>
  <!-- Crown -->
  <polygon points="180,60 220,60 200,30" fill="#3A6A88"/>
  <!-- Antenna -->
  <line x1="200" y1="30" x2="200" y2="5" stroke="#555" stroke-width="2"/>
  <circle cx="200" cy="3" r="3" fill="#FF3333"/>
  <!-- Reflection highlight -->
  <rect x="160" y="100" width="4" height="570" fill="white" opacity="0.15" rx="2"/>
  <!-- Setback ledges -->
  <rect x="105" y="248" width="190" height="5" fill="#3A6A88"/>
  <rect x="135" y="98" width="130" height="5" fill="#3A6A88"/>
</svg>
```

### 2.4 Church / Temple

```svg
<svg viewBox="0 0 500 600" xmlns="http://www.w3.org/2000/svg">
  <rect x="100" y="250" width="300" height="300" fill="#D4C4A8" stroke="#8B7355" stroke-width="2"/>
  <!-- Steeple -->
  <rect x="190" y="100" width="120" height="150" fill="#C9B896"/>
  <polygon points="190,100 310,100 250,20" fill="#8B7355"/>
  <!-- Cross -->
  <line x1="250" y1="20" x2="250" y2="-10" stroke="#6B5B45" stroke-width="4"/>
  <line x1="238" y1="0" x2="262" y2="0" stroke="#6B5B45" stroke-width="4"/>
  <!-- Rose window -->
  <circle cx="250" cy="310" r="50" fill="#2C3E6B" stroke="#8B7355" stroke-width="3"/>
  <line x1="250" y1="260" x2="250" y2="360" stroke="#C9A84C" stroke-width="1.5"/>
  <line x1="200" y1="310" x2="300" y2="310" stroke="#C9A84C" stroke-width="1.5"/>
  <line x1="215" y1="275" x2="285" y2="345" stroke="#C9A84C" stroke-width="1.5"/>
  <line x1="285" y1="275" x2="215" y2="345" stroke="#C9A84C" stroke-width="1.5"/>
  <circle cx="250" cy="310" r="20" fill="none" stroke="#C9A84C" stroke-width="1"/>
  <!-- Arched entrance -->
  <path d="M 210 550 L 210 460 A 40 40 0 0 1 290 460 L 290 550" fill="#3A2410" stroke="#8B7355" stroke-width="2"/>
  <line x1="250" y1="460" x2="250" y2="550" stroke="#5A3520" stroke-width="2"/>
  <!-- Pointed arch windows -->
  <path d="M 130 450 L 130 380 Q 150 340 170 380 L 170 450 Z" fill="#2C3E6B" stroke="#8B7355" stroke-width="2"/>
  <path d="M 330 450 L 330 380 Q 350 340 370 380 L 370 450 Z" fill="#2C3E6B" stroke="#8B7355" stroke-width="2"/>
  <!-- Buttresses -->
  <polygon points="100,550 100,300 80,550" fill="#B5A590" stroke="#8B7355" stroke-width="1"/>
  <polygon points="400,550 400,300 420,550" fill="#B5A590" stroke="#8B7355" stroke-width="1"/>
</svg>
```

---

## 3. Roof Types

### 3.1 Gable Roof
Simple triangle: `<polygon points="x1,base x2,base cx,peak">` where cx = center.

```svg
<polygon points="50,200 350,200 200,100" fill="#8B4513" stroke="#6B3410" stroke-width="2"/>
```

### 3.2 Hip Roof
All four sides slope — no vertical gable walls.

```svg
<polygon points="40,180 360,180 300,100 100,100" fill="#A0522D" stroke="#8B4513" stroke-width="1.5"/>
<line x1="100" y1="100" x2="300" y2="100" stroke="#6B3410" stroke-width="2"/>
<line x1="40" y1="180" x2="100" y2="100" stroke="#7A3B10" stroke-width="1.5"/>
<line x1="360" y1="180" x2="300" y2="100" stroke="#7A3B10" stroke-width="1.5"/>
```

### 3.3 Mansard Roof
Two slopes per side: steep lower, gentle upper. French style with dormer windows.

```svg
<svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
  <polygon points="60,200 60,120 100,100 100,200" fill="#555D6E"/>
  <polygon points="340,200 340,120 300,100 300,200" fill="#555D6E"/>
  <polygon points="100,100 300,100 270,70 130,70" fill="#4A5260"/>
  <!-- Dormer windows -->
  <rect x="140" y="130" width="30" height="35" fill="#A8D8EA" stroke="#555" stroke-width="1"/>
  <polygon points="135,130 170,130 152,115" fill="#555D6E"/>
  <rect x="230" y="130" width="30" height="35" fill="#A8D8EA" stroke="#555" stroke-width="1"/>
  <polygon points="225,130 265,130 245,115" fill="#555D6E"/>
</svg>
```

### 3.4 Flat Roof
Simple rectangle with parapet: `<rect>` on top, stroke-only rect for parapet walls.

### 3.5 Dome
Half-ellipse with radial gradient shading for volume.

```svg
<svg viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="domeShade" cx="0.4" cy="0.3" r="0.7">
      <stop offset="0%" stop-color="#D4C4A8"/>
      <stop offset="100%" stop-color="#8B7355"/>
    </radialGradient>
  </defs>
  <ellipse cx="150" cy="150" rx="100" ry="80" fill="url(#domeShade)"/>
  <rect y="150" width="300" height="50" fill="#C4956A"/>
  <ellipse cx="150" cy="150" rx="100" ry="15" fill="none" stroke="#8B7355" stroke-width="2"/>
  <!-- Segment lines -->
  <path d="M 100 150 Q 100 90 150 70" fill="none" stroke="#A09070" stroke-width="1" opacity="0.5"/>
  <path d="M 150 150 L 150 70" fill="none" stroke="#A09070" stroke-width="1" opacity="0.5"/>
  <path d="M 200 150 Q 200 90 150 70" fill="none" stroke="#A09070" stroke-width="1" opacity="0.5"/>
  <!-- Lantern at top -->
  <rect x="140" y="62" width="20" height="15" fill="#B5A590"/>
  <polygon points="140,62 160,62 150,52" fill="#8B7355"/>
</svg>
```

---

## 4. Windows & Doors

### 4.1 Rectangular Window

```svg
<g id="window-double-hung">
  <rect x="0" y="0" width="50" height="65" fill="#A8D8EA" stroke="#8B7355" stroke-width="3" rx="1"/>
  <rect x="3" y="3" width="44" height="59" fill="#D4E6F1" opacity="0.3"/>
  <line x1="25" y1="0" x2="25" y2="65" stroke="#8B7355" stroke-width="2"/>
  <line x1="0" y1="32" x2="50" y2="32" stroke="#8B7355" stroke-width="2.5"/>
</g>
```

**Variations:** single pane (no mullion), triple (two mullions), bay (central + angled flanks).

### 4.2 Arched Window

```svg
<!-- Romanesque (semicircular) -->
<path d="M 0 70 L 0 25 A 25 25 0 0 1 50 25 L 50 70 Z"
      fill="#A8D8EA" stroke="#8B7355" stroke-width="2.5"/>
<polygon points="20,2 30,2 27,10 23,10" fill="#C9B896"/>  <!-- Keystone -->

<!-- Gothic (pointed) -->
<path d="M 0 80 L 0 30 Q 0 0 25 -5 Q 50 0 50 30 L 50 80 Z"
      fill="#2C3E6B" stroke="#8B7355" stroke-width="2.5"/>
<!-- Tracery Y-pattern -->
<path d="M 25 -5 L 25 40 M 25 40 Q 10 55 5 30 M 25 40 Q 40 55 45 30"
      fill="none" stroke="#C9A84C" stroke-width="1.5"/>
```

### 4.3 Circular Window (Oculus)

```svg
<circle cx="30" cy="30" r="28" fill="#A8D8EA" stroke="#8B7355" stroke-width="3"/>
<line x1="30" y1="2" x2="30" y2="58" stroke="#8B7355" stroke-width="2"/>
<line x1="2" y1="30" x2="58" y2="30" stroke="#8B7355" stroke-width="2"/>
```

### 4.4 Panel Door

```svg
<g id="panel-door">
  <rect x="0" y="0" width="60" height="110" fill="#6B4226" stroke="#5A3520" stroke-width="2" rx="1"/>
  <!-- 6 raised panels -->
  <rect x="8" y="8" width="18" height="28" fill="#7A5233" rx="1" stroke="#5A3520" stroke-width="1"/>
  <rect x="34" y="8" width="18" height="28" fill="#7A5233" rx="1" stroke="#5A3520" stroke-width="1"/>
  <rect x="8" y="42" width="18" height="22" fill="#7A5233" rx="1" stroke="#5A3520" stroke-width="1"/>
  <rect x="34" y="42" width="18" height="22" fill="#7A5233" rx="1" stroke="#5A3520" stroke-width="1"/>
  <rect x="8" y="70" width="18" height="30" fill="#7A5233" rx="1" stroke="#5A3520" stroke-width="1"/>
  <rect x="34" y="70" width="18" height="30" fill="#7A5233" rx="1" stroke="#5A3520" stroke-width="1"/>
  <circle cx="50" cy="58" r="3.5" fill="#C9A84C"/>
</g>
```

**French door:** pair of tall narrow rects with 3×4 grid of small glass panes each, handles facing center.

---

## 5. Architectural Details

### 5.1 Columns

```svg
<!-- Doric: simple slab capital, no base -->
<g id="doric-column">
  <rect x="-20" y="0" width="40" height="10" fill="#D4C4A8"/>
  <path d="M -12 10 Q -14 120 -12 200 L 12 200 Q 14 120 12 10 Z" fill="#E8D5B7" stroke="#C9B896"/>
</g>

<!-- Ionic: volute capital, fluted shaft, base molding -->
<g id="ionic-column">
  <rect x="-22" y="8" width="44" height="8" fill="#D4C4A8"/>
  <path d="M -22 8 Q -28 0 -22 -5 Q -16 -10 -12 -3 Q -8 2 -14 6" fill="none" stroke="#B5A590" stroke-width="2"/>
  <path d="M 22 8 Q 28 0 22 -5 Q 16 -10 12 -3 Q 8 2 14 6" fill="none" stroke="#B5A590" stroke-width="2"/>
  <rect x="-12" y="16" width="24" height="180" fill="#E8D5B7"/>
  <!-- Fluting grooves -->
  <line x1="-6" y1="16" x2="-6" y2="196" stroke="#D4C4A8" stroke-width="0.8"/>
  <line x1="0" y1="16" x2="0" y2="196" stroke="#D4C4A8" stroke-width="0.8"/>
  <line x1="6" y1="16" x2="6" y2="196" stroke="#D4C4A8" stroke-width="0.8"/>
  <rect x="-16" y="196" width="32" height="6" fill="#D4C4A8" rx="1"/>
</g>
```

**Corinthian:** elaborate leaf capital — use stylized `<path>` acanthus leaf shapes around top.

### 5.2 Arches

```svg
<!-- Semicircular -->
<path d="M 0 100 L 0 50 A 50 50 0 0 1 100 50 L 100 100" fill="none" stroke="#8B7355" stroke-width="4"/>
<polygon points="42,5 58,5 55,20 45,20" fill="#C9B896"/>  <!-- Keystone -->

<!-- Gothic Pointed -->
<path d="M 0 100 L 0 40 Q 20 -10 50 0 Q 80 -10 100 40 L 100 100" fill="none" stroke="#8B7355" stroke-width="4"/>

<!-- Horseshoe (Moorish) -->
<path d="M 10 100 L 10 50 A 45 50 0 1 1 90 50 L 90 100" fill="none" stroke="#8B7355" stroke-width="4"/>
```

### 5.3 Stairs

```svg
<!-- Side-View Stairs with Railing -->
<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <path d="M 20 180 L 20 155 L 50 155 L 50 130 L 80 130 L 80 105 L 110 105 L 110 80 L 140 80 L 140 55 L 170 55 L 170 30 L 185 30"
        fill="none" stroke="#8B7355" stroke-width="3"/>
  <!-- Railing -->
  <line x1="20" y1="140" x2="170" y2="15" stroke="#6B5B45" stroke-width="2.5"/>
  <!-- Balusters with finials -->
  <line x1="35" y1="155" x2="35" y2="132" stroke="#6B5B45" stroke-width="1.5"/>
  <circle cx="35" cy="130" r="2.5" fill="#6B5B45"/>
  <line x1="95" y1="105" x2="95" y2="82" stroke="#6B5B45" stroke-width="1.5"/>
  <circle cx="95" cy="80" r="2.5" fill="#6B5B45"/>
  <line x1="155" y1="55" x2="155" y2="32" stroke="#6B5B45" stroke-width="1.5"/>
  <circle cx="155" cy="30" r="2.5" fill="#6B5B45"/>
</svg>
```

### 5.4 Balcony

Platform `<rect>` extending from wall, vertical bar railing, support brackets underneath.

### 5.5 Fence & Wall Patterns

```svg
<!-- Picket Fence -->
<defs>
  <pattern id="pickets" width="20" height="80" patternUnits="userSpaceOnUse">
    <polygon points="4,80 4,10 10,0 16,10 16,80" fill="white" stroke="#DDD" stroke-width="0.5"/>
  </pattern>
</defs>
<rect x="0" y="20" width="400" height="6" fill="white" stroke="#DDD"/>
<rect x="0" y="55" width="400" height="6" fill="white" stroke="#DDD"/>
<rect x="0" y="5" width="400" height="80" fill="url(#pickets)"/>

<!-- Brick Wall Pattern -->
<pattern id="brick" width="60" height="30" patternUnits="userSpaceOnUse">
  <rect x="0" y="0" width="28" height="13" fill="#B5553A" stroke="#D4C4A8" stroke-width="1"/>
  <rect x="30" y="0" width="30" height="13" fill="#C4644A" stroke="#D4C4A8" stroke-width="1"/>
  <!-- Row 2 offset -->
  <rect x="-15" y="15" width="28" height="13" fill="#C4644A" stroke="#D4C4A8" stroke-width="1"/>
  <rect x="15" y="15" width="28" height="13" fill="#B5553A" stroke="#D4C4A8" stroke-width="1"/>
  <rect x="45" y="15" width="28" height="13" fill="#C4644A" stroke="#D4C4A8" stroke-width="1"/>
</pattern>
```

---

## 6. Street Scene Composition

### 6.1 Layer Order (Back to Front)

1. **Sky gradient** — background
2. **Distant buildings** — silhouettes, light/desaturated, minimal detail
3. **Mid-ground buildings** — moderate detail, medium saturation
4. **Foreground buildings** — full detail, dark/saturated
5. **Street / sidewalk** — ground plane
6. **Street furniture** — lamps, signs, benches
7. **Characters / vehicles**
8. **Atmospheric overlay** — haze, fog, rain

**Atmospheric perspective:** farther objects are lighter, less saturated, and bluer.

### 6.2 Street Elements

```svg
<!-- Lamppost -->
<g id="lamppost">
  <rect x="-3" y="-180" width="6" height="180" fill="#333" rx="1"/>
  <path d="M 0 -170 Q 20 -180 30 -165" fill="none" stroke="#333" stroke-width="4"/>
  <rect x="22" y="-170" width="18" height="25" fill="#555" rx="3"/>
  <rect x="24" y="-167" width="14" height="19" fill="#FFF8DC" opacity="0.9"/>
  <circle cx="31" cy="-157" r="30" fill="#FFF8DC" opacity="0.1"/>
</g>

<!-- Traffic Light -->
<g id="traffic-light">
  <rect x="0" y="0" width="24" height="65" fill="#333" rx="4"/>
  <circle cx="12" cy="14" r="8" fill="#FF3333"/>
  <circle cx="12" cy="33" r="8" fill="#FFD700"/>
  <circle cx="12" cy="52" r="8" fill="#33CC33"/>
  <rect x="8" y="65" width="8" height="100" fill="#555"/>
</g>

<!-- Fire Hydrant -->
<g id="hydrant">
  <rect x="-10" y="-40" width="20" height="40" fill="#CC3333" rx="3"/>
  <ellipse cx="0" cy="-40" rx="12" ry="5" fill="#DD4444"/>
  <rect x="-15" y="-28" width="30" height="8" fill="#CC3333" rx="2"/>
  <rect x="-14" y="0" width="28" height="5" fill="#AA2222" rx="1"/>
</g>
```

### 6.3 Vehicles (Simplified)

```svg
<!-- Car (side view) -->
<g id="car-side">
  <path d="M 10 40 L 10 25 L 30 25 L 45 10 L 85 10 L 100 25 L 120 25 L 120 40 Z"
        fill="#4A7FA5" stroke="#3A6A88" stroke-width="1.5"/>
  <path d="M 35 25 L 48 12 L 65 12 L 65 25 Z" fill="#A8D8EA" opacity="0.8"/>
  <path d="M 67 25 L 67 12 L 83 12 L 95 25 Z" fill="#A8D8EA" opacity="0.8"/>
  <circle cx="30" cy="42" r="10" fill="#333"/>
  <circle cx="30" cy="42" r="5" fill="#666"/>
  <circle cx="100" cy="42" r="10" fill="#333"/>
  <circle cx="100" cy="42" r="5" fill="#666"/>
</g>

<!-- Bicycle -->
<g id="bicycle">
  <circle cx="25" cy="50" r="20" fill="none" stroke="#333" stroke-width="2"/>
  <circle cx="95" cy="50" r="20" fill="none" stroke="#333" stroke-width="2"/>
  <line x1="25" y1="50" x2="55" y2="25" stroke="#CC3333" stroke-width="2.5"/>
  <line x1="55" y1="25" x2="95" y2="50" stroke="#CC3333" stroke-width="2.5"/>
  <line x1="55" y1="25" x2="55" y2="50" stroke="#CC3333" stroke-width="2.5"/>
  <line x1="25" y1="50" x2="55" y2="50" stroke="#CC3333" stroke-width="2.5"/>
  <ellipse cx="55" cy="22" rx="8" ry="3" fill="#333"/>
</g>
```

---

## 7. Interior Scenes

### 7.1 Room Construction (One-Point Perspective)

```svg
<svg viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg">
  <!-- VP at (400, 300) -->
  <rect x="200" y="150" width="400" height="300" fill="#F5F0E8"/>  <!-- Back wall -->
  <polygon points="0,600 800,600 600,450 200,450" fill="#C4956A"/>  <!-- Floor -->
  <polygon points="0,0 200,150 200,450 0,600" fill="#E8E0D0"/>     <!-- Left wall -->
  <polygon points="800,0 600,150 600,450 800,600" fill="#DDD5C5"/>  <!-- Right wall -->
  <polygon points="0,0 800,0 600,150 200,150" fill="#FFF8F0"/>     <!-- Ceiling -->
  <!-- Floor boards converging to VP -->
  <line x1="0" y1="600" x2="400" y2="300" stroke="#B5845A" stroke-width="1" opacity="0.3"/>
  <line x1="320" y1="600" x2="400" y2="300" stroke="#B5845A" stroke-width="1" opacity="0.3"/>
  <line x1="480" y1="600" x2="400" y2="300" stroke="#B5845A" stroke-width="1" opacity="0.3"/>
  <line x1="800" y1="600" x2="400" y2="300" stroke="#B5845A" stroke-width="1" opacity="0.3"/>
  <!-- Window on back wall -->
  <rect x="300" y="200" width="100" height="120" fill="#A8D8EA" stroke="#C9B896" stroke-width="3"/>
  <line x1="350" y1="200" x2="350" y2="320" stroke="#C9B896" stroke-width="2"/>
  <!-- Window light on floor -->
  <polygon points="300,450 400,450 500,550 350,550" fill="#FFF8DC" opacity="0.15"/>
</svg>
```

### 7.2 Furniture Placement

**Rules:** furniture diminishes following perspective, shadows anchor objects to floor.

```svg
<!-- Table -->
<polygon points="280,380 420,380 440,360 300,360" fill="#8B6F50" stroke="#6B5040" stroke-width="1.5"/>
<line x1="290" y1="362" x2="285" y2="440" stroke="#6B5040" stroke-width="3"/>
<line x1="430" y1="362" x2="435" y2="440" stroke="#6B5040" stroke-width="3"/>
<ellipse cx="360" cy="442" rx="70" ry="8" fill="#000" opacity="0.1"/>

<!-- Bookshelf (against back wall) -->
<rect x="210" y="220" width="70" height="200" fill="#8B6F50" stroke="#6B5040" stroke-width="1.5"/>
<line x1="212" y1="260" x2="278" y2="260" stroke="#6B5040" stroke-width="2"/>
<line x1="212" y1="300" x2="278" y2="300" stroke="#6B5040" stroke-width="2"/>
<line x1="212" y1="340" x2="278" y2="340" stroke="#6B5040" stroke-width="2"/>
<!-- Books -->
<rect x="215" y="230" width="8" height="28" fill="#C44E4E"/>
<rect x="225" y="234" width="6" height="24" fill="#4A7FA5"/>
<rect x="233" y="232" width="9" height="26" fill="#5B8C5A"/>
<rect x="244" y="228" width="7" height="30" fill="#C9A84C"/>
```

### 7.3 Interior Lighting

```svg
<defs>
  <radialGradient id="lampGlow" cx="0.5" cy="0.5" r="0.5">
    <stop offset="0%" stop-color="#FFF8DC" stop-opacity="0.4"/>
    <stop offset="50%" stop-color="#FFE680" stop-opacity="0.15"/>
    <stop offset="100%" stop-color="#FFE680" stop-opacity="0"/>
  </radialGradient>
</defs>
<!-- Lamp fixture -->
<polygon points="340,310 370,310 365,290 345,290" fill="#E8D5B7" stroke="#C9B896"/>
<rect x="352" y="310" width="6" height="25" fill="#999"/>
<!-- Glow -->
<circle cx="355" cy="310" r="80" fill="url(#lampGlow)"/>
```

Cross-reference: `svg-filters-and-effects.md` for fePointLight, feSpotLight.

---

## 8. City Skyline

### 8.1 Sunset Skyline

```svg
<svg viewBox="0 0 800 400" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="sunset" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#1A0533"/>
      <stop offset="30%" stop-color="#6B2F6B"/>
      <stop offset="60%" stop-color="#E8734A"/>
      <stop offset="85%" stop-color="#FFB347"/>
      <stop offset="100%" stop-color="#FFD700"/>
    </linearGradient>
  </defs>
  <rect width="800" height="400" fill="url(#sunset)"/>
  <circle cx="400" cy="280" r="40" fill="#FFD700" opacity="0.8"/>
  <!-- Silhouette skyline path -->
  <path d="M 0 300
           L 30 300 L 30 240 L 70 240 L 70 220 L 90 220
           L 100 210 L 100 250 L 120 250 L 120 200 L 140 200
           L 160 230 L 160 180 L 175 150 L 180 180 L 200 180
           L 220 220 L 240 190 L 260 210 L 260 160 L 285 130
           L 290 160 L 300 230 L 330 190 L 350 170
           L 380 140 L 395 90 L 410 140 L 420 180 L 440 200
           L 470 160 L 510 180 L 520 130 L 525 110 L 530 150
           L 550 190 L 600 210 L 620 200 L 660 250 L 690 220
           L 730 260 L 760 240 L 780 300 L 800 300
           L 800 400 L 0 400 Z"
        fill="#1A0533" opacity="0.85"/>
  <!-- Antenna -->
  <line x1="395" y1="90" x2="395" y2="60" stroke="#1A0533" stroke-width="1.5" opacity="0.85"/>
</svg>
```

### 8.2 Nighttime Skyline

```svg
<svg viewBox="0 0 800 400" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="nightSky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0A0A2E"/>
      <stop offset="100%" stop-color="#1A1A4A"/>
    </linearGradient>
    <pattern id="litWin" width="10" height="12" patternUnits="userSpaceOnUse">
      <rect width="10" height="12" fill="#2A2A4A"/>
      <rect x="2" y="2" width="5" height="7" fill="#FFE680" opacity="0.7"/>
    </pattern>
    <pattern id="darkWin" width="10" height="12" patternUnits="userSpaceOnUse">
      <rect width="10" height="12" fill="#2A2A4A"/>
      <rect x="2" y="2" width="5" height="7" fill="#334" opacity="0.4"/>
    </pattern>
  </defs>
  <rect width="800" height="400" fill="url(#nightSky)"/>
  <!-- Stars -->
  <circle cx="50" cy="30" r="1" fill="white" opacity="0.8"/>
  <circle cx="300" cy="25" r="1" fill="white" opacity="0.9"/>
  <circle cx="500" cy="45" r="1.2" fill="white" opacity="0.7"/>
  <circle cx="720" cy="55" r="1.5" fill="white" opacity="0.5"/>
  <!-- Crescent moon -->
  <circle cx="680" cy="60" r="20" fill="#E8E0C8" opacity="0.9"/>
  <circle cx="690" cy="55" r="18" fill="url(#nightSky)"/>
  <!-- Buildings alternating lit/dark windows -->
  <rect x="50" y="220" width="80" height="180" fill="url(#litWin)"/>
  <rect x="140" y="180" width="60" height="220" fill="url(#darkWin)"/>
  <rect x="210" y="160" width="90" height="240" fill="url(#litWin)"/>
  <rect x="310" y="120" width="70" height="280" fill="url(#litWin)"/>
  <rect x="500" y="150" width="80" height="250" fill="url(#litWin)"/>
  <rect x="660" y="230" width="90" height="170" fill="url(#darkWin)"/>
  <!-- Water reflections -->
  <rect y="350" width="800" height="50" fill="#0A0A1E"/>
  <line x1="260" y1="360" x2="260" y2="400" stroke="#FFE680" stroke-width="1.5" opacity="0.12"/>
  <line x1="350" y1="355" x2="350" y2="400" stroke="#FFE680" stroke-width="1" opacity="0.18"/>
  <line x1="540" y1="358" x2="540" y2="400" stroke="#FFE680" stroke-width="1.5" opacity="0.14"/>
</svg>
```

**Night scene tips:**
- Scatter individual lit window rects randomly for natural variation
- Window glow: `feGaussianBlur` filter on bright rects
- Water reflection: flip skyline vertically, blur, reduce opacity
- Ripple: `feTurbulence` + `feDisplacementMap` on reflection

---

## 9. Perspective Helper Functions

### 9.1 Computing Points at Depth

```
perspectivePoint(frontX, frontY, vpX, vpY, t):
  x = frontX + (vpX - frontX) * t
  y = frontY + (vpY - frontY) * t
```

Depth values: `t=0` front, `t=0.3` mid, `t=0.6` far, `t=1.0` vanishing point.

### 9.2 Spacing Objects in Depth

Equal-spaced objects (posts, columns) appear closer as they recede. Use geometric progression:

```
t_n = 1 - (1 - t_first) * ratio^n     // ratio = 0.6–0.8
```

### 9.3 Size Diminution

```
width_at_depth  = front_width  * (1 - t)
height_at_depth = front_height * (1 - t)
```

---

## Related References

- `composition.md` — Layout rules, golden ratio, visual hierarchy
- `materials-and-textures.md` — Brick, stone, glass, metal, wood surfaces
- `illustration-styles.md` — Flat, isometric, pixel art building styles
- `svg-filters-and-effects.md` — Lighting filters, atmospheric effects, glow
- `color-and-gradients.md` — Sky gradients, material colors, ambient tinting
- `bezier-and-curves.md` — Smooth arch construction, decorative curves
- `advanced-color-composition.md` — Atmospheric perspective color theory, depth cues
