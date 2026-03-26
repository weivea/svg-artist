# Animals & Creatures

## 1. Animal Proportions

### 1.1 Cat
- Body length = 2.5 head lengths, leg height = 1.5 head lengths
- Total height (standing) = 3 head lengths, total length = 4 head lengths (including tail)
- Head: nearly circular, ears are triangles at ~40° angle from top, large eyes placed low on face
- Paws: small ovals, front slightly smaller than back
- Tail: tapered curve, length = body length

```xml
<!-- Sitting cat -->
<g id="cat" transform="translate(150, 50)">
  <!-- Body -->
  <ellipse cx="0" cy="60" rx="35" ry="45" fill="#8B7355"/>
  <!-- Head -->
  <circle cx="0" cy="5" r="28" fill="#A0896C"/>
  <!-- Ears -->
  <polygon points="-20,-15 -12,-45 -4,-15" fill="#A0896C"/>
  <polygon points="4,-15 12,-45 20,-15" fill="#A0896C"/>
  <polygon points="-17,-18 -12,-40 -7,-18" fill="#D4A0A0"/>
  <polygon points="7,-18 12,-40 17,-18" fill="#D4A0A0"/>
  <!-- Eyes -->
  <ellipse cx="-10" cy="0" rx="6" ry="7" fill="#F0E68C"/>
  <ellipse cx="10" cy="0" rx="6" ry="7" fill="#F0E68C"/>
  <ellipse cx="-10" cy="0" rx="2" ry="6" fill="#1A1A1A"/>
  <ellipse cx="10" cy="0" rx="2" ry="6" fill="#1A1A1A"/>
  <!-- Nose -->
  <polygon points="0,8 -3,12 3,12" fill="#D4756B"/>
  <!-- Whiskers -->
  <line x1="-4" y1="12" x2="-35" y2="8" stroke="#666" stroke-width="0.8"/>
  <line x1="-4" y1="14" x2="-35" y2="14" stroke="#666" stroke-width="0.8"/>
  <line x1="4" y1="12" x2="35" y2="8" stroke="#666" stroke-width="0.8"/>
  <line x1="4" y1="14" x2="35" y2="14" stroke="#666" stroke-width="0.8"/>
  <!-- Front paws -->
  <ellipse cx="-15" cy="100" rx="10" ry="8" fill="#A0896C"/>
  <ellipse cx="15" cy="100" rx="10" ry="8" fill="#A0896C"/>
  <!-- Tail -->
  <path d="M 30 70 Q 60 50, 55 30 Q 50 15, 45 20" fill="none" stroke="#8B7355" stroke-width="8" stroke-linecap="round"/>
</g>
```

### 1.2 Dog (Medium Breed)
- Body length = 2.5-3 head lengths, leg height = 1.8 head lengths
- Muzzle protrudes 0.5 head lengths from skull circle
- Ears vary by breed: floppy (drooping ellipses), pointed (triangles), folded
- Paws: larger than cat, wider
- Tail: varies — curled up, straight out, between legs for mood

```xml
<!-- Standing dog (side view) -->
<g id="dog" transform="translate(50, 80)">
  <!-- Body -->
  <ellipse cx="120" cy="50" rx="70" ry="35" fill="#C4A259"/>
  <!-- Head -->
  <circle cx="25" cy="20" r="25" fill="#D4B26A"/>
  <!-- Muzzle -->
  <ellipse cx="5" cy="30" rx="15" ry="12" fill="#E0C88A"/>
  <ellipse cx="5" cy="25" rx="6" ry="4" fill="#2C2C2C"/>
  <!-- Eye -->
  <circle cx="20" cy="15" r="4" fill="white"/>
  <circle cx="21" cy="15" r="2.5" fill="#3D2B1F"/>
  <circle cx="22" cy="14" r="1" fill="white"/>
  <!-- Ear (floppy) -->
  <ellipse cx="35" cy="10" rx="12" ry="20" fill="#A0896C" transform="rotate(20, 35, 10)"/>
  <!-- Legs -->
  <rect x="65" y="75" width="12" height="45" rx="4" fill="#C4A259"/>
  <rect x="85" y="75" width="12" height="45" rx="4" fill="#B89A4A"/>
  <rect x="155" y="75" width="12" height="45" rx="4" fill="#C4A259"/>
  <rect x="170" y="75" width="12" height="45" rx="4" fill="#B89A4A"/>
  <!-- Paws -->
  <ellipse cx="71" cy="120" rx="8" ry="5" fill="#D4B26A"/>
  <ellipse cx="91" cy="120" rx="8" ry="5" fill="#D4B26A"/>
  <ellipse cx="161" cy="120" rx="8" ry="5" fill="#D4B26A"/>
  <ellipse cx="176" cy="120" rx="8" ry="5" fill="#D4B26A"/>
  <!-- Tail -->
  <path d="M 190 40 Q 210 20, 215 35 Q 220 50, 210 45" fill="#C4A259" stroke="#B89A4A" stroke-width="1"/>
</g>
```

