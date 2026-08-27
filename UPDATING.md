# Updating the upstream version

This is a Start9 Labs first-party package. The registry server (`start-registry`) lives in the [StartOS monorepo](https://github.com/Start9Labs/start-os/tree/master/projects/start-registry/) and ships as the prebuilt `ghcr.io/start9labs/startos-registry` image. There is no Dockerfile in this repo; the package pulls the upstream image straight from GHCR.

`start-registry` is versioned **independently** of the StartOS platform (starting at `1.0.0`); its version lives in `projects/start-registry/Cargo.toml`, and a release is cut as a `start-registry/vX.Y.Z` git tag. The package `version` in `startos/versions/current.ts` tracks the version the pinned image reports, which is what `Cargo.toml` declared on the commit that image was built from.

Upstream CI tags each image with the ref it was built from — a branch build takes the branch name, such as `:master`, and a pull-request build takes `:<n>-merge` — so no tag ever names a release. The manifest therefore pins the image **by digest**, so that rebuilding a given commit of this repo packs the same registry daemon it packed the first time. A bump re-resolves that digest. Whether `version` moves with it depends on what the new build reports and on what this repo has already released, and "Applying the bump" below decides.

## Determining the upstream version

- The versions upstream has released:
  ```
  git ls-remote --tags https://github.com/Start9Labs/start-os.git 'refs/tags/start-registry/*'
  ```
- What `master` declares, which the `:master` image carries once CI has rebuilt it:
  ```
  gh api 'repos/Start9Labs/start-os/contents/projects/start-registry/Cargo.toml?ref=master' \
    --jq '.content' | base64 -d | grep '^version'
  ```

These two need not agree. Upstream raises `Cargo.toml` and cuts the `start-registry/vX.Y.Z` tag on its own schedule, so `master` can declare a version no tag names, and it can also declare the newest tag's version while carrying changes made since that release. Neither answer tells you what the pinned image holds — the pinned image settles which number the package declares, and the next section reads it out of the image.

## Resolving the image digest

`:master` is rebuilt on every push to the monorepo's `master` that touches any build input listed under `push.paths` in `.github/workflows/start-registry.yaml` — the workspace `Cargo.lock`, `build/` and `debian/` among them — so it moves for changes that have nothing to do with `start-registry`. Resolve it to the digest it points at right now rather than reasoning about whether it has moved:

```
DIGEST=$(docker buildx imagetools inspect ghcr.io/start9labs/startos-registry:master \
  --format '{{.Manifest.Digest}}')
```

`podman` has no `imagetools` subcommand. Use the form below with `podman`, or with no container runtime at all:

```
TOKEN=$(curl -sS --fail 'https://ghcr.io/token?scope=repository:start9labs/startos-registry:pull&service=ghcr.io' | jq -r .token)
```

```
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

Pin that digest — the multi-architecture index — and not one of the per-architecture children it lists. `start-cli` gives each build a `--platform` of its own — `linux/amd64` for `x86_64`, `linux/arm64` for `aarch64`, `linux/riscv64` for `riscv64` — and a child digest answers for one platform only. `docker` refuses to create the container; `podman` prints a warning and carries on, so every s9pk ends up carrying that one architecture's rootfs and nothing in the build fails. `start-cli` builds with `podman` whenever `docker` is off `PATH`, and also whenever `STARTOS_USE_PODMAN` is set to `1`, `true`, `y` or `yes`.

Both kinds of digest resolve, so check which one you have:

```
docker buildx imagetools inspect "ghcr.io/start9labs/startos-registry@$DIGEST" \
  --format '{{println .Manifest.MediaType}}'
```

or, with a `$TOKEN` minted by the `TOKEN=` block above. Re-run that block on its own in a shell that has none:

```
curl -sS --fail -o /dev/null -w '%{content_type}\n' \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Accept: application/vnd.oci.image.index.v1+json, application/vnd.oci.image.manifest.v1+json' \
  "https://ghcr.io/v2/start9labs/startos-registry/manifests/$DIGEST"
```

An index prints `application/vnd.oci.image.index.v1+json`; a per-architecture child prints `application/vnd.oci.image.manifest.v1+json`. Anything else means the request failed rather than answered: an unset `$TOKEN` or an empty `$DIGEST` prints `text/plain; charset=utf-8` under a `curl: (22)` line. Run the check even when you expect the build to catch the mistake — `docker buildx imagetools inspect` without `--format` lists the children next to the index, so the wrong line is an easy copy.

Then confirm the digest carries the version you are about to declare. This step runs the image, because it carries no label or annotation naming its version. `podman run` works the same way. With no container runtime, run the provenance step below against `$DIGEST` rather than `$PINNED` and read `Cargo.toml` at the commit it names, with the `gh api` form in "Determining the upstream version" above; the image reports the version that commit declared.

```
docker run --rm --entrypoint start-registry \
  "ghcr.io/start9labs/startos-registry@$DIGEST" --version
```

Going the other way — to find out which monorepo commit a digest was built from — read the provenance attestation that buildx pushes beside the image. This reads whichever digest the manifest currently holds, so it names the outgoing build before you edit the pin and the incoming build after. Run it from the repo root:

```
PINNED=$(grep -o 'sha256:[0-9a-f]\{64\}' startos/manifest/index.ts)
```

```
docker buildx imagetools inspect "ghcr.io/start9labs/startos-registry@$PINNED" \
  --format '{{json .Provenance}}' |
  jq -r '.["linux/amd64"].SLSA.buildDefinition.internalParameters.github_event_payload
         // error("no linux/amd64 provenance at this digest — it is a per-architecture child rather than the index, or the build that pushed it published no attestation")
         | "\(.repository.full_name) \(.ref) \(.after)"'
```

or, with a `$TOKEN` minted by the `TOKEN=` block above. Re-run that block on its own in a shell that has none:

```
REPO=https://ghcr.io/v2/start9labs/startos-registry
ATTESTATION=$(curl -sS --fail -H "Authorization: Bearer $TOKEN" \
  -H 'Accept: application/vnd.oci.image.index.v1+json, application/vnd.oci.image.manifest.v1+json' \
  "$REPO/manifests/$PINNED" |
  jq -r '(.manifests // []) as $m
         | ($m | map(select(.platform.architecture == "amd64")) | .[0].digest) as $child
         | ($m | map(select($child != null and .annotations["vnd.docker.reference.digest"] == $child)) | .[0].digest)
           // error("no linux/amd64 provenance at this digest — it is a per-architecture child rather than the index, or the build that pushed it published no attestation")')
BLOB=$(curl -sS --fail -H "Authorization: Bearer $TOKEN" \
  -H 'Accept: application/vnd.oci.image.manifest.v1+json' "$REPO/manifests/$ATTESTATION" |
  jq -r '.layers | map(select(.annotations["in-toto.io/predicate-type"] | test("slsa.dev/provenance"))) | .[0].digest')
curl -sSL --fail -H "Authorization: Bearer $TOKEN" "$REPO/blobs/$BLOB" |
  jq -r '.predicate.buildDefinition.internalParameters.github_event_payload
         | "\(.repository.full_name) \(.ref) \(.after)"'
```

Both print one line: the monorepo, the ref, and the commit the pin was built from. The `curl` form prints it once all three requests succeed; a `curl: (22)` line means one of them failed, so mint the token again and re-run the block.

## Applying the bump

- Compare the resolved digest against the one the manifest holds — `grep -o 'sha256:[0-9a-f]\{64\}' startos/manifest/index.ts` prints the current pin — then set `images['startos-registry'].source.dockerTag` in `startos/manifest/index.ts` to `ghcr.io/start9labs/startos-registry@` followed by the resolved digest.
- Then set `version` in `startos/versions/current.ts`. Three questions decide it: is the resolved digest the one the manifest already held, what version does the new digest report, and has this repo already released the `<version>:<n>` that `current.ts` declares? The comparison above answers the first, and `git ls-remote --tags https://github.com/Start9Labs/startos-registry-startos.git 'refs/tags/v*'` answers the third — a released revision is there as `v<version>_<n>`.
  - **The digest is the one the manifest already held.** `:master` still points at the build the manifest pins, so there is no new image to package. Leave the manifest and the version string alone. If `current.ts` declares a version upstream has not tagged, read its release notes against the CHANGELOG even so: that section stays open, so it can have gained entries since those notes were written.
  - **A new digest, reporting a version `current.ts` does not declare.** Set `version` to `<registry version>:0`. Run the provenance step above once the manifest holds the new digest: it names the commit the pin was built from. Write release notes for what that commit carries, reading `projects/start-registry/CHANGELOG.md` against it rather than copying the section. The section can run ahead of the pin, where entries landed after it, and behind the pin, where the pin sits on a commit later than the tag. Without a `start-registry/v<registry version>` tag the pin is a pre-release build and that section is still open.
  - **A new digest, the same version, and this repo has not released the revision `current.ts` declares.** Leave the version string alone. Read the release notes against the CHANGELOG even so: while upstream has not tagged this version its section stays open, so it can have gained entries since those notes were written.
  - **A new digest, the same version, and this repo has released that revision.** Set `version` to `<registry version>:<n+1>`, where `n` is the highest revision the tag list shows for that version, because the new digest is a different build of the same version. Write release notes for what the new image changed.
- Write the release notes in every locale `current.ts` carries. The field takes any subset, and `npm run check` passes on a translation left describing the previous version, so read each one before committing.
- Build all three architectures:
  ```
  make
  ```
  `make` builds one s9pk per architecture, each on the `--platform` named above, so the pinned index has to carry a child for all three. Each packed manifest declares that one architecture, in `hardwareRequirements.arch` and in `images["startos-registry"].arch`; `make` reads the latter back as the `Arch:` line for each artifact. It records the image as `packed` rather than as a reference, because `pack` copies the image content into the s9pk — the digest itself is not copied, so this repo is the only record of which one a build shipped.
