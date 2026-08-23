#!/bin/sh
# Runs automatically on container start (nginx's official image executes
# every script in /docker-entrypoint.d/ before starting nginx). Writes the
# runtime API base URL into a small JS file the app reads before falling
# back to its build-time default - see src/api/axios.js.
set -e

cat > /usr/share/nginx/html/env-config.js <<EOF
window.__ENV__ = {
  VITE_API_BASE_URL: "${API_BASE_URL:-}"
};
EOF
