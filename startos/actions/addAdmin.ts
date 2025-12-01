import { utils } from '@start9labs/start-sdk'
import { sdk } from '../sdk'

const { InputSpec, Value, Variants } = sdk

export const inputSpec = InputSpec.of({
  name: Value.text({
    name: 'Label',
    default: null,
    required: true,
  }),
  contact: Value.union({
    name: 'Contact',
    default: 'email',
    variants: Variants.of({
      email: {
        name: 'Email',
        spec: sdk.InputSpec.of({
          address: Value.text({
            name: 'Email',
            default: null,
            required: true,
            patterns: [utils.Patterns.email],
          }),
        }),
      },
      matrix: {
        name: 'Matrix',
        spec: sdk.InputSpec.of({
          username: Value.text({
            name: 'Username',
            default: null,
            required: true,
            placeholder: '@user:domain.com',
            patterns: [
              {
                regex: '^@([a-zA-Z0-9_.-]+):([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$',
                description:
                  'Must be a valid matrix username (e.g. @user:domain.com)',
              },
            ],
          }),
        }),
      },
    }),
  }),
  key: Value.textarea({
    name: 'Public Key',
    default: null,
    required: true,
    // @TODO
    // patterns: [utils.Patterns.pemPublicKey],
  }),
})

export const addAdmin = sdk.Action.withInput(
  // id
  'add-admin',

  // metadata
  async ({ effects }) => ({
    name: 'Add Administrator',
    description: 'Add an admin to this registry',
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
