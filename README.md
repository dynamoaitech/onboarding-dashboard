# Onboarding Dashboard

A React-based onboarding command center for tracking tasks, relationships, and progress during the first 30 days at Apex Companies.

## Features

- **Daily Task Tracking**: Track daily onboarding tasks with priority levels
- **Relationship Management**: Manage key relationships and contacts
- **Scenario Playbook**: Guidance for common workplace scenarios
- **Weekly Progress Logs**: Document weekly progress and learnings
- **Wins Tracker**: Log accomplishments and achievements
- **Data Persistence**: All data persists in Cloudflare D1 database

## Development

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
npm install
```

### Running Locally

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Deployment to Cloudflare Pages

### Git-Based Deployment (Recommended)

1. Push this code to a GitHub repository
2. Go to [Cloudflare Dashboard](https://dash.cloudflare.com) > **Workers & Pages**
3. Click "Create application" > "Pages" > "Connect to Git"
4. Select your repository
5. Configure build settings:
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Framework preset**: Vite
6. Click "Save and Deploy"

### Bind D1 Database

After deployment, you need to bind the D1 database to enable data persistence:

1. Go to your Pages project in the Cloudflare Dashboard
2. Click **Settings** > **Functions**
3. Scroll to **D1 database bindings**
4. Click **Add binding**
5. Configure the binding:
   - **Variable name**: `DB`
   - **D1 database**: Select `apex-onboarding`
6. Click **Save**
7. Redeploy the project for the binding to take effect

The app will now persist all data (tasks, relationships, wins, weekly notes) in your D1 database.

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Cloudflare Pages Functions** - Serverless API endpoints
- **Cloudflare D1** - SQLite database for data persistence
- **Lucide React** - Icon library (available for future use)

## Project Structure

```
dashboard/
├── functions/
│   └── api/         # Cloudflare Pages Functions (API endpoints)
│       ├── tasks.js        # Task completion tracking
│       ├── relationships.js # Contact management
│       ├── wins.js         # Accomplishments tracking
│       └── weekly.js       # Weekly progress notes
├── public/          # Static assets
├── src/
│   ├── App.jsx      # Main application component
│   ├── main.jsx     # Application entry point
│   └── index.css    # Tailwind CSS imports
├── index.html       # HTML template
├── package.json     # Dependencies and scripts
├── vite.config.js   # Vite configuration
├── tailwind.config.js  # Tailwind CSS configuration
├── postcss.config.js   # PostCSS configuration
└── wrangler.toml    # Cloudflare D1 database binding
```

## API Endpoints

All API endpoints are implemented as Cloudflare Pages Functions:

- `GET /api/tasks` - Fetch all tasks with completion status
- `POST /api/tasks` - Update task completion status
- `GET /api/relationships` - Fetch all relationships
- `POST /api/relationships` - Update relationship details
- `GET /api/wins` - Fetch all accomplishments
- `POST /api/wins` - Add new accomplishment
- `GET /api/weekly` - Fetch weekly progress notes
- `POST /api/weekly` - Update weekly progress notes

## License

Private - Apex Companies Internal Use
