#!/usr/bin/env bash
set -euo pipefail
mkdir -p inputs full overlay
fetch() { curl -fL --retry 4 --connect-timeout 20 --max-time 600 -o "$2" "$1"; }
upstream=https://github.com/MHSanaei/3x-ui/releases/download/v3.11.0
personal=https://github.com/nxabc/3x-ui/releases/download/v3.11.0
fetch "$upstream/x-ui-linux-amd64.tar.gz" inputs/x-ui-linux-amd64.tar.gz
fetch "$upstream/x-ui-linux-amd64.tar.gz.sha256" inputs/x-ui-linux-amd64.tar.gz.sha256
(cd inputs && sha256sum -c x-ui-linux-amd64.tar.gz.sha256)
if [[ -n "${PERSONAL_PANEL_ARCHIVE:-}" ]]; then
    cp "$PERSONAL_PANEL_ARCHIVE" inputs/privacy-panel-linux-amd64.tar.gz
    cp "$PERSONAL_PANEL_ARCHIVE.sha256" inputs/privacy-panel-linux-amd64.tar.gz.sha256
else
    fetch "$personal/privacy-panel-linux-amd64.tar.gz" inputs/privacy-panel-linux-amd64.tar.gz
    fetch "$personal/privacy-panel-linux-amd64.tar.gz.sha256" inputs/privacy-panel-linux-amd64.tar.gz.sha256
fi
(cd inputs && sha256sum -c privacy-panel-linux-amd64.tar.gz.sha256)
tar -xzf inputs/x-ui-linux-amd64.tar.gz -C full
tar -xzf inputs/privacy-panel-linux-amd64.tar.gz -C overlay
test -f full/x-ui/x-ui
test -x full/x-ui/bin/xray-linux-amd64
(cd full/x-ui && find bin -type f -print0 | sort -z | xargs -0 sha256sum) > inputs/core-before.sha256
cp overlay/x-ui full/x-ui/x-ui
cp x-ui.sh install.sh LICENSE PRIVACY.md full/x-ui/
cp overlay/SOURCE_COMMIT full/x-ui/PANEL_SOURCE_COMMIT
printf '%s\n' "$GITHUB_SHA" > INSTALLER_SOURCE_COMMIT
cp INSTALLER_SOURCE_COMMIT full/x-ui/
chmod +x full/x-ui/x-ui full/x-ui/x-ui.sh full/x-ui/install.sh
(cd full/x-ui && sha256sum -c ../../inputs/core-before.sha256)
full/x-ui/x-ui -v | grep 3.11.0
cmp overlay/x-ui full/x-ui/x-ui
tar -czf x-ui-linux-amd64.tar.gz -C full x-ui
sha256sum x-ui-linux-amd64.tar.gz > x-ui-linux-amd64.tar.gz.sha256
sha256sum install.sh > install.sh.sha256
