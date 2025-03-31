#!/bin/bash
set -e

# Build base command array.
args=(--project "${INPUT_PROJECT}" \
      --scan "$GITHUB_WORKSPACE/${INPUT_PATH}" \
      --format "${INPUT_FORMAT}" \
      --out "$GITHUB_WORKSPACE/${INPUT_OUT}" \
      --noupdate \
      --enableRetired \
      --failOnCVSS 7)

# If the suppression input is provided, append the flag.
if [ -n "${INPUT_SUPPRESSION_FILE}" ]; then
    args+=(--suppression "${INPUT_SUPPRESSION_FILE}")
fi

# Execute OWASP Dependency-Check with the built arguments.
/usr/share/dependency-check/bin/dependency-check.sh ${args[@]}