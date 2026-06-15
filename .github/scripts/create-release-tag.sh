#!/usr/bin/env bash
set -euo pipefail

TAG_NAME="v${APP_VERSION}"
COMMIT_SHA="${1:?commit sha required}"
GITHUB_TOKEN="${2:?github token required}"
REPOSITORY="${3:?repository owner/name required}"

OWNER="${REPOSITORY%%/*}"
REPO="${REPOSITORY#*/}"

response="$(
    curl -sS -w "\n%{http_code}" -X POST \
        -H "Authorization: token ${GITHUB_TOKEN}" \
        -H "Accept: application/vnd.github+json" \
        "https://api.github.com/repos/${OWNER}/${REPO}/git/refs" \
        -d "{\"ref\":\"refs/tags/${TAG_NAME}\",\"sha\":\"${COMMIT_SHA}\"}"
)"

http_code="${response##*$'\n'}"
body="${response%$'\n'*}"

if [[ "$http_code" == "201" ]]; then
    echo "Created tag ${TAG_NAME}"
    exit 0
fi

if [[ "$http_code" == "422" ]] && echo "$body" | grep -q "Reference already exists"; then
    echo "Tag ${TAG_NAME} already exists"
    exit 0
fi

echo "Failed to create tag ${TAG_NAME} (HTTP ${http_code}): ${body}" >&2
exit 1
