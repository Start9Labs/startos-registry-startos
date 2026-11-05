# StartOS Registry

## Documentation

- [start-cli registry reference](https://docs.start9.com/start-os/cli-reference.html) — manage packages, categories, mirrors, and OS versions from the command line.

## What you get on StartOS

- Independent registries, each with its own **Web API**, packages, signers, and address settings.
- **Manage Registries** to add or disable registries, and **Manage Signers** to control signer permissions and trust offers.
- No browser administration UI: publish and curate packages from your workstation with `start-cli`.

## Getting set up

1. Use **Configure Registry**, select `default`, and set a name, optionally an icon and description.
2. Open **Manage Signers**, select `default`, and add your first signer. Supply their label, contact, and public key. For a StartOS identity, `start-cli pubkey` prints the PEM public key on their workstation. You can also paste an armored GPG public-key export. Never paste a private key.
3. Check **Admin** to let this signer administer the registry. Check **Offer for Trust** only if you want connecting StartOS servers to be offered this signer's keys.
4. Use the registry's **Web API** address when publishing from your workstation or subscribing another StartOS server.

## Multiple registries

1. Open **Manage Registries** and add an ID such as `stable` or `beta`.
2. Use **Configure Registry** and **Manage Signers** for the new registry. Each starts empty and has independent settings and permissions.
3. Set addresses on its **Web API — <id>** interface. Different registries can use different domains.

Keep IDs stable. Changing an ID creates a different registry, not a renamed copy. To rename the marketplace display, use **Configure Registry** instead.

Removing an entry in **Manage Registries** stops that registry and hides its interface but keeps its packages, signers, and address settings. Add the same ID again to bring it back. Retained registries still consume disk space and are included in backups.

## Managing signers

**Manage Signers** adds, edits, or removes a signer on the registry you select. **Admin** and **Offer for Trust** are separate choices:

- **Admin** grants registry administration. Unchecking it revokes administration without deleting the signer.
- **Offer for Trust** includes the signer's public keys in the trust proposal clients receive from this registry. It does not grant administrator rights.
- Removing a signer also removes its authorizations. You can still use this StartOS action to add an administrator if you remove the last one.

The matching private keys stay with their owners. GPG public exports retain their identities and fingerprints and must contain supported Ed25519 signing keys. Use the upstream CLI to rotate an existing signer's keys or change their contacts.

## Publishing and subscribing

From a workstation holding an authorized private key, point `start-cli` at the chosen registry's Web API address and use the `start-cli registry` commands. Use an address listed on that registry's interface: authenticated requests are signed for their destination hostname. Changing one registry's addresses briefly restarts that registry, not the others.

To use the packages on another StartOS server, add the chosen Web API address as a registry source. **List Packages** gives you a count and alphabetical list of the selected registry's package names.

If you use a separate reverse proxy, forward the RPC, WebSocket, download, and `/icons/` routes. If you publish through a tunnel to keep your home IP private, send outbound traffic through that tunnel too; remote registries and sites the registry fetches from can otherwise see your home IP.

## Display

**Configure Registry** changes a registry's display name, icon, and markdown description. Leave the icon or description blank to clear it.
