# Motorly — Frontend

## Project Overview
Motorly is an AI-powered personal car mechanic assistant mobile app. Users describe car problems in plain language, get AI diagnoses, find nearby repair shops, and track vehicle maintenance.

**Platform:** React Native + Expo (TypeScript)  
**Target Users:** Everyday car owners, especially ages 30–65+. Accessibility and clarity are top priorities.

---

## Tech Stack
- **Framework:** React Native with Expo (SDK managed workflow)
- **Language:** TypeScript (strict)
- **Navigation:** React Navigation (stack + bottom tabs)
- **State Management:** TBD — likely Zustand or React Context for MVP
- **API Calls:** Axios or fetch with a services layer
- **Maps:** `react-native-maps` + Google Places API
- **Fonts:** Manrope (headlines) + Inter (body) via `expo-google-fonts`

---

## Folder Structure
```
src/
├── assets/          # Fonts, images, icons
├── components/      # Reusable UI components (Button, Card, Input, etc.)
├── constants/       # Design tokens: colors, typography, spacing
├── hooks/           # Custom React hooks
├── navigation/      # React Navigation setup (tab navigator, stack navigators)
├── screens/         # One folder per screen
├── services/        # API calls (ai.ts, shops.ts, cars.ts)
├── types/           # Shared TypeScript types/interfaces
└── utils/           # Helper functions
```

---

## Design System
All design tokens are in `src/constants/theme.ts`. Always use tokens — never hardcode colors, font sizes, or spacing.

### Key Colors
- **Primary:** `#a83900` (Safety Orange — high-intent actions only)
- **Primary Container:** `#ff6b2c` (hero moments, urgent states)
- **Background:** `#f9f9f7` (warm white — never pure #fff for main bg)
- **Surface:** `#ffffff` (cards)
- **Surface Container Low:** `#f4f4f2`

### Typography
- **Headlines/Display:** Manrope (Bold/ExtraBold)
- **Body/Labels:** Inter (Regular/SemiBold)
- **Minimum body size:** 16px (accessibility for older users)

### Rules
- **No borders for sectioning** — use background color shifts instead
- **Card radius:** 12px
- **Button height:** 56dp, radius 12px, gradient fill for primary
- **Touch targets:** minimum 48dp
- **Bottom nav:** always show icon + label (never icon-only)

---

## Screens (MVP)
| Screen | Folder | Description |
|---|---|---|
| Onboarding (3 slides) | `screens/Onboarding/` | Intro flow |
| Add Car | `screens/AddCar/` | Car profile setup |
| Home/Dashboard | `screens/Home/` | Primary vehicle, maintenance, offers |
| Diagnose (AI Chat) | `screens/Diagnose/` | AI mechanic chat interface |
| Auto Shops | `screens/Shops/` | Map + list of nearby shops |
| Shop Detail | `screens/ShopDetail/` | Shop info, reviews, CTA |
| My Car | `screens/MyCar/` | Car profile, Maintenance/History/Fuel tabs |
| Add Service Record | `screens/AddService/` | Log a service entry |
| Settings | `screens/Settings/` | Profile, vehicles, notifications, etc. |

---

## Navigation Structure
```
Root
├── OnboardingStack (shown if first launch / no car added)
│   ├── OnboardingSlides
│   └── AddCar
└── MainTabs (bottom tab navigator)
    ├── Home
    ├── Diagnose
    ├── Shops → ShopDetail (stack)
    ├── MyCar → AddService (stack)
    └── Settings
```

---

## Coding Conventions
- Use **functional components** with hooks only — no class components
- All components must be typed with TypeScript interfaces/props
- Use `StyleSheet.create()` for all styles — no inline styles except for dynamic values
- File naming: `PascalCase` for components/screens, `camelCase` for hooks/utils
- Each screen lives in its own folder: `screens/Home/index.tsx`
- Import from `@/` alias (configured in `tsconfig.json`) for `src/`

---

## Backend
- Backend is in a **separate repo** (`motorly-backend`)
- All API calls go through `src/services/`
- Base URL is stored in environment variables via `expo-constants` / `.env`
- API not yet implemented — use mock data during frontend development

---

## Screen Implementation Notes

### My Car (`screens/MyCar/`)
- **Structure:** Page title + vehicle header card → `TabSelector` → tab content
- **Tabs:** Maintenance (reuses `MaintenanceCard`), History (inline cards), Fuel (`FuelLogCard`)
- **New Components:**
  - `TabSelector` — reusable horizontal tab bar with underline indicator
  - `FuelLogCard` — fuel fill-up entry card (icon badge + text + cost-per-liter)
- **New Types:** `FuelLog` in `types/index.ts`
- **Mock Data:** All tabs use mock data; will be replaced by API calls once backend is ready
- **Empty States:** Each tab renders a centered icon + message when data array is empty

---

## Key Notes
- Design is not finalized — some adjustments will be made during development
- Designs are in `../design/` folder (sibling to this repo)
- The app must feel premium but accessible — no fancy animations that distract
- Older users (50+) are a primary demographic — clarity always wins over cleverness
