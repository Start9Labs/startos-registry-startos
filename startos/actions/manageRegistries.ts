import { randomBytes } from 'node:crypto'
import { isDeepStrictEqual } from 'node:util'
import { z } from '@start9labs/start-sdk'
import { registriesJson, withRegistryName } from '../fileModels/registries.json'
import { i18n } from '../i18n'
import { sdk } from '../sdk'
import {
  apiPort,
  maxRegistryPort,
  registryDisplayName,
  registryNameInput,
  parseRegistryName,
  assertUniqueRegistryNames,
} from '../utils'

export const manageRegistries = sdk.Action.withInput(
  'manage-registries',
  async () => ({
    name: i18n('Manage Registries'),
    description: i18n(
      'Create, name, enable, or disable independent registries.',
    ),
    warning: null,
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  }),
  async () => {
    const snapshot =
      (await registriesJson.read((s) => s.registries).once()) ?? []
    const defaults = snapshot.map((registry) => ({
      id: registry.id,
      name: registryDisplayName(registry),
      enabled: registry.enabled,
    }))
    return sdk.InputSpec.of({
      snapshot: sdk.Value.hidden(
        z
          .unknown()
          .optional()
          .transform(() => snapshot),
      ),
      registries: sdk.Value.list(
        sdk.List.obj(
          {
            name: i18n('Registries'),
            // SDK 4.0.0 types object-list defaults as []; the renderer accepts entries.
            default: defaults as [],
            description: i18n(
              'Changes apply on submission. Disabling a registry stops it and hides its interface without deleting data. Removing a row also disables it; the retained entry reappears when this action is reopened. Enable an entry to restore it.',
            ),
          },
          {
            displayAs: '{{name}}',
            uniqueBy: 'name',
            spec: sdk.InputSpec.of({
              id: sdk.Value.hidden(z.string().nullable().default(null)),
              name: registryNameInput(null),
              enabled: sdk.Value.toggle({
                name: i18n('Enabled'),
                default: true,
              }),
            }),
          },
        ),
      ),
    })
  },
  async () => null,
  async ({ effects, input }) => {
    const rows = input.registries.map((registry) => ({
      ...registry,
      name: parseRegistryName(registry.name),
    }))
    await registriesJson.update(effects, (current) => {
      if (!current)
        throw new Error(
          i18n(
            'Registry configuration is missing. Rebuild the service and try again.',
          ),
        )
      if (!isDeepStrictEqual(current.registries, input.snapshot)) {
        throw new Error(
          i18n(
            'Registries changed while this form was open. Reopen it and try again.',
          ),
        )
      }
      const selected = new Map<string, (typeof rows)[number]>()
      for (const row of rows) {
        if (row.id === null) continue
        if (
          selected.has(row.id) ||
          !current.registries.some((registry) => registry.id === row.id)
        ) {
          throw new Error(
            i18n(
              'Registries changed while this form was open. Reopen it and try again.',
            ),
          )
        }
        selected.set(row.id, row)
      }
      assertUniqueRegistryNames([
        ...current.registries
          .filter((registry) => !selected.has(registry.id))
          .map((registry) => registryDisplayName(registry)),
        ...rows.map((row) => row.name),
      ])
      const registries = current.registries.map((registry) => {
        const row = selected.get(registry.id)
        return row
          ? { ...withRegistryName(registry, row.name), enabled: row.enabled }
          : { ...registry, enabled: false }
      })
      const ids = new Set(registries.map((registry) => registry.id))
      let nextPort =
        Math.max(apiPort - 1, ...registries.map((registry) => registry.port)) +
        1
      for (const row of rows) {
        if (row.id !== null) continue
        if (nextPort > maxRegistryPort)
          throw new Error(i18n('No ports remain for another registry.'))
        let id: string
        do {
          id = `r-${randomBytes(12).toString('hex')}`
        } while (ids.has(id))
        ids.add(id)
        registries.push({
          id,
          port: nextPort++,
          enabled: row.enabled,
          pendingName: row.name,
        })
      }
      return { ...current, registries }
    })
  },
)
