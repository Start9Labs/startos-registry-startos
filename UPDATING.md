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

`:master` is rebuilt on every push to the monorepo's `master` that touches any build input listed under `push.paths` in `.github/workflows/start-registry.yaml` — the workspace `Cargo.lock`, `build/` and `debian/` among them — so it moves for changes that have nothing to do with `start-registry`. It also moves when someone runs that workflow by hand from the Actions tab. Resolve it to the digest it points at right now rather than reasoning about whether it has moved:

```
DIGEST=$(docker buildx imagetools inspect ghcr.io/start9labs/startos-registry:master \
  --format '{{.Manifest.Digest}}')
```

`podman` has no `imagetools` subcommand. Use the two blocks below with `podman`, or with no container runtime at all — the first mints a pull token, the second resolves the tag:

```
TOKEN=$(curl -sS --fail 'https://ghcr.io/token?scope=repository:start9labs/startos-registry:pull&service=ghcr.io' | jq -e -r .token)
```

```
DIGEST=$(curl -sSI --fail -H "Authorization: Bearer $TOKEN" \
  -H 'Accept: application/vnd.oci.image.index.v1+json, application/vnd.docker.distribution.manifest.list.v2+json, application/vnd.oci.image.manifest.v1+json' \
  https://ghcr.io/v2/start9labs/startos-registry/manifests/master |
  tr -d '\r' | awk 'tolower($1) == "docker-content-digest:" { print $2 }')
```

Both forms leave the digest — the `sha256:` prefix and the hex together — in `$DIGEST` rather than printing it. Display it, and run the rest of this section in the same shell:

```
echo "$DIGEST"
```

An empty line means the resolve failed. The manifest wants that value with `ghcr.io/start9labs/startos-registry@` in front of it.

Pin that digest — the multi-architecture index — and not one of the per-architecture children it lists. `start-cli` gives each build a `--platform` of its own — `linux/amd64` for `x86_64`, `linux/arm64` for `aarch64`, `linux/riscv64` for `riscv64` — and a child digest answers for one platform only. Pin a child and `docker` refuses to create the container, so the build stops. `podman` takes it instead: podman warns, `start-cli` discards that warning, and every s9pk ends up carrying that one architecture's rootfs under a manifest still declaring the architecture it was packed for. `make` prints its usual per-architecture success summary and exits `0`. `start-cli` builds with `podman` whenever `docker` is off `PATH`, and also whenever `STARTOS_USE_PODMAN` is set to `1`, `true`, `y` or `yes`.

Both kinds of digest resolve, so check which one you have:

```
docker buildx imagetools inspect "ghcr.io/start9labs/startos-registry@$DIGEST" \
  --format '{{println .Manifest.MediaType}}'
```

or, with a `$TOKEN` minted by the `TOKEN=` block above — run that block on its own if this shell has none:

```
curl -sS --fail -o /dev/null -w '%{content_type}\n' \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Accept: application/vnd.oci.image.index.v1+json, application/vnd.oci.image.manifest.v1+json' \
  "https://ghcr.io/v2/start9labs/startos-registry/manifests/$DIGEST"
```

An index prints `application/vnd.oci.image.index.v1+json`, or `application/vnd.docker.distribution.manifest.list.v2+json` for a Docker-format one. Everything an index lists — the per-architecture children, and the attestation manifests that sit beside them — prints a single-manifest type instead: `application/vnd.oci.image.manifest.v1+json`, or `application/vnd.docker.distribution.manifest.v2+json` under a Docker-format index. Anything else means the request failed rather than answered, and the `curl: (22)` line above it carries the status. GHCR answers `404` for a `$DIGEST` that is empty or that it does not hold, and any other status points at the token. Run the check even when you expect the build to catch the mistake — `docker buildx imagetools inspect` without `--format` lists all of them next to the index, so the wrong line is an easy copy.

An index still has to carry a child for every architecture `make` builds, and a partial one passes the check above because it is an index. Confirm all three are there:

```
docker buildx imagetools inspect "ghcr.io/start9labs/startos-registry@$DIGEST" --raw |
  jq -e -r '[(.manifests // [])[].platform | select(.architecture != "unknown") | "\(.os)/\(.architecture)"] | sort as $have
            | if (["linux/amd64", "linux/arm64", "linux/riscv64"] - $have) == [] then "all three architectures present"
              else error("this digest carries \($have) — make needs linux/amd64, linux/arm64 and linux/riscv64") end'
```

