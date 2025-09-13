# NATPAC Travel Data Collection App

A mobile-first React application for transportation planning data collection in Kerala, India.

## Features

- 📱 Mobile-first responsive design
- 🚗 Automated trip detection
- 🎮 Gamification elements
- 🔒 Privacy controls
- ✅ Real-time data validation
- 🏛️ Government research integration

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open http://localhost:3000 in your browser

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Technology Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **ESLint** - Code linting

## Features

### Onboarding Flow

A comprehensive multi-step onboarding wizard that includes:

- **Step-based wizard layout** with smooth transitions
- **Progress indicator** showing current step and completion percentage
- **Privacy & Consent screen** with granular permission controls
- **Mobile-optimized touch interactions** with toggles and info modals
- **State management** for consent selections with localStorage persistence

#### Consent Categories:

1. **Location Data** (Required)
   - Allow location tracking *(Required)*
   - Precise location data *(Optional)*

2. **Sensor Data** (At least one required)
   - Motion sensors *(Optional)*
   - Activity detection *(Optional)*

3. **Usage Analytics** (Optional)
   - Anonymous usage statistics *(Optional)*
   - Crash reports *(Optional)*

#### Key Features:
- Info icons with detailed explanations for each permission
- Required vs optional permission distinction
- "Accept & Start" button enabled only when required consents are given
- Smooth animations and transitions between steps
- Mobile-first responsive design
- State persistence across app restarts

### Main Dashboard

A comprehensive mobile dashboard featuring:

- **Top Header** with NATPAC logo, notification bell, and settings gear icons
- **Today's Summary Card** showing:
  - Trip count with transport mode icons (car, bus, walking)
  - Distance tracking for each trip
  - Time stamps for all activities
- **Current Status Card** with:
  - "Tracking Active" with live location indicator
  - "Battery: Good" with percentage and battery icon
  - "Points: 245" with gamification target icon
- **Quick Actions Grid** with 4 action buttons:
  - Manual Trip (with Plus icon)
  - View History (with History icon)
  - Rewards Center (with Gift icon)
  - Share Data (with Share icon)
- **Bottom Navigation** with 5 tabs:
  - Home, Data, Rewards, Profile, Settings
- **Recent Activity Feed** showing latest user actions

#### Design Features:
- Cards with subtle shadows and rounded corners
- Lucide React icons throughout the interface
- Modern mobile dashboard with excellent spacing and visual hierarchy
- Smooth hover effects and transitions
- Color-coded transport modes and status indicators

### Trip Detection & Tracking

Comprehensive trip detection and active tracking system:

#### Active Trip Screen:
- **Large transport mode indicator** with car/bus/walking icons and "Driving" text
- **Live map placeholder** with route visualization and animated progress
- **Real-time trip stats**: Duration (00:15:23), Distance (2.3 km), Speed (35 km/h)
- **"End Trip"** and **"Add Stop/Note"** buttons with mobile-optimized sizing
- **GPS status monitoring** with connection indicators
- **Loading states** and error handling for GPS/connectivity issues

#### Trip Detection Modal:
- **"New Trip Detected"** header with smooth slide-up animation
- **Trip summary** with transport mode icon, destination, and time/distance
- **"Was this correct?"** confirmation question
- **"Yes"** and **"No"** buttons with immediate feedback
- **"Edit Details"** link for manual corrections
- **Auto-close timer** with visual progress indicator

#### Features:
- **Real-time updates simulation** using useEffect hooks
- **Smooth animations** for status changes and modal transitions
- **Mobile-optimized button sizes** for easy touch interaction
- **Background trip detection** with configurable intervals
- **GPS signal strength monitoring** with visual indicators
- **Error handling** for poor connectivity or GPS issues
- **Manual trip initiation** for when automatic detection fails