### 1.3 Bird (Generic Songbird)
- Body = 2× head diameter (oval shape)
- Wing folded: 80% of body length, oval attached at shoulder
- Tail fan: 50-70% body length
- Legs: thin lines, 3 forward toes + 1 back, ankle bends backward
- Beak: triangle or slight curve, 0.5-1× head length

```xml
<!-- Perched bird -->
<g id="bird" transform="translate(100, 50)">
  <!-- Body -->
  <ellipse cx="0" cy="30" rx="20" ry="28" fill="#E74C3C"/>
  <!-- Head -->
  <circle cx="-5" cy="-2" r="14" fill="#C0392B"/>
  <!-- Eye -->
  <circle cx="-10" cy="-4" r="3" fill="white"/>
  <circle cx="-11" cy="-4" r="1.8" fill="#1A1A1A"/>
  <circle cx="-11.5" cy="-4.5" r="0.7" fill="white"/>
  <!-- Beak -->
  <polygon points="-18,-2 -28,0 -18,3" fill="#F39C12"/>
  <!-- Wing -->
  <path d="M 5 10 Q 25 15, 20 50 Q 10 45, 5 10" fill="#A93226"/>
  <!-- Tail -->
  <path d="M 10 55 L 25 75 L 15 73 L 20 80 L 5 65 Z" fill="#922B21"/>
  <!-- Legs -->
  <line x1="-5" y1="55" x2="-5" y2="75" stroke="#666" stroke-width="1.5"/>
  <line x1="5" y1="55" x2="5" y2="75" stroke="#666" stroke-width="1.5"/>
  <!-- Toes -->
  <path d="M -12 75 L -5 75 L 2 75" fill="none" stroke="#666" stroke-width="1.2"/>
  <line x1="-5" y1="75" x2="-8" y2="80" stroke="#666" stroke-width="1.2"/>
</g>
```

### 1.4 Horse
- Body = 2.5 head lengths, leg = 2× head length (very long!)
- Neck = 1.5 head lengths at 45° angle
- Head: elongated oval, length > width by 1.5×
- Key joints: shoulder at body front-top, elbow at chest, knee at belly, hock (rear)
- Hooves: trapezoidal, dark

### 1.5 Rabbit
- Body = 2 head lengths, compact and rounded
- Ears: 1.5-2× head length (defining feature), upright or lop
- Hind legs: much larger than forelegs, folded
- Fluffy tail: small circle at rear
- Construction: two overlapping circles (body larger) + head circle + ear paths

### 1.6 Fish
- Body: elongated oval or streamlined teardrop
- Tail fin: V or fan shape at rear
- Dorsal fin: triangle on top, pectoral fins at sides
- Eye: relatively large circle placed forward
- Scales: overlapping arc pattern (see `patterns-and-motifs.md`)

