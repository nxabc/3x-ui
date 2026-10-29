# Privacy Edition — implementation and acceptance status

## Scope

Source: user-supplied `3x-ui-3.11.0.tar.gz`, SHA256
`93480008d098f030ee8e4254599526e7b9d26de0c460e8d10fd30aa0ce18c5e2`.
The archive has no upstream Git history. `archive-v3.11.0` is a local snapshot,
not proof of equivalence to the upstream signed/tagged release.

Login and dashboard sponsor slots are removed. The sponsor route/menu remain;
the page contains static content and the official voluntary donation link.
The sponsor hook performs no request. The compatible backend list returns
`{"sponsors":[]}`; logo requests return the existing unknown-logo error.
All sponsor download/cache helpers have been removed so they cannot be reused
accidentally. Database, protocols and Xray service code are unchanged.

Panel release checks use `nxabc/3x-ui`. An unauthenticated latest-release 404
means no available update, never a fallback to upstream. Private repositories
can supply `XUI_PANEL_GITHUB_TOKEN` through a protected service environment file
(root only, mode 0600); use a fine-grained contents-read token scoped to this
repository. Authenticated errors remain errors. Tokens are never compiled into
the binary or sent to redirects. Package downloads are manual: web/CLI panel
update paths are blocked. The standalone `install.sh` now supports fresh
Debian/Ubuntu AMD64 installation only, pinned to the personal v3.11.0 full
package; it refuses an existing panel/database/environment and requires a
published checksum. It cannot be used to update a running installation.
Xray's independent official update path is unchanged.

## Build and publication

The separate `personal-installer-build.yml` assembles a complete initial-install
bundle from the verified official v3.11.0 archive and the already released
personal panel. All original `bin/` files are checked unchanged; the panel
binary remains byte-for-byte identical to the personal release. Both binary
and installer source commits are recorded. A real installation is tested on
a disposable Ubuntu runner (systemd, login HTTP, empty sponsors/404 logos and
refusal to overwrite), with Debian 13 binary startup checked in a container.
External domain certificate issuance and full VM acceptance remain separate.
Publishing these additional assets requires explicitly dispatching `release.yml`
after this exact commit's full-installer build succeeds. Existing assets are
never overwritten; the published version/tag stays v3.11.0.

`privacy-build.yml` tests and builds a **panel-only upgrade artifact** on Ubuntu
24.04 AMD64. It uploads Actions artifacts and cannot publish releases or deploy.
The AMD64 binary is statically linked with musl to avoid host glibc version
dependence. Actual target OS smoke testing is still required.
The existing full release and Docker workflows now require manual dispatch;
do not dispatch them until their release packaging has been reviewed and the
privacy build has passed. A release must be explicitly reviewed and published
by the owner. This work does not automatically push commits or launch Actions.

Local checks: `node scripts/privacy/check.mjs`, `git diff --check`.
Go/frontend compilation, Go runtime tests, browser/network acceptance and the
GitHub Actions run are **pending**, not passing. No binary is supplied yet.
Do not install this development snapshot in production.

## Required runtime acceptance (isolated Linux test host only)

1. Build the frontend and panel; use a disposable database and test certificates.
2. Record backend DNS and outbound traffic from process start through login,
   dashboard, sponsor page, and repeated sponsor API/logo calls. Confirm zero
   requests to the former `raw.githubusercontent.com/MHSanaei/sponsors/` source
   or any new advertising host. Other official features legitimately use the
   network; do not equate all GitHub traffic with advertising.
3. Inspect browser network logs on all three pages: no sponsor JSON/logo request
   and no third-party advertising image/script. Check no blank banner remains.
4. Verify password login, HTTPS, TOTP, representative inbounds/clients,
   subscription formats, traffic, backup/restore, Telegram and API operations.
5. Independently update Xray in the test environment; verify the panel binary
   hash is unchanged. Confirm panel update attempts fail without launching a
   downloader/process and only fork releases affect version notifications.

The Go privacy test exercises service calls with a live local trap server and
a default HTTP transport trap. It is a regression guard, not OS-level proof
against all possible transports. The above packet/browser capture is required.

## Production change and rollback plan (NOT executed)

This artifact upgrades an existing compatible installation; it omits Xray,
sidecars, geodata and service files. It includes the hardened `x-ui.sh` CLI;
replace the installed `/usr/bin/x-ui` with this script during the approved
upgrade as well, otherwise the old CLI could still invoke the official updater.
It is not a fresh installer.

Before any deployment, record panel/Xray versions, binary hashes, service unit
and drop-ins (`systemctl cat x-ui`), environment paths and database type. Locate
all TLS keys/certificates and subscription/config files. Back up `/etc/x-ui`,
the entire `/usr/local/x-ui` tree, CLI and service files, preserving owners and
permissions. For SQLite use a consistent online backup or a stopped-service
copy including WAL handling; for PostgreSQL take and test a `pg_dump` restore.
Store encrypted backups off the server. Verify the backup can be restored.

After explicit owner approval and a maintenance window: verify the downloaded
artifact's hash against an authenticated trusted release record, inspect its
contents and static-link metadata, stop the service, take a final consistent backup, preserve
the old binary and CLI, replace the panel binary and `/usr/bin/x-ui` with the
included hardened CLI (preserving owner and executable permissions), start
and run smoke checks. Do not overwrite certificates, environment, DB or bin/.
No new database migration is introduced by these patches; future upstream
updates may migrate schema and must be tested on a copy first.

Rollback: stop the service; restore the previous binary and associated service/
CLI files. If a migration occurred, restore the matching pre-upgrade database
backup before restarting; never run an older panel on an unverified newer DB.
Restore original certificate/config permissions and verify login/subscriptions.
These steps are a plan only: no VPS has been contacted or changed.

## Maintaining upstream

`origin` is `https://github.com/nxabc/3x-ui.git`; `upstream` is
`https://github.com/MHSanaei/3x-ui.git`. Work on `privacy-edition`.
Fetch upstream tags, verify the supplied archive against actual v3.11.0 before
claiming an official baseline, then retain/replay the privacy diff on a branch
based on the verified tag. Do not rewrite a shared branch without agreement.

For each later upstream update, create a temporary integration branch, merge
the selected official tag, resolve privacy changes narrowly, scan sponsor/ad
components and outbound request sites throughout backend/frontend/scripts,
and inspect new domains. Run full upstream tests, privacy guards, build and
isolated runtime acceptance above. Review the final diff for DB/protocol/Xray
changes inherited from upstream. Owner approval is required before publishing;
production deployment is a separate explicitly authorized task.
