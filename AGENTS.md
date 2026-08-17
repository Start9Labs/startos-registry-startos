# AGENTS.md

This is a StartOS service-package repository — it builds a `.s9pk` for StartOS.

Develop it inside a StartOS packaging workspace created by `start-cli s9pk init-workspace`,
which provides the packaging guide and agent context one level up. If you're reading this in a
bare clone with no workspace, the full guide is at <https://docs.start9.com/packaging>.

Work this package's `TODO.md` from top to bottom. Keep `README.md` (technical reference for an AI support or administering agent) and `instructions.md` (end-user docs) in sync with your changes.

## This repo

- **`sharedRun: true` on every subcontainer is what makes the actions work.** The `start-registry` CLI reaches the running `start-registryd` over the shared `/run` socket, not the network — drop it and every action fails with no daemon to talk to. It is also why all three are `only-running`.
- **Tor is intentionally not a declared dependency**, even though `tor-startos/startos/utils` is imported for its host id and port. Declaring it would turn an optional path into an install requirement.
- **`registry-hostname` must be rebuilt from the live address set, not appended to.** The daemon serves and signs against the hostnames it knows, so a removed address has to leave the list too — hence the array comparison before writing.
- **Name, icon, and administrators live in the daemon's own store, not `config.yaml`.** Don't add them to the file model; the CLI is the only writer and the actions pre-fill from the live daemon.
- **The image tracks `master`, with no `arch` declared.** A rebuild picks up whatever the branch holds, and architecture support follows the published image rather than the manifest.
