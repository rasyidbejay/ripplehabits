# Ripple

Ripple is a minimal, modern habit tracker built with React + TypeScript and designed to deploy on GitHub Pages.

## Stack

- Vite
- React + TypeScript
- Tailwind CSS
- React Router
- LocalStorage persistence
- date-fns

## Project structure

```text
src/
  components/
  hooks/
  pages/
  types/
  utils/
```

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Deploy to GitHub Pages

The app is configured with a production `base` path in `vite.config.ts` so routes and assets work on Pages.

```bash
npm run deploy
```

Make sure GitHub Pages is configured to serve from the `gh-pages` branch.
