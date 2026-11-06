import { T, z } from '@start9labs/start-sdk'
import { isDeepStrictEqual } from 'node:util'
import { createPublicKey } from 'node:crypto'
import { i18n } from '../i18n'
import { sdk } from '../sdk'
import {
  Registry,
  registryCli,
  readRegistryInfo,
  registryError,
  registryAvailabilityDescription,
  registryUpdateWarning,
} from '../utils'
import {
  activeRegistries,
  namedRegistries,
} from '../fileModels/registries.json'

const { InputSpec, Value, List } = sdk

const contactShape = z.union([
  z.object({ email: z.string() }),
  z.object({ matrix: z.string() }),
  z.object({ website: z.string() }),
])
const signerShape = z.looseObject({
  name: z.string(),
  contact: z.array(contactShape),
  keys: z.array(z.string()),
  gpgExports: z
    .array(
      z.looseObject({
        armored: z.string(),
        keyFingerprints: z.record(z.string(), z.array(z.string())).catch({}),
      }),
    )
    .catch([]),
})
const stateShape = z.looseObject({
  signers: z.record(z.string(), signerShape),
  admins: z.array(z.string()),
  trustSigners: z.array(z.string()),
})
type Signer = z.infer<typeof signerShape>
type State = z.infer<typeof stateShape>

const keyBlockPattern =
  '-----BEGIN (PUBLIC KEY|PGP PUBLIC KEY BLOCK)-----[\\s\\S]*?-----END \\1-----'
const publicKeyError = i18n(
  'Must be a PEM public key or an armored GPG public-key export.',
)
const changedError = i18n(
  'Signers changed while this form was open. Reopen it and try again.',
)

function signersSpec(snapshot: State) {
  const defaults = Object.entries(snapshot.signers)
    .sort(([, a], [, b]) => a.name.localeCompare(b.name))
    .map(([id, signer]) => ({
      id,
      name: signer.name,
      contacts: signer.contact.map(contactToUrl),
      key: publicKeys(signer),
      admin: snapshot.admins.includes(id),
      offerForTrust: snapshot.trustSigners.includes(id),
    }))
  return InputSpec.of({
    snapshot: Value.hidden(
      z
        .unknown()
        .optional()
        .transform(() => snapshot),
    ),
    signers: Value.list(
      List.obj(
        {
          name: i18n('Signers'),
          // SDK 4.0.0 types object-list defaults as []; the renderer accepts entries.
          default: defaults as [],
          description:
            i18n(
              'On submission, removing a signer deletes its authorizations from this section’s registry. Unchecking Admin keeps the signer. All registry sections are submitted together.',
            ) +
            ' ' +
            registryUpdateWarning(),
        },
        {
          displayAs: '{{name}}',
          spec: InputSpec.of({
            id: Value.hidden(z.string().nullable().default(null)),
            name: Value.text({
              name: i18n('Label'),
              default: null,
              required: true,
              minLength: 1,
            }),
            contacts: Value.list(
              List.text(
                {
                  name: i18n('Contacts'),
                  description: i18n(
                    'Optional email addresses, Matrix usernames, or contact URLs.',
                  ),
                },
                { minLength: 1 },
              ),
            ),
            key: Value.textarea({
              name: i18n('Public Keys'),
              description: i18n(
                'Add or replace active signing keys with PEM public keys or complete armored GPG exports for supported Ed25519 keys. New signers need a key. Clearing an existing signer’s keys revokes its access without deleting its permissions. Never enter private keys.',
              ),
              required: false,
              default: null,
              patterns: [
                {
                  regex: `^(?:\\s*${keyBlockPattern})+\\s*$`,
                  description: publicKeyError,
                },
              ],
            }),
            admin: Value.toggle({
              name: i18n('Admin'),
              description: i18n(
                'Allow this signer to administer this section’s registry.',
              ),
              default: false,
            }),
            offerForTrust: Value.toggle({
              name: i18n('Offer for Trust'),
              description: i18n(
                'Offer this signer’s public keys to clients of this section’s registry. This does not grant administrator rights.',
              ),
              default: false,
            }),
          }),
        },
      ),
    ),
  })
}

