#!/usr/bin/env bash
# Assert the build output still matches what the device asks for.
#
# The device builds its own page and loads the UI from the css_url / js_url it
# is configured with (http://<asset-host>/index.css and /index.js), so the
# filenames and the inlined API base are a contract, not a detail. Both halves
# can regress silently: a Vite bump can move files back under assets/, and a
# .env.local in the checkout can bake the dev proxy base into the bundle.
set -euo pipefail

dist=${1:-dist}
fail=0

check() {
  if eval "$2" >/dev/null 2>&1; then
    echo "ok    $1"
  else
    echo "FAIL  $1"
    fail=1
  fi
}

check "index.js at output root"            "test -f '$dist/index.js'"
check "index.css at output root"           "test -f '$dist/index.css'"
check "nothing under assets/"              "! test -d '$dist/assets'"
check "API base is relative (/events)"     "grep -q 'EventSource(\"/events\"' '$dist/index.js'"
check "API base is relative (/kiln/)"      "grep -q 'fetch(\"/kiln/' '$dist/index.js'"
check "dev proxy base not baked in"        "! grep -q '/api/kiln/' '$dist/index.js'"
check "no top-level ESM (classic script)"  "! grep -q '^import\|^export' '$dist/index.js'"

exit $fail
