# StartOS Registry

## Documentation

- [start-cli registry reference](https://docs.start9.com/start-os/cli-reference.html) — commands for package catalogs, signers, mirrors, and OS versions.

## What you get on StartOS

- Independent registries with separate **Web API** addresses, package catalogs, signers, and permissions.
- **Manage Registries** for names and enabled state, **Configure Registry** for a selected registry's icon and description, and **Manage Signers** for signer access across enabled registries.
- Publish and curate package catalogs from a workstation with `start-cli`; opening a registry's Web API address in a browser redirects to the public Marketplace with that registry selected, rather than a separate registry web application.

## Getting set up

1. Open **Manage Registries**, name the initial entry, and leave **Enabled** checked. You can optionally choose that name in **Configure Registry** to set its icon and description.
2. Open **Manage Signers** and expand the section bearing that registry's name. Add a signer using its **Signers** list. Give the signer a label and public keys; contacts are optional. On the signer's workstation, `start-cli pubkey` prints the public identity key. If that workstation has no identity key, create one with `start-cli init-key` first. You can instead use a complete armored GPG public-key export containing supported Ed25519 signing keys. Never paste private keys.
3. Check **Admin** for the signer that will administer the initial registry. **Offer for Trust** is independent: enable it only when you want clients of that registry to receive the signer's keys as a trust offer. Submit the form.
4. Set addresses on the registry's **Web API — <name>** interface. Use an address listed there when publishing packages or adding this registry as a source on another StartOS server.

## Adding, naming, and restoring registries

1. Open **Manage Registries**, add an entry, enter a unique name, and leave **Enabled** checked. Submit to create it.
2. Choose its name in **Configure Registry** for its icon and description. Expand its named section in **Manage Signers** to set its own signers and permissions; these are not copied from another registry.
3. Set addresses on its **Web API — <name>** interface. Different registries can use different domains.

Change names only in **Manage Registries**. Renaming does not replace a registry or its addresses, and you never need to enter an ID. Names queued while a registry is stopped or disabled apply when it runs again.

To stop a registry without deleting its data, uncheck **Enabled** and submit. Its named entry remains listed; check **Enabled** and submit to restore the same packages, signers, and address settings. Removing a row also disables the registry rather than deleting it, so that retained entry reappears when you reopen the action. Disabled registries still consume disk space and are included in backups.

If no registries are enabled, use **Manage Registries** to enable or restore one before configuring metadata, managing signers, or listing packages.

## Managing signers

**Manage Signers** has a collapsible section for each enabled registry. Expand several sections to edit labels, optional contacts, and permissions before submitting once. The built-in list controls add or remove entries. **Submit applies every section**, including lists that are collapsed.

- **Admin** grants administration rights only in that signer's registry section. Unchecking it keeps the signer and its other authorizations.
- **Offer for Trust** includes the signer's public keys in that registry's trust offer to clients. It does not grant administrator rights.
- Removing a signer deletes its authorizations in that registry when you submit. It does not remove the same key from another registry. You can still add administrators through this StartOS action after revoking the last administrator.

Edit **Public Keys** to add or replace an existing signer's active keys without recreating the signer or losing its permissions. The submitted field defines its active key set. Clearing an existing signer's field revokes all of its active keys while keeping its record and permissions; a new signer still needs at least one key. Upstream may retain older GPG certificate records, but the form shows active signing keys. Private signing keys stay with their owners.

The action checks form values and stale signer state across all sections before starting updates. Once CLI commands begin, an error—including rejection of a new key by the registry—can leave earlier changes applied. Reopen the action to inspect the current lists before retrying.

All enabled registry daemons must be available to open **Configure Registry**, **Manage Signers**, or **List Packages**, even when working with just one registry. If one registry is unavailable, use **Manage Registries** to disable it before managing another.

## Icons and descriptions

**Configure Registry** changes only the selected registry's icon and description. Use a base64 image data URL or an HTTP(S) URL for the icon. Leave either field blank to clear it. Description text supports Markdown and appears above that registry's packages in the marketplace. Clearing it removes all language variants. Icon and description changes use separate commands: if one fails, the other may already have applied. Reopen the action and check both fields before retrying.

## Publishing and subscribing

Use `--registry` to select the registry's **Web API** address for CLI commands:

```bash
start-cli --registry '<registry-web-api-address>' registry info
```

Use the `start-cli registry` commands for package publishing and curation. Publishing and administration require a signer with the appropriate permissions in that registry and its matching private key. For a GPG identity, select its signing key with `--id-key-gpg '<key fingerprint>'`. Otherwise use the identity whose public key you registered. Use an address listed on the chosen interface: authenticated requests are signed for that destination hostname. Changing one registry's addresses briefly restarts that registry, not the others.

**Admin** grants registry-wide administration, including publishing. Registering a non-admin signer or enabling **Offer for Trust** does not grant publishing rights. For an existing package, an administrator can look up the signer's ID and grant package-specific permission:

```bash
start-cli --registry '<registry-web-api-address>' registry admin signer list
start-cli --registry '<registry-web-api-address>' registry package signer add '<existing-package-id>' '<signer-id>'
```

The second command grants all versions by default; use `--versions` to constrain the allowed range. These grants belong only to the targeted registry and are managed through the CLI, not the StartOS signer form.

To subscribe another StartOS server, add the chosen Web API address as a registry source. **List Packages** selects an enabled registry and returns its name, package count, and alphabetical package titles. A result with count zero identifies the selected registry and says its catalog is empty.

If you use a separate reverse proxy, forward the registry's entire API origin, including `/`, RPC, WebSocket, icon, and download traffic. Preserve the public `Host` header and set `X-Forwarded-Proto` to the public scheme (`http` or `https`) so the Marketplace redirect selects the correct registry address. If you publish through a tunnel to keep your home IP private, send outbound traffic through that tunnel too; remote registries and sites the service fetches from can otherwise see your home IP.
