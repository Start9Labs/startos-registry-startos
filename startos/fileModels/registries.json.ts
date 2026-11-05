import { FileHelper, ISB, T, z } from '@start9labs/start-sdk'
import { i18n } from '../i18n'
import { sdk } from '../sdk'
import {
  Registry,
  apiPort,
  defaultRegistryId,
  maxRegistryPort,
  registryIdShape,
} from '../utils'

const registryShape = z.looseObject({
  id: registryIdShape,
  port: z.number().int().min(1).max(maxRegistryPort),
  enabled: z.boolean().catch(true),
})

const shape = z.looseObject({
  registries: z
    .array(registryShape)
    .catch(() => [{ id: defaultRegistryId, port: apiPort, enabled: true }]),
})

export const registriesJson = FileHelper.json(
  { base: sdk.volumes.startos, subpath: 'registries.json' },
  shape,
)

export function activeRegistries() {
  return registriesJson.read((s) => s.registries.filter((r) => r.enabled))
}

export const registrySelect = sdk.Value.dynamicSelect(async () => ({
  name: i18n('Registry'),
  default: null,
  values: Object.fromEntries(
    ((await activeRegistries().once()) ?? []).map((r) => [r.id, r.id]),
  ),
}))

export function registryInput<Type extends Record<string, unknown>>(
  build: (
    effects: T.Effects,
    registry: Registry,
  ) => Promise<ISB.InputSpec<Type>>,
) {
  return sdk.InputSpec.of({
    registry: sdk.Value.dynamicUnion(async ({ effects }) => {
      const registries = (await activeRegistries().once()) ?? []
      return {
        name: i18n('Registry'),
        default: registries.length === 1 ? registries[0].id : null,
        disabled: false,
        variants: sdk.Variants.of(
          Object.fromEntries(
            await Promise.all(
              registries.map(async (registry) => [
                registry.id,
                {
                  name: registry.id,
                  spec: await build(effects, registry),
                },
              ]),
            ),
          ),
        ),
      }
    }),
  })
}

export async function selectedRegistry(id: string) {
  const registry = (await activeRegistries().once())?.find((r) => r.id === id)
  if (!registry)
    throw new Error(
      i18n(
        'This registry is no longer enabled. Reopen the action and try again.',
      ),
    )
  return registry
}
