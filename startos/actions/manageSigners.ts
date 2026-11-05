import { T } from '@start9labs/start-sdk'
import { i18n } from '../i18n'
import { sdk } from '../sdk'
import { Registry, registryCli } from '../utils'
import { registryInput, selectedRegistry } from '../fileModels/registries.json'

const { InputSpec, Value, Variants } = sdk

type Signer = { name: string }
type Signers = Record<string, Signer>
type RegistryInfo = { trustSigners: Signers }

const publicKey = Value.textarea({
  name: i18n('Public Key'),
  description: i18n(
    'Paste a PEM public key from start-cli pubkey or a complete armored GPG public-key export. Never enter a private key.',
  ),
  required: true,
  default: null,
  minLength: 1,
  patterns: [
    {
      regex:
        '^(?:-----BEGIN PUBLIC KEY-----[\\s\\S]+-----END PUBLIC KEY-----|-----BEGIN PGP PUBLIC KEY BLOCK-----[\\s\\S]+-----END PGP PUBLIC KEY BLOCK-----)\\s*$',
      description: i18n(
        'Must be a PEM public key or an armored GPG public-key export.',
      ),
    },
  ],
})

function permissions(admin = false, offerForTrust = false) {
  return {
    admin: Value.toggle({
      name: i18n('Admin'),
      description: i18n('Grant permission to administer this registry.'),
      default: admin,
    }),
    offerForTrust: Value.toggle({
      name: i18n('Offer for Trust'),
      description: i18n(
        'Offer this signer’s public keys to connecting StartOS servers. This does not grant administrator rights.',
      ),
      default: offerForTrust,
    }),
  }
}

function signerLabel(defaultValue: string | null = null) {
  return Value.text({
    name: i18n('Label'),
    required: true,
    default: defaultValue,
    minLength: 1,
    patterns: [
      {
        regex: '[\\s\\S]*\\S[\\s\\S]*',
        description: i18n('A label is required.'),
      },
    ],
  })
}

const addSpec = InputSpec.of({
  name: signerLabel(),
  contact: Value.text({
    name: i18n('Contact'),
    description: i18n('An email address, Matrix username, or contact URL.'),
    required: true,
    default: null,
    minLength: 1,
  }),
  key: publicKey,
  ...permissions(),
})

export const manageSigners = sdk.Action.withInput(
  'manage-signers',
  async () => ({
    name: i18n('Manage Signers'),
    description: i18n(
      'Add, edit, or remove signers and control administrator rights and trust offers.',
    ),
    warning: null,
    allowedStatuses: 'only-running',
    group: null,
    visibility: 'enabled',
  }),
  registryInput(async (effects, registry) => {
    const signers: Signers = JSON.parse(
      (
        await registryCli(effects, registry, [
          'admin',
          'signer',
          'list',
          '--format=json',
        ])
      ).stdout as string,
    )
    const admins: Signers = JSON.parse(
      (await registryCli(effects, registry, ['admin', 'list', '--format=json']))
        .stdout as string,
    )
    const info: RegistryInfo = JSON.parse(
      (await registryCli(effects, registry, ['info', '--format=json']))
        .stdout as string,
    )
    return InputSpec.of({
      operation: Value.union({
        name: i18n('Operation'),
        default: 'add',
        variants: Variants.of({
          add: { name: i18n('Add Signer'), spec: addSpec },
          edit: {
            name: i18n('Edit Signer'),
            spec: InputSpec.of({
              signer: Value.union({
                name: i18n('Signer'),
                default: null,
                variants: Variants.of(
                  Object.fromEntries(
                    Object.entries(signers).map(([id, signer]) => [
                      id,
                      {
                        name: signer.name,
                        spec: InputSpec.of({
                          name: signerLabel(signer.name),
                          ...permissions(id in admins, id in info.trustSigners),
                        }),
                      },
                    ]),
                  ),
                ),
              }),
            }),
          },
          remove: {
            name: i18n('Remove Signer'),
            spec: InputSpec.of({
              signer: Value.select({
                name: i18n('Signer'),
                description: i18n(
                  'Removing a signer deletes all its authorizations. Revoking Admin alone keeps the signer. Local StartOS actions can restore an administrator.',
                ),
                default: null,
                values: Object.fromEntries(
                  Object.entries(signers).map(([id, signer]) => [
                    id,
                    signer.name,
                  ]),
                ),
              }),
            }),
          },
        }),
      }),
    })
  }),
  async () => null,
  async ({ effects, input }) => {
    const registry = await selectedRegistry(input.registry.selection)
    const operation = input.registry.value.operation
    if (operation.selection === 'remove') {
      await registryCli(effects, registry, [
        'admin',
        'signer',
        'remove',
        operation.value.signer,
      ])
      return
    }
    if (operation.selection === 'add') {
      const { name, contact, key, admin, offerForTrust } = operation.value
      const trimmedContact = contact.trim()
      const contactUrl = trimmedContact.startsWith('@')
        ? `https://matrix.to/#/${trimmedContact}`
        : /^[^\s@]+@[^\s@]+$/.test(trimmedContact) &&
            !trimmedContact.includes(':')
          ? `mailto:${trimmedContact}`
          : trimmedContact
      if (!trimmedContact)
        throw new Error(i18n('A label and contact are required.'))
      const id = (
        await registryCli(effects, registry, [
          'admin',
          'signer',
          'add',
          `--name=${name.trim()}`,
          `--contact=${contactUrl}`,
          `--key=${key}`,
        ])
      ).stdout
        .toString()
        .trim()
      await setPermissions(effects, registry, id, admin, offerForTrust)
      return
    }
    const { selection: id, value } = operation.value.signer
    const args = [
      'admin',
      'signer',
      'edit',
      id,
      `--set-name=${value.name.trim()}`,
    ]
    await registryCli(effects, registry, args)
    await setPermissions(
      effects,
      registry,
      id,
      value.admin,
      value.offerForTrust,
    )
  },
)

async function setPermissions(
  effects: T.Effects,
  registry: Registry,
  id: string,
  admin: boolean,
  offerForTrust: boolean,
) {
  const admins: Signers = JSON.parse(
    (await registryCli(effects, registry, ['admin', 'list', '--format=json']))
      .stdout as string,
  )
  if (admin !== Object.hasOwn(admins, id)) {
    await registryCli(effects, registry, [
      'admin',
      admin ? 'add' : 'remove',
      id,
    ])
  }
  const info: RegistryInfo = JSON.parse(
    (await registryCli(effects, registry, ['info', '--format=json']))
      .stdout as string,
  )
  const selected = new Set(Object.keys(info.trustSigners))
  if (offerForTrust === selected.has(id)) return
  if (offerForTrust) selected.add(id)
  else selected.delete(id)
  await registryCli(effects, registry, [
    'info',
    'set-trust-signers',
    ...selected,
  ])
}
