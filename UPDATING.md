# Updating the upstream version

This is a Start9 Labs first-party package. The registry server (`start-registry`) lives in the [StartOS monorepo](https://github.com/Start9Labs/start-os/tree/master/projects/start-registry/) and ships as the prebuilt `ghcr.io/start9labs/startos-registry` image. There is no Dockerfile in this repo; the package pulls the upstream image straight from GHCR.

`start-registry` is versioned **independently** of the StartOS platform (starting at `1.0.0`); its version lives in `projects/start-registry/Cargo.toml`, and a release is cut as a `start-registry/vX.Y.Z` git tag. The package `version` in `startos/versions/current.ts` tracks the version the pinned image reports, which is what `Cargo.toml` declared on the commit that image was built from.

Upstream CI tags each image with the ref it was built from — `:master` for the branch, `:<n>-merge` for a pull request — so no tag ever names a release. The manifest therefore pins the image **by digest**, so that rebuilding a given commit of this repo packs the same registry daemon it packed the first time. A bump re-resolves that digest as well as the `version` string, and the two move in the same commit: the digest picks one `start-registry` build, and `version` is what the package tells users that build is.

## Determining the upstream version

- The versions upstream has released:
  ```
  git ls-remote --tags https://github.com/Start9Labs/start-os.git 'refs/tags/start-registry/*'
  ```
- What `master` declares, which the `:master` image carries once CI has rebuilt it:
  ```
  gh api repos/Start9Labs/start-os/contents/projects/start-registry/Cargo.toml?ref=master \
    --jq '.content' | base64 -d | grep '^version'
  ```

`master` keeps declaring the newest tag's version until the next release bumps `Cargo.toml`, so the two agree for most of a release cycle even while `master` moves on. The pinned image settles which number the package declares, and the next section reads it out of the image.

## Resolving the image digest

`:master` is rebuilt on every push to the monorepo's `master` that touches any build input listed under `push.paths` in `.github/workflows/start-registry.yaml` — the workspace `Cargo.lock`, `build/` and `debian/` among them — so it moves for changes that have nothing to do with `start-registry`. Resolve it to the digest it points at right now rather than reasoning about whether it has moved:

```
DIGEST=$(docker buildx imagetools inspect ghcr.io/start9labs/startos-registry:master \
  --format '{{.Manifest.Digest}}')
```

or, without a container runtime:

```
TOKEN=$(curl -sS --fail 'https://ghcr.io/token?scope=repository:start9labs/startos-registry:pull&service=ghcr.io' | jq -r .token)
DIGEST=$(curl -sSI --fail -H "Authorization: Bearer $TOKEN" \
  -H 'Accept: application/vnd.oci.image.index.v1+json, application/vnd.docker.distribution.manifest.list.v2+json' \
  https://ghcr.io/v2/start9labs/startos-registry/manifests/master |
  tr -d '\r' | awk 'tolower($1) == "docker-content-digest:" { print $2 }')
```

Both forms leave the digest — the `sha256:` prefix and the hex together — in `$DIGEST` rather than printing it. Display it, and run the rest of this section in the same shell:

```
echo "$DIGEST"
```

An empty line means the resolve failed. The manifest wants that value with `ghcr.io/start9labs/startos-registry@` in front of it.

Pin that digest — the multi-architecture index — and not one of the per-architecture children it lists. `start-cli` gives each build a `--platform` of its own — `linux/amd64` for `x86_64`, `linux/arm64` for `aarch64`, `linux/riscv64` for `riscv64` — and a child digest answers for one platform only. `docker` refuses to create the container; `podman` prints a warning and carries on, so every s9pk ends up carrying that one architecture's rootfs and nothing in the build fails.

Both kinds of digest resolve, so check which one you have:

```
docker buildx imagetools inspect "ghcr.io/start9labs/startos-registry@$DIGEST" \
  --format '{{.Manifest.MediaType}}'
```

An index prints `application/vnd.oci.image.index.v1+json`; a per-architecture child prints `application/vnd.oci.image.manifest.v1+json`.

Then confirm the digest carries the version you are about to declare. This step needs a container runtime — the image carries no label or annotation naming its version:

```
docker run --rm --entrypoint start-registry \
  "ghcr.io/start9labs/startos-registry@$DIGEST" --version
```

Going the other way — to find out which monorepo commit a digest already in the manifest was built from — read the provenance attestation that buildx pushes beside the image. This reads the pin out of the manifest, which is not necessarily the digest you just resolved:

```
PINNED=$(grep -o 'sha256:[0-9a-f]\{64\}' startos/manifest/index.ts)
docker buildx imagetools inspect "ghcr.io/start9labs/startos-registry@$PINNED" \
  --format '{{json .Provenance}}' |
  jq -r '.["linux/amd64"].SLSA.buildDefinition.internalParameters.github_event_payload
         // error("no build provenance on this digest — pin the multi-architecture index, not a per-architecture child")
         | "\(.repository.full_name) \(.ref) \(.after)"'
```

## Applying the bump

- Set `images['startos-registry'].source.dockerTag` in `startos/manifest/index.ts` to `ghcr.io/start9labs/startos-registry@` followed by the resolved digest.
- Set `version` in `startos/versions/current.ts` to `<registry version>:0`, matching the version that digest reports, and write release notes for what that version changed (see `projects/start-registry/CHANGELOG.md`). Check for a `start-registry/v<registry version>` tag first: without one the pin is a pre-release build, and that version's CHANGELOG section can still gain entries, so take notes only for the changes the pinned commit already carries.
- Re-pinning the digest of a version this repo has already released is a revision bump instead — `<registry version>:<n+1>`, where `n` is the revision already in `startos/versions/current.ts` — because the image content changed even though its version string did not. Write release notes for what the new image changed.
- A version this repo has not released yet has no `v<version>_<n>` tag, which `git ls-remote --tags origin` shows. Re-resolve its digest in place and leave the version string alone.
- Build every architecture — the digest has to resolve for each one:
  ```
  make
  ```
  `make` prints the packed version once per architecture. That string comes from `startos/versions/current.ts` rather than from the image, so it confirms the edit reached all three s9pks and nothing more; the image's own version is the one `docker run … --version` reported above, and the two have to agree. The packed manifest records the image as `packed` rather than as a reference, because `pack` copies the image content into the s9pk. The digest lives in this repo alone, which is what makes the repo the record of what a build shipped.