export const manageSigners = sdk.Action.withInput(
  'manage-signers',
  async () => ({
    name: i18n('Manage Signers'),
    description:
      i18n(
        'Edit signers, administrator rights, and trust offers across enabled registries.',
      ) +
      ' ' +
      registryAvailabilityDescription(),
    warning: null,
    allowedStatuses: 'only-running',
    group: null,
    visibility: 'enabled',
  }),
  async ({ effects }) =>
    InputSpec.of(
      Object.fromEntries(
        await Promise.all(
          (await namedRegistries(effects)).map(
            async (registry) =>
              [
                registry.id,
                Value.object(
                  { name: registry.name },
                  signersSpec(await readState(effects, registry)),
                ),
              ] as const,
          ),
        ),
      ),
    ),
  async () => null,
  async ({ effects, input, spec }) => {
    const registries = (await activeRegistries().once()) ?? []
    if (
      registries.length !== Object.keys(input).length ||
      registries.some((registry) => !Object.hasOwn(input, registry.id))
    ) {
      throw new Error(
        i18n(
          'Registries changed while this form was open. Reopen it and try again.',
        ),
      )
    }
    const plans = await Promise.all(
      registries.map(async (entry) => {
        const registry = {
          ...entry,
          name: (spec[entry.id] as T.inputSpecTypes.ValueSpecObject).name,
        }
        const current = await readState(effects, registry)
        if (!isDeepStrictEqual(input[registry.id].snapshot, current))
          throw registryError(registry, changedError)
        return {
          registry,
          current,
          plan: prepareSigners(registry, current, input[registry.id]),
        }
      }),
    )
    for (const { registry, current, plan } of plans) {
      await reconcileSigners(effects, registry, current, plan)
    }
  },
)

function prepareSigners(
  registry: Registry,
  current: State,
  { signers }: ReturnType<typeof signersSpec>['_TYPE'],
) {
  const seen = new Set<string>()
  const desired = signers.map((signer, index) => {
    try {
      const name = signer.name.trim()
      if (!name) throw new Error(i18n('Every signer needs a nonblank label.'))
      if (signer.id !== null) {
        if (!Object.hasOwn(current.signers, signer.id))
          throw new Error(changedError)
        if (seen.has(signer.id))
          throw new Error(
            i18n(
              'Each existing signer must appear only once per registry section.',
            ),
          )
        seen.add(signer.id)
      }
      const keys = parsePublicKeys(signer.key ?? '')
      if (signer.id === null && !keys.length)
        throw new Error(i18n('Each new signer needs at least one public key.'))
      return {
        ...signer,
        name,
        contacts: signer.contacts.map(normalizeContact),
        keys,
        keysChanged:
          signer.id === null ||
          (signer.key ?? '').trim() !==
            publicKeys(current.signers[signer.id]).trim(),
      }
    } catch (error) {
      throw registryError(
        registry,
        error,
        signer.name.trim() ||
          i18n('Signer row ${position}', { position: index + 1 }),
      )
    }
  })
  return { seen, desired }
}

async function reconcileSigners(
  effects: T.Effects,
  registry: Registry,
  current: State,
  { seen, desired }: ReturnType<typeof prepareSigners>,
) {
  const keyImports = desired.filter(
    (signer) => signer.keysChanged && signer.keys.length,
  )
  for (const signer of desired) {
    if (signer.id !== null) continue
    signer.id = (
      await registryCli(
        effects,
        registry,
        [
          'admin',
          'signer',
          'add',
          `--name=${signer.name}`,
          ...signer.contacts.map((contact) => `--contact=${contact}`),
          ...signer.keys.map((key) => `--key=${key}`),
        ],
        signer.name,
      )
    ).stdout
      .toString()
      .trim()
  }
  for (const signer of keyImports) {
    if (!current.signers[signer.id!]) continue
    await registryCli(
      effects,
      registry,
      [
        'admin',
        'signer',
        'edit',
        signer.id!,
        ...signer.keys.map((key) => `--add-key=${key}`),
      ],
      signer.name,
    )
  }
  const imported = keyImports.length
    ? await readSigners(effects, registry)
    : current.signers
  const wanted = new Map<string, Set<string>>()
  for (const signer of desired) {
    try {
      if (!imported[signer.id!]) throw new Error(changedError)
      wanted.set(
        signer.id!,
        signer.keysChanged
          ? signingKeys(signer.keys, imported[signer.id!])
          : new Set(current.signers[signer.id!].keys),
      )
    } catch (error) {
      throw registryError(registry, error, signer.name)
    }
  }
  const removedKeys = new Set<string>()
  for (const signer of desired) {
    const id = signer.id!
    const previous = current.signers[id]
    if (previous) {
      const contacts = previous.contact.map(contactToUrl)
      const removed = imported[id].keys.filter(
        (key) => !wanted.get(id)!.has(key),
      )
      for (const key of removed) removedKeys.add(key)
      const args = [
        ...removed.map((key) => `--remove-key=${key}`),
        ...(signer.name === previous.name ? [] : [`--set-name=${signer.name}`]),
        ...unmatched(signer.contacts, contacts).map(
          (contact) => `--add-contact=${contact}`,
        ),
        ...unmatched(contacts, signer.contacts).map(
          (contact) => `--remove-contact=${contact}`,
        ),
      ]
      if (args.length)
        await registryCli(
          effects,
          registry,
          ['admin', 'signer', 'edit', id, ...args],
          signer.name,
        )
    }
    if (signer.admin !== current.admins.includes(id)) {
      await registryCli(
        effects,
        registry,
        ['admin', signer.admin ? 'add' : 'remove', id],
        signer.name,
      )
    }
  }

  const info = await readRegistryInfo(effects, registry)
  const previousTrust = new Set(Object.keys(info.trustSigners))
  const trust = new Set(previousTrust)
  for (const id of Object.keys(current.signers)) trust.delete(id)
  for (const signer of desired) if (signer.offerForTrust) trust.add(signer.id!)
  if (
    trust.size !== previousTrust.size ||
    [...trust].some((id) => !previousTrust.has(id))
  ) {
    await registryCli(effects, registry, [
      'info',
      'set-trust-signers',
      ...trust,
    ])
  }
  const removedSigners = Object.keys(current.signers).filter(
    (id) => !seen.has(id),
  )
  for (const id of removedSigners) {
    await registryCli(
      effects,
      registry,
      ['admin', 'signer', 'remove', id],
      current.signers[id].name,
    )
  }
  if (desired.length && (removedKeys.size || removedSigners.length)) {
    const remaining = await readSigners(effects, registry)
    for (const signer of desired) {
      const record = remaining[signer.id!]
      if (!record) throw registryError(registry, changedError, signer.name)
      const missing = [...wanted.get(signer.id!)!].filter(
        (key) => !record.keys.includes(key),
      )
      if (missing.length)
        await registryCli(
          effects,
          registry,
          [
            'admin',
            'signer',
            'edit',
            signer.id!,
            ...missing.map((key) => `--add-key=${pemPublicKey(key)}`),
          ],
          signer.name,
        )
    }
  }
}

