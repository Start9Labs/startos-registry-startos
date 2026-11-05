import { FileHelper, z } from '@start9labs/start-sdk'
import { sdk } from '../sdk'
import { Registry, mountpoint, registryConfigPath } from '../utils'

export const defaultSecurityNotifications = false

export function configYaml(registry: Registry) {
  const registryListen = `0.0.0.0:${registry.port}`
  return FileHelper.yaml(
    { base: sdk.volumes.config, subpath: registryConfigPath(registry.id) },
    z.looseObject({
      'registry-hostname': z.array(z.string()).catch([]),
      'security-notifications': z.boolean().catch(defaultSecurityNotifications),
      'registry-listen': z.literal(registryListen).catch(registryListen),
      // Written reactively in main from Tor's SOCKS bridge address; absent until
      // main resolves and writes it.
      'tor-proxy': z.string().optional().catch(undefined),
      datadir: z.literal(mountpoint).catch(mountpoint),
    }),
  )
}
