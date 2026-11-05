import { registriesJson } from '../fileModels/registries.json'
import { i18n } from '../i18n'
import { sdk } from '../sdk'
import { apiPort, maxRegistryPort } from '../utils'

export const manageRegistries = sdk.Action.withInput(
  'manage-registries',
  async () => ({
    name: i18n('Manage Registries'),
    description: i18n(
      'Add or remove independent registries, each with its own addresses and signers.',
    ),
    warning: null,
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  }),
  sdk.InputSpec.of({
    registries: sdk.Value.list(
      sdk.List.obj(
        {
          name: i18n('Registries'),
          description: i18n(
            'Removing a registry stops it and hides its interface. Its data and address settings are retained; add the same ID to restore it.',
          ),
        },
        {
          displayAs: '{{id}}',
          uniqueBy: 'id',
          spec: sdk.InputSpec.of({
            id: sdk.Value.text({
              name: i18n('Registry ID'),
              description: i18n(
                'A permanent identifier, such as stable or beta. Changing it creates a different registry.',
              ),
              required: true,
              default: null,
              patterns: [
                {
                  regex: '^[a-z][a-z0-9-]{0,31}$',
                  description: i18n(
                    'Use 1–32 lowercase letters, digits, or hyphens, starting with a letter.',
                  ),
                },
              ],
            }),
          }),
        },
      ),
    ),
  }),
  async () => ({
    registries:
      (await registriesJson
        .read((s) =>
          s.registries.filter((r) => r.enabled).map(({ id }) => ({ id })),
        )
        .once()) ?? [],
  }),
  async ({ effects, input }) => {
    await registriesJson.update(effects, (current) => {
      if (!current)
        throw new Error(
          i18n(
            'Registry configuration is missing. Rebuild the service and try again.',
          ),
        )
      const selected = new Set(input.registries.map((r) => r.id))
      const registries = current.registries.map((r) => ({
        ...r,
        enabled: selected.has(r.id),
      }))
      let nextPort = Math.max(apiPort - 1, ...registries.map((r) => r.port)) + 1
      for (const { id } of input.registries) {
        if (registries.some((r) => r.id === id)) continue
        if (nextPort > maxRegistryPort)
          throw new Error(i18n('No ports remain for another registry.'))
        registries.push({ id, port: nextPort++, enabled: true })
      }
      return { ...current, registries }
    })
  },
)
