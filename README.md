<p align="center">
  <img src="icon.svg" alt="StartOS Registry Logo" width="21%">
</p>

# StartOS Registry on StartOS

> Everything not listed in this document should behave the same as upstream
> StartOS Registry. If a feature, setting, or behavior is not mentioned here,
> the upstream documentation is accurate and fully applicable — see the
> Documentation section of `instructions.md` for links.

[StartOS Registry](https://github.com/Start9Labs/start-os/tree/master/projects/start-registry/) is the server behind a StartOS marketplace: it indexes signed `.s9pk` packages and serves them to StartOS servers that add it. This package runs your own, administered entirely by public key — there is no account, no password, and no login anywhere in it.

- **Upstream repo:** <https://github.com/Start9Labs/start-os/tree/master/projects/start-registry/>
- **Wrapper repo:** <https://github.com/Start9Labs/startos-registry-startos/>

---

## Table of Contents

- [Image and Container Runtime](#image-and-container-runtime)
- [Volume and Data Layout](#volume-and-data-layout)
- [File Models](#file-models)
- [Dependencies](#dependencies)
- [Network Access and Interfaces](#network-access-and-interfaces)
- [Installation and First-Run Flow](#installation-and-first-run-flow)
- [Actions](#actions)
- [Tasks](#tasks)
- [Health Checks](#health-checks)
- [Backups and Restore](#backups-and-restore)
- [Limitations and Differences](#limitations-and-differences)
- [Quick Reference for AI Consumers](#quick-reference-for-ai-consumers)

---

## Image and Container Runtime

One image, published by Start9 from the monorepo's `master` branch rather than from a tagged release. The manifest pins it by digest, so every build of a given commit of this repo packs the same registry daemon, and the package version tracks the version that daemon reports.

| Property      | Value                                                   |
| ------------- | ------------------------------------------------------- |
| Image         | `ghcr.io/start9labs/startos-registry`, pinned by digest |
| Architectures | `aarch64`, `x86_64`, `riscv64` — one s9pk each          |
| Command       | `start-registryd`                                       |

| Subcontainer                                                      | Purpose                                                                                |
| ----------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `startos-registry-sub`                                            | The `primary` daemon — the one to `attach` to                                          |
| `get-info`, `set-info`, `add-admin`, `remove-admin`, `delete-key` | Temporary; one per action, plus one per action that reads the daemon to build its form |

**Every subcontainer here is declared `sharedRun: true`, and that is the whole mechanism behind the actions.** They share the daemon's `/run`, so the `start-registry` CLI in a temporary container reaches the running `start-registryd` over its socket rather than over the network. It is also why every action requires the service to be running: with no daemon there is no socket to talk to.

## Volume and Data Layout

Two volumes, one of which is mounted as a single file.

| Volume   | Mount Point                                                | Purpose                                                                     |
| -------- | ---------------------------------------------------------- | --------------------------------------------------------------------------- |
| `main`   | `/var/lib/startos`                                         | The package index, the uploaded `.s9pk` files, and the admin/signer records |
| `config` | its `config.yaml` at `/etc/startos/config.yaml`, as a file | The daemon's configuration                                                  |

The `main` volume grows with whatever you publish — a registry hosting a handful of packages across several versions is measured in gigabytes.

## File Models

One model, holding the daemon's whole configuration. Everything else the registry knows lives in its own store on the `main` volume, reachable only through the CLI.

| File          | Volume   | Format | Modelled                | Written by             |
| ------------- | -------- | ------ | ----------------------- | ---------------------- |
| `config.yaml` | `config` | YAML   | Yes — `FileHelper.yaml` | Every init, and `main` |

| Key                 | Ownership | Notes                                                           |
| ------------------- | --------- | --------------------------------------------------------------- |
| `registry-listen`   | Enforced  | The address the daemon binds inside its container               |
| `datadir`           | Enforced  | The `main` volume's mount point                                 |
| `registry-hostname` | Derived   | Every non-local hostname the API interface publishes            |
| `tor-proxy`         | Derived   | Tor's SOCKS address over the LXC bridge, written on every start |

**`registry-hostname` is the one that matters operationally.** The daemon serves and signs against the hostnames it knows, so init rebuilds the list from the addresses actually published and rewrites the file whenever the set changes. Add a domain to this service and it is in the config on the next start, with nothing to run by hand.

**`tor-proxy` is always written, even with Tor absent.** The bridge lookup carries a fallback port, so the address stays constant whether or not Tor is installed — which keeps a Tor install or uninstall from restarting the registry. With no Tor running, outbound requests through it simply get connection-refused, which the daemon tolerates.

The registry's name, icon, and administrators are **not** in this file. They live in the daemon's own store and are set through the actions.

## Dependencies

None declared. Tor is used if present — see `tor-proxy` above — but is deliberately not a dependency: the registry works without it, and declaring it would make an optional outbound path into an install-time requirement.

## Network Access and Interfaces

One interface. It is what a StartOS server adds as a marketplace, and what a publisher pushes to.

| Interface | Id    | Type | Port | Description                         |
| --------- | ----- | ---- | ---- | ----------------------------------- |
| Web API   | `api` | api  | 5959 | The web API of your custom registry |

The port is bound on the `api-multi` MultiHost and is not masked.

**Publishing an address here is how the registry becomes usable to anyone else**, and it feeds `registry-hostname` directly. A registry only reachable on `.local` works, but only from the same LAN.

## Installation and First-Run Flow

Install raises two tasks and leaves the registry stopped. Nothing is generated and no credential is shown — this service has no accounts.

1. **Start the registry** — its hostnames appear on the **Web API** interface.
2. **Configure Registry** — a name, and optionally an icon. This is what StartOS servers display when they add your registry.
3. **Add Administrator** — a label, a contact, and a **PEM-encoded ed25519 public key**. That key is the whole of the authorization model: administration is proving possession of the matching private key, not logging in.

Both tasks require the service to be running, since both go through the CLI to the live daemon. Both are `important`: the registry serves an empty index perfectly well without them, it just has no identity and nobody who can administer it.

## Actions

Three actions, and **all three are only available while the service is running.**

### Configure Registry

Sets the registry's display name and icon.

- **What it changes:** the daemon's own store, via `start-registry info set-name` / `set-icon`.
- **Cost:** seconds. No restart.
- **Repeat safety:** idempotent, and the form is pre-filled from the live daemon rather than from a file.
- **The icon is a data URL or an http(s) URL**, validated by pattern before it is accepted. Leaving it blank leaves the existing icon in place rather than clearing it.

### Add Administrator

Registers a signer and grants it admin rights.

- **What it changes:** the daemon's store — it adds a signer record with the label, contact, and public key, then grants that signer id admin.
- **Cost:** seconds. No restart.
- **Repeat safety:** each run adds a new administrator; it is not an edit. The daemon refuses a key it already holds and names the signer that has it, so running the action again with the same key changes nothing.
- **The contact is stored as a URL** — an email becomes `mailto:`, a Matrix username becomes a `matrix.to` link.
- **The key must be a PEM-encoded ed25519 public key.** The form's pattern accepts any PEM public key, so the `start-registry` CLI refuses another kind when the action runs, not the form. There is no key generation here: the private half is yours and never touches this server.

### Remove Administrator

Revokes an administrator by removing their signer record.

- **What it changes:** the daemon's store, via `start-registry admin signer remove`.
- **Cost:** seconds. No restart.
- **Repeat safety:** idempotent per administrator; the dropdown is built from the live list.
- **Nothing stops you removing the last one.** Do that and no key can administer the registry any more — recovery means the CLI inside the container.

## Tasks

Two tasks, both raised at install.

| Task               | Severity    | Raised when | Cleared when    |
| ------------------ | ----------- | ----------- | --------------- |
| Configure Registry | `important` | At install  | The action runs |
| Add Administrator  | `important` | At install  | The action runs |

`important` rather than `critical` because the daemon runs and serves regardless. What is missing without them is identity and the ability to publish, not function.

## Health Checks

One check, on the only daemon.

| Check     | Displayed | Method                 |
| --------- | --------- | ---------------------- |
| `primary` | "Web API" | Port 5959 is listening |

The daemon binds quickly, so a failure means it did not start — most often a `config.yaml` value it rejects, which it names in the service logs. Actions failing while this check is green is a different symptom: those go through the shared `/run` socket rather than the port, so a CLI error points at the daemon's store or the argument it was given, not at reachability.

## Backups and Restore

Both volumes are copied wholesale — `sdk.Backups.ofVolumes('config', 'main')`. No dump step and nothing excluded.

- **Included:** every published `.s9pk`, the whole index, the administrator and signer records, and `config.yaml`.
- **Size:** this is the large one. The backup is as big as everything you have ever published and not removed.
- **Restore:** complete, and no task is raised — the name, icon, and administrators come back with the store. If the restored server publishes different addresses, init rewrites `registry-hostname` from the live set on the first start.

## Limitations and Differences

1. **Administration is by public key only.** No accounts, no passwords, no web login — the private key is yours to keep.
2. **Removing the last administrator locks you out** of everything the actions do; nothing warns you first.
3. **Every action needs the service running**, because they reach the daemon over a shared socket rather than a network port.
4. **The image is a build of the monorepo's `master` branch** rather than of a tagged release. The manifest pins one such build by digest.
5. **Categories are set from the CLI, not from an action** — `start-cli registry package category` adds and removes them and assigns packages to them. The Configure Registry action sets name and icon.
6. **Tor is not a dependency**, and a `tor-proxy` value is written whether or not Tor is installed.

---

## Quick Reference for AI Consumers

```yaml
package_id: startos-registry
image: ghcr.io/start9labs/startos-registry # pinned by digest
architectures: [aarch64, x86_64, riscv64] # one s9pk per architecture
subcontainers:
  - startos-registry-sub # the running daemon
  - get-info # temporary; one per action plus one per form-building read, all sharedRun: true
  - set-info
  - add-admin
  - remove-admin
  - delete-key
volumes:
  main: /var/lib/startos
  config: its config.yaml at /etc/startos/config.yaml (file mount)
file_models:
  - config.yaml
startos_managed_env_vars: []
dependencies: [] # tor is used when present but not declared
interfaces:
  api: { type: api, port: 5959 }
actions:
  - config # only-running
  - add-admin # only-running
  - remove-admin # only-running
tasks:
  - { action: config, severity: important }
  - { action: add-admin, severity: important }
health_checks:
  - primary # displayed "Web API"
```
