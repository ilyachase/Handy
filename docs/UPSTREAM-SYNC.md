# Keeping the fork in sync with upstream

This fork (`ilyachase/Handy`) follows **upstream releases** of
[cjpais/Handy](https://github.com/cjpais/Handy), not its `main` branch.

## Layout

- `upstream` remote: `https://github.com/cjpais/Handy.git`.
- `main` = the latest upstream release tag + the fork's commits on top.
- Fork version: `<upstream version>-<n>`, e.g. `0.10.0-1`, in
  `package.json`, `src-tauri/Cargo.toml` (+ `Cargo.lock`) and
  `src-tauri/tauri.conf.json`.

## Weekly check (Saturday)

1. `git fetch upstream --tags`; latest release:
   `gh release view -R cjpais/Handy --json tagName -q .tagName`.
2. Compare with the base in the README ("currently based on `vX.Y.Z`"). Same
   tag → report "no new release" and stop.
3. New tag `vA.B.C`:
   - `git switch -c sync/vA.B.C main`
   - `git rebase --onto vA.B.C <old base tag> sync/vA.B.C`
   - Resolve conflicts keeping upstream behavior plus the fork changes listed
     in the README. If a fork change is now in upstream (check the linked
     discussions/issues), drop the fork commit and say so in the report.
   - Version → `A.B.C-1` in the three files above; README base tag →
     `vA.B.C`.
   - Checks: `cd src-tauri && cargo test`, `bun run lint`,
     `bun run check:translations`, `bun src/components/settings/history/historyText.test.ts`.
   - Push `sync/vA.B.C` and open a PR into `main` with: upstream release
     notes summary, conflicts and how they were resolved, dropped fork
     commits, check results.
4. Never merge the PR or run **Fork Release** without the owner's go-ahead.

## Release

Actions → **Fork Release** → Run workflow on `main`. It creates a draft
release with Windows NSIS and Linux AppImage builds plus `latest.json`
signed with the fork's updater key (`TAURI_SIGNING_PRIVATE_KEY*` secrets).
Publish the draft by hand.

The upstream **Main Branch Build** workflow is disabled in this fork: it
expects upstream's Apple/Azure signing secrets.