```xml
<!-- Simple fish -->
<g id="fish" transform="translate(50, 80)">
  <!-- Body -->
  <ellipse cx="100" cy="0" rx="55" ry="25" fill="#3498DB"/>
  <!-- Tail fin -->
  <polygon points="155,0 180,-20 180,20" fill="#2980B9"/>
  <!-- Dorsal fin -->
  <path d="M 80 -25 Q 100 -45, 120 -25" fill="#2471A3"/>
  <!-- Pectoral fin -->
  <path d="M 75 5 Q 60 20, 80 15" fill="#2980B9"/>
  <!-- Eye -->
  <circle cx="60" cy="-5" r="6" fill="white"/>
  <circle cx="58" cy="-5" r="3.5" fill="#1A1A1A"/>
  <circle cx="57" cy="-6" r="1.2" fill="white"/>
  <!-- Mouth -->
  <path d="M 46 2 Q 44 5, 46 8" fill="none" stroke="#1A4F72" stroke-width="1"/>
  <!-- Gill line -->
  <path d="M 68 -15 Q 72 0, 68 15" fill="none" stroke="#1A4F72" stroke-width="0.8"/>
</g>
```

## 2. Quadruped Anatomy Simplification

### 2.1 Skeleton → Shapes
ALL quadrupeds share the same basic bone structure with different proportions:

1. **Spine**: single curved line from head to tail — this is the action line
2. **Ribcage**: large oval at front of torso
3. **Pelvis**: smaller oval at rear of torso
4. **Legs**: 3 segments each (upper, lower, paw/hoof) connected at joints
5. **Front leg**: elbow bends BACKWARD (like human arm)
6. **Rear leg**: knee bends FORWARD, hock bends BACKWARD (like human heel raised)

### 2.2 Action Line
- One line defining the primary motion/pose — same principle as character illustration
- Animals with curved spines: cat arching, dog stretching, horse galloping
- The action line dictates body curve, then limbs hang from it

### 2.3 Mass Distribution
| Animal Type | Center of Gravity | Stance | Limb Proportion |
|-------------|-------------------|--------|----------------|
| Heavy (bear, hippo) | Low | Wide | Thick, short |
| Medium (dog, wolf) | Mid | Normal | Proportional |
| Light (deer, cat) | High | Narrow | Thin, long |
| Aquatic (seal) | Low | Splayed | Very short |

SVG technique: heavier = more overlap, rounder shapes; lighter = more angular, elongated ovals

## 3. Fur Rendering

### 3.1 Short Fur
Base fill color + edge detail strokes along silhouette:

```xml
<defs>
  <pattern id="short-fur" width="8" height="8" patternUnits="userSpaceOnUse">
    <path d="M 0 8 Q 2 3, 4 0" fill="none" stroke="#8B6914" stroke-width="0.8"/>
    <path d="M 4 8 Q 5 4, 7 1" fill="none" stroke="#A07828" stroke-width="0.6"/>
  </pattern>
</defs>
```

Use for: dogs, cats, horses (body), rabbits. Apply along body edge as individual short quadratic strokes pointing outward from the silhouette.

### 3.2 Long Fur / Flowing Hair
- Overlapping cubic Bézier curves, thick to thin
- Multiple strand groups flowing in the same direction
- Highlight strands: lighter color, thinner stroke
- Shadow between strands: darker fill between overlapping paths
- Use for: long-haired dogs, horse mane/tail, lion mane

```xml
<!-- Long fur group -->
<g id="long-fur">
  <path d="M 0 0 C 5 20, -5 40, 0 60 C 5 80, -3 95, 2 110" fill="none" stroke="#8B6914" stroke-width="3" stroke-linecap="round"/>
  <path d="M 6 2 C 10 25, 2 45, 8 65 C 12 85, 4 100, 9 115" fill="none" stroke="#A07828" stroke-width="2.5" stroke-linecap="round"/>
  <path d="M 12 4 C 15 22, 8 42, 14 62" fill="none" stroke="#C4A259" stroke-width="1.5" stroke-linecap="round" opacity="0.7"/>
</g>
```

### 3.3 Spotted Patterns

