import { FileHelper, z } from '@start9labs/start-sdk'
import { sdk } from '../sdk'
import { apiPort, mountpoint } from '../utils'

const registryListen = `0.0.0.0:${apiPort}`
const torProxy = 'tor.startos:9050'

const shape = z.object({
  'registry-hostname': z.array(z.string()).catch([]),
  'registry-listen': z.literal(registryListen).catch(registryListen),
  'tor-proxy': z.literal(torProxy).catch(torProxy),
  datadir: z.literal(mountpoint).catch(mountpoint),
})

export const configYaml = FileHelper.yaml(
  { base: sdk.volumes.config, subpath: './config.yaml' },
  shape,
)
