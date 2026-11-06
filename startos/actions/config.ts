import { i18n } from '../i18n'
import { sdk } from '../sdk'
import {
  RegistryInfo,
  registryCli,
  readRegistryInfo,
  registryNameInput,
  parseRegistryName,
} from '../utils'
import {
  registryInput,
  selectedRegistry,
  requestRegistryName,
} from '../fileModels/registries.json'

const { InputSpec, Value } = sdk

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
    const info = await readRegistryInfo(effects, registry)
    return InputSpec.of({
      name: registryNameInput(registry.pendingName ?? info.name),
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
    const info = await readRegistryInfo(effects, registry)
    await requestRegistryName(
      effects,
      registry.id,
      parseRegistryName(name),
      info.name,
    )
    await registryCli(effects, registry, [
      'info',
      'set-icon',
      ...(icon ? ['--', icon] : ['--clear']),
    ])
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
