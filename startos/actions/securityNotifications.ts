import {
  configYaml,
  defaultSecurityNotifications,
} from '../fileModels/config.yaml'
import { i18n } from '../i18n'
import { sdk } from '../sdk'

export const securityNotifications = sdk.Action.withInput(
  'security-notifications',
  async () => ({
    name: i18n('Configure Security Notifications'),
    description: i18n(
      'Control OS security-update announcements. Changing this setting restarts the service.',
    ),
    warning: null,
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  }),
  sdk.InputSpec.of({
    'security-notifications': sdk.Value.toggle({
      name: i18n('Announce OS Security Updates'),
      default: defaultSecurityNotifications,
    }),
  }),
  async () =>
    configYaml
      .read((c) => ({ 'security-notifications': c['security-notifications'] }))
      .once(),
  async ({ effects, input }) => {
    await configYaml.merge(effects, input)
  },
)
