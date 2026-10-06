import { i18n } from '../i18n'
import { sdk } from '../sdk'

const { InputSpec, Value } = sdk

export const inputSpec = InputSpec.of({
  id: Value.dynamicSelect(async ({ effects }) => {
    const users = await sdk.SubContainer.withTemp<
      Record<
        string,
        {
          name: string
          contact: ({ matrix: string } | { email: string })[]
          keys: string[]
        }
      >
    >(
      effects,
      { imageId: 'startos-registry', sharedRun: true },
      null,
      'delete-key',
      async (sub) => {
        return JSON.parse(
          (
            await sub.execFail([
              'start-registry',
              'admin',
              'list',
              '--format=json',
            ])
          ).stdout as string,
        )
      },
    )

    return {
      name: i18n('Administrator'),
      description: i18n(
        'Removing an administrator also removes every authorization their key holds on this registry. Once the last one is removed, no key can administer the registry.',
      ),
      default: null,
      values: Object.entries(users).reduce(
        (obj, [id, user]) => ({
          ...obj,
          [id]: user.name,
        }),
        {},
      ),
    }
  }),
})

export const removeAdmin = sdk.Action.withInput(
  // id
  'remove-admin',

  // metadata
  async ({ effects }) => ({
    name: i18n('Remove Administrator'),
    description: i18n('Remove an administrator from this registry'),
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
    await sdk.SubContainer.withTemp(
      effects,
      { imageId: 'startos-registry', sharedRun: true },
      null,
      'remove-admin',
      async (sub) => {
        await sub.execFail([
          'start-registry',
          'admin',
          'signer',
          'remove',
          input.id,
        ])
      },
    )
  },
)
