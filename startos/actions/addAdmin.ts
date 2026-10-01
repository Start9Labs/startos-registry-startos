import { utils } from '@start9labs/start-sdk'
import { i18n } from '../i18n'
import { sdk } from '../sdk'

const { InputSpec, Value, Variants } = sdk

export const inputSpec = InputSpec.of({
  name: Value.text({
    name: i18n('Label'),
    default: null,
    required: true,
  }),
  contact: Value.union({
    name: i18n('Contact'),
    default: 'email',
    variants: Variants.of({
      email: {
        name: i18n('Email'),
        spec: sdk.InputSpec.of({
          address: Value.text({
            name: i18n('Email'),
            default: null,
            required: true,
            patterns: [utils.Patterns.email],
          }),
        }),
      },
      matrix: {
        name: i18n('Matrix'),
        spec: sdk.InputSpec.of({
          username: Value.text({
            name: i18n('Username'),
            default: null,
            required: true,
            placeholder: '@user:domain.com',
            patterns: [
              {
                regex: '^@([a-zA-Z0-9_.-]+):([a-zA-Z0-9.-]+\\.[a-zA-Z]{2,})$',
                description: i18n(
                  'Must be a valid matrix username (e.g. @user:domain.com)',
                ),
              },
            ],
          }),
        }),
      },
    }),
  }),
  key: Value.textarea({
    name: i18n('Public Key'),
    default: null,
    required: true,
    patterns: [
      {
        regex: utils.regexes.pem('PUBLIC KEY').asExpr(),
        description: i18n('Must be a valid PEM encoded public key'),
      },
    ],
  }),
})

export const addAdmin = sdk.Action.withInput(
  // id
  'add-admin',

  // metadata
  async ({ effects }) => ({
    name: i18n('Add Administrator'),
    description: i18n('Add an admin to this registry'),
    warning: null,
    allowedStatuses: 'only-running',
    group: null,
    visibility: 'enabled',
  }),

  // form input specification
  inputSpec,

  // optionally pre-fill the input form
  async ({ effects }) => {},

  // the execution function
  async ({ effects, input }) => {
    const contact =
      input.contact.selection === 'matrix'
        ? `https://matrix.to/#/${input.contact.value.username}`
        : `mailto:${input.contact.value.address}`

    await sdk.SubContainer.withTemp(
      effects,
      { imageId: 'startos-registry', sharedRun: true },
      null,
      'add-admin',
      async (sub) => {
        let id = (
          (
            await sub.execFail([
              'start-registry',
              'admin',
              'signer',
              'add',
              '--name',
              input.name,
              '--contact',
              contact,
              `--key=${input.key}`,
            ])
          ).stdout as string
        ).trim()

        await sub.execFail(['start-registry', 'admin', 'add', id])
      },
    )
  },
)
