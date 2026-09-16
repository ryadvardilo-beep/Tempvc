import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const buttons = [
  {
    id: 'lock',
    name: 'sek_lock',
    label: 'LOCK',
    glowColor: '#00f0ff',
    accentColor: '#bc13fe',
    innerSvg: `
      <!-- Shield Outer -->
      <path d="M 64 26 C 76 26, 88 32, 90 42 C 90 64, 76 80, 64 88 C 52 80, 38 64, 38 42 C 40 32, 52 26, 64 26 Z" 
            fill="none" stroke="url(#cyanPurple)" stroke-width="4.5" stroke-linejoin="round" filter="url(#glow)"/>
      <path d="M 64 32 C 73 32, 82 36, 84 44 C 84 60, 73 73, 64 80 C 55 73, 44 60, 44 44 C 46 36, 55 32, 64 32 Z" 
            fill="#08142c" opacity="0.6"/>
      <!-- Padlock Body inside Shield -->
      <rect x="52" y="52" width="24" height="20" rx="3.5" fill="url(#cyanPurple)" filter="url(#glowLight)"/>
      <!-- Padlock Shackle -->
      <path d="M 56 52 L 56 44 C 56 39, 72 39, 72 44 L 72 52" 
            fill="none" stroke="#00f0ff" stroke-width="3.5" stroke-linecap="round"/>
      <!-- Keyhole -->
      <circle cx="64" cy="60" r="2.5" fill="#060c1c"/>
      <path d="M 63 60 L 62 67 L 66 67 L 65 60 Z" fill="#060c1c"/>
    `,
  },
  {
    id: 'unlock',
    name: 'sek_unlock',
    label: 'UNLOCK',
    glowColor: '#00f0ff',
    accentColor: '#bc13fe',
    innerSvg: `
      <!-- Open Padlock Body -->
      <rect x="50" y="48" width="28" height="24" rx="4" fill="url(#cyanPurple)" filter="url(#glow)"/>
      <!-- Open Padlock Shackle (lifted and turned) -->
      <path d="M 55 48 L 55 38 C 55 30, 73 30, 73 36 L 73 40" 
            fill="none" stroke="#00f0ff" stroke-width="4" stroke-linecap="round" filter="url(#glow)"/>
      <!-- Keyhole -->
      <circle cx="64" cy="57" r="3" fill="#060c1c"/>
      <path d="M 62.5 57 L 61 66 L 67 66 L 65.5 57 Z" fill="#060c1c"/>
    `,
  },
  {
    id: 'trust',
    name: 'sek_trust',
    label: 'TRUST',
    glowColor: '#00f0ff',
    accentColor: '#bc13fe',
    innerSvg: `
      <!-- Small Top Shield with Checkmark -->
      <path d="M 64 26 C 71 26, 76 29, 77 35 C 77 44, 71 50, 64 53 C 57 50, 51 44, 51 35 C 52 29, 57 26, 64 26 Z" 
            fill="#091836" stroke="#00f0ff" stroke-width="2.5" filter="url(#glowLight)"/>
      <path d="M 59 36 L 63 40 L 70 33" fill="none" stroke="#00f0ff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      <!-- Handshake Graphic -->
      <!-- Left Hand / Cuff -->
      <path d="M 37 68 L 47 56 L 55 63 L 45 74 Z" fill="url(#cyanPurple)" stroke="#00f0ff" stroke-width="2"/>
      <!-- Right Hand / Cuff -->
      <path d="M 91 68 L 81 56 L 73 63 L 83 74 Z" fill="url(#cyanPurple)" stroke="#bc13fe" stroke-width="2"/>
      <!-- Clasping Fingers Center -->
      <path d="M 52 61 C 56 57, 63 56, 68 59 L 75 66 C 73 70, 67 73, 62 70 Z" 
            fill="url(#cyanPurple)" stroke="#00f0ff" stroke-width="2.5" filter="url(#glowLight)"/>
      <path d="M 55 66 L 70 66" stroke="#060c1c" stroke-width="2"/>
      <path d="M 57 70 L 68 70" stroke="#060c1c" stroke-width="2"/>
      <path d="M 60 74 L 66 74" stroke="#060c1c" stroke-width="1.8"/>
    `,
  },
  {
    id: 'block',
    name: 'sek_block',
    label: 'BLOCK',
    glowColor: '#00f0ff',
    accentColor: '#bc13fe',
    innerSvg: `
      <!-- Circular Forbidden Ring -->
      <circle cx="64" cy="56" r="28" fill="#08142c" stroke="url(#cyanPurple)" stroke-width="4" filter="url(#glow)"/>
      <!-- Diagonal Slashes / Inner Ring -->
      <circle cx="64" cy="56" r="22" fill="none" stroke="#00f0ff" stroke-width="1.5" stroke-dasharray="4 2"/>
      <!-- Stop Hand Palm -->
      <!-- Palm Base -->
      <rect x="56" y="55" width="16" height="15" rx="3" fill="url(#cyanPurple)" filter="url(#glowLight)"/>
      <!-- Thumb -->
      <path d="M 56 62 L 50 58 C 48 56, 50 53, 53 54 L 56 57 Z" fill="url(#cyanPurple)"/>
      <!-- 4 Fingers -->
      <rect x="54.5" y="40" width="3.5" height="17" rx="1.7" fill="#00f0ff"/>
      <rect x="59.5" y="37" width="3.5" height="20" rx="1.7" fill="#00f0ff"/>
      <rect x="64.5" y="38" width="3.5" height="19" rx="1.7" fill="#00f0ff"/>
      <rect x="69.5" y="42" width="3.5" height="15" rx="1.7" fill="#00f0ff"/>
    `,
  },
  {
    id: 'rename',
    name: 'sek_rename',
    label: 'RENAME',
    glowColor: '#00f0ff',
    accentColor: '#bc13fe',
    innerSvg: `
      <!-- Slanted Stylus / Pencil -->
      <g transform="rotate(-40 60 52)">
        <!-- Eraser Cap -->
        <rect x="38" y="47" width="8" height="12" rx="2" fill="#bc13fe" stroke="#00f0ff" stroke-width="1.5"/>
        <!-- Pencil Shaft -->
        <rect x="46" y="47" width="32" height="12" fill="url(#cyanPurple)" stroke="#00f0ff" stroke-width="2" filter="url(#glowLight)"/>
        <!-- Stripe along shaft -->
        <line x1="46" y1="53" x2="78" y2="53" stroke="#00f0ff" stroke-width="1.5"/>
        <!-- Tip Cone -->
        <polygon points="78,47 88,53 78,59" fill="#00f0ff"/>
        <!-- Graphite Point -->
        <polygon points="85,51.5 88,53 85,54.5" fill="#060c1c"/>
      </g>
      <!-- "NAME" Cyber Text -->
      <text x="76" y="74" fill="#00f0ff" font-family="'Orbitron', 'Chakra Petch', sans-serif" font-weight="900" font-size="12" letter-spacing="1" text-anchor="middle" filter="url(#glowLight)">NAME</text>
    `,
  },
  {
    id: 'limit',
    name: 'sek_limit',
    label: 'LIMIT',
    glowColor: '#00f0ff',
    accentColor: '#bc13fe',
    innerSvg: `
      <!-- Speedometer Gauge Outer Arc -->
      <path d="M 38 68 A 28 28 0 1 1 90 68" fill="none" stroke="url(#cyanPurple)" stroke-width="5" stroke-linecap="round" filter="url(#glow)"/>
      <path d="M 43 65 A 22 22 0 1 1 85 65" fill="none" stroke="#00f0ff" stroke-width="1.5" stroke-dasharray="2 4"/>
      <!-- Gauge Needle -->
      <circle cx="64" cy="62" r="5" fill="#bc13fe" stroke="#00f0ff" stroke-width="2"/>
      <line x1="64" y1="62" x2="78" y2="44" stroke="#00f0ff" stroke-width="3.5" stroke-linecap="round" filter="url(#glowLight)"/>
      <!-- "LIMIT" Cyber Text -->
      <text x="64" y="75" fill="#00f0ff" font-family="'Orbitron', 'Chakra Petch', sans-serif" font-weight="900" font-size="10" letter-spacing="1" text-anchor="middle" filter="url(#glowLight)">LIMIT</text>
    `,
  },
  {
    id: 'kick',
    name: 'sek_kick',
    label: 'KICK',
    glowColor: '#00f0ff',
    accentColor: '#bc13fe',
    innerSvg: `
      <!-- Combat Boot Side Profile -->
      <g transform="translate(10, 2)">
        <!-- Boot Leg Shaft -->
        <path d="M 40 30 L 58 30 L 58 52 L 78 57 C 82 58, 83 63, 80 67 L 76 71 L 34 71 C 32 67, 33 60, 36 53 Z" 
              fill="#08142c" stroke="url(#cyanPurple)" stroke-width="3.5" stroke-linejoin="round" filter="url(#glow)"/>
        <!-- Sole & Rugged Treads -->
        <rect x="32" y="71" width="48" height="6" rx="2" fill="url(#cyanPurple)" stroke="#00f0ff" stroke-width="1.5" filter="url(#glowLight)"/>
        <!-- Tread notches -->
        <line x1="38" y1="74" x2="38" y2="77" stroke="#060c1c" stroke-width="2"/>
        <line x1="46" y1="74" x2="46" y2="77" stroke="#060c1c" stroke-width="2"/>
        <line x1="54" y1="74" x2="54" y2="77" stroke="#060c1c" stroke-width="2"/>
        <line x1="62" y1="74" x2="62" y2="77" stroke="#060c1c" stroke-width="2"/>
        <line x1="70" y1="74" x2="70" y2="77" stroke="#060c1c" stroke-width="2"/>
        <!-- Boot Laces / Rings -->
        <line x1="48" y1="36" x2="54" y2="36" stroke="#00f0ff" stroke-width="2.5" stroke-linecap="round"/>
        <line x1="48" y1="42" x2="54" y2="42" stroke="#00f0ff" stroke-width="2.5" stroke-linecap="round"/>
        <line x1="48" y1="48" x2="55" y2="48" stroke="#00f0ff" stroke-width="2.5" stroke-linecap="round"/>
      </g>
      <!-- "KICK" Cyber Text -->
      <text x="82" y="47" fill="#00f0ff" font-family="'Orbitron', 'Chakra Petch', sans-serif" font-weight="900" font-size="11" letter-spacing="1" text-anchor="middle" filter="url(#glowLight)">KICK</text>
    `,
  },
  {
    id: 'admin',
    name: 'sek_admin',
    label: 'ADMIN',
    glowColor: '#00f0ff',
    accentColor: '#bc13fe',
    innerSvg: `
      <!-- Royal Spiked Crown Top -->
      <path d="M 44 38 L 47 28 L 56 34 L 64 24 L 72 34 L 81 28 L 84 38 Z" 
            fill="url(#cyanPurple)" stroke="#00f0ff" stroke-width="2.5" stroke-linejoin="round" filter="url(#glowLight)"/>
      <circle cx="47" cy="27" r="1.8" fill="#00f0ff"/>
      <circle cx="64" cy="23" r="2.2" fill="#00f0ff"/>
      <circle cx="81" cy="27" r="1.8" fill="#00f0ff"/>
      <!-- Admin Shield Bottom -->
      <path d="M 64 42 C 77 42, 84 46, 84 57 C 84 72, 73 82, 64 87 C 55 82, 44 72, 44 57 C 44 46, 51 42, 64 42 Z" 
            fill="#08142c" stroke="url(#cyanPurple)" stroke-width="3.5" filter="url(#glow)"/>
      <!-- Letter "A" -->
      <text x="64" y="73" fill="#00f0ff" font-family="'Orbitron', 'Chakra Petch', sans-serif" font-weight="900" font-size="26" text-anchor="middle" filter="url(#glowLight)">A</text>
    `,
  },
];

