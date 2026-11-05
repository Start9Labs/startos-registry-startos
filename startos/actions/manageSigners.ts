import { T, z } from '@start9labs/start-sdk'
import { isDeepStrictEqual } from 'node:util'
import { i18n } from '../i18n'
import { sdk } from '../sdk'
import { Registry, defaultRegistryId, registryCli } from '../utils'
import {
  activeRegistries,
  registryInput,
  selectedRegistry,
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

const signersSpec = InputSpec.of({
  snapshot: Value.hidden(stateShape),
  signers: Value.list(
    List.obj(
      {
        name: i18n('Signers'),
        description: i18n(
          'Removing a signer from this list deletes all its authorizations. Local StartOS actions can restore an administrator.',
        ),
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
                  'Enter an email address, Matrix username, or contact URL.',
                ),
              },
              { minLength: 1 },
            ),
          ),
          key: Value.textarea({
            name: i18n('Public Key'),
            description: i18n(
              'Paste PEM public keys or complete armored GPG public-key exports. Required for new signers; existing keys are read-only. Never enter a private key.',
            ),
            required: false,
            default: null,
            immutable: true,
            patterns: [
              {
                regex: `^(?:\\s*${keyBlockPattern})+\\s*$`,
                description: publicKeyError,
              },
            ],
          }),
          admin: Value.toggle({
            name: i18n('Admin'),
            description: i18n('Grant permission to administer this registry.'),
            default: false,
          }),
          offerForTrust: Value.toggle({
            name: i18n('Offer for Trust'),
            description: i18n(
              'Offer this signer’s public keys to connecting StartOS servers. This does not grant administrator rights.',
            ),
            default: false,
          }),
        }),
      },
    ),
  ),
})

export const manageSigners = sdk.Action.withInput(
  'manage-signers',
  async () => ({
    name: i18n('Manage Signers'),
    description: i18n(
      'Edit signer information, administrator rights, and trust offers.',
    ),
    warning: null,
    allowedStatuses: 'only-running',
    group: null,
    visibility: 'enabled',
  }),
  registryInput(async () => signersSpec),
  async ({ effects }) => {
    const registries = (await activeRegistries().once()) ?? []
    const values = await Promise.all(
      registries.map(async (registry) => {
        const snapshot = await readState(effects, registry)
        return [
          registry.id,
          {
            snapshot,
            signers: Object.entries(snapshot.signers)
              .sort(([, a], [, b]) => a.name.localeCompare(b.name))
              .map(([id, signer]) => ({
                id,
                name: signer.name,
                contacts: signer.contact.map(contactToUrl),
                key: publicKeys(signer),
                admin: snapshot.admins.includes(id),
                offerForTrust: snapshot.trustSigners.includes(id),
              })),
          },
        ] as const
      }),
    )
    const selected =
      values.find(([id]) => id === defaultRegistryId) ?? values[0]
    if (!selected) return null
    return {
      registry: {
        selection: selected[0],
        value: selected[1],
        other: Object.fromEntries(values.filter(([id]) => id !== selected[0])),
      },
    }
  },
  async ({ effects, input }) => {
    const registry = await selectedRegistry(input.registry.selection)
    const { snapshot, signers } = input.registry.value
    const current = await readState(effects, registry)
    if (!isDeepStrictEqual(snapshot, current)) throw new Error(changedError)

    const seen = new Set<string>()
    const desired = signers.map((signer) => {
      const name = signer.name.trim()
      if (!name) throw new Error(i18n('A label is required.'))
      if (signer.id !== null) {
        if (!Object.hasOwn(current.signers, signer.id))
          throw new Error(changedError)
        if (seen.has(signer.id))
          throw new Error(i18n('Each existing signer must appear only once.'))
        seen.add(signer.id)
        if (
          (signer.key ?? '').trim() !==
          publicKeys(current.signers[signer.id]).trim()
        ) {
          throw new Error(
            i18n(
              'Existing signing keys cannot be changed here. Use the registry CLI to rotate keys.',
            ),
          )
        }
      }
      return {
        ...signer,
        name,
        contacts: signer.contacts.map(normalizeContact),
        keys: signer.id === null ? parsePublicKeys(signer.key ?? '') : [],
      }
    })

    for (const signer of desired) {
      if (signer.id !== null) continue
      signer.id = (
        await registryCli(effects, registry, [
          'admin',
          'signer',
          'add',
          `--name=${signer.name}`,
          ...signer.contacts.map((contact) => `--contact=${contact}`),
          ...signer.keys.map((key) => `--key=${key}`),
        ])
      ).stdout
        .toString()
        .trim()
    }
    for (const signer of desired) {
      const id = signer.id!
      const previous = current.signers[id]
      if (previous) {
        const contacts = previous.contact.map(contactToUrl)
        const args = [
          ...(signer.name === previous.name
            ? []
            : [`--set-name=${signer.name}`]),
          ...unmatched(signer.contacts, contacts).map(
            (contact) => `--add-contact=${contact}`,
          ),
          ...unmatched(contacts, signer.contacts).map(
            (contact) => `--remove-contact=${contact}`,
          ),
        ]
        if (args.length)
          await registryCli(effects, registry, [
            'admin',
            'signer',
            'edit',
            id,
            ...args,
          ])
      }
      if (signer.admin !== current.admins.includes(id)) {
        await registryCli(effects, registry, [
          'admin',
          signer.admin ? 'add' : 'remove',
          id,
        ])
      }
    }

    const info: { trustSigners: Record<string, unknown> } = JSON.parse(
      (await registryCli(effects, registry, ['info', '--format=json']))
        .stdout as string,
    )
    const previousTrust = new Set(Object.keys(info.trustSigners))
    const trust = new Set(previousTrust)
    for (const id of Object.keys(snapshot.signers)) trust.delete(id)
    for (const signer of desired)
      if (signer.offerForTrust) trust.add(signer.id!)
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
    for (const id of Object.keys(snapshot.signers)) {
      if (!seen.has(id))
        await registryCli(effects, registry, ['admin', 'signer', 'remove', id])
    }
  },
)

async function readState(
  effects: T.Effects,
  registry: Registry,
): Promise<State> {
  const signers = JSON.parse(
    (
      await registryCli(effects, registry, [
        'admin',
        'signer',
        'list',
        '--format=json',
      ])
    ).stdout as string,
  )
  const admins = JSON.parse(
    (await registryCli(effects, registry, ['admin', 'list', '--format=json']))
      .stdout as string,
  )
  const info = JSON.parse(
    (await registryCli(effects, registry, ['info', '--format=json']))
      .stdout as string,
  )
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
  if (!contact) throw new Error(i18n('A contact cannot be blank.'))
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
  const covered = new Set(
    signer.gpgExports.flatMap((key) => Object.keys(key.keyFingerprints)),
  )
  return [
    ...signer.gpgExports.map((key) => key.armored.trim()),
    ...signer.keys
      .filter((key) => !covered.has(key))
      .map(
        (key) => `-----BEGIN PUBLIC KEY-----\n${key}\n-----END PUBLIC KEY-----`,
      ),
  ].join('\n\n')
}

function parsePublicKeys(value: string) {
  const pattern = new RegExp(keyBlockPattern, 'g')
  const keys = [...value.matchAll(pattern)].map((match) => match[0])
  if (!keys.length)
    throw new Error(i18n('A public key is required for each new signer.'))
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
