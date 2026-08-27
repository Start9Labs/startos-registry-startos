# Updating the upstream version

This is a Start9 Labs first-party package. The registry server (`start-registry`) lives in the [StartOS monorepo](https://github.com/Start9Labs/start-os/tree/master/projects/start-registry/) and ships as the prebuilt `ghcr.io/start9labs/startos-registry` image. There is no Dockerfile in this repo; the package pulls the upstream image straight from GHCR.

`start-registry` is versioned **independently** of the StartOS platform (starting at `1.0.0`); its version lives in `projects/start-registry/Cargo.toml`, and a release is cut as a `start-registry/vX.Y.Z` git tag. The package `version` in `startos/versions/current.ts` tracks the version the pinned image reports, which is what `Cargo.toml` declared on the commit that image was built from.

Upstream CI tags each image with the ref it was built from — `:master` for the branch, `:<n>-merge` for a pull request — so no tag ever names a release. The manifest therefore pins the image **by digest**, so that rebuilding a given commit of this repo packs the same registry daemon it packed the first time. A bump re-resolves that digest; the `version` string moves with it in the same commit, unless the new build reports the version the package already declares. The digest picks one `start-registry` build, and `version` is what the package tells users that build is.

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

Expect these two to disagree. Upstream raises `Cargo.toml` to the next, still-unreleased version as soon as the first change after a release lands, and cuts the `start-registry/vX.Y.Z` tag when that version ships — so `master` declares a version no tag names for as long as a release is accumulating. The pinned image settles which number the package declares, and the next section reads it out of the image.

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

or, reusing the `$TOKEN` from the runtime-free resolve above — `podman` has no `imagetools`:

```
curl -sS --fail -o /dev/null -w '%{content_type}\n' \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Accept: application/vnd.oci.image.index.v1+json, application/vnd.oci.image.manifest.v1+json' \
  "https://ghcr.io/v2/start9labs/startos-registry/manifests/$DIGEST"
```

An index prints `application/vnd.oci.image.index.v1+json`; a per-architecture child prints `application/vnd.oci.image.manifest.v1+json`. Run it even if you expect the build to catch the mistake: `docker` refuses a child at `create` time, but `podman` only warns, so a `podman` build of all three architectures succeeds with a child pinned.

Then confirm the digest carries the version you are about to declare. This step runs the image, because it carries no label or annotation naming its version. `podman run` works the same way:

```
docker run --rm --entrypoint start-registry \
  "ghcr.io/start9labs/startos-registry@$DIGEST" --version
```

Going the other way — to find out which monorepo commit a digest was built from — read the provenance attestation that buildx pushes beside the image. This reads whichever digest the manifest currently holds, so it names the outgoing build before you edit the pin and the incoming build after:

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
- Then set `version` in `startos/versions/current.ts`. Two questions decide it: what version does the new digest report, and has this repo already released the `<version>:<n>` that `current.ts` declares? `git ls-remote --tags origin` answers the second — a released revision is there as `v<version>_<n>`.
  - **The digest reports a version `current.ts` does not declare.** Set `version` to `<registry version>:0` and write release notes for what that version changed (see `projects/start-registry/CHANGELOG.md`). Check for a `start-registry/v<registry version>` tag first: without one the pin is a pre-release build, and that version's CHANGELOG section can still gain entries, so take notes only for the changes the pinned commit already carries — the provenance step above names that commit once the manifest holds the new digest.
  - **The same version, and this repo has not released the revision `current.ts` declares.** Leave the version string alone. Read the release notes against the CHANGELOG even so: the section of a version upstream has not tagged stays open, so it can have gained entries since those notes were written.
  - **The same version, and this repo has released that revision.** Set `version` to `<registry version>:<n+1>`, where `n` is the revision `current.ts` declares, because the image content changed even though its version string did not. Write release notes for what the new image changed.
- Build all three architectures:
  ```
  make
  ```
  The image entry declares `aarch64`, `x86_64` and `riscv64` in the packed manifest — the SDK's default, since the source names no `arch` — so the pinned index has to cover all three. The packed manifest records the image as `packed` rather than as a reference, because `pack` copies the image content into the s9pk, so this repo is the only record of which digest a build shipped.
