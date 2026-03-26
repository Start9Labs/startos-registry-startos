import { z, FileHelper } from '@start9labs/start-sdk'
import { apiPort, mountpoint } from '../utils'
import { sdk } from '../sdk'

const registryListen = `0.0.0.0:${apiPort}`
const torProxy = 'socks5h://10.0.3.1:9050'

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
