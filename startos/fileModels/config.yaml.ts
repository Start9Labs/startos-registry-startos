import { FileHelper, z } from '@start9labs/start-sdk'
import { sdk } from '../sdk'
import { apiPort, mountpoint } from '../utils'

const registryListen = `0.0.0.0:${apiPort}`

const shape = z.object({
  'registry-hostname': z.array(z.string()).catch([]),
  'registry-listen': z.literal(registryListen).catch(registryListen),
  // Written reactively in main from Tor's SOCKS bridge address; absent until
  // main resolves and writes it.
  'tor-proxy': z.string().optional().catch(undefined),
  datadir: z.literal(mountpoint).catch(mountpoint),
})

export const configYaml = FileHelper.yaml(
  { base: sdk.volumes.config, subpath: './config.yaml' },
  shape,
)
