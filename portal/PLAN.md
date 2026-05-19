# Registry Portal — Plan

> Status: design draft, no code yet. This document is the source of truth for
> the portal subproject until the directories below it contain real code.

This s9pk evolves into a **multi-tenant registry host**. A single install
runs N `start-registryd` subcontainers — one per *registry instance* — and
ships a web portal that authenticates users, manages signer keys, and drives
admin / package operations across every instance running on the box.

The architecture relies on a small proposed SDK addition,
`Daemons.dynamic`, that lets the daemon chain be a reactive function of
on-disk state (`instances.yaml`). The portal writes the file; the SDK diffs
the new chain against the running one and starts / stops / restarts
daemons accordingly. No service restart, no in-portal process supervision,
and each registry runs in its own subcontainer.

---

## Table of Contents

- [Goals and Non-Goals](#goals-and-non-goals)
- [Core Concept: Registry Instances](#core-concept-registry-instances)
- [Architecture](#architecture)
- [Directory Layout](#directory-layout)
- [Single Volume](#single-volume)
- [The `Daemons.dynamic` SDK Addition](#the-setupdynamicdaemons-sdk-addition)
- [Reactive Wiring](#reactive-wiring)
- [Instance Lifecycle (in-portal)](#instance-lifecycle-in-portal)
- [Portal Server](#portal-server)
- [Portal Web App](#portal-web-app)
- [Auth: Local + Pocket-ID](#auth-local--pocket-id)
- [Crypto and Key Custody](#crypto-and-key-custody)
- [Upload Flow](#upload-flow)
- [Promote Flow](#promote-flow)
- [Remote Registries (Secondary)](#remote-registries-secondary)
- [StartOS Integration](#startos-integration)
- [Migration from v0.4.0.2](#migration-from-v0402)
- [Phasing](#phasing)
- [Fallback Architectures](#fallback-architectures)
- [Open Questions](#open-questions)

---

## Goals and Non-Goals

### Goals

1. **Run multiple `start-registryd` processes in one s9pk install.** Each
   has its own name/icon, port, data dir, config, admin signer set,
   package index, hostnames, and `.onion`.
2. **Lifecycle is fully in-portal.** Create, rename, and delete instances
   from the portal UI with no StartOS service restart and no separate
   StartOS action click-through. The portal writes `instances.yaml`;
   `Daemons.dynamic` reconciles the running daemon set.
3. **Web portal in front of all instances.** One login surface. Switch
   between instances in the UI. Admin signers, packages, categories,
   mirrors, uploads, and promotions all work from the browser.
4. **Two auth methods that coexist:** local username / password
   (argon2id) and Pocket-ID (OIDC). A portal user maps to zero or more
   registry signer identities across any subset of running instances.
5. **In-browser key vault.** Encrypted Ed25519 keys in IndexedDB. Private
   keys never reach the portal server. One-click "apply my signature".
6. **First-class promote.** Move an indexed package version from one
   instance to another (local-to-local, or local-to-remote), preserving
   author signatures and optionally adding the current user's
   co-signature.

### Non-Goals (for v1)

- Per-instance resource quotas (CPU, RAM, disk).
- Auto-replication between instances. Promote is a manual user action.
- Hardware-token signing. Architected so a future `Signer` interface can
  add hardware backends.

---

## Core Concept: Registry Instances

An **instance** is the unit of multi-tenancy. Concretely:

```yaml
# /var/lib/portal/instances.yaml  (written by portal, read reactively by SDK)
instances:
  - id: alice-pkgs           # slug, stable, unique
    label: Alice's Packages   # display name
    port: 5959                # port exposed by this instance's subcontainer
    createdAt: 2026-05-13T12:34:56Z
  - id: experimental
    label: Experimental
    port: 5960
    createdAt: 2026-05-13T13:00:00Z
```

Each instance owns its slice of the filesystem and the network:

| Resource              | Per-instance path / value                               |
| --------------------- | ------------------------------------------------------- |
| Subcontainer name     | `reg-<id>-sub`                                          |
| Data dir (in-container)| `/var/lib/startos`  (bind-mounted from a per-id subpath)|
| Config (in-container) | `/etc/startos/config.yaml`  (bind-mounted file)         |
| Listen port           | `<assigned at create>` (in-container)                   |
| StartOS interface     | `api-<id>` (multi-host, its own LAN/.local/.onion)      |
| StartOS health check  | `instance-<id>`  (declared per daemon, free with C)     |

Instance IDs are slugs (`^[a-z][a-z0-9-]{0,30}$`). Stable, used as
filesystem / interface / daemon keys, never reused after deletion.

---

## Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│  s9pk: startos-registry                                              │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │ daemon: portal              (image: startos-registry-portal)   │  │
│  │   node /app/server                                             │  │
│  │   :3000 → ui interface                                         │  │
│  │   stateless: auth + proxy + UI; no process supervision          │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐    │
│  │ daemon: reg-alice│  │ daemon: reg-exp..│  │       ...        │    │
│  │  image: startos- │  │  image: startos- │  │                  │    │
│  │    registry      │  │    registry      │  │                  │    │
│  │  start-registryd │  │  start-registryd │  │                  │    │
│  │  :5959           │  │  :5960           │  │                  │    │
│  │  mounts:         │  │  mounts:         │  │                  │    │
│  │   main subpath = │  │   main subpath = │  │                  │    │
│  │     instances/   │  │     instances/   │  │                  │    │
│  │     alice/data → │  │     experm/data →│  │                  │    │
│  │     /var/lib/    │  │     /var/lib/    │  │                  │    │
│  │     startos      │  │     startos      │  │                  │    │
│  │                  │  │                  │  │                  │    │
│  │   main subpath = │  │   main subpath = │  │                  │    │
│  │     instances/   │  │     instances/   │  │                  │    │
│  │     alice/cfg →  │  │     experm/cfg → │  │                  │    │
│  │     /etc/startos │  │     /etc/startos │  │                  │    │
│  │     /config.yaml │  │     /config.yaml │  │                  │    │
│  │                  │  │                  │  │                  │    │
│  │  ready: TCP :5959│  │  ready: TCP :5960│  │                  │    │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘    │
│                                                                      │
│  Daemon chain (and interfaces, health checks) declared via            │
│  Daemons.dynamic, reactive on instances.yaml.                     │
│                                                                      │
│  Interfaces: ui + api-<id>   (one per instance)                       │
│  Health checks: portal + instance-<id>  (one per instance)            │
│                                                                      │
│  Volumes:                                                            │
│    main → /var/lib/portal   (single volume; holds everything)        │
└──────────────────────────────────────────────────────────────────────┘
```

Key points:

- **Each registry runs in its own subcontainer** from the unmodified
  upstream `ghcr.io/start9labs/startos-registry` image. Per-instance
  state is provided via `Mounts` that bind the per-id subpath onto the
  fixed paths the binary expects (`/var/lib/startos`,
  `/etc/startos/config.yaml`). **No upstream patch required.**
- **The portal is stateless** with respect to registry processes. It
  doesn't fork, doesn't supervise, doesn't restart. It writes
  `instances.yaml`, owns the SQLite for portal users / sessions /
  remote-registry list, and proxies HTTP.
- **`Daemons.dynamic` is the engine.** It's the proposed SDK
  addition that makes the daemon chain a reactive function of
  `instances.yaml`. See [the SDK Addition](#the-setupdynamicdaemons-sdk-addition).
- **Per-instance health checks are free.** Each `reg-<id>` daemon
  declares its own `ready`; StartOS pulls it through to the UI badge on
  the `api-<id>` interface.
- **No service restart on instance lifecycle.** Portal writes file →
  reactive re-run → diff → start the new subcontainer. Browser sessions
  on the portal stay connected.

---

## Directory Layout

```
startos-registry-startos/
├── portal/
│   ├── PLAN.md                    ← this document
│   ├── Dockerfile                 ← Node 20 + portal server + SPA bundle
│   ├── server/                    ← Node.js + TypeScript backend
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── index.ts           ← HTTP entrypoint
│   │       ├── config.ts          ← reads /var/lib/portal/config/portal.yaml
│   │       ├── instances/         ← read/write instances.yaml (file lock)
│   │       ├── db/                ← SQLite schema + DAOs
│   │       ├── auth/
│   │       │   ├── local.ts       ← argon2id password hashing
│   │       │   ├── session.ts     ← signed cookies
│   │       │   └── oidc.ts        ← Pocket-ID via openid-client
│   │       └── routes/
│   │           ├── auth.ts
│   │           ├── profile.ts
│   │           ├── instances.ts   ← list, create, delete, rename
│   │           └── proxy.ts       ← /api/r/<id>/*
│   └── web/                       ← SPA, Vite-built static bundle
│       ├── package.json
│       ├── vite.config.ts
│       └── src/
│           ├── main.ts
│           ├── crypto/
│           │   ├── vault.ts       ← AES-GCM + PBKDF2 over IndexedDB
│           │   └── ed25519.ts     ← @noble/curves wrapper
│           ├── api/               ← typed client for portal + registry
│           ├── stores/            ← session, vault, current instance
│           └── routes/
│               ├── login/
│               ├── profile/
│               ├── signers/
│               ├── instances/     ← list, create, delete, switch
│               ├── packages/
│               ├── upload/
│               └── promote/
└── startos/                       ← existing s9pk control plane
    ├── main.ts                    ← Daemons.dynamic reading instances.yaml
    ├── interfaces.ts              ← reactive: iterates instances + ui
    ├── fileModels/
    │   ├── instances.yaml.ts      ← NEW: list of instances
    │   ├── instanceConfig.yaml.ts ← per-instance registry config factory
    │   └── portal.yaml.ts         ← NEW: OIDC config, session secret pointer
    ├── actions/
    │   ├── resetPortalPassword.ts ← NEW: emergency local-user reset
    │   ├── configurePortal.ts     ← NEW: Pocket-ID issuer / client id / secret
    │   └── index.ts
    └── init/
        ├── portalInit.ts          ← NEW: SQLite migrate + seed admin task
        ├── setHostnames.ts        ← refactor: iterate instances reactively
        └── index.ts
```

Notable removals compared with earlier drafts:

- No in-portal supervisor module (`portal/server/src/supervisor/`).
- No `createInstance` / `deleteInstance` / `renameInstance` StartOS
  actions. Lifecycle is all portal API.
- No `addAdmin` / `removeAdmin` / `configureInstance` StartOS actions.
- No `healthChecks.ts` — per-instance ready is declared inline on each
  daemon via the `Daemons.dynamic` builder.

The Vite build emits a static bundle baked into the portal Docker image
and served by the Node server. No separate web server.

---

## Single Volume

The manifest collapses to a single `main` volume mounted at
`/var/lib/portal`. Layout:

```
/var/lib/portal/
├── instances.yaml                 ← source of truth, portal writes, SDK reads
├── portal.db                      ← SQLite: users, sessions, oidc_links, ...
├── session.key                    ← signed-cookie secret
├── config/
│   └── portal.yaml                ← OIDC config, written by configurePortal action
└── instances/
    └── <id>/
        ├── data/                  ← bind-mounted onto /var/lib/startos in the reg-<id> subcontainer
        └── config.yaml            ← bind-mounted onto /etc/startos/config.yaml in the reg-<id> subcontainer
```

One volume, one backup, no partial-restore inconsistency. The portal
image runs as a dedicated user; `instances/<id>/` and `portal.db` are
owned by that user, and the registry subcontainers run as their own
upstream user with the per-instance subpaths chowned at first-spawn.

---

## The `Daemons.dynamic` SDK Addition

The architecture rests on a small proposed addition to start-sdk. **It
does not exist yet** and is the only piece of upstream work this plan
requires.

### Proposed API

```ts
// @start9labs/start-sdk
export type DaemonsBuilder<M extends T.SDKManifest> =
  (opts: { effects: T.Effects }) => Promise<Daemons<M, any>>

export const Daemons.dynamic: <M extends T.SDKManifest>(
  fn: DaemonsBuilder<M>,
) => T.ExpectedExports.main
```

The shape mirrors `setupMain`. The difference is internal: the wrapper
installs `effects.constRetry` as an in-place re-run that re-invokes
`fn`, diffs the new `Daemons` chain against the running one, and
reconciles.

### Diff semantics

Every entry in the chain (`Daemon`, `Oneshot`, standalone
`HealthCheck`) is identified by its `id`. The SDK computes a stable
`configHash` over the entry's structural args (image id, mounts spec,
exec command, env, requires, ready descriptor).

For each `id`:

| Prior state          | Next state           | Action           |
| -------------------- | -------------------- | ---------------- |
| absent               | present              | **start**        |
| present              | absent               | **stop**         |
| present, same hash   | present, same hash   | **leave alone**  |
| present, diff hash   | present, diff hash   | **restart**      |

`leave alone` is the load-bearing case. An unrelated re-run (e.g. the
file got `touch`ed but content didn't change) must not bounce every
daemon.

### Subcontainer identity

For diff/reuse to work without spinning fresh subcontainers on every
re-run, either:

- **(a)** `SubContainer.of(effects, { imageId, sharedRun }, mounts, name)`
  becomes idempotent on `(name, imageId, mountsHash)` — returns the
  existing subcontainer if one was created with the same key on a
  previous run; or
- **(b)** `addDaemon` accepts a `subcontainer` *descriptor* (image, mounts,
  name) and the SDK constructs the subcontainer at start time and
  destroys it at stop time.

(b) is cleaner and is what the proposed PR should land on. (a) is a
shim that minimizes churn in existing packages.

### Effects scoping

Each daemon receives `effects.child(`daemon-${id}`)` so that
`onLeaveContext` cleans up its subscriptions when the daemon is
stopped. Already aligns with the existing `child(name)` pattern on
`Effects`.

### Failure handling

If a newly-started daemon never reaches its `ready` state, the SDK
surfaces a `failure` health status on that daemon's id but does not
roll back the rest of the reconcile. Matches how a normally-spawned
daemon behaves when stuck.

### Coalescing

Multiple `constRetry` triggers fired during an in-flight reconcile are
coalesced into one follow-up re-run. Prevents thrash if the file is
edited multiple times in quick succession.

### Required SDK PRs

1. `Daemons.dynamic` factory in `package/lib/mainFn/`.
2. Diff/reconcile logic on the `Daemons` chain (probably a new
   `DaemonsReconciler` class that consumes the chain returned by
   `fn` and is rebuilt on each re-run).
3. Subcontainer descriptor pattern (option **b** above) in
   `package/lib/util/SubContainer.ts` or the `mainFn` layer.
4. Documentation + a small example in
   `package/lib/test/` showing dynamic daemons driven by a yaml file.

These changes are **not in `@start9labs/start-sdk@1.5.1`** as of this
writing. M0 of this plan is the SDK PR.

### Drop-in for our `main.ts`

```ts
export const main = sdk.Daemons.dynamic(async ({ effects }) => {
  const { instances } = (await instancesYaml.read().const(effects)) ?? { instances: [] }
  let daemons = sdk.Daemons.of(effects).addDaemon('portal', portalDaemon(effects))

  for (const inst of instances) {
    daemons = daemons.addDaemon(`reg-${inst.id}`, {
      subcontainer: {
        imageId: 'startos-registry',
        sharedRun: true,
        name: `reg-${inst.id}-sub`,
        mounts: sdk.Mounts.of()
          .mountVolume({
            volumeId: 'main',
            subpath: `/instances/${inst.id}/data`,
            mountpoint: '/var/lib/startos',
            readonly: false,
          })
          .mountVolume({
            volumeId: 'main',
            subpath: `/instances/${inst.id}/config.yaml`,
            mountpoint: '/etc/startos/config.yaml',
            readonly: false,
            type: 'file',
          }),
      },
      exec: { command: ['start-registryd'] },
      ready: {
        display: i18n('Registry: {{label}}', { label: inst.label }),
        fn: () => sdk.healthCheck.checkPortListening(effects, inst.port, { ... }),
      },
      requires: [],
    })
  }

  return daemons
})
```

When `instances.yaml` is rewritten, the SDK reconciles automatically.

---

## Reactive Wiring

`instances.yaml` is the single trigger that propagates everywhere on the
StartOS side. Three independent reactive paths read it, each with its
own `constRetry` flavor:

| Reader            | constRetry flavor                | What it produces                  |
| ----------------- | -------------------------------- | --------------------------------- |
| `Daemons.dynamic` | in-place diff/reconcile (proposed) | Daemons (one per instance + portal) |
| `setupInterfaces` | in-place re-run (`setupInit`)    | `api-<id>` MultiHosts + interfaces |
| `setupOnInit` (hostname sync) | in-place re-run | per-instance `config.yaml` hostnames |

All three subscribe via `instancesYaml.read().const(effects)`. They run
independently when the file changes; the SDK has no global ordering
requirement.

The portal writes `instances.yaml` from inside the portal subcontainer.
The init / main readers run in the StartOS control plane (or however
the host invokes the service's exported entrypoints). Both processes
see the same volume mount, so `fs.watch` from the readers picks up the
portal's writes. The `FileHelper` write-after-const guard
(`fileHelper.ts:386-391`) is in-process only — it does not block the
portal's writes since they happen in a different Node process.

---

## Instance Lifecycle (in-portal)

All instance lifecycle ops are POST endpoints on the portal API. No
StartOS action involvement, no service restart.

### Create

`POST /api/instances { label, id?, icon? }`

1. Authenticate caller as a portal admin.
2. Validate inputs (slug uniqueness, label length).
3. Assign next port (`max(ports) + 1`, ≥ 5959).
4. Materialize `/var/lib/portal/instances/<id>/data/` and
   `/var/lib/portal/instances/<id>/config.yaml` with upstream defaults
   (and the assigned `registry-listen` port).
5. Append entry to `instances.yaml` (atomic write: write to tmp, fsync,
   rename).
6. `Daemons.dynamic` reactively diffs → spawns the new `reg-<id>`
   subcontainer.
7. `setupInterfaces` reactively diffs → new `api-<id>` interface
   materializes with its own `.onion`.
8. Return `201` once the new daemon reaches `ready` (or `202` and let
   the SPA poll).

### Rename

`PATCH /api/instances/<id> { label }`

Updates `instances.yaml` only. Daemon's `configHash` doesn't change
(label isn't part of any daemon args we care about), so the daemon is
**left alone**. The interface's name updates on the next reactive run.

### Delete

`DELETE /api/instances/<id>?confirm=<label>`

Typed-confirmation guard. Steps:

1. Validate confirm matches the current label.
2. Remove entry from `instances.yaml`.
3. `Daemons.dynamic` reactively diffs → stops the `reg-<id>`
   daemon.
4. Move `instances/<id>/` → `.trash/<id>-<timestamp>/`. Recoverable for
   one upgrade cycle.
5. `setupInterfaces` reactively diffs → interface tears down.

### Configure (registry name / icon)

The portal owns this UI. Implementation: spawn a short-lived
`start-registry info set-name` / `set-icon` against the running
`reg-<id>` subcontainer via `effects.execFail` (or equivalent
mechanism — the portal exposes a portal-API endpoint that runs the CLI
through the SDK's subcontainer-exec primitive).

### Add / remove admin signers

The portal owns these UIs too. Translates to the corresponding
`start-registry admin signer add` / `start-registry admin add` /
`start-registry admin signer remove` invocations against the target
instance. The user's vault key signs the operation.

---

## Portal Server

- **Language:** TypeScript, Node 20 LTS.
- **HTTP framework:** Fastify. Streaming for uploads and the per-instance
  proxy.
- **DB:** SQLite via `better-sqlite3`. File at `/var/lib/portal/portal.db`.
  Tables: `users`, `oidc_links`, `sessions`, `user_signer_pubkeys`,
  `remote_registries`.
- **Password hashing:** `argon2id` via `@node-rs/argon2`.
- **OIDC:** `openid-client`. Pocket-ID issuer URL, client id, and client
  secret come from `config/portal.yaml`, written by the `configurePortal`
  action.
- **Sessions:** signed HTTP-only cookies, secret rotated on each
  `portal-init` run, persisted to `/var/lib/portal/session.key`.

Notably **not present**: a child-process supervisor, log rotation for
registry processes, signal-forwarding logic. The SDK handles all of that
now.

### Endpoint Surface (sketch)

| Method | Path                          | Notes                                                  |
| ------ | ----------------------------- | ------------------------------------------------------ |
| POST   | `/api/auth/login`             | username + password                                    |
| POST   | `/api/auth/logout`            |                                                        |
| GET    | `/api/auth/oidc/start`        | redirect to Pocket-ID                                  |
| GET    | `/api/auth/oidc/callback`     | exchange code, create / link user                      |
| GET    | `/api/me`                     | profile + linked signer pubkeys                        |
| PATCH  | `/api/me`                     | display name, contact, password                        |
| POST   | `/api/me/signer-pubkeys`      | register a pubkey owned by this user                   |
| GET    | `/api/instances`              | list local instances (id, label, status, port)         |
| POST   | `/api/instances`              | create                                                 |
| PATCH  | `/api/instances/:id`          | rename                                                 |
| DELETE | `/api/instances/:id`          | delete (with `?confirm=` guard)                        |
| ANY    | `/api/r/:id/*`                | reverse proxy to `127.0.0.1:<port>` for that instance  |
| GET    | `/api/remote`                 | list connected *remote* registries                     |
| POST   | `/api/remote`                 | add a remote                                           |
| ANY    | `/api/remote/:id/*`           | Tor-aware proxy to a remote registry                   |
| POST   | `/api/promote`                | server-side cross-registry duplex pipe                 |

The proxy still reaches local instances via `127.0.0.1:<port>`. The
registry subcontainers expose their listen ports on the StartOS
container network; the portal container hits them by IP/port.

---

## Portal Web App

- **Framework:** SolidJS (default; locked in at the v0 commit).
- **Build:** Vite. Output is plain static assets served by Fastify.
- **State:** signals/stores for session, vault unlock, current instance id,
  TanStack Query–style cache for registry data.
- **Crypto:** `@noble/curves` (Ed25519) + WebCrypto (`SubtleCrypto` for
  AES-GCM and PBKDF2). No `node:` imports.

### Screens

1. **Login** — username/pw form + "Sign in with Pocket-ID" button (when
   OIDC is configured).
2. **First-run onboarding** — set display name, contact, optionally
   generate or import a signer keypair. Walks the user through choosing
   a passphrase for the vault.
3. **Instances dashboard** — landing page after login. One card per
   instance: label, icon, status (running / starting / failed), hostname
   chips (LAN, `.local`, `.onion`), admin count, package count. "Create
   instance" button opens an inline form.
4. **Per-instance view** — packages, signers, categories, mirrors for
   the selected instance. Same shell, scoped by URL `/i/<id>/...`.
5. **Profile** — change password, link/unlink Pocket-ID, edit display
   contact (mirrored to registry signer metadata across instances).
6. **Signers** — vault: list of keypairs. Add (paste PEM, generate,
   import file). Per key: lock, unlock, export public, remove. Each row
   shows which instances (and remote registries) recognize this pubkey
   as admin.
7. **Packages** (per instance) — list, filter, click into version
   detail. "Co-sign" button visible if the user has an unlocked key
   authorized on the instance.
8. **Upload** — drag-and-drop `.s9pk`. Streams, hashes, signs in the
   browser, PUTs to the chosen instance via the proxy.
9. **Promote** — pick a package version on instance A (local or remote),
   pick destination B (local or remote). Confirms signature carry-over.
   Streams through the portal server.

---

## Auth: Local + Pocket-ID

Two methods, both first-class. A portal user record can have:

- `password_hash` (nullable) — local auth
- `oidc_links[]` — zero or more `{ issuer, sub }` tuples

A login attempt succeeds via whichever method the user has configured.
New users can be created via:

- Bootstrap admin from the install-time portal task.
- Self-signup via Pocket-ID (optional, gated by a portal config flag).
- Admin invite (existing portal admin generates a one-time invite link).

Pocket-ID is configured via the `configurePortal` action:

```yaml
# /var/lib/portal/config/portal.yaml
oidc:
  enabled: false
  issuer: ""
  client-id: ""
  client-secret: ""
  redirect-uri: ""          # auto-computed from ui interface, displayed back
allow-oidc-signup: false     # if true, any successful OIDC login auto-creates a user
session-cookie-name: portal_sid
```

The action computes the redirect URI from the current `ui` interface
and displays it to the operator so they can paste it into Pocket-ID's
allowlist.

---

## Crypto and Key Custody

Per the design decision: **encrypted in browser storage**.

### Vault format

For each stored key:

```
{
  id:        uuid,
  label:     "primary",                        // user-supplied
  pubkey:    "-----BEGIN PUBLIC KEY-----...",  // PEM, plaintext
  alg:       "ed25519",
  ciphertext: base64( AES-GCM(plaintext_pkcs8_der, dek) ),
  iv:        base64,
  kdf: {
    name: "PBKDF2",
    hash: "SHA-256",
    iterations: 600_000,
    salt: base64
  }
}
```

The passphrase is never persisted. On unlock, the SPA derives the DEK
(PBKDF2 → AES-GCM key) and keeps it as a non-persisted, non-exported
`CryptoKey` for the session. Auto-lock after N minutes idle; lock on
tab close.

### Signing flow

1. User clicks "co-sign", "upload", or "promote with my signature".
2. App decrypts the chosen vault entry → Ed25519 secret key.
3. App computes the registry's canonical signing payload (mirror the
   `start-cli s9pk sign` algorithm; see open question #2).
4. Sign with `@noble/curves`. Zero the secret key.
5. POST signature to `/api/r/<id>/...` or `/api/remote/<id>/...`.

### Key registration

A pubkey in the vault is just bytes until a registry knows about it.
The SPA exposes "Register this key as admin on instance X" — a shortcut
over `start-registry admin signer add`, signed by another already-admin
key, or by the initial install signer task.

---

## Upload Flow

1. User drops a `.s9pk` onto the upload screen with instance X selected.
2. SPA streams the file through a streaming hash (`@noble/hashes` or
   chunked `crypto.subtle.digest`). Computes the registry's expected
   signing digest.
3. SPA prompts for vault unlock if needed and signs the digest.
4. SPA opens a `PUT /api/r/X/package` to the portal. The portal
   duplex-pipes the body to `127.0.0.1:<port>` for instance X,
   attaching the signature header.
5. Portal does not buffer the full file. Backpressure is honored.
6. On success, refresh the package list.

For remote instances the path is identical except the proxy uses
`/api/remote/X/...` and a Tor SOCKS agent when the remote is `.onion`.

---

## Promote Flow

1. User picks package + version on instance A.
2. SPA POSTs `/api/promote { from: A, to: B, package, version, cosign? }`.
3. Portal opens a streamed `GET` on A (local or remote) and a streamed
   `PUT` on B (local or remote) and pipes the bytes through, preserving
   the original signature bundle so author signatures travel with the
   package.
4. If `cosign` is true and the user has an unlocked key authorized on
   B, the SPA POSTs a supplementary signature to B after the upload
   completes (registry signing is over the package digest, which the
   SPA already has from the source).

Source and destination can each be either a local instance or a remote
registry; the code path is symmetric.

---

## Remote Registries (Secondary)

The portal's primary job is the *local* instances. As a smaller add-on,
the portal can also connect to remote registries (LAN, `.local`,
`.onion`) to enable cross-machine promote.

- Stored in SQLite (`remote_registries` table): `id`, `label`, `url`,
  `useTor` (bool).
- Reached via `/api/remote/:id/*` — same shape as `/api/r/:id/*`, but
  the proxy uses a `socks-proxy-agent` to `tor.startos:9050` when
  `useTor`.
- Remotes are global to the portal (not per-user).

Ships in M5.

---

## StartOS Integration

### Manifest

```ts
volumes: ['main'],
images: {
  'startos-registry':         { source: { dockerTag: 'ghcr.io/start9labs/startos-registry:master' } },
  'startos-registry-portal':  { source: { /* built from portal/Dockerfile */ } },
},
```

Two images: the upstream registry (used by every `reg-<id>` daemon) and
the portal (used by the single `portal` daemon).

### `main.ts`

See [the SDK Addition](#the-setupdynamicdaemons-sdk-addition) for the
reactive `Daemons.dynamic` body.

### `init/index.ts`

Chain: `restoreInit → versionGraph → setInterfaces → setDependencies →
actions → setHostnames → portalInit → firstRunTasks`.

`portalInit` is idempotent: creates SQLite tables, generates session
key if missing, applies migrations, seeds the first admin user if the
install task collected credentials.

### Install tasks

Replace the existing two registry tasks with one:

- **Create your portal admin** — an action that takes a username,
  password, optional signer keypair public part, and writes the first
  portal user. All subsequent registry setup happens inside the portal
  UI.

### Action set

Drop all per-instance / per-admin actions in favor of two
portal-scoped ones:

- **Configure Portal** — Pocket-ID issuer, client id, client secret;
  displays the redirect URI for copy/paste into Pocket-ID.
- **Reset Portal Password** — emergency reset for a chosen portal user
  (used when an admin loses their password and Pocket-ID is not set
  up).

### Backups

```ts
sdk.Backups.ofVolumes('main')
```

One volume covers everything.

---

## Migration from v0.4.0.2

Existing installs have a single registry rooted at `/var/lib/startos`
and `/etc/startos/config.yaml`. The migration moves it into the new
layout:

1. Pick a default instance id (e.g. `default`).
2. Move `/var/lib/startos/*` → `/var/lib/portal/instances/default/data/*`.
3. Move `/etc/startos/config.yaml` → `/var/lib/portal/instances/default/config.yaml`.
4. Initialize `/var/lib/portal/instances.yaml` with a single entry:
   `id: default`, `label: "Registry"`, `port: 5959`.
5. Create the portal SQLite DB; surface the "Create your portal admin"
   install task on first boot after the upgrade.

The migration runs as a version transition in `startos/versions/`.
Existing migrations get an `effects` handle so cross-volume reads /
writes are fine. The existing `api` interface ID is replaced by
`api-default`. Document the hostname change in the version's release
notes — existing `.local` and `.onion` URLs change once because the
interface id changed.

---

## Phasing

Each milestone is shippable on its own.

### M0 — SDK PR for `Daemons.dynamic`

- Land `Daemons.dynamic`, diff/reconcile machinery, subcontainer
  descriptor support, docs, and an example.
- Release as `@start9labs/start-sdk@1.6.0` (or whatever rev the SDK
  team prefers).
- **Blocks M2 onward.** M1 can proceed against `setupMain` with one
  hard-coded instance.

### M1 — Single-instance portal shell

- Portal image (Node + server + SPA), portal daemon, `ui` interface.
- SQLite + local username/pw login + first-admin install task.
- Instances dashboard with a single hard-coded entry, per-instance
  view, packages list, signers list (read-only).
- `/api/r/<id>/*` reverse proxy.
- One registry daemon, declared statically. Proves the proxy +
  interfaces + portal shell work end-to-end without the SDK PR.

### M2 — Multi-instance lifecycle (lands once M0 ships)

- `instances.yaml` file model.
- `main.ts` swap to `Daemons.dynamic`.
- Reactive `setupInterfaces` / `setHostnames`.
- Portal API: create, rename, delete instance.
- Portal UI: instance create form, delete with typed confirmation.
- Migration from v0.4.0.2 → multi-instance with one `default` instance.

### M3 — Vault and signing

- In-browser Ed25519 vault (PBKDF2 + AES-GCM).
- Signer registration shortcuts.
- Co-sign flow on existing packages.
- Per-instance admin add/remove from the portal.

### M4 — Upload

- Streaming upload through the proxy.
- Browser-side hash + signature.
- Progress UI.

### M5 — Pocket-ID + remote registries + promote

- OIDC client wiring + `configurePortal` action.
- Account linking (existing local user can attach an OIDC sub).
- Remote registries CRUD + Tor-aware proxy.
- Promote pipe (local↔local, local↔remote).
- Optional supplementary co-signature on the destination.

### M6 — Polish

- Auto-lock, audit log, error UX.
- README updates and removal of the "CLI only" Limitations entry.

---

## Fallback Architectures

If `Daemons.dynamic` doesn't land in time, two fallbacks exist:

### Architecture A — Portal-supervised processes

The portal image `FROM`s `startos-registry`, adding Node + server + SPA.
The portal forks `start-registryd` children inside its own container,
one per instance, with their per-instance config path supplied via a
small upstream `--config` flag (a separate, smaller upstream PR).
`setupInterfaces` is reactive on `instances.yaml`; the daemon chain is
static (one daemon: portal). No service restart on instance lifecycle.

Cons vs. C: requires the upstream `--config` patch, no isolation between
instances, the portal becomes a supervisor with its own bug surface
(signal handling, restart-with-backoff, log rotation).

### Architecture B — `setupMain` + service restart

`setupMain` reads `instances.yaml` via `.const()`. The host's
`constRetry` for `setupMain` is `effects.restart()`, so every instance
add / delete restarts the whole service. The daemon chain is rebuilt
from scratch on each boot. Per-instance subcontainers, free per-instance
health checks, no upstream patch needed.

Cons vs. C: every instance create/delete restarts the portal, dropping
browser sessions and forcing re-authentication.

---

## Open Questions

1. **`start-registryd` admin-CLI in another container.** The portal
   exposes "rename registry / set icon / add admin" by invoking
   `start-registry info set-name` etc. With Architecture C, the
   registry is in its own subcontainer. The portal calls into that
   subcontainer via the SDK's `effects.runCommand`-style primitive (or
   spins up a sibling temp subcontainer with the same mounts). Confirm
   which is more ergonomic in 1.6.0.
2. **What does the registry actually expect on a signed PUT?** Confirm
   the wire format by reading `core/startos/src/registry/` upstream so
   the browser signer matches bit-for-bit. The `start-cli s9pk sign`
   source is the authority.
3. **Image build pipeline.** The portal image is independent of the
   upstream registry image. Publish to GHCR alongside the upstream
   image, or build locally during the s9pk build? Probably publish.
4. **`fs.watch` reliability inside the StartOS init runtime.** The
   reactive model relies on `FileHelper.produce` using `fs.watch` to
   trigger `constRetry`. Confirm the init / main process sees writes
   made from the portal subcontainer. Worst case, supplement with a
   periodic poll inside the same const reader.
5. **Pocket-ID and the registry signer concept.** A portal user logged
   in via Pocket-ID with no signer key is an observer. Surface as a
   first-class "viewer" role, or just hide mutating buttons? Default:
   hide buttons, no role concept in portal DB.
6. **Web framework choice.** Default: SolidJS unless someone has a
   strong reason.