or, with a `$TOKEN` minted by the `TOKEN=` block above — run that block on its own if this shell has none:

```
curl -sS --fail -H "Authorization: Bearer $TOKEN" \
  -H 'Accept: application/vnd.oci.image.index.v1+json, application/vnd.oci.image.manifest.v1+json' \
  "https://ghcr.io/v2/start9labs/startos-registry/manifests/$DIGEST" |
  jq -e -r '[(.manifests // [])[].platform | select(.architecture != "unknown") | "\(.os)/\(.architecture)"] | sort as $have
            | if (["linux/amd64", "linux/arm64", "linux/riscv64"] - $have) == [] then "all three architectures present"
              else error("this digest carries \($have) — make needs linux/amd64, linux/arm64 and linux/riscv64") end'
```

Both print `all three architectures present`, or exit non-zero naming the architectures the digest does carry — an empty list when it is not an index at all. A `curl: (22)` line is an HTTP failure rather than the guard rejecting the digest. GHCR answers `404` for a `$DIGEST` that is empty or that it does not hold, and any other status points at the token. A pull-request build can be single-architecture, so a digest that is genuinely an index still needs this check.

Then confirm the digest carries the version you are about to declare. This step runs the image, because the image carries no label or annotation naming its version. `podman run` works the same way. With no container runtime, run the provenance step below with `PINNED="$DIGEST"` in place of its `PINNED=` block; the rest of it needs no edit. That step names a commit. Read `Cargo.toml` at that commit with the `gh api` form in "Determining the upstream version" above, replacing `master` in its URL. For a branch build such as `:master`, the image reports the version that commit declared.

```
docker run --rm --entrypoint start-registry \
  "ghcr.io/start9labs/startos-registry@$DIGEST" --version
```

Going the other way — to find out which monorepo commit a digest was built from — read the provenance attestation that buildx pushes beside the image. The assignment below is a snapshot of the manifest, not a live read: it names the outgoing build until you edit the pin, and the incoming build once you have. Run it from the repo root, and run it again after every edit to the pin:

```
PINNED=$(grep -oE 'startos-registry@sha256:[0-9a-f]+' startos/manifest/index.ts | sed 's|.*@||')
```

```
echo "$PINNED"
```

One `sha256:` line is the pin, and the step below takes exactly one. Two lines mean the manifest holds a second digest. An empty line means the manifest holds no digest, or that the command ran outside the repo root, in which case `grep` says so above.

```
docker buildx imagetools inspect "ghcr.io/start9labs/startos-registry@$PINNED" \
  --format '{{json .Provenance}}' |
  jq -e -r '.["linux/amd64"].SLSA.buildDefinition.internalParameters.github_event_payload
            // error("no linux/amd64 provenance at this digest — it is a per-architecture child, an attestation manifest, a single-platform index, or a build that published no attestation")
            | (.after // .pull_request.head.sha) as $sha
            | if $sha == null then error("this provenance names no commit") else
                "\(.repository.full_name) \(.ref // .pull_request.head.ref) \($sha)" end'
```

or, with a `$TOKEN` minted by the `TOKEN=` block above — run that block on its own if this shell has none:

```
REPO=https://ghcr.io/v2/start9labs/startos-registry
ATTESTATION=$(curl -sS --fail -H "Authorization: Bearer $TOKEN" \
  -H 'Accept: application/vnd.oci.image.index.v1+json, application/vnd.oci.image.manifest.v1+json' \
  "$REPO/manifests/$PINNED" |
  jq -e -r '(.manifests // []) as $m
         | ($m | map(select(.platform.architecture == "amd64")) | .[0].digest) as $child
         | ($m | map(select($child != null and .annotations["vnd.docker.reference.digest"] == $child)) | .[0].digest)
           // error("no linux/amd64 provenance at this digest — it is a per-architecture child, an attestation manifest, a single-platform index, or a build that published no attestation")') &&
BLOB=$(curl -sS --fail -H "Authorization: Bearer $TOKEN" \
  -H 'Accept: application/vnd.oci.image.manifest.v1+json' "$REPO/manifests/$ATTESTATION" |
  jq -e -r '.layers | map(select((.annotations["in-toto.io/predicate-type"] // "") | test("slsa.dev/provenance")))
         | .[0].digest // error("this attestation carries no SLSA provenance layer")') &&
curl -sSL --fail -H "Authorization: Bearer $TOKEN" "$REPO/blobs/$BLOB" |
  jq -e -r '.predicate.buildDefinition.internalParameters.github_event_payload
         | (.after // .pull_request.head.sha) as $sha
         | if $sha == null then error("this provenance names no commit") else
             "\(.repository.full_name) \(.ref // .pull_request.head.ref) \($sha)" end'
```

