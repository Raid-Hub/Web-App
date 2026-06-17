#!/usr/bin/env bash
# Finalize the Sentry release for APP_VERSION and resolve issues referenced via
# "Fixes WEBSITE-XX" in the merge commit message (inRelease = APP_VERSION).
#
# Requires SENTRY_ISSUE_AUTH_TOKEN (user/org token with event:write + org:read).
# The Vercel integration token cannot update issues.
set -euo pipefail

APP_VERSION="${APP_VERSION:?APP_VERSION is required}"
ORG="${SENTRY_ORG:-raidhub}"
PROJECT="${SENTRY_PROJECT:-website}"
TOKEN="${SENTRY_ISSUE_AUTH_TOKEN:-}"

if [[ -z "$TOKEN" ]]; then
    echo "SENTRY_ISSUE_AUTH_TOKEN not set — skipping Sentry issue resolution."
    exit 0
fi

COMMIT_SHA="${GITHUB_SHA:-}"
COMMIT_MSG=""
if [[ -n "$COMMIT_SHA" ]]; then
    COMMIT_MSG="$(git log -1 --format=%B "$COMMIT_SHA" 2>/dev/null || true)"
fi

api() {
    local method="$1"
    local path="$2"
    local body="${3:-}"
    local url="https://sentry.io/api/0${path}"
    if [[ -n "$body" ]]; then
        curl -sS -f -X "$method" \
            -H "Authorization: Bearer ${TOKEN}" \
            -H "Content-Type: application/json" \
            -d "$body" \
            "$url"
    else
        curl -sS -f -X "$method" \
            -H "Authorization: Bearer ${TOKEN}" \
            "$url"
    fi
}

echo "Syncing Sentry release ${APP_VERSION} for ${ORG}/${PROJECT}..."

# Ensure release exists and mark production deploy (idempotent).
api POST "/organizations/${ORG}/releases/" \
    "{\"version\":\"${APP_VERSION}\",\"projects\":[\"${PROJECT}\"]}" \
    2>/dev/null || true

api POST "/organizations/${ORG}/releases/${APP_VERSION}/deploys/" \
    '{"environment":"production"}' \
    2>/dev/null || true

api PUT "/organizations/${ORG}/releases/${APP_VERSION}/" \
    "{\"dateReleased\":\"$(date -u +%Y-%m-%dT%H:%M:%S.000Z)\"}" \
    2>/dev/null || true

if [[ -z "$COMMIT_MSG" ]]; then
    echo "No commit message — release synced, skipping issue resolution."
    exit 0
fi

mapfile -t ISSUE_SHORT_IDS < <(echo "$COMMIT_MSG" | grep -oE 'WEBSITE-[0-9A-Z]+' | sort -u)

if [[ ${#ISSUE_SHORT_IDS[@]} -eq 0 ]]; then
    echo "No Fixes WEBSITE-* references in commit — release synced only."
    exit 0
fi

echo "Resolving ${#ISSUE_SHORT_IDS[@]} issue(s) in release ${APP_VERSION}..."

for short_id in "${ISSUE_SHORT_IDS[@]}"; do
    encoded_query="$(python3 -c "import urllib.parse; print(urllib.parse.quote('issue:${short_id}'))")"
    issue_json="$(api GET "/projects/${ORG}/${PROJECT}/issues/?query=${encoded_query}&limit=1" || echo '[]')"
    numeric_id="$(echo "$issue_json" | python3 -c "
import json, sys
data = json.load(sys.stdin)
for item in data:
    if item.get('shortId') == '${short_id}':
        print(item['id'])
        break
" 2>/dev/null || true)"

    if [[ -z "$numeric_id" ]]; then
        echo "  ${short_id}: not found, skipping"
        continue
    fi

    api PUT "/issues/${numeric_id}/" \
        "{\"status\":\"resolved\",\"statusDetails\":{\"inRelease\":\"${APP_VERSION}\"}}" \
        >/dev/null

    echo "  ${short_id} -> resolved in ${APP_VERSION}"
done

echo "Sentry sync complete."
