# RowLab - Rowing Lineup Manager

> Web application for rowing coaches to create and manage boat lineups

---

## Project Summary

<!-- LINKEDIN COPY-PASTE START -->

A web-based lineup management tool designed for rowing coaches to optimize boat assignments and visualize team configurations. The application enables coaches to drag-and-drop athletes into various boat types, manage roster data from CSV imports, and experiment with different lineup combinations in real-time. Features a modern glassmorphism UI with animated aurora backgrounds, AI-powered lineup assistance, and a comprehensive analytics dashboard. Includes a machine learning roadmap for predictive analytics and performance optimization.

**Key Technical Achievements:**
- Designed an intuitive drag-and-drop interface for seat assignments across multiple boat configurations (1x through 8+)
- Implemented a modern "Liquid Glass" design system with glassmorphism effects, aurora backgrounds, and responsive layouts
- Built a Node.js/Express backend API with JWT authentication, rate limiting, and security middleware
- Created AI-powered lineup assistant using Ollama for intelligent lineup recommendations
- Integrated real-time erg data tracking with performance trend visualization using Recharts
- Implemented comprehensive account settings and user management system

**Machine Learning Roadmap:**
- Athlete ranking algorithm using aggregated performance data and erg score analysis
- True relative speed calculations adjusting for seat position, boat class, and conditions
- Predictive placement modeling against competing schools based on historical race data
- AI-driven training suggestions based on individual athlete metrics and team goals
- PostgreSQL database integration for longitudinal athlete data storage and analysis

**Technologies:** Node.js, Express, React, Vite, TailwindCSS, Zustand, dnd-kit, Framer Motion, Ollama AI | *Planned: Python, Scikit-learn, PostgreSQL*

<!-- LINKEDIN COPY-PASTE END -->

---

## Recent Updates (v2.0)

### UI/UX Redesign
- **Aurora Background**: Subtle animated northern lights gradient effect across all pages
- **Glass Morphism**: Enhanced glass panel effects with improved opacity for better text readability
- **Dark Mode Optimized**: All text now properly styled for dark backgrounds across every page
- **Gradient Navigation**: Sidebar and navigation elements feature smooth gradient hover effects
- **Responsive Design**: Mobile-first approach with collapsible sidebar and touch-friendly interactions

### New Features
- **Account Settings Page**: Complete user profile management with avatar upload, notifications, and preferences
- **AI Lineup Assistant**: Integrated Ollama-powered assistant for intelligent lineup recommendations
- **Performance Analytics Dashboard**: Visual charts for erg scores, side distribution, and team trends
- **Admin Panel**: User management and feature toggles for administrators

### Security & Performance
- **JWT Authentication**: Secure token-based auth with refresh tokens
- **Rate Limiting**: Endpoint-specific rate limits to prevent abuse
- **Helmet Security Headers**: CSP, CORS, and other security middleware
- **Code Splitting**: Lazy-loaded pages for faster initial load times

---

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- Access to athlete CSV file: `/home/swd/Rowing/LN_Country.csv`
- Access to headshots directory: `/home/swd/Rowing/Roster_Headshots_cropped/`

### Installation

```bash
cd /home/swd/RowLab
npm install
```

### Development

**Option 1: Single command (recommended):**
```bash
npm run dev:full
```
Runs both frontend (port 3001) and backend (port 3002) simultaneously.

**Option 2: tmux session (persistent):**
```bash
npm run dev:tmux
```
Creates a persistent tmux session with 3 windows (backend, frontend, shell).

**Option 3: Run separately (two terminal windows):**

Terminal 1 - Frontend:
```bash
npm run dev
```

Terminal 2 - Backend:
```bash
npm run server
```

**Stop all development servers:**
```bash
npm stop
```
Kills all RowLab dev servers (works for both concurrently and tmux modes).

Open browser to `http://localhost:3001`

### Production

Build and run:
```bash
npm run build
npm start
```
Server runs on port 3002

## Features

### ✅ Core Features
- **Visual Boat Builder**: Kanban-style drag-and-drop lineup builder for 8+, 4+, 4-, 2x, 1x configurations
- **Athlete Management**: Full roster management with headshots, country flags, and side preferences
- **Drag-and-Drop**: Intuitive @dnd-kit powered interface for seat assignments
- **Athlete Swapping**: Click two seats to swap athletes within or across boats
- **Search & Filter**: Real-time athlete search with multiple filter options
- **Save & Export**: Persist lineups to localStorage or export as JSON