**Dalmatian**: irregular black blobs
```xml
<g id="dalmatian-spots">
  <path d="M 10 10 Q 15 5, 20 10 Q 25 15, 20 20 Q 15 22, 10 18 Z" fill="#1A1A1A"/>
  <ellipse cx="45" cy="15" rx="8" ry="6" fill="#1A1A1A" transform="rotate(15, 45, 15)"/>
  <path d="M 30 30 Q 38 25, 42 32 Q 40 40, 32 38 Z" fill="#1A1A1A"/>
</g>
```

**Leopard**: dark ring rosettes with darker center dots

**Giraffe**: irregular polygons separated by thin light lines

### 3.4 Striped Patterns (Tiger)
- Curved black stripes following body contour — NOT straight lines
- Stripes taper at ends (thicker in middle)
- Follow the 3D form: stripes curve around the body cylinder
- Zebra: more uniform width, alternating B&W

```xml
<!-- Tiger stripes following body curve -->
<g id="tiger-stripes" opacity="0.9">
  <path d="M 50 20 Q 55 35, 50 50" fill="none" stroke="#1A1A1A" stroke-width="4" stroke-linecap="round"/>
  <path d="M 65 15 Q 72 30, 68 48" fill="none" stroke="#1A1A1A" stroke-width="5" stroke-linecap="round"/>
  <path d="M 82 18 Q 88 32, 84 45" fill="none" stroke="#1A1A1A" stroke-width="3.5" stroke-linecap="round"/>
</g>
```

## 4. Feather Construction

### 4.1 Flight Feather (Wing)
```xml
<!-- Single flight feather -->
<g id="flight-feather">
  <!-- Shaft -->
  <line x1="50" y1="0" x2="50" y2="120" stroke="#3D2B1F" stroke-width="1.5"/>
  <!-- Leading vane (narrower) -->
  <path d="M 50 10 Q 35 30, 38 50 Q 40 70, 42 90 Q 44 100, 50 120" fill="#555" stroke="#444" stroke-width="0.5"/>
  <!-- Trailing vane (wider) -->
  <path d="M 50 10 Q 70 30, 68 50 Q 65 70, 60 90 Q 55 105, 50 120" fill="#666" stroke="#555" stroke-width="0.5"/>
  <!-- Barb lines -->
  <line x1="50" y1="30" x2="38" y2="35" stroke="#444" stroke-width="0.3" opacity="0.5"/>
  <line x1="50" y1="30" x2="67" y2="35" stroke="#444" stroke-width="0.3" opacity="0.5"/>
  <line x1="50" y1="50" x2="40" y2="55" stroke="#444" stroke-width="0.3" opacity="0.5"/>
  <line x1="50" y1="50" x2="65" y2="55" stroke="#444" stroke-width="0.3" opacity="0.5"/>
</g>
```

### 4.2 Down / Fluff
- Soft, fluffy: small irregular curves radiating from center point
- Use for: baby birds, chest area, under wings

### 4.3 Plumage Patterns
- Layered overlapping: like roof shingles, each row overlapping the one below
- `<pattern>` with arc-shaped feather units
- Color: gradients within individual feathers (darker at base, lighter at tip)

### 4.4 Wing Construction

**Folded wing**: elongated oval along body side

**Spread wing**:
- Primary feathers: longest, at wingtip (5-7 feathers)
- Secondary feathers: shorter, along back edge (6-10)
- Coverts: smaller feathers covering base of flight feathers

```xml
<!-- Spread wing (simplified) -->
<g id="spread-wing" transform="translate(50, 100)">
  <!-- Coverts (base layer) -->
  <path d="M 0 0 Q 30 -20, 60 -15 Q 40 -5, 0 0" fill="#8B6914"/>
  <!-- Secondary feathers -->
  <path d="M 60 -15 Q 55 -50, 50 -60" fill="none" stroke="#7D5F10" stroke-width="8" stroke-linecap="round"/>
  <path d="M 70 -18 Q 68 -55, 65 -68" fill="none" stroke="#8B6914" stroke-width="7" stroke-linecap="round"/>
  <path d="M 80 -20 Q 80 -58, 78 -72" fill="none" stroke="#7D5F10" stroke-width="7" stroke-linecap="round"/>
  <!-- Primary feathers (longest) -->
  <path d="M 90 -22 Q 95 -65, 92 -82" fill="none" stroke="#8B6914" stroke-width="6" stroke-linecap="round"/>
  <path d="M 98 -24 Q 108 -70, 105 -90" fill="none" stroke="#7D5F10" stroke-width="5.5" stroke-linecap="round"/>
  <path d="M 105 -25 Q 120 -72, 118 -95" fill="none" stroke="#8B6914" stroke-width="5" stroke-linecap="round"/>
  <path d="M 110 -25 Q 130 -70, 130 -98" fill="none" stroke="#7D5F10" stroke-width="4.5" stroke-linecap="round"/>
</g>
```

