#!/usr/bin/env bash
set -euo pipefail
export PERSONAL_FIXTURE_ROOT="$PWD"
mkdir -p /tmp/personal-curl
cp scripts/personal/smoke-curl.py /tmp/personal-curl/curl
chmod +x /tmp/personal-curl/curl
export PATH="/tmp/personal-curl:$PATH"
# Credentials are generated/test-only; never publish installation output.
if ! bash install.sh v3.11.0 > /tmp/personal-install.log 2>&1; then
    echo 'Installer failed; log kept only on disposable runner (may contain credentials).' >&2
    exit 1
fi
systemctl is-active --quiet x-ui
/usr/local/x-ui/x-ui -v | grep 3.11.0
cmp full/x-ui/x-ui /usr/local/x-ui/x-ui
cmp x-ui.sh /usr/bin/x-ui
for attempt in $(seq 1 30); do
    if /usr/bin/curl -fsS http://127.0.0.1:2053/privacyci/ > /tmp/personal-login.html; then break; fi
    sleep 1
done
test -s /tmp/personal-login.html
/usr/bin/curl -fsS http://127.0.0.1:2053/privacyci/sponsors | python3 -c 'import json,sys; x=json.load(sys.stdin); assert x["success"] and x["obj"]["sponsors"] == []'
status=$(/usr/bin/curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:2053/privacyci/sponsors/logo/test.png)
test "$status" = 404
# A second invocation must fail before touching an existing installation.
if bash install.sh v3.11.0 > /tmp/personal-refusal.log 2>&1; then
    echo 'Installer unexpectedly accepted an existing installation' >&2
    exit 1
fi
grep -q 'Existing installation detected' /tmp/personal-refusal.log
echo 'Fresh Ubuntu installation, systemd startup, HTTP endpoints and overwrite refusal passed.'
