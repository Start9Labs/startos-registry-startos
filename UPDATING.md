# Updating the upstream version

This is a Start9 Labs first-party package. The registry source lives in the [StartOS monorepo](https://github.com/Start9Labs/start-os/tree/master/core/startos/src/registry/) and ships as the prebuilt `ghcr.io/start9labs/startos-registry` image. There is no Dockerfile in this repo; the package pulls the upstream image straight from GHCR. The image tag is currently pinned to `:master`, so "bumping" usually means re-pointing at a new commit/tag once StartOS itself ships a release that affects the registry.

## Determining the upstream version

- **StartOS** ([Start9Labs/start-os](https://github.com/Start9Labs/start-os)) — latest release:
  ```
  gh release view -R Start9Labs/start-os --json tagName -q .tagName
  ```
  The image tag pin lives in `startos/manifest/index.ts` (`images['startos-registry'].source.dockerTag`).

## Applying the bump

- **StartOS** — edit `startos/manifest/index.ts` and set `images['startos-registry'].source.dockerTag` to `ghcr.io/start9labs/startos-registry:<new tag>` (or leave it at `:master` to continue tracking the tip of the upstream branch).
