import { i18n } from '../i18n'
import { sdk } from '../sdk'
import { RegistryInfo, registryCli, readRegistryInfo } from '../utils'
import { registryInput, selectedRegistry } from '../fileModels/registries.json'

const { InputSpec, Value } = sdk

export const config = sdk.Action.withInput(
  // id
  'config',

  // metadata
  async () => ({
    name: i18n('Configure Registry'),
    description: i18n('Set the icon and description of a selected registry.'),
    warning: null,
    allowedStatuses: 'only-running',
    group: null,
    visibility: 'enabled',
  }),
  // form input specification
  registryInput(async (effects, registry) => {
    const info = await readRegistryInfo(effects, registry)
    return InputSpec.of({
      icon: Value.text({
        name: i18n('Registry Icon'),
        default: info.icon,
        required: false,
        description: i18n(
          'Use a base64 image data URL or an HTTP(S) URL. Leave blank to clear the selected registry’s icon.',
        ),
        placeholder: 'https://example.org/registry-icon.png',
        patterns: [
          {
            regex:
              '^(data:image/[a-z0-9][a-z0-9.+-]*;base64,[a-zA-Z0-9+/]*={0,2}|https?://.+)$',
            description: i18n(
              'Enter a base64 image data URL or an HTTP(S) URL.',
            ),
          },
        ],
      }),
      description: Value.textarea({
        name: i18n('Registry Description'),
        description: i18n(
          'Shown above the selected registry’s packages in the marketplace. Markdown is supported.',
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
    const { icon, description } = input.registry.value
    const nextDescription = description?.trim() ? description : null
    const info = await readRegistryInfo(effects, registry)
    await registryCli(effects, registry, [
      'info',
      'set-icon',
      ...(icon ? ['--', icon] : ['--clear']),
    ])
    if (nextDescription !== descriptionText(info.description)) {
      await registryCli(effects, registry, [
        'info',
        'set-description',
        ...(nextDescription ? ['--', nextDescription] : ['--clear']),
      ])
    }
  },
)

function descriptionText(description: RegistryInfo['description']) {
  return typeof description === 'string'
    ? description
    : (description?.en_US ?? Object.values(description ?? {})[0] ?? null)
}
