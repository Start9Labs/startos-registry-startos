import { i18n } from '../i18n'
import { sdk } from '../sdk'
import { registryCli } from '../utils'
import { registryInput, selectedRegistry } from '../fileModels/registries.json'

const { InputSpec, Value } = sdk

type RegistryInfo = {
  name: string | null
  icon: string | null
  description?: string | Record<string, string> | null
  // @TODO
  // categories: Record<string, { name: string }>
}

export const config = sdk.Action.withInput(
  // id
  'config',

  // metadata
  async () => ({
    name: i18n('Configure Registry'),
    description: i18n('Set the name, icon, and description of your registry'),
    warning: null,
    allowedStatuses: 'only-running',
    group: null,
    visibility: 'enabled',
  }),
  // form input specification
  registryInput(async (effects, registry) => {
    const info: RegistryInfo = JSON.parse(
      (await registryCli(effects, registry, ['info', '--format=json']))
        .stdout as string,
    )
    return InputSpec.of({
      name: Value.text({
        name: i18n('Registry Name'),
        default: info.name,
        required: true,
        maxLength: 32,
      }),
      icon: Value.text({
        name: i18n('Registry Icon'),
        default: info.icon,
        required: false,
        placeholder: 'data:image/png;base64,abc123',
        patterns: [
          {
            regex:
              '^(data:image/[a-z0-9][a-z0-9.+-]*;base64,[a-zA-Z0-9+/]*={0,2}|https?://.+)$',
            description: i18n(
              'Must be a valid data URL or http(s) URL (e.g. data:image/png;base64,abc123... or https://example.com/icon.png)',
            ),
          },
        ],
      }),
      description: Value.textarea({
        name: i18n('Registry Description'),
        description: i18n(
          'Shown above your services in the marketplace. Markdown is supported.',
        ),
        default: descriptionText(info.description),
        required: false,
      }),
      // @TODO
      // categories: Value.list(List.text({ name: 'Categories' }, { maxLength: 32 })),
    })
  }),

  // optionally pre-fill the input form
  async () => null,

  // the execution function
  async ({ effects, input }) => {
    const registry = await selectedRegistry(input.registry.selection)
    const { name, icon, description } = input.registry.value
    await registryCli(effects, registry, ['info', 'set-name', '--', name])
    await registryCli(effects, registry, [
      'info',
      'set-icon',
      ...(icon ? ['--', icon] : ['--clear']),
    ])
    const info: RegistryInfo = JSON.parse(
      (await registryCli(effects, registry, ['info', '--format=json']))
        .stdout as string,
    )
    if ((description || null) !== descriptionText(info.description)) {
      await registryCli(effects, registry, [
        'info',
        'set-description',
        ...(description ? ['--', description] : ['--clear']),
      ])
    }
  },
)

function descriptionText(description: RegistryInfo['description']) {
  return typeof description === 'string'
    ? description
    : (description?.en_US ?? Object.values(description ?? {})[0] ?? null)
}
