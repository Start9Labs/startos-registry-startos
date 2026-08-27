# AGENTS.md

This is a StartOS service-package repository — it builds a `.s9pk` for StartOS.

Develop it inside a StartOS packaging workspace created by `start-cli s9pk init-workspace`,
which provides the packaging guide and agent context one level up. If you're reading this in a
bare clone with no workspace, the full guide is at <https://docs.start9.com/packaging>.

**Start every task at the recipe index** — `../start-technologies/projects/start-sdk/docs/src/recipes.md`
(or <https://docs.start9.com/packaging/recipes.html>). It maps an intent ("prompt the user to create
admin credentials", "expose a web UI") to the constructs, the reference pages, and a named production
package to copy. Find the recipe before you read this package's neighbours: a package you reach by
grepping may be non-conformant, and the recipe outranks it.

Freshly scaffolded? Work the
[New Package Checklist](../start-technologies/projects/start-sdk/docs/src/new-package-checklist.md)
(or <https://docs.start9.com/packaging/new-package-checklist.html>) from top to bottom. It is a
guide page, not a file in this repo — read it, don't copy it in.

Keep `README.md` (technical reference for an AI support or administering agent) and
`instructions.md` (end-user docs) in sync with your changes.

**Bugs and feature requests are GitHub issues on this repo** — file them as you find them.
Don't record work in the repo instead: no `TODO.md`, no `NOTES.md`, no `PLAN.md`. What you
verified, tried, and decided belongs in the commit message and the PR body.

## This repo

- **`sharedRun: true` on every subcontainer is what makes the actions work.** `start-registryd` writes an auth cookie to `/run/startos/registry.authcookie`; sharing `/run` is what lets the `start-registry` CLI find it, and the CLI then calls the daemon on `127.0.0.1:5959`. Drop `sharedRun` and every action fails `` `--registry` required ``. It is also why all three are `only-running`.
- **`apiPort` has to stay 5959.** The action subcontainers mount no `config.yaml`, so the CLI never sees `registry-listen` and falls back to start-core's own default. Move the port and the daemon, the interface and the health check all follow it — so the check stays green while every action dials a port nothing is listening on.
- **Tor is intentionally not a declared dependency**, even though `tor-startos/startos/utils` is imported for its host id and port. Declaring it would turn an optional path into an install requirement.
- **`registry-hostname` must be rebuilt from the live address set, not appended to.** The daemon serves and signs against the hostnames it knows, so a removed address has to leave the list too — hence the array comparison before writing.
- **Name, icon, and administrators live in the daemon's own store, not `config.yaml`.** Don't add them to the file model; the CLI is the only writer and the actions pre-fill from the live daemon.
- **The image is pinned by digest, with no `arch` declared.** Upstream publishes no per-release image tag, so a bump re-resolves the digest `:master` points at — `UPDATING.md` has the procedure. The SDK defaults the image to `aarch64`, `x86_64` and `riscv64`, so the pinned index has to cover all three.
