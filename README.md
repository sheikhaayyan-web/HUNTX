# HUNTX — THE ULTIMATE OUTDOOR HUNT

> **A Real-Life Competitive Multiplayer Hunters vs Runners Outdoor Esports Gaming Platform**

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)]()
[![Platform](https://img.shields.io/badge/platform-Android%20%7C%20iOS%20%7C%20Web-orange)]()
[![Database](https://img.shields.io/badge/database-PostgreSQL%20%7C%20Supabase-blue)]()
[![Design](https://img.shields.io/badge/style-Competitive%20Esports-FF8A00)]()

---

## 1. Brand Identity & Design System

- **Primary Background**: Black (`#0A0A0A`)
- **Secondary Background**: Dark Charcoal (`#171717`)
- **Accent Highlight**: Safety Orange (`#FF8A00`)
- **Borders & Framing**: Dark Grey (`#303030`)
- **Hunters Team Tone**: Crimson / Red (`#EF4444`)
- **Runners Team Tone**: Cyber Emerald (`#10B981`)
- **Spectators Team Tone**: Electric Violet (`#8B5CF6`)
- **Typography**: `Rajdhani` (Headers & Callouts), `Teko` (Esports Logos), `Inter` (UI Body)

---

## 2. Key Architecture & Features

### A. Dual Backend Realtime Engine
- **Supabase Integration**: Native connection for PostgreSQL database, Supabase Auth, Row-Level-Security (RLS), and Realtime Postgres replication.
- **Local Multi-Client Broadcast Engine**: HUNTX comes built-in with an instant zero-latency multi-client synchronizer (using `BroadcastChannel` and storage events) allowing multiple browser tabs, windows, or local devices to play simultaneously as separate Hunters and Runners without requiring an initial cloud database setup!

### B. User Authentication & Guest Mode
- **Registered Accounts**: Email & password authentication, password recovery, persistent player combat history, win/loss records, lifetime captures, and host privileges.
- **Expiring Guest Mode**: Casual players can jump straight into a match without passwords. Generates a temporary player ID, display name, and unique runner QR token. Guest profiles automatically expire in 24 hours. Only registered accounts can host rooms.

### C. Roles & Permissions Hierarchy
- **Main Host**: Room creator, controls game modes, timers, team allocations, zone drafting, stages, emergency pause, referee disputes, and match termination.
- **Co-Host**: Granted secondary referee controls to approve captures and monitor fair play.
- **Hunters**: Equipped with the optical QR scanner, radar map showing permitted teammate positions, and target tracking.
- **Runners**: Equipped with a unique cryptographic QR pass, zone boundary radar, outside-zone emergency warning countdowns, and survival timers.
- **Spectators**: Broadcast spectator screen displaying match status and live leaderboards without revealing secret runner positions.

### D. QR Code Capture & Verification System
- **Tamper-Evident QR Tokens**: Unique per player, session, and game instance.
- **Hunter Camera Scanner**: In-browser camera scanning powered by `Html5Qrcode` with visual laser aim, manual token input fallback, and a developer 1-click test simulation selector.
- **Capture Verification Modes**:
  - **Mode B (Runner Confirmation)**: Hunter scans Runner's QR pass; the Runner receives an audible prompt on their phone to confirm or dispute the tag.
  - **Mode C (Host Approval)**: Capture claims are forwarded to the Host's referee terminal for review.
  - **Instant Tag**: Immediate optical capture confirmation.
- **Capture Outcome Rules**:
  - **Elimination**: Runner leaves active play.
  - **Team Switch (Infection)**: Captured Runner switches teams and becomes an active Hunter!
  - **Waiting Area**: Detained until referee release.
  - **Custom**: Host-configured penalty.

### E. Dynamic Shrinking Zone Engine
- **Circle & Polygon Support**: Draw circular boundaries with customizable radius or click on the map to draft complex custom polygons.
- **Safe Inward Contraction Algorithm**: Mathematical centroid scaling contracts custom polygons inward smoothly between stages, preventing edge inversions, self-intersections, or accidental expansions.
- **Unlimited Shrink Stages**: Configure trigger times, contraction duration, and target size ratios.
- **Outside Safe Zone Emergency Warning System**:
  - Detects if player coordinates fall outside the safe zone boundary using Haversine distance for circles and Jordan curve ray-casting for polygons.
  - Triggers an aggressive audible warning alarm (Web Audio procedural synthesizer).
  - Displays a red flashing boundary alert with a 30-second return grace countdown.
  - Automatically executes penalties (penalty point, 60s freeze, or elimination) if the player does not return inside.

### F. Location Sharing & Fair-Play Privacy
- Optional GPS location sharing with explicit player consent.
- Team-based visibility settings ensure Runners' exact positions are not leaked to Hunters or Spectators.

---

## 3. Screen Catalogue (All 28 Required Screens Implemented)

| # | Screen | Description |
|---|---|---|
| 1 | **Splash Screen** | High-energy esports logo, sensor calibration loading bar |
| 2 | **Welcome Screen** | Esports introduction, Hunters vs Runners summary, action selection |
| 3 | **Login Screen** | Supabase email authentication, password reset |
| 4 | **Registration Screen** | Operator call-sign, username, email registration |
| 5 | **Guest Join Screen** | One-click guest entry with 24h temporary pass |
| 6 | **Home Dashboard** | Stats summary (Win rate, captures, escapes), quick host/join cards |
| 7 | **Create Game Screen** | Room title, mode selector, duration, head-start slider, room code generator |
| 8 | **Join Game Screen** | 6-letter room code entry with automatic capitalization |
| 9 | **Game Lobby** | Live player roster, team lists, ready status, invite code copy |
| 10 | **Team Management** | Squad balancing, manual Hunter/Runner reallocation, co-host promotions |
| 11 | **Game Settings** | Verification modes (Mode B/C/Instant), capture rules, penalty settings |
| 12 | **Game Mode Selection** | Preset manager: Classic Hunt 30m, Esports Blitz 15m, Infection |
| 13 | **Custom Mode Builder** | Create and persist custom match rules and shrink stages |
| 14 | **Zone Selection Map** | Interactive Leaflet map: place circle center or polygon vertices |
| 15 | **Zone Stage Manager** | Shrink stage timeline (start time, shrink duration, contraction ratio) |
| 16 | **Active Game Dashboard** | Live match HUD: clock, head-start countdown, zone status, outside-zone alert |
| 17 | **Player Map** | Fullscreen radar map with live zone, next stage ghost ring, and GPS marker |
| 18 | **Hunter QR Scanner** | Camera scanner, laser beam HUD, manual code input, quick test selector |
| 19 | **Runner QR Code Screen** | High-contrast Runner QR pass with anti-fraud instructions |
| 20 | **Capture Request Screen** | Real-time capture claims feed |
| 21 | **Capture Approval Screen** | Host / Runner dispute and confirmation modal |
| 22 | **Player Statistics** | Detailed breakdown of captures, escapes, and survival records |
| 23 | **Live Leaderboard** | Real-time match scoring and squad rankings |
| 24 | **Spectator Screen** | Safe broadcast feed showing scores without leaking positions |
| 25 | **Game Results Screen** | Victory fanfare, confetti celebration, match summary |
| 26 | **Game History** | Persistent match logs and combat statistics |
| 27 | **User Profile** | Operator call-sign, avatar, lifetime stats, sign out |
| 28 | **App Settings** | Procedural sound synthesizer toggle, haptics, version info |

---

## 4. Setup & Running the Application

### Prerequisites
- Node.js (v18 or higher)
- npm or pnpm

### Quick Start
```bash
# 1. Clone repository & navigate to directory
cd c:\Users\HP\Downloads\HUNTX

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

Visit `http://localhost:3000` in your web browser.

---

## 5. Connecting Supabase (Production Database Setup)

1. Create a project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** in your Supabase Dashboard.
3. Paste and run the entire SQL migration script from `supabase/schema.sql`.
4. Copy your **Project URL** and **Anon Public Key** from *Settings -> API*.
5. Update your `.env` file:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```
6. Build or restart the development server. HUNTX will automatically connect to your production Supabase database with live Postgres real-time updates!

---

## 6. How to Test Multi-Player Gameplay Locally

HUNTX features an instant multi-client real-time synchronization engine, making local testing effortless:

1. **Host Player (Tab 1)**:
   - Open `http://localhost:3000` in Chrome.
   - Click "Create Account & Host" or "Login with Email" (e.g. `host@huntx.com`).
   - Click **Host a Hunt**, enter a title, and launch the lobby.
   - Note the **6-character Room Code** (e.g., `HX982K`).

2. **Runner Player (Tab 2)**:
   - Open `http://localhost:3000` in an Incognito / private browsing window.
   - Click **Quick Join as Guest Player**, enter a nickname (e.g. `SpeedyRunner`).
   - Click **Join Room**, enter the room code `HX982K`, and join the lobby.
   - Notice they appear in the Runners squad on Tab 1 in real time!
   - Mark "Ready".

3. **Commence Match**:
   - On Tab 1 (Host), click **Commence Match Countdown**.
   - Both tabs synchronize into the active game HUD with audio countdowns!
   - Tab 2 (Runner) can click **Display My Runner Pass** to view their QR code.
   - Tab 1 (Hunter) can click **Launch Hunter Scanner** and use the camera or click the runner's name in the active targets list to tag them!
   - In Mode B, Tab 2 immediately receives the confirmation modal with sound effects!

---

## 7. Mobile Packaging (Android & iOS)

Because HUNTX is built with a responsive mobile-first architecture, standards-based Leaflet mapping, HTML5 optical camera scanning, and procedural Web Audio, you can package it into a native Android/iOS app with 1 command:

```bash
# Package with Capacitor
npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios
npx cap init HUNTX com.huntx.game
npm run build
npx cap add android
npx cap add ios
npx cap sync
```

---

## 8. Outdoor Safety & Fair-Play Notice

> [!IMPORTANT]
> HUNTX is strictly designed for safe, fair, and legal outdoor competitive play. Never play on or cross active roadways, trespass into restricted areas, or initiate physical contact. All tag verifications are performed via optical camera scanning.
