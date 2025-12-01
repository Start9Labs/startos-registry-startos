import { sdk } from '../sdk'
import { utils } from '@start9labs/start-sdk'

const { InputSpec, Value } = sdk

export const inputSpec = InputSpec.of({
  name: Value.text({
    name: 'Registry Name',
    default: null,
    required: true,
    maxLength: 32,
  }),
  icon: Value.text({
    name: 'Registry Icon',
    default: null,
    required: false,
    placeholder: 'data:image/png,abc123',
    patterns: [
      {
        regex: '^data:image/[a-z-]+;base64,[a-zA-Z0-9+/]*$',
        description:
          'Must be a valid data URL (e.g. data:image/png;base64,abc123...)',
      },
    ],
  }),
  // @TODO
  // categories: Value.list(List.text({ name: 'Categories' }, { maxLength: 32 })),
})

export const config = sdk.Action.withInput(
  // id
  'config',

  // metadata
  async ({ effects }) => ({
    name: 'Configure Registry',
    description: 'Set the name, icon, and categories of your registry',
    warning: null,
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  }),

  // form input specification
  inputSpec,

  // optionally pre-fill the input form
  async ({ effects }) =>
    sdk.SubContainer.withTemp<{
      name: string
      icon: string | null
      // @TODO
      // categories: Record<string, { name: string }>
    }>(
      effects,
      { imageId: 'startos-registry', sharedRun: true },
      null,
      'get-info',
      async (sub) =>
        JSON.parse(
          (
            await sub.execFail([
              'start-registry',
              'registry',
              'info',
              '--format=json',
            ])
          ).stdout as string,
        ),
    ),

  // the execution function
  async ({ effects, input: { name, icon } }) =>
    sdk.SubContainer.withTemp(
      effects,
      { imageId: 'startos-registry', sharedRun: true },
      null,
      'set-info',
      async (sub) => {
        await sub.execFail([
          'start-registry',
          'registry',
          'info',
          'set-name',
          name,
        ])
        if (icon) {
          await sub.execFail([
            'start-registry',
            'registry',
            'info',
            'set-icon',
            icon,
          ])
        }
      },
    ),
)