## 5. Scale Patterns

### 5.1 Fish Scales
Overlapping arcs in offset rows:

```xml
<defs>
  <pattern id="fish-scales" width="20" height="18" patternUnits="userSpaceOnUse">
    <path d="M 0 18 A 10 10 0 0 1 20 18" fill="none" stroke="#2E86C1" stroke-width="0.5"/>
    <path d="M 10 9 A 10 10 0 0 1 30 9" fill="none" stroke="#2E86C1" stroke-width="0.5"/>
  </pattern>
</defs>
```

### 5.2 Reptile Scales
- Hexagonal or diamond-shaped polygons
- Larger on belly, smaller on back and limbs
- Slight color variation between individual scales
- Ridge line detail on each scale center

### 5.3 Dragon Scales
- Larger, more angular than real reptile scales
- Metallic gradient within each scale (see `materials-and-textures.md`)
- Overlapping arrangement pointing downward
- Belly scales: smooth, larger, horizontal bands

```xml
<!-- Dragon scale row -->
<g id="dragon-scales">
  <path d="M 0 20 L 10 0 L 20 20 L 10 18 Z" fill="url(#metallic-green)"/>
  <path d="M 15 20 L 25 0 L 35 20 L 25 18 Z" fill="url(#metallic-green)"/>
  <path d="M 30 20 L 40 0 L 50 20 L 40 18 Z" fill="url(#metallic-green)"/>
</g>
```

## 6. Bird Details

### 6.1 Beak Types
| Bird Type | Beak Shape | SVG Construction |
|-----------|-----------|------------------|
| Songbird | Short, conical | `<polygon points="tip_x,mid_y x1,top_y x1,bot_y"/>` |
| Parrot | Hooked, thick | Curved `<path>` with hook at tip |
| Eagle/Hawk | Hooked, sharp | Angular curve with notch |
| Pelican | Long with pouch | Elongated shape + drooping lower |
| Toucan | Very large, colorful | Large curved oval, multi-color |
| Hummingbird | Long, thin, straight | Thin `<line>` or narrow `<path>` |

### 6.2 Eye Construction
- Large relative to head (birds have proportionally huge eyes)
- Circular eye ring (white or colored sclera)
- Round pupil (most birds) vs slit (some owls)
- Highlight dot is essential for "life" feel

### 6.3 Leg & Foot
- Thin, scaled legs (use scale pattern at small scale)
- **Anisodactyl** (most common): 3 forward toes, 1 backward
- **Webbed**: membrane `<path>` between toes (ducks, geese)
- **Talons**: curved pointed tips on toes (raptors)
- **Wading**: very long legs, few toe details (herons)

## 7. Aquatic Creatures

### 7.1 Fish Body Shapes
| Type | Shape | Examples |
|------|-------|----------|
| Fusiform | Streamlined torpedo | Tuna, mackerel |
| Laterally compressed | Tall thin oval | Angelfish, discus |
| Depressed | Flat disc/diamond | Rays, flounder |
| Elongated | Snake-like curve | Eels, pipefish |

### 7.2 Octopus / Squid
- Head/mantle: oval or teardrop
- Eyes: large, placed on sides of head
- Tentacles: 8 curved `<path>` elements radiating from head base
- Suction cups: small circles along tentacle undersides
- Movement: S-curves for flowing tentacles

