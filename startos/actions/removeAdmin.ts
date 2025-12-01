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
      name: 'Users',
      default: Object.keys(users).at(-1) || '',
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
    name: 'Remove Administrator',
    description: 'Remove an administrator from this registry',
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
