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

# If the suppression boolean is true, append the flag.
if [ "${INPUT_SUPPRESSION}" = "true" ]; then
    args+=(--suppression suppressions.xml)
fi

# Execute OWASP Dependency-Check with the built arguments.
/usr/share/dependency-check/bin/dependency-check.sh ${args[@]}