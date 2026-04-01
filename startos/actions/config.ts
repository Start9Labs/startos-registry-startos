import { i18n } from '../i18n'
import { sdk } from '../sdk'

const { InputSpec, Value } = sdk

export const inputSpec = InputSpec.of({
  name: Value.text({
    name: i18n('Registry Name'),
    default: null,
    required: true,
    maxLength: 32,
  }),
  icon: Value.text({
    name: i18n('Registry Icon'),
    default: null,
    required: false,
    placeholder: 'data:image/png;base64,abc123',
    patterns: [
      {
        regex:
          '^(data:image/[a-z-]+;base64,[a-zA-Z0-9+/]*={0,2}|https?://.+)$',
        description: i18n(
          'Must be a valid data URL or http(s) URL (e.g. data:image/png;base64,abc123... or https://example.com/icon.png)',
        ),
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
    name: i18n('Configure Registry'),
    description: i18n(
      'Set the name, icon, and categories of your registry',
    ),
    warning: null,
    allowedStatuses: 'only-running',
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
          (await sub.execFail(['start-registry', 'info', '--format=json']))
            .stdout as string,
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
        await sub.execFail(['start-registry', 'info', 'set-name', name])
        if (icon) {
          await sub.execFail(['start-registry', 'info', 'set-icon', icon])
        }
      },
    ),
)
