# Updating the upstream version

This is a Start9 Labs first-party package. The registry server (`start-registry`) lives in the [StartOS monorepo](https://github.com/Start9Labs/start-os/tree/master/projects/start-registry/) and ships as the prebuilt `ghcr.io/start9labs/startos-registry` image. There is no Dockerfile in this repo; the package pulls the upstream image straight from GHCR.

`start-registry` is versioned **independently** of the StartOS platform (starting at `1.0.0`); its version lives in `projects/start-registry/Cargo.toml` and is cut as a `start-registry/vX.Y.Z` git tag. The package `version` in `startos/versions/current.ts` tracks that number.

The image is pinned to `:master`. CI only publishes `:master` (and per-PR `:<n>-merge`) tags — there is no per-release image tag — so `:master` is the tip of `start-registry` and carries whatever version `Cargo.toml` declares. "Bumping" therefore means re-pointing the package `version` at the registry's current release once the monorepo ships one.

## Determining the upstream version

- **start-registry** — latest released version:
  ```
  git ls-remote --tags https://github.com/Start9Labs/start-os.git 'refs/tags/start-registry/*'
  ```
  or read it directly from the manifest:
  ```
  gh api repos/Start9Labs/start-os/contents/projects/start-registry/Cargo.toml?ref=master \
    --jq '.content' | base64 -d | grep '^version'
  ```

## Applying the bump

- Edit `startos/versions/current.ts` and set `version` to `<registry version>:0` (matching the newest `start-registry` release), then write release notes for what that release changed (see `projects/start-registry/CHANGELOG.md`).
- Leave `images['startos-registry'].source.dockerTag` at `ghcr.io/start9labs/startos-registry:master` — no semver image tag is published, and `:master` already carries the released version.
