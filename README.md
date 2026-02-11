# RippleHabits

RippleHabits is a React + TypeScript habit tracker designed to make consistent progress visible through small, repeatable actions.

## Tech stack

- React 19
- TypeScript
- Vite
- ESLint

## Getting started

### 1) Prerequisites

- Node.js 20+ (LTS recommended)
- npm 10+

### 2) Install dependencies

```bash
npm install
```

### 3) Run locally

```bash
npm run dev
```

The app will be available at `http://localhost:5173` by default.

### 4) Build for production

```bash
npm run build
```

### 5) Preview production build

```bash
npm run preview
```

## Deployment (GitHub Pages)

This repository includes a GitHub Actions workflow that:

1. Installs dependencies
2. Builds the app
3. Deploys `dist/` to GitHub Pages

### Required one-time GitHub settings

1. Go to **Settings → Pages**.
2. Set **Source** to **GitHub Actions**.
3. Push to the `main` branch to trigger deployment.

### Notes for project pages

If this is hosted at `https://<username>.github.io/ripplehabits/`, make sure Vite uses the repository base path. This project automatically sets `base` to `/<repo>/` during GitHub Actions builds.

## Branch protection recommendations

Use branch protection on `main` with these rules:

- Require pull request before merging (at least 1 approval)
- Require status checks to pass before merging:
  - `build-and-deploy`
- Require branches to be up to date before merging
- Restrict force pushes and branch deletion
- (Optional) Require signed commits

For a checklist version, see [`docs/branch-protection.md`](docs/branch-protection.md).

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE).
