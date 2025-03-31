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

echo 1 $INPUT_PROJECT
echo 1 $INPUT_SUPPRESSION
echo 3 "${INPUT_SUPPRESSION}"

# If the suppression input is provided, append the flag.
if [ -n "${INPUT_SUPPRESSION}" ]; then
    args+=(--suppression "${INPUT_SUPPRESSION}")
fi

# Execute OWASP Dependency-Check with the built arguments.
/usr/share/dependency-check/bin/dependency-check.sh ${args[@]}