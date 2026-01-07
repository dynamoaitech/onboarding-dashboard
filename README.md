# Onboarding Dashboard

A React-based onboarding command center for tracking tasks, relationships, and progress during the first 30 days at Apex Companies.

## Features

- **Daily Task Tracking**: Track daily onboarding tasks with priority levels
- **Relationship Management**: Manage key relationships and contacts
- **Scenario Playbook**: Guidance for common workplace scenarios
- **Weekly Progress Logs**: Document weekly progress and learnings
- **Wins Tracker**: Log accomplishments and achievements

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

### Option 1: Using Wrangler CLI

1. Install Wrangler (if not already installed):
```bash
npm install -g wrangler
```

2. Login to Cloudflare:
```bash
wrangler login
```

3. Deploy:
```bash
npm run deploy
```

### Option 2: Connect Git Repository

1. Push this code to a GitHub repository
2. Go to [Cloudflare Dashboard](https://dash.cloudflare.com) > Pages
3. Click "Create a project" > "Connect to Git"
4. Select your repository
5. Configure build settings:
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Framework preset**: Vite
6. Click "Save and Deploy"

### Option 3: Direct Upload

```bash
npm run build
npx wrangler pages deploy dist
```

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Lucide React** - Icon library (available for future use)

## Project Structure

```
dashboard/
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
└── wrangler.toml    # Cloudflare Pages configuration
```

## License

Private - Apex Companies Internal Use
