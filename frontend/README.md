# Frontend (React + Vite)

This frontend provides the UI for the Github-Clone platform: authentication, dashboard, repository views, profile pages, and issue interactions.

## Scripts

```bash
npm run dev
npm run build
npm run preview
npm run lint
```

## Local Development

1. Install dependencies:

```bash
npm install
```

2. Start the dev server:

```bash
npm run dev
```

3. Open the Vite URL shown in terminal (usually `http://localhost:5173`).

## Backend API Configuration

Current code uses hardcoded API URLs like `http://localhost:3000` in components.

For deployment, migrate to a single environment variable (recommended):

- Create `.env` in `frontend/`:

```env
VITE_API_BASE_URL=https://your-backend-domain
```

- Build all fetch URLs from `import.meta.env.VITE_API_BASE_URL`.

## Suggested UI States for Git-like Actions

If you expose custom git-like operations in UI, show these states:

- Init status: repository initialized or not
- Add status: staged files list and count
- Commit status: last commit message/id/time
- Push status: success/failure with uploaded commit count

These states are enough for an MVP and help users trust what happened after each action.
