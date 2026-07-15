#!/bin/zsh
set -euo pipefail

SCRIPT_DIR="${0:A:h}"
SQL_PATH="$SCRIPT_DIR/reset-mobile-driver-workflow.sql"
DB_URL="${DATABASE_URL:-${NEON_JDBC_URL:-}}"
DB_USER="${PGUSER:-${NEON_DB_USERNAME:-}}"
DB_PASSWORD="${PGPASSWORD:-${NEON_DB_PASSWORD:-}}"

if [[ -z "$DB_URL" || -z "$DB_USER" || -z "$DB_PASSWORD" ]]; then
  echo "Missing database connection settings. Set DATABASE_URL or NEON_JDBC_URL, plus NEON_DB_USERNAME and NEON_DB_PASSWORD."
  exit 1
fi

PSQL_URL="${DB_URL#jdbc:}"
PSQL_URL="${PSQL_URL//channelBinding=/channel_binding=}"

run_with_local_psql() {
  PGPASSWORD="$DB_PASSWORD" psql "$PSQL_URL" -U "$DB_USER" -v ON_ERROR_STOP=1 -f "$SQL_PATH"
}

run_with_docker_psql() {
  docker run --rm \
    -e PGPASSWORD="$DB_PASSWORD" \
    -v "$SCRIPT_DIR":/workspace/scripts \
    -w /workspace/scripts \
    postgres:16 \
    psql "$PSQL_URL" -U "$DB_USER" -v ON_ERROR_STOP=1 -f /workspace/scripts/reset-mobile-driver-workflow.sql
}

run_with_maven_jdbc() {
  mvn -f "$SCRIPT_DIR/../RDP-backend/pom.xml" -q -DskipTests \
    -Dexec.mainClass=com.robustcode.delivery.tools.MobileWorkflowResetRunner \
    -Dexec.args="$SQL_PATH" \
    org.codehaus.mojo:exec-maven-plugin:3.6.1:java
}

if command -v psql >/dev/null 2>&1; then
  run_with_local_psql
elif command -v docker >/dev/null 2>&1 && docker info >/dev/null 2>&1; then
  run_with_docker_psql
elif command -v mvn >/dev/null 2>&1; then
  run_with_maven_jdbc
else
  echo "No supported database client is available. Install psql, start Docker, or use Maven with the backend sources present."
  exit 1
fi

echo "Driver mobile workflow reset complete."
