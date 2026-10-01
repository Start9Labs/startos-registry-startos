# Updating the upstream version

This is a Start9 Labs first-party package. The registry server (`start-registry`) lives in the [StartOS monorepo](https://github.com/Start9Labs/start-technologies/tree/master/projects/start-registry/) and ships as the prebuilt `ghcr.io/start9labs/startos-registry` image. There is no Dockerfile in this repo; the package pulls the upstream image straight from GHCR.

`start-registry` is versioned **independently** of the StartOS platform; its version lives in `projects/start-registry/Cargo.toml` and a release is cut as a `start-registry/vX.Y.Z` git tag. The package `version` in `startos/versions/current.ts` tracks that number.

Each release's image is published as `ghcr.io/start9labs/startos-registry:v<version>` — the image upstream's master build of the release commit produced — and the manifest pins that tag. Never pin `:master`, which moves with every merge.

## Determining the upstream version

```
git ls-remote --tags https://github.com/Start9Labs/start-technologies.git 'refs/tags/start-registry/*'
```

## Applying the bump

- Set `images['startos-registry'].source.dockerTag` in `startos/manifest/index.ts` to `ghcr.io/start9labs/startos-registry:v<registry version>`. If that tag doesn't exist yet, the release's image-tagging workflow hasn't run; don't fall back to `:master`.
- Set `version` in `startos/versions/current.ts` to `<registry version>:0` and write release notes for what that release changed (see `projects/start-registry/CHANGELOG.md`).
