<p align="center">
  <img src="icon.svg" alt="StartOS Registry Logo" width="21%">
</p>

# StartOS Registry on StartOS

> Everything not listed in this document should behave the same as upstream
> StartOS Registry. If a feature, setting, or behavior is not mentioned here,
> the upstream documentation is accurate and fully applicable — see the
> Documentation section of `instructions.md` for links.

[StartOS Registry](https://github.com/Start9Labs/start-technologies/tree/master/projects/start-registry/) indexes signed `.s9pk` packages and serves them to StartOS marketplaces. This package runs independent registry instances under one service, with separate data, signers, and network hosts.

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

## Image and Container Runtime

The package pins a release of `ghcr.io/start9labs/startos-registry`. Each enabled registry runs `start-registryd` in `registry-<id>`; attach to that subcontainer to inspect that instance. Architecture support follows the published image.

Temporary `cli-<id>` subcontainers run `start-registry --registry http://127.0.0.1:<port>` against the selected daemon. Every subcontainer uses `sharedRun: true` to share `/run/startos/registry.authcookie`. Upstream rereads this local administrative cookie on each request; it is shared across the service's registries, not a separate per-registry credential. Explicit loopback URLs prevent ambient CLI profiles from selecting another registry.

Dynamic reconciliation starts, stops, or restarts only affected daemons. Changing one registry's hostnames leaves the other registries running.

## Volume and Data Layout

The package persists application data, daemon configuration, and instance inventory separately.

| Volume    | Content                                                                                 | Container mount                                         |
| --------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| `main`    | `default` uses the volume root; other registries use `registries/<id>/`                 | The selected registry's directory at `/var/lib/startos` |
| `config`  | `default` uses `config.yaml`; others use `registries/<id>.yaml`                         | The selected file at `/etc/startos/config.yaml`         |
| `startos` | `registries.json`: internal IDs, ports, enabled state, cached names, and queued renames | Not mounted                                             |

A registry's store includes hosted assets, index, content-addressed icons, administrator grants, signer records, and trust proposals. The default registry retains the volume root and original network host. No application data is moved during updates.

Disabling or removing a registry retains its data, configuration, port assignment, and host settings. Its named entry remains in Manage Registries; enabling it reuses those resources without exposing its internal ID. Disabled registry data remains in backups and consumes disk space.

## File Models

The instance inventory is seeded from schema defaults during init; daemon YAML files are seeded and maintained for each active registry. File models preserve unmodeled keys.

| File                                                  | Ownership                                                                                                                             |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `startos/registries.json`                             | Manage Registries controls names and enabled state; the package generates stable internal IDs and ports and retains disabled entries. |
| `config/config.yaml` or `config/registries/<id>.yaml` | Per-registry daemon settings; hostname maintenance runs reactively in init, and main writes the optional outbound Tor proxy.          |

Registry names remain in the upstream store. The inventory's `lastKnownName` caches that metadata for stopped or disabled entries; `pendingName` queues a requested name until that daemon is ready. A post-readiness oneshot publishes the name through the CLI, updates the cache, and clears the request. Existing upstream names are cached without being overwritten on upgrade. Name-only changes do not restart the daemon.

The package enforces the listener address and data directory. `registry-hostname` is rebuilt from that registry's enabled non-local interface addresses, never appended. A change restarts only the matching daemon because signed requests are validated against the hostname list read at startup.

The optional `tor-proxy` is written as a SOCKS URL even when Tor is absent; the bridge lookup's fallback port keeps the address stable across Tor installation changes. With no proxy running, outbound requests through it fail normally. Extra upstream settings such as `startwrt: true` survive file-model writes; restart the service after hand-editing such settings.

Published metadata, signers, administrator grants, and trust proposals remain authoritative in the daemon's store. Only names have the explicit cache/queue described above; icon, description, and permission actions read and write the live store directly.

## Dependencies

None declared. The package imports Tor's bridge constants for optional outbound SOCKS access, without making Tor an installation requirement.

## Network Access and Interfaces

Each active registry has an independent HTTP API interface on its own MultiHost. Distinct hosts allow separate domains and address choices.

| Registry  | Host ID         | Interface ID    | Internal port                                                  |
| --------- | --------------- | --------------- | -------------------------------------------------------------- |
| `default` | `api-multi`     | `api`           | 5959                                                           |
| Other IDs | `registry-<id>` | `registry-<id>` | Allocated monotonically above 5959; persisted in the inventory |

The interfaces serve registry RPC, assets, icons, and WebSocket routes. They are unmasked APIs, not browser UIs. Hostnames from one registry are never added to another registry's accepted signing identities.

## Installation and First-Run Flow

A fresh install seeds and starts `default`. No credentials or private keys are generated. Two non-blocking tasks prompt for metadata and an administrator.

Additional registries start empty. They need their own metadata, signers, and address setup; enabling one does not clone another's store. CLI-backed forms query live registries and therefore require their daemons to be available.

## Actions

Configure Registry and List Packages select an enabled registry by name. Manage Signers exposes all enabled registries as named collapsible sections, with one Save for edits across sections. Internal IDs never appear as editable fields or choice labels.

### Manage Registries

Use this to create, rename, enable, or disable registries by name. Names must be nonblank, 1–32 characters, and unique without regard to case. Each new row receives a generated internal ID and stable internal port. Existing IDs remain hidden and unchanged on rename. Disabled entries remain listed so their Enabled toggle restores the same store and addresses. Removing a row disables it rather than purging it; it reappears as disabled on reopening. Stale inventory submissions are rejected before writes.

### Configure Registry

Use this only to change the selected registry's icon and description through its live CLI. Registry naming belongs exclusively to Manage Registries; this form has no name field and cannot queue renames. Changes take seconds and require no restart. Saving the same values is idempotent. Blank icon or description clears the stored value.

### Manage Signers

The form presents one collapsible object per enabled registry, titled with its name rather than its internal ID. Each section pre-fills that registry's signer list, including labels, contacts, public keys, Admin, and Offer for Trust. Expand multiple sections to edit their lists in one submission. Standard list controls create or remove entries; there is no registry selector, operation selector, or separate add form. Saving reconciles each list through its own daemon's CLI. An unchanged list performs no writes and needs no restart.

Admin and Offer for Trust are independent: an administrator need not be offered to clients, and a proposed signer need not administer the registry. Signer removal drops its authorizations; revoking Admin retains the signer and its other authorizations. Trust proposals are maintained as a complete selected-ID set, preserving unrelated signers.

No private key is accepted or stored. New entries accept PEM public keys and complete armored GPG public exports, retaining certificate identities and fingerprints. Upstream imports supported Ed25519 signing keys, not arbitrary RSA or ECDSA keys. Existing public keys cannot be replaced by this action; key rotation uses the upstream CLI. StartOS 0.4.1.2 still allows editing the key field, but saving a changed existing key is rejected before any writes. Editing labels, contacts, and permission flags preserves signer IDs, keys, and package authorizations. Removing a list entry deletes that signer's authorizations.

Every enabled registry's list is loaded when the form opens, including collapsed sections. Before writing to any registry, the handler validates all sections and rejects changes to the enabled registry set, signer records, administrator membership, or trust selection since form open. A malformed or stale later section cannot partially save an earlier one. Subsequent CLI commands across registries are not transactional: after a command failure, reopen the form to inspect completed changes before retrying.

Trust selection uses upstream's full-set replacement API. The action rereads the selected set before changing membership; simultaneous external edits can still overwrite one another.

### List Packages

Use this for a read-only overview of one registry's hosted packages. It returns alphabetically sorted titles, one per package at its newest version, and a count. Entries with no versions are omitted. Reads scale with the index; versions, architectures, categories, and signatures are not included in this summary.

## Tasks

Fresh installs raise two `important` tasks: Manage Registries to name the initial registry, and Manage Signers. Running the corresponding action clears each prompt. These prompts do not block startup and are not re-created on restore or rebuild. Additional registries are configured through the same actions without separate install tasks. Upgrade migration retires the old Configure Registry prompt without creating a replacement on upgrade.

## Health Checks

Each daemon probes its own internal TCP port. The default registry retains the `primary` health-check ID; others use `registry-<id>`. A failure means that registry did not bind its API listener; inspect its `registry-<id>` logs for rejected configuration or store errors. Another registry being healthy cannot satisfy this check.

A CLI action failing while its API port is healthy points instead at local-cookie authentication or CLI arguments. A daemon starting rotates the shared cookie; retry a management action that overlaps that rotation. All enabled daemons must be available for forms that read live state across registries.

## Backups and Restore

All three volumes are copied wholesale with `Backups.ofVolumes`. Backups include every registry's assets and store, daemon settings, enabled-state inventory, and retained disabled instances. Nothing is dumped or excluded, so size follows total hosted content, including disabled instances.

Restore brings back the same active registry set. Init derives each hostname list from the restored server's live addresses. No first-install task is raised.

## Limitations and Differences

1. Registry removal is non-destructive; there is no action to purge retained data.
2. CLI-backed configuration forms require the enabled registry daemons to be available.
3. There is no browser administration UI. Package curation and publishing use an external CLI and the publisher's private key.
4. Categories and other upstream curation settings are not exposed by Configure Registry.
5. Administrator grants and trust proposals are separate decisions. Offering a key does not grant publishing or administrator authority.
6. The package's local loopback-HTTP actions remain available without an administrator key, including recovery after the last admin grant is removed.

## Quick Reference for AI Consumers

```yaml
package_id: startos-registry
image: ghcr.io/start9labs/startos-registry
architectures: as published by the image
subcontainers:
  - registry-<id>
  - cli-<id>
volumes:
  main: per-registry directory mounted at /var/lib/startos
  config: per-registry file mounted at /etc/startos/config.yaml
  startos: not mounted
file_models:
  - startos/registries.json
  - config/config.yaml
  - config/registries/<id>.yaml
startos_managed_env_vars: []
dependencies: []
interfaces:
  api: { type: api, port: 5959 }
  registry-<id>: { type: api, port: allocated per registry }
actions:
  - manage-registries
  - config
  - manage-signers
  - list-packages
tasks:
  - { action: manage-registries, severity: important }
  - { action: manage-signers, severity: important }
health_checks:
  - primary
  - registry-<id> # additional registries
```
