# Github-Clone

A full-stack GitHub-like application with user profiles, repositories, issues, stars, and a custom git-like CLI flow (`init`, `add`, `commit`, `push`, `pull`, `revert`) implemented in Node.js.

## Features

- Authentication with JWT (signup, login, logout)
- User profile management
- Follow users
- Repository CRUD
- Issue CRUD
- Star and unstar repositories
- Contribution heatmap data
- Custom git-like commands through backend CLI

## Monorepo Structure

- `backend/` Express API, MongoDB models, CLI command handlers, AWS S3 integration
- `frontend/` React + Vite UI

## Tech Stack

- Frontend: React, Vite, React Router, Tailwind CSS
- Backend: Node.js, Express, Mongoose, JWT, bcrypt, Socket.IO
- Storage: MongoDB + AWS S3

## Local Setup

### 1) Clone and install

```bash
git clone <your-repo-url>
cd Github-Clone

cd backend
npm install

cd ../frontend
npm install
```

### 2) Configure backend environment

Create `backend/.env`:

```env
PORT=3000
MONGODB_URI=<your_mongodb_connection_string>
JWT_SECRET=<your_jwt_secret>
AWS_ACCESS_KEY_ID=<your_aws_access_key_id>
AWS_SECRET_ACCESS_KEY=<your_aws_secret_access_key>
AWS_REGION=eu-north-1
```

Note: `backend/config/aws-config.js` currently hardcodes bucket and region defaults.

### 3) Run backend API server

```bash
cd backend
npm start start
```

### 4) Run frontend

```bash
cd frontend
npm run dev
```

## API Overview

Primary routes are mounted in `backend/routes/`:

- User: `/signup`, `/login`, `/logout`, `/userProfile/:id`, `/follow/:id`
- Repo: `/repo/create`, `/repo/all`, `/repo/:id`, `/repo/update/:id`, `/repo/:id/star`
- Issue: `/issue/create/:id`, `/issue/all/:id`, `/issue/:id`, `/issue/update/:id`

## Git-like CLI Commands

Run from `backend/`:

```bash
npm start init
npm start add ./path/to/file.txt
npm start commit "my commit message"
npm start push
npm start pull
npm start revert <commitId>
```

## Frontend Display Guidance for `init`/`add`/`commit`/`push`

For a solid MVP UX, show at least:

- repository initialized state
- staged files list
- last commit id/message/time
- commit history list
- push result status (success/failure)

This is enough for demo and interview use. For production-level UX, add file-level diffs and per-user/per-repo push visibility.

## Current Limitations

- `push` uploads commits to a shared S3 bucket path without full per-user namespacing.
- CLI commands write to `.myGit` on the server filesystem, which is not ideal for stateless hosting.
- Frontend currently calls `http://localhost:3000` directly in multiple components.

## Deployment Notes (Vercel + Railway)

- Host frontend on Vercel and backend on Railway.
- Replace hardcoded API URLs in frontend with an environment variable (for example `VITE_API_BASE_URL`).
- Keep AWS credentials and MongoDB URI only in backend host environment variables.

## Roadmap

- Per-user and per-repo namespaced S3 keys for push/pull
- Authorization checks on push/pull operations
- Replace local `.myGit` dependency with DB/object-storage-backed state
- Add commit detail and file diff views in frontend
