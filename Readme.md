# Github-Clone

A full-stack GitHub-like application with user profiles, repositories, issues, stars, and a custom git-like CLI flow (`init`, `add`, `commit`, `push`, `pull`, `revert`) implemented in Node.js.

## Key Achievements

- Built a full-stack GitHub-style platform with auth, repositories, issues, stars, and profile social features.
- Implemented custom git-like command flow on Node.js (`init`, `add`, `commit`, `push`, `pull`, `revert`).
- Added secure route protection for critical write operations using JWT + ownership authorization.
- Added dual operation modes for git-like state:
	- `local` mode for simple development/demo.
	- optional `s3` state mode for cloud-safe persistence.
- Added optional namespaced S3 storage paths (`users/<userId>/repos/<repoId>/...`) while preserving backward compatibility.

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

## Architecture

```text
Frontend (Vercel)
	|
	| HTTPS (REST)
	v
Backend API + CLI (Railway)
	|
	|-- MongoDB Atlas (users, repositories, issues, metadata)
	|
	|-- AWS S3
		 |-- legacy mode: commits/<commitId>/...
		 |-- namespaced mode: users/<userId>/repos/<repoId>/...
```

### State and Storage Modes

- `GIT_STATE_BACKEND=local` (default): staging/commit state uses local `.myGit` filesystem.
- `GIT_STATE_BACKEND=s3` (optional): staging/commit state is stored in S3 for better hosted reliability.
- `GIT_STORAGE_MODE=legacy` (default): shared S3 prefixes.
- `GIT_STORAGE_MODE=namespaced` (recommended for multi-user): requires `GIT_USER_ID` and `GIT_REPO_ID`.

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
S3_BUCKET=<your_s3_bucket_name>
GIT_STATE_BACKEND=local
GIT_STORAGE_MODE=legacy
GIT_USER_ID=
GIT_REPO_ID=
```

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

Optional namespaced usage:

```bash
npm start init -- --stateBackend s3 --storageMode namespaced --userId <userId> --repoId <repoId>
npm start add ./path/to/file.txt
npm start commit "my commit message"
npm start push -- --storageMode namespaced --userId <userId> --repoId <repoId>
npm start pull -- --storageMode namespaced --userId <userId> --repoId <repoId>
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

- `local` state backend uses `.myGit` filesystem; this is best for development, not fully stateless hosting.
- `namespaced` S3 mode is available, but production rollout should include end-to-end hosted validation and monitoring.
- Automated API tests and CI checks are still minimal and should be expanded.

## Deployment Notes (Vercel + Railway)

- Host frontend on Vercel and backend on Railway.
- Use `VITE_API_BASE_URL` in frontend environment configuration.
- Keep AWS credentials and MongoDB URI only in backend host environment variables.

## Post-Deploy Verification Checklist

Use this checklist right after each deployment.

### Railway Backend

1. Verify deploy succeeded and service is healthy in Railway logs.
2. Open `<RAILWAY_BACKEND_URL>/health` and confirm HTTP 200.
3. Confirm required backend env vars are set:
	- `PORT`
	- `MONGODB_URI`
	- `JWT_SECRET`
	- `AWS_ACCESS_KEY_ID`
	- `AWS_SECRET_ACCESS_KEY`
	- `AWS_REGION`
	- `S3_BUCKET`
4. Run smoke tests against deployed backend:

```bash
SMOKE_BASE_URL=<RAILWAY_BACKEND_URL> npm run smoke:test
```

5. Confirm smoke output includes `SMOKE_TEST_PASS`.

### Vercel Frontend

1. Set `VITE_API_BASE_URL=<RAILWAY_BACKEND_URL>` in Vercel project environment variables.
2. Redeploy frontend after env update.
3. Open deployed frontend URL and verify:
	- signup works
	- login works
	- dashboard loads without API errors
	- repository creation works
	- issue creation works

### End-to-End Sanity

1. Create user A and user B.
2. Verify user-specific repository data loads correctly.
3. Verify protected route behavior:
	- unauthorized requests return 401/403
	- owner-only routes reject non-owner updates
4. If using namespaced mode, verify S3 keys are stored under:
	- `users/<userId>/repos/<repoId>/...`

## Smoke Tests (Backend)

This project includes a basic backend smoke test runner for key flows:

- health check
- signup and login
- repository creation (authorized)
- issue creation (authorized)
- fetch current user repositories

Run it from `backend/`:

```bash
npm run smoke:test
```

Expected success output includes:

```text
SMOKE_TEST_PASS
```

Optional environment overrides:

- `SMOKE_BASE_URL` (default: `http://localhost:<PORT>`)
- `SMOKE_TEST_PASSWORD` (default: `SmokeTest@123`)

## CI Pipeline

GitHub Actions workflow is available at `.github/workflows/ci.yml`.

It runs:

- frontend lint
- frontend build
- backend dependency and module load checks
- optional remote smoke test (only if secret is configured)

To enable remote smoke test in GitHub Actions, add repository secrets:

- `SMOKE_BASE_URL` (for example, your Railway backend URL)
- `SMOKE_TEST_PASSWORD` (optional override)

## Resume-Ready Description

Use this concise project description:

"Built and deployed a full-stack GitHub-style platform using React, Node.js/Express, MongoDB Atlas, and AWS S3, including JWT auth, repository/issue workflows, and a custom git-like CLI with backward-compatible local and cloud storage modes."

## Roadmap

- Add API smoke tests and CI pipeline for deploy confidence
- Add hosted-mode end-to-end validation for `s3 + namespaced` workflows
- Add commit detail and file diff views in frontend
- Add observability: structured logs and error correlation IDs
