# StartOS Registry

## Documentation

- [start-cli registry reference](https://docs.start9.com/start-os/cli-reference.html) — how to manage packages, categories, mirrors, and OS versions in your registry from the command line.

## What you get on StartOS

- A self-hosted package registry exposed as a **Web API** that other StartOS servers can subscribe to.
- A registry data store you control, so anyone who trusts your registry can install the packages you publish.
- There is no browser UI — all package curation is done from `start-cli` on a machine that has your admin key.

## Getting set up

Install raises two tasks. Both run against the live registry, so start the service first. Until there is an administrator, nobody can publish to it.

1. Run the **Configure Registry** task and set a registry name (and optionally an icon and a description).
2. Run the **Add Administrator** task to register the first admin. You'll need a label, a contact (email address or Matrix username), and the admin's PEM-encoded ed25519 public key — `start-cli pubkey` prints it on the admin's workstation. Whoever holds the matching private key signs every package you publish through this registry.

## Using the registry

### Publishing and curating packages

From a workstation with `start-cli` (1.1.0 or newer) and the admin's private key, point `start-cli` at the Web API address shown on the interface and use the `start-cli registry` subcommands to add packages, categories, mirrors, and OS versions, and to sign releases. The CLI is the only way to do this — the registry has no browser UI. Admin operations are authenticated with a per-request signature, so an older `start-cli` will be rejected. Each request is signed for the address it is sent to, so use an address the interface lists. When you add or remove an address there, the registry restarts itself so the change takes effect.

### Subscribing other servers

On a StartOS server that should install from your registry, add the registry's Web API address as a trusted registry source. From that point on, packages you publish appear in that server's marketplace.

### Actions

- **Configure Registry** — change the registry's display name, icon, and description. The description appears above your services in the marketplace and may use markdown.
- **Add Administrator** — register an additional admin signer. Each admin's public key, label, and contact are stored on the registry; the matching private key stays with the admin.
- **Remove Administrator** — remove an admin signer from the registry, along with every authorization their key holds. Pick the admin to remove from the list of currently registered signers. If you remove the last one, no key can administer the registry.
- **List Packages** — see how many packages your registry hosts and their names.
