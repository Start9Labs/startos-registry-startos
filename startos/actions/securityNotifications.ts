import {
  configYaml,
  defaultSecurityNotifications,
} from '../fileModels/config.yaml'
import { i18n } from '../i18n'
import { sdk } from '../sdk'
import { registryInput, selectedRegistry } from '../fileModels/registries.json'

export const securityNotifications = sdk.Action.withInput(
  'security-notifications',
  async () => ({
    name: i18n('Configure Security Notifications'),
    description: i18n(
      'Control OS security-update announcements. Changing this setting restarts the selected registry.',
    ),
    warning: null,
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  }),
  registryInput(async (_effects, registry) =>
    sdk.InputSpec.of({
      'security-notifications': sdk.Value.toggle({
        name: i18n('Announce OS Security Updates'),
        default:
          (await configYaml(registry)
            .read((c) => c['security-notifications'])
            .once()) ?? defaultSecurityNotifications,
      }),
    }),
  ),
  async () => null,
  async ({ effects, input }) => {
    await configYaml(await selectedRegistry(input.registry.selection)).merge(
      effects,
      input.registry.value,
    )
  },
)