```xml
<!-- Simple octopus -->
<g id="octopus" transform="translate(100, 50)">
  <!-- Head -->
  <ellipse cx="0" cy="0" rx="30" ry="35" fill="#8E44AD"/>
  <!-- Eyes -->
  <ellipse cx="-12" cy="-5" rx="8" ry="10" fill="white"/>
  <ellipse cx="12" cy="-5" rx="8" ry="10" fill="white"/>
  <circle cx="-12" cy="-3" r="5" fill="#1A1A1A"/>
  <circle cx="12" cy="-3" r="5" fill="#1A1A1A"/>
  <!-- Tentacles -->
  <path d="M -25 30 C -40 60, -20 80, -35 110" fill="none" stroke="#7D3C98" stroke-width="6" stroke-linecap="round"/>
  <path d="M -15 33 C -25 65, -10 85, -20 115" fill="none" stroke="#8E44AD" stroke-width="5.5" stroke-linecap="round"/>
  <path d="M -5 35 C -10 70, 5 90, -5 120" fill="none" stroke="#7D3C98" stroke-width="5" stroke-linecap="round"/>
  <path d="M 5 35 C 10 70, -5 90, 5 120" fill="none" stroke="#8E44AD" stroke-width="5" stroke-linecap="round"/>
  <path d="M 15 33 C 25 65, 10 85, 20 115" fill="none" stroke="#7D3C98" stroke-width="5.5" stroke-linecap="round"/>
  <path d="M 25 30 C 40 60, 20 80, 35 110" fill="none" stroke="#8E44AD" stroke-width="6" stroke-linecap="round"/>
</g>
```

### 7.3 Whale / Dolphin
- Streamlined body: large elongated oval
- Tail flukes: HORIZONTAL (not vertical like fish!)
- Dorsal fin: curved triangle on top-center
- Blowhole: small circle/mark on top of head
- Smooth skin: simple fill, no texture pattern

### 7.4 Jellyfish
- Bell: dome/hemisphere, translucent (`opacity="0.3-0.6"`)
- Tentacles: long wavy `<path>` elements hanging down
- Glow: radial gradient + Gaussian blur for bioluminescence

```xml
<g id="jellyfish" transform="translate(100, 30)">
  <defs>
    <radialGradient id="jelly-glow">
      <stop offset="0%" stop-color="#E8DAEF" stop-opacity="0.8"/>
      <stop offset="100%" stop-color="#AF7AC5" stop-opacity="0.3"/>
    </radialGradient>
  </defs>
  <!-- Bell -->
  <path d="M -40 50 Q -45 10, 0 0 Q 45 10, 40 50 Z" fill="url(#jelly-glow)"/>
  <!-- Tentacles -->
  <path d="M -30 50 Q -25 80, -32 110 Q -28 130, -35 160" fill="none" stroke="#BB8FCE" stroke-width="2" opacity="0.5"/>
  <path d="M -10 52 Q -5 90, -12 120 Q -8 150, -15 180" fill="none" stroke="#AF7AC5" stroke-width="1.5" opacity="0.4"/>
  <path d="M 10 52 Q 15 85, 8 115 Q 12 145, 5 175" fill="none" stroke="#BB8FCE" stroke-width="1.5" opacity="0.4"/>
  <path d="M 30 50 Q 35 80, 28 110 Q 32 130, 25 160" fill="none" stroke="#AF7AC5" stroke-width="2" opacity="0.5"/>
</g>
```

## 8. Mythical Creatures

### 8.1 Dragon
Build from real animal parts:
- **Body**: large muscular reptile body (lizard proportions × 3)
- **Wings**: bat-like membrane between elongated finger bones
  - Wing membrane: `<path>` with gradient (base color → semi-transparent at edges)
  - Wing "finger" bones: strong curved `<path>` elements
- **Head**: crocodile skull + horns + brow ridge, elongated snout
- **Scales**: see section 5.3 above
- **Fire breath**: use flame technique from `nature-and-environment.md`
- **Tail**: long, tapered, may have spade tip or spikes