On an index carrying amd64 provenance both print one line: the monorepo, then the ref and the commit the pin was built from. The monorepo prints as `Start9Labs/start-technologies`, or as `Start9Labs/start-os` for a build from before the rename. A pull-request build names its own branch and head commit, and its image is built from that commit merged into its base. On anything else both raise and exit non-zero. `this provenance names no commit` means the build was started by hand from the Actions tab rather than by a push; such a build can carry upstream's `dev` feature set, so wait for the next push build rather than pinning it. A `curl: (22)` line is an HTTP failure rather than the guard rejecting the digest, and it carries the status. A `404` means `$PINNED` is empty or names a digest GHCR does not hold, so print it again and check it against the manifest. Any other status points at the token, so mint it again.

## Applying the bump

- Compare the resolved digest against the one the manifest holds — `grep -oE 'startos-registry@sha256:[0-9a-f]+' startos/manifest/index.ts | sed 's|.*@||'` prints the current pin. If they differ, set `images['startos-registry'].source.dockerTag` in `startos/manifest/index.ts` to `ghcr.io/start9labs/startos-registry@` followed by the resolved digest.
- Then set `version` in `startos/versions/current.ts`. Three questions decide it: is the resolved digest the one the manifest already held, what version does the new digest report, and what has this repo already released? The comparison above answers the first, the version check answers the second, and `git ls-remote --tags https://github.com/Start9Labs/startos-registry-startos.git 'refs/tags/v*' | sort -V -k2` answers the third — every released revision is there as `v<version>_<n>`.
  - **The digest is the one the manifest already held.** `:master` still points at the build the manifest pins, so there is no new image to package: leave the manifest alone. Leave the version string alone as well, unless the version check reported a version `current.ts` does not declare — a version string that disagrees with the pinned image is wrong whether or not the digest moved. In that case set `version` to `<registry version>:0` — or to `<registry version>:<n+1>` if the tag list already shows a `v<registry version>_<n>`, taking the highest `n` it shows — and write the release notes from the commit the provenance step above already named. If `current.ts` declares a version upstream has not tagged, read its release notes against the CHANGELOG even so: that section stays open, so it can have gained entries since those notes were written.
  - **A new digest, reporting a version `current.ts` does not declare.** Set `version` to `<registry version>:0` — or to `<registry version>:<n+1>` if the tag list already shows a `v<registry version>_<n>`, taking the highest `n` it shows. That happens when this repo's work branch was cut before that version shipped. Run the provenance step above once the manifest holds the new digest: it names the commit the pin was built from. Write release notes for what that commit carries, reading `projects/start-registry/CHANGELOG.md` against it rather than copying the section. The section can run ahead of the pin, where entries landed after it, and behind the pin, where the pin sits on a commit later than the tag. Without a `start-registry/v<registry version>` tag the pin is a pre-release build and that section is still open.
  - **A new digest, the same version, and this repo has not released the revision `current.ts` declares.** Leave the version string alone. Read the release notes against the CHANGELOG even so: the new digest is a different build of that version, so the notes can describe a commit the pin no longer sits on.
  - **A new digest, the same version, and this repo has released that revision.** Set `version` to `<registry version>:<n+1>`, where `n` is the highest revision the tag list shows for that version, because the new digest is a different build of the same version. Write release notes for what the new image changed.
- Write the release notes in every locale the package ships; `startos/manifest/i18n.ts` lists them. The field takes any subset and its type constrains no key, so `npm run check` passes on a translation left describing the previous version and on a mistyped locale key alike — StartOS renders `notes[lang] ?? notes.en_US ?? the first key`, so a typo quietly serves English and a missing `en_US` serves whichever locale comes first. Read every entry before committing.
- Build all three architectures:
  ```
  make
  ```
  `make` builds one s9pk per architecture, each on the `--platform` named above, so the pinned index has to carry a child for all three. Each packed manifest declares that one architecture, in `hardwareRequirements.arch` and in `images["startos-registry"].arch`; `make` reads the latter back as the `Arch:` line for each artifact. That manifest records the image as `packed` rather than as a reference, because `pack` copies the image content into the s9pk. The digest is not copied, so this repo is the only record of which digest a build shipped.
