# PROJECT_MAP.md - Qibla Direction Finder

> **Last Updated:** 2026-08-19 (v2 - Compass removed, GPS-only approach)
> **Status:** Planning Phase - Awaiting Approval

---

## [TECH_STACK]

| Layer | Technology | Version/Standard | Justification |
|-------|-----------|-----------------|---------------|
| Markup | HTML5 | Living Standard | Semantic structure, `<meta>` viewport |
| Styling | CSS3 | Vanilla (no preprocessors) | Zero build tools, `@media` queries, CSS custom properties |
| Logic | JavaScript (ES2022) | Vanilla (no framework) | Direct DOM manipulation, Geolocation API |
| Maps | OpenStreetMap (Leaflet.js) | v1.9.4 (latest stable Aug 2026) | Free, no API key, tile-based |
| Hosting | Static files only | N/A | Zero backend, open `index.html` in browser |

**External Dependencies (CDN):**
- Leaflet.js 1.9.4 (CSS + JS) — from `unpkg.com` or `cdnjs.cloudflare.com`

**APIs Used:**
- `navigator.geolocation.getCurrentPosition()` — Browser native (requires permission)
- No DeviceOrientationEvent (no compass dependency)
- No backend API calls

**Permission Model:**
- Only 1 permission required: **Geolocation** (browser shows native dialog)
- Fallback: Manual coordinate input if user denies permission

---

## [SYSTEM_FLOW]

```
User Opens Page
       │
       ▼
┌─────────────────┐
│  Load index.html │
│  + CSS + JS      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Request Location │ ◄── Browser Permission Dialog
│ Permission       │
└────────┬────────┘
         │
    ┌────┴────┐
    │ Granted? │
    └────┬────┘
    YES  │  NO
    │    │
    ▼    ▼
┌──────────┐  ┌──────────────────┐
│ Get GPS  │  │ Show Manual Input │
│ Coords   │  │ (Lat + Lng)       │
└────┬─────┘  └────────┬─────────┘
     │                 │
     ▼                 ▼
┌─────────────────────────┐
│ Calculate Qibla Bearing  │
│ (atan2 formula)          │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│ Display Result:          │
│ - Static arrow (bearing) │
│ - Bearing in degrees     │
│ - Map with Kaaba marker  │
└─────────────────────────┘
```

---

## [ARCHITECTURE]

### File Structure

```
QblahDirectionProject/
├── PROJECT_MAP.md          ← This file
├── index.html              ← Entry point, semantic HTML
├── css/
│   └── style.css           ← All styling (responsive)
├── js/
│   ├── qibla.js            ← Core Qibla calculation logic
│   ├── ui.js               ← DOM manipulation & UI updates
│   └── map.js              ← Leaflet map initialization
└── assets/
    └── qibla-icon.svg      ← Compass/Qibla arrow icon
```

### Module Responsibilities

| Module | Responsibility | Dependencies |
|--------|---------------|-------------|
| `index.html` | Structure, CDN links, meta tags | None |
| `css/style.css` | Responsive layout, dark/light theme, arrow styling | None |
| `js/qibla.js` | Pure math: bearing calculation, coordinate validation | None |
| `js/ui.js` | DOM queries, permission handling, display updates | `qibla.js` |
| `js/map.js` | Leaflet map rendering, Kaaba marker | Leaflet CDN |

### Core Algorithm (Qibla Bearing)

```javascript
// Kaaba coordinates (constant)
const KAABA_LAT = 21.4225;
const KAABA_LNG = 39.8262;

function calculateQiblaBearing(userLat, userLng) {
    const lat1 = toRadians(userLat);
    const lat2 = toRadians(KAABA_LAT);
    const dLng = toRadians(KAABA_LNG - userLng);

    const y = Math.sin(dLng) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) -
              Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);

    let bearing = Math.atan2(y, x);
    bearing = toDegrees(bearing);
    return (bearing + 360) % 360; // Normalize to 0-360
}
```

---

## [ORPHANS & PENDING]

### Pending Decisions
- [ ] Whether to include reverse geocoding (city name display)

### Missing
- [ ] No CDN links verified for Leaflet 1.9.4 (to be confirmed during implementation)
- [ ] No favicon or meta description yet

### Decisions Made
- ✅ GPS only (no DeviceOrientationEvent / compass)
- ✅ Static arrow rotated to bearing angle
- ✅ RTL support for Arabic text (not pending)

### Not Included (Scope Boundaries)
- ❌ Backend / server-side logic
- ❌ User accounts or saved locations
- ❌ Prayer time integration
- ❌ Multi-language beyond Arabic/English
- ❌ Offline/PWA support (future milestone)
- ❌ DeviceOrientationEvent / compass hardware dependency

---

## [MILESTONES]

### Milestone 1: Foundation (Goal: Working Qibla calculation)
- [ ] Create `index.html` with semantic structure
- [ ] Implement `qibla.js` with bearing calculation
- [ ] Verify math against known test cases:
  - From Mecca → 0° (already there)
  - From New York → ~58°
  - From London → ~118°

### Milestone 2: UI & Interaction (Goal: User can see direction)
- [ ] Geolocation permission request flow
- [ ] Manual coordinate input fallback
- [ ] Static arrow UI (SVG rotated to bearing angle)
- [ ] Display bearing in degrees + cardinal direction

### Milestone 3: Map Integration (Goal: Visual map with Kaaba)
- [ ] Leaflet map centered on user location
- [ ] Kaaba marker on map
- [ ] Line connecting user → Kaaba

### Milestone 4: Polish (Goal: Production-ready)
- [ ] Responsive design (mobile-first)
- [ ] RTL text support
- [ ] Error handling (location denied, invalid coords)
- [ ] Cross-browser testing

---

## [VERIFIABLE_SUCCESS_CRITERIA]

| Milestone | Success Criteria |
|-----------|-----------------|
| M1 | `calculateQiblaBearing(40.7128, -74.0060)` returns ~58.3° (New York → Mecca) |
| M2 | Page requests location, shows arrow pointing correct direction + degrees display |
| M3 | Map renders with user dot + Kaaba marker + connecting line |
| M4 | Works on Chrome, Firefox, Safari; mobile responsive; RTL text displays correctly |

---

*Awaiting approval to proceed to implementation.*
