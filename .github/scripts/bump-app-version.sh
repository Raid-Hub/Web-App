#!/usr/bin/env bash
set -euo pipefail

# Encrypted Vercel env vars are not readable from `vercel pull`, so git tags are
# the source of truth for the production patch number (vYYYY.M.D.P).
CURRENT_YEAR=$(date +%Y)
CURRENT_MONTH=$(date +%-m)
CURRENT_DAY=$(date +%-d)
DATE_PREFIX="${CURRENT_YEAR}.${CURRENT_MONTH}.${CURRENT_DAY}"
TAG_PREFIX="v${DATE_PREFIX}."

LATEST_TAG=$(git tag -l "${TAG_PREFIX}*" | sort -V | tail -1 || true)

if [[ -n "$LATEST_TAG" ]]; then
    PATCH="${LATEST_TAG#"${TAG_PREFIX}"}"
    PATCH=$((PATCH + 1))
else
    PATCH=0
fi

APP_VERSION="${DATE_PREFIX}.${PATCH}"
echo "Computed APP_VERSION=${APP_VERSION} (latest tag: ${LATEST_TAG:-none})"

if [[ -n "${GITHUB_ENV:-}" ]]; then
    echo "APP_VERSION=${APP_VERSION}" >>"$GITHUB_ENV"
fi
