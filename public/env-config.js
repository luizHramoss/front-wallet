// Placeholder for local dev (npm run dev) and the Vite build - overwritten
// at container start by docker/generate-env-config.sh with the real
// runtime API base URL. Left empty so the app falls through to its
// build-time/dev default in src/api/axios.js.
window.__ENV__ = {};
