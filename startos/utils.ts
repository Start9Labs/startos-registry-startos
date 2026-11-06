import { T, z } from '@start9labs/start-sdk'
import { i18n } from './i18n'
import { sdk } from './sdk'

export const apiPort = 5959
export const maxRegistryPort = 65535
export const mountpoint = '/var/lib/startos'
export const defaultRegistryId = 'default'
export const maxRegistryIdLength = 32
// Rejects final line breaks as well as invalid StartOS IDs.
export const registryIdPattern = '^[a-z][a-z0-9]*(-[a-z0-9]+)*(?![\\s\\S])$'
export const registryIdShape = z
  .string()
  .max(maxRegistryIdLength)
  .regex(new RegExp(registryIdPattern))

const maxRegistryNameLength = 32
export const registryNameShape = z
  .string()
  .trim()
  .min(1)
  .max(maxRegistryNameLength)

export function registryNameInput(defaultValue: string | null) {
  return sdk.Value.text({
    name: i18n('Registry Name'),
    required: true,
    default: defaultValue,
    minLength: 1,
    maxLength: maxRegistryNameLength,
  })
}

export function parseRegistryName(name: string) {
  const parsed = registryNameShape.safeParse(name)
  if (!parsed.success)
    throw new Error(i18n('Use a registry name of 1–32 characters.'))
  return parsed.data
}

export function assertUniqueRegistryNames(names: string[]) {
  const seen = new Set<string>()
  for (const name of names) {
    const key = name.toLowerCase()
    if (seen.has(key))
      throw new Error(
        i18n(
          'Registry names must be unique, including disabled entries. Enable a disabled entry to restore it.',
        ),
      )
    seen.add(key)
  }
}

export type Registry = {
  id: string
  port: number
  name?: string
  lastKnownName?: string
  pendingName?: string
}

export type RegistryInfo = {
  name: string | null
  icon: string | null
  description?: string | Record<string, string> | null
  trustSigners: Record<string, unknown>
}

export function registryDisplayName(registry: Registry, name?: string | null) {
  return (
    (
      registry.pendingName ??
      (name === undefined ? registry.lastKnownName : name)
    )?.trim() || i18n('Unnamed Registry')
  )
}

export function registryAvailabilityDescription() {
  return i18n('All enabled registries must be available.')
}

export function registryUpdateWarning() {
  return i18n(
    'Updates can partially apply if a CLI command fails. Reopen the action to inspect current state before retrying.',
  )
}

export function registryError(
  registry: Registry,
  error: unknown,
  signer?: string,
) {
  const values = {
    registry: registry.name ?? registryDisplayName(registry),
    message: error instanceof Error ? error.message : String(error),
  }
  return new Error(
    signer === undefined
      ? i18n('${registry}: ${message}', values)
      : i18n('${registry} / ${signer}: ${message}', { ...values, signer }),
    { cause: error },
  )
}

export function registrySelectionDescription() {
  return i18n(
    'Choose an enabled registry. Enable or restore registries in Manage Registries.',
  )
}

export async function readRegistryInfo(effects: T.Effects, registry: Registry) {
  return JSON.parse(
    (await registryCli(effects, registry, ['info', '--format=json']))
      .stdout as string,
  ) as RegistryInfo
}

export function registryHostId(id: string) {
  return id === defaultRegistryId ? 'api-multi' : `registry-${id}`
}

export function registryInterfaceId(id: string) {
  return id === defaultRegistryId ? 'api' : `registry-${id}`
}

export function registryConfigPath(id: string) {
  return id === defaultRegistryId ? 'config.yaml' : `registries/${id}.yaml`
}

export function registryDataPath(id: string) {
  return id === defaultRegistryId ? null : `registries/${id}`
}

export async function registryCli(
  effects: T.Effects,
  registry: Registry,
  args: string[],
  signer?: string,
) {
  try {
    return await sdk.SubContainer.withTemp(
      effects,
      { imageId: 'startos-registry', sharedRun: true },
      null,
      `cli-${registry.id}`,
      async (sub) =>
        sub.execFail([
          'start-registry',
          '--registry',
          `http://127.0.0.1:${registry.port}`,
          ...args,
        ]),
    )
  } catch (error) {
    throw registryError(registry, error, signer)
  }
}