async function readSigners(effects: T.Effects, registry: Registry) {
  return z
    .record(z.string(), signerShape)
    .parse(
      JSON.parse(
        (
          await registryCli(effects, registry, [
            'admin',
            'signer',
            'list',
            '--format=json',
          ])
        ).stdout as string,
      ),
    )
}

async function readState(
  effects: T.Effects,
  registry: Registry,
): Promise<State> {
  const signers = await readSigners(effects, registry)
  const admins = JSON.parse(
    (await registryCli(effects, registry, ['admin', 'list', '--format=json']))
      .stdout as string,
  )
  const info = await readRegistryInfo(effects, registry)
  return stateShape.parse({
    signers,
    admins: Object.keys(admins).sort(),
    trustSigners: Object.keys(info.trustSigners).sort(),
  })
}

function contactToUrl(contact: z.infer<typeof contactShape>) {
  if ('email' in contact) return `mailto:${contact.email}`
  if ('matrix' in contact) return `https://matrix.to/#/${contact.matrix}`
  return contact.website
}

function normalizeContact(value: string) {
  const contact = value.trim()
  if (!contact)
    throw new Error(
      i18n(
        'Remove empty contact rows or enter an email address, Matrix username, or contact URL.',
      ),
    )
  const url = contact.startsWith('@')
    ? `https://matrix.to/#/${contact}`
    : /^[^\s@]+@[^\s@]+$/.test(contact) && !contact.includes(':')
      ? `mailto:${contact}`
      : contact
  try {
    return new URL(url).toString()
  } catch {
    throw new Error(
      i18n('Enter an email address, Matrix username, or contact URL.'),
    )
  }
}

function publicKeys(signer: Signer) {
  const active = new Set(signer.keys)
  const exports = signer.gpgExports.filter((key) => {
    const keys = Object.keys(key.keyFingerprints)
    return keys.length > 0 && keys.every((value) => active.has(value))
  })
  const covered = new Set(
    exports.flatMap((key) => Object.keys(key.keyFingerprints)),
  )
  return [
    ...exports.map((key) => key.armored.trim()),
    ...signer.keys.filter((key) => !covered.has(key)).map(pemPublicKey),
  ].join('\n\n')
}

function pemPublicKey(key: string) {
  return `-----BEGIN PUBLIC KEY-----\n${key}\n-----END PUBLIC KEY-----`
}

function signingKeys(blocks: string[], signer: Signer) {
  return new Set(
    blocks.flatMap((block) => {
      if (!block.startsWith('-----BEGIN PGP PUBLIC KEY BLOCK-----'))
        return [
          createPublicKey(block)
            .export({ format: 'der', type: 'spki' })
            .toString('base64'),
        ]
      const keys = signer.gpgExports
        .filter((key) => key.armored.trim() === block.trim())
        .flatMap((key) => Object.keys(key.keyFingerprints))
      if (!keys.length)
        throw new Error(
          i18n(
            'Could not resolve the imported GPG signing keys. Reopen the action and try again.',
          ),
        )
      return keys
    }),
  )
}

function parsePublicKeys(value: string) {
  const pattern = new RegExp(keyBlockPattern, 'g')
  const keys = [...value.matchAll(pattern)].map((match) => match[0])
  if (value.replace(pattern, '').trim()) throw new Error(publicKeyError)
  return keys
}

function unmatched(values: string[], matches: string[]) {
  const remaining = [...matches]
  return values.filter((value) => {
    const index = remaining.indexOf(value)
    if (index < 0) return true
    remaining.splice(index, 1)
    return false
  })
}
