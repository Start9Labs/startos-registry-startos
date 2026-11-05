import { T, z } from '@start9labs/start-sdk'
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

export type Registry = { id: string; port: number }

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
) {
  return sdk.SubContainer.withTemp(
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
}
