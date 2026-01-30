# Productivity - Personal Task Management PWA

A clean, minimal, and intuitive personal productivity app that works offline and syncs across all your devices via any browser.

## Features

- **Kanban Boards** - Each project is its own kanban board with customizable columns
- **Task Cards** - Full-featured tasks with subtasks, tags, due dates, priority, and recurring schedules
- **Multiple Views** - Dashboard, Today, Upcoming, and per-project Board views
- **Time Tracking** - Built-in timer with analytics and time logs
- **Offline Support** - Works without internet connection (PWA)
- **Installable** - Add to home screen on mobile or desktop
- **Themes** - Light and dark mode with customizable accent colors
- **Data Portability** - Export and import all your data as JSON

## Tech Stack

- **Frontend**: Svelte 5
- **Build Tool**: Vite
- **Storage**: IndexedDB (local, no backend required)
- **PWA**: Service worker for offline support

## Getting Started

### Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

The built files will be in the `dist/` directory.

## Deployment

Deploy the `dist/` folder to any static hosting service:

- **Netlify**: Drag and drop the `dist/` folder or connect your git repo
- **Vercel**: Connect your git repo and it will auto-detect Vite
- **GitHub Pages**: Push `dist/` contents to `gh-pages` branch

## Project Structure

```
src/
├── components/
│   ├── board/          # Kanban board components
│   ├── layout/         # App layout (Sidebar, Header, Dashboard)
│   ├── settings/       # Settings and tag management
│   ├── task/           # Task modal and related components
│   ├── timer/          # Timer, logs, and analytics
│   └── views/          # Today and Upcoming views
├── lib/
│   ├── db.js           # IndexedDB wrapper
│   ├── stores.js       # Svelte stores (state management)
│   └── utils.js        # Utility functions
├── styles/
│   ├── global.css      # Global styles
│   └── themes.css      # Theme definitions
├── App.svelte          # Root component
└── main.js             # Entry point
```

## Data Storage

All data is stored locally in your browser using IndexedDB:

- **Projects**: Kanban boards with customizable columns
- **Tasks**: Full task details including subtasks, tags, dates
- **Tags**: Custom colored labels
- **Time Entries**: Timer session logs
- **Settings**: Theme, accent color, navigation mode

## Export/Import

Backup your data at any time via Settings > Data Management:

- **Export**: Downloads all data as a JSON file
- **Import**: Restores data from a previously exported file (replaces existing data)

## Browser Support

Works in all modern browsers that support:
- IndexedDB
- Service Workers
- ES Modules

Tested on:
- Chrome (desktop & Android)
- Firefox
- Safari (desktop & iOS)
- Edge

## License

MIT
