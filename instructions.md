# StartOS Registry

## Documentation

- [start-cli registry reference](https://docs.start9.com/start-os/cli-reference.html) — manage packages, categories, mirrors, and OS versions from the command line.

## What you get on StartOS

- Independent registries, each with its own **Web API**, packages, signers, and address settings.
- **Manage Registries** to add or disable registries, and **Manage Signers** to control signer permissions and trust offers.
- No browser administration UI: publish and curate packages from your workstation with `start-cli`.

## Getting set up

1. Use **Configure Registry** to set your registry's name, optionally an icon and description.
2. Open **Manage Signers** and expand the section bearing your registry's name. Use its **Signers** list to enter your first signer, with a label, contacts, and public key. For a StartOS identity, `start-cli pubkey` prints the PEM public key on their workstation. You can also paste an armored GPG public-key export. Never paste a private key.
3. Check **Admin** to let this signer administer the registry. Check **Offer for Trust** only if you want connecting StartOS servers to be offered this signer's keys.
4. Use the registry's **Web API** address when publishing from your workstation or subscribing another StartOS server.

## Multiple registries

1. Open **Manage Registries**, add a registry, enter a unique name, and leave **Enabled** checked.
2. Choose that name in **Configure Registry** for its icon and description. Expand its named section in **Manage Signers** to set its independent signers and permissions.
3. Set addresses on its **Web API — <name>** interface. Different registries can use different domains.

Names can be changed in **Manage Registries** or **Configure Registry** without replacing the registry or its addresses. IDs are managed internally. Names queued while a registry is stopped or disabled are applied when it runs again.

Uncheck **Enabled** in **Manage Registries** to stop a registry and hide its interface while keeping its packages, signers, and address settings. Its named entry remains listed; check **Enabled** to restore it. Removing a row also disables it, and the retained entry reappears when you reopen the action. Retained registries still consume disk space and are included in backups.

## Managing signers

**Manage Signers** shows a collapsible section for each enabled registry, labeled by name. Each section contains that registry's editable signer list. Expand several sections to edit labels, contacts, and permissions across registries before submitting once. The built-in list controls create or remove signer entries; submitting applies every section. **Admin** and **Offer for Trust** are separate choices:

- **Admin** grants registry administration. Unchecking it revokes administration without deleting the signer.
- **Offer for Trust** includes the signer's public keys in the trust proposal clients receive from this registry. It does not grant administrator rights.
- Removing a signer also removes its authorizations. You can still use this StartOS action to add an administrator if you remove the last one.

If any registry's signers changed while the form was open, reopen it before saving. Validation happens for every section before changes begin. A later CLI failure can still leave earlier changes applied; reopen the action to inspect them before retrying.

The matching private keys stay with their owners. GPG public exports retain their identities and fingerprints and must contain supported Ed25519 signing keys. Leave existing public keys unchanged; use the upstream CLI to rotate them. Changing an existing key causes a save error.

## Publishing and subscribing

From a workstation holding an authorized private key, point `start-cli` at the chosen registry's Web API address and use the `start-cli registry` commands. Use an address listed on that registry's interface: authenticated requests are signed for their destination hostname. Changing one registry's addresses briefly restarts that registry, not the others.

To use the packages on another StartOS server, add the chosen Web API address as a registry source. **List Packages** gives you a count and alphabetical list of the selected registry's package names.

If you use a separate reverse proxy, forward the RPC, WebSocket, download, and `/icons/` routes. If you publish through a tunnel to keep your home IP private, send outbound traffic through that tunnel too; remote registries and sites the registry fetches from can otherwise see your home IP.

## Display

**Configure Registry** lets you choose a registry by name and change its name, icon, and markdown description. Leave the icon or description blank to clear it.
