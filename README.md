# Motorly — Frontend

> Your personal AI car mechanic assistant. Describe any car problem, get a diagnosis, find trusted shops nearby, and track your vehicle's maintenance — all in one app.

## Tech Stack
- **React Native** + **Expo** (TypeScript, managed workflow)
- **React Navigation** — bottom tabs + stack navigators
- **Google Maps / Places API** — nearby shop discovery
- **Expo Google Fonts** — Manrope + Inter

## Getting Started

### Prerequisites
- Node.js 20+
- Expo CLI: `npm install -g expo-cli`
- Expo Go app on your phone (for testing)

### Install & Run
```bash
npm install
npx expo start
```

Scan the QR code with **Expo Go** (Android) or **Camera** (iOS) to run on your device.

### Run on Simulator
```bash
npx expo start --ios       # iOS Simulator (requires macOS + Xcode)
npx expo start --android   # Android Emulator (requires Android Studio)
```

## Project Structure
```
src/
├── assets/          # Fonts, images, icons
├── components/      # Reusable UI components
├── constants/       # Design tokens (colors, typography, spacing)
├── hooks/           # Custom React hooks
├── navigation/      # Navigation setup
├── screens/         # App screens
├── services/        # API service layer
├── types/           # TypeScript interfaces
└── utils/           # Utilities and helpers
```

## Environment Variables
Copy `.env.example` to `.env` and fill in your keys:
```bash
cp .env.example .env
```

## Related
- **Backend:** `motorly-backend` (separate repo)
- **Designs:** `../design/` folder
