# Code-Type

A modern typing test application designed specifically for programmers. Practice typing code snippets in JavaScript, TypeScript, and Python to improve your coding speed and accuracy.

![Code-Type](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)
![TanStack](https://img.shields.io/badge/TanStack-FF4154?style=flat&logo=react&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat&logo=postgresql&logoColor=white)

## Features

### Core Typing Test
- **Code Snippets**: 45+ curated snippets across JavaScript, TypeScript, and Python
- **Difficulty Levels**: Beginner, Intermediate, Advanced, and Expert
- **Real-time Metrics**: WPM, raw WPM, accuracy, and time tracking
- **Syntax Highlighting**: Language-aware code display with proper formatting
- **Sound Effects**: Optional typing sounds with volume control

### User System
- **Authentication**: Secure login and registration with password hashing
- **User Profiles**: Track personal statistics, trends, and progress
- **Settings**: Customizable editor preferences, sound settings, and display options

### Leaderboard
- **Global Rankings**: Compete with other programmers
- **Filter by Language**: See top performers in each programming language
- **Personal Stats**: Track your position and improvement over time

### Practice Modes
- **Symbol Practice**: Focus on programming symbols (`{}`, `[]`, `=>`, etc.)
- **Keyword Practice**: Language-specific keywords and syntax
- **Weak Spot Drills**: Target your most common mistakes
- **Speed Mode**: Push your typing speed limits
- **Accuracy Mode**: Focus on precision over speed
- **Warm-up Routine**: Quick exercises before tests

### Multiplayer (Preview)
- **Race Rooms**: Create or join typing races
- **Real-time Competition**: See other players' progress live
- **Race Results**: Compare WPM, accuracy, and finish times

### Analytics & Insights
- **Performance Charts**: Visualize your progress over time
- **Error Analysis**: Heatmaps showing common mistake patterns
- **Typing History**: Review past test results
- **Recommendations**: Personalized suggestions for improvement

## Tech Stack

- **Framework**: [TanStack Start](https://tanstack.com/start) (Full-stack React with SSR)
- **Router**: [TanStack Router](https://tanstack.com/router) (File-based routing)
- **Data Fetching**: [TanStack Query](https://tanstack.com/query)
- **Database**: PostgreSQL with [Drizzle ORM](https://orm.drizzle.team/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) v4 + [shadcn/ui](https://ui.shadcn.com/)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)
- **Font**: JetBrains Mono (optimized for code display)

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- PostgreSQL database

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/33b3ziz/code-type.git
   cd code-type
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```

   Configure your `DATABASE_URL` in `.env`:
   ```
   DATABASE_URL=postgresql://user:password@localhost:5432/codetype
   ```

4. Set up the database:
   ```bash
   pnpm db:push
   ```

5. Start the development server:
   ```bash
   pnpm dev
   ```

6. Open [http://localhost:3000](http://localhost:3000)

## Available Commands

```bash
# Development
pnpm dev              # Start dev server on port 3000
pnpm build            # Production build
pnpm preview          # Preview production build

# Testing
pnpm test             # Run Vitest unit tests
pnpm test:e2e         # Run Playwright E2E tests

# Code Quality
pnpm lint             # Run ESLint
pnpm format           # Run Prettier
pnpm check            # Run Prettier and ESLint with auto-fix
pnpm tsc              # TypeScript type checking

# Database
pnpm db:generate      # Generate migrations from schema changes
pnpm db:migrate       # Run migrations
pnpm db:push          # Push schema directly to database (dev)
pnpm db:studio        # Open Drizzle Studio GUI
```

## Project Structure

```
src/
├── components/           # React components
│   ├── ui/              # shadcn/ui base components
│   ├── multiplayer/     # Multiplayer race components
│   └── practice/        # Practice mode components
├── db/                  # Database schema and connection
│   ├── schema.ts        # Drizzle schema definitions
│   └── seed/            # Seed data (snippets)
├── hooks/               # Custom React hooks
│   ├── useTypingTest.ts # Core typing test logic
│   ├── useTimer.ts      # Timer functionality
│   └── useWebSocket.ts  # Multiplayer WebSocket
├── lib/                 # Utilities and APIs
│   ├── *-api.ts         # Client-side API functions
│   └── *-server-api.ts  # Server-side API functions
├── routes/              # File-based routes
├── stores/              # Zustand state stores
└── styles/              # Global styles
```

## Key Components

| Component | Description |
|-----------|-------------|
| `TypingTest` | Main typing interface with real-time feedback |
| `DifficultySelector` | Choose test difficulty level |
| `LanguageSelector` | Filter snippets by programming language |
| `Leaderboard` | Global rankings display |
| `UserProfile` | Personal statistics and trends |
| `PerformanceChart` | Progress visualization |
| `ErrorHeatmap` | Mistake pattern analysis |

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit changes: `git commit -m 'feat: add my feature'`
4. Push to branch: `git push origin feature/my-feature`
5. Open a Pull Request

## License

MIT License - see [LICENSE](LICENSE) for details.

---

Built with [TanStack Start](https://tanstack.com/start)