// Generates the complete stand-alone button as seen in IMG_4851 (Octagonal Chassis + Icon + Trapezoid Label)
function generateFullButtonSvg(btn) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="256" height="300" viewBox="0 0 128 150" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Linear Gradients -->
    <linearGradient id="cyanPurple" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#00f0ff" />
      <stop offset="60%" stop-color="#3b82f6" />
      <stop offset="100%" stop-color="#bc13fe" />
    </linearGradient>
    <linearGradient id="purpleCyan" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#bc13fe" />
      <stop offset="100%" stop-color="#00f0ff" />
    </linearGradient>
    <linearGradient id="darkChassis" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#0b162c" />
      <stop offset="100%" stop-color="#040814" />
    </linearGradient>
    <!-- Glow Filters -->
    <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="3.5" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
    <filter id="glowLight" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="1.8" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>

  <!-- Background Cyber Circuit Accents (Subtle) -->
  <rect width="128" height="150" fill="transparent"/>

  <!-- ================= TOP OCTAGONAL CHASSIS ================= -->
  <!-- Outer Glow Shadow -->
  <polygon points="38,10 90,10 118,38 118,72 90,100 38,100 10,72 10,38" 
           fill="none" stroke="#00f0ff" stroke-width="3" opacity="0.4" filter="url(#glow)"/>

  <!-- Outer Beveled Chassis -->
  <polygon points="38,10 90,10 118,38 118,72 90,100 38,100 10,72 10,38" 
           fill="url(#darkChassis)" stroke="#00f0ff" stroke-width="2.5" stroke-linejoin="round"/>

  <!-- Top & Bottom Cyan Accent Bars -->
  <line x1="46" y1="10" x2="82" y2="10" stroke="#00f0ff" stroke-width="4.5" filter="url(#glowLight)"/>
  <line x1="46" y1="100" x2="82" y2="100" stroke="#00f0ff" stroke-width="4.5" filter="url(#glowLight)"/>

  <!-- Inner Octagonal Bevel (Purple / Neon Magenta) -->
  <polygon points="40,16 88,16 112,40 112,70 88,94 40,94 16,70 16,40" 
           fill="#060c1a" stroke="#bc13fe" stroke-width="2.5" stroke-linejoin="round" filter="url(#glowLight)"/>

  <!-- High-Tech Corner Notches / Grips -->
  <rect x="7" y="52" width="6" height="6" rx="1.5" fill="#00f0ff" filter="url(#glowLight)"/>
  <rect x="115" y="52" width="6" height="6" rx="1.5" fill="#00f0ff" filter="url(#glowLight)"/>

  <!-- Inner Artwork for this Button -->
  <g transform="translate(0, 0)">
    ${btn.innerSvg}
  </g>

  <!-- ================= BOTTOM TRAPEZOID PLAQUE ================= -->
  <!-- Connector Joint between Chassis and Plaque -->
  <rect x="56" y="101" width="16" height="5" fill="#00f0ff" opacity="0.8" filter="url(#glowLight)"/>

  <!-- Trapezoid Outer Glow -->
  <polygon points="20,108 108,108 118,138 10,138" 
           fill="none" stroke="#00f0ff" stroke-width="2" opacity="0.5" filter="url(#glow)"/>

  <!-- Trapezoid Body -->
  <polygon points="20,108 108,108 118,138 10,138" 
           fill="url(#darkChassis)" stroke="#00f0ff" stroke-width="2" stroke-linejoin="round"/>

  <!-- Inner Bevel on Plaque -->
  <polygon points="23,111 105,111 114,135 14,135" 
           fill="#040813" stroke="#bc13fe" stroke-width="1.2" opacity="0.8"/>

  <!-- Text Label -->
  <text x="64" y="128" 
        fill="#ffffff" 
        font-family="'Orbitron', 'Rajdhani', 'Chakra Petch', sans-serif" 
        font-weight="900" 
        font-size="14" 
        letter-spacing="2" 
        text-anchor="middle"
        filter="url(#glowLight)">${btn.label}</text>
