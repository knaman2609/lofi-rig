const arts = {
  rainy_window: (
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="rw-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0d1520" />
          <stop offset="100%" stopColor="#091018" />
        </linearGradient>
        <linearGradient id="rw-fog" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1a2a40" stopOpacity="0" />
          <stop offset="100%" stopColor="#1a2a40" stopOpacity="0.3" />
        </linearGradient>
      </defs>
      <rect width="200" height="200" fill="url(#rw-bg)" />
      {/* Window frame */}
      <rect x="30" y="25" width="140" height="150" rx="2" fill="none" stroke="#2a3d55" strokeWidth="6" />
      <line x1="100" y1="25" x2="100" y2="175" stroke="#2a3d55" strokeWidth="3" />
      <line x1="30" y1="100" x2="170" y2="100" stroke="#2a3d55" strokeWidth="3" />
      {/* Rain streaks */}
      {[42, 55, 68, 78, 88, 112, 125, 138, 152, 162].map((x, i) => (
        <line key={i} x1={x} y1={30 + (i % 3) * 12} x2={x - 4} y2={90 + (i % 3) * 12}
          stroke="#4a7aaa" strokeWidth="0.8" strokeOpacity="0.5" />
      ))}
      {[45, 60, 72, 90, 108, 120, 132, 148, 160].map((x, i) => (
        <line key={i} x1={x} y1={105 + (i % 4) * 8} x2={x - 4} y2={165 + (i % 4) * 8}
          stroke="#4a7aaa" strokeWidth="0.6" strokeOpacity="0.4" />
      ))}
      {/* Fog overlay */}
      <rect x="30" y="25" width="140" height="150" fill="url(#rw-fog)" />
      {/* Condensation drops */}
      <circle cx="65" cy="88" r="1.5" fill="#4a7aaa" opacity="0.6" />
      <circle cx="80" cy="92" r="1" fill="#4a7aaa" opacity="0.5" />
      <circle cx="148" cy="78" r="1.5" fill="#4a7aaa" opacity="0.6" />
      <circle cx="135" cy="85" r="1" fill="#4a7aaa" opacity="0.4" />
    </svg>
  ),

  midnight_drift: (
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="md-bg" cx="35%" cy="30%" r="60%">
          <stop offset="0%" stopColor="#0d1830" />
          <stop offset="100%" stopColor="#05080f" />
        </radialGradient>
        <radialGradient id="md-moon" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#c8d8f0" />
          <stop offset="100%" stopColor="#8090b8" />
        </radialGradient>
      </defs>
      <rect width="200" height="200" fill="url(#md-bg)" />
      {/* Moon */}
      <circle cx="130" cy="60" r="30" fill="url(#md-moon)" opacity="0.85" />
      <circle cx="145" cy="52" r="28" fill="#05080f" />
      {/* Stars */}
      {[[40,30],[60,45],[20,55],[75,25],[90,40],[50,70],[25,80],[80,68],[100,20],[35,15],[160,35],[170,55]].map(([x,y],i) => (
        <circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 1.2 : 0.7} fill="#c8d8f0" opacity={0.4 + (i % 3) * 0.2} />
      ))}
      {/* Mist waves */}
      <path d="M0 155 Q50 145 100 155 Q150 165 200 155 L200 200 L0 200z" fill="#0d1830" opacity="0.5" />
      <path d="M0 165 Q50 158 100 165 Q150 172 200 165 L200 200 L0 200z" fill="#0d1830" opacity="0.6" />
      <path d="M0 178 Q60 170 120 178 Q160 183 200 178 L200 200 L0 200z" fill="#050810" opacity="0.8" />
    </svg>
  ),

  dusk_haze: (
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="dh-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0d0810" />
          <stop offset="40%" stopColor="#1a0f18" />
          <stop offset="100%" stopColor="#280f08" />
        </linearGradient>
        <radialGradient id="dh-sun" cx="50%" cy="68%" r="35%">
          <stop offset="0%" stopColor="#c06030" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#c06030" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="200" height="200" fill="url(#dh-sky)" />
      {/* Haze bands */}
      <rect x="0" y="110" width="200" height="6" fill="#c06030" opacity="0.12" />
      <rect x="0" y="120" width="200" height="8" fill="#c06030" opacity="0.18" />
      <rect x="0" y="132" width="200" height="6" fill="#a04020" opacity="0.15" />
      {/* Sun glow */}
      <rect width="200" height="200" fill="url(#dh-sun)" />
      {/* Sun disc partially below horizon */}
      <clipPath id="dh-clip"><rect x="0" y="0" width="200" height="145" /></clipPath>
      <circle cx="100" cy="148" r="22" fill="#d07040" opacity="0.6" clipPath="url(#dh-clip)" />
      <circle cx="100" cy="148" r="15" fill="#e09050" opacity="0.5" clipPath="url(#dh-clip)" />
      {/* Horizon line */}
      <line x1="0" y1="145" x2="200" y2="145" stroke="#804020" strokeWidth="1" opacity="0.4" />
      {/* Ground silhouette */}
      <rect x="0" y="145" width="200" height="55" fill="#0a0608" />
      {/* Distant trees silhouette */}
      <path d="M0 145 L20 130 L30 145 L45 125 L55 145 L70 132 L80 145 L100 128 L110 145 L130 135 L140 145 L160 130 L170 145 L185 138 L200 145" fill="#0a0608" />
    </svg>
  ),

  numb_lofi: (
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="nl-bg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#150d22" />
          <stop offset="100%" stopColor="#0a0812" />
        </radialGradient>
      </defs>
      <rect width="200" height="200" fill="url(#nl-bg)" />
      {/* Concentric ellipses — dreamy, floating */}
      {[70, 58, 46, 34, 22, 12].map((rx, i) => (
        <ellipse key={i} cx="100" cy="105" rx={rx} ry={rx * 0.65}
          fill="none" stroke="#6050a0"
          strokeWidth={0.6 + i * 0.15}
          strokeOpacity={0.1 + i * 0.08} />
      ))}
      {/* Soft ambient orb */}
      <circle cx="100" cy="100" r="18" fill="#4030a0" opacity="0.15" />
      <circle cx="100" cy="100" r="10" fill="#7060c0" opacity="0.12" />
      <circle cx="100" cy="100" r="4" fill="#9080d0" opacity="0.25" />
      {/* Floating small circles */}
      <circle cx="55" cy="70" r="3" fill="#6050a0" opacity="0.2" />
      <circle cx="150" cy="65" r="2" fill="#6050a0" opacity="0.15" />
      <circle cx="40" cy="130" r="2" fill="#6050a0" opacity="0.18" />
      <circle cx="160" cy="140" r="3" fill="#6050a0" opacity="0.15" />
      <circle cx="75" cy="155" r="1.5" fill="#8070c0" opacity="0.2" />
      <circle cx="130" cy="50" r="1.5" fill="#8070c0" opacity="0.2" />
    </svg>
  ),

  crazy_beat: (
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="cb-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#12001a" />
          <stop offset="100%" stopColor="#200008" />
        </linearGradient>
      </defs>
      <rect width="200" height="200" fill="url(#cb-bg)" />
      {/* Equalizer bars */}
      {[
        { x: 20,  h: 80,  c: '#e040a0' },
        { x: 38,  h: 120, c: '#c030e0' },
        { x: 56,  h: 55,  c: '#e040a0' },
        { x: 74,  h: 140, c: '#ff4060' },
        { x: 92,  h: 90,  c: '#e040a0' },
        { x: 110, h: 160, c: '#ff4060' },
        { x: 128, h: 70,  c: '#c030e0' },
        { x: 146, h: 110, c: '#e040a0' },
        { x: 164, h: 45,  c: '#ff4060' },
      ].map(({ x, h, c }, i) => (
        <rect key={i} x={x} y={170 - h} width="14" height={h} rx="2" fill={c} opacity="0.75" />
      ))}
      {/* Beat circle pulse */}
      <circle cx="100" cy="90" r="55" fill="none" stroke="#ff4060" strokeWidth="1" opacity="0.1" />
      <circle cx="100" cy="90" r="38" fill="none" stroke="#e040a0" strokeWidth="0.8" opacity="0.12" />
      {/* Horizontal scan line */}
      <line x1="10" y1="100" x2="190" y2="100" stroke="#ff4060" strokeWidth="0.5" opacity="0.2" strokeDasharray="3 6" />
    </svg>
  ),

  tokyo_drive: (
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="td-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#04030f" />
          <stop offset="100%" stopColor="#0a061a" />
        </linearGradient>
        <linearGradient id="td-road" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0f0a18" />
          <stop offset="100%" stopColor="#05040c" />
        </linearGradient>
      </defs>
      <rect width="200" height="200" fill="url(#td-sky)" />
      {/* City skyline */}
      <rect x="0" y="110" width="25" height="70" fill="#08060f" />
      <rect x="10" y="95" width="12" height="85" fill="#0a0816" />
      <rect x="28" y="120" width="18" height="60" fill="#07050e" />
      <rect x="50" y="90" width="22" height="90" fill="#0a0816" />
      <rect x="55" y="75" width="10" height="105" fill="#08060f" />
      <rect x="78" y="105" width="20" height="75" fill="#0a0816" />
      <rect x="102" y="80" width="28" height="100" fill="#07050e" />
      <rect x="108" y="65" width="14" height="115" fill="#0a0816" />
      <rect x="135" y="100" width="22" height="80" fill="#08060f" />
      <rect x="160" y="85" width="18" height="95" fill="#0a0816" />
      <rect x="180" y="115" width="20" height="65" fill="#07050e" />
      {/* Neon window glows */}
      <rect x="56" y="90" width="3" height="2" fill="#ff40a0" opacity="0.9" />
      <rect x="62" y="82" width="3" height="2" fill="#40c0ff" opacity="0.9" />
      <rect x="109" y="78" width="4" height="2" fill="#ff40a0" opacity="0.8" />
      <rect x="115" y="72" width="3" height="2" fill="#40c0ff" opacity="0.8" />
      <rect x="115" y="85" width="3" height="2" fill="#ff40a0" opacity="0.7" />
      <rect x="30" y="102" width="3" height="2" fill="#40c0ff" opacity="0.7" />
      <rect x="80" y="115" width="3" height="2" fill="#ff40a0" opacity="0.7" />
      <rect x="162" y="95" width="3" height="2" fill="#40c0ff" opacity="0.8" />
      {/* Road */}
      <rect x="0" y="155" width="200" height="45" fill="url(#td-road)" />
      {/* Road markings */}
      <line x1="0" y1="158" x2="200" y2="158" stroke="#ff40a0" strokeWidth="1" opacity="0.25" />
      <line x1="0" y1="163" x2="200" y2="163" stroke="#40c0ff" strokeWidth="0.5" opacity="0.2" />
      {/* Reflection */}
      {[55, 109, 115, 162].map((x, i) => (
        <line key={i} x1={x + 1} y1="158" x2={x + (i % 2 === 0 ? 2 : 1)} y2="185"
          stroke={i % 2 === 0 ? '#ff40a0' : '#40c0ff'} strokeWidth="1.5" opacity="0.15" />
      ))}
    </svg>
  ),

  accra_sunset: (
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="as-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0f0500" />
          <stop offset="50%" stopColor="#2a0d00" />
          <stop offset="100%" stopColor="#400800" />
        </linearGradient>
      </defs>
      <rect width="200" height="200" fill="url(#as-sky)" />
      {/* Bold kente-inspired horizontal stripes */}
      <rect x="0" y="48" width="200" height="12" fill="#d06010" opacity="0.55" />
      <rect x="0" y="64" width="200" height="6"  fill="#f0a020" opacity="0.4" />
      <rect x="0" y="74" width="200" height="12" fill="#c04010" opacity="0.45" />
      {/* Geometric triangles — kente pattern */}
      {[0, 25, 50, 75, 100, 125, 150, 175].map((x, i) => (
        <polygon key={i} points={`${x},88 ${x + 12},88 ${x + 6},76`}
          fill={i % 2 === 0 ? '#f0a020' : '#d06010'} opacity="0.6" />
      ))}
      {/* Large sun */}
      <circle cx="100" cy="120" r="35" fill="#e07020" opacity="0.6" />
      <circle cx="100" cy="120" r="24" fill="#f09030" opacity="0.55" />
      <circle cx="100" cy="120" r="14" fill="#ffb040" opacity="0.6" />
      {/* Horizon */}
      <rect x="0" y="145" width="200" height="55" fill="#08040a" />
      {/* Baobab silhouette */}
      <rect x="88" y="118" width="8" height="30" fill="#08040a" />
      <ellipse cx="92" cy="118" rx="22" ry="12" fill="#08040a" />
      <line x1="92" y1="112" x2="70" y2="100" stroke="#08040a" strokeWidth="4" />
      <line x1="92" y1="112" x2="115" y2="98" stroke="#08040a" strokeWidth="4" />
      <line x1="92" y1="110" x2="80" y2="95" stroke="#08040a" strokeWidth="3" />
      {/* Sun rays */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => {
        const r = deg * Math.PI / 180;
        const x1 = 100 + Math.cos(r) * 38;
        const y1 = 120 + Math.sin(r) * 38;
        const x2 = 100 + Math.cos(r) * 50;
        const y2 = 120 + Math.sin(r) * 50;
        return y2 < 145 ? <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#f09030" strokeWidth="1.5" opacity="0.35" /> : null;
      })}
    </svg>
  ),

  diwali_glow: (
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="dg-bg" cx="50%" cy="55%" r="55%">
          <stop offset="0%" stopColor="#2a1500" />
          <stop offset="100%" stopColor="#0e0600" />
        </radialGradient>
        <radialGradient id="dg-glow" cx="50%" cy="60%" r="40%">
          <stop offset="0%" stopColor="#d4a030" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#d4a030" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="200" height="200" fill="url(#dg-bg)" />
      <rect width="200" height="200" fill="url(#dg-glow)" />
      {/* Mandala rings */}
      <circle cx="100" cy="100" r="72" fill="none" stroke="#d4a030" strokeWidth="0.5" strokeDasharray="3 9" opacity="0.35" />
      <circle cx="100" cy="100" r="56" fill="none" stroke="#d4a030" strokeWidth="0.5" strokeDasharray="2 6" opacity="0.3" />
      <circle cx="100" cy="100" r="40" fill="none" stroke="#c8902a" strokeWidth="0.8" opacity="0.4" />
      <circle cx="100" cy="100" r="24" fill="none" stroke="#d4a030" strokeWidth="0.6" opacity="0.5" />
      {/* Petal shapes at 8 directions */}
      {[0,45,90,135,180,225,270,315].map((deg, i) => {
        const r = deg * Math.PI / 180;
        const cx = 100 + Math.cos(r) * 40;
        const cy = 100 + Math.sin(r) * 40;
        return <circle key={i} cx={cx} cy={cy} r="4" fill="#d4a030" opacity="0.3" />;
      })}
      {/* Diya body */}
      <ellipse cx="100" cy="120" rx="18" ry="8" fill="#3a1e00" stroke="#c8902a" strokeWidth="1" />
      {/* Wick */}
      <line x1="100" y1="112" x2="100" y2="106" stroke="#c8902a" strokeWidth="1.5" />
      {/* Flame */}
      <path d="M100 106 C94 96 90 86 100 78 C110 86 106 96 100 106z" fill="#f5c030" opacity="0.95" />
      <path d="M100 104 C97 96 94 90 100 85 C106 90 103 96 100 104z" fill="#fff8e0" opacity="0.6" />
      {/* Sparkles */}
      {[[68,65],[132,65],[55,105],[145,105],[82,50],[118,50],[50,85],[150,85]].map(([x,y],i) => (
        <circle key={i} cx={x} cy={y} r={i < 4 ? 1.5 : 1} fill="#f5c030" opacity={0.4 + (i % 3) * 0.15} />
      ))}
    </svg>
  ),

  yaman_evening: (
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="ye-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0a0515" />
          <stop offset="100%" stopColor="#180d05" />
        </linearGradient>
        <radialGradient id="ye-glow" cx="55%" cy="50%" r="40%">
          <stop offset="0%" stopColor="#c08060" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#c08060" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="200" height="200" fill="url(#ye-bg)" />
      <rect width="200" height="200" fill="url(#ye-glow)" />
      {/* Sitar body — large teardrop */}
      <ellipse cx="105" cy="130" rx="30" ry="38" fill="#1a0e04" stroke="#c08060" strokeWidth="1" opacity="0.9" />
      {/* Sitar neck */}
      <rect x="98" y="35" width="10" height="100" rx="5" fill="#120a03" stroke="#c08060" strokeWidth="0.8" opacity="0.8" />
      {/* Tuning pegs */}
      {[50, 62, 74, 86].map((y, i) => (
        <circle key={i} cx={i % 2 === 0 ? 94 : 112} cy={y} r="3" fill="#c08060" opacity="0.6" />
      ))}
      {/* Strings */}
      {[101, 104, 107, 110].map((x, i) => (
        <line key={i} x1={x} y1="40" x2={x} y2="165" stroke="#c08060" strokeWidth="0.4" opacity="0.5" />
      ))}
      {/* Sound hole */}
      <circle cx="105" cy="130" r="8" fill="none" stroke="#c08060" strokeWidth="0.6" opacity="0.5" />
      {/* Evening stars */}
      {[[35,30],[60,22],[25,55],[165,28],[175,50],[155,60],[40,75],[170,80]].map(([x,y],i) => (
        <circle key={i} cx={x} cy={y} r={i % 2 === 0 ? 1 : 0.7} fill="#c8a070" opacity={0.3 + (i%3)*0.15} />
      ))}
      {/* Crescent moon */}
      <circle cx="155" cy="38" r="14" fill="#c8a070" opacity="0.25" />
      <circle cx="162" cy="34" r="13" fill="#0a0515" />
    </svg>
  ),

  malkauns_night: (
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="mn-bg" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#07061a" />
          <stop offset="100%" stopColor="#020210" />
        </radialGradient>
      </defs>
      <rect width="200" height="200" fill="url(#mn-bg)" />
      {/* Temple spire silhouette */}
      <polygon points="100,30 118,120 82,120" fill="#08070e" />
      <rect x="76" y="120" width="48" height="60" fill="#08070e" />
      <ellipse cx="100" cy="120" rx="24" ry="6" fill="#08070e" />
      <polygon points="100,20 104,35 96,35" fill="#0f0e20" />
      {/* Pentatonic 5-star constellation */}
      {[
        [45,  45],
        [80,  28],
        [120, 42],
        [155, 30],
        [168, 70],
      ].map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="2.5" fill="#8090d0" opacity="0.8" />
          {i > 0 && (
            <line x1={[[45,45],[80,28],[120,42],[155,30],[168,70]][i-1][0]}
                  y1={[[45,45],[80,28],[120,42],[155,30],[168,70]][i-1][1]}
                  x2={x} y2={y}
                  stroke="#8090d0" strokeWidth="0.5" opacity="0.25" />
          )}
        </g>
      ))}
      {/* Scattered background stars */}
      {[[20,20],[35,65],[165,55],[175,90],[30,100],[15,140],[40,160],[170,130],[155,150]].map(([x,y],i) => (
        <circle key={i} cx={x} cy={y} r="0.7" fill="#8090d0" opacity={0.2 + (i%3)*0.1} />
      ))}
      {/* Full moon glow far back */}
      <circle cx="162" cy="52" r="18" fill="#6070b0" opacity="0.08" />
    </svg>
  ),

  monsoon_raga: (
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="mr-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#060e0a" />
          <stop offset="100%" stopColor="#0a140e" />
        </linearGradient>
        <radialGradient id="mr-ripple" cx="50%" cy="75%" r="35%">
          <stop offset="0%" stopColor="#2a7050" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#2a7050" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="200" height="200" fill="url(#mr-bg)" />
      {/* Rain drops */}
      {[[40,25],[65,15],[90,30],[115,10],[140,20],[160,35],[30,55],[75,48],[100,60],[130,50],[155,65],[45,80],[170,75]].map(([x,y],i) => (
        <ellipse key={i} cx={x} cy={y} rx="1.2" ry="3.5" fill="#4a9070" opacity={0.3 + (i%3)*0.15} />
      ))}
      {/* Cloud shape */}
      <ellipse cx="100" cy="45" rx="55" ry="22" fill="#0d1a12" opacity="0.9" />
      <ellipse cx="70" cy="42" rx="30" ry="18" fill="#0d1a12" opacity="0.9" />
      <ellipse cx="135" cy="43" rx="28" ry="16" fill="#0d1a12" opacity="0.9" />
      {/* Ripple circles on water */}
      {[30, 22, 14, 7].map((r, i) => (
        <ellipse key={i} cx="100" cy="155" rx={r * 2.5} ry={r * 0.8}
          fill="none" stroke="#2a7050" strokeWidth="0.7" strokeOpacity={0.15 + i * 0.1} />
      ))}
      {/* Lotus */}
      <ellipse cx="100" cy="160" rx="18" ry="6" fill="#1a3028" />
      {[0,36,72,108,144,180,216,252,288,324].map((deg, i) => {
        const rad = deg * Math.PI / 180;
        const px = 100 + Math.cos(rad) * 14;
        const py = 160 + Math.sin(rad) * 5;
        return <ellipse key={i} cx={px} cy={py} rx="5" ry="8"
          fill="#3a7055" opacity="0.6"
          transform={`rotate(${deg + 90}, ${px}, ${py})`} />;
      })}
      <circle cx="100" cy="157" r="5" fill="#f0d060" opacity="0.5" />
    </svg>
  ),

  seville_dusk: (
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="sd-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0f0500" />
          <stop offset="60%" stopColor="#280a00" />
          <stop offset="100%" stopColor="#380e00" />
        </linearGradient>
        <radialGradient id="sd-glow" cx="50%" cy="70%" r="50%">
          <stop offset="0%" stopColor="#c05020" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#c05020" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="200" height="200" fill="url(#sd-sky)" />
      <rect width="200" height="200" fill="url(#sd-glow)" />
      {/* Moorish arch — outer pointed arch */}
      <path d="M50 175 L50 110 Q50 50 100 50 Q150 50 150 110 L150 175z"
        fill="none" stroke="#c05020" strokeWidth="2" opacity="0.7" />
      <path d="M62 175 L62 112 Q62 66 100 66 Q138 66 138 112 L138 175z"
        fill="#0f0500" opacity="0.95" />
      {/* Inner arch highlight */}
      <path d="M62 175 L62 112 Q62 66 100 66 Q138 66 138 112 L138 175z"
        fill="none" stroke="#c05020" strokeWidth="0.8" opacity="0.4" />
      {/* Mosaic tile pattern inside arch */}
      {[80, 100, 120].map(y =>
        [70, 90, 110, 130].map((x, j) => (
          <rect key={`${x}-${y}`} x={x} y={y} width="10" height="10" rx="1"
            fill="none" stroke="#c05020" strokeWidth="0.5" opacity="0.2" />
        ))
      )}
      {/* Horizon line */}
      <line x1="0" y1="155" x2="200" y2="155" stroke="#c05020" strokeWidth="1" opacity="0.3" />
      {/* Distant minaret */}
      <rect x="160" y="100" width="14" height="55" fill="#0f0500" opacity="0.9" />
      <polygon points="167,88 175,100 159,100" fill="#0f0500" opacity="0.9" />
      <circle cx="167" cy="87" r="3" fill="#c05020" opacity="0.5" />
      {/* Stars */}
      {[[25,30],[45,20],[170,25],[185,45],[20,60],[178,70]].map(([x,y],i) => (
        <circle key={i} cx={x} cy={y} r="1" fill="#f0a060" opacity={0.25 + (i%3)*0.1} />
      ))}
    </svg>
  ),
};

export function TrackArtwork({ id }) {
  return (
    <div className="track-art">
      {arts[id] ?? (
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <rect width="200" height="200" fill="#15110d" />
          <circle cx="100" cy="100" r="40" fill="none" stroke="#4a4239" strokeWidth="1" />
        </svg>
      )}
    </div>
  );
}
