# Updating the upstream version

This is a Start9 Labs first-party package. The registry server (`start-registry`) lives in the [StartOS monorepo](https://github.com/Start9Labs/start-os/tree/master/projects/start-registry/) and ships as the prebuilt `ghcr.io/start9labs/startos-registry` image. There is no Dockerfile in this repo; the package pulls the upstream image straight from GHCR.

`start-registry` is versioned **independently** of the StartOS platform (starting at `1.0.0`); its version lives in `projects/start-registry/Cargo.toml`, and a release is cut as a `start-registry/vX.Y.Z` git tag. The package `version` in `startos/versions/current.ts` tracks the version the pinned image reports, which is what `Cargo.toml` declared on the commit that image was built from.

Upstream CI tags each image with the ref it was built from — `:master` for the branch, `:<n>-merge` for a pull request — so no tag ever names a release. The manifest therefore pins the image **by digest**, so that rebuilding a given commit of this repo packs the same registry daemon it packed the first time. A bump re-resolves that digest as well as the `version` string, and the two move in the same commit: the digest picks one `start-registry` build, and `version` is what the package tells users that build is.

## Determining the upstream version

- The versions upstream has released:
  ```
  git ls-remote --tags https://github.com/Start9Labs/start-os.git 'refs/tags/start-registry/*'
  ```
- What `master` declares, which is what a `:master` image carries:
  ```
  gh api repos/Start9Labs/start-os/contents/projects/start-registry/Cargo.toml?ref=master \
    --jq '.content' | base64 -d | grep '^version'
  ```

The two differ whenever `master` has moved past the newest tag. The pinned image settles which number the package declares, and the next section reads it out of the image.

## Resolving the image digest

`:master` is rebuilt on every push to the monorepo's `master` that touches `start-registry` or the shared crates it links, so it moves for plenty of changes that leave the version string alone. Resolve it to the digest it points at right now:

```
DIGEST=$(docker buildx imagetools inspect ghcr.io/start9labs/startos-registry:master \
  --format '{{.Manifest.Digest}}')
```

or, without a container runtime:

```
TOKEN=$(curl -s 'https://ghcr.io/token?scope=repository:start9labs/startos-registry:pull&service=ghcr.io' | jq -r .token)
DIGEST=$(curl -sI --fail -H "Authorization: Bearer $TOKEN" \
  -H 'Accept: application/vnd.oci.image.index.v1+json, application/vnd.docker.distribution.manifest.list.v2+json' \
  https://ghcr.io/v2/start9labs/startos-registry/manifests/master |
  tr -d '\r' | awk 'tolower($1) == "docker-content-digest:" { print $2 }')
```

Both forms print `sha256:` and the hex together, which is the whole reference the manifest wants.

Pin that digest — the multi-architecture index — and not one of the per-architecture children it lists. `start-cli` packs each architecture with `--platform=linux/<arch>`, and a child digest answers for one platform only. `docker` refuses to create the container; `podman` prints a warning and carries on, so every s9pk ends up carrying that one architecture's rootfs and nothing in the build fails.

Then confirm the digest carries the version you are about to declare:

```
docker run --rm --entrypoint start-registry \
  "ghcr.io/start9labs/startos-registry@$DIGEST" --version
```

Going the other way — to find out which monorepo commit a digest already in the manifest was built from — read the provenance attestation that buildx pushes beside the image:

```
docker buildx imagetools inspect "ghcr.io/start9labs/startos-registry@$DIGEST" \
  --format '{{json .Provenance}}' |
  jq -r '.["linux/amd64"].SLSA.buildDefinition.internalParameters.github_event_payload |
         "\(.repository.full_name) \(.ref) \(.after)"'
```

## Applying the bump

- Set `images['startos-registry'].source.dockerTag` in `startos/manifest/index.ts` to `ghcr.io/start9labs/startos-registry@` followed by the resolved digest.
- Set `version` in `startos/versions/current.ts` to `<registry version>:0`, matching the version that digest reports, and write release notes for what that release changed (see `projects/start-registry/CHANGELOG.md`).
- Re-pinning the digest when the upstream version has not moved is a revision bump instead — `<registry version>:<n+1>` — because the image content changed even though its version string did not.
- Build every architecture — the digest has to resolve for each one — and read the version back out:
  ```
  make
  start-cli s9pk inspect startos-registry_x86_64.s9pk manifest | jq -r .version
  ```
  The packed manifest records the image as `packed` rather than as a reference, because `pack` copies the image content into the s9pk. The digest lives in this repo alone, which is what makes the repo the record of what a build shipped.