</svg>`;
}

// Generates square 1:1 icon version ideal for Discord custom emoji (128x128)
function generateSquareEmojiSvg(btn) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="128" height="128" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="cyanPurple" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#00f0ff" />
      <stop offset="60%" stop-color="#3b82f6" />
      <stop offset="100%" stop-color="#bc13fe" />
    </linearGradient>
    <linearGradient id="darkChassis" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#0b162c" />
      <stop offset="100%" stop-color="#040814" />
    </linearGradient>
    <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="3.5" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
    <filter id="glowLight" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="1.8" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>

  <!-- Outer Octagon Chassis -->
  <polygon points="42,12 86,12 116,42 116,86 86,116 42,116 12,86 12,42" 
           fill="url(#darkChassis)" stroke="#00f0ff" stroke-width="3" stroke-linejoin="round" filter="url(#glowLight)"/>

  <!-- Top & Bottom Accent Brackets -->
  <line x1="48" y1="12" x2="80" y2="12" stroke="#00f0ff" stroke-width="5" filter="url(#glowLight)"/>
  <line x1="48" y1="116" x2="80" y2="116" stroke="#00f0ff" stroke-width="5" filter="url(#glowLight)"/>

  <!-- Inner Octagon (Magenta) -->
  <polygon points="44,18 84,18 110,44 110,84 84,110 44,110 18,84 18,44" 
           fill="#060c1a" stroke="#bc13fe" stroke-width="3" stroke-linejoin="round"/>

  <!-- Left and Right Notches -->
  <rect x="9" y="60" width="6" height="8" rx="1.5" fill="#00f0ff" filter="url(#glowLight)"/>
  <rect x="113" y="60" width="6" height="8" rx="1.5" fill="#00f0ff" filter="url(#glowLight)"/>

  <!-- Inner Graphic centered -->
  <g transform="translate(0, 8)">
    ${btn.innerSvg}
  </g>
</svg>`;
}

