<p align="center">
  <img src="icon.svg" alt="StartOS Registry Logo" width="21%">
</p>

# StartOS Registry on StartOS

> **Upstream docs:** <https://docs.start9.com/start-os/cli-reference.html#s9pk-packaging> | <https://docs.start9.com/start-os/cli-reference.html#registry>
>
> Everything not listed in this document should behave the same as the
> upstream StartOS Registry. If a feature, setting, or behavior is not
> mentioned here, the upstream documentation is accurate and fully
> applicable.

A self-hosted package registry for StartOS. Curate a list of your favorite StartOS services and distribute them to friends, family, and anyone who trusts your registry.

StartOS is designed around an open registry model: anyone, anywhere can establish their own registry. No single entity controls which services are available, and no service can be effectively censored. Users choose which registries to trust, and services can be distributed through multiple independent registries, direct file transfer, or built from source. By running your own registry, you become a distribution point in this decentralized ecosystem.

The upstream source lives in the [StartOS monorepo](https://github.com/Start9Labs/start-os/tree/master/projects/start-registry/). The registry server (`start-registry`) is versioned independently of the StartOS platform, starting at `1.0.0`.

---

## Table of Contents

- [Image and Container Runtime](#image-and-container-runtime)
- [Volume and Data Layout](#volume-and-data-layout)
- [Installation and First-Run Flow](#installation-and-first-run-flow)
- [Configuration Management](#configuration-management)
- [Network Access and Interfaces](#network-access-and-interfaces)
- [Actions (StartOS UI)](#actions-startos-ui)
- [Backups and Restore](#backups-and-restore)
- [Health Checks](#health-checks)
- [Dependencies](#dependencies)
- [Limitations and Differences](#limitations-and-differences)
- [What Is Unchanged from Upstream](#what-is-unchanged-from-upstream)
- [Contributing](#contributing)
- [Quick Reference for AI Consumers](#quick-reference-for-ai-consumers)

---

## Image and Container Runtime

| Property      | Value                                               |
| ------------- | --------------------------------------------------- |
| Image source  | `ghcr.io/start9labs/startos-registry`               |
| Architectures | x86_64, aarch64, riscv64                            |
| Entrypoint    | `start-registryd` (upstream default)                |

The package uses the upstream image unmodified.

## Volume and Data Layout

| Volume   | Mount Point              | Purpose                         |
| -------- | ------------------------ | ------------------------------- |
| `config` | `/etc/startos/config.yaml` (file mount) | Registry configuration |
| `main`   | `/var/lib/startos`       | Registry data directory         |

## Installation and First-Run Flow

On first install, StartOS creates two setup tasks:

1. **Configure Registry** -- set a name and optional icon for your registry
2. **Add Administrator** -- add the first admin with a PEM public key and contact info

Complete both tasks before the registry is ready for use.

## Configuration Management

| StartOS-Managed                          | Upstream-Managed                                        |
| ---------------------------------------- | ------------------------------------------------------- |
| Registry hostnames (synced automatically from interface addresses) | Package index (add/remove via `start-cli registry`) |
| Listen address (`0.0.0.0:5959`)          | Admin signers and permissions                           |
| Tor proxy (resolved from Tor's SOCKS bridge address) | Package categories and mirrors                          |
| Data directory (`/var/lib/startos`)       | OS version registry                                     |
| Registry name and icon (via action)       |                                                         |

Hostnames are synced automatically: when the service's network addresses change, the `registry-hostname` list in `config.yaml` is updated to match.

## Network Access and Interfaces

| Interface | Port | Protocol | Purpose                                |
| --------- | ---- | -------- | -------------------------------------- |
| `api`     | 5959 | HTTP     | Web API for registry queries and management |

The API is exposed via a multi-host binding, accessible over LAN, .local, and .onion addresses. There is no browser UI -- all interaction is through the API and CLI.

## Actions (StartOS UI)

### Configure Registry

- **Purpose:** Set the registry's display name and icon
- **Availability:** Only while running
- **Visibility:** Enabled
- **Inputs:**
  - *Registry Name* (required, max 32 characters)
  - *Registry Icon* (optional, base64 data URL)

### Add Administrator

- **Purpose:** Register a new admin signer with a public key
- **Availability:** Only while running
- **Visibility:** Enabled
- **Inputs:**
  - *Label* (required) -- display name for the admin
  - *Contact* (required) -- email address or Matrix username (e.g. `@user:domain.com`)
  - *Public Key* (required) -- PEM-encoded public key

### Remove Administrator

- **Purpose:** Remove an existing admin signer
- **Availability:** Only while running
- **Visibility:** Enabled
- **Inputs:**
  - *Users* (required) -- select from the current list of admins

## Backups and Restore

Both the `config` and `main` volumes are included in backups. Restoring a backup fully recovers the registry configuration, admin signers, and all indexed packages.

## Health Checks

| Check    | Method         | Success Message         | Error Message             |
| -------- | -------------- | ----------------------- | ------------------------- |
| Web API  | TCP port 5959  | "The web API is ready"  | "The API is unreachable"  |

## Dependencies

None.

## Limitations and Differences

1. **CLI only.** There is no web UI. All registry management beyond the three StartOS actions (configure, add admin, remove admin) must be done via `start-cli registry` and `start-cli s9pk`. Admin and signer requests use the request-signature auth scheme introduced in `start-registry` 1.0.0, so a managing workstation needs `start-cli` 1.1.0 or newer.
2. **No GUI for package management.** Adding, removing, categorizing, and signing packages requires CLI access.
3. **No built-in S3 publishing.** Package distribution relies on the registry API; S3 mirror configuration is done externally.
4. **Categories are not yet configurable via actions.** The Configure Registry action has a placeholder for category management that is not yet implemented.

## What Is Unchanged from Upstream

- Package indexing, signing, and distribution
- Admin signer management (add, remove, edit, list)
- Package category and mirror management
- OS version and asset management
- Registry database operations (dump, apply)
- Ed25519 cryptographic signing for package authenticity
- All `start-cli registry` and `start-cli s9pk` subcommands

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for build instructions and development workflow.

---

## Quick Reference for AI Consumers

```yaml
package_id: startos-registry
image: ghcr.io/start9labs/startos-registry
architectures: [x86_64, aarch64, riscv64]
volumes:
  config: /etc/startos/config.yaml
  main: /var/lib/startos
ports:
  api: 5959
dependencies: none
startos_managed_settings:
  - registry-hostname (auto-synced)
  - registry-listen
  - tor-proxy
  - datadir
  - registry name (via action)
  - registry icon (via action)
actions:
  - config
  - add-admin
  - remove-admin
```