### ✅ Analytics & Data
- **Performance Dashboard**: Team statistics and trends visualization
- **Erg Data Tracking**: Record and analyze 2k, 6k, and other erg test results
- **Side Distribution Charts**: Visual breakdown of port/starboard assignments
- **Boat Utilization**: Track active boats and seat fill rates

### ✅ User Experience
- **Account Settings**: Profile management, avatar upload, and preference controls
- **AI Lineup Assistant**: Ollama-powered chatbot for lineup recommendations
- **Dark Mode**: Fully optimized dark theme with aurora background effects
- **Responsive Design**: Works on desktop, tablet, and mobile devices

### ✅ Security & Admin
- **JWT Authentication**: Secure login with token refresh
- **Admin Panel**: User management and feature toggles
- **Rate Limiting**: Protection against API abuse
- **Role-Based Access**: Admin and user role separation

### ⚠️ In Development
- **Performance Predictions**: ML-based race placement predictions
- **Team Comparisons**: Side-by-side lineup analysis
- **Training Recommendations**: AI-driven workout suggestions

## Usage

### Creating a Lineup

1. **Add a boat** from the controls panel (e.g., "Varsity 8+")
2. **Select an athlete** from the roster (click or drag)
3. **Assign to seat**:
   - Click method: Click athlete, then click empty seat
   - Drag method: Drag athlete card onto seat
4. **Repeat** until all seats filled

### Swapping Athletes

1. Click an athlete in an assigned seat (yellow ring appears)
2. Click another assigned seat (shows "Seats Selected: 2/2")
3. Click "Swap Athletes" button in controls panel

### Saving Lineups

- **Save to Browser**: Click "Save Lineup" (persists in localStorage)
- **Export**: Click "Export JSON" to download file

## Project Structure

```
/home/swd/RowLab/
├── src/                    # React source code
│   ├── components/         # React components
│   ├── utils/              # Utilities (CSV, boat config, etc.)
│   └── store/              # Zustand state management
├── server/                 # Express API server
├── data/                   # CSV data files
├── docs/                   # Full documentation
└── public/                 # Static assets
```

## Data Files

### Athletes: `LN_Country.csv`
- **Location**: `/home/swd/Rowing/LN_Country.csv`
- **Contains**: LastName, Country (53 athletes)
- **Loaded**: Automatically on app start

### Boat Configs: `boats.csv`
- **Location**: `data/boats.csv`
- **Contains**: Boat definitions (Varsity 8+, JV 4-, etc.)
- **Status**: ✅ Complete

### Headshots
- **Location**: `/home/swd/Rowing/Roster_Headshots_cropped/`
- **Naming**: `LastName.jpg` (or `.jpeg`, `.png`)
- **Fallback**: Placeholder avatar if not found

## Technical Stack

### Frontend
- **Framework**: React 18 + Vite (ES modules, fast HMR)
- **Styling**: Tailwind CSS + Custom glassmorphism design system
- **Animations**: Framer Motion (page transitions, micro-interactions)
- **State Management**: Zustand (lightweight, no boilerplate)
- **Drag-and-Drop**: @dnd-kit (accessible, customizable)
- **Charts**: Recharts (responsive data visualization)
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Authentication**: JWT with bcrypt password hashing
- **Security**: Helmet, CORS, express-rate-limit
- **AI Integration**: Ollama API for local LLM inference
- **Data Parsing**: PapaParse for CSV imports

### Development
- **Build Tool**: Vite with Rollup
- **TypeScript**: Gradual migration (components)
- **Linting**: ESLint with React config
- **Process Management**: Concurrently, PM2

## Scripts

### Development
- `npm run dev:full` - **Start both servers** (recommended, uses concurrently)
- `npm run dev:tmux` - **Start in tmux session** (persistent, detachable)
- `npm stop` - **Stop all development servers** (both concurrently and tmux)
- `npm run dev` - Start Vite dev server only (port 3001)
- `npm run server` - Start Express API server only (port 3002)

### Production
- `npm run build` - Build for production
- `npm start` - Run production server (port 3002)

## Configuration

### Environment Variables
Copy `.env.example` to `.env` and customize:

```bash
PORT=3002
NODE_ENV=development
HEADSHOTS_PATH=/home/swd/Rowing/Roster_Headshots_cropped
ATHLETES_CSV=/home/swd/Rowing/LN_Country.csv
```

### nginx Deployment
See `config/nginx-location.conf` for example nginx configuration.

**Subdomain option (recommended):**
```nginx
server {
    listen 443 ssl http2;
    server_name rowlab.yourdomain.com;

    location / {
        proxy_pass http://localhost:3002;
        # ... proxy headers
    }
}
```

**Subpath option:**
```nginx
location /rowlab {
    proxy_pass http://localhost:3002;
    # ... proxy headers
}
```

## Documentation

📚 **Full documentation**: [docs/PROJECT_DOCUMENTATION.md](docs/PROJECT_DOCUMENTATION.md)

Includes:
- Complete component architecture
- Data flow diagrams
- Feature implementation matrix
- Troubleshooting guide
- Future development roadmap

## Troubleshooting

### Headshots not loading?
1. Check Express server is running (`npm run server`)
2. Verify headshots exist: `ls /home/swd/Rowing/Roster_Headshots_cropped/`
3. Check server logs for 404 errors
4. Test endpoint: `curl http://localhost:3002/api/headshots/Smith`

### No athletes showing?
1. Check browser console for errors
2. Verify CSV exists: `cat /home/swd/Rowing/LN_Country.csv`
3. Check CSV format (commas, no extra quotes)

### Drag-and-drop not working?
1. Verify @dnd-kit installed: `npm list @dnd-kit/core`
2. Try different browser
3. Check console for React errors

### Port already in use?
```bash
# Find and kill process
lsof -i :3001
kill -9 <PID>
```

## Feature Roadmap

### Phase 1: Data Integration (Current)
- [ ] Full erg data CSV import and validation
- [ ] Side preference enforcement and warnings
- [ ] Athlete capability matrix (port/starboard/both)
- [ ] Historical performance tracking

### Phase 2: Analytics (Q1 2026)
- [ ] Power ranking algorithm implementation
- [ ] Erg score trend analysis and predictions
- [ ] Team comparison dashboards
- [ ] Printable lineup sheets

### Phase 3: Collaboration (Q2 2026)
- [ ] PostgreSQL database migration
- [ ] Multi-user real-time editing (WebSocket)
- [ ] Team sharing and permissions
- [ ] Lineup version history

### Phase 4: AI/ML Features (Q3 2026)
- [ ] Predictive race placement model
- [ ] Optimal lineup suggestions
- [ ] Training load recommendations
- [ ] Weather condition adjustments

---

## Machine Learning Roadmap

### Athlete Performance Analytics
| Feature | Description | Status |
|---------|-------------|--------|
| **Erg Score Analysis** | Import and analyze 2k, 6k, and other erg test results with trend visualization | Planned |
| **Athlete Ranking Algorithm** | Aggregate performance metrics to generate dynamic power rankings | Planned |
| **True Relative Speed** | Calculate adjusted speed accounting for seat position, boat class, and weather conditions | Planned |

### Predictive Modeling
| Feature | Description | Status |
|---------|-------------|--------|
| **Race Placement Prediction** | ML model to predict placement against competing schools using historical race data | Planned |
| **Optimal Lineup Suggestions** | AI-driven recommendations for boat compositions based on athlete compatibility | Planned |
| **Training Recommendations** | Personalized training suggestions based on individual metrics and team goals | Planned |

### Data Infrastructure
| Feature | Description | Status |
|---------|-------------|--------|
| **PostgreSQL Database** | Persistent storage for athlete data, lineups, and historical performance | Planned |
| **Data Import Pipeline** | Automated ingestion from erg machines, race results, and training logs | Planned |
| **Analytics Dashboard** | Visual reporting on team trends, individual progress, and competitive analysis | Planned |

### Technologies (Planned)
- **ML/Analytics**: Python, Scikit-learn, Pandas, NumPy
- **Database**: PostgreSQL with Prisma ORM
- **Visualization**: Recharts, D3.js

See [PROJECT_DOCUMENTATION.md](docs/PROJECT_DOCUMENTATION.md) for detailed roadmap.

## License

Private - (Specify license if open-sourcing)

## Contact

- **Issues**: Document bugs and feature requests
- **Questions**: Contact project maintainer

---

**RowLab v2.0** - Built with React, Vite, and a passion for rowing

*Last updated: January 2026*