### 8.2 Phoenix
- **Base**: eagle/peacock body proportions
- **Tail**: extremely long flowing feathers (3-5× body length)
- **Colors**: fire palette — gold (#FFD700) base, orange (#FF8C00) mid, red (#FF4500) tips
- **Flame effects**: `feGaussianBlur` glow around wing tips and tail
- **Radiant glow**: radial gradient emanating from body center

### 8.3 Unicorn
- **Base**: horse anatomy (section 1.4)
- **Horn**: spiral cone from forehead, 1-1.5× head length
  - Spiral groove: helical `<path>` wrapping around cone
  - Gradient: base color → shimmering bright tip
- **Mane and tail**: longer, more dramatic flowing curves than normal horse
- **Color**: typically white/silver base with pastel accents (lavender, soft pink)

### 8.4 Mermaid/Merman
- **Upper body**: human character (see `character-illustration.md`)
- **Lower body** (from waist down): fish tail shape
- **Transition zone**: gradual blend at hip, scales begin appearing
- **Tail fin**: large, horizontal fan shape (like whale flukes)
- **Scales**: gradient from skin tone → fish color (teal, blue, green)
- **Hair**: flowing curves suggesting underwater movement (see `hair-details.md`)

## 9. Animal Expressions & Poses

### 9.1 Emotion Through Pose
| Emotion | Posture | Tail | Ears | Face |
|---------|---------|------|------|------|
| Happy | Upright, relaxed | Up, wagging | Forward | Open mouth, "smile" |
| Scared | Crouched low | Tucked under | Flat back | Wide eyes, whites visible |
| Angry | Stiff, forward lean | Raised, stiff | Forward, flat | Bared teeth, narrow eyes |
| Playful | Front down, rear up | High, moving | Perked | Tongue out, bright eyes |
| Sleepy | Curled up | Around body | Drooping | Half-closed eyes |

### 9.2 Eye Expression
- **Alert**: fully open, dilated round pupils
- **Happy**: slightly squinted, soft curve on upper lid
- **Scared**: very wide, whites visible around iris ("whale eye")
- **Angry**: narrowed, focused stare, angled brow
- **Sleepy**: half-closed, heavy upper lids

### 9.3 Tail Language
- **Up and wagging**: happy, excited — draw with motion curve
- **Straight out**: alert, focused — straight `<line>` or slight curve
- **Tucked between legs**: scared — curve down and forward under body
- **Puffed up** (cat): frightened/angry — draw with fuzzy outline edge strokes
- **Curled around body**: relaxed, resting — wrapping `<path>`

### 9.4 Simplified Style Levels
| Style Level | Body | Face | Limbs | Detail |
|------------|------|------|-------|--------|
| Icon/Emoji | One shape | 2 dots + line | None/nubs | Minimal |
| Cartoon | 2-3 shapes | Simple features | Short cylinders | Low |
| Stylized | Proportioned ovals | Expressive | Jointed | Medium |
| Semi-realistic | Anatomical shapes | Detailed | Full skeletal | High |

## 10. Common Mistakes

- **Same-length legs**: front and rear legs often differ in proportion and joint position
- **Straight spine**: real animals always have a curved spine, even when standing still
- **Human-like joints**: animal joints DON'T bend like human joints — check the skeleton
- **Flat ears on alert animal**: alert = ears forward and upright
- **Symmetrical standing pose**: natural stance has slight weight shift
- **Ignoring mass**: heavy animals need thick limbs, light animals need thin ones
- **Fish with vertical tail fin**: only sharks/whales have vertical; most fish tails are vertical too but the motion is horizontal
- **Bird knees bending wrong way**: what looks like a backward knee is actually the ankle (tarsus)

## Related References
- `bezier-and-curves.md` — Curve techniques for organic animal shapes
- `texture-details.md` — Fur and feather texture rendering details
- `character-illustration.md` — Proportions and pose construction (shared anatomy principles)
- `nature-and-environment.md` — Animal habitats, environmental context
- `patterns-and-motifs.md` — Scale, feather, and fur repeating patterns
- `materials-and-textures.md` — Metallic scales, wet surfaces for aquatic creatures
- `lighting-and-shading.md` — Animal fur highlights, subsurface scattering for ears/wings