async function main() {
  const publicButtonsDir = path.join(process.cwd(), 'public', 'buttons');
  const publicEmojisDir = path.join(process.cwd(), 'public', 'emojis');

  fs.mkdirSync(publicButtonsDir, { recursive: true });
  fs.mkdirSync(publicEmojisDir, { recursive: true });

  console.log('Generating 8 Cyberpunk Buttons matching user photo...');

  for (const btn of buttons) {
    // 1. Full Button (Chassis + Plaque + Label)
    const fullSvg = generateFullButtonSvg(btn);
    const fullSvgPath = path.join(publicButtonsDir, `${btn.id}.svg`);
    const fullPngPath = path.join(publicButtonsDir, `${btn.id}.png`);
    fs.writeFileSync(fullSvgPath, fullSvg);

    await sharp(Buffer.from(fullSvg))
      .resize(256, 300)
      .png()
      .toFile(fullPngPath);

    // 2. Square Emoji (for Discord Guild Emojis)
    const emojiSvg = generateSquareEmojiSvg(btn);
    const emojiSvgPath = path.join(publicEmojisDir, `${btn.name}.svg`);
    const emojiPngPath = path.join(publicEmojisDir, `${btn.name}.png`);
    fs.writeFileSync(emojiSvgPath, emojiSvg);

    await sharp(Buffer.from(emojiSvg))
      .resize(128, 128)
      .png()
      .toFile(emojiPngPath);

    console.log(`✓ Generated ${btn.label} -> ${btn.id}.png & ${btn.name}.png`);
  }

  // Also create a combined 8-button strip matching IMG_4851.jpeg!
  const stripWidth = 256 * 8;
  const stripHeight = 300;

  const composites = buttons.map((btn, index) => ({
    input: path.join(publicButtonsDir, `${btn.id}.png`),
    top: 0,
    left: index * 256,
  }));

  await sharp({
    create: {
      width: stripWidth,
      height: stripHeight,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite(composites)
    .png()
    .toFile(path.join(publicButtonsDir, 'buttons_strip.png'));

  console.log('✓ Generated buttons_strip.png');
}

main().catch(console.error);
