import { FileHelper, ISB, T, z } from '@start9labs/start-sdk'
import { i18n } from '../i18n'
import { sdk } from '../sdk'
import {
  Registry,
  apiPort,
  defaultRegistryId,
  maxRegistryPort,
  registryIdShape,
  registryNameShape,
  registryDisplayName,
  readRegistryInfo,
  registryCli,
} from '../utils'

const registryShape = z.looseObject({
  id: registryIdShape,
  port: z.number().int().min(1).max(maxRegistryPort),
  enabled: z.boolean().catch(true),
  lastKnownName: z.string().optional().catch(undefined),
  pendingName: registryNameShape.optional().catch(undefined),
})

export type RegistryRecord = z.infer<typeof registryShape>

export function enabledRegistries(registries: RegistryRecord[]) {
  return registries.filter((registry) => registry.enabled)
}

export function withRegistryName(registry: RegistryRecord, name: string) {
  return registryDisplayName(registry) === name
    ? registry
    : { ...registry, pendingName: name }
}

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
  return registriesJson.read((s) => enabledRegistries(s.registries))
}

export async function namedRegistries(effects: T.Effects) {
  const registries = await Promise.all(
    ((await activeRegistries().once()) ?? []).map(async (registry) => ({
      ...registry,
      name: registryDisplayName(
        registry,
        (await readRegistryInfo(effects, registry)).name,
      ),
    })),
  )
  const counts = new Map<string, number>()
  return registries.map((registry) => {
    const count = (counts.get(registry.name) ?? 0) + 1
    counts.set(registry.name, count)
    const duplicate =
      registries.filter((other) => other.name === registry.name).length > 1
    return {
      ...registry,
      name: duplicate ? `${registry.name} (${count})` : registry.name,
    }
  })
}

export async function publishRegistryName(effects: T.Effects, id: string) {
  const registry = (await activeRegistries().once())?.find(
    (registry) => registry.id === id,
  )
  if (!registry) return
  const info = await readRegistryInfo(effects, registry)
  if (
    registry.pendingName !== undefined &&
    registry.pendingName !== info.name
  ) {
    await registryCli(effects, registry, [
      'info',
      'set-name',
      '--',
      registry.pendingName,
    ])
  }
  const name = registry.pendingName ?? info.name ?? undefined
  await registriesJson.update(
    effects,
    (current) =>
      current && {
        ...current,
        registries: current.registries.map((entry) =>
          entry.id === id
            ? {
                ...entry,
                lastKnownName: name,
                pendingName:
                  entry.pendingName === registry.pendingName
                    ? undefined
                    : entry.pendingName,
              }
            : entry,
        ),
      },
    { allowWriteAfterConst: true },
  )
}

export const registrySelect = sdk.Value.dynamicSelect(async ({ effects }) => ({
  name: i18n('Registry'),
  default: null,
  values: Object.fromEntries(
    (await namedRegistries(effects)).map((r) => [r.id, r.name]),
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
      const registries = await namedRegistries(effects)
      const variants: Record<
        string,
        { name: string; spec: ISB.InputSpec<Type> }
      > = Object.fromEntries(
        await Promise.all(
          registries.map(async (registry) => [
            registry.id,
            { name: registry.name, spec: await build(effects, registry) },
          ]),
        ),
      )
      return {
        name: i18n('Registry'),
        default: registries.length === 1 ? registries[0].id : null,
        disabled: false,
        variants: sdk.Variants.of(variants),
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
