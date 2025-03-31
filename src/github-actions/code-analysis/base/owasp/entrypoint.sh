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

echo 1 $INPUT_SUPPRESSION_FILE
echo 2 "${INPUT_SUPPRESSION-FILE}"
echo 3 "${INPUT_SUPPRESSION_FILE}"

# If the suppression input is provided, append the flag.
if [ -n "${INPUT_SUPPRESSION_FILE}" ]; then
    args+=(--suppression "${INPUT_SUPPRESSION_FILE}")
fi

# Execute OWASP Dependency-Check with the built arguments.
/usr/share/dependency-check/bin/dependency-check.sh ${args[@]}