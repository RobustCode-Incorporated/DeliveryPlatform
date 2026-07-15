#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 2 ]]; then
  echo "Usage: $0 <BACKEND_URL> <FRONTEND_URL>"
  echo "Example: $0 https://robust-delivery-platform-backend.onrender.com https://robust-delivery-platform-frontend.onrender.com"
  exit 1
fi

BACKEND_URL="${1%/}"
FRONTEND_URL="${2%/}"

echo "Checking backend health at $BACKEND_URL/actuator/health"
backend_health="$(curl -fsS "$BACKEND_URL/actuator/health")"
echo "Backend health response: $backend_health"

echo "Checking frontend home at $FRONTEND_URL"
frontend_status="$(curl -s -o /dev/null -w '%{http_code}' "$FRONTEND_URL")"
if [[ "$frontend_status" != "200" ]]; then
  echo "Frontend check failed with status $frontend_status"
  exit 1
fi
echo "Frontend status: $frontend_status"

echo "Checking CORS preflight from frontend to backend auth endpoint"
cors_headers="$(curl -s -D - -o /dev/null -X OPTIONS "$BACKEND_URL/api/auth/login" \
  -H "Origin: $FRONTEND_URL" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: content-type,authorization")"

if ! echo "$cors_headers" | grep -qi "access-control-allow-origin"; then
  echo "CORS check failed: missing Access-Control-Allow-Origin header"
  echo "$cors_headers"
  exit 1
fi

echo "CORS headers detected"
echo "Render smoke checks passed"